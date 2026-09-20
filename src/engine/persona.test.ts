import { describe, expect, it } from 'vitest';
import {
  buildLiveArtifact,
  detectKind,
  dominantDim,
  formatDynasty,
} from './persona';
import type { Dims } from '@/types';

const profileDims: Dims = { elegant: 3, brave: 2, calm: 2, lively: 1, craft: 2, mystic: 1 };

const baseInput = {
  qid: 'Q123456',
  name: '青花瓷瓶',
  description: '明代青花瓷瓶',
  imageFile: 'Vase.jpg',
  classes: ['Q41487'],
  inception: '1420-01-01T00:00:00Z',
  museumName: '苏州博物馆',
  profileDims,
  rng: () => 0.5,
};

describe('detectKind', () => {
  it('按 P31 Q-ID 识别大类', () => {
    const kind = detectKind(['Q3305213'], '');
    expect(kind.name).toBe('书画');
  });

  it('按 label/description 关键词识别大类', () => {
    expect(detectKind([], '明代青铜鼎').name).toBe('青铜器');
    expect(detectKind([], 'Roman sword').name).toBe('兵器');
    expect(detectKind([], '宋 frame 画卷').name).toBe('书画');
  });

  it('未识别时回退中性', () => {
    const kind = detectKind(['Q999999999'], '某物');
    expect(kind.dims.elegant).toBe(1);
    expect(kind.dims.mystic).toBe(1);
  });
});

describe('formatDynasty', () => {
  it('公元前', () => {
    expect(formatDynasty('-1200-01-01T00:00:00Z', '')).toBe('公元前 1200 年');
  });
  it('公元早期', () => {
    expect(formatDynasty('618-01-01T00:00:00Z', '')).toBe('公元 618 年');
  });
  it('四位年份', () => {
    expect(formatDynasty('1420-05-05T00:00:00Z', '')).toBe('1420 年');
  });
  it('缺失时用兜底', () => {
    expect(formatDynasty(undefined, '唐代文物')).toBe('唐代文物');
    expect(formatDynasty('garbage', '唐代文物')).toBe('唐代文物');
  });
});

describe('dominantDim', () => {
  it('画像主导维度决定文案气质', () => {
    expect(dominantDim({ elegant: 2, brave: 0, calm: 1, lively: 0, craft: 1, mystic: 0 }, profileDims)).toBe('elegant');
  });
});

describe('buildLiveArtifact', () => {
  it('装配完整 Artifact 并标记 live', () => {
    const a = buildLiveArtifact(baseInput);
    expect(a.id).toBe('wd:Q123456');
    expect(a.live).toBe(true);
    expect(a.imageUrl).toBe('Vase.jpg');
    expect(a.origin).toBe('苏州博物馆 藏');
    expect(a.dynasty).toBe('1420 年');
    expect(a.intro).toContain('苏州博物馆');
    expect(a.persona).toContain('苏州博物馆');
    expect(a.persona.length).toBeGreaterThan(60);
    expect(a.message.length).toBeGreaterThan(4);
    expect(a.tags).toContain('#真实馆藏');
  });

  it('同一输入永远生成同一文案（确定性）', () => {
    const a1 = buildLiveArtifact(baseInput);
    const a2 = buildLiveArtifact({ ...baseInput });
    expect(a1.persona).toBe(a2.persona);
    expect(a1.message).toBe(a2.message);
  });

  it('缺 description / inception 时有兜底', () => {
    const a = buildLiveArtifact({
      ...baseInput,
      description: '',
      inception: undefined,
      classes: [],
    });
    expect(a.intro.length).toBeGreaterThan(6);
    expect(a.dynasty.length).toBeGreaterThan(2);
  });
});
