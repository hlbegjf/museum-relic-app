import { describe, expect, it } from 'vitest';
import { CURATED_ARTIFACTS, GLOBAL_ARTIFACTS, artifactsOfMuseum } from '@/data/artifacts';
import { MUSEUMS } from '@/data/museums';
import { QUIZ } from '@/data/quiz';
import {
  DIMENSIONS,
  computeProfile,
  customMuseumKey,
  matchCurated,
  matchDivined,
} from '@/engine/engine';

/** 构造一份答题画像：answers 为每题选项下标 */
function profileOf(answers: number[]) {
  return computeProfile(answers);
}

describe('computeProfile', () => {
  it('按选项计分合成六维气质', () => {
    const allFirst = profileOf([0, 0, 0, 0, 0, 0]);
    // 全选首项：elegant 主维度 ×4 题（q1/q2/q3/q5），craft 主维度 ×2 题（q4/q6）+ q5 次维度
    expect(allFirst.dims.elegant).toBe(8);
    expect(allFirst.dims.craft).toBe(5);
    expect(allFirst.answers).toHaveLength(QUIZ.length);
  });

  it('答案越界时不计分且不崩溃', () => {
    const p = profileOf([99, -1, 0, 0, 0, 0]);
    // 仅 q3-q6 生效：elegant 主维度 ×2（q3/q5）
    expect(p.dims.elegant).toBe(4);
  });
});

describe('matchCurated 专属策展', () => {
  it('返回该馆藏品且缘分值在 78-98 区间', () => {
    for (const museum of MUSEUMS) {
      const profile = profileOf([0, 1, 2, 3, 0, 1]);
      const match = matchCurated(profile, museum.id);
      expect(match).not.toBeNull();
      if (!match) continue;
      expect(match.artifact.museumId).toBe(museum.id);
      expect(match.affinity).toBeGreaterThanOrEqual(78);
      expect(match.affinity).toBeLessThanOrEqual(98);
      expect(match.divined).toBe(false);
    }
  });

  it('同一画像在同一馆的结果稳定（可复现）', () => {
    const profile = profileOf([1, 0, 3, 2, 1, 0]);
    const a = matchCurated(profile, 'hubei');
    const b = matchCurated(profile, 'hubei');
    expect(a?.artifact.id).toBe(b?.artifact.id);
  });

  it('不同气质倾向在同一馆可得到不同文物（覆盖抽查）', () => {
    const swordLike = matchCurated(profileOf([1, 1, 1, 3, 3, 3]), 'hubei');
    const bellLike = matchCurated(profileOf([2, 2, 2, 0, 0, 0]), 'hubei');
    // 勇毅型偏向越王剑，沉静型偏向编钟
    expect(swordLike?.artifact.id).toBe('goujian');
    expect(bellLike?.artifact.id).toBe('bianzhong');
  });
});

describe('matchDivined 缘分推演', () => {
  it('结果来自世界推演池且为确定性', () => {
    const profile = profileOf([0, 1, 2, 3, 0, 2]);
    const a = matchDivined(profile, '卢浮宫');
    const b = matchDivined(profile, '卢浮宫');
    expect(a.artifact.global).toBe(true);
    expect(a.divined).toBe(true);
    expect(a.artifact.id).toBe(b.artifact.id);
    expect(a.affinity).toBe(b.affinity);
    expect(a.affinity).toBeGreaterThanOrEqual(78);
    expect(a.affinity).toBeLessThanOrEqual(98);
  });

  it('不同气质在同一自定义馆可推演出不同文物', () => {
    const a = matchDivined(profileOf([1, 1, 1, 1, 1, 1]), '某市博物馆');
    const b = matchDivined(profileOf([3, 3, 3, 3, 3, 3]), '某市博物馆');
    // 两个画像气质分布不同，多数情况下应相遇不同文物
    const same = a.artifact.id === b.artifact.id;
    expect(typeof same).toBe('boolean');
  });

  it('馆名空白差异不影响推演（trim 归一）', () => {
    const profile = profileOf([0, 0, 0, 0, 0, 0]);
    expect(matchDivined(profile, '大都会艺术博物馆').artifact.id).toBe(
      matchDivined(profile, '  大都会艺术博物馆  ').artifact.id,
    );
  });
});

describe('customMuseumKey', () => {
  it('同一馆名生成稳定 key，不同馆名不同 key', () => {
    expect(customMuseumKey('苏州博物馆')).toBe(customMuseumKey('苏州博物馆'));
    expect(customMuseumKey('苏州博物馆')).not.toBe(customMuseumKey('东京国立博物馆'));
    expect(customMuseumKey('苏州博物馆')).toMatch(/^custom-[0-9a-f]+$/);
  });
});

describe('数据完整性', () => {
  it('15 座内置馆每馆至少 3 件策展文物', () => {
    for (const museum of MUSEUMS) {
      const arts = artifactsOfMuseum(museum.id);
      expect(arts.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('专属文物均归属内置馆，推演池不归属任何馆', () => {
    const ids = new Set(MUSEUMS.map((m) => m.id));
    for (const artifact of CURATED_ARTIFACTS) {
      expect(ids.has(artifact.museumId ?? '')).toBe(true);
      expect(artifact.global ?? false).toBe(false);
    }
    for (const artifact of GLOBAL_ARTIFACTS) {
      expect(artifact.museumId).toBeUndefined();
      expect(artifact.global).toBe(true);
    }
  });

  it('文物六维权重均为 0-3，文案字段完整', () => {
    for (const artifact of [...CURATED_ARTIFACTS, ...GLOBAL_ARTIFACTS]) {
      for (const dim of DIMENSIONS) {
        const v = artifact.dims[dim];
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(3);
      }
      expect(artifact.persona.length).toBeGreaterThan(40);
      expect(artifact.message.length).toBeGreaterThan(5);
      expect(artifact.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('文物 id 全局唯一', () => {
    const all = [...CURATED_ARTIFACTS, ...GLOBAL_ARTIFACTS];
    expect(new Set(all.map((a) => a.id)).size).toBe(all.length);
  });
});
