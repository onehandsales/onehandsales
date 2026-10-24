import type { SidebarCrmListItem } from "@/features/crm-list/types/sidebar-crm-list";
import { apiClient } from "@/lib/api-client";

// 기능 : 현재 사용자가 접근할 수 있는 Workspace의 사이드바 업무 목록을 조회합니다.
export function listSidebarCrmLists(workspaceId: string) {
  // 1. 공통 API client의 인증과 갱신 흐름으로 해당 Workspace 목록을 요청한다.
  return apiClient<SidebarCrmListItem[]>(
    `/api/users/me/sidebar/workspaces/${encodeURIComponent(workspaceId)}/lists`
  );
}
