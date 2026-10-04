"use client";

import { useEffect } from "react";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdSenseBannerProps {
  className?: string;
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal";
}

/**
 * 구글 애드센스 (Google AdSense) 반응형 광고 배너 컴포넌트
 * - 애드센스 승인 후 client ID 및 slot ID를 주입하면 실제 광고로 동작합니다.
 * - 현재는 승인 심사 및 지면 확보를 위한 표준 300x250 반응형 컨테이너를 제공합니다.
 */
export function AdSenseBanner({
  className,
  slotId = "default-slot",
  format = "rectangle",
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      // 애드센스 스크립트가 로드되었을 경우 광고 푸시
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // 개발 환경 에러 무시
    }
  }, []);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-dashed border-[#d8d2c5] bg-[#efece6] p-3 flex flex-col items-center justify-center text-center transition-all",
        format === "rectangle" ? "min-h-[250px]" : "min-h-[100px]",
        className
      )}
    >
      {/* 상단 라벨 */}
      <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
        <Megaphone className="w-3 h-3 text-stone-500" />
        <span>SPONSORED AD (300×250)</span>
      </div>

      {/* 실제 애드센스 스크립트 슬롯 영역 (승인 후 data-ad-client 추가) */}
      <div className="w-full flex-1 flex flex-col items-center justify-center py-6 px-4">
        {/* 추후 구글 애드센스 코드 교체 영역 */}
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 실제 애드센스 게시자 ID 입력
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        {/* 심사 중 및 개발 시 표시되는 플레이스홀더 안내 */}
        <div className="flex flex-col items-center justify-center text-stone-500 pointer-events-none">
          <div className="w-10 h-10 rounded-xl bg-[#e2ddd3] flex items-center justify-center text-stone-600 font-black text-xs mb-2">
            AD
          </div>
          <span className="text-xs font-semibold text-stone-700">
            구글 애드센스 디스플레이 광고 영역
          </span>
          <p className="text-[11px] text-stone-500 mt-1 max-w-[240px]">
            애드센스 승인 완료 후 ca-pub 게시자 번호 입력 시 실제 맞춤형 광고가 노출됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
