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
  title: "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼",
  description:
    "서울시 496개 정비구역과 신통기획·모아타운 공간 경계 및 실시간 인허가 단계 변화를 추적하는 통합 모니터링 플랫폼",
  openGraph: {
    title: "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼",
    description:
      "서울시 496개 정비구역과 신통기획·모아타운 공간 경계 및 실시간 인허가 단계 변화를 추적하는 통합 모니터링 플랫폼",
    url: "https://seoul-redevelopment.pages.dev",
    siteName: "서울시 정비사업 모니터링",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼",
    description:
      "서울시 496개 정비구역과 신통기획·모아타운 공간 경계 및 실시간 인허가 단계 변화를 추적하는 통합 모니터링 플랫폼",
    images: ["/og-image.jpg"],
  },
};

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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
