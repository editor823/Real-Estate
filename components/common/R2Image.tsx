"use client";

import React, { useState } from "react";
import { getOptimizedImageUrl, getThumbnailUrl, getDetailImageUrl } from "@/lib/imageUrl";

interface R2ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** DB에 저장된 R2 파일 키 (예: "districts/11110_1460/hero_thumb_xxx.webp") */
  storageKey?: string | null;
  /** 이미지 로딩 실패 시 보여줄 대체 이미지 (선택) */
  fallbackSrc?: string;
  /** 이미지 규격 (기본값: 'auto', 'thumb'는 400px 썸네일, 'detail'은 1400px 본문용) */
  variant?: "thumb" | "detail" | "auto";
  /** 이미지 설명 (웹 접근성 필수) */
  alt: string;
}

/**
 * Cloudflare R2에 저장된 최적화 이미지를 보여주는 공용 컴포넌트
 * 
 * [0원 비용 최적화]
 * - DB의 'storageKey'만 넘겨주면 CDN 주소와 결합하여 고속 렌더링합니다.
 * - variant="thumb" 설정 시 목록/카드용 400px 경량 WebP 이미지를 불러와 데이터 트래픽을 아낍니다.
 * - variant="detail" 설정 시 상세용 1400px 고화질 WebP 이미지를 불러옵니다.
 */
export function R2Image({
  storageKey,
  fallbackSrc = "/og-image.png",
  variant = "auto",
  alt,
  className = "",
  ...props
}: R2ImageProps) {
  const [hasError, setHasError] = useState(false);

  let targetUrl: string;
  if (variant === "thumb") {
    targetUrl = getThumbnailUrl(storageKey, fallbackSrc);
  } else if (variant === "detail") {
    targetUrl = getDetailImageUrl(storageKey, fallbackSrc);
  } else {
    targetUrl = getOptimizedImageUrl(storageKey, fallbackSrc);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? fallbackSrc : targetUrl}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
}
