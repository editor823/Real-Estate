import { optimizeImageForUpload } from "../image/compressor";
import { createR2StorageKey } from "../imageUrl";

export interface DualUploadResult {
  success: boolean;
  /** DB에 저장할 썸네일 파일 키 (예: "districts/11110_1460/hero_thumb_k8x1a.webp") */
  thumbKey: string;
  /** DB에 저장할 본문 상세용 파일 키 (예: "districts/11110_1460/hero_detail_k8x1a.webp") */
  detailKey: string;
  /** 원본 용량 (bytes) */
  originalSize: number;
  /** 썸네일 용량 (bytes) */
  thumbSize: number;
  /** 상세용 용량 (bytes) */
  detailSize: number;
}

/**
 * 단일 파일 업로드 요청 헬퍼
 */
async function uploadSingleFile(
  file: File,
  storageKey: string,
  category: string,
  targetId: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("customKey", storageKey);
  formData.append("category", category);
  formData.append("targetId", targetId);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "R2 업로드 실패");
  }

  const result = await response.json();
  return result.storageKey;
}

/**
 * [무료 플랜 0원 비용 맞춤형 원클릭 업로드 파이프라인]
 * 
 * 1. 브라우저에서 원본 이미지를:
 *    - 썸네일(최대 400px, q0.65)
 *    - 본문/상세(최대 1400px, q0.75)
 *    두 가지 WebP 규격으로 사전 압축합니다.
 * 2. Cloudflare R2 버킷(MY_BUCKET)에 각각 업로드합니다.
 * 3. DB에 저장할 thumbKey와 detailKey를 반환합니다.
 * 
 * @example
 * const { thumbKey, detailKey } = await uploadOptimizedImages(file, "SEOUL_11215");
 * // DB에는 아래처럼 파일 키만 저장합니다:
 * await supabase.from("districts").update({
 *   thumbnail_key: thumbKey,
 *   detail_image_key: detailKey
 * }).eq("master_uid", "SEOUL_11215");
 */
export async function uploadOptimizedImages(
  file: File,
  targetId: string,
  category: "districts" | "notices" | "profiles" | "general" = "districts"
): Promise<DualUploadResult> {
  // 1. 브라우저에서 2개 규격으로 압축 (비용 0원)
  const { thumbnail, detail, originalSize } = await optimizeImageForUpload(file);

  // 2. 표준 저장 키 생성
  const thumbStorageKey = createR2StorageKey(category, targetId, thumbnail.fileName);
  const detailStorageKey = createR2StorageKey(category, targetId, detail.fileName);

  // 3. R2에 병렬 업로드
  const [thumbKey, detailKey] = await Promise.all([
    uploadSingleFile(thumbnail.file, thumbStorageKey, category, targetId),
    uploadSingleFile(detail.file, detailStorageKey, category, targetId),
  ]);

  return {
    success: true,
    thumbKey,
    detailKey,
    originalSize,
    thumbSize: thumbnail.sizeBytes,
    detailSize: detail.sizeBytes,
  };
}
