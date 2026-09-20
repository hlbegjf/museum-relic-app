import { describe, expect, it } from 'vitest';
import { ALL_ARTIFACTS } from './index';
import { ARTIFACT_IMAGES, artifactImage } from './images';

describe('文物图片数据', () => {
  it('图片文件名格式合法（浏览器可显示）', () => {
    for (const [id, filename] of Object.entries(ARTIFACT_IMAGES)) {
      expect(id).toBeTruthy();
      if (filename === '') continue;
      expect(filename).toMatch(/\.(jpe?g|png|svg)$/i);
    }
  });

  it('图片 id 均对应已知文物', () => {
    const ids = new Set(ALL_ARTIFACTS.map((a) => a.id));
    for (const id of Object.keys(ARTIFACT_IMAGES)) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it('绝大多数文物配有图片（允许极少数缺图回退印章）', () => {
    const withImage = ALL_ARTIFACTS.filter((a) => artifactImage(a, 200) !== null);
    expect(withImage.length).toBeGreaterThanOrEqual(ALL_ARTIFACTS.length - 3);
  });

  it('artifactImage 生成 Special:FilePath URL（按需缩放）', () => {
    const goujian = ALL_ARTIFACTS.find((a) => a.id === 'goujian');
    expect(goujian).toBeDefined();
    const url = artifactImage(goujian!, 300);
    expect(url).toContain('commons.wikimedia.org/wiki/Special:FilePath/');
    expect(url).toContain('width=300');
    // 文件名中的空格与特殊字符需被转义
    expect(url).not.toContain(' ');
  });

  it('缺图文物返回 null（用于回退印章）', () => {
    const falang = ALL_ARTIFACTS.find((a) => a.id === 'falang');
    expect(falang).toBeDefined();
    expect(artifactImage(falang!)).toBeNull();
  });
});
