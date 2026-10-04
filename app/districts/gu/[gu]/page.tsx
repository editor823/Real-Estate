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

interface GuPageProps {
  params: Promise<{ gu: string }>;
}

// 1. Next.js Static HTML Export (SSG) - 25개 자치구 정적 HTML 모두 사전 생성
export async function generateStaticParams() {
  return SEOUL_25_GUS.map((gu) => ({
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

  return {
    title: `${targetGu} 정비사업 재개발·신통기획·모아타운 구역 현황 리포트 (${count}개소) | 서울시 정비사업 모니터링`,
    description: `서울특별시 ${targetGu} 내 추진 중인 정비사업 ${count}개 구역의 총 ${totalH.toLocaleString()}세대 공급 계획, 단계별 추진 현황, 권리산정일 및 입주권 전매 제한 안전 진단 리포트`,
    openGraph: {
      title: `${targetGu} 정비사업 리포트 | ${count}개 구역 총 ${totalH.toLocaleString()}세대`,
      description: `서울특별시 ${targetGu} 정비사업 구역별 추진단계, 고시일자, 입주권 승계 안전성 상세 분석`,
      url: `https://seoul-redevelopment.pages.dev/districts/gu/${encodeURIComponent(targetGu)}/`,
      type: "article",
    },
  };
}

export default async function GuDistrictsPage({ params }: GuPageProps) {
  const resolvedParams = await params;
  const targetGu = decodeURIComponent(resolvedParams.gu);

  // 25개 유효 자치구 검증
  if (!SEOUL_25_GUS.includes(targetGu)) {
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

  // 사업 유형별 집계
  const sinthongCount = guDistricts.filter((f) => f.properties.biz_type === "SINTHONG").length;
  const moaCount = guDistricts.filter((f) => f.properties.biz_type === "MOA").length;
  const normalCount = totalDistricts - sinthongCount - moaCount;

  // 법정동 목록 추출
  const dongs = Array.from(
    new Set(guDistricts.map((f) => f.properties.legal_dong).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2B261F] selection:bg-blue-600 selection:text-white flex flex-col">
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
            <span className="text-blue-600 font-bold">{targetGu}</span>
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
              서울특별시 {targetGu}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#FDFBF7] text-[#4A4439] border border-[#E6E0D2]">
              정비사업 집중 모니터링
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight leading-tight">
            {targetGu} 정비사업 현황 리포트 (총 {totalDistricts}개 구역)
          </h1>

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

        {/* B. 상단 구글 애드센스 300x250 광고 영역 */}
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
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>분석 리포트</span>
                    </Link>
                    <Link
                      href={`/?id=${uid}`}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#F7F5EE] hover:bg-[#EFECE4] border border-[#E6E0D2] text-[#2B261F] font-bold text-xs transition-all active:scale-95 cursor-pointer text-center"
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

        {/* F. 하단 메인 허브 이동 링크 */}
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
