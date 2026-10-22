/**
 * [하위 호환성 유지 레이어 및 공통 유틸]
 * 기존 임포트 경로를 유지하면서, 가짜 목업 데이터를 실제 검증된 실데이터(realData)로 완전 대체합니다.
 */

export * from '@/lib/subscription/types';
export {
  REAL_SUBSCRIPTION_DATA,
  REAL_IPO_DATA,
  SCORE_TIER_GUIDE,
  SCORE_TIER_GUIDE as SCORE_TIER_GUIDES,
} from '@/lib/subscription/realData';

// 기존 컴포넌트 하위 호환을 위한 실데이터 별칭(Alias)
import { REAL_SUBSCRIPTION_DATA, REAL_IPO_DATA } from '@/lib/subscription/realData';
export const SUBSCRIPTION_MOCK_DATA = REAL_SUBSCRIPTION_DATA;
export const IPO_MOCK_DATA = REAL_IPO_DATA;
