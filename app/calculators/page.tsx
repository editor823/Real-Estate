import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalculatorHub } from "@/components/calculators";
import { GlobalFooter } from "@/components/navigation/GlobalFooter";

export const metadata: Metadata = {
  title: "부동산 금융·세무 계산기 허브 | 재개발 분담금, 취득세·양도세, DSR 대출한도",
  description:
    "재개발·재건축 조합원 예상 분담금 및 비례율 시뮬레이터, 생애최초 주택 취득세 및 1세대 1주택 양도소득세 비과세 계산기, 2026 스트레스 DSR 2단계 주택담보대출 한도 및 월 상환액 무료 계산",
  openGraph: {
    title: "부동산 금융·세무 계산기 허브 | 서울·경기 정비사업 모니터링",
    description:
      "재개발 분담금, 비례율, 취득세, 양도소득세, DSR·LTV 대출 한도 및 월 상환액을 한 번에 계산하는 부동산 실전 계산기",
    url: "https://seoul-redevelopment.pages.dev/calculators/",
    type: "website",
  },
  alternates: {
    canonical: "https://seoul-redevelopment.pages.dev/calculators/",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "홈",
      "item": "https://seoul-redevelopment.pages.dev/",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "부동산 금융·세무 계산기 허브",
      "item": "https://seoul-redevelopment.pages.dev/calculators/",
    },
  ],
};

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* 메인 계산기 허브 영역 (Suspense 적용) */}
      <main className="flex-1 w-full py-6 sm:py-8 space-y-6">
        {/* 상단 시맨틱 헤더 & 도입부 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                실전 부동산 시뮬레이터
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                2026 개정 세법 &amp; DSR 2단계 산식
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              부동산 금융·세무 계산기 허브
            </h1>

            <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
              복잡하고 분쟁이 잦은 <strong>재개발·재건축 조합원 예상 분담금(비례율)</strong>, 
              생애최초 감면 및 1세대 1주택 비과세가 반영된 <strong>취득세·양도소득세</strong>, 
              그리고 2026년 차주별 규제가 적용된 <strong>스트레스 DSR 2단계 대출 한도와 월 상환액</strong>을 
              공식 법정 산식에 따라 원클릭으로 정밀 시뮬레이션합니다.
            </p>
          </div>
        </section>

        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500 font-bold">
              부동산 계산기를 불러오는 중입니다...
            </div>
          }
        >
          <CalculatorHub />
        </Suspense>
      </main>

      {/* 하단 글로벌 푸터 */}
      <GlobalFooter />
    </div>
  );
}
