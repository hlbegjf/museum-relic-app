import { artifactImage } from '@/data/artifacts/images';
import { emblemChar } from '@/lib/emblem';
import type { Artifact } from '@/types';

const W = 750;
const H = 1334;

const COLOR = {
  paper: '#F7F2E7',
  paperDeep: '#EFE6D4',
  ink: '#2B2B2B',
  inkSoft: '#5A5248',
  cinnabar: '#C8394B',
  cinnabarDeep: '#A02C3B',
  gold: '#C9A063',
  tungsten: '#E8A33D',
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('54px "Ma Shan Zheng"'),
      document.fonts.load('46px "Ma Shan Zheng"'),
      document.fonts.load('400 24px "Noto Serif SC"'),
      document.fonts.load('600 28px "Noto Serif SC"'),
    ]);
    await document.fonts.ready;
  } catch {
    /* 字体加载失败时回退系统字体 */
  }
}

/** 跨域加载实物图（Wikimedia 支持 CORS）；失败或超时返回 null */
function loadCrossOriginImage(url: string | null, timeout = 5000): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = window.setTimeout(() => resolve(null), timeout);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

export interface ShareCardInput {
  artifact: Artifact;
  museumName: string;
  affinity: number;
  divined: boolean;
}

/** 生成 750×1334 分享长图：优先调起系统分享，失败则触发下载 */
export async function generateShareCard({ artifact, museumName, affinity, divined }: ShareCardInput) {
  await ensureFonts();
  const photo = await loadCrossOriginImage(artifactImage(artifact));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  /* ── 底：宣纸 + 装帧边框 ─────────────────────────────── */
  ctx.fillStyle = COLOR.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(90,82,72,0.015)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

  ctx.strokeStyle = COLOR.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.strokeStyle = 'rgba(200,57,75,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.setLineDash([]);

  /* ── 眉题 ───────────────────────────────────────────── */
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR.ink;
  ctx.font = '54px "Ma Shan Zheng", "Kaiti SC", serif';
  ctx.fillText('文物有缘', W / 2, 122);
  ctx.font = '400 20px "Noto Serif SC", serif';
  ctx.fillStyle = COLOR.inkSoft;
  ctx.fillText('每一件文物，都在等待与它魂魄相通的人', W / 2, 162);

  ctx.font = '600 24px "Noto Serif SC", serif';
  const chipText = `${museumName} · ${divined ? '缘分推演' : '专属策展'}`;
  const chipW = ctx.measureText(chipText).width + 56;
  roundRect(ctx, (W - chipW) / 2, 190, chipW, 44, 22);
  ctx.fillStyle = 'rgba(201,160,99,0.18)';
  ctx.fill();
  ctx.strokeStyle = COLOR.gold;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COLOR.ink;
  ctx.fillText(chipText, W / 2, 219);

  /* ── 实物图横幅（主视觉）────────────────────────────── */
  const banner = { x: 84, y: 264, w: 582, h: 340, r: 16 };
  roundRect(ctx, banner.x, banner.y, banner.w, banner.h, banner.r);
  ctx.save();
  ctx.clip();
  if (photo) {
    ctx.fillStyle = '#FFFCF5';
    ctx.fillRect(banner.x, banner.y, banner.w, banner.h);
    const scale = Math.min(banner.w / photo.width, banner.h / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.drawImage(
      photo,
      banner.x + (banner.w - dw) / 2,
      banner.y + (banner.h - dh) / 2,
      dw,
      dh,
    );
  } else {
    ctx.fillStyle = COLOR.paperDeep;
    ctx.fillRect(banner.x, banner.y, banner.w, banner.h);
    ctx.fillStyle = COLOR.cinnabar;
    ctx.font = '120px "Ma Shan Zheng", "Kaiti SC", serif';
    ctx.fillText(emblemChar(artifact.name), banner.x + banner.w / 2, banner.y + 200);
    ctx.fillStyle = COLOR.inkSoft;
    ctx.font = '400 20px "Noto Serif SC", serif';
    ctx.fillText('实物图暂缺 · 以印为记', banner.x + banner.w / 2, banner.y + 258);
  }
  ctx.restore();
  ctx.strokeStyle = COLOR.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, banner.x, banner.y, banner.w, banner.h, banner.r);
  ctx.stroke();

  /* ── 左列：缘分环 + 朝代馆藏 ────────────────────────── */
  const cx = 160;
  const cy = 700;
  const r = 52;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(201,160,99,0.3)';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (affinity / 100) * Math.PI * 2);
  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringGrad.addColorStop(0, COLOR.gold);
  ringGrad.addColorStop(0.5, COLOR.tungsten);
  ringGrad.addColorStop(1, COLOR.cinnabar);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.fillStyle = COLOR.cinnabar;
  ctx.font = '42px "Ma Shan Zheng", "Kaiti SC", serif';
  ctx.fillText(String(affinity), cx, cy + 8);
  ctx.fillStyle = COLOR.inkSoft;
  ctx.font = '400 15px "Noto Serif SC", serif';
  ctx.fillText('缘分值', cx, cy + 34);

  ctx.textAlign = 'left';
  ctx.font = '600 22px "Noto Serif SC", serif';
  const metaLines = wrapText(ctx, `${artifact.dynasty} · ${artifact.origin}`, 264).slice(0, 3);
  let my = 686 - (metaLines.length - 1) * 15;
  ctx.fillStyle = COLOR.ink;
  for (const line of metaLines) {
    ctx.fillText(line, 236, my);
    my += 30;
  }

  /* ── 左列：身世 + 文物留言 + 标签 ───────────────────── */
  const LEFT_CENTER = 292;
  const LEFT_WIDTH = 416;

  ctx.textAlign = 'center';
  ctx.font = '400 24px "Noto Serif SC", serif';
  ctx.fillStyle = COLOR.inkSoft;
  const introLines = wrapText(ctx, artifact.intro, LEFT_WIDTH).slice(0, 3);
  let iy = 800;
  for (const line of introLines) {
    ctx.fillText(line, LEFT_CENTER, iy);
    iy += 38;
  }

  ctx.font = '600 28px "Noto Serif SC", serif';
  ctx.fillStyle = COLOR.cinnabar;
  const msgLines = wrapText(ctx, `「${artifact.message}」`, 400).slice(0, 3);
  let vy = iy + 22;
  for (const line of msgLines) {
    ctx.fillText(line, LEFT_CENTER, vy);
    vy += 44;
  }

  ctx.font = '400 20px "Noto Serif SC", serif';
  ctx.fillStyle = COLOR.inkSoft;
  ctx.fillText(artifact.tags.join('  ·  '), LEFT_CENTER, vy + 34);

  /* ── 右列：竖排文物名 ───────────────────────────────── */
  const stripped = artifact.name.replace(/[《》「」〈〉·\s]/g, '').slice(0, 12);
  const long = stripped.length > 10;
  const fontSize = long ? 40 : 46;
  const step = long ? 50 : 56;
  const perCol = long ? 6 : 5;
  const columns: string[] = [];
  if (stripped.length <= perCol) {
    columns.push(stripped);
  } else {
    columns.push(stripped.slice(0, perCol), stripped.slice(perCol));
  }
  ctx.font = `${fontSize}px "Ma Shan Zheng", "Kaiti SC", serif`;
  ctx.fillStyle = COLOR.ink;
  ctx.textAlign = 'center';
  const colXs = columns.length === 1 ? [612] : [612, 536];
  columns.forEach((col, ci) => {
    let ny = 656;
    for (const ch of col) {
      ctx.fillText(ch, colXs[ci], ny);
      ny += step;
    }
  });

  /* ── 落款 ───────────────────────────────────────────── */
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR.inkSoft;
  ctx.font = '400 20px "Noto Serif SC", serif';
  ctx.fillText('文物有缘 · 长按保存，分享你的本命文物', W / 2, H - 90);
  if (photo) {
    ctx.fillStyle = 'rgba(90,82,72,0.55)';
    ctx.font = '400 15px "Noto Serif SC", serif';
    ctx.fillText('实物图：Wikimedia Commons', W / 2, H - 62);
  }

  /* ── 导出 ───────────────────────────────────────────── */
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png'),
  );
  if (!blob) return;
  const file = new File([blob], 'relic-fate.png', { type: 'image/png' });

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '文物有缘' });
      return;
    } catch {
      /* 用户取消或分享失败，回退下载 */
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `文物有缘-${artifact.name.replace(/[《》「」]/g, '')}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
