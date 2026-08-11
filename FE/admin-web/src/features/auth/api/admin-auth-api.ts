import type { AdminMe } from "@/features/auth/types/admin-auth";
import { adminApiClient } from "@/lib/admin-api-client";

// 기능 : 현재 access token이 접근 가능한 Admin 사용자 정보를 조회합니다.
export function getAdminMe() {
  return adminApiClient<AdminMe>("/me");
}
