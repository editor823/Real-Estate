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
  ArrowLeft,
  Map,
  Compass,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Database,
  ShieldAlert,
} from "lucide-react";

const SEOUL_25_GUS = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

// 경기도 31개 시·군 목록
const GYEONGGI_31_CITIES = [
  "수원시",
  "성남시",
  "의정부시",
  "안양시",
  "부천시",
  "광명시",
  "평택시",
  "동두천시",
  "안산시",
  "고양시",
  "과천시",
  "구리시",
  "남양주시",
  "오산시",
  "시흥시",
  "군포시",
  "의왕시",
  "하남시",
  "용인시",
  "파주시",
  "이천시",
  "안성시",
  "김포시",
  "화성시",
  "광주시",
  "양주시",
  "포천시",
  "여주시",
  "연천군",
  "가평군",
  "양평군",
];

// 데이터 파일에 존재하는 모든 고유 지역명 추출
const DATA_REGIONS = Array.from(
  new Set(
    (DISTRICTS_GEOJSON.features as DistrictFeature[])
      .map((f) => f.properties.gu)
      .filter(Boolean)
  )
);

// 전체 지원 지역 목록 (서울 25개 구 + 실제 데이터 내 지역)
const ALL_SUPPORTED_REGIONS = Array.from(
  new Set([...SEOUL_25_GUS, ...DATA_REGIONS])
);

interface GuPageProps {
  params: Promise<{ gu: string }>;
}

// 1. Next.js Static HTML Export (SSG) - 지원 지역 정적 HTML 사전 생성
export async function generateStaticParams() {
  return ALL_SUPPORTED_REGIONS.map((gu) => ({
    gu,
  }));
}

// 2. SEO 메타데이터 동적 생성
export async function generateMetadata({ params }: GuPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const targetGu = decodeURIComponent(resolvedParams.gu);

  const guDistricts = (DISTRICTS_GEOJSON.features as DistrictFeature[]).filter(
    (f) => f.properties.gu === targetGu
  );

  const count = guDistricts.length;
  const totalH = guDistricts.reduce(
    (acc, f) => acc + (f.properties.total_households || 0),
    0
  );

  const maxDistrict = [...guDistricts].sort(
    (a, b) => (b.properties.total_households || 0) - (a.properties.total_households || 0)
  )[0];
  const maxInfo = maxDistrict
    ? `(최대: ${maxDistrict.properties.name} ${(maxDistrict.properties.total_households || 0).toLocaleString()}세대)`
    : "";

  const province = GYEONGGI_31_CITIES.includes(targetGu) || targetGu.endsWith("시") || targetGu.endsWith("군")
    ? "경기도"
    : "서울특별시";

  return {
    title: `${targetGu} 정비사업 재개발·신통기획·모아타운 구역 현황 리포트 (${count}개소) | 수도권 정비사업 모니터링`,
    description: `${province} ${targetGu} 정비사업 ${count}개 구역 총 ${totalH.toLocaleString()}세대 공급 계획${maxInfo ? ` ${maxInfo}` : ""}. 구역별 추진단계, 권리산정기준일, 조합원 지위양도 전매제한 안전 진단 종합 분석.`,
    alternates: {
      canonical: `https://seoul-redevelopment.pages.dev/districts/gu/${encodeURIComponent(targetGu)}/`,
    },
    openGraph: {
      title: `${targetGu} 정비사업 리포트 | ${count}개 구역 총 ${totalH.toLocaleString()}세대`,
      description: `${province} ${targetGu} 정비사업 구역별 추진단계, 권리산정기준일, 입주권 승계 안전성 상세 분석`,
      url: `https://seoul-redevelopment.pages.dev/districts/gu/${encodeURIComponent(targetGu)}/`,
      siteName: "수도권 정비사업 모니터링",
      type: "article",
    },
  };
}

export default async function GuDistrictsPage({ params }: GuPageProps) {
  const resolvedParams = await params;
  const targetGu = decodeURIComponent(resolvedParams.gu);

  // 유효 지역 검증 (서울 25개 구 또는 경기도 시·군 또는 데이터 내 지역)
  const isValidRegion =
    ALL_SUPPORTED_REGIONS.includes(targetGu) ||
    GYEONGGI_31_CITIES.includes(targetGu);

  if (!isValidRegion) {
    notFound();
  }

  const allFeatures = DISTRICTS_GEOJSON.features as DistrictFeature[];
  const guDistricts = allFeatures.filter((f) => f.properties.gu === targetGu);

  const totalDistricts = guDistricts.length;
  const totalHouseholds = guDistricts.reduce(
    (acc, f) => acc + (f.properties.total_households || 0),
    0
  );
  const totalExistHouseholds = guDistricts.reduce(
    (acc, f) => acc + (f.properties.existing_households || 0),
    0
  );

  // 사업 유형별 집계 (신속통합기획 및 모아타운 플래그/키워드 연동)
  const isSinthong = (props: any) =>
    props.isShinTong === true ||
    props.is_shintong === true ||
    props.biz_type === "SINTHONG" ||
    props.businessType === "신속통합기획" ||
    /신속통합|신통|기획/.test(props.name || "") ||
    /신속통합|신통|기획/.test(props.remark || "");

  const isMoa = (props: any) =>
    props.isMoa === true ||
    props.is_moa === true ||
    props.biz_type === "MOA" ||
    props.businessType === "모아타운" ||
    /모아|소규모|모아타운/.test(props.name || "") ||
    /모아|소규모|모아타운/.test(props.remark || "");

  const sinthongCount = guDistricts.filter((f) => isSinthong(f.properties)).length;
  const moaCount = guDistricts.filter((f) => isMoa(f.properties)).length;
  const normalCount = Math.max(0, totalDistricts - sinthongCount - moaCount);

  // 법정동 목록 추출
  const dongs = Array.from(
    new Set(guDistricts.map((f) => f.properties.legal_dong).filter(Boolean))
  );

  // 자치구 핵심 동향 자동 분석 지표 계산 (사용자 수동 조사 0건 자동화)
  // 1) 관내 최대 건립 예정 세대수 구역
  const maxHouseholdDistrict = [...guDistricts].sort(
    (a, b) => (b.properties.total_households || 0) - (a.properties.total_households || 0)
  )[0];

  // 2) 가장 최근 인허가/고시가 승인된 구역
  const latestApprovalDistrict = [...guDistricts]
    .filter((f) => f.properties.approval_date)
    .sort((a, b) =>
      (b.properties.approval_date || "").localeCompare(a.properties.approval_date || "")
    )[0];

  // 3) 사업 추진 속도가 가장 앞선 구역 (최고 stage_seq)
  const fastestStageDistrict = [...guDistricts].sort(
    (a, b) => (b.properties.stage_seq || 0) - (a.properties.stage_seq || 0)
  )[0];

  // 구조화 데이터 (BreadcrumbList)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: "https://seoul-redevelopment.pages.dev/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "구역별 분석 리포트",
        item: "https://seoul-redevelopment.pages.dev/districts/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: targetGu,
        item: `https://seoul-redevelopment.pages.dev/districts/gu/${encodeURIComponent(targetGu)}/`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2B261F] selection:bg-blue-600 selection:text-white flex flex-col">
      {/* 구조화 데이터 주입 (BreadcrumbList) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* 1. 상단 Breadcrumb & 액션 바 */}
      <div className="bg-[#FFFFFF] border-b border-[#E6E0D2] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/districts/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F5EE] hover:bg-[#EFECE4] border border-[#E6E0D2] text-xs font-bold text-[#2B261F] transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>← 전체 구역 색인</span>
          </Link>
          <span className="text-[#827A6D] opacity-40 hidden sm:inline">|</span>
          <nav className="text-xs text-[#827A6D] flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600 text-[#827A6D]">홈</Link>
            <span>›</span>
            <Link href="/districts/" className="hover:text-blue-600 text-[#4A4439] font-medium">
              구역별 분석 리포트
            </Link>
            <span>›</span>
            <span className="text-blue-600 font-bold" aria-current="page">{targetGu}</span>
          </nav>
        </div>

        {/* 메인 지도 바로가기 버튼 */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Map className="w-3.5 h-3.5" />
          <span>🗺️ 지도에서 보기</span>
        </Link>
      </div>

      {/* 2. 본문 컨테이너 */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-7 flex-1 w-full">
        {/* A. 히어로 섹션 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              {GYEONGGI_31_CITIES.includes(targetGu) || targetGu.endsWith("시") || targetGu.endsWith("군") ? "경기도" : "서울특별시"} {targetGu}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#FDFBF7] text-[#4A4439] border border-[#E6E0D2]">
              정비사업 집중 모니터링
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight leading-tight">
            {targetGu} 정비사업 현황 리포트 (총 {totalDistricts}개 구역)
          </h1>

          {/* E-E-A-T 강화: 데이터 출처 및 동기화 뱃지 */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#EFECE4]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F5EE] border border-[#E6E0D2] text-[11px] font-medium text-[#4A4439]">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>데이터 출처: 서울시 정보몽땅 &amp; 열린데이터광장</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F5EE] border border-[#E6E0D2] text-[11px] font-medium text-[#4A4439]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>시스템 최종 동기화: 2026.10.04</span>
            </span>
          </div>

          {/* 자치구 개요 텍스트 */}
          <div className="mt-3.5 text-xs text-[#4A4439] leading-relaxed space-y-2">
            <p>
              서울특별시 <strong>{targetGu}</strong>는 현재 총 <strong>{totalDistricts}개소</strong>의 주택 재개발, 재건축, 신속통합기획 및 모아타운 사업이 활발히 추진되고 있는 핵심 도시정비 거점 지역입니다. 
              관내 정비사업을 통해 신축 건립 예정인 총 공급 규모는 <strong>{totalHouseholds > 0 ? `${totalHouseholds.toLocaleString()}세대` : "집계중"}</strong>에 달하며, 
              기존 노후 멸실 가구수 <strong>{totalExistHouseholds > 0 ? `${totalExistHouseholds.toLocaleString()}가구` : "산정중"}</strong> 대비 대규모 신규 양질 주택 공급이 계획되어 있습니다.
            </p>
            <p className="text-[#827A6D]">
              주요 사업 유형으로는 서울시 주도 패스트트랙인 <strong>신속통합기획 {sinthongCount}개 구역</strong>, 소규모 노후 저층 주거지를 블록형으로 묶어 개발하는 <strong>모아타운 {moaCount}개 구역</strong>, 
              일반 재개발·재건축 {normalCount}개 구역이 포함되어 있습니다. 
              {dongs.length > 0 && ` 관할 주요 추진 법정동은 ${dongs.slice(0, 6).join(", ")}${dongs.length > 6 ? ` 등 ${dongs.length}개 법정동` : ""}에 걸쳐 분포하고 있습니다.`}
            </p>
          </div>

          {/* 핵심 KPI 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E6E0D2]">
            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">총 추진 구역수</span>
              <strong className="text-lg font-extrabold text-[#2B261F]">
                {totalDistricts}개소
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">총 계획 세대수</span>
              <strong className="text-lg font-extrabold text-blue-600">
                {totalHouseholds > 0 ? `${totalHouseholds.toLocaleString()}세대` : "계획중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">신속통합기획 구역</span>
              <strong className="text-lg font-extrabold text-indigo-600">
                {sinthongCount}개 구역
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
              <span className="text-[11px] font-semibold text-[#827A6D] block mb-1">모아타운(소규모)</span>
              <strong className="text-lg font-extrabold text-emerald-600">
                {moaCount}개 구역
              </strong>
            </div>
          </div>
        </section>

        {/* B. 자치구 핵심 동향 및 주요 구역 자동 분석 브리핑 */}
        <section className="p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFECE4]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
                🎯 {targetGu} 정비사업 핵심 동향 및 주요 구역 브리핑
              </h2>
            </div>
            <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              실시간 데이터 자동 분석
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {maxHouseholdDistrict && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    🏢 최대 공급 대단지
                  </span>
                  <h3 className="text-sm font-extrabold text-[#2B261F] mt-1.5">
                    {maxHouseholdDistrict.properties.name}
                  </h3>
                  <p className="text-xs text-[#827A6D] mt-0.5">
                    {maxHouseholdDistrict.properties.legal_dong} • {maxHouseholdDistrict.properties.stage_label || maxHouseholdDistrict.properties.stage_raw}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#EFECE4] text-xs">
                  <span className="font-extrabold text-blue-700">
                    {(maxHouseholdDistrict.properties.total_households || 0).toLocaleString()}세대
                  </span>
                  <Link
                    href={`/districts/${maxHouseholdDistrict.properties.master_uid || maxHouseholdDistrict.id}/`}
                    className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    상세 리포트 →
                  </Link>
                </div>
              </div>
            )}

            {latestApprovalDistrict && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    ⚡ 최근 인허가 고시 구역
                  </span>
                  <h3 className="text-sm font-extrabold text-[#2B261F] mt-1.5">
                    {latestApprovalDistrict.properties.name}
                  </h3>
                  <p className="text-xs text-[#827A6D] mt-0.5">
                    {latestApprovalDistrict.properties.legal_dong} • {latestApprovalDistrict.properties.stage_label || latestApprovalDistrict.properties.stage_raw}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#EFECE4] text-xs">
                  <span className="font-bold text-emerald-800">
                    고시: {latestApprovalDistrict.properties.approval_date}
                  </span>
                  <Link
                    href={`/districts/${latestApprovalDistrict.properties.master_uid || latestApprovalDistrict.id}/`}
                    className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    상세 리포트 →
                  </Link>
                </div>
              </div>
            )}

            {fastestStageDistrict && (
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    🚀 사업 추진 선도 구역
                  </span>
                  <h3 className="text-sm font-extrabold text-[#2B261F] mt-1.5">
                    {fastestStageDistrict.properties.name}
                  </h3>
                  <p className="text-xs text-[#827A6D] mt-0.5">
                    {fastestStageDistrict.properties.legal_dong} • {fastestStageDistrict.properties.biz_type_label}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#EFECE4] text-xs">
                  <span className="font-extrabold text-indigo-700">
                    {fastestStageDistrict.properties.stage_label || fastestStageDistrict.properties.stage_raw}
                  </span>
                  <Link
                    href={`/districts/${fastestStageDistrict.properties.master_uid || fastestStageDistrict.id}/`}
                    className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    상세 리포트 →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 종합 요약 브리핑 해설 */}
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] text-xs text-[#4A4439] leading-relaxed">
            <p>
              💡 <strong>{targetGu} 관내 정비사업 투자 분석:</strong> 관내 최대 공급 규모인 <strong>{maxHouseholdDistrict?.properties.name}</strong>({maxHouseholdDistrict?.properties.total_households?.toLocaleString()}세대)을 중심으로, 
              최근 <strong>{latestApprovalDistrict?.properties.approval_date}</strong> 고시를 통과한 <strong>{latestApprovalDistrict?.properties.name}</strong>까지 인허가 변경이 꾸준히 이어지고 있습니다. 
              {sinthongCount > 0 && ` 서울시 통합심의 패스트트랙이 적용되는 신속통합기획이 ${sinthongCount}개소에 달하며, `}
              {moaCount > 0 && ` 블록형 소규모 주택정비 모아타운 ${moaCount}개소도 활발히 추진 중입니다.`}
            </p>
          </div>
        </section>

        {/* C. 상단 구글 애드센스 300x250 광고 영역 */}
        <section aria-label="스폰서 광고">
          <AdSenseBanner slotId={`gu-top-${encodeURIComponent(targetGu)}`} />
        </section>

        {/* C. 25개 자치구 빠른 이동 칩 네비게이션 */}
        <section className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2B261F] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>다른 자치구 리포트 둘러보기</span>
            </span>
            <Link href="/districts/" className="text-xs text-blue-600 hover:underline font-semibold">
              전체 496개 구역 색인 →
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SEOUL_25_GUS.map((guName) => {
              const isCurrent = guName === targetGu;
              return (
                <Link
                  key={guName}
                  href={`/districts/gu/${guName}/`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "bg-[#F7F5EE] hover:bg-[#EFECE4] border border-[#E6E0D2] text-[#4A4439]"
                  }`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {guName}
                </Link>
              );
            })}
          </div>
        </section>

        {/* D. 해당 자치구 구역 목록 카드 그리드 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-extrabold text-[#2B261F] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>{targetGu} 관내 구역 분석 리포트 목록 ({totalDistricts}개)</span>
            </h2>
            <span className="text-xs text-[#827A6D]">클릭 시 심층 분석 리포트 열람</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guDistricts.map((district, idx) => {
              const p = district.properties;
              const uid = p.master_uid || district.id;

              return (
                <article
                  key={uid}
                  className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* 상단 뱃지 행 */}
                    <div className="flex items-center justify-between gap-1.5 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {p.gu}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[#FDFBF7] text-[#4A4439] border border-[#E6E0D2]">
                          {p.biz_type_label}
                        </span>
                      </div>
                      <StageBadge stageCode={p.stage_code} className="text-xs" />
                    </div>

                    {/* 구역명 */}
                    <Link href={`/districts/${uid}/`}>
                      <h3 className="text-base font-extrabold text-[#2B261F] group-hover:text-blue-600 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                    </Link>

                    {/* 위치 및 고시일자 */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#827A6D] mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[#4A4439]">{p.legal_dong} {p.address_jibun}</span>
                      </div>
                      {p.approval_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#827A6D]" />
                          <span>고시일: {p.approval_date}</span>
                        </div>
                      )}
                    </div>

                    {/* 수치 요약 박스 */}
                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2]">
                      <div>
                        <span className="text-[10px] text-[#827A6D] block">계획 세대</span>
                        <strong className="text-xs font-bold text-[#2B261F]">
                          {p.total_households ? `${p.total_households.toLocaleString()}세대` : "계획중"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#827A6D] block">기존 가구</span>
                        <strong className="text-xs font-bold text-[#4A4439]">
                          {p.existing_households ? `${p.existing_households.toLocaleString()}가구` : "-"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#827A6D] block">전매 안전성</span>
                        <strong className={`text-xs font-bold ${p.is_transferable ? "text-[#1B5E20]" : "text-[#8D3B00]"}`}>
                          {p.is_transferable ? "지위양도 가능" : "전매주의"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 그룹 */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#EFECE4]">
                    <Link
                      href={`/districts/${uid}/`}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                      aria-label={`${p.name} 상세 분석 리포트 열람`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>분석 리포트</span>
                    </Link>
                    <Link
                      href={`/?id=${uid}`}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#F7F5EE] hover:bg-[#EFECE4] border border-[#E6E0D2] text-[#2B261F] font-bold text-xs transition-all active:scale-95 cursor-pointer text-center"
                      aria-label={`${p.name} 지도에서 위치 확인`}
                      title={`${p.name} 지도에서 위치 확인`}
                    >
                      <Map className="w-3.5 h-3.5 text-blue-600" />
                      <span>지도 보기</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* E. 하단 가로형 애드센스 광고 슬롯 */}
        <section aria-label="스폰서 광고">
          <AdSenseBanner format="horizontal" slotId={`gu-bottom-${encodeURIComponent(targetGu)}`} />
        </section>

        {/* F. 투자 유의사항 및 면책 고지 (Legal Disclaimer) */}
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

        {/* G. 하단 메인 허브 이동 링크 */}
        <div className="pt-2 text-center">
          <Link
            href="/districts/"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#FFFFFF] hover:bg-[#FDFBF7] border border-[#E6E0D2] text-xs sm:text-sm font-bold text-[#2B261F] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>← 서울시 25개 자치구 496개 전체 구역 색인으로 돌아가기</span>
          </Link>
        </div>
      </main>

      {/* 3. 푸터 */}
      <footer className="mt-16 border-t border-[#E6E0D2] py-8 px-4 text-center text-xs text-[#827A6D] space-y-2 bg-[#F5F2EB]">
        <p>서울시 정비사업 &amp; 신통·모아 통합 모니터링 플랫폼 | 데이터 출처: 서울시 정비사업 정보몽땅 및 서울 열린데이터광장</p>
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
