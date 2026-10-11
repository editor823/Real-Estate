import imageCompression from "browser-image-compression";

/**
 * 무료 플랜 맞춤형 이미지 최적화 파이프라인 (0원 비용 원칙)
 * 
 * [초보자 수석 개발자 가이드]
 * Cloudflare Image Resizing 같은 실시간 변환 기능은 '유료(유료 플랜 전용)'입니다.
 * 따라서 비용을 0원으로 유지하기 위해, 사용자가 이미지를 올리는 순간(브라우저)에서
 * 무료 오픈소스 라이브러리(browser-image-compression)를 사용하여
 * '썸네일용(400px)'과 '상세용(1400px)'을 미리 WebP로 꽉 압축한 뒤 R2에 올립니다!
 */

export interface OptimizedImageVariant {
  file: File;
  width: number;
  quality: number;
  sizeBytes: number;
  /** 캐시 무효화용 타임스탬프 해시가 포함된 파일명 */
  fileName: string;
}

export interface DualCompressionResult {
  /** 썸네일/목록용 (가로 최대 400px, WebP, 품질 0.65) */
  thumbnail: OptimizedImageVariant;
  /** 본문/상세용 (가로 최대 1400px, WebP, 품질 0.75) */
  detail: OptimizedImageVariant;
  /** 원본 파일 크기 */
  originalSize: number;
}

/**
 * 캐시 무효화를 위한 8자리 고유 해시/타임스탬프 문자열 생성
 */
function createCacheBusterString(): string {
  const timestamp = Date.now().toString(36); // 시간 기반 36진수
  const randomSuffix = Math.random().toString(36).substring(2, 6); // 4자리 무작위
  return `${timestamp}-${randomSuffix}`;
}

/**
 * 단일 이미지 압축 헬퍼
 */
async function compressVariant(
  file: File,
  maxWidthOrHeight: number,
  quality: number,
  variantType: "thumb" | "detail"
): Promise<OptimizedImageVariant> {
  const options = {
    maxWidthOrHeight,
    fileType: "image/webp" as const,
    initialQuality: quality,
    useWebWorker: true,
  };

  const compressedBlob = await imageCompression(file, options);
  
  // 원본 이름에서 특수문자 제거
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9가-힣_-]/g, "_")
    .substring(0, 30);

  // 캐시 무효화 해시 부여: [파일명]_[용도]_[해시].webp
  const cacheBuster = createCacheBusterString();
  const outputFileName = `${safeName}_${variantType}_${cacheBuster}.webp`;

  const compressedFile = new File([compressedBlob], outputFileName, {
    type: "image/webp",
  });

  return {
    file: compressedFile,
    width: maxWidthOrHeight,
    quality,
    sizeBytes: compressedFile.size,
    fileName: outputFileName,
  };
}

/**
 * 이미지를 썸네일(400px, q0.65)과 상세용(1400px, q0.75) 두 가지 WebP로 동시 최적화
 */
export async function optimizeImageForUpload(file: File): Promise<DualCompressionResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일(JPG, PNG 등)만 업로드할 수 있습니다.");
  }

  // 병렬로 초고속 압축 수행
  const [thumbnail, detail] = await Promise.all([
    // 1. 썸네일/목록용: 가로 최대 400px, WebP, 품질 0.65
    compressVariant(file, 400, 0.65, "thumb"),
    // 2. 본문/상세용: 가로 최대 1400px, WebP, 품질 0.75
    compressVariant(file, 1400, 0.75, "detail"),
  ]);

  return {
    thumbnail,
    detail,
    originalSize: file.size,
  };
}

/**
 * 단일 규격 압축이 필요할 때 사용하는 편의 함수
 */
export async function compressThumbnail(file: File): Promise<OptimizedImageVariant> {
  return compressVariant(file, 400, 0.65, "thumb");
}

export async function compressDetail(file: File): Promise<OptimizedImageVariant> {
  return compressVariant(file, 1400, 0.75, "detail");
}
