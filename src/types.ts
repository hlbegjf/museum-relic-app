/** 六维文物气质 */
export type Dimension = 'elegant' | 'brave' | 'calm' | 'lively' | 'craft' | 'mystic';

export type Dims = Record<Dimension, number>;

export interface Artifact {
  id: string;
  name: string;
  /** 朝代 / 年代 */
  dynasty: string;
  /** 馆藏地 / 出处 */
  origin: string;
  /** 所属内置博物馆 id；推演池文物为 undefined */
  museumId?: string;
  /** 是否属于世界文物推演池 */
  global?: boolean;
  /** 六维气质权重（0-3） */
  dims: Dims;
  /** 一句话身世 */
  intro: string;
  /** 第一人称拟人小传（文物对「你」说的话） */
  persona: string;
  /** 文物的一句话留言 */
  message: string;
  /** 气质标签 */
  tags: string[];
  /** Wikimedia Commons 实物图文件名（Wikidata 实时推演文物用） */
  imageUrl?: string;
  /** 是否为 Wikidata 实时推演的真实馆藏文物 */
  live?: boolean;
}

export interface Museum {
  id: string;
  name: string;
  city: string;
  tagline: string;
}

export interface QuizOption {
  label: string;
  scores: Partial<Dims>;
}

export interface QuizQuestion {
  id: string;
  scene: string;
  options: QuizOption[];
}

export interface Profile {
  dims: Dims;
  answers: number[];
  createdAt: number;
}

export interface CollectionRecord {
  museumKey: string;
  museumName: string;
  artifactId: string;
  affinity: number;
  timestamp: number;
  divined: boolean;
  /** 盖章时文物的完整快照（live 文物不在内置数据表中） */
  artifactSnapshot?: Artifact;
}

export interface MatchResult {
  artifact: Artifact;
  affinity: number;
  divined: boolean;
}
