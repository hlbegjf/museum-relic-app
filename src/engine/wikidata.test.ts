import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  candidateDims,
  fileNameFromFilePathUrl,
  matchLive,
  pickCandidate,
  queryCollection,
  type LiveCandidate,
} from './wikidata';
import type { Profile } from '@/types';

const profile: Profile = {
  dims: { elegant: 3, brave: 2, calm: 2, lively: 1, craft: 2, mystic: 1 },
  answers: [0, 1, 0],
  createdAt: 0,
};

const candidates: LiveCandidate[] = [
  {
    qid: 'Q100001',
    name: '甲器',
    description: '绘画',
    imageFile: 'A.jpg',
    classes: ['Q3305213'],
    inception: '1500-01-01T00:00:00Z',
  },
  {
    qid: 'Q100002',
    name: '乙器',
    description: '青铜鼎',
    imageFile: 'B.jpg',
    classes: [],
    inception: undefined,
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fileNameFromFilePathUrl', () => {
  it('解析 Special:FilePath URL（含编码）', () => {
    expect(
      fileNameFromFilePathUrl(
        'http://commons.wikimedia.org/wiki/Special:FilePath/%E5%9B%9B%E7%BE%8A%E6%96%B9%E5%B0%8A.jpg',
      ),
    ).toBe('四羊方尊.jpg');
  });
  it('非预期 URL 返回空', () => {
    expect(fileNameFromFilePathUrl('https://example.com/a.jpg')).toBe('');
  });
});

describe('candidateDims', () => {
  it('由类别/文本得出权重', () => {
    expect(candidateDims(candidates[0]).elegant).toBe(2);
    expect(candidateDims(candidates[1]).calm).toBe(2);
  });
});

describe('pickCandidate', () => {
  it('确定性：同一画像 + 同一候选集反复调用结果不变', () => {
    const a = pickCandidate(candidates, profile, 'Q998042');
    for (let i = 0; i < 5; i++) {
      expect(pickCandidate(candidates, profile, 'Q998042').qid).toBe(a.qid);
    }
  });
  it('候选一定来自候选集', () => {
    const c = pickCandidate(candidates, profile, 'Q1');
    expect(candidates.map((x) => x.qid)).toContain(c.qid);
  });
});

describe('matchLive（fetch mock）', () => {
  const searchResponse = {
    search: [{ id: 'Q998042', label: 'Suzhou Museum', description: 'museum' }],
  };
  const sparqlResponse = {
    results: {
      bindings: [
        {
          item: { value: 'http://www.wikidata.org/entity/Q100001' },
          image: { value: 'http://commons.wikimedia.org/wiki/Special:FilePath/A.jpg' },
          classes: { value: 'Q3305213' },
          inception: { value: '1830-01-01T00:00:00Z' },
        },
      ],
    },
  };
  const labelResponse = {
    entities: {
      Q100001: {
        labels: { zh: { value: '踏雪访友图轴' } },
        descriptions: { en: { value: 'painting' } },
      },
    },
  };

  function mockFetchOk() {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes('wbsearchentities')) {
          return { ok: true, status: 200, json: async () => searchResponse };
        }
        if (u.includes('wbgetentities')) {
          return { ok: true, status: 200, json: async () => labelResponse };
        }
        return { ok: true, status: 200, json: async () => sparqlResponse };
      }),
    );
  }

  it('真实馆藏路径：live=true 且文物来自馆藏', async () => {
    mockFetchOk();
    const res = await matchLive(profile, '苏州博物馆');
    expect(res.live).toBe(true);
    expect(res.museumQid).toBe('Q998042');
    expect(res.match.artifact.live).toBe(true);
    expect(res.match.artifact.imageUrl).toBe('A.jpg');
    expect(res.match.artifact.name).toBe('踏雪访友图轴');
    expect(res.match.divined).toBe(true);
  });

  it('搜索无结果：回退全球推演池（live=false）', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ search: [] }) })),
    );
    const res = await matchLive(profile, '不存在的馆xyzzy');
    expect(res.live).toBe(false);
    expect(res.match.artifact.global).toBe(true);
  });

  it('网络全部失败：回退全球推演池', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const res = await matchLive(profile, '断网博物馆');
    expect(res.live).toBe(false);
    expect(res.match.artifact.id).toBeTruthy();
  });
});

describe('queryCollection（fetch mock）', () => {
  const sparqlRows = (qids: string[]) => ({
    results: {
      bindings: qids.map((q) => ({
        item: { value: `http://www.wikidata.org/entity/${q}` },
        image: { value: `http://commons.wikimedia.org/wiki/Special:FilePath/${q}.jpg` },
        classes: { value: 'Q3305213' },
        inception: { value: '1700-01-01T00:00:00Z' },
      })),
    },
  });
  const labelResp = {
    entities: {
      Q2: { labels: { zh: { value: '乙器' } }, descriptions: { zh: { value: 'desc' } } },
      Q1: { labels: { zh: { value: '甲器' } }, descriptions: { zh: { value: 'desc' } } },
    },
  };

  it('多模式去重合并 + 批量补名 + 稳定排序', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes('wbgetentities')) {
          return { ok: true, status: 200, json: async () => labelResp };
        }
        // 5 个模式各返回不同/重复的候选
        const payload =
          u.includes('P195') || u.includes('P127')
            ? sparqlRows(['Q2', 'Q1'])
            : sparqlRows(['Q2']);
        return { ok: true, status: 200, json: async () => payload };
      }),
    );
    const list = await queryCollection('Q9');
    expect(list.map((c) => c.qid)).toEqual(['Q1', 'Q2']); // QID 排序
    expect(list[0].name).toBe('甲器');
    expect(list[0].description).toBe('desc');
  });

  it('无 label 的候选被丢弃；全空返回空数组', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes('wbgetentities')) {
          return { ok: true, status: 200, json: async () => ({ entities: {} }) };
        }
        return { ok: true, status: 200, json: async () => sparqlRows(['Q1']) };
      }),
    );
    expect(await queryCollection('Q9')).toHaveLength(0);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ results: { bindings: [] } }) })),
    );
    expect(await queryCollection('Q9')).toHaveLength(0);
  });
});
