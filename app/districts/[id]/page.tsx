import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { DISTRICTS_GEOJSON } from "@/lib/constants/districtsData";
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
} from "lucide-react";

interface DistrictPageProps {
  params: Promise<{ id: string }>;
}

// 1. Next.js Static HTML Export를 위한 496개 전체 구역 정적 파라미터 생성
export async function generateStaticParams() {
  const features = DISTRICTS_GEOJSON.features || [];
  return features.map((f) => ({
    id: f.properties.master_uid || f.id,
  }));
}

// 2. 구글 SEO 및 SNS 공유를 위한 구역별 맞춤형 메타데이터 생성
export async function generateMetadata({
  params,
}: DistrictPageProps): Promise<Metadata> {
  const { id } = await params;
  const feature = DISTRICTS_GEOJSON.features.find(
    (f) => f.properties.master_uid === id || f.id === id
  );

  if (!feature) {
    return {
      title: "구역을 찾을 수 없습니다 | 서울시 정비사업 모니터링",
    };
  }

  const props = feature.properties;
  const title = `${props.name} (${props.gu}) 재개발·정비사업 추진현황 및 입주권 분석`;
  const description = `${props.gu} ${props.legal_dong} ${props.name} - 사업유형: ${props.biz_type_label}, 현재단계: ${props.stage_label || props.stage_raw}, 공급규모: ${props.total_households ? props.total_households.toLocaleString() + "세대" : "계획중"}. 지위양도 가능 여부 및 권리산정일 기준 안전성 상세 분석 보고서`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://seoul-redevelopment.pages.dev/districts/${id}`,
      siteName: "서울시 재개발 모니터링",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${props.name} 정비구역 분석 보고서`,
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
  const feature = DISTRICTS_GEOJSON.features.find(
    (f) => f.properties.master_uid === id || f.id === id
  );

  if (!feature) {
    notFound();
  }

  const props = feature.properties;
  const totalH = props.total_households || 0;
  const existH = props.existing_households || 0;
  const saleH = props.sale_households || 0;
  const rentH = props.rent_households || 0;

  // 동일 자치구의 연관 구역 4곳 추천 (내부 링크 SEO 강화)
  const nearbyDistricts = DISTRICTS_GEOJSON.features
    .filter(
      (f) =>
        f.properties.gu === props.gu &&
        (f.properties.master_uid || f.id) !== (props.master_uid || id)
    )
    .slice(0, 4);

  // 정비사업 8단계 흐름 정의
  const allStages = [
    { seq: 1, name: "기본계획 / 구역지정", code: "PLAN_DESIGNATION", avgYears: "1.5년" },
    { seq: 2, name: "추진위원회 승인", code: "PROMOTION_COMMITTEE", avgYears: "1.2년" },
    { seq: 3, name: "조합설립 인가", code: "UNION_AUTH", avgYears: "2.1년" },
    { seq: 4, name: "사업시행 인가", code: "BUSINESS_AUTH", avgYears: "2.8년" },
    { seq: 5, name: "관리처분 인가", code: "MGMT_DISPOSAL", avgYears: "1.9년" },
    { seq: 6, name: "이주 및 철거 / 착공", code: "CONSTRUCTION_START", avgYears: "1.5년" },
    { seq: 7, name: "준공 및 입주", code: "COMPLETION", avgYears: "3.2년" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>← 메인 지도로 돌아가기</span>
          </Link>
          <span className="text-slate-700">|</span>
          <nav className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link href="/" className="hover:text-blue-400">서울시</Link>
            <span>›</span>
            <span className="text-slate-300">{props.gu}</span>
            <span>›</span>
            <span className="text-blue-400 font-bold truncate max-w-[140px] sm:max-w-xs">{props.name}</span>
          </nav>
        </div>

        {/* 인터랙티브 지도에서 보기 버튼 */}
        <Link
          href={`/?id=${props.master_uid}`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Map className="w-3.5 h-3.5" />
          <span>지도에서 바로 보기</span>
        </Link>
      </header>

      {/* 2. 본문 컨테이너 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* A. 히어로 섹션 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {props.gu}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {props.biz_type_label}
            </span>
            <StageBadge stageCode={props.stage_code} className="text-xs py-0.5 px-2.5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {props.name}
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-2.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{props.legal_dong} {props.address_jibun}</span>
            </div>
            {props.address_doro && (
              <span className="text-slate-500">({props.address_doro})</span>
            )}
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>최근 고시: {props.approval_date}</span>
            </div>
          </div>

          {/* 핵심 KPI 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">건립 예정 세대</span>
              <strong className="text-lg font-extrabold text-white">
                {totalH > 0 ? `${totalH.toLocaleString()}세대` : "계획중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">기존 가구수 (멸실)</span>
              <strong className="text-lg font-extrabold text-slate-300">
                {existH > 0 ? `${existH.toLocaleString()}가구` : "집계중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">주민 동의율</span>
              <strong className="text-lg font-extrabold text-blue-400">
                {props.consent_rate ? `${props.consent_rate}%` : "추진중"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">입주권 승계 안전성</span>
              <strong className={`text-base font-extrabold ${props.is_transferable ? "text-emerald-400" : "text-rose-400"}`}>
                {props.is_transferable ? "지위양도 가능" : "전매 제한 주의"}
              </strong>
            </div>
          </div>
        </section>

        {/* B. 상단 구글 애드센스 광고 슬롯 (300x250) */}
        <section aria-label="스폰서 광고">
          <AdSenseBanner slotId={`district-top-${props.master_uid}`} className="bg-slate-900/60 border-slate-800" />
        </section>

        {/* C. 사업장 기본 정보 상세 명세서 (텍스트 및 표) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">구역 기본 정보 및 건축 계획 명세</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <tbody className="divide-y divide-slate-800">
                <tr className="border-t border-slate-800">
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold w-1/4">사업 명칭</th>
                  <td className="py-3 px-4 font-bold text-white">{props.name}</td>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold w-1/4">사업 유형</th>
                  <td className="py-3 px-4">{props.biz_type_label} ({props.biz_type})</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">관할 자치구</th>
                  <td className="py-3 px-4 font-medium text-slate-200">{props.gu} ({props.sido_sugg_code})</td>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">법정동 및 지번</th>
                  <td className="py-3 px-4">{props.legal_dong} {props.address_jibun}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">현재 추진 단계</th>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-300">{props.stage_label || props.stage_raw}</span>
                    <span className="text-slate-500 text-[11px] ml-1.5">({props.stage_seq}단계 진행중)</span>
                  </td>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">최근 인허가 고시일</th>
                  <td className="py-3 px-4 font-mono">{props.approval_date || "미고시"}</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">계획 총 세대수</th>
                  <td className="py-3 px-4 font-bold text-white">
                    {totalH > 0 ? `${totalH.toLocaleString()}세대` : "미정"}
                  </td>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">일반분양 / 임대주택</th>
                  <td className="py-3 px-4">
                    분양: {saleH > 0 ? `${saleH.toLocaleString()}세대` : "-"} / 
                    임대: {rentH > 0 ? `${rentH.toLocaleString()}세대` : "-"}
                  </td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">주민 동의율</th>
                  <td className="py-3 px-4">{props.consent_rate ? `${props.consent_rate}%` : "정보 준비중"}</td>
                  <th className="py-3 px-4 bg-slate-950/40 text-slate-400 font-semibold">공공연계 호재</th>
                  <td className="py-3 px-4">{props.is_adjacent_public ? "선정 및 인프라 확충 연계" : "해당 없음"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* D. 서울시 정비사업 8단계 타임라인 및 예상 준공 소요 기간 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">정비사업 단계별 타임라인 & 소요 시간 분석</h2>
            </div>
            <span className="text-xs text-slate-400">서울시 평균 소요: 약 9.8년</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {allStages.map((stage) => {
              const isPassed = props.stage_seq > stage.seq;
              const isCurrent = props.stage_seq === stage.seq;

              return (
                <div
                  key={stage.seq}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-blue-900/30 border-blue-500 shadow-md ring-1 ring-blue-500/50"
                      : isPassed
                      ? "bg-slate-950/60 border-slate-800 opacity-80"
                      : "bg-slate-950/30 border-slate-800/40 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400">STEP 0{stage.seq}</span>
                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500 text-white animate-pulse">
                        현재 진행
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xs font-bold mb-1 ${isCurrent ? "text-blue-300" : "text-slate-200"}`}>
                    {stage.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">평균 소요: {stage.avgYears}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* E. [핵심 분석 1 & 2] 입주권 승계 및 현금청산 주의사항 자가진단 해설 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">입주권 승계 및 현금청산 주의사항 자가진단 해설</h2>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                1. 투기과열지구 조합원 지위양도 제한 요건 점검
              </h3>
              <p>
                「도시 및 주거환경정비법」 제39조 제2항에 따라, 투기과열지구 내 <strong>재개발 사업은 관리처분계획인가 이후</strong>부터, 
                <strong>재건축 사업은 조합설립인가 이후</strong>부터 건축물 또는 토지를 양수한 자는 조합원 입주권을 취득할 수 없으며 현금청산 대상이 됩니다.
              </p>
              <p className="text-slate-400">
                본 구역({props.name})은 현재 <strong>{props.stage_label || props.stage_raw}</strong> 단계로, 
                {props.is_transferable
                  ? " 현행 규정상 원칙적으로 조합원 지위양도 및 입주권 승계가 가능한 단계로 진단됩니다."
                  : " 규제 단계에 진입하여 법정 예외 거래 사유를 갖춘 매물인지 계약 전 관할 구청 및 조합 확인이 필수적입니다."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                2. 법정 지위양도 예외 거래 사유 (1주택 장기보유 특례)
              </h3>
              <p>
                규제 이후에도 다음의 법정 요건을 만족하는 매물은 예외적으로 조합원 지위양도가 인정됩니다:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong>1세대 1주택자</strong>로서 소유 기간 <strong>10년 이상</strong> 및 거주 기간 <strong>5년 이상</strong>을 동시에 충족한 원 조합원의 매물</li>
                <li>세대원의 근무상 또는 생업상의 사정, 질병 치료, 취학, 결혼으로 세대원 전원이 타 시·군으로 이전하는 경우</li>
                <li>상속으로 취득한 주택으로 세대원 전원이 이전하거나, 해외로 전원 이주 또는 2년 이상 체류하는 경우</li>
                <li>조합설립인가일로부터 3년 이상 사업시행인가 미신청 또는 인가일로부터 3년 이상 미착공 등 법정 사업 지연 구역의 3년 이상 보유 물건</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                3. 권리산정기준일 이후 신축 지분쪼개기 청산 리스크
              </h3>
              <p>
                서울시 신속통합기획 및 모아타운 후보지의 경우, 지분쪼개기를 통한 투기 방지를 위해 정비구역 공모일 또는 고시일로 
                <strong>'권리산정기준일'</strong>이 지정됩니다. 권리산정일 이후 완공된 신축 다세대·빌라를 매수할 경우 단독 분양자격이 부여되지 않고 
                종전 토지 지분 기준으로 <strong>강제 현금청산</strong>될 수 있으므로, 반드시 건축물대장상 사용승인일자와 권리산정일을 대조 확인해야 합니다.
              </p>
            </div>
          </div>
        </section>

        {/* F. 하단 가로형 애드센스 광고 슬롯 */}
        <section aria-label="스폰서 광고">
          <AdSenseBanner format="horizontal" slotId={`district-bottom-${props.master_uid}`} className="bg-slate-900/60 border-slate-800" />
        </section>

        {/* H. 지도에서 구역 위치 바로보기 대형 CTA 버튼 */}
        <div className="pt-1">
          <Link
            href={`/?id=${props.master_uid}`}
            className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>지도에서 구역 위치 및 마커 포커스 바로보기</span>
          </Link>
        </div>

        {/* G. 동일 자치구({props.gu}) 인근 주요 정비구역 추천 (SEO 내부 링크 클러스터링) */}
        {nearbyDistricts.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">{props.gu} 인근 주요 정비구역 함께 보기</h2>
              </div>
              <Link href="/" className="text-xs text-blue-400 hover:underline">
                전체 496개 구역 보기 →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nearbyDistricts.map((item) => (
                <Link
                  key={item.properties.master_uid}
                  href={`/districts/${item.properties.master_uid}`}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {item.properties.gu}
                    </span>
                    <StageBadge stageCode={item.properties.stage_code} className="text-[10px]" />
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    {item.properties.name}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                    <span>{item.properties.legal_dong}</span>
                    <strong className="text-slate-300">
                      {item.properties.total_households ? `${item.properties.total_households.toLocaleString()}세대` : "계획중"}
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 3. 하단 푸터 */}
      <footer className="mt-16 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p>서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼 | 데이터 출처: 서울시 정비사업 정보몽땅 및 서울 열린데이터광장</p>
        <p className="flex items-center justify-center gap-3 text-slate-400">
          <span>© 2026 Seoul Redevelopment Monitoring.</span>
          <span>•</span>
          <Link href="/privacy" className="hover:text-blue-400 underline font-medium">개인정보처리방침</Link>
        </p>
      </footer>
    </div>
  );
}
