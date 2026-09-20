import type { Museum } from '@/types';

/** 15 座内置策展博物馆 */
export const MUSEUMS: Museum[] = [
  { id: 'forbidden-city', name: '故宫博物院', city: '北京', tagline: '九重宫阙，藏着半部中国艺术史' },
  { id: 'taipei-palace', name: '台北故宫博物院', city: '台北', tagline: '山河犹在，文物南渡的另一半' },
  { id: 'national-museum', name: '中国国家博物馆', city: '北京', tagline: '一部立体的中华文明通史' },
  { id: 'terracotta', name: '秦始皇帝陵博物院', city: '西安', tagline: '地下军团，两千年不曾卸甲' },
  { id: 'shaanxi', name: '陕西历史博物馆', city: '西安', tagline: '给我一天，还你万年' },
  { id: 'sanxingdui', name: '三星堆博物馆', city: '广汉', tagline: '沉睡三千年，一醒惊天下' },
  { id: 'hunan', name: '湖南博物院', city: '长沙', tagline: '马王堆的千年一瞬' },
  { id: 'hubei', name: '湖北省博物馆', city: '武汉', tagline: '剑与钟的礼乐之乡' },
  { id: 'henan', name: '河南博物院', city: '郑州', tagline: '中原大地，文物粮仓' },
  { id: 'gansu', name: '甘肃省博物馆', city: '兰州', tagline: '丝路驼铃，从这里出发' },
  { id: 'nanjing', name: '南京博物院', city: '南京', tagline: '一院六馆，半部民国旧梦' },
  { id: 'shanghai', name: '上海博物馆', city: '上海', tagline: '青铜与书画的半壁江山' },
  { id: 'zhejiang', name: '浙江省博物馆', city: '杭州', tagline: '富春山居，良渚之光' },
  { id: 'dunhuang', name: '敦煌研究院', city: '敦煌', tagline: '大漠深处，飞天起舞' },
  { id: 'british-museum', name: '大英博物馆', city: '伦敦', tagline: '流落海外的华夏魂魄在此守望' },
];

export const MUSEUM_BY_ID: Record<string, Museum> = Object.fromEntries(
  MUSEUMS.map((m) => [m.id, m]),
);
