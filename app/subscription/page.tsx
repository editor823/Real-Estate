import { Metadata } from "next";
import Link from "next/link";
import { FeatureHub } from "@/components/subscription";

export const metadata: Metadata = {
  title: "수도권 아파트 분양 & 청약 라운지 | 서울·경기 정비사업 모니터링",
  description:
    "수도권 재건축·재개발 아파트 일반분양 및 장기전세(미리내집) 일정 캘린더, 서울 당첨 안정권 84점 만점 청약 가점 진단기",
  openGraph: {
    title: "수도권 아파트 분양 & 청약 라운지 | 서울·경기 정비사업 모니터링",
    description:
      "수도권 재건축·재개발 아파트 일반분양 및 장기전세(미리내집) 일정 캘린더, 서울 당첨 안정권 84점 만점 청약 가점 진단기",
    url: "https://seoul-redevelopment.pages.dev/subscription/",
    type: "website",
  },
  alternates: {
    canonical: "https://seoul-redevelopment.pages.dev/subscription/",
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
      "name": "수도권 아파트 분양 & 청약 라운지",
      "item": "https://seoul-redevelopment.pages.dev/subscription/",
    },
  ],
};

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* 아파트 분양 & 청약 메인 기능 허브 컴포넌트 */}
      <main className="flex-1 w-full py-4 sm:py-6">
        <FeatureHub />
      </main>

      {/* 푸터 영역: 구글 애드센스 규정 준수 및 면책 고지 */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-8 px-4 text-center text-xs text-gray-500 space-y-2">
        <p className="max-w-3xl mx-auto leading-relaxed">
          수도권 아파트 분양 및 장기전세 일정, 청약 가점 계산 시뮬레이션 결과는 참고용 정보이며 실제 청약 신청 전 한국부동산원 청약홈(Applyhome)의 공식 입주자모집공고문을 반드시 확인하시기 바랍니다.
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
