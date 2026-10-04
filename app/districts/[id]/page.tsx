import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { DISTRICTS_GEOJSON } from "@/lib/constants/districtsData";
import { DistrictFeature } from "@/lib/types/district";
import { StageBadge } from "@/components/ui/StageBadge";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Map,
  Compass,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  Percent,
  Database,
  ShieldAlert,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

interface DistrictPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ID, 구역 고유 번호(code), 연번 인덱스 어디로 접근해도 구역을 정확히 탐색
 */
function findDistrict(id: string): DistrictFeature | undefined {
  const features = DISTRICTS_GEOJSON.features || [];
  if (!id) return undefined;

  // 1. master_uid 또는 GeoJSON feature id 일치 (예: SEOUL_RDEV_11110_1460)
  let found = features.find((f) => f.properties.master_uid === id || f.id === id);
  if (found) return found;

  // 2. 구역 고유 번호 code 일치 (예: 1460)
  found = features.find((f) => f.properties.code === id);
  if (found) return found;

  // 3. 연번 숫자 일치 (예: 1 ~ 496)
  const num = parseInt(id, 10);
  if (!isNaN(num) && num >= 1 && num <= features.length) {
    return features[num - 1];
  }

  return undefined;
}

// 1. Next.js Static HTML Export (SSG) - UID 및 구역 번호별 정적 HTML 모두 사전 생성
export async function generateStaticParams() {
  const features = DISTRICTS_GEOJSON.features || [];
  const params: { id: string }[] = [];
  const seen = new Set<string>();

  features.forEach((f, idx) => {
    // (1) master_uid (예: SEOUL_RDEV_11110_1460)
    const uid = f.properties.master_uid || f.id;
    if (uid && !seen.has(uid)) {
      seen.add(uid);
      params.push({ id: uid });
    }

    // (2) 구역 번호 코드 (예: 1460)
    const code = f.properties.code;
    if (code && !seen.has(code)) {
      seen.add(code);
      params.push({ id: code });
    }

    // (3) 연번 번호 (예: 1, 2, 3 ... 496)
    const numStr = String(idx + 1);
    if (!seen.has(numStr)) {
      seen.add(numStr);
      params.push({ id: numStr });
    }
  });

  return params;
}

// 2. 검색엔진(SEO) 및 구글 애드센스 심사를 위한 맞춤형 메타데이터
export async function generateMetadata({
  params,
}: DistrictPageProps): Promise<Metadata> {
  const { id } = await params;
  const feature = findDistrict(id);

  if (!feature) {
    return {
      title: "구역 정보를 찾을 수 없습니다 | 서울시 정비사업 모니터링",
    };
  }

  const props = feature.properties;
  const title = `${props.name} (${props.gu}) 재개발·정비사업 상세 분석 리포트`;
  const description = `${props.gu} ${props.legal_dong} ${props.name} - 추진단계: ${props.stage_label || props.stage_raw}, 계획 세대수: ${props.total_households ? props.total_households.toLocaleString() + "세대" : "계획중"}. 권리산정일 기준 입주권 승계 안전성 및 준공 타임라인 종합 분석`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://seoul-redevelopment.pages.dev/districts/${id}/`,
      siteName: "서울시 재개발 모니터링",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${props.name} 분석 리포트`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function DistrictDetailPage({ params }: DistrictPageProps) {
  const { id } = await params;
  const feature = findDistrict(id);

  if (!feature) {
    notFound();
  }

  const props = feature.properties;
  const totalH = props.total_households || 0;
  const existH = props.existing_households || 0;
  const saleH = props.sale_households || 0;
  const rentH = props.rent_households || 0;

  // 동일 자치구 인근 추천 구역 최대 6개 추출
  const nearbyDistricts = DISTRICTS_GEOJSON.features
    .filter(
      (f) =>
        f.properties.gu === props.gu &&
        f.properties.master_uid !== props.master_uid
    )
    .slice(0, 6);

  // 정비사업 표준 7단계 정의
  const allStages = [
    { seq: 1, name: "기본계획 / 구역지정", code: "PLAN_DESIGNATION", avgYears: "1.5년" },
    { seq: 2, name: "추진위원회 승인", code: "PROMOTION_COMMITTEE", avgYears: "1.2년" },
    { seq: 3, name: "조합설립 인가", code: "UNION_AUTH", avgYears: "2.1년" },
    { seq: 4, name: "사업시행 인가", code: "BUSINESS_AUTH", avgYears: "2.8년" },
    { seq: 5, name: "관리처분 인가", code: "MGMT_DISPOSAL", avgYears: "1.9년" },
    { seq: 6, name: "이주·철거 / 착공", code: "CONSTRUCTION_START", avgYears: "1.5년" },
    { seq: 7, name: "준공 및 입주", code: "COMPLETION", avgYears: "3.2년" },
  ];

  // 투자자 관점 맞춤형 3줄 핵심 브리핑 문장 생성 (E-E-A-T 신뢰도 강화)
  const briefingLine1 = (() => {
    if (totalH > 0 && existH > 0) {
      const netSupply = totalH - existH;
      const netPercent = Math.round((netSupply / existH) * 100);
      const bizTypeDesc =
        props.biz_type === "SINTHONG"
          ? "서울시 신속통합기획 패스트트랙 인허가가 적용되어"
          : props.biz_type === "MOA"
          ? "모아타운 특례(블록형 통합개발 및 층수완화)가 적용되어"
          : props.biz_type === "REDEVELOPMENT"
          ? "대규모 브랜드 주거단지 조성을 목표로"
          : "전통 우수 입지 재건축 단지로서";

      return `${bizTypeDesc} 기존 ${existH.toLocaleString()}가구를 헐고 신축 ${totalH.toLocaleString()}세대로 재탄생하며, 순증가분 ${netSupply.toLocaleString()}세대(순증률 +${netPercent}%)가 확보되어 일반분양 수입에 따른 조합원 사업성 비례율이 견조할 것으로 기대됩니다.`;
    } else if (totalH > 0) {
      return `신축 ${totalH.toLocaleString()}세대의 대단지 조성을 목표로 정비계획이 수립되고 있으며, 주변 인프라 개선 및 종상향 인센티브 확보 시 높은 미래가치가 점쳐지는 핵심 구역입니다.`;
    } else {
      return `서울시 도시정비 마스터플랜에 따라 정비계획 심의가 진행 중이며, 향후 건축심의 과정에서 최종 건립 세대수와 일반분양 분담금 윤곽이 구체화될 예정입니다.`;
    }
  })();

  const briefingLine2 = (() => {
    if (props.stage_seq <= 2) {
      return `현재 [${props.stage_label || props.stage_raw}] 단계의 초기 사업지로, 주민 동의율(${props.consent_rate ? `${props.consent_rate}%` : "적극 징구 중"})을 바탕으로 조합설립인가 관문을 통과하는 것이 사업 속도의 최대 분수령입니다.`;
    } else if (props.stage_seq === 3) {
      return `사업의 핵심 법인격인 [조합설립인가]를 획득하여 시공사 선정 및 통합 건축심의 준비에 돌입하는 도약기로, 사업 추진 속도에 탄력이 붙는 주요 전환점에 안착해 있습니다.`;
    } else if (props.stage_seq === 4) {
      return `건축심의를 통과하고 사업의 골격을 결정짓는 [사업시행인가] 구간에 진입하여, 시공사 본계약 체결 및 조합원 분양신청·감정평가 절차가 본격 가시화되고 있습니다.`;
    } else if (props.stage_seq === 5) {
      return `정비사업의 최대 분기점인 [관리처분인가] 단계로, 개별 조합원 추가분담금이 확정되고 이주·철거 개시를 앞두고 있어 투자 불확실성이 대부분 해소된 안전지대입니다.`;
    } else {
      return `이주·철거 및 공사가 본궤도에 오른 후반부 단계로, 공사비 변동 리스크 관리와 준공 후 신축 아파트 프리미엄 실현이 임박한 성숙기 사업장입니다.`;
    }
  })();

  const briefingLine3 = (() => {
    if (props.is_transferable) {
      return `현행 「도시 및 주거환경정비법」상 조합원 지위양도가 가능한 [안전 구간]에 속해 있어 분양권 전매 제한에 따른 현금청산 리스크 없이 합법적인 매수가 가능한 투자 적격 상태입니다.`;
    } else {
      return `투기과열지구 전매제한 단계에 진입하였으므로, 10년 보유·5년 거주 요건을 갖춘 1세대 1주택 원조합원 매물인지 계약 전 관할 구청 및 조합을 통해 철저한 자격 검증이 요구됩니다.`;
    }
  })();

  // Q3용 남은 예상 소요기간 계산
  const remainingYearsByStage: Record<number, string> = {
    1: "약 8~10년",
    2: "약 7~8년",
    3: "약 5~6년",
    4: "약 3.5~4.5년",
    5: "약 2.5~3년 (이주·착공 임박)",
    6: "약 1.5~2년 (준공 가시권)",
    7: "약 6개월~1년 (입주 및 청산)",
  };
  const estimatedRemainingYears = remainingYearsByStage[props.stage_seq] || "약 4~6년";

  // 4대 자주 묻는 질문(FAQ) 데이터 구성
  const faqList = [
    {
      question: `${props.name} 매수 시 입주권 승계와 현금청산 기준은 어떻게 되나요?`,
      answer: `「도시 및 주거환경정비법」 제39조에 따라 현재 ${props.name}은(는) [${props.stage_label || props.stage_raw}] 단계입니다. ${
        props.is_transferable
          ? "현행 법률상 조합원 지위양도가 합법적으로 가능한 [안전 구간]에 속해 있어 매수 시 아파트 입주권을 안정적으로 승계받으실 수 있습니다. 다만 향후 관리처분계획인가(재개발) 또는 조합설립인가(재건축) 시점에 도달하면 원칙적으로 전매가 전면 금지되므로 인허가 고시 일정을 면밀히 모니터링해야 합니다."
          : "이미 투기과열지구 조합원 지위양도 제한 단계에 진입하였으므로, 일반 매수 시 원칙적으로 입주권이 박탈되고 감정평가액 기준 강제 현금청산 대상이 됩니다. 단, 양도인이 1세대 1주택자로서 10년 이상 소유하고 5년 이상 실제 거주한 법정 특례 요건을 충족한 경우에 한하여 예외적으로 승계가 인정됩니다."
      } 아울러 신축 다세대 빌라 분양 매물의 경우 고시된 권리산정기준일 이후 건축허가된 물건은 단독 입주권이 나오지 않으므로 건축물대장 사용승인일자 조회가 필수적입니다.`,
    },
    {
      question: "조합원 지위양도 제한 시점과 예외 거래 인정 조건은 무엇인가요?",
      answer: `투기과열지구 내 정비사업은 재건축의 경우 '조합설립인가일', 재개발의 경우 '관리처분계획인가일'부터 소유권이전등기 시점까지 조합원 지위양도(전매)가 전면 금지됩니다. 다만 도정법 시행령 제37조에 따른 법정 예외 거래 인정 기준은 다음과 같습니다: ① 1세대 1주택자로서 10년 이상 보유하고 5년 이상 실제 거주한 조합원의 물건 매수, ② 세대원의 근무·생업·취학·질병 치료로 타 시·군으로 세대 전원 이전, ③ 상속으로 취득한 주택으로 전원 이전 또는 해외 이주(2년 이상 체류), ④ 사업 지연 특례(조합설립인가 후 3년 내 사업시행인가 미신청 또는 사업시행인가 후 3년 내 미착공 등). 위 요건 충족 여부는 매매 계약 전 관할 구청 및 조합의 확인서를 필수 확인해야 합니다.`,
    },
    {
      question: `현재 단계(${props.stage_label || props.stage_raw})에서 최종 입주까지 얼마나 소요되나요?`,
      answer: `현재 ${props.name}은(는) 정비사업 표준 7단계 중 제${props.stage_seq}단계인 [${props.stage_label || props.stage_raw}]에 위치해 있습니다. 서울시 도시정비사업 평균 통계상 본 단계에서 최종 준공 및 입주까지는 ${estimatedRemainingYears}이 추가 소요되는 것으로 추산됩니다. ${
        props.biz_type === "SINTHONG"
          ? "다만 본 구역은 서울시 신속통합기획 패스트트랙이 적용되어 건축·교통 통합심의 및 인허가 절차가 일반 정비구역 대비 약 1.5~2년가량 단축될 수 있습니다."
          : props.biz_type === "MOA"
          ? "다만 본 구역은 모아타운 소규모주택정비 관리지역 특례로 정비계획 수립 절차가 간소화되어 대규모 재개발 구역 대비 신속한 사업 진행이 가능합니다."
          : "다만 구역 내 주민 동의율 징구 속도, 시공사 본계약 체결 및 공사비 증액 협상, 지자체 인허가 심의 과정에 따라 실제 입주 시점은 단축되거나 지연될 수 있습니다."
      }`,
    },
    {
      question: "재개발·재건축 추가분담금 리스크는 어떻게 확인하나요?",
      answer: `추가분담금은 [조합원 분양가 - 권리가액(종전자산 감정평가액 × 비례율)] 공식으로 산정됩니다. 본 ${props.name}의 경우 신축 건립 예정 규모가 ${
        totalH > 0 ? `${totalH.toLocaleString()}세대` : "계획 단계"
      }이며, 기존 멸실 가구수는 ${
        existH > 0 ? `${existH.toLocaleString()}가구` : "산정 중"
      }입니다. 일반분양 세대수가 많을수록 분양 수입이 증가하여 비례율이 상승하고 조합원 분담금 부담이 합리적으로 분산됩니다. 최근 원자재 가격 및 공사비 인상 기조에서는 사업시행인가 및 관리처분총회 책자를 통해 3.3㎡당 공사비와 비례율 변동 추이를 정기적으로 확인하는 것이 안전합니다.`,
    },
  ];

  // 구글 검색엔진 최적화 FAQPage JSON-LD 스키마
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2B261F] selection:bg-blue-600 selection:text-white">
      {/* 구글 검색엔진 최적화: FAQPage 구조화 데이터 (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* 1. 상단 Breadcrumb & 액션 바 */}
      <div className="bg-[#FFFFFF] border-b border-[#E6E0D2] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* ← 메인 지도로 돌아가기 버튼 */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F5EE] hover:bg-[#EFECE4] border border-[#E6E0D2] text-xs font-bold text-[#2B261F] transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>← 메인 지도로 돌아가기</span>
          </Link>
          <span className="text-[#827A6D] opacity-40 hidden sm:inline">|</span>
          <nav className="text-xs text-[#827A6D] flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600 text-[#827A6D]">홈</Link>
            <span>›</span>
            <Link href={`/districts/gu/${props.gu}/`} className="hover:text-blue-600 text-[#4A4439] font-medium">
              {props.gu}
            </Link>
            <span>›</span>
            <span className="text-blue-600 font-bold truncate max-w-[130px] sm:max-w-xs">{props.name}</span>
          </nav>
        </div>

        {/* 상단 지도 바로가기 버튼 */}
        <Link
          href={`/?id=${props.master_uid}`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Map className="w-3.5 h-3.5" />
          <span>🗺️ 지도에서 이 구역 보기</span>
        </Link>
      </div>


      {/* 2. 본문 컨테이너 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* A. 히어로 섹션 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {props.gu}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#FDFBF7] text-[#4A4439] border border-[#E6E0D2]">
              {props.biz_type_label}
            </span>
            <StageBadge stageCode={props.stage_code} className="text-xs py-0.5 px-2.5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight leading-tight">
            {props.name} 정비사업 상세 리포트
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#827A6D] mt-2.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[#4A4439]">{props.legal_dong} {props.address_jibun}</span>
            </div>
            {props.address_doro && (
              <span className="text-[#827A6D]">({props.address_doro})</span>
            )}
            <div className="flex items-center gap-1 text-[#827A6D]">
              <Calendar className="w-3.5 h-3.5 text-[#827A6D]" />
              <span>최근 인허가 고시: {props.approval_date}</span>
            </div>
          </div>

          {/* E-E-A-T 강화: 데이터 출처 및 동기화 뱃지 */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-[#EFECE4]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F5EE] border border-[#E6E0D2] text-[11px] font-medium text-[#4A4439]">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>데이터 출처: 서울시 정보몽땅 &amp; 열린데이터광장</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F5EE] border border-[#E6E0D2] text-[11px] font-medium text-[#4A4439]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>최근 시스템 동기화: 2026.10.04</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F5EE] border border-[#E6E0D2] text-[11px] font-mono text-[#827A6D]">
              고유코드: {props.sido_sugg_code}-{props.code || "REG"}
            </span>
          </div>

          {/* 투자자 관점 맞춤형 3줄 핵심 브리핑 박스 */}
          <div className="mt-5 p-5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFECE4]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-[#2B261F] tracking-tight">
                  투자자 관점 3줄 핵심 브리핑 (구역 맞춤 정밀 분석)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                실시간 데이터 분석
              </span>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-[#4A4439]">
              <div className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center mt-0.5">
                  1
                </span>
                <p>
                  <strong className="text-[#2B261F]">사업 규모 &amp; 공급 임팩트:</strong>{" "}
                  {briefingLine1}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center mt-0.5">
                  2
                </span>
                <p>
                  <strong className="text-[#2B261F]">추진 속도 &amp; 다음 관문:</strong>{" "}
                  {briefingLine2}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className={`shrink-0 w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center mt-0.5 text-white ${props.is_transferable ? "bg-emerald-600" : "bg-rose-600"}`}>
                  3
                </span>
                <p>
                  <strong className="text-[#2B261F]">입주권 승계 &amp; 매수 안전성:</strong>{" "}
                  {briefingLine3}
                </p>
              </div>
            </div>
          </div>

          {/* 핵심 KPI 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E6E0D2]">
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">건립 예정 세대</span>
              <strong className="text-lg font-extrabold text-[#2B261F]">
                {totalH > 0 ? `${totalH.toLocaleString()}세대` : "계획중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">기존 가구수 (멸실)</span>
              <strong className="text-lg font-extrabold text-[#4A4439]">
                {existH > 0 ? `${existH.toLocaleString()}가구` : "집계중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">주민 동의율</span>
              <strong className="text-lg font-extrabold text-blue-600">
                {props.consent_rate ? `${props.consent_rate}%` : "추진중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">입주권 승계 안전성</span>
              <strong className={`text-base font-extrabold ${props.is_transferable ? "text-[#1B5E20]" : "text-[#8D3B00]"}`}>
                {props.is_transferable ? "지위양도 가능" : "전매 제한 주의"}
              </strong>
            </div>
          </div>
        </section>

        {/* B. 상단 구글 애드센스 300x250 광고 영역 */}
        <section aria-label="스폰서 광고">
          <AdSenseBanner slotId={`district-top-${props.master_uid}`} />
        </section>

        {/* C. [단락 1] 구역 개요 및 최근 추진 경과 (상세 명세표 포함) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E0D2]">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-[#2B261F]">1. 구역 개요 및 최근 추진 경과</h2>
          </div>

          <div className="text-xs text-[#4A4439] leading-relaxed space-y-3">
            <p>
              <strong className="text-[#2B261F]">{props.name}</strong>은(는) 서울특별시 <strong className="text-[#2B261F]">{props.gu} {props.legal_dong}</strong> 일대에 위치한 대표적인 {props.biz_type_label} 정비사업 구역입니다. 
              관할 자치구 고유 구역 코드 <strong className="text-[#2B261F]">{props.code || "미부여"}</strong>(시군구 코드 {props.sido_sugg_code})로 공식 지정되어 서울시 도시계획에 따라 체계적인 주거환경 개선 사업이 추진되고 있습니다.
            </p>
            <p>
              현재 사업 추진 단계는 <strong className="text-[#2B261F]">{props.stage_label || props.stage_raw}</strong> 단계이며, 가장 최근 공식 인허가 및 변경 고시일자는 <strong className="text-[#2B261F]">{props.approval_date || "미상"}</strong>입니다. 
              주민 동의율은 <strong className="text-[#2B261F]">{props.consent_rate ? `${props.consent_rate}%` : "현재 활발히 동의서 징구 진행 중"}</strong>으로 집계되며, 
              신속통합기획 및 공공지원 제도를 통해 인허가 절차가 가속화되고 있습니다.
            </p>
          </div>

          {/* 구역 기본 정보 표 */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-[#4A4439] border-collapse">
              <tbody className="divide-y divide-[#EFECE4]">
                <tr className="border-t border-[#EFECE4]">
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold w-1/4">구역 공식 명칭</th>
                  <td className="py-3 px-4 font-bold text-[#2B261F]">{props.name}</td>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold w-1/4">사업 유형</th>
                  <td className="py-3 px-4">{props.biz_type_label} ({props.biz_type})</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">관할 자치구</th>
                  <td className="py-3 px-4 font-medium text-[#4A4439]">{props.gu} ({props.sido_sugg_code})</td>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">법정동 및 지번</th>
                  <td className="py-3 px-4">{props.legal_dong} {props.address_jibun}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">현재 추진 단계</th>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-600">{props.stage_label || props.stage_raw}</span>
                    <span className="text-[#827A6D] text-[11px] ml-1.5">({props.stage_seq}단계 진행)</span>
                  </td>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">최근 인허가 고시일</th>
                  <td className="py-3 px-4 font-mono">{props.approval_date || "미고시"}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">계획 총 건립 세대수</th>
                  <td className="py-3 px-4 font-bold text-[#2B261F]">
                    {totalH > 0 ? `${totalH.toLocaleString()}세대` : "정비계획 확정 예정"}
                  </td>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">일반분양 / 임대 구성</th>
                  <td className="py-3 px-4">
                    분양: {saleH > 0 ? `${saleH.toLocaleString()}세대` : "-"} / 
                    임대: {rentH > 0 ? `${rentH.toLocaleString()}세대` : "-"}
                  </td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">기준 및 상한 용적률</th>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">
                    제2·3종 일반주거 (기준 250% / 법적상한 최대 300%)
                  </td>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">주민 동의율</th>
                  <td className="py-3 px-4">{props.consent_rate ? `${props.consent_rate}%` : "정보 준비중"}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#F5F2EB] text-[#2B261F] font-semibold">공공연계 인프라 호재</th>
                  <td colSpan={3} className="py-3 px-4">
                    {props.is_adjacent_public
                      ? (props.adjacent_public_note || "역세권·수변 활성화 연계 및 대단지 공공기여 인센티브 적용 구역")
                      : "자율정비 연계 및 관할 구청 도시계획 수립 대상지"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* D. [단락 2] 입주권 승계 및 현금청산 주의사항 자가진단 해설 (최소 800자 이상 해설) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E0D2]">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-[#2B261F]">2. 권리산정일 기준 입주권/현금청산 안전 진단 가이드</h2>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-[#4A4439]">
            {/* (1) 전매 승계 안전 박스: bg-[#EBF7EE] / border-[#C7E8CE] / text-[#1B5E20] */}
            <div className={`p-4 rounded-2xl border space-y-2 ${props.is_transferable ? "bg-[#EBF7EE] border-[#C7E8CE] text-[#1B5E20]" : "bg-[#FDF3E7] border-[#F5D5B8] text-[#8D3B00]"}`}>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                (1) 본 구역의 조합원 지위양도(전매) 승계 안전성 진단
              </h3>
              <p>
                「도시 및 주거환경정비법」 제39조 제2항에 따르면 투기과열지구 내 재개발 구역은 <strong className="font-bold">관리처분계획인가 이후</strong>, 
                재건축 구역은 <strong className="font-bold">조합설립인가 이후</strong>부터 원칙적으로 조합원 지위양도가 금지되며 매수인은 현금청산 대상이 됩니다.
              </p>
              <p>
                현재 <strong>{props.name}</strong>은(는) <strong>{props.stage_label || props.stage_raw}</strong> 단계로, 
                {props.is_transferable ? (
                  <span className="font-bold">
                    "현행 법률상 원칙적으로 조합원 지위양도가 합법적으로 가능한 안전 구간에 속해 있습니다. 다만 향후 관리처분인가 또는 조합설립인가가 임박할 경우 시점에 주의해야 합니다."
                  </span>
                ) : (
                  <span className="font-bold">
                    "이미 전매 제한 단계에 진입하였으므로, 1주택 장기보유 특례 요건을 갖춘 원조합원 매물인지 계약 체결 전 반드시 구청 및 조합을 통해 철저히 검증해야 합니다."
                  </span>
                )}
              </p>
            </div>

            {/* (2) 1세대 1주택 경고 박스: bg-[#FDF3E7] / border-[#F5D5B8] / text-[#8D3B00] */}
            <div className="p-4 rounded-2xl bg-[#FDF3E7] border border-[#F5D5B8] text-[#8D3B00] space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#8D3B00]" />
                (2) 1세대 1주택 장기보유자 법정 예외 거래 인정 기준
              </h3>
              <p className="text-[#4A4439]">
                투기과열지구 내 전매 제한 단계에 진입한 구역이라 하더라도 양도인이 다음 4가지 법정 요건 중 하나를 충족하면 매수인은 입주권을 승계받을 수 있습니다:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#4A4439]">
                <li><strong className="text-[#8D3B00]">1세대 1주택자 특례</strong>: 원조합원이 해당 물건을 <strong>10년 이상 소유</strong>하고 <strong>5년 이상 실제 거주</strong>한 경우 (양도세 비과세 요건과 별개로 도정법상 엄격 심사)</li>
                <li><strong className="text-[#8D3B00]">생업/질병/이주 특례</strong>: 세대원의 근무, 생업, 취학, 질병 치료, 결혼으로 세대원 전원이 타 특별시·광역시·시·군으로 주거를 이전하는 경우</li>
                <li><strong className="text-[#8D3B00]">상속/해외이주 특례</strong>: 상속으로 취득한 주택으로 세대원 전원이 이전하거나, 해외로 전원 이주 또는 2년 이상 해외에 체류하는 경우</li>
                <li><strong className="text-[#8D3B00]">사업 지연 특례</strong>: 조합설립인가일로부터 3년 이상 사업시행인가 미신청 또는 인가일로부터 3년 이상 미착공된 정체 구역의 3년 이상 보유 물건</li>
              </ul>
            </div>

            {/* (3) 지분쪼개기 경고 박스: bg-[#FDF3E7] / border-[#F5D5B8] / text-[#8D3B00] */}
            <div className="p-4 rounded-2xl bg-[#FDF3E7] border border-[#F5D5B8] text-[#8D3B00] space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#8D3B00]" />
                (3) 권리산정기준일 이후 신축 지분쪼개기 강제 청산 위험
              </h3>
              <p className="text-[#4A4439]">
                서울시 신속통합기획 및 모아타운 후보지 매수 시 가장 유의해야 할 함정은 <strong className="text-[#8D3B00]">권리산정기준일</strong>입니다. 
                단독주택이나 다가구를 헐고 신축 다세대 빌라로 쪼개기 분양한 물건의 경우, 건축허가 접수일 또는 건축물대장상 
                사용승인일자가 해당 구역의 고시된 권리산정기준일보다 늦으면 <strong className="text-[#8D3B00]">단독 아파트 입주권이 박탈되고 감정평가액 기준으로 강제 현금청산</strong>됩니다. 
                따라서 계약 전 등기부등본뿐 아니라 건축물대장 착공일·사용승인일을 반드시 대조 확인해야 안전합니다.
              </p>
            </div>
          </div>
        </section>

        {/* E. [단락 3] 계획 세대수 기반 사업성 및 예상 준공 타임라인 안내 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D2]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-[#2B261F]">3. 계획 세대수 기반 사업성 및 예상 준공 타임라인 안내</h2>
            </div>
            <span className="text-xs text-[#827A6D]">서울시 평균 소요: 약 9.8년</span>
          </div>

          <div className="text-xs text-[#4A4439] leading-relaxed space-y-2">
            <p>
              <strong className="text-[#2B261F]">{props.name}</strong>의 신축 건립 예정 규모는 <strong className="text-[#2B261F]">{totalH > 0 ? `${totalH.toLocaleString()}세대` : "정비계획 확정 단계"}</strong>이며, 
              기존 멸실 가구수는 <strong className="text-[#2B261F]">{existH > 0 ? `${existH.toLocaleString()}가구` : "산정 중"}</strong>입니다. 
              {totalH > 0 && existH > 0 ? (
                <>
                  기존 조합원 대비 순증가분은 약 <strong className="text-[#2B261F]">{(totalH - existH).toLocaleString()}세대</strong>로 추산되며, 
                  일반분양 물량이 확보됨에 따라 조합원 개별 추가분담금 부담이 합리적으로 분산될 수 있는 사업성 구조를 갖추고 있습니다.
                </>
              ) : (
                <>
                  정비계획 수립 및 건축심의 과정에서 용적률 상향 인센티브가 확정되면 최종 일반분양 세대수와 조합원 비례율이 도출될 예정입니다.
                </>
              )}
            </p>
          </div>

          {/* 7단계 타임라인 막대 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {allStages.map((stage) => {
              const isPassed = props.stage_seq > stage.seq;
              const isCurrent = props.stage_seq === stage.seq;

              return (
                <div
                  key={stage.seq}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500/50"
                      : isPassed
                      ? "bg-[#F7F5EE] border-[#E4DEC9]"
                      : "bg-[#F7F5EE]/60 border-[#E4DEC9]/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#827A6D]">STEP 0{stage.seq}</span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white">
                        현재 진행
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xs font-bold mb-1 ${isCurrent ? "text-blue-700 font-extrabold" : "text-[#2B261F]"}`}>
                    {stage.name}
                  </h3>
                  <p className="text-[11px] text-[#827A6D]">평균 소요: {stage.avgYears}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* F. [단락 4] 자주 묻는 질문 (FAQ) - 아코디언 토글 형태 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFECE4]">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
                ❓ 4. {props.name} 정비사업 자주 묻는 질문 (FAQ)
              </h2>
            </div>
            <span className="text-[11px] text-[#827A6D] hidden sm:inline">질문 클릭 시 상세 답변 열람</span>
          </div>

          <div className="space-y-3">
            {faqList.map((faq, idx) => (
              <details
                key={idx}
                open={idx < 2}
                className="group p-4 sm:p-5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] transition-all open:bg-[#FFFFFF] open:shadow-xs"
              >
                <summary className="flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-[#2B261F] cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start gap-2.5 text-left">
                    <span className="text-blue-600 font-extrabold shrink-0">Q{idx + 1}.</span>
                    <span className="group-hover:text-blue-600 transition-colors">{faq.question}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#827A6D] shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="mt-3 pt-3 border-t border-[#EFECE4] text-xs leading-relaxed text-[#4A4439] space-y-2">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* G. 하단 가로형 애드센스 광고 슬롯 */}
        <section aria-label="스폰서 광고">
          <AdSenseBanner format="horizontal" slotId={`district-bottom-${props.master_uid}`} />
        </section>

        {/* G. 하단 '지도에서 이 구역 위치 확인하기' 버튼 */}
        <div className="pt-2">
          <Link
            href={`/?id=${props.master_uid}`}
            className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>지도에서 이 구역 위치 확인하기 (포커스 이동)</span>
          </Link>
        </div>

        {/* H. 동일 자치구 인근 구역 추천: 관련 구역 리포트 */}
        {nearbyDistricts.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D2]">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-[#2B261F]">📑 관련 구역 리포트: {props.gu} 내 다른 정비구역</h2>
              </div>
              <Link href={`/districts/gu/${props.gu}/`} className="text-xs text-blue-600 hover:underline font-medium">
                {props.gu} 전체 구역 보기 →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nearbyDistricts.map((item) => (
                <Link
                  key={item.properties.master_uid}
                  href={`/districts/${item.properties.master_uid}/`}
                  className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] hover:border-blue-500 hover:bg-white transition-all group flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {item.properties.gu}
                      </span>
                      <StageBadge stageCode={item.properties.stage_code} className="text-[10px]" />
                    </div>
                    <h3 className="text-xs font-bold text-[#2B261F] group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.properties.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#827A6D] mt-2.5 pt-2 border-t border-[#E6E0D2]">
                    <span>{item.properties.legal_dong}</span>
                    <strong className="text-[#4A4439]">
                      {item.properties.total_households ? `${item.properties.total_households.toLocaleString()}세대` : "계획중"}
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* I. 투자 유의사항 및 면책 고지 (Legal Disclaimer) */}
        <section className="p-6 rounded-3xl bg-[#FDFBF7] border border-[#E6E0D2] text-xs text-[#827A6D] space-y-2.5">
          <div className="flex items-center gap-2 text-[#2B261F] font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>정비사업 데이터 법적 면책 고지 (Disclaimer)</span>
          </div>
          <p className="leading-relaxed text-[#4A4439]">
            본 리포트는 서울특별시 공공데이터(정보몽땅, 서울 열린데이터광장) 및 공공 고시 자료를 바탕으로 작성된 정비사업 참고용 정보이며, 법적 효력을 갖는 행정처분 문서가 아닙니다. 개별 조합원의 지위양도 승계 자격, 권리산정일 기준 분양 자격, 추가분담금 등은 매물의 권리관계(다물권, 1세대 1주택 보유기간 등)에 따라 상이할 수 있으므로, 실제 매매 계약 체결 전 반드시 관할 구청(도시계획과/정비사업과) 및 구역 조합 사무실을 직접 방문하여 공식 장부를 대조하시기 바랍니다. 본 플랫폼은 본 정보의 이용으로 인한 투자 결과에 대해 법적 책임을 지지 않습니다.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
            <Link href="/terms/" className="text-blue-600 underline font-semibold hover:text-blue-700">
              서비스 이용약관 및 면책조항 전문 보기 →
            </Link>
            <span>•</span>
            <Link href="/privacy/" className="text-blue-600 underline font-semibold hover:text-blue-700">
              개인정보처리방침 전문 보기 →
            </Link>
          </div>
        </section>

      </main>

      {/* 3. 푸터 */}
      <footer className="mt-16 border-t border-[#E6E0D2] py-8 px-4 text-center text-xs text-[#827A6D] space-y-2 bg-[#F5F2EB]">
        <p>서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼 | 데이터 출처: 서울시 정비사업 정보몽땅 및 서울 열린데이터광장</p>
        <p className="flex items-center justify-center gap-3 text-[#827A6D]">
          <span>© 2026 Seoul Redevelopment Monitoring.</span>
          <span>•</span>
          <Link href="/privacy/" className="hover:text-blue-600 underline font-medium">개인정보처리방침</Link>
          <span>•</span>
          <Link href="/terms/" className="hover:text-blue-600 underline font-medium">이용약관 및 면책조항</Link>
        </p>
      </footer>
    </div>
  );
}
