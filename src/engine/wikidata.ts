import { buildLiveArtifact, detectKind } from './persona';
import {
  hashSeed,
  matchDivined,
  mulberry32,
  scoreOf,
  toAffinity,
  topDimsKey,
} from './engine';
import type { Artifact, Dims, MatchResult, Profile } from '@/types';

/**
 * Wikidata 实时馆藏推演：
 * 搜索博物馆实体 → 并行 SPARQL 查询真实馆藏（带 P18 图片）→ 画像加权抽样。
 * 任何环节失败都回退到全球文物池（诚实标注 live=false）。
 */

/** Wikidata 馆藏候选 */
export interface LiveCandidate {
  qid: string;
  name: string;
  description: string;
  /** Wikimedia Commons 文件名 */
  imageFile: string;
  /** P31 类别 Q-ID 列表 */
  classes: string[];
  /** P571 创作时间（ISO，可缺省） */
  inception: string | undefined;
}

export interface LiveMatch {
  match: MatchResult;
  /** true = 该馆真实馆藏；false = 回退全球推演池 */
  live: boolean;
  museumQid: string | null;
}

const WD_API = 'https://www.wikidata.org/w/api.php';
const SPARQL_API = 'https://query.wikidata.org/sparql';

/** 搜索超时（wbsearchentities 正常 <1 秒） */
const SEARCH_TIMEOUT = 4000;
/** 快模式 SPARQL 超时（结构化馆藏关系，通常 1-3 秒） */
const FAST_TIMEOUT = 6000;
/**
 * 慢模式 SPARQL 超时（P276/P127 属全表扫描，实测 13-25 秒；
 * 仅在快模式无果时执行，准确性优先于等待时长）
 */
const SLOW_TIMEOUT = 14000;
/** 批量 label 查询超时（wbgetentities 很快） */
const LABEL_TIMEOUT = 5000;
/** 会话级缓存：同一馆 + 同一画像指纹只查一次 */
const sessionCache = new Map<string, Promise<LiveMatch>>();

/** 502/504 类节点抖动（可重试命中健康节点） */
class TransientError extends Error {}

/**
 * 带超时与瞬时故障重试的 JSON 请求。
 * 仅 502/504 触发重试（WDQS 节点抖动）；超时/429 重试无意义，直接抛出。
 */
async function fetchJson(url: string, timeout: number, retries = 1): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 502 || res.status === 504) throw new TransientError(`HTTP ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof TransientError && retries > 0) {
      await new Promise((r) => setTimeout(r, 900));
      return fetchJson(url, timeout, retries - 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ── 博物馆实体搜索 ──────────────────────────────────── */

interface SearchHit {
  id: string;
  label: string;
  description: string;
}

function looksLikeMuseum(hit: SearchHit): boolean {
  const d = hit.description.toLowerCase();
  return (
    d.includes('museum') ||
    hit.description.includes('博物馆') ||
    hit.description.includes('博物院') ||
    hit.description.includes('美術館') ||
    hit.description.includes('美术馆') ||
    d.includes('gallery')
  );
}

async function searchOnce(term: string, lang: string): Promise<SearchHit[]> {
  const url =
    `${WD_API}?action=wbsearchentities&format=json&origin=*` +
    `&search=${encodeURIComponent(term)}&language=${lang}&limit=6`;
  try {
    const data = (await fetchJson(url, SEARCH_TIMEOUT)) as { search?: SearchHit[] };
    return data.search ?? [];
  } catch {
    return [];
  }
}

/** 多策略搜索博物馆：原名(zh) → 去后缀(zh) → 原名(en)，取第一个像博物馆的 */
export async function searchMuseum(name: string): Promise<string | null> {
  const trimmed = name.trim();
  const core = trimmed.replace(/(博物馆|博物院|美术馆|美術館|museum|gallery)$/i, '').trim() || trimmed;

  const attempts: Array<[string, string]> = [
    [trimmed, 'zh'],
    [core, 'zh'],
    [trimmed, 'en'],
  ];

  for (const [term, lang] of attempts) {
    const hits = await searchOnce(term, lang);
    const hit = hits.find(looksLikeMuseum);
    if (hit) return hit.id;
  }
  return null;
}

/* ── SPARQL 馆藏查询 ────────────────────────────────── */

/**
 * 快模式：结构化馆藏关系，单条首查通常 1-3 秒。
 * 必须串行执行——WDQS 并发会互相排队（实测 2-4 条并发把 3 秒查询拖到 20 秒+）。
 */
const FAST_MODES = [
  '?item wdt:P195 wd:{qid} .', // collection
  '?item wdt:P608 wd:{qid} .', // exhibited at
];
/**
 * 慢模式：全表反查，实测 13-50 秒；仅在快模式无果时兜底，同样串行。
 * P276/P361* 的零跳路径已覆盖纯 P276，无需单独再查。
 */
const SLOW_MODES = [
  '?item wdt:P127 wd:{qid} .', // owned by
  '?item wdt:P276/wdt:P361* wd:{qid} .', // location（含分馆路径）
];

/** 把 SPARQL Special:FilePath URL 解析为 Commons 文件名 */
export function fileNameFromFilePathUrl(url: string): string {
  const idx = url.indexOf('/Special:FilePath/');
  if (idx < 0) return '';
  try {
    return decodeURIComponent(url.slice(idx + '/Special:FilePath/'.length));
  } catch {
    return '';
  }
}

function sparqlUrl(sparql: string): string {
  return `${SPARQL_API}?format=json&query=${encodeURIComponent(sparql)}`;
}

/**
 * 按单个属性模式查询馆藏候选（裸三元组，不含 label service——
 * label service 会把查询拖慢到 30 秒以上，label 改由 wbgetentities 批量补齐）。
 */
async function queryMode(qid: string, mode: string, timeout: number): Promise<LiveCandidate[]> {
  const where = mode.replace('{qid}', qid);
  const sparql = `SELECT ?item (SAMPLE(?img) AS ?image)
    (GROUP_CONCAT(DISTINCT ?class; separator="|") AS ?classes) (SAMPLE(?date) AS ?inception) WHERE {
    ${where}
    ?item wdt:P18 ?img .
    OPTIONAL { ?item wdt:P31 ?class . }
    OPTIONAL { ?item wdt:P571 ?date . }
  } GROUP BY ?item LIMIT 300`;

  try {
    const data = (await fetchJson(sparqlUrl(sparql), timeout)) as {
      results?: { bindings?: Array<Record<string, { value: string }>> };
    };
    const rows = data.results?.bindings ?? [];
    const out: LiveCandidate[] = [];
    for (const row of rows) {
      const q = row.item?.value?.split('/').pop() ?? '';
      const imageFile = fileNameFromFilePathUrl(row.image?.value ?? '');
      if (!q || !imageFile) continue;
      if (q === qid) continue; // 博物馆自身不算馆藏
      out.push({
        qid: q,
        name: '', // 由批量 label 查询补齐
        description: '',
        imageFile,
        classes: (row.classes?.value ?? '').split('|').filter(Boolean),
        inception: row.inception?.value,
      });
    }
    return out;
  } catch {
    return [];
  }
}

interface EntityLabels {
  label?: string;
  description?: string;
}

/** 批量取实体中文名（zh → zh-hans → en），每批 50 个并行 */
export async function fetchLabels(qids: string[]): Promise<Map<string, EntityLabels>> {
  const out = new Map<string, EntityLabels>();
  const batches: string[][] = [];
  for (let i = 0; i < qids.length; i += 50) batches.push(qids.slice(i, i + 50));

  interface LabelPayload {
    entities?: Record<
      string,
      { labels?: Record<string, { value: string }>; descriptions?: Record<string, { value: string }> }
    >;
  }
  const results = await Promise.all(
    batches.map(async (batch): Promise<LabelPayload> => {
      const url =
        `${WD_API}?action=wbgetentities&format=json&origin=*` +
        `&ids=${batch.join('|')}&props=labels|descriptions&languages=zh|zh-hans|en`;
      try {
        return (await fetchJson(url, LABEL_TIMEOUT)) as LabelPayload;
      } catch {
        return { entities: {} };
      }
    }),
  );

  for (const data of results) {
    for (const [qid, entity] of Object.entries(data.entities ?? {})) {
      if (qid.startsWith('-')) continue; // API 元数据键（如 -1）
      const pick = (m?: Record<string, { value: string }>) =>
        m?.zh?.value ?? m?.['zh-hans']?.value ?? m?.en?.value ?? undefined;
      out.set(qid, { label: pick(entity.labels), description: pick(entity.descriptions) });
    }
  }
  return out;
}

/** 合并多组候选并按 QID 去重 */
function mergeCandidates(groups: LiveCandidate[][]): LiveCandidate[] {
  const byQid = new Map<string, LiveCandidate>();
  for (const list of groups) {
    for (const c of list) {
      if (!byQid.has(c.qid)) byQid.set(c.qid, c);
    }
  }
  return [...byQid.values()];
}

/**
 * 串行分波查询真实馆藏：快模式逐条尝试、有结果即停（命中馆通常 3-8 秒出结果）；
 * 快模式全部无果时慢模式兜底（最长可至 40 秒，准确性优先）。
 */
export async function queryCollection(qid: string): Promise<LiveCandidate[]> {
  const groups: LiveCandidate[][] = [];
  for (const mode of FAST_MODES) {
    const got = await queryMode(qid, mode, FAST_TIMEOUT);
    if (got.length > 0) {
      groups.push(got);
      break; // 有真实馆藏即停，不再占用 WDQS 配额
    }
  }
  if (groups.length === 0) {
    for (const mode of SLOW_MODES) {
      const got = await queryMode(qid, mode, SLOW_TIMEOUT);
      if (got.length > 0) {
        groups.push(got);
        break;
      }
    }
  }
  const candidates = mergeCandidates(groups);
  if (candidates.length === 0) return [];

  const labels = await fetchLabels(candidates.map((c) => c.qid));
  const named: LiveCandidate[] = [];
  for (const c of candidates) {
    const l = labels.get(c.qid);
    if (!l?.label) continue; // 连英文名都没有的无法展示
    c.name = l.label;
    c.description = l.description ?? '';
    named.push(c);
  }
  // 按 QID 排序保证候选顺序稳定（SPARQL 返回顺序不定）
  return named.sort((a, b) => (a.qid < b.qid ? -1 : 1));
}

/** 候选的画像权重（由文物大类决定，纯函数便于测试） */
export function candidateDims(candidate: LiveCandidate): Dims {
  return detectKind(candidate.classes, `${candidate.name} ${candidate.description}`).dims;
}

/** 从候选中按画像加权抽样（确定性：同一画像 + 同一候选集永远同一结果） */
export function pickCandidate(
  candidates: LiveCandidate[],
  profile: Profile,
  museumQid: string,
): LiveCandidate {
  const seed = hashSeed(museumQid) ^ hashSeed(topDimsKey(profile.dims));
  const rng = mulberry32(seed);
  const weights = candidates.map((c) => {
    const artifact: Artifact = {
      id: c.qid,
      name: c.name,
      dynasty: '',
      origin: '',
      dims: candidateDims(c),
      intro: '',
      persona: '',
      message: '',
      tags: [],
    };
    return Math.max(1, scoreOf(artifact, profile.dims)) ** 2;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let pick = rng() * total;
  let idx = candidates.length - 1;
  for (let i = 0; i < candidates.length; i++) {
    pick -= weights[i];
    if (pick <= 0) {
      idx = i;
      break;
    }
  }
  return candidates[idx];
}

/** 输入任意博物馆名，返回该馆真实馆藏中的本命文物；失败回退全球池 */
export function matchLive(profile: Profile, museumName: string): Promise<LiveMatch> {
  const cacheKey = `${museumName.trim()}::${topDimsKey(profile.dims)}`;
  const cached = sessionCache.get(cacheKey);
  if (cached) return cached;

  const p = (async (): Promise<LiveMatch> => {
    const qid = await searchMuseum(museumName);
    if (qid) {
      const candidates = await queryCollection(qid);
      if (candidates.length > 0) {
        const chosen = pickCandidate(candidates, profile, qid);
        const rng = mulberry32(hashSeed(qid) ^ hashSeed(topDimsKey(profile.dims)));
        const artifact = buildLiveArtifact({
          ...chosen,
          museumName: museumName.trim(),
          profileDims: profile.dims,
          rng,
        });
        return {
          match: {
            artifact,
            affinity: toAffinity(scoreOf(artifact, profile.dims), profile.dims),
            divined: true,
          },
          live: true,
          museumQid: qid,
        };
      }
    }
    // 回退：馆未收录 / 馆藏无图 / 网络失败 → 全球推演池（诚实标注）
    return {
      match: matchDivined(profile, museumName),
      live: false,
      museumQid: qid,
    };
  })();

  sessionCache.set(cacheKey, p);
  return p;
}
