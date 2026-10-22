export type RegionType = '서울' | '경기' | '인천';
export type DealType = '매매' | '전세';
export type SubscriptionStatus = '접수중' | '접수예정' | '마감';

export interface SubscriptionItem {
  id: string;
  complexName: string;
  projectZone: string;
  region: RegionType;
  district: string;
  dealType: DealType;
  supplyType: string;
  priceDisplay: string;
  priceNumericManwon: number;
  totalHouseholds: number;
  generalSupplyHouseholds: number;
  applicationPeriod: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  winnerAnnouncementDate: string;
  competitionRate: string;
  minSafeScore: number;
  keyFeatures: string[];
  resaleRestriction: string;
  residenceObligation: string;
  sourceType?: 'GOV_API' | 'LIVE_PUBLIC_DATA';
}

export interface IpoItem {
  id: string;
  companyName: string;
  market: 'KOSPI' | 'KOSDAQ';
  sector: string;
  offeringPrice: number;
  offeringPriceDisplay: string;
  desiredPriceBand: string;
  underwriters: string[];
  subscriptionPeriod: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  refundDate: string; // YYYY-MM-DD
  listingDate: string;
  institutionalCompetitionRate: string;
  lockupRatio: string;
  equalAllocationEstShares: string;
  minSubscriptionShares: number;
  refundDays: number;
  summary: string;
  sourceType?: 'GOV_API' | 'LIVE_PUBLIC_DATA';
}

export interface ScoreTierGuide {
  minScore: number;
  maxScore: number;
  tierLabel: string;
  badgeColor: string;
  targetZones: string;
  headline: string;
  detailedAdvice: string;
  recommendedStrategy: string[];
}

/**
 * 기준일 대비 청약 시작일/종료일을 비교해 D-Day 라벨과 상태값을 반환합니다.
 */
export function calculateDDayInfo(
  startDateStr: string,
  endDateStr: string,
  referenceDateStr?: string
): {
  label: string;
  status: SubscriptionStatus;
  daysDiff: number;
} {
  const ref = referenceDateStr ? new Date(`${referenceDateStr}T00:00:00`) : new Date();
  // 시간대 보정 (한국 기준 00:00)
  ref.setHours(0, 0, 0, 0);

  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffToStart = Math.round((start.getTime() - ref.getTime()) / msPerDay);
  const diffToEnd = Math.round((end.getTime() - ref.getTime()) / msPerDay);

  if (diffToStart > 0) {
    return {
      label: `D-${diffToStart}`,
      status: '접수예정',
      daysDiff: diffToStart,
    };
  }

  if (diffToEnd >= 0) {
    return {
      label: diffToStart === 0 ? 'D-Day' : '청약중',
      status: '접수중',
      daysDiff: 0,
    };
  }

  return {
    label: '마감',
    status: '마감',
    daysDiff: diffToEnd,
  };
}
