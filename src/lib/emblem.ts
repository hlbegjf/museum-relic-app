/** 取文物的「徽记字」：跳过书名号等符号后的第一个字 */
export function emblemChar(name: string): string {
  const stripped = name.replace(/[《》「」〈〉·\s]/g, '');
  return stripped.charAt(0) || '缘';
}
