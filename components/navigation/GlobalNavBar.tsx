"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, FileText, Zap, Calendar } from "lucide-react";
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
  const isSubscriptionActive = pathname?.startsWith("/subscription");
  const isMapActive = pathname === "/" && !isTimelineActive;

  return (
    <header className="sticky top-0 z-[700] w-full h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 text-gray-900 select-none shrink-0 shadow-xs">
      <div className="w-full h-full px-2 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* 서비스 로고: 맨 좌측 사이드바 라인과 일치 */}
        <Link
          href="/"
          onClick={() => setIsTimelineActive(false)}
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          aria-label="서울 경기 부동산 정비사업 모니터링 홈으로 이동"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            서경
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                서울 경기 정비사업
              </span>
              <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                1,029개소
              </span>
            </div>
          </div>
        </Link>

        {/* 메인 GNB 메뉴 */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1" aria-label="메인 내비게이션">
          {/* 메뉴 1: 정비사업 지도 */}
          <Link
            href="/"
            onClick={() => setIsTimelineActive(false)}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0",
              isMapActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            aria-current={isMapActive ? "page" : undefined}
          >
            <Map className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isMapActive ? "text-white" : "text-blue-600")} />
            <span>🗺️ <span className="hidden sm:inline">정비사업 </span>지도</span>
          </Link>

          {/* 메뉴 2: 구역별 분석 리포트 */}
          <Link
            href="/districts/"
            onClick={() => setIsTimelineActive(false)}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0",
              isDistrictsActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            aria-current={isDistrictsActive ? "page" : undefined}
          >
            <FileText className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isDistrictsActive ? "text-white" : "text-emerald-600")} />
            <span>📑 <span className="hidden sm:inline">구역별 </span>리포트</span>
          </Link>

          {/* 메뉴 3: 아파트 분양·청약 (구 청약·공모주에서 부동산 전용으로 리브랜딩) */}
          <Link
            href="/subscription"
            onClick={() => setIsTimelineActive(false)}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0",
              isSubscriptionActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            aria-current={isSubscriptionActive ? "page" : undefined}
          >
            <Calendar className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isSubscriptionActive ? "text-white" : "text-violet-600")} />
            <span>🎯 <span className="hidden sm:inline">아파트 </span>분양·청약</span>
          </Link>

          {/* 메뉴 4: 실시간 고시 알림 */}
          <Link
            href="/?tab=timeline"
            onClick={() => setIsTimelineActive(true)}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0",
              isTimelineActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            title="실시간 고시 알림 피드"
            aria-current={isTimelineActive ? "page" : undefined}
          >
            <Zap className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isTimelineActive ? "text-white" : "text-amber-500")} />
            <span>⚡ <span className="hidden sm:inline">실시간 </span>고시 알림</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
