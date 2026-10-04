import { Metadata } from "next";
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
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      <DistrictsHubClient />
    </div>
  );
}
