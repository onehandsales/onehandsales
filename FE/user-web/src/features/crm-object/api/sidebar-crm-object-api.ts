import { apiClient } from "@/lib/api-client";
import type { SidebarCrmObjectListItem } from "@/features/crm-object/types/sidebar-crm-object";

// 기능 : 현재 사용자가 접근할 수 있는 Workspace의 사이드바 관리 항목 목록을 조회합니다.
export function listSidebarCrmObjects(workspaceId: string) {
  // 1. 인증된 현재 사용자와 Workspace 기준 sidebar 관리 항목 목록 API를 호출한다.
  return apiClient<SidebarCrmObjectListItem[]>(
    `/api/users/me/sidebar/workspaces/${encodeURIComponent(workspaceId)}/objects`
  );
}
