import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * 프론트엔드 브라우저에서 Supabase와 통신하기 위한 클라이언트 객체입니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
