import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// 기능 : create Browser Supabase Client 요청 또는 객체를 생성합니다.
export function createBrowserSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
