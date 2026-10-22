"use client";

import { useEffect, useState } from "react";

interface AdSenseBannerProps {
  className?: string;
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal";
}

/**
 * 구글 애드센스 (Google AdSense) 반응형 광고 배너 컴포넌트
 * - 애드센스 공식 심사 정책 준수:
 *   승인 전 빈 광고 상자나 'AD 후원 영역' 같은 플레이스홀더를 노출하면 
 *   구글 심사관 및 봇이 '준비되지 않은 사이트/콘텐츠 부족'으로 거절하므로,
 *   승인 전에는 화면을 전혀 차지하지 않고 숨김(return null) 처리합니다.
 * - 나중에 승인 완료 후 환경변수 NEXT_PUBLIC_ADSENSE_ENABLED=true 가 켜지면 실제 광고가 노출됩니다.
 */
export function AdSenseBanner({
  className,
  slotId = "default-slot",
  format = "rectangle",
}: AdSenseBannerProps) {
  // 실제 구글 애드센스 승인 활성화 여부 확인 (환경변수 또는 배포 설정)
  const isAdSenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isAdSenseEnabled) return;

    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // 에러 무시
    }
  }, [isAdSenseEnabled]);

  // 애드센스 미승인 상태이거나 개발/심사 단계에서는 빈 박스를 전혀 노출하지 않고 숨김
  if (!isAdSenseEnabled || !isClient) {
    return null;
  }

  // 승인 완료 후 실제 광고 컨테이너 렌더링
  return (
    <div className={`w-full overflow-hidden my-4 text-center ${className || ""}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5767039912569697"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
