import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api-client";
import { getWorkspaceViewHeader, getWorkspaceViewHeaderByViewId } from "../api/workspace-view-api";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import { useWorkspaceViewFavorite, type ViewFavoriteError } from "./use-workspace-view-favorite";
import type {
  WorkspaceViewListItem, WorkspaceViewTarget, WorkspaceViewTargetType,
} from "../types/workspace-view";

type HeaderOptions = {
  readonly userId: string | null;
  readonly workspaceId: string | null;
  readonly targetType: WorkspaceViewTargetType | null;
  readonly targetId: string | null;
  readonly favorites: readonly { readonly viewDefinitionId: string }[] | undefined;
  readonly favoritesUpdatedAt: number;
  readonly viewDefinitionId?: string | null;
  readonly sourceType?: WorkspaceViewTargetType | "INVALID" | null;
  readonly onViewSelect?: (viewDefinitionId: string) => void;
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
  readonly isFavoritePending: boolean;
  readonly canToggleFavorite: boolean;
  readonly favoriteError: ViewFavoriteError | null;
  readonly onToggleFavorite: () => void;
  readonly onDismissFavoriteError: () => void;
  readonly onSelect: (view: WorkspaceViewListItem) => void;
  readonly onRetry: () => void;
  readonly targetChoices?: readonly (WorkspaceViewTarget & { readonly type: WorkspaceViewTargetType })[];
  readonly isTargetSelectionRequired?: boolean;
  readonly isTargetMissing?: boolean;
};

// 기능 : 두 반응형 헤더가 같은 서버 응답과 현재 보기 선택을 사용하도록 관리합니다.
export function useWorkspaceViewHeader({
  userId, workspaceId, targetType: routeTargetType, targetId: routeTargetId, favorites, favoritesUpdatedAt,
  viewDefinitionId = null, sourceType = null, onViewSelect,
}: HeaderOptions): WorkspaceViewHeaderModel {
  // 1. 현재 사용자와 경로의 대상이 모두 확정된 경우만 초기 헤더를 조회한다.
  const enabled = Boolean(userId && workspaceId && (viewDefinitionId || routeTargetType && routeTargetId));
  const scope = JSON.stringify([userId, workspaceId, routeTargetType, routeTargetId, viewDefinitionId, sourceType]);
  const [selection, setSelection] = useState<{
    readonly scope: string; readonly view: WorkspaceViewListItem;
  } | null>(null);

  // 기능 : 요청 대상이 바뀌면 이전 요청을 취소할 수 있는 헤더 조회를 수행합니다.
  function fetchHeader({ signal }: { readonly signal: AbortSignal }) {
    // 1. 현재 경로의 대상이 확정된 요청에만 취소 신호를 전달한다.
    if (!workspaceId) throw new Error("View header workspace is required");
    if (viewDefinitionId) return getWorkspaceViewHeaderByViewId(workspaceId, viewDefinitionId, signal);
    if (!routeTargetType || !routeTargetId) throw new Error("View header target is required");
    return getWorkspaceViewHeader(workspaceId, routeTargetType, routeTargetId, signal);
  }

  const query = useQuery({
    queryKey: viewDefinitionId ? workspaceViewQueryKeys.headerByView(userId, workspaceId, viewDefinitionId)
      : workspaceViewQueryKeys.header(userId, workspaceId, routeTargetType, routeTargetId),
    queryFn: fetchHeader,
    enabled, staleTime: 0, retry: false, refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // 2. 대상 전환은 최근 선택 저장으로 해석하지 않고 화면 선택을 초기화한다.
    setSelection(null);
  }, [scope]);

  const header = query.data;
  // 3. 단건 응답의 두 소속을 유지하고 하나일 때만 자동으로 열 위치를 정한다.
  const targetChoices = [
    ...(header?.objectDefinition ? [{ ...header.objectDefinition, type: "OBJECT" as const }] : []),
    ...(header?.listDefinition ? [{ ...header.listDefinition, type: "LIST" as const }] : []),
  ];
  const resolved = viewDefinitionId
    ? sourceType ? targetChoices.find(item => item.type === sourceType) : targetChoices.length === 1 ? targetChoices[0] : undefined
    : targetChoices.find(item => item.type === routeTargetType);
  const targetType = viewDefinitionId ? resolved?.type ?? null : routeTargetType;
  const target = resolved ? { id: resolved.id, name: resolved.name, icon: resolved.icon } : null;
  const isTargetSelectionRequired = Boolean(viewDefinitionId && query.isSuccess && targetChoices.length > 1 && !sourceType);
  const isTargetMissing = Boolean(viewDefinitionId && query.isSuccess && !targetChoices.length);
  const invalidSource = Boolean(viewDefinitionId && sourceType && !resolved);
  // 4. 헤더의 viewId를 보기 목록·즐겨찾기와 같은 선택 모델로 변환한다.
  const initialView: WorkspaceViewListItem | null =
    header?.viewId && header.viewName !== null && header.viewType !== null
      ? { viewDefinitionId: header.viewId, viewName: header.viewName, viewIcon: header.viewIcon,
          viewType: header.viewType, isSelected: true }
      : null;
  const currentView = selection?.scope === scope ? selection.view : initialView;
  const serverIsFavorite = !currentView ? false
    : currentView.viewDefinitionId === header?.viewId ? header.isFavorite
    : favorites?.some(item => item.viewDefinitionId === currentView.viewDefinitionId) ?? null;
  const favorite = useWorkspaceViewFavorite({
    userId, workspaceId, viewDefinitionId: currentView?.viewDefinitionId ?? null,
    serverIsFavorite,
    serverUpdatedAt: currentView?.viewDefinitionId === header?.viewId ? query.dataUpdatedAt : favoritesUpdatedAt,
    enabled: enabled && !query.isPending && !query.isError && Boolean(target && currentView),
  });

  // 기능 : 선택한 보기의 표시 정보만 현재 화면에 반영합니다.
  function handleSelect(view: WorkspaceViewListItem) {
    // 1. 직접 보기 route는 URL을 갱신해 새로고침·뒤로가기에도 선택을 유지한다.
    if (viewDefinitionId) onViewSelect?.(view.viewDefinitionId);
    else setSelection({ scope, view });
  }

  // 기능 : 조회 실패 시 같은 대상의 헤더를 다시 요청합니다.
  function handleRetry() {
    // 1. 로컬 선택을 해제하고 같은 대상 또는 View ID의 헤더를 다시 읽는다.
    setSelection(null);
    void query.refetch();
  }

  // 5. 다른 대상의 응답이나 조회 실패를 정상 빈 상태로 표시하지 않는다.
  return {
    userId, workspaceId, targetType, target, currentView, isFavorite: favorite.isFavorite,
    isLoading: enabled && query.isPending,
    isError: query.isError || invalidSource || (query.isSuccess && !target && !isTargetSelectionRequired && !isTargetMissing),
    isUnavailable: invalidSource || query.error instanceof ApiClientError && query.error.statusCode === 404,
    isFavoritePending: favorite.isPending, canToggleFavorite: favorite.canToggle,
    favoriteError: favorite.error, onToggleFavorite: favorite.onToggle,
    onDismissFavoriteError: favorite.onDismissError,
    onSelect: handleSelect, onRetry: handleRetry,
    targetChoices, isTargetSelectionRequired, isTargetMissing,
  };
}
