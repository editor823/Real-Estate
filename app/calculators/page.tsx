import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalculatorHub } from "@/components/calculators";

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
      <main className="flex-1 w-full py-4 sm:py-6">
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

      {/* 하단 푸터: 구글 애드센스 규정 준수 및 면책 고지 */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-8 px-4 text-center text-xs text-gray-500 space-y-2">
        <p className="max-w-3xl mx-auto leading-relaxed">
          본 계산기에서 제공하는 재개발·재건축 분담금, 비례율, 취득세, 양도소득세, DSR·LTV 대출 한도 산출 결과는 관련 세법 및 금융 규제에 기반한 시뮬레이션 참고용이며, 실제 납부 세액 및 대출 승인 금액은 개별 조합 총회 의결 및 금융기관 심사에 따라 달라질 수 있습니다.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2 text-gray-500 font-medium">
          <span>© 2026 Seoul Redevelopment Monitoring.</span>
          <span>•</span>
          <Link href="/privacy/" className="hover:text-blue-600 underline">
            개인정보처리방침
          </Link>
          <span>•</span>
          <Link href="/terms/" className="hover:text-blue-600 underline">
            이용약관 및 면책조항
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-blue-600 underline">
            정비사업 지도 홈
          </Link>
        </div>
      </footer>
    </div>
  );
}
