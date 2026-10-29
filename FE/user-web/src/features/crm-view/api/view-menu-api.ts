import { apiClient } from "@/lib/api-client";
import type { ViewMenu, ViewMenuResponses } from "../types/view-menu";

// 기능 : 선택한 보기의 메뉴 저장 상태를 인증된 조회 경로로 가져옵니다.
export async function getViewMenu<K extends ViewMenu>(workspaceId: string, viewDefinitionId: string, menu: K, signal: AbortSignal): Promise<ViewMenuResponses[K]> {
  // 1. 메뉴 GET에는 query나 body를 추가하지 않고 취소 신호만 전달한다.
  const response = await apiClient<ViewMenuResponses[K]>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-header/view-definitions/${encodeURIComponent(viewDefinitionId)}/${menu}`,
    { signal },
  );
  // 2. 요청한 보기와 다른 응답을 현재 화면에 연결하지 않는다.
  if (response.viewDefinitionId.toLowerCase() !== viewDefinitionId.toLowerCase()) throw new Error("View menu response mismatch");
  return response;
}
