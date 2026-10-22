import { Metadata } from "next";
import Link from "next/link";
import { Building2, ShieldCheck, Database, Award, ArrowLeft, Mail, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { GlobalFooter } from "@/components/navigation/GlobalFooter";

export const metadata: Metadata = {
  title: "서비스 소개 및 데이터 편집 원칙 (E-E-A-T) | 서울 경기 부동산 정비사업 모니터링",
  description:
    "서울시 25개 자치구와 경기도 31개 시·군 1,029개 재개발·재건축·신속통합기획·모아타운 구역 모니터링 플랫폼의 운영 목적, 공공데이터 수집 출처, 신뢰도 검증 정책 및 관리자 정보를 투명하게 소개합니다.",
  alternates: {
    canonical: "https://seoul-redevelopment.pages.dev/about/",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 space-y-10">
        {/* 상단 헤더 섹션 */}
        <div className="border-b border-gray-200 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>지도로 돌아가기</span>
            </Link>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              About & Editorial Policy
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            서울 경기 부동산 정비사업 모니터링 소개
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            복잡하고 파편화되어 있는 서울시 및 경기도 내 <strong>1,029개 재개발·재건축·신속통합기획·모아타운 구역</strong>의
            공간 GeoJSON 좌표, 인허가 단계 변화, 권리산정기준일, 조합원 지위양도 승계 안전성을 누구나 알기 쉽게 투명하게 제공하는
            <strong>공공데이터 기반 정비사업 종합 정보 플랫폼</strong>입니다.
          </p>
        </div>

        {/* 1. 핵심 운영 목적 & 이용자 가치 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">운영 목적 및 제공 가치</h2>
              <p className="text-xs text-gray-500">부동산 정비사업 정보의 비대칭을 해소하고 실수요자의 권익을 보호합니다</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-2xl">🗺️</span>
              <h3 className="font-bold text-gray-900 text-sm">공간 지리정보 전수 매핑</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                법정 정비구역의 경계 폴리곤과 중심 좌표(Centroid)를 지도상에 시각화하여 내 주변 개발 호재를 한눈에 확인할 수 있습니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-2xl">⚖️</span>
              <h3 className="font-bold text-gray-900 text-sm">입주권 승계 안전성 진단</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                도정법 제39조 조합원 지위양도 전매제한 기준일과 3년 지연 예외 승계 여부를 자동 판별하여 매수자의 재산권을 보호합니다.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-2xl">⚡</span>
              <h3 className="font-bold text-gray-900 text-sm">실시간 인허가 고시 피드</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                구역지정, 조합설립인가, 사업시행인가, 관리처분인가 등 핵심 인허가 고시일자를 최신순 타임라인 피드로 집계합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 2. 구글 E-E-A-T 기준 데이터 수집 출처 및 신뢰도 검증 원칙 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              📊
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">데이터 수집 출처 및 검증 기준 (E-E-A-T)</h2>
              <p className="text-xs text-gray-500">정부 및 지자체의 공신력 있는 공식 행정 고시 데이터를 기반으로 구축됩니다</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              본 플랫폼의 모든 데이터는 「공공데이터의 제공 및 이용 활성화에 관한 법률」에 따라 각 공공기관이 공개한 공식 고시 자료를
              정기적으로 크롤링 및 정제(Cleaning)하여 반영하고 있습니다.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block">서울시 정비사업 정보몽땅</strong>
                  <span className="text-[11px] text-gray-500">서울시 25개 자치구 정비사업 공사 현황 및 인허가 고시</span>
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block">경기부동산포털 (Gyeonggi Real Estate)</strong>
                  <span className="text-[11px] text-gray-500">경기도 31개 시·군 도시 및 주거환경정비사업 현황</span>
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block">국토교통부 토지이음 (Luris)</strong>
                  <span className="text-[11px] text-gray-500">용도지역, 지구단위계획구역 및 도시계획시설 공간 데이터</span>
                </div>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block">청약홈 (한국부동산원)</strong>
                  <span className="text-[11px] text-gray-500">수도권 아파트 일반분양 일정 및 청약 가점 산정 기준</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* 3. 부동산 금융·세무 계산기 산출 알고리즘 및 법적 산식 기준 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              🧮
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">금융·세무 계산기 산출 알고리즘 및 법적 산식 기준</h2>
              <p className="text-xs text-gray-500">도정법 제76조, 지방세법, 소득세법 및 금융위원회 스트레스 DSR 기준을 준용합니다</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-gray-600">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <strong className="text-gray-900 block font-bold text-sm">재개발·재건축 추가분담금</strong>
              <p className="text-xs text-gray-600 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-gray-200">
                분담금 = 조합원분양가 - (종전자산평가액 × 비례율)
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                관리처분인가 시 확정되는 조합원 권리가액 산식과 공사비 변동률에 따른 비례율 변화를 정밀 시뮬레이션합니다.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <strong className="text-gray-900 block font-bold text-sm">취득세 &amp; 양도소득세 감면 산식</strong>
              <p className="text-xs text-gray-600 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-gray-200">
                1주택(1~3%) · 생애최초 200만 감면 · 12억 초과 장특공(최대 80%)
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                2026년 현행 개정 세법에 맞춘 1세대 1주택 비과세 요건 및 보유·거주기간별 장기보유특별공제를 단계별로 공제합니다.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <strong className="text-gray-900 block font-bold text-sm">2026 스트레스 DSR 2단계</strong>
              <p className="text-xs text-gray-600 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-gray-200">
                연간 원리금 상환액 ÷ 연소득 ≤ 40% (스트레스 금리 가산)
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                수도권 은행권 주택담보대출에 적용되는 스트레스 가산 금리를 반영하여 실제 보수적 대출 한도를 산출합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 4. 사이트 운영자 정보 및 소통 창구 */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-3xl border border-blue-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Transparency & Contact
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              데이터 제보 및 서비스 문의
            </h2>
            <p className="text-xs text-gray-600 max-w-md leading-relaxed">
              최신 인허가 고시 변경사항 누락, 구역 경계 오기입, 권리산정일 수정 등 이용자 여러분의 소중한 제보와 의견을 상시 접수하고 있습니다.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4" />
            <span>문의 & 오류 제보하기 →</span>
          </Link>
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}
