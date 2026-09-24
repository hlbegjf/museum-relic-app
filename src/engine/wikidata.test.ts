import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  candidateDims,
  fileNameFromFilePathUrl,
  isExhibitable,
  matchLive,
  pickCandidate,
  qidFromUri,
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
    fame: 1,
  },
  {
    qid: 'Q100002',
    name: '乙器',
    description: '青铜鼎',
    imageFile: 'B.jpg',
    classes: [],
    inception: undefined,
    fame: 12,
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

describe('qidFromUri', () => {
  it('实体 URI 归一化为裸 QID', () => {
    expect(qidFromUri('http://www.wikidata.org/entity/Q3305213')).toBe('Q3305213');
    expect(qidFromUri('Q3305213')).toBe('Q3305213');
  });
});

describe('isExhibitable', () => {
  it('真实展品类别通过（绘画/雕塑/陶瓷…）', () => {
    expect(isExhibitable(['Q3305213'])).toBe(true);
    expect(isExhibitable(['Q838948', 'Q3305213'])).toBe(true);
  });
  it('黑名单类别命中即排除（照片/论文/人物/建筑…）', () => {
    expect(isExhibitable(['Q125191'])).toBe(false); // 照片
    expect(isExhibitable(['Q3305213', 'Q125191'])).toBe(false); // 混入照片类别也排除
    expect(isExhibitable(['Q13442814'])).toBe(false); // 学术论文
    expect(isExhibitable(['Q5'])).toBe(false); // 人物
    expect(isExhibitable(['Q41176'])).toBe(false); // 建筑
    expect(isExhibitable(['Q571'])).toBe(false); // 书籍
  });
  it('无任何 P31 类别：无法判定，排除', () => {
    expect(isExhibitable([])).toBe(false);
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
          // SPARQL 返回的是完整实体 URI（曾有 URI/裸 QID 不一致导致过滤失效的 bug）
          classes: { value: 'http://www.wikidata.org/entity/Q3305213' },
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
  /** 生成真实格式的 SPARQL 行：?class 为完整实体 URI */
  const sparqlRows = (rows: Array<{ qid: string; classUris?: string[] }>) => ({
    results: {
      bindings: rows.map(({ qid, classUris }) => ({
        item: { value: `http://www.wikidata.org/entity/${qid}` },
        image: { value: `http://commons.wikimedia.org/wiki/Special:FilePath/${qid}.jpg` },
        classes: {
          value: (classUris ?? ['http://www.wikidata.org/entity/Q3305213']).join('|'),
        },
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
        // 快慢模式各返回不同/重复的候选
        const payload =
          u.includes('P195') || u.includes('P127')
            ? sparqlRows([{ qid: 'Q2' }, { qid: 'Q1' }])
            : sparqlRows([{ qid: 'Q2' }]);
        return { ok: true, status: 200, json: async () => payload };
      }),
    );
    const list = await queryCollection('Q9');
    expect(list.map((c) => c.qid)).toEqual(['Q1', 'Q2']); // QID 排序
    expect(list[0].name).toBe('甲器');
    expect(list[0].description).toBe('desc');
    expect(list[0].classes).toEqual(['Q3305213']); // URI 已归一化为裸 QID
  });

  it('非展品类别（照片/论文）被黑名单过滤', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes('wbgetentities')) {
          return { ok: true, status: 200, json: async () => labelResp };
        }
        const payload = sparqlRows([
          { qid: 'Q1' }, // 默认绘画类，保留
          { qid: 'Q2' },
          { qid: 'Q3', classUris: ['http://www.wikidata.org/entity/Q125191'] }, // 照片
          { qid: 'Q4', classUris: ['http://www.wikidata.org/entity/Q13442814'] }, // 学术论文
          { qid: 'Q5', classUris: ['http://www.wikidata.org/entity/Q5'] }, // 人物
          { qid: 'Q6', classUris: [] }, // 无类别
        ]);
        return { ok: true, status: 200, json: async () => payload };
      }),
    );
    const list = await queryCollection('Q9');
    expect(list.map((c) => c.qid)).toEqual(['Q1', 'Q2']);
  });

  it('无 label 的候选被丢弃；全空返回空数组', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes('wbgetentities')) {
          return { ok: true, status: 200, json: async () => ({ entities: {} }) };
        }
        return { ok: true, status: 200, json: async () => sparqlRows([{ qid: 'Q1' }]) };
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
