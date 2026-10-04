import { Metadata } from "next";
import Link from "next/link";
import { DistrictsHubClient } from "@/components/districts/DistrictsHubClient";

export const metadata: Metadata = {
  title: "서울시 496개 정비사업 구역별 분석 리포트 색인 | 재개발·신통기획·모아타운",
  description:
    "서울시 25개 자치구 정비사업 496개 구역의 사업 단계, 권리산정일, 입주권 승계 안전성 및 세대수 분석 리포트 모음",
  openGraph: {
    title: "서울시 496개 정비사업 구역별 분석 리포트 색인 | 재개발·신통기획·모아타운",
    description:
      "서울시 25개 자치구 정비사업 496개 구역의 사업 단계, 권리산정일, 입주권 승계 안전성 및 세대수 분석 리포트 모음",
    url: "https://seoul-redevelopment.pages.dev/districts/",
    type: "website",
  },
};

export default function DistrictsHubPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2B261F] flex flex-col selection:bg-blue-600 selection:text-white">
      <div className="flex-1">
        <DistrictsHubClient />
      </div>

      {/* 푸터 */}
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
