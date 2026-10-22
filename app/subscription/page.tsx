import { Metadata } from "next";
import Link from "next/link";
import { FeatureHub } from "@/components/subscription";
import { GlobalFooter } from "@/components/navigation/GlobalFooter";

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

      {/* 푸터 영역 */}
      <GlobalFooter />
    </div>
  );
}
