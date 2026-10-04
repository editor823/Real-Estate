/**
 * 정비사업 8단계 법정 진행 단계 및 상태 정의
 */
export interface StageInfo {
  code: string;
  name: string;
  weight: number;
  hex: string;
  bgClass: string;
  textClass: string;
  description: string;
}

export const STAGES: Record<string, StageInfo> = {
  CANDIDATE: {
    code: "CANDIDATE",
    name: "후보지 선정",
    weight: 1,
    hex: "#FACC15",
    bgClass: "bg-yellow-400",
    textClass: "text-yellow-950",
    description: "초기 공모 및 대상지 선정 단계 (미확정)",
  },
  DESIGNATED: {
    code: "DESIGNATED",
    name: "구역지정 고시",
    weight: 2,
    hex: "#FB923C",
    bgClass: "bg-orange-400",
    textClass: "text-orange-950",
    description: "정비구역 공식 지정 및 정비계획 수립",
  },
  PROMOT_COMM: {
    code: "PROMOT_COMM",
    name: "추진위 승인",
    weight: 3,
    hex: "#F97316",
    bgClass: "bg-orange-500",
    textClass: "text-white",
    description: "공공지원 및 조합설립추진위원회 승인",
  },
  UNION_AUTH: {
    code: "UNION_AUTH",
    name: "조합설립 인가",
    weight: 4,
    hex: "#3B82F6",
    bgClass: "bg-blue-500",
    textClass: "text-white",
    description: "본격 사업 주체 확립 (지위양도 제한 검토)",
  },
  BIZ_PLAN: {
    code: "BIZ_PLAN",
    name: "사업시행 인가",
    weight: 5,
    hex: "#6366F1",
    bgClass: "bg-indigo-500",
    textClass: "text-white",
    description: "건축 심의 및 사업시행계획 확정",
  },
  MGMT_DISP: {
    code: "MGMT_DISP",
    name: "관리처분 인가",
    weight: 6,
    hex: "#8B5CF6",
    bgClass: "bg-purple-500",
    textClass: "text-white",
    description: "조합원 분양 및 철거/이주 직전 단계",
  },
  CONSTRUCTION: {
    code: "CONSTRUCTION",
    name: "착공",
    weight: 7,
    hex: "#10B981",
    bgClass: "bg-emerald-500",
    textClass: "text-white",
    description: "철거 완료 및 아파트 착공",
  },
  COMPLETED: {
    code: "COMPLETED",
    name: "준공 / 입주",
    weight: 8,
    hex: "#059669",
    bgClass: "bg-emerald-600",
    textClass: "text-white",
    description: "아파트 준공 및 입주 완료",
  },
  DISSOLVED: {
    code: "DISSOLVED",
    name: "구역 해제",
    weight: 99,
    hex: "#94A3B8",
    bgClass: "bg-slate-400",
    textClass: "text-slate-900",
    description: "사업 취소 또는 일몰제 적용 해제",
  },
};

export const BIZ_TYPES = [
  { value: "ALL", label: "전체 사업 유형" },
  { value: "REDEVELOPMENT", label: "재개발" },
  { value: "RECONSTRUCTION", label: "재건축" },
  { value: "SINTHONG", label: "신속통합기획" },
  { value: "MOA", label: "모아타운" },
] as const;
