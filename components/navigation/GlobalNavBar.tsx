"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, FileText, Zap, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function GlobalNavBar() {
  const pathname = usePathname();
  const [isTimelineActive, setIsTimelineActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTab = () => {
        const params = new URLSearchParams(window.location.search);
        setIsTimelineActive(pathname === "/" && params.get("tab") === "timeline");
      };
      checkTab();
      window.addEventListener("popstate", checkTab);
      return () => window.removeEventListener("popstate", checkTab);
    }
  }, [pathname]);

  const isDistrictsActive = pathname?.startsWith("/districts");
  const isMapActive = pathname === "/" && !isTimelineActive;

  return (
    <header className="sticky top-0 z-[700] w-full h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 text-gray-900 select-none shrink-0 shadow-xs">
      <div className="w-full h-full px-3 sm:px-6 flex items-center justify-between gap-3">
        {/* 서비스 로고: 맨 좌측 사이드바 라인과 일치 */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            서
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                서울시 정비사업 모니터링
              </span>
              <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                496개소
              </span>
            </div>
          </div>
        </Link>

        {/* 메인 GNB 메뉴 */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* 메뉴 1: 정비사업 지도 */}
          <Link
            href="/"
            onClick={() => setIsTimelineActive(false)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              isMapActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Map className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isMapActive ? "text-white" : "text-blue-600")} />
            <span>🗺️ 정비사업 지도</span>
          </Link>

          {/* 메뉴 2: 구역별 분석 리포트 */}
          <Link
            href="/districts/"
            onClick={() => setIsTimelineActive(false)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              isDistrictsActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <FileText className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isDistrictsActive ? "text-white" : "text-emerald-600")} />
            <span>📑 구역별 분석 리포트</span>
          </Link>

          {/* 메뉴 3: 실시간 고시 */}
          <Link
            href="/?tab=timeline"
            onClick={() => setIsTimelineActive(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              isTimelineActive
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Zap className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isTimelineActive ? "text-white" : "text-amber-500")} />
            <span className="hidden xs:inline">⚡ 실시간 고시</span>
            <span className="xs:hidden">⚡ 고시</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
