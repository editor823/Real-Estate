import { publicEnv } from "./env";

/**
 * DB 및 CDN 이미지 URL 헬퍼 모듈 (`lib/imageUrl.ts`)
 * 
 * [무료 플랜 0원 비용 & DB 설계 원칙]
 * 1. Supabase 데이터베이스에는 `https://...` 전체 도메인을 절대 저장하지 않습니다.
 *    오직 R2 버킷 내부의 "파일 키(예: 'districts/SEOUL_11215_thumb_k8x1a.webp')"만 문자열로 저장합니다.
 * 2. 화면에 띄울 때만 환경 변수 `NEXT_PUBLIC_CDN_BASE_URL`과 조합하여 사용합니다.
 *    이렇게 하면 추후 도메인이 바뀌어도 DB 데이터를 단 한 줄도 수정할 필요가 없습니다.
 */

const DEFAULT_FALLBACK_IMAGE = "/og-image.png";

/**
 * R2 파일 키를 받아 전체 CDN 이미지 URL로 반환하는 핵심 함수
 * 
 * @param key DB에 저장된 R2 파일 키 (예: "districts/11110_1460_detail_abc123.webp")
 * @param fallbackUrl 키가 없거나 누락되었을 때 보여줄 기본 이미지
 * 
 * @example
 * getOptimizedImageUrl("districts/11110_1460_detail_abc123.webp")
 * // => "https://images.mydomain.com/districts/11110_1460_detail_abc123.webp"
 */
export function getOptimizedImageUrl(
  key?: string | null,
  fallbackUrl: string = DEFAULT_FALLBACK_IMAGE
): string {
  if (!key || key.trim() === "") {
    return fallbackUrl;
  }

  // 예외적으로 이미 풀 URL(http:// 또는 https://)로 저장되어 있는 경우 그대로 반환
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }

  const baseCdnUrl = publicEnv.cdnBaseUrl;

  // 로컬 개발 환경이거나 환경변수가 아직 비어있는 경우
  if (!baseCdnUrl) {
    return `/${key.replace(/^\//, "")}`;
  }

  const cleanKey = key.replace(/^\//, "");
  return `${baseCdnUrl}/${cleanKey}`;
}

/**
 * [목록/카드/모바일 전용] 썸네일 이미지 URL 헬퍼
 * - 400px 경량 WebP 이미지를 불러와 데이터 전송량을 최소화합니다.
 * 
 * @param key DB에 저장된 썸네일 파일 키 (또는 일반 키)
 */
export function getThumbnailUrl(
  key?: string | null,
  fallbackUrl: string = DEFAULT_FALLBACK_IMAGE
): string {
  if (!key) return fallbackUrl;

  // 만약 상세용 키(_detail_)가 들어왔다면 썸네일 키(_thumb_)로 자동 매핑 시도
  const thumbKey = key.includes("_detail_")
    ? key.replace("_detail_", "_thumb_")
    : key;

  return getOptimizedImageUrl(thumbKey, fallbackUrl);
}

/**
 * [상세보기/모달/데스크톱 전용] 본문 고화질 이미지 URL 헬퍼
 * - 1400px 선명한 WebP 이미지를 불러옵니다.
 * 
 * @param key DB에 저장된 상세용 파일 키
 */
export function getDetailImageUrl(
  key?: string | null,
  fallbackUrl: string = DEFAULT_FALLBACK_IMAGE
): string {
  if (!key) return fallbackUrl;

  // 만약 썸네일 키(_thumb_)가 들어왔다면 상세 키(_detail_)로 자동 매핑 시도
  const detailKey = key.includes("_thumb_")
    ? key.replace("_thumb_", "_detail_")
    : key;

  return getOptimizedImageUrl(detailKey, fallbackUrl);
}

/**
 * DB에 저장할 표준 R2 키 생성기
 * 
 * @param category 폴더 카테고리 (예: 'districts', 'notices')
 * @param id 구역 ID 또는 마스터 UID
 * @param fileName 압축기에서 생성된 파일명 (캐시버스터 해시 포함)
 */
export function createR2StorageKey(
  category: "districts" | "notices" | "profiles" | "general",
  id: string | number,
  fileName: string
): string {
  const cleanCategory = category.replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");

  return `${cleanCategory}/${cleanId}/${cleanFileName}`;
}
