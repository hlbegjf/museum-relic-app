import type { Artifact, Dimension, Dims } from '@/types';

/**
 * Wikidata 实时推演文物的气质映射与文案生成。
 * 全部为纯函数：同一候选永远生成同一段文案。
 */

/** 文物大类：类型名 + 六维权重 + 一句器物自述 */
interface ArtifactKind {
  name: string;
  dims: Dims;
  voice: string;
}

const KINDS: Record<string, ArtifactKind> = {
  painting: {
    name: '书画',
    dims: { elegant: 2, brave: 0, calm: 1, lively: 0, craft: 1, mystic: 0 },
    voice: '纸寿千年，我在方寸之间装过山河。',
  },
  sculpture: {
    name: '雕塑',
    dims: { elegant: 1, brave: 0, calm: 2, lively: 0, craft: 1, mystic: 0 },
    voice: '凿子落下的每一次，都是把多余的去掉。',
  },
  weapon: {
    name: '兵器',
    dims: { elegant: 0, brave: 3, calm: 1, lively: 0, craft: 1, mystic: 0 },
    voice: '我出鞘的年月，是可以改写历史的。',
  },
  ceramic: {
    name: '陶瓷',
    dims: { elegant: 1, brave: 0, calm: 1, lively: 0, craft: 2, mystic: 0 },
    voice: '入窑一色，出窑万彩——火里走过的，都不怕日子。',
  },
  bronze: {
    name: '青铜器',
    dims: { elegant: 0, brave: 1, calm: 2, lively: 0, craft: 1, mystic: 1 },
    voice: '范铸三千年的分量，压得住所有浮躁。',
  },
  jade: {
    name: '玉器',
    dims: { elegant: 1, brave: 0, calm: 1, lively: 0, craft: 1, mystic: 2 },
    voice: '玉不琢不成器，我疼过，所以温润。',
  },
  jewellery: {
    name: '金银器',
    dims: { elegant: 1, brave: 0, calm: 0, lively: 2, craft: 2, mystic: 0 },
    voice: '錾刀走过的地方，都成了光。',
  },
  textile: {
    name: '织绣服饰',
    dims: { elegant: 1, brave: 0, calm: 1, lively: 1, craft: 2, mystic: 0 },
    voice: '一针一线，都是别人的心事，我替他们存着。',
  },
  instrument: {
    name: '乐器',
    dims: { elegant: 1, brave: 0, calm: 0, lively: 2, craft: 1, mystic: 1 },
    voice: '我的使命，是让空气也变成艺术。',
  },
  religious: {
    name: '宗教造像',
    dims: { elegant: 0, brave: 0, calm: 1, lively: 0, craft: 1, mystic: 3 },
    voice: '来看我的人，求的其实都是心安。',
  },
  manuscript: {
    name: '文献手稿',
    dims: { elegant: 2, brave: 0, calm: 1, lively: 0, craft: 1, mystic: 1 },
    voice: '字落在纸上，就再也赖不掉了。',
  },
  coin: {
    name: '钱币',
    dims: { elegant: 0, brave: 0, calm: 2, lively: 1, craft: 1, mystic: 0 },
    voice: '我经手过的人间，比谁都多。',
  },
  specimen: {
    name: '自然标本',
    dims: { elegant: 0, brave: 0, calm: 2, lively: 0, craft: 1, mystic: 2 },
    voice: '我用一亿年，等你这一眼。',
  },
  inscription: {
    name: '古文字文物',
    dims: { elegant: 1, brave: 0, calm: 1, lively: 0, craft: 1, mystic: 3 },
    voice: '最早的文字，刻在占卜未来的骨头上。',
  },
  furniture: {
    name: '家具',
    dims: { elegant: 1, brave: 0, calm: 2, lively: 0, craft: 2, mystic: 0 },
    voice: '好东西，是让人用一百年的。',
  },
  glass: {
    name: '玻璃器',
    dims: { elegant: 1, brave: 0, calm: 0, lively: 2, craft: 2, mystic: 0 },
    voice: '透明不是脆弱，是坦荡。',
  },
};

const NEUTRAL_KIND: ArtifactKind = {
  name: '文物',
  dims: { elegant: 1, brave: 1, calm: 1, lively: 1, craft: 1, mystic: 1 },
  voice: '能留到今天的东西，都有自己的脾气。',
};

/** Wikidata P31 类别 Q-ID → 大类（尽力匹配，miss 走关键词/中性） */
const CLASS_QIDS: Record<string, keyof typeof KINDS> = {
  // 书画类（绘画/素描/版画/书法）
  Q3305213: 'painting', // painting
  Q93184: 'painting', // drawing
  Q178706: 'painting', // calligraphy（书法归入书画）
  Q11060274: 'painting', // print
  Q18219090: 'painting', // woodcut print
  Q18761202: 'painting', // watercolor painting
  Q1348059: 'painting', // panel（板画）
  // 雕塑类
  Q838948: 'sculpture', // sculptural work
  Q1208795: 'sculpture', // sculpture
  Q853614: 'sculpture', // statue
  Q179700: 'sculpture', // statue
  Q245117: 'sculpture', // relief
  Q4364339: 'sculpture', // plaque
  Q241045: 'sculpture', // bust
  Q29401129: 'sculpture', // head of a statue
  Q29527347: 'sculpture', // figure
  Q1066288: 'sculpture', // figurine
  Q193893: 'sculpture', // capital（柱头）
  Q391414: 'sculpture', // architectural element
  Q82383: 'sculpture', // base
  // 兵器/甲胄
  Q12766: 'weapon', // sword
  Q728: 'weapon', // weapon
  Q1287644: 'weapon', // blade
  Q173603: 'weapon', // helmet
  Q11886611: 'weapon', // armor
  Q39397: 'weapon', // axe
  Q32489: 'weapon', // knife
  // 陶瓷/容器
  Q41487: 'ceramic', // ceramic art
  Q745845: 'ceramic', // ceramic
  Q735599: 'ceramic', // porcelain
  Q153988: 'ceramic', // bowl
  Q191851: 'ceramic', // vase
  Q57216: 'ceramic', // plate
  Q97659338: 'ceramic', // dish
  Q96952903: 'ceramic', // vessel
  Q1207302: 'ceramic', // jar
  Q12244686: 'ceramic', // pot
  Q2413314: 'ceramic', // jug
  Q132397: 'ceramic', // pitcher
  Q404785: 'ceramic', // ewer
  Q178401: 'ceramic', // amphora
  Q668349: 'ceramic', // kylix
  Q579418: 'ceramic', // lekythos
  Q831869: 'ceramic', // oenochoe
  Q477146: 'ceramic', // amphoriskos
  Q717954: 'ceramic', // aryballos
  Q1136095: 'ceramic', // skyphos
  Q732286: 'ceramic', // askos
  Q673338: 'ceramic', // alabastron
  Q81727: 'ceramic', // cup
  Q16180001: 'ceramic', // tumbler
  Q386215: 'ceramic', // mug
  Q833823: 'ceramic', // beaker
  Q18451251: 'ceramic', // goblet
  Q1531435: 'ceramic', // wine glass
  Q3446398: 'ceramic', // tankard
  Q80228: 'ceramic', // bottle
  Q18696213: 'ceramic', // flask
  Q245005: 'ceramic', // teapot
  Q1422576: 'ceramic', // saucer
  Q3391771: 'ceramic', // platter
  Q2990690: 'ceramic', // compote bowl
  Q5771190: 'ceramic', // salt cellar
  Q2356786: 'ceramic', // sugar bowl
  Q2383211: 'ceramic', // wash basin
  Q613972: 'ceramic', // tray
  Q468402: 'ceramic', // tile
  Q960844: 'ceramic', // funerary urn
  Q5174015: 'ceramic', // cosmetic container
  Q1350279: 'ceramic', // pyxis
  // 青铜器
  Q229376: 'bronze', // bronze
  Q1074699: 'bronze', // bronze artifact
  // 玉器
  Q44512: 'jade', // jade
  Q2001600: 'jade', // jade artifact
  // 金银/珠宝首饰
  Q1798613: 'jewellery', // jewellery
  Q17274532: 'jewellery', // gold object
  Q2142903: 'jewellery', // jewelry
  Q168456: 'jewellery', // earring
  Q189299: 'jewellery', // necklace
  Q201664: 'jewellery', // bracelet
  Q2111434: 'jewellery', // pendant
  Q499916: 'jewellery', // brooch
  Q324926: 'jewellery', // fibula
  Q46847: 'jewellery', // ring
  Q112091664: 'jewellery', // finger ring
  Q1053956: 'jewellery', // bead
  Q1665351: 'jewellery', // intaglio
  Q28512: 'jewellery', // cameo
  Q115488: 'jewellery', // medallion
  Q2442735: 'jewellery', // scarab
  Q131557: 'jewellery', // amulet
  // 织绣服饰
  Q28823: 'textile', // textile
  Q11460: 'textile', // costume
  Q200539: 'textile', // dress
  Q2144456: 'textile', // evening dress
  Q184296: 'textile', // tapestry
  Q163446: 'textile', // carpet
  Q22075301: 'textile', // textile artwork
  // 乐器
  Q34379: 'instrument', // musical instrument
  // 宗教造像/丧葬
  Q183032: 'religious', // religious art
  Q573: 'religious', // idol
  Q8261: 'religious', // religious figure
  Q726826: 'religious', // ushabti
  Q184418: 'religious', // coffin
  Q2083647: 'religious', // funerary art
  Q1536488: 'religious', // funerary cone
  // 文献手稿
  Q17536877: 'manuscript', // manuscript
  Q11690269: 'manuscript', // document
  Q820655: 'manuscript', // book
  Q48498: 'manuscript', // illuminated manuscript
  Q16744570: 'manuscript', // tablet
  Q12043767: 'manuscript', // papyrus
  Q1363377: 'manuscript', // folio
  // 钱币
  Q39585: 'coin', // coin
  Q41207: 'coin', // coin
  Q131647: 'coin', // medal
  // 自然标本
  Q2385137: 'specimen', // fossil
  Q1868855: 'specimen', // natural specimen
  // 古文字/铭刻
  Q421909: 'inscription', // inscription
  Q417504: 'inscription', // epigraphy
  Q1640824: 'inscription', // inscription
  Q178743: 'inscription', // stele
  Q834459: 'inscription', // ostracon
  Q162919: 'inscription', // seal
  Q1123756: 'inscription', // cylinder seal
  // 家具
  Q12280: 'furniture', // furniture
  Q11019: 'furniture', // chair
  Q11023: 'furniture', // table
  Q14745: 'furniture', // furniture
  Q14748: 'furniture', // table
  Q63495428: 'furniture', // side chair
  Q11285759: 'furniture', // armchair
  Q366134: 'furniture', // chest
  Q188075: 'furniture', // box
  // 玻璃器
  Q5208785: 'glass', // glass art
  Q13069: 'glass', // glass
  Q11469: 'glass', // glass
  Q1922981: 'glass', // glassware
  Q5567091: 'glass', // glass artwork
  Q21061279: 'glass', // stained-glass window
  // 工艺杂项（钟表/镜/灯/镶嵌）
  Q376: 'craft', // clock
  Q35197: 'craft', // mirror
  Q1138737: 'craft', // lamp
  Q821952: 'craft', // oil lamp
  Q151771: 'craft', // candlestick
  Q548275: 'craft', // candelabra
  Q95975776: 'craft', // inlay
  Q133067: 'craft', // mosaic
  Q161524: 'craft', // mask
  Q1320546: 'craft', // weight
  Q3449901: 'craft', // game piece
};

/** label/description 关键词 → 大类（比 Q-ID 更鲁棒的第二通道） */
const KIND_KEYWORDS: Array<[keyof typeof KINDS, string[]]> = [
  ['painting', ['painting', '油画', '水墨', '山水画', '绘画', '书法', 'calligraphy', 'drawing', '画卷', '画轴', '图轴', '图卷', '画作', '字画', '手卷', '立轴', '册页', 'print', 'woodcut', 'watercolor', 'lithograph']],
  ['sculpture', ['sculpture', '雕塑', '石雕', '木雕', '造像碑', 'relief', '浮雕', 'statue', 'figurine', 'bust', 'stele of']],
  ['weapon', ['sword', 'weapon', 'swordguard', '刀', '剑', '矛', '戈', '戟', '兵器', '甲胄', 'armor', 'helmet', 'dagger', 'arrowhead']],
  ['ceramic', ['ceramic', 'porcelain', 'pottery', '陶瓷', '瓷器', '陶器', '青花', '彩瓷', '唐三彩', 'bowl', 'vase', 'jar', 'amphora', 'vessel', 'teapot', 'jug', 'pitcher']],
  ['bronze', ['bronze', '青铜', '鼎', '簋', '尊', '卣', '觥', '爵', '编钟', '銮铃']],
  ['jade', ['jade', '玉器', '玉佩', '玉璧', '玉琮', '玉璜', '翡翠']],
  ['jewellery', ['jewellery', 'jewelry', 'gold', 'silver', '金银', '首饰', '冠饰', '金器', '银器', 'golden', 'earring', 'necklace', 'bracelet', 'pendant', 'brooch', 'amulet', 'scarab', 'ring']],
  ['textile', ['textile', 'costume', 'embroid', '织物', '刺绣', '丝织', '服饰', '龙袍', '缂丝', 'tapestry', 'carpet', 'dress']],
  ['instrument', ['instrument', 'music', '乐器', '琴', '瑟', '箜篌', '琵琶', '编磬']],
  ['religious', ['buddha', 'bodhisattva', 'religious', '佛', '菩萨', '罗汉', '金刚', '造像', '经幢', 'altar', '祭', 'ushabti', 'coffin', 'sarcophagus', 'funerary']],
  ['manuscript', ['manuscript', 'document', 'scroll', '手稿', '文书', '卷轴', '写本', '抄本', '善本', 'map', 'papyrus', 'tablet', 'codex']],
  ['coin', ['coin', '钱币', '铜钱', '金币', '银元', '纸币', 'banknote', 'medal']],
  ['specimen', ['fossil', 'specimen', 'skeleton', '化石', '标本', '骨骼', 'dinosaur']],
  ['inscription', ['inscription', 'oracle', '甲骨', '铭文', '碑文', '石鼓', 'epigraph', 'bamboo slips', '简牍', 'ostracon', 'seal']],
  ['furniture', ['furniture', 'chair', 'table', 'cabinet', '家具', '屏风', '桌', '椅', '案', '柜', 'chest']],
  ['glass', ['glass', '玻璃', '琉璃']],
];

/** 由 P31 Q-ID 列表 + label/description 文本判定文物大类 */
export function detectKind(classes: string[], searchText: string): ArtifactKind {
  for (const qid of classes) {
    const kind = CLASS_QIDS[qid];
    if (kind) return KINDS[kind];
  }
  const lower = searchText.toLowerCase();
  for (const [kind, words] of KIND_KEYWORDS) {
    if (words.some((w) => lower.includes(w.toLowerCase()))) return KINDS[kind];
  }
  return NEUTRAL_KIND;
}

/** Wikidata ISO 时间（±xxxx-xx-xx）→ 中文年代短语 */
export function formatDynasty(iso: string | undefined, fallback: string): string {
  if (!iso) return fallback;
  const m = /^([+-]?\d{1,6})/.exec(iso);
  if (!m) return fallback;
  const year = Number(m[1]);
  if (Number.isNaN(year)) return fallback;
  if (year < 0) return `公元前 ${Math.abs(year)} 年`;
  if (year < 1000) return `公元 ${year} 年`;
  return `${year} 年`;
}

/** 六维主导气质的人格文案 */
const DIMENSION_PERSONA: Record<Dimension, string> = {
  elegant:
    '你身上有一种慢下来的本事。这个时代人人赶路，你却习惯把一件事看仔细、把一句话想清楚——这份不动声色的讲究，是文人的骨头。我们这类东西，讲究的就是留白三分：说七分，懂的人自然懂。你懂。',
  brave:
    '你身上有一股不肯回头的劲。别人劝你算了的时候，你心里那杆秤从来没有歪过。我见过太多人把锋芒磨平换安稳，你没有——你不是不知道疼，只是不肯跪。锋利的东西容易折，但也只有锋利的东西，能划开时代。',
  calm:
    '你是那种进了展厅会自然放轻脚步的人。世上热闹太多，你偏喜欢在安静的东西前站一会儿。这不是闷，是定力——重器不语，大音希声。你的安静里有一种压得住场的力量，只是你自己未必发觉。',
  lively:
    '你像一阵穿堂风，走到哪儿，哪儿就活起来。规矩在你眼里是活的，日子在你手里是能翻出花来的。别信那些说你「不够沉稳」的话——这世上沉得住气的人太多，能让东西活起来的人太少。',
  craft:
    '你对细节的执念，是藏不住的。别人看个大概，你偏偏看见那一线之差。这不是较劲，是尊重——对手艺的尊重，对自己的尊重。我们这类东西能留到今天，靠的就是当年某个人的不肯将就。你们是同一种人。',
  mystic:
    '你身上有读不完的部分。熟悉你的人以为了解你，其实他们看到的只是展签。你不解释，也不表演，把自己活成了一件「未解之谜」——这不是疏离，是分寸。真正的深度，从来不靠展览自己。',
};

/** 六维留言文案池（由确定性随机挑一条） */
const DIMENSION_MESSAGES: Record<Dimension, string[]> = {
  elegant: ['慢慢来，比较快。', '讲究，是我们这类人的命。', '看得仔细的人，运气不会差。'],
  brave: ['锋芒别收，换个鞘就好。', '敢走窄门的人，路会给他让开。', '疼过的地方，会长出铠甲。'],
  calm: ['稳住，你比自己想的更能扛。', '重器不语，你也不必多言。', '安静，是你的力气。'],
  lively: ['让日子翻出花来。', '活起来，比什么都重要。', '规矩是死的，你是活的。'],
  craft: ['不肯将就的人，配得上最好的。', '毫厘之间，见天见地。', '手艺人的心，你都懂。'],
  mystic: ['被误读，是深度的宿命。', '你比展签上写的多多了。', '留一点自己给自己。'],
};

/** 找出画像的主导维度（同分取更靠前者） */
export function dominantDim(dims: Dims, profile: Dims): Dimension {
  const order: Dimension[] = ['elegant', 'brave', 'calm', 'lively', 'craft', 'mystic'];
  let best: Dimension = 'elegant';
  let bestScore = -Infinity;
  for (const d of order) {
    const s = profile[d] * (1 + dims[d] / 10);
    if (s > bestScore) {
      bestScore = s;
      best = d;
    }
  }
  return best;
}

/** 生成 live 文物的一句身世 */
function buildIntro(description: string, kindName: string, dynasty: string, museumName: string): string {
  const dated = dynasty !== '年代不详' ? `${dynasty}的` : '';
  if (description) {
    // Wikidata 描述常为英文，保留其信息价值，句尾以中文大类收束
    const desc = description.charAt(0).toUpperCase() + description.slice(1);
    return `${desc}——${dated}${kindName}。现藏${museumName}——它等的人，今天进馆。`;
  }
  return `${dated}${kindName}，静静陈列于此。现藏${museumName}——它等的人，今天进馆。`;
}

export interface LiveArtifactInput {
  qid: string;
  name: string;
  description: string;
  /** Wikimedia Commons 文件名 */
  imageFile: string;
  classes: string[];
  inception: string | undefined;
  museumName: string;
  /** 用户画像（决定主导气质文案与留言） */
  profileDims: Dims;
  /** 确定性随机函数（由调用方构造） */
  rng: () => number;
}

/** 把 Wikidata 候选装配成完整 Artifact */
export function buildLiveArtifact(input: LiveArtifactInput): Artifact {
  const kind = detectKind(input.classes, `${input.name} ${input.description}`);
  const dynasty = formatDynasty(input.inception, input.description || '年代不详');
  const dominant = dominantDim(kind.dims, input.profileDims);
  const persona = DIMENSION_PERSONA[dominant];
  const messages = DIMENSION_MESSAGES[dominant];
  const message = messages[Math.floor(input.rng() * messages.length) % messages.length];
  const dated =
    dynasty !== '年代不详' && !input.description.includes(dynasty) ? `${dynasty}的` : '';

  return {
    id: `wd:${input.qid}`,
    name: input.name,
    dynasty,
    origin: `${input.museumName} 藏`,
    dims: kind.dims,
    intro: buildIntro(input.description, kind.name, dynasty, input.museumName),
    persona: `${persona}今日你循着「${input.museumName}」的名字而来，我在此等你多时——一件${dated}${kind.name}。${kind.voice}缘分这种事说不清，但在${input.museumName}的展品里，是我先认出了你。`,
    message,
    tags: [`#${kind.name}`, '#真实馆藏', '#今日有缘'],
    imageUrl: input.imageFile,
    live: true,
  };
}
