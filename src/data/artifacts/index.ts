import type { Artifact } from '@/types';
import { ARTIFACTS_CN_1 } from './cn1';
import { ARTIFACTS_CN_2 } from './cn2';
import { ARTIFACTS_GLOBAL } from './global';

/** 全部内置策展文物（15 座博物馆） */
export const CURATED_ARTIFACTS: Artifact[] = [...ARTIFACTS_CN_1, ...ARTIFACTS_CN_2];

/** 世界文物推演池 */
export const GLOBAL_ARTIFACTS: Artifact[] = ARTIFACTS_GLOBAL;

/** 全部文物 */
export const ALL_ARTIFACTS: Artifact[] = [...CURATED_ARTIFACTS, ...GLOBAL_ARTIFACTS];

export const ARTIFACT_BY_ID: Record<string, Artifact> = Object.fromEntries(
  ALL_ARTIFACTS.map((a) => [a.id, a]),
);

/** 按博物馆 id 取专属策展文物 */
export function artifactsOfMuseum(museumId: string): Artifact[] {
  return CURATED_ARTIFACTS.filter((a) => a.museumId === museumId);
}
