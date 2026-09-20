import type { Artifact } from '@/types';

/**
 * 文物实物图：Wikimedia Commons 文件名映射（均已逐一经 API 验证存在）。
 * 通过 Special:FilePath 重定向引用，浏览器可直接显示，无需代理。
 */
export const ARTIFACT_IMAGES: Record<string, string> = {
  // ── 其一（故宫 / 台北故宫 / 国博 / 秦陵 / 陕历博 / 三星堆 / 湖南 / 湖北）──
  lanting: '神龍蘭亭序全.JPG',
  qianli:
    'Wang Ximeng. A Thousand Li of Rivers and Mountains. (Complete, 51,3x1191,5 cm). 1113. Palace museum, Beijing.jpg',
  cimu: '13 Glazed Vase.jpg',
  jinou: '金瓯永固杯 故宫珍宝馆.jpg',
  falang: '',
  cuiyu: 'Jadeite Cabbage, National Palace Museum.jpg',
  maogong: 'Ding cauldron of Duke Mao.jpg',
  kaixue: 'The Calligraphy Model Sunny after Snow by Wang Xizhi.jpg',
  shuixian: '北宋汝窯青瓷無紋水仙盆.jpg',
  roushi: 'Braised pork stone, Taipei National Palace Museum (2025) - img 04.jpg',
  houmuwu: 'HouMuWuDingFullView.jpg',
  siyang: '四羊方尊.jpg',
  shuochang: 'Ceramic figure of a story-teller.jpg',
  fengguan: 'PhoenixCrown.jpg',
  hongshan: 'Hongshan Jade Dragon 1.jpg',
  guixie:
    '2023-10-08 Chin dynasty Terracotta Kneeling Archer 秦始皇兵馬俑博物館文物陳列廳跪射俑 01.jpg',
  tongchema: 'Qin dynasty bronze chariot and horses.jpg',
  jiangjun: '2009 Qin Terracotta General.jpg',
  shuiqin: '2009 Bronze Swan from Qin Shihuang Terracotta Army Burial 1b.jpg',
  maonao: 'Tang Agate Cup (50616899327).jpg',
  wuma: 'Tang Silver Wine Flask with Dancing Horse (9948315274).jpg',
  sancai: 'Tang Sancai Porcelain with Musicians on a Camel.jpg',
  huanghou: '"皇后之玺"玉印.jpg',
  zongmu: '青铜纵目面具B.jpg',
  shenshu: 'Ⅰ号大型青铜神树.jpg',
  jinmianju: 'Sanxingdui Gold Mask.jpg',
  daliren: '三星堆出土青铜大立人像, 2017-09-17.jpg',
  susha: '直裾素纱襌衣, 2018-09-28.jpg',
  txing: 'Mawangdui silk banner from tomb no1.jpg',
  limao: '',
  daoyin:
    'Daoyin tu - chart for leading and guiding people in exercise Wellcome L0036007.jpg',
  goujian: '20230208 Bronze sword used by King Goujian of Yue 01.jpg',
  bianzhong: '20230208 Chime bells of Marquis Yi of Zeng.jpg',
  zunpan: '曾侯乙青铜尊盘，2015-04-06 01.jpg',
  meiping: '元青花四爱图梅瓶.jpg',

  // ── 其二（河南 / 甘肃 / 南京 / 上海 / 浙江 / 敦煌 / 大英）──
  gudi: '20250527 Bone flute in the Henan Museum.jpg',
  lianhe: '20260520 Rectangular Pots with Lotus Petal Cover and Crane Decoration 01.jpg',
  fuhao: '20210220 Bronze owl-shaped Zun with inscriptions of Fu Hao, Henan Museum.jpg',
  sishen: 'Four Deities in Clouds, Western Han Tomb Mural Painting.jpg',
  benma: 'Eastern Han Bronze Galloping Horse (10094835555).jpg',
  yishi: '驿使画像砖.jpg',
  boli: 'Yuan Lotus-shaped Glass Calix (10096176946).jpg',
  rentou: '仰韶文化人头形器口彩陶瓶.jpg',
  jinshou: 'Gold Beast, Nanjing Museum.jpg',
  zhulin: '竹林七贤与荣启期砖画05527.jpg',
  yulv: '董园一号墓银缕玉衣.jpg',
  kunyu: 'Kunyu Wanguo Quantu (坤輿萬國全圖).jpg',
  dake: 'Da Ke ding.jpg',
  zhongjiang: 'Zi Zhong Jiang pan bronzeware.jpg',
  kusun: '怀素 草书苦笋帖卷.jpg',
  yatou: '王獻之 鴨頭丸帖.jpg',
  fuchun: '浙博藏剩山图, 2023-09-26 01.jpg',
  yucong: '20241207 King of jade cong in the Zhejiang Provincial Museum.jpg',
  yuejian:
    'Yuyue People- Warring States Bronze Sword of Zhu Ji Yu Shi, King of the Yue - 越王者旨於睗剑 浙江博物馆 剑身.jpg',
  wanggong: '聚成号大鸿福轿, 2023-09-26.jpg',
  jiuse: 'Nine-colored deer jataka. Northern Wei. Mogao cave 257.jpg',
  feitian: 'Pipa player - Yulin Cave 15.jpg',
  fantan: 'Mogao Caves Pipa-Player.jpg',
  niepan: 'Dunhuang Mogao cave 159.jpg',
  nvshi: 'Gu Kaizhi 001.jpg',
  guanyin: 'Tang-4.jpg',
  dawei: 'The David Vases.jpg',
  luohan: 'Luohan - Yixian Glazed Ceramic Sculpture - British Museum - Joy of Museums.jpg',

  // ── 世界推演池 ──────────────────────────────────────────
  mona: 'Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg',
  venus: 'Venus de Milo Louvre Ma399 n4.jpg',
  nike: 'Nike of Samothrake Louvre Ma2369 n4.jpg',
  hammurabi: 'Code-de-Hammurabi-1.jpg',
  tutankhamun: 'CairoEgMuseumTaaMaskMostlyPhotographed.jpg',
  rosetta: 'Rosetta Stone.JPG',
  parthenon: 'Elgin-marbles-jan-2024.jpg',
  thinker: 'The Thinker, Rodin.jpg',
  starry: 'Van Gogh - Starry Night - Google Art Project.jpg',
  pearl: '1665 Girl with a Pearl Earring.jpg',
  david: "'David' by Michelangelo Fir JBU002.jpg",
  discus: 'Discobolus in National Roman Museum Palazzo Massimo alle Terme.JPG',
  ur: 'Standard of Ur - War.jpg',
  moai: 'Moai Rano raraku.jpg',
  sunstone: 'Monolito de la Piedra del Sol.jpg',
  olmec: 'Olmec Colossal Head, San Lorenzo, Veracruz, 1200-600 BC.jpg',
  wave: 'Tsunami by hokusai 19th century.jpg',
  yohen: 'Yōhen Tenmoku (Seikadō Bunko Art Museum).jpg',
  nefertiti: 'Nofretete Neues Museum.jpg',
  faberge: 'Imperial Coronation (Fabergé egg).jpg',
  peacock: 'Peacock Clock.jpg',
  genesis: 'Michelangelo - Creation of Adam (cropped).jpg',
  lastsupper: 'Leonardo da Vinci (1452-1519) - The Last Supper (1495-1498).jpg',
  guernica: 'Mural del "Guernica" de Picasso.jpg',
};

/** Commons Special:FilePath 引用（带宽度参数，按需缩放） */
export function commonsUrl(filename: string, width = 800): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

/** 文物实物图 URL；缺图返回 null（调用方回退为印章） */
export function artifactImage(artifact: Artifact, width = 800): string | null {
  // Wikidata 实时推演的文物自带 Commons 文件名
  if (artifact.imageUrl) return commonsUrl(artifact.imageUrl, width);
  const filename = ARTIFACT_IMAGES[artifact.id];
  return filename ? commonsUrl(filename, width) : null;
}
