import type { QuizQuestion } from '@/types';

/** 六道博物馆情境题：深夜闭馆之后，文物苏醒之时 */
export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    scene: '深夜闭馆后，你在博物馆里多待了一刻。四周沉入黑暗，只有一盏灯为你而亮——你希望它照见什么？',
    options: [
      {
        label: '一卷将展未展的法书，墨色里全是风骨',
        scores: { elegant: 2, calm: 1 },
      },
      {
        label: '一柄千年不锈的青铜剑，寒光尚在',
        scores: { brave: 2, craft: 1 },
      },
      {
        label: '一尊默然端坐的重鼎，腹中藏着铭文',
        scores: { calm: 2, mystic: 1 },
      },
      {
        label: '一只仰头大笑的说唱俑，眉眼弯弯',
        scores: { lively: 2, elegant: 1 },
      },
    ],
  },
  {
    id: 'q2',
    scene: '文物在夜里悄悄苏醒。它打量了你许久，终于开口，说出一句最像你的话——',
    options: [
      {
        label: '「你的眼睛里落过山河，一抬眼就是千年。」',
        scores: { elegant: 2, calm: 1 },
      },
      {
        label: '「你的骨头很硬，是敢替别人挡风的那种硬。」',
        scores: { brave: 2, calm: 1 },
      },
      {
        label: '「你不常说话，但你一开口，吵闹的人都安静了。」',
        scores: { calm: 2, mystic: 1 },
      },
      {
        label: '「你像一阵路过的风，谁也别想把你关住。」',
        scores: { lively: 2, mystic: 1 },
      },
    ],
  },
  {
    id: 'q3',
    scene: '守夜人递来一把钥匙，说今晚只能打开一扇库房门——你走向哪一间？',
    options: [
      {
        label: '书画库：万卷墨香，风骨犹存',
        scores: { elegant: 2, mystic: 1 },
      },
      {
        label: '兵器库：霜刃如雪，寒气逼人',
        scores: { brave: 2, craft: 1 },
      },
      {
        label: '礼乐库：钟磬编悬，正音涤心',
        scores: { calm: 2, craft: 1 },
      },
      {
        label: '机关库：一触即发，机巧无穷',
        scores: { craft: 2, lively: 1 },
      },
    ],
  },
  {
    id: 'q4',
    scene: '天亮之前，你必须守着一件文物直到日出。你选择——',
    options: [
      {
        label: '守一盏宫灯，看烟尘入壶，灯火不惊',
        scores: { craft: 2, calm: 1 },
      },
      {
        label: '守一窟壁画，与飞天对视到天明',
        scores: { mystic: 2, lively: 1 },
      },
      {
        label: '守一匹青铜马，听它踏碎梦里的风',
        scores: { lively: 2, brave: 1 },
      },
      {
        label: '守一方玉玺，替它再摸一摸江山',
        scores: { brave: 2, mystic: 1 },
      },
    ],
  },
  {
    id: 'q5',
    scene: '临别时，文物们要送你一件「气质信物」。你伸手接过的是——',
    options: [
      {
        label: '一枚朱文藏书印，纸上留名',
        scores: { elegant: 2, craft: 1 },
      },
      {
        label: '一段错金铜条，纹路至今无人解尽',
        scores: { craft: 2, mystic: 1 },
      },
      {
        label: '一颗五色石，女娲补天剩下的那种',
        scores: { mystic: 2, lively: 1 },
      },
      {
        label: '一枚陶哨，能吹出百鸟归林',
        scores: { lively: 2, elegant: 1 },
      },
    ],
  },
  {
    id: 'q6',
    scene: '千年之后，你也成了一件文物。后人隔着玻璃看你，说明牌上写着——',
    options: [
      {
        label: '「无名匠作，出土时仍有体温」',
        scores: { craft: 2, mystic: 1 },
      },
      {
        label: '「不语之物，观之安心」',
        scores: { calm: 2, elegant: 1 },
      },
      {
        label: '「来历成谜，谁也说不清」',
        scores: { mystic: 2, brave: 1 },
      },
      {
        label: '「曾立于门庭，寸步未退」',
        scores: { brave: 2, calm: 1 },
      },
    ],
  },
];
