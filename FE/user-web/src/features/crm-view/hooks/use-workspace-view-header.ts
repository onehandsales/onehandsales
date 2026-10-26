import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api-client";
import { getWorkspaceViewHeader } from "../api/workspace-view-api";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import type {
  WorkspaceViewListItem, WorkspaceViewTarget, WorkspaceViewTargetType,
} from "../types/workspace-view";

type HeaderOptions = {
  readonly userId: string | null;
  readonly workspaceId: string | null;
  readonly targetType: WorkspaceViewTargetType | null;
  readonly targetId: string | null;
  readonly favorites: readonly { readonly viewDefinitionId: string }[] | undefined;
};

export type WorkspaceViewHeaderModel = {
  readonly userId: string | null;
  readonly workspaceId: string | null;
  readonly targetType: WorkspaceViewTargetType | null;
  readonly target: WorkspaceViewTarget | null;
  readonly currentView: WorkspaceViewListItem | null;
  readonly isFavorite: boolean | null;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly isUnavailable: boolean;
  readonly onSelect: (view: WorkspaceViewListItem) => void;
  readonly onRetry: () => void;
};

// 기능 : 두 반응형 헤더가 같은 서버 응답과 현재 보기 선택을 사용하도록 관리합니다.
export function useWorkspaceViewHeader({
  userId, workspaceId, targetType, targetId, favorites,
}: HeaderOptions): WorkspaceViewHeaderModel {
  // 1. 현재 사용자와 경로의 대상이 모두 확정된 경우만 초기 헤더를 조회한다.
  const enabled = Boolean(userId && workspaceId && targetType && targetId);
  const scope = JSON.stringify([userId, workspaceId, targetType, targetId]);
  const [selection, setSelection] = useState<{
    readonly scope: string; readonly view: WorkspaceViewListItem;
  } | null>(null);

  // 기능 : 요청 대상이 바뀌면 이전 요청을 취소할 수 있는 헤더 조회를 수행합니다.
  function fetchHeader({ signal }: { readonly signal: AbortSignal }) {
    // 1. 현재 경로의 대상이 확정된 요청에만 취소 신호를 전달한다.
    if (!workspaceId || !targetType || !targetId) throw new Error("View header target is required");
    return getWorkspaceViewHeader(workspaceId, targetType, targetId, signal);
  }

  const query = useQuery({
    queryKey: workspaceViewQueryKeys.header(userId, workspaceId, targetType, targetId),
    queryFn: fetchHeader,
    enabled, staleTime: 0, retry: false, refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // 2. 대상 전환은 최근 선택 저장으로 해석하지 않고 화면 선택을 초기화한다.
    setSelection(null);
  }, [scope]);

  const header = query.data;
  const target = (targetType === "OBJECT" ? header?.objectDefinition : header?.listDefinition) ?? null;
  const initialView: WorkspaceViewListItem | null =
    header?.viewId && header.viewName !== null && header.viewType !== null
      ? { viewId: header.viewId, viewName: header.viewName, viewIcon: header.viewIcon,
          viewType: header.viewType, isSelected: true }
      : null;
  const currentView = selection?.scope === scope ? selection.view : initialView;
  const isFavorite = !currentView ? false
    : currentView.viewId === header?.viewId ? header.isFavorite
    : favorites?.some(item => item.viewDefinitionId === currentView.viewId) ?? null;

  // 기능 : 선택한 보기의 표시 정보만 현재 화면에 반영합니다.
  function handleSelect(view: WorkspaceViewListItem) {
    setSelection({ scope, view });
  }

  // 기능 : 조회 실패 시 같은 대상의 헤더를 다시 요청합니다.
  function handleRetry() {
    void query.refetch();
  }

  // 3. 다른 대상의 응답이나 조회 실패를 정상 빈 상태로 표시하지 않는다.
  return {
    userId, workspaceId, targetType, target, currentView, isFavorite,
    isLoading: enabled && query.isPending,
    isError: query.isError || (query.isSuccess && !target),
    isUnavailable: query.error instanceof ApiClientError && query.error.statusCode === 404,
    onSelect: handleSelect, onRetry: handleRetry,
  };
}
