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

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-900 selection:bg-blue-600 selection:text-white">
      {/* 1. 상단 Breadcrumb & 액션 바 */}
      <div className="bg-white border-b border-[#e7e3da] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* ← 메인 지도로 돌아가기 버튼 */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f5] hover:bg-[#eeeae2] border border-[#e7e3da] text-xs font-bold text-stone-800 transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>← 메인 지도로 돌아가기</span>
          </Link>
          <span className="text-stone-300 hidden sm:inline">|</span>
          <nav className="text-xs text-stone-500 flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <span>›</span>
            <Link href="/districts/" className="hover:text-blue-600 text-stone-700 font-medium">
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
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7e3da] shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {props.gu}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#faf8f5] text-stone-700 border border-[#e7e3da]">
              {props.biz_type_label}
            </span>
            <StageBadge stageCode={props.stage_code} className="text-xs py-0.5 px-2.5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {props.name} 정비사업 상세 리포트
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-500 mt-2.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-stone-700">{props.legal_dong} {props.address_jibun}</span>
            </div>
            {props.address_doro && (
              <span className="text-stone-400">({props.address_doro})</span>
            )}
            <div className="flex items-center gap-1 text-stone-500">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>최근 인허가 고시: {props.approval_date}</span>
            </div>
          </div>

          {/* 핵심 KPI 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#e7e3da]">
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] font-semibold text-stone-500 block mb-1">건립 예정 세대</span>
              <strong className="text-lg font-extrabold text-stone-900">
                {totalH > 0 ? `${totalH.toLocaleString()}세대` : "계획중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] font-semibold text-stone-500 block mb-1">기존 가구수 (멸실)</span>
              <strong className="text-lg font-extrabold text-stone-700">
                {existH > 0 ? `${existH.toLocaleString()}가구` : "집계중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] font-semibold text-stone-500 block mb-1">주민 동의율</span>
              <strong className="text-lg font-extrabold text-blue-600">
                {props.consent_rate ? `${props.consent_rate}%` : "추진중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] font-semibold text-stone-500 block mb-1">입주권 승계 안전성</span>
              <strong className={`text-base font-extrabold ${props.is_transferable ? "text-emerald-600" : "text-rose-600"}`}>
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
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7e3da] shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e7e3da]">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-stone-900">1. 구역 개요 및 최근 추진 경과</h2>
          </div>

          <div className="text-xs text-stone-700 leading-relaxed space-y-3">
            <p>
              <strong className="text-stone-900">{props.name}</strong>은(는) 서울특별시 <strong className="text-stone-900">{props.gu} {props.legal_dong}</strong> 일대에 위치한 대표적인 {props.biz_type_label} 정비사업 구역입니다. 
              관할 자치구 고유 구역 코드 <strong className="text-stone-900">{props.code || "미부여"}</strong>(시군구 코드 {props.sido_sugg_code})로 공식 지정되어 서울시 도시계획에 따라 체계적인 주거환경 개선 사업이 추진되고 있습니다.
            </p>
            <p>
              현재 사업 추진 단계는 <strong className="text-stone-900">{props.stage_label || props.stage_raw}</strong> 단계이며, 가장 최근 공식 인허가 및 변경 고시일자는 <strong className="text-stone-900">{props.approval_date || "미상"}</strong>입니다. 
              주민 동의율은 <strong className="text-stone-900">{props.consent_rate ? `${props.consent_rate}%` : "현재 활발히 동의서 징구 진행 중"}</strong>으로 집계되며, 
              신속통합기획 및 공공지원 제도를 통해 인허가 절차가 가속화되고 있습니다.
            </p>
          </div>

          {/* 구역 기본 정보 표 */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-stone-700 border-collapse">
              <tbody className="divide-y divide-[#e7e3da]">
                <tr className="border-t border-[#e7e3da]">
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold w-1/4">구역 공식 명칭</th>
                  <td className="py-3 px-4 font-bold text-stone-900">{props.name}</td>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold w-1/4">사업 유형</th>
                  <td className="py-3 px-4">{props.biz_type_label} ({props.biz_type})</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">관할 자치구</th>
                  <td className="py-3 px-4 font-medium text-stone-800">{props.gu} ({props.sido_sugg_code})</td>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">법정동 및 지번</th>
                  <td className="py-3 px-4">{props.legal_dong} {props.address_jibun}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">현재 추진 단계</th>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-600">{props.stage_label || props.stage_raw}</span>
                    <span className="text-stone-500 text-[11px] ml-1.5">({props.stage_seq}단계 진행)</span>
                  </td>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">최근 인허가 고시일</th>
                  <td className="py-3 px-4 font-mono">{props.approval_date || "미고시"}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">계획 총 건립 세대수</th>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {totalH > 0 ? `${totalH.toLocaleString()}세대` : "정비계획 확정 예정"}
                  </td>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">일반분양 / 임대 구성</th>
                  <td className="py-3 px-4">
                    분양: {saleH > 0 ? `${saleH.toLocaleString()}세대` : "-"} / 
                    임대: {rentH > 0 ? `${rentH.toLocaleString()}세대` : "-"}
                  </td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">기준 및 상한 용적률</th>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">
                    제2·3종 일반주거 (기준 250% / 법적상한 최대 300%)
                  </td>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">주민 동의율</th>
                  <td className="py-3 px-4">{props.consent_rate ? `${props.consent_rate}%` : "정보 준비중"}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-[#faf8f5] text-stone-500 font-semibold">공공연계 인프라 호재</th>
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
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7e3da] shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e7e3da]">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-stone-900">2. 권리산정일 기준 입주권/현금청산 안전 진단 가이드</h2>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-stone-700">
            <div className={`p-4 rounded-2xl border space-y-2 ${props.is_transferable ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"}`}>
              <h3 className={`text-sm font-bold flex items-center gap-1.5 ${props.is_transferable ? "text-emerald-800" : "text-rose-800"}`}>
                <CheckCircle2 className="w-4 h-4" />
                (1) 본 구역의 조합원 지위양도(전매) 승계 안전성 진단
              </h3>
              <p className="text-stone-700">
                「도시 및 주거환경정비법」 제39조 제2항에 따르면 투기과열지구 내 재개발 구역은 <strong className="text-stone-900">관리처분계획인가 이후</strong>, 
                재건축 구역은 <strong className="text-stone-900">조합설립인가 이후</strong>부터 원칙적으로 조합원 지위양도가 금지되며 매수인은 현금청산 대상이 됩니다.
              </p>
              <p className="text-stone-600">
                현재 <strong className="text-stone-900">{props.name}</strong>은(는) <strong className="text-stone-900">{props.stage_label || props.stage_raw}</strong> 단계로, 
                {props.is_transferable ? (
                  <span className="text-emerald-800 font-semibold">
                    "현행 법률상 원칙적으로 조합원 지위양도가 합법적으로 가능한 안전 구간에 속해 있습니다. 다만 향후 관리처분인가 또는 조합설립인가가 임박할 경우 시점에 주의해야 합니다."
                  </span>
                ) : (
                  <span className="text-rose-800 font-semibold">
                    "이미 전매 제한 단계에 진입하였으므로, 1주택 장기보유 특례 요건을 갖춘 원조합원 매물인지 계약 체결 전 반드시 구청 및 조합을 통해 철저히 검증해야 합니다."
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                (2) 1세대 1주택 장기보유자 법정 예외 거래 인정 기준
              </h3>
              <p className="text-stone-700">
                투기과열지구 내 전매 제한 단계에 진입한 구역이라 하더라도 양도인이 다음 4가지 법정 요건 중 하나를 충족하면 매수인은 입주권을 승계받을 수 있습니다:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li><strong className="text-stone-800">1세대 1주택자 특례</strong>: 원조합원이 해당 물건을 <strong>10년 이상 소유</strong>하고 <strong>5년 이상 실제 거주</strong>한 경우 (양도세 비과세 요건과 별개로 도정법상 엄격 심사)</li>
                <li><strong className="text-stone-800">생업/질병/이주 특례</strong>: 세대원의 근무, 생업, 취학, 질병 치료, 결혼으로 세대원 전원이 타 특별시·광역시·시·군으로 주거를 이전하는 경우</li>
                <li><strong className="text-stone-800">상속/해외이주 특례</strong>: 상속으로 취득한 주택으로 세대원 전원이 이전하거나, 해외로 전원 이주 또는 2년 이상 해외에 체류하는 경우</li>
                <li><strong className="text-stone-800">사업 지연 특례</strong>: 조합설립인가일로부터 3년 이상 사업시행인가 미신청 또는 인가일로부터 3년 이상 미착공된 정체 구역의 3년 이상 보유 물건</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] space-y-2">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                (3) 권리산정기준일 이후 신축 지분쪼개기 강제 청산 위험
              </h3>
              <p className="text-stone-700">
                서울시 신속통합기획 및 모아타운 후보지 매수 시 가장 유의해야 할 함정은 <strong className="text-stone-900">권리산정기준일</strong>입니다. 
                단독주택이나 다가구를 헐고 신축 다세대 빌라로 쪼개기 분양한 물건의 경우, 건축허가 접수일 또는 건축물대장상 
                사용승인일자가 해당 구역의 고시된 권리산정기준일보다 늦으면 <strong className="text-rose-900">단독 아파트 입주권이 박탈되고 감정평가액 기준으로 강제 현금청산</strong>됩니다. 
                따라서 계약 전 등기부등본뿐 아니라 건축물대장 착공일·사용승인일을 반드시 대조 확인해야 안전합니다.
              </p>
            </div>
          </div>
        </section>

        {/* E. [단락 3] 계획 세대수 기반 사업성 및 예상 준공 타임라인 안내 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7e3da] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e7e3da]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-stone-900">3. 계획 세대수 기반 사업성 및 예상 준공 타임라인 안내</h2>
            </div>
            <span className="text-xs text-stone-500">서울시 평균 소요: 약 9.8년</span>
          </div>

          <div className="text-xs text-stone-700 leading-relaxed space-y-2">
            <p>
              <strong className="text-stone-900">{props.name}</strong>의 신축 건립 예정 규모는 <strong className="text-stone-900">{totalH > 0 ? `${totalH.toLocaleString()}세대` : "정비계획 확정 단계"}</strong>이며, 
              기존 멸실 가구수는 <strong className="text-stone-900">{existH > 0 ? `${existH.toLocaleString()}가구` : "산정 중"}</strong>입니다. 
              {totalH > 0 && existH > 0 ? (
                <>
                  기존 조합원 대비 순증가분은 약 <strong className="text-stone-900">{(totalH - existH).toLocaleString()}세대</strong>로 추산되며, 
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
                      ? "bg-[#faf8f5] border-[#e7e3da]"
                      : "bg-[#faf8f5]/50 border-[#e7e3da]/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-stone-400">STEP 0{stage.seq}</span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white">
                        현재 진행
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xs font-bold mb-1 ${isCurrent ? "text-blue-700" : "text-stone-800"}`}>
                    {stage.name}
                  </h3>
                  <p className="text-[11px] text-stone-500">평균 소요: {stage.avgYears}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* F. 하단 가로형 애드센스 광고 슬롯 */}
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
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e7e3da] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e3da]">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-stone-900">📑 관련 구역 리포트: {props.gu} 내 다른 정비구역</h2>
              </div>
              <Link href="/districts/" className="text-xs text-blue-600 hover:underline font-medium">
                전체 496개 구역 색인 보기 →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nearbyDistricts.map((item) => (
                <Link
                  key={item.properties.master_uid}
                  href={`/districts/${item.properties.master_uid}/`}
                  className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e7e3da] hover:border-blue-500 hover:bg-white transition-all group flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {item.properties.gu}
                      </span>
                      <StageBadge stageCode={item.properties.stage_code} className="text-[10px]" />
                    </div>
                    <h3 className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.properties.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2.5 pt-2 border-t border-[#e7e3da]">
                    <span>{item.properties.legal_dong}</span>
                    <strong className="text-stone-800">
                      {item.properties.total_households ? `${item.properties.total_households.toLocaleString()}세대` : "계획중"}
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* 3. 푸터 */}
      <footer className="mt-16 border-t border-[#e7e3da] py-8 px-4 text-center text-xs text-stone-500 space-y-2 bg-[#f7f5f0]">
        <p>서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼 | 데이터 출처: 서울시 정비사업 정보몽땅 및 서울 열린데이터광장</p>
        <p className="flex items-center justify-center gap-3 text-stone-600">
          <span>© 2026 Seoul Redevelopment Monitoring.</span>
          <span>•</span>
          <Link href="/privacy/" className="hover:text-blue-600 underline font-medium">개인정보처리방침</Link>
        </p>
      </footer>
    </div>
  );
}
