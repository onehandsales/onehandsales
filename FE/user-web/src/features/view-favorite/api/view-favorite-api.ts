import { apiClient } from "@/lib/api-client";
import type { ViewFavoriteResponse } from "../types/view-favorite";

// 기능 : 현재 선택한 보기를 로그인 사용자의 개인 즐겨찾기에 등록합니다.
export function createWorkspaceViewFavorite(workspaceId: string, viewId: string) {
  // 1. 서버가 소유자·Actor·순서를 결정하도록 경로만 보내고 인증 client를 재사용한다.
  return apiClient<ViewFavoriteResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-definitions/${encodeURIComponent(viewId)}/favorite`,
    { method: "POST" },
  );
}

// 기능 : 현재 선택한 보기의 개인 즐겨찾기 등록을 해제합니다.
export function deleteWorkspaceViewFavorite(workspaceId: string, viewId: string) {
  // 1. 즐겨찾기 PK나 다른 사용자 정보를 보내지 않고 같은 View 경로로 해제한다.
  return apiClient<ViewFavoriteResponse>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-definitions/${encodeURIComponent(viewId)}/favorite`,
    { method: "DELETE" },
  );
}
