/**
 * [하위 호환성 유지 레이어 및 공통 유틸]
 * 실제 검증된 부동산 청약 실데이터(realData)를 제공합니다.
 */

export * from '@/lib/subscription/types';
export {
  REAL_SUBSCRIPTION_DATA,
  SCORE_TIER_GUIDE,
  SCORE_TIER_GUIDE as SCORE_TIER_GUIDES,
} from '@/lib/subscription/realData';

import { REAL_SUBSCRIPTION_DATA } from '@/lib/subscription/realData';
export const SUBSCRIPTION_MOCK_DATA = REAL_SUBSCRIPTION_DATA;
