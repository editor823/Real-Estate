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
 * 기준일(기본값: 현재 로컬 날짜, 데모 일관성을 위해 2026-10-22 기준 폴백 지원) 대비
 * 청약 시작일/종료일을 비교해 D-Day 라벨과 상태값을 반환합니다.
 */
export function calculateDDayInfo(
  startDateStr: string,
  endDateStr: string,
  referenceDateStr: string = '2026-10-22'
): {
  label: string;
  status: SubscriptionStatus;
  daysDiff: number;
} {
  const ref = new Date(`${referenceDateStr}T00:00:00`);
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

/**
 * 최신 수도권 아파트 분양(매매) 및 임대(전세) 예정 단지 5건 초기 데이터
 */
export const SUBSCRIPTION_MOCK_DATA: SubscriptionItem[] = [
  {
    id: 'apt-seoul-01',
    complexName: '디에이치 방배 (방배5구역 재건축)',
    projectZone: '서초구 방배5구역 주택재건축정비사업',
    region: '서울',
    district: '서초구 방배동',
    dealType: '매매',
    supplyType: '일반분양 (분양가상한제)',
    priceDisplay: '22억 4,500만 (84㎡ 기준)',
    priceNumericManwon: 224500,
    totalHouseholds: 3064,
    generalSupplyHouseholds: 1244,
    applicationPeriod: '2026.10.26 ~ 2026.10.28',
    startDate: '2026-10-26',
    endDate: '2026-10-28',
    winnerAnnouncementDate: '2026-11-05',
    competitionRate: '예상 95.4 : 1',
    minSafeScore: 69,
    keyFeatures: [
      '분양가상한제 적용 단지 (인근 시세 대비 약 5~6억 안전마진 추산)',
      '실거주 의무 유예 적용 가능 및 전매제한 3년',
      '4·7호선 이수역·내방역 더블 역세권 대단지 브랜드 타운',
    ],
    resaleRestriction: '당첨자 발표일로부터 3년',
    residenceObligation: '최초 입주가능일로부터 3년 유예 가능',
  },
  {
    id: 'apt-seoul-02',
    complexName: '잠실 르엘 (미성·크로바 재건축)',
    projectZone: '송파구 미성·크로바아파트 재건축정비사업',
    region: '서울',
    district: '송파구 신천동',
    dealType: '매매',
    supplyType: '일반분양 (분양가상한제)',
    priceDisplay: '20억 8,000만 (84㎡ 기준)',
    priceNumericManwon: 208000,
    totalHouseholds: 1865,
    generalSupplyHouseholds: 241,
    applicationPeriod: '2026.10.22 ~ 2026.10.24',
    startDate: '2026-10-22',
    endDate: '2026-10-24',
    winnerAnnouncementDate: '2026-11-02',
    competitionRate: '128.6 : 1 (집계중)',
    minSafeScore: 72,
    keyFeatures: [
      '2·8호선 잠실역 및 8호선 몽촌토성역 초역세권 입지',
      '잠실권역 희소 신축 공급으로 70점 이상 고가점 통장 집중 예상',
      '인근 파크리오·잠실엘스 대비 약 7억 원 이상 시세차익 기대',
    ],
    resaleRestriction: '당첨자 발표일로부터 3년',
    residenceObligation: '최초 입주가능일로부터 2년',
  },
  {
    id: 'apt-seoul-03',
    complexName: '올림픽파크 포레온 SH 장기전세주택2 (미리내집)',
    projectZone: '강동구 둔촌주공아파트 주택재건축정비사업 기부채납분',
    region: '서울',
    district: '강동구 둔촌동',
    dealType: '전세',
    supplyType: '장기전세주택 (최장 20년 거주)',
    priceDisplay: '전세 4억 2,000만 (59㎡ 기준)',
    priceNumericManwon: 42000,
    totalHouseholds: 12032,
    generalSupplyHouseholds: 300,
    applicationPeriod: '2026.10.29 ~ 2026.10.31',
    startDate: '2026-10-29',
    endDate: '2026-10-31',
    winnerAnnouncementDate: '2026-11-18',
    competitionRate: '예상 64.2 : 1',
    minSafeScore: 54,
    keyFeatures: [
      '시세의 50~60% 수준 전세보증금으로 최장 20년 안정 거주 가능',
      '거주 중 자녀 출산 시 우선매수청구권(시세 80~90% 수준) 부여 혜택',
      '5호선·9호선 둔촌동역 및 올림픽공원 인접 매머드급 1.2만 세대 단지',
    ],
    resaleRestriction: '임차권 양도 및 전대 엄격 금지',
    residenceObligation: '입주 지정 기간 내 즉시 전입 및 실거주 필수',
  },
  {
    id: 'apt-gyeonggi-01',
    complexName: '산성역 헤리스톤 (산성구역 재개발)',
    projectZone: '성남시 수정구 산성구역 주택재개발정비사업',
    region: '경기',
    district: '성남시 수정구',
    dealType: '매매',
    supplyType: '일반분양 (비규제지역)',
    priceDisplay: '11억 6,800만 (84㎡ 기준)',
    priceNumericManwon: 116800,
    totalHouseholds: 3487,
    generalSupplyHouseholds: 1224,
    applicationPeriod: '2026.11.03 ~ 2026.11.05',
    startDate: '2026-11-03',
    endDate: '2026-11-05',
    winnerAnnouncementDate: '2026-11-12',
    competitionRate: '예상 32.8 : 1',
    minSafeScore: 58,
    keyFeatures: [
      '8호선 산성역 초역세권 및 위례·잠실 생활권 직결 입지',
      '대우·GS·SK에코플랜트 컨소시엄 3,487세대 랜드마크 대단지',
      '비규제지역 적용으로 전용 85㎡ 이하 추첨제 60% 물량 배정',
    ],
    resaleRestriction: '당첨자 발표일로부터 1년',
    residenceObligation: '실거주 의무 없음',
  },
  {
    id: 'apt-incheon-01',
    complexName: '송도 자이 풍경채 그라노블 (11공구 RC10·11)',
    projectZone: '인천경제자유구역 송도국제도시 11공구 첨단산업클러스터',
    region: '인천',
    district: '연수구 송도동',
    dealType: '전세',
    supplyType: '분양전환형 공공지원 민간임대 (전세형)',
    priceDisplay: '전세 3억 8,500만 (84㎡ 기준)',
    priceNumericManwon: 38500,
    totalHouseholds: 3270,
    generalSupplyHouseholds: 540,
    applicationPeriod: '2026.10.18 ~ 2026.10.20',
    startDate: '2026-10-18',
    endDate: '2026-10-20',
    winnerAnnouncementDate: '2026-10-27',
    competitionRate: '18.4 : 1 (최종)',
    minSafeScore: 45,
    keyFeatures: [
      '청약통장 유무와 무관하게 만 19세 이상 무주택 세대구성원 신청 가능',
      '8년 전세형 거주 후 우선 분양전환 협의 가능 및 임대료 상승률 연 5% 이내 제한',
      '송도 11공구 워터프런트 및 바이오 클러스터 배후 주거단지',
    ],
    resaleRestriction: '임대 기간 중 임차권 양도 제한',
    residenceObligation: '계약 후 입주 지정일 내 전입신고 필수',
  },
];

/**
 * 공모주 청약 일정 5건 초기 데이터
 */
export const IPO_MOCK_DATA: IpoItem[] = [
  {
    id: 'ipo-01',
    companyName: '케이뱅크 (Kbank)',
    market: 'KOSPI',
    sector: '인터넷전문은행 · 핀테크 플랫폼',
    offeringPrice: 10500,
    offeringPriceDisplay: '10,500원',
    desiredPriceBand: '9,500원 ~ 12,000원',
    underwriters: ['NH투자증권', 'KB증권', '뱅크오브아메리카'],
    subscriptionPeriod: '2026.10.22 ~ 2026.10.23',
    startDate: '2026-10-22',
    endDate: '2026-10-23',
    refundDate: '2026-10-27',
    listingDate: '2026-11-05',
    institutionalCompetitionRate: '842.6 : 1',
    lockupRatio: '41.8%',
    equalAllocationEstShares: '예상 8~12주',
    minSubscriptionShares: 20,
    refundDays: 4,
    summary: '국내 1호 인터넷전문은행으로 여수신 밸런스 개선 및 플랫폼 중개수익 확대를 통한 흑자 기조 안착.',
  },
  {
    id: 'ipo-02',
    companyName: '리벨리온 (Rebellions)',
    market: 'KOSDAQ',
    sector: 'AI 추론용 NPU 반도체 설계 (팹리스)',
    offeringPrice: 38000,
    offeringPriceDisplay: '38,000원',
    desiredPriceBand: '32,000원 ~ 38,000원',
    underwriters: ['삼성증권', '한국투자증권'],
    subscriptionPeriod: '2026.10.26 ~ 2026.10.27',
    startDate: '2026-10-26',
    endDate: '2026-10-27',
    refundDate: '2026-10-29',
    listingDate: '2026-11-06',
    institutionalCompetitionRate: '1,385.2 : 1',
    lockupRatio: '56.4%',
    equalAllocationEstShares: '예상 1~2주',
    minSubscriptionShares: 10,
    refundDays: 2,
    summary: '차세대 데이터센터향 AI 추론 칩 ATOM·REBEL 양산 본격화, 기관 수요예측 밴드 최상단 확정.',
  },
  {
    id: 'ipo-03',
    companyName: '더본바이오로직스',
    market: 'KOSDAQ',
    sector: '항체-약물접합체(ADC) 신약 및 CDMO',
    offeringPrice: 24000,
    offeringPriceDisplay: '24,000원',
    desiredPriceBand: '20,000원 ~ 24,000원',
    underwriters: ['미래에셋증권', '대신증권'],
    subscriptionPeriod: '2026.10.29 ~ 2026.10.30',
    startDate: '2026-10-29',
    endDate: '2026-10-30',
    refundDate: '2026-11-03',
    listingDate: '2026-11-11',
    institutionalCompetitionRate: '1,120.4 : 1',
    lockupRatio: '38.5%',
    equalAllocationEstShares: '예상 1~3주',
    minSubscriptionShares: 10,
    refundDays: 4,
    summary: '글로벌 빅파마 대상 ADC 링커 기술이전 트랙레코드 보유, 주말 경유 환불 일정(4일)으로 비례 이자비용 유의 필요.',
  },
  {
    id: 'ipo-04',
    companyName: '서울로보틱스 (Seoul Robotics)',
    market: 'KOSDAQ',
    sector: '자율주행 라이다(LiDAR) 3D 인지 소프트웨어',
    offeringPrice: 19000,
    offeringPriceDisplay: '19,000원',
    desiredPriceBand: '16,500원 ~ 19,000원',
    underwriters: ['삼성증권'],
    subscriptionPeriod: '2026.11.04 ~ 2026.11.05',
    startDate: '2026-11-04',
    endDate: '2026-11-05',
    refundDate: '2026-11-07',
    listingDate: '2026-11-16',
    institutionalCompetitionRate: '965.0 : 1',
    lockupRatio: '32.1%',
    equalAllocationEstShares: '예상 2~4주',
    minSubscriptionShares: 10,
    refundDays: 2,
    summary: '글로벌 완성차 공장 물류 자동화(레벨5 관제) 솔루션을 공급하는 산업용 자율주행 SW 선도 기업.',
  },
  {
    id: 'ipo-05',
    companyName: '에이치엠파워텍',
    market: 'KOSPI',
    sector: '초고압 변압기 및 ESS 전력망 인프라',
    offeringPrice: 52000,
    offeringPriceDisplay: '52,000원',
    desiredPriceBand: '44,000원 ~ 50,000원 (상단초과)',
    underwriters: ['한국투자증권', '신한투자증권', '하나증권'],
    subscriptionPeriod: '2026.10.15 ~ 2026.10.16',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    refundDate: '2026-10-20',
    listingDate: '2026-10-27',
    institutionalCompetitionRate: '1,540.8 : 1',
    lockupRatio: '62.7%',
    equalAllocationEstShares: '평균 1.4주 (배정완료)',
    minSubscriptionShares: 10,
    refundDays: 4,
    summary: '북미 AI 데이터센터 전력망 교체 주기에 따른 수주잔고 4년치 확보, 희망밴드 상단 초과 확정.',
  },
];

/**
 * 청약 가점 점수대별 서울 주요 정비사업 구역 진단 가이드
 */
export const SCORE_TIER_GUIDES: ScoreTierGuide[] = [
  {
    minScore: 70,
    maxScore: 84,
    tierLabel: '강남3구 · 용산 최상위 안정권',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    targetZones: '서초(방배·반포), 강남(압구정·개포·대치), 송파(잠실), 용산(한남·이촌)',
    headline: '서울 최상급지 분양가상한제 정비사업 일반분양 당첨 안정권입니다.',
    detailedAdvice:
      '4인 가족 만점(69점)을 넘어서는 최상위권 가점으로, 수억 원 이상의 안전마진이 기대되는 반포·방배·잠실 등 강남권 재건축 핵심 단지의 전용 59㎡·84㎡ 주력 평형에 소신 지원이 가능합니다.',
    recommendedStrategy: [
      '분양가상한제가 적용되는 강남3구 및 용산 핵심 정비사업 일반분양 최우선 타겟팅',
      '동점자 발생 시 통장 가입일자가 빠른 순으로 당첨되므로 선 인기 타입(84㎡A 등) 적극 공략',
      '거주의무 유예 여부 및 잔금 대출 한도(DSR 및 중도금 이자 후불제 조건) 사전 점검',
    ],
  },
  {
    minScore: 64,
    maxScore: 69,
    tierLabel: '강남권 도전권 · 마용성 안정권',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    targetZones: '마포(아현·공덕), 성동(성수·왕십리), 강동(둔촌·고덕), 동작(흑석·노량진), 서초·송파(도전)',
    headline: '서울 주요 한강변 및 준강남 정비사업 안정권이며, 강남권은 타입별 눈치작전이 유효한 점수대입니다.',
    detailedAdvice:
      '4인 가구 기준 만점(69점)에 근접한 우수 가점입니다. 강남3구 인기 단지는 비인기 주택형(타워형 59㎡B/C 등) 전략 지원 시 당첨 가능성이 높으며, 마포·성동·동작·강동 등 핵심 재개발·재건축 단지는 안정적으로 당첨권에 진입합니다.',
    recommendedStrategy: [
      '강남3구 청약 시 경쟁이 몰리는 84㎡A 대신 59㎡ 소형 또는 84㎡ 타워형 타입으로 분산 지원',
      '노량진 뉴타운, 흑석 뉴타운, 성수·광진·강동권 대단지 정비사업은 주력 평형 안정 지원 가능',
      '부양가족 직계존속 요건(3년 이상 동일 주민등록등본 등재 및 무주택 여부)을 최종 점검하여 부적격 리스크 원천 차단',
    ],
  },
  {
    minScore: 55,
    maxScore: 63,
    tierLabel: '서울 주요구 안정권 · 한강변 도전권',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    targetZones: '영등포(여의도·신길), 동대문(이문·휘경·청량리), 은평(대조·갈현), 서대문(북아현), 성남·과천·광명',
    headline: '서울 주요 재개발 뉴타운 및 경기 최상급지(성남·과천·광명) 일반분양 당첨 유력권입니다.',
    detailedAdvice:
      '3인 가구 만점(64점) 전후 구간으로, 서울 동북권·서남권·서북권 대규모 재개발 구역(이문·휘경, 노량진, 신길, 북아현 등)과 성남 산성·광명 뉴타운 등 수도권 핵심 정비사업지에서 충분히 승산이 있는 점수입니다.',
    recommendedStrategy: [
      '서울 비강남권 대단지 재개발(1,000세대 이상) 일반분양 물량 집중 공략',
      '비규제지역 전용 85㎡ 이하(가점 40% + 추첨 60%) 단지에서 가점제 및 추첨제 동시 당첨 확률 극대화',
      '장기전세주택2(미리내집) 등 서울 핵심지 시세 반값 전세 물량도 병행 검토',
    ],
  },
  {
    minScore: 45,
    maxScore: 54,
    tierLabel: '수도권 주요 정비사업 도전권 · 추첨 병행권',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    targetZones: '서울 외곽 정비사업(관악·중랑·강북·금천), 경기(수원·안양·의왕·구리), 인천(송도·용현학익)',
    headline: '가점제 단독 당첨보다는 비규제 추첨제 물량(60%) 및 타입 다변화 전략이 필요한 구간입니다.',
    detailedAdvice:
      '서울 핵심지 가점제 커트라인에는 다소 못 미치지만, 비규제지역(서울 강남3구·용산 외 전역 및 경기·인천)은 전용 85㎡ 이하에서도 60%를 추첨제로 선발하므로 가점제 낙첨 후 자동 전환되는 추첨제 기회를 적극 노릴 수 있습니다.',
    recommendedStrategy: [
      '비규제지역(마포·성동·강동·동작 포함 서울 21개구 및 경기·인천) 전용 85㎡ 이하(추첨 60%) 및 85㎡ 초과(추첨 100% 또는 80%) 집중 공략',
      '신혼부부·생애최초·다자녀·신생아 특별공급 자격 해당 여부를 반드시 1순위로 먼저 검토',
      '무주택 기간 및 통장 가입기간이 추가로 채워질 때까지 공공지원 민간임대/장기전세로 주거 안정 확보',
    ],
  },
  {
    minScore: 0,
    maxScore: 44,
    tierLabel: '추첨제 · 특별공급 · 장기전세 집중 전략권',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    targetZones: '수도권 비규제 추첨제 물량, 생애최초·신혼·신생아 특별공급, SH/GH 장기전세 및 민간임대',
    headline: '일반공급 가점제보다는 추첨제·특별공급 및 무통장 민간임대/장기전세 공략이 유리합니다.',
    detailedAdvice:
      '1~2인 가구 또는 무주택 기간이 짧은 사회초년생·신혼부부에게 흔히 나타나는 점수대입니다. 가점제 경쟁 대신 추첨제 비중이 높은 비규제지역 평형과 특별공급(생애최초, 신혼부부, 신생아 특공)을 활용하면 낮은 가점으로도 서울·수도권 신축 입성이 가능합니다.',
    recommendedStrategy: [
      '생애최초·신혼부부·신생아 특별공급 자격 요건(소득·자산 기준 및 추첨 물량 30%) 최우선 활용',
      '비규제지역 전용 85㎡ 이하(추첨 60%) 및 전용 85㎡ 초과 중대형 평형(추첨 100%) 지원으로 가점 한계 극복',
      '청약통장 가점을 유지·축적하면서 SH 미리내집(장기전세) 또는 분양전환형 민간임대 병행 지원',
    ],
  },
];
