import { apiClient } from "@/lib/api-client";
import type {
  SidebarWorkspaceListItem,
  SidebarWorkspaceSummary,
} from "@/features/workspace/types/sidebar-workspace";

// 기능 : 현재 사용자가 앱 진입 시 기본으로 열 Workspace 요약을 조회합니다.
export function getDefaultSidebarWorkspace() {
  // 1. 인증된 현재 사용자 기준 default sidebar Workspace API를 호출한다.
  return apiClient<SidebarWorkspaceSummary>(
    "/api/users/me/sidebar/workspaces/default"
  );
}

// 기능 : 현재 사용자가 사이드바에서 전환할 수 있는 Workspace 요약 목록을 조회합니다.
export function listSidebarWorkspaces() {
  // 1. 인증된 현재 사용자 기준 sidebar Workspace 목록 API를 호출한다.
  return apiClient<SidebarWorkspaceListItem[]>(
    "/api/users/me/sidebar/workspaces"
  );
}
