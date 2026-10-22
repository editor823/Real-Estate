import { Metadata } from "next";
import Link from "next/link";
import { DistrictsHubClient } from "@/components/districts/DistrictsHubClient";
import { GlobalFooter } from "@/components/navigation/GlobalFooter";

export const metadata: Metadata = {
  title: "서울시 496개 정비사업 구역별 분석 리포트 색인 | 재개발·신통기획·모아타운",
  description:
    "서울시 25개 자치구 496개 정비구역 전수 조사. 권리산정기준일, 사업 추진단계, 조합원 지위양도 전매제한 안전 진단 및 계획 세대수 분석 리포트를 검색하고 비교하세요.",
  openGraph: {
    title: "서울시 496개 정비사업 구역별 분석 리포트 색인 | 재개발·신통기획·모아타운",
    description:
      "서울시 25개 자치구 496개 정비구역 전수 조사. 권리산정기준일, 사업 추진단계, 조합원 지위양도 전매제한 안전 진단 및 계획 세대수 분석 리포트를 검색하고 비교하세요.",
    url: "https://seoul-redevelopment.pages.dev/districts/",
    type: "website",
  },
  alternates: {
    canonical: "https://seoul-redevelopment.pages.dev/districts/",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "홈",
      "item": "https://seoul-redevelopment.pages.dev/",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "구역별 분석 리포트 색인",
      "item": "https://seoul-redevelopment.pages.dev/districts/",
    },
  ],
};

export default function DistrictsHubPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2B261F] flex flex-col selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="flex-1">
        <DistrictsHubClient />
      </div>

      {/* 푸터 */}
      <GlobalFooter />
    </div>
  );
}
