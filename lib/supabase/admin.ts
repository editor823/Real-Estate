import { createClient } from "@supabase/supabase-js";
import { getServerSecret } from "../env";

/**
 * [주의] 관리자 전용 Supabase 클라이언트 (Service Role Key 사용)
 * 
 * - RLS(Row Level Security) 정책을 우회하여 모든 데이터를 읽고 쓸 수 있는 최고 관리자 권한입니다.
 * - 오직 서버 환경(Next.js API Route, Server Action, 배치 스크립트 등)에서만 동작하며,
 *   브라우저에서 실수로 불러올 경우 즉시 에러를 발생시킵니다.
 */
export function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = getServerSecret("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
