import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { GlobalNavBar } from "@/components/navigation/GlobalNavBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://seoul-redevelopment.pages.dev"),
  title: "서울시 정비사업 모니터링 플랫폼 | 496개 구역 지도·입주권 안전 진단",
  description:
    "서울시 25개 자치구 496개 재개발·재건축·신속통합기획·모아타운 구역의 인허가 단계, 권리산정기준일, 조합원 지위양도 승계 안전성 및 계획 세대수 공간 지도 전수 조회",
  openGraph: {
    title: "서울시 정비사업 모니터링 플랫폼 | 496개 구역 지도·입주권 안전 진단",
    description:
      "서울시 25개 자치구 496개 재개발·재건축·신속통합기획·모아타운 구역의 인허가 단계, 권리산정기준일, 조합원 지위양도 승계 안전성 및 계획 세대수 공간 지도 전수 조회",
    url: "https://seoul-redevelopment.pages.dev",
    siteName: "서울시 정비사업 모니터링",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "서울시 정비사업 모니터링 플랫폼 | 496개 구역 지도·입주권 안전 진단",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "서울시 정비사업 모니터링 플랫폼 | 496개 구역 지도·입주권 안전 진단",
    description:
      "서울시 25개 자치구 496개 재개발·재건축·신속통합기획·모아타운 구역의 인허가 단계, 권리산정기준일, 조합원 지위양도 승계 안전성 및 계획 세대수 공간 지도 전수 조회",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "서울시 정비사업 모니터링",
  "url": "https://seoul-redevelopment.pages.dev",
  "description": "서울시 25개 자치구 496개 재개발·재건축·신속통합기획·모아타운 구역의 인허가 단계, 권리산정기준일, 지위양도 안전성 공간 지도 전수 모니터링 플랫폼",
  "inLanguage": "ko-KR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning className="h-full antialiased font-sans">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-slate-50 text-gray-900 font-sans"
      >
        <QueryProvider>
          <GlobalNavBar />
          <div className="flex-1 min-h-0 flex flex-col">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}


