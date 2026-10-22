"use client";

import Link from "next/link";
import {
  Map,
  FileText,
  Calendar,
  Calculator,
  ArrowUp,
  ShieldCheck,
  Building2,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Search,
} from "lucide-react";

interface HomeLandingSectionProps {
  totalDistrictCount?: number;
}

export function HomeLandingSection({
  totalDistrictCount = 1029,
}: HomeLandingSectionProps = {}) {
  return (
    <section className="w-full bg-slate-50 border-t border-slate-200 select-none">
      {/* 1. 서비스 소개 히어로 영역 */}
      <div className="bg-gradient-to-b from-white to-slate-50 py-16 px-4 sm:px-8 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>수도권 정비사업 빅데이터 실시간 통합 플랫폼</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            서울·경기 {totalDistrictCount.toLocaleString()}개 정비사업,
            <br />
            복잡한 고시문 대신 <span className="text-blue-600">지도로 한눈에</span> 확인하세요
          </h2>

          <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            서울 25개 자치구와 경기 31개 시·군의 재개발·재건축·신속통합기획·모아타운 구역 정보부터 
            인허가 단계, 권리산정기준일, 조합원 지위양도 안전성, 청약 캘린더, 대출·세금 계산기까지
            스마트한 내 집 마련을 위한 모든 데이터가 100% 무료로 제공됩니다.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            <Link
              href="/"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Map className="w-4 h-4" />
              <span>🗺️ 실시간 구역 지도로 탐색하기</span>
            </Link>

            <Link
              href="/districts/"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>구역별 분석 리포트 색인</span>
            </Link>

            <Link
              href="/subscription"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-violet-600" />
              <span>분양 &amp; 청약 라운지</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 서울경기정비 4대 핵심 서비스 솔루션 카드 그리드 */}
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            CORE FEATURES
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900">
            부동산 의사결정을 돕는 4대 핵심 서비스
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            흩어져 있던 지자체 고시문과 사업시행인가 도면을 디지털 공간 정보로 통합했습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 카드 1: 공간 지도 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Map className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">실시간 인허가 공간 지도</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                서울·경기 1,029개 구역의 법정 경계 GeoJSON을 시각화합니다. 지하철 500m 역세권 및 초품아 300m 안심 학군 레이어를 원클릭으로 켜고 끌 수 있습니다.
              </p>
            </div>
            <Link
              href="/"
              className="pt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>지도에서 구역 찾기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 카드 2: 구역 분석 리포트 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">1,029개 구역별 분석 리포트</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                권리산정기준일 물딱지 방지 점검, 조합원 지위양도 승계 가능 여부, 총 세대수 대비 일반분양 비율 등 정밀 투자 분석 지표를 제공합니다.
              </p>
            </div>
            <Link
              href="/districts/"
              className="pt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>리포트 색인 바로가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 카드 3: 분양·청약 라운지 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">수도권 분양 &amp; 청약 캘린더</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                디에이치 대치 에델루이, 래미안 원페를라 등 주요 단지 청약 일정, 분양가, 당첨 안정가점 및 84점 만점 청약 가점 진단기를 지원합니다.
              </p>
            </div>
            <Link
              href="/subscription"
              className="pt-2 text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 cursor-pointer"
            >
              <span>청약 캘린더 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 카드 4: 부동산 계산기 3종 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">전문 금융·세무 계산기 3종</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                조합원 추정 분담금 시뮬레이션, 취득세·양도소득세 감면율 산정, 2026 최신 스트레스 DSR 3단계 대출 한도를 한 곳에서 즉시 계산합니다.
              </p>
            </div>
            <Link
              href="/calculators"
              className="pt-2 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <span>계산기 실행하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 초보자를 위한 정비사업 8단계 핵심 로드맵 가이드 */}
      <div className="bg-white py-16 px-4 sm:px-8 border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              STEP BY STEP GUIDE
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900">
              초보자를 위한 정비사업 8단계 핵심 흐름
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              구역마다 단계가 다르면 투자 시기와 프리미엄, 위험도가 완전히 달라집니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="font-bold text-slate-900 text-sm">정비구역 지정</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                노후도와 접도율 요건을 통과하여 법정 정비사업 구역으로 확정되는 단계입니다. (초기 투자, 소액 진입 가능)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="font-bold text-slate-900 text-sm">조합설립인가</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                주민 동의율 75%를 확보하여 정식 사업 주체인 조합이 설립됩니다. 투기과열지구 재건축은 이때부터 조합원 지위양도가 제한됩니다.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span className="font-bold text-slate-900 text-sm">사업시행인가</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                새 아파트의 동·층수, 세대수, 건축 도면이 확정되는 중요한 관문입니다. 시공사 본계약과 감정평가가 뒤따릅니다.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                <span className="font-bold text-slate-900 text-sm">관리처분인가</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                조합원 분담금과 일반분양 물량이 최종 확정되는 '7부 능선'입니다. 투기과열지구 재개발도 이 시점부터 지위양도가 엄격히 제한됩니다.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">5</span>
                <span className="font-bold text-slate-900 text-sm">이주 및 철거</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                주민들이 이주비를 지급받고 기존 건축물을 철거합니다. 멸실 등기 이후 토지분 취득세(4.6%)가 적용됩니다.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">6</span>
                <span className="font-bold text-slate-900 text-sm">착공 및 일반분양</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                실제 아파트 착공에 들어가며 청약홈을 통해 일반분양 청약 접수가 진행됩니다.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">7</span>
                <span className="font-bold text-slate-900 text-sm">준공인가 및 입주</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                신축 아파트 공사가 완료되어 사전점검을 거쳐 입주증을 발급받고 입주를 시작합니다.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">8</span>
                <span className="font-bold text-slate-900 text-sm">이전고시 및 청산</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                대지권 등기가 완료되고 조합이 최종 회계 정산 후 해산·청산하는 최종 마무리 단계입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 수도권 정비사업 빅데이터 통계 및 신뢰성 안내 */}
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">총 모니터링 정비구역</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">1,029개소</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">서울 496 / 경기 533</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">신속통합·모아타운</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">180+ 구역</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">서울시 공모 선정지</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">공공데이터 매일 동기화</span>
            <p className="text-2xl sm:text-3xl font-black text-violet-600 mt-1">100%</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">국토부·서울시 공문서</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">이용 요금 및 광고 정책</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">평생 무료</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">회원가입 없이 즉시 조회</span>
          </div>
        </div>

        {/* 실시간 구역 지도로 돌아가기 버튼 바 */}
        <div className="pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span>실시간 구역 지도로 바로 이동하기</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
