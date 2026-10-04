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
  title: "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼",
  description:
    "서울시 496개 정비구역과 200+ 신통기획·모아타운 공간 경계 및 실시간 인허가 단계 변화를 추적하는 모니터링 플랫폼",
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
