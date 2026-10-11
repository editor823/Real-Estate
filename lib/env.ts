/**
 * 환경 변수 안전 접근 유틸리티
 * 
 * [초보자 개발자 가이드]
 * - 프론트엔드(브라우저)에서 보여도 되는 변수: NEXT_PUBLIC_ 접두사가 붙어 있습니다.
 * - 백엔드(서버/스크립트)에서만 사용해야 하는 비밀 키: 접두사가 없습니다.
 * 
 * 브라우저에서 민감한 비밀 키를 실수로 불러오려고 하면 사전에 감지하여 에러를 발생시킵니다.
 */

const isBrowser = typeof window !== "undefined";

/**
 * 프론트엔드 공개 환경 변수
 */
export const publicEnv = {
  /** R2 공개 CDN 베이스 URL (예: https://images.yourdomain.com 또는 https://pub-xxx.r2.dev) */
  cdnBaseUrl: (process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
};

/**
 * 백엔드 전용 비밀 키 접근 함수 (브라우저 노출 철저 차단)
 */
export function getServerSecret(key: "SUPABASE_SERVICE_ROLE_KEY" | "R2_ACCESS_KEY_ID" | "R2_SECRET_ACCESS_KEY" | "CLOUDFLARE_ACCOUNT_ID") {
  if (isBrowser) {
    throw new Error(
      `[보안 경고] '${key}'는 민감한 서버 전용 비밀 키입니다! 브라우저(프론트엔드) 코드에서 직접 호출할 수 없습니다.`
    );
  }
  return process.env[key] || "";
}
