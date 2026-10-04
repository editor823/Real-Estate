import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://seoul-redevelopment.pages.dev"),
  title: "서울시 재개발·신통기획 모니터링 지도 | 입주권 안전 진단",
  description:
    "서울시 496개 정비구역 실시간 현황, 신통기획·모아타운 후보지, 지위양도/현금청산 안전성 진단 및 예상 준공 타임라인",
  openGraph: {
    title: "서울시 재개발·신통기획 모니터링 지도 | 입주권 안전 진단",
    description:
      "서울시 496개 정비구역 실시간 현황, 신통기획·모아타운 후보지, 지위양도/현금청산 안전성 진단 및 예상 준공 타임라인",
    url: "https://seoul-redevelopment.pages.dev",
    siteName: "서울시 재개발 모니터링",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "서울시 재개발·신통기획 모니터링 지도 | 입주권 안전 진단",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "서울시 재개발·신통기획 모니터링 지도 | 입주권 안전 진단",
    description:
      "서울시 496개 정비구역 실시간 현황, 신통기획·모아타운 후보지, 지위양도/현금청산 안전성 진단 및 예상 준공 타임라인",
    images: ["/og-image.png"],
  },
};

import { GlobalNavBar } from "@/components/navigation/GlobalNavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans"
      >
        <QueryProvider>
          <GlobalNavBar />
          <div className="flex-1 min-h-0 flex flex-col">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}

