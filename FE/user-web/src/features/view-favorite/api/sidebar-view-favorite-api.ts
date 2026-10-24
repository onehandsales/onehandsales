import type { SidebarViewFavoriteItem } from "@/features/view-favorite/types/sidebar-view-favorite";
import { apiClient } from "@/lib/api-client";

// 기능 : 로그인 사용자의 현재 Workspace View 즐겨찾기 목록을 조회합니다.
export function listSidebarViewFavorites(workspaceId: string) {
  // 1. 기존 인증·갱신 흐름으로 서버가 개인 범위를 확인하는 API를 호출한다.
  return apiClient<SidebarViewFavoriteItem[]>(
    `/api/users/me/sidebar/workspaces/${encodeURIComponent(workspaceId)}/view-favorites`
  );
}
