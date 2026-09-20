import { GLOBAL_ARTIFACTS, artifactsOfMuseum } from '@/data/artifacts';
import { QUIZ } from '@/data/quiz';
import type { Artifact, Dims, Dimension, MatchResult, Profile } from '@/types';

export const DIMENSIONS: Dimension[] = ['elegant', 'brave', 'calm', 'lively', 'craft', 'mystic'];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  elegant: '儒雅',
  brave: '勇毅',
  calm: '沉静',
  lively: '灵动',
  craft: '匠心',
  mystic: '神秘',
};

export const DIMENSION_POEMS: Record<Dimension, string> = {
  elegant: '墨池风骨，一纸山河',
  brave: '锋自砺出，敢为人先',
  calm: '重器不语，观之安心',
  lively: '踏燕而行，衣带当风',
  craft: '毫厘之间，见天见地',
  mystic: '眸中有宇宙，来历自成谜',
};

const EMPTY_DIMS: Dims = { elegant: 0, brave: 0, calm: 0, lively: 0, craft: 0, mystic: 0 };

/** FNV-1a 32 位哈希：同一字符串永远得到同一种子 */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 确定性伪随机 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 由答题序号结算六维气质画像 */
export function computeProfile(answers: number[]): Profile {
  const dims: Dims = { ...EMPTY_DIMS };
  answers.forEach((optIdx, qIdx) => {
    const question = QUIZ[qIdx];
    if (!question || optIdx < 0 || optIdx >= question.options.length) return;
    const scores = question.options[optIdx].scores;
    for (const [dim, val] of Object.entries(scores)) {
      dims[dim as Dimension] += val ?? 0;
    }
  });
  return { dims, answers: [...answers], createdAt: Date.now() };
}

/** 气质向量 × 文物权重向量 的加权契合分 */
export function scoreOf(artifact: Artifact, dims: Dims): number {
  return DIMENSIONS.reduce((sum, d) => sum + dims[d] * artifact.dims[d], 0);
}

/** 缘分值归一化到 78-98：给「可遇不可求」留一点余地 */
export function toAffinity(rawScore: number, dims: Dims): number {
  const userTotal = DIMENSIONS.reduce((s, d) => s + dims[d], 0);
  const maxPossible = Math.max(1, userTotal * 3);
  const ratio = Math.min(1, (rawScore / maxPossible) * 2.2);
  return Math.min(98, 78 + Math.round(20 * ratio));
}

/** 专属策展：在该馆馆藏中取契合分最高的文物（同分按数据顺序破平） */
export function matchCurated(profile: Profile, museumId: string): MatchResult | null {
  const candidates = artifactsOfMuseum(museumId);
  if (candidates.length === 0) return null;
  let best = candidates[0];
  let bestScore = -1;
  for (const artifact of candidates) {
    const s = scoreOf(artifact, profile.dims);
    if (s > bestScore) {
      bestScore = s;
      best = artifact;
    }
  }
  return { artifact: best, affinity: toAffinity(bestScore, profile.dims), divined: false };
}

/** 气质画像的关键指纹（降序），用于构造推演种子 */
export function topDimsKey(dims: Dims): string {
  return DIMENSIONS.slice()
    .sort((a, b) => dims[b] - dims[a])
    .join('|');
}

/**
 * 缘分推演：输入任意博物馆名，在世界文物池中确定性唤起一件共振文物。
 * seed = hash(馆名) ^ hash(气质指纹)，同一人同一馆永远同一结果。
 */
export function matchDivined(profile: Profile, museumName: string): MatchResult {
  const name = museumName.trim();
  const seed = hashSeed(name) ^ hashSeed(topDimsKey(profile.dims));
  const rng = mulberry32(seed);
  const weights = GLOBAL_ARTIFACTS.map((a) => Math.max(1, scoreOf(a, profile.dims)) ** 2);
  const total = weights.reduce((s, w) => s + w, 0);
  let pick = rng() * total;
  let chosen = GLOBAL_ARTIFACTS[GLOBAL_ARTIFACTS.length - 1];
  for (let i = 0; i < GLOBAL_ARTIFACTS.length; i++) {
    pick -= weights[i];
    if (pick <= 0) {
      chosen = GLOBAL_ARTIFACTS[i];
      break;
    }
  }
  return {
    artifact: chosen,
    affinity: toAffinity(scoreOf(chosen, profile.dims), profile.dims),
    divined: true,
  };
}

/** 自定义馆的路由 key */
export function customMuseumKey(museumName: string): string {
  return `custom-${hashSeed(museumName.trim()).toString(16)}`;
}
