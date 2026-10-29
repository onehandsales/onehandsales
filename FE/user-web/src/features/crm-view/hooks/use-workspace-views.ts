import { useQuery } from "@tanstack/react-query";
import { listWorkspaceListViews, listWorkspaceObjectViews } from "../api/workspace-view-api";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import type { WorkspaceViewTargetType } from "../types/workspace-view";

type ViewListOptions = {
  readonly userId: string | null;
  readonly workspaceId: string | null;
  readonly targetType: WorkspaceViewTargetType | null;
  readonly targetId: string | null;
  readonly viewDefinitionId: string | null;
  readonly enabled: boolean;
};

// 기능 : 드롭다운이 열린 동안만 헤더 응답의 대상에 맞는 View 목록을 조회합니다.
export function useWorkspaceViews({
  userId, workspaceId, targetType, targetId, viewDefinitionId, enabled,
}: ViewListOptions) {
  // 기능 : 현재 선택 ID와 취소 신호를 대상별 API에 전달합니다.
  function fetchViews({ signal }: { readonly signal: AbortSignal }) {
    // 1. 헤더 응답의 대상이 확정됐는지 확인하고 종류에 맞는 조회를 선택한다.
    if (!workspaceId || !targetType || !targetId) throw new Error("View list target is required");
    return targetType === "OBJECT"
      ? listWorkspaceObjectViews(workspaceId, targetId, viewDefinitionId, signal)
      : listWorkspaceListViews(workspaceId, targetId, viewDefinitionId, signal);
  }

  // 1. 열림 상태와 서버에서 확인한 대상 범위를 모두 만족할 때만 요청한다.
  return useQuery({
    queryKey: workspaceViewQueryKeys.views(userId, workspaceId, targetType, targetId, viewDefinitionId),
    queryFn: fetchViews,
    enabled: enabled && Boolean(userId && workspaceId && targetType && targetId),
    staleTime: 0, retry: false, refetchOnWindowFocus: false,
  });
}
