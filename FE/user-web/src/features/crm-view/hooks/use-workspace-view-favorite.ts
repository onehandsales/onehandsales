import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  createWorkspaceViewFavorite, deleteWorkspaceViewFavorite,
  sidebarViewFavoriteQueryKeys, type ViewFavoriteResponse,
} from "@/features/view-favorite";
import { ApiClientError } from "@/lib/api-client";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import type { WorkspaceViewHeaderResponse } from "../types/workspace-view";

type FavoriteOptions = {
  readonly userId: string | null;
  readonly workspaceId: string | null;
  readonly viewId: string | null;
  readonly serverIsFavorite: boolean | null;
  readonly serverUpdatedAt: number;
  readonly enabled: boolean;
};
type FavoriteCommand = {
  readonly userId: string;
  readonly workspaceId: string;
  readonly viewId: string;
  readonly isFavorite: boolean;
};
type ConfirmedFavorite = {
  readonly scope: string;
  readonly isFavorite: boolean;
  readonly receivedAt: number;
};
export type ViewFavoriteError = "UNAVAILABLE" | "UNAUTHORIZED" | "SAVE_FAILED";

// 기능 : 변경 응답·오류를 사용자·Workspace·현재 보기 범위로 구분합니다.
function favoriteScope(userId: string | null, workspaceId: string | null, viewId: string | null) {
  return JSON.stringify([userId?.toLowerCase() ?? null, workspaceId?.toLowerCase() ?? null, viewId?.toLowerCase() ?? null]);
}

// 기능 : 공통 헤더의 개인 별표 변경과 헤더·사이드바 캐시 갱신을 함께 관리합니다.
export function useWorkspaceViewFavorite({
  userId, workspaceId, viewId, serverIsFavorite, serverUpdatedAt, enabled,
}: FavoriteOptions) {
  const queryClient = useQueryClient();
  const inFlight = useRef(false);
  const [confirmed, setConfirmed] = useState<ConfirmedFavorite | null>(null);
  const [isErrorDismissed, setErrorDismissed] = useState(false);
  const scope = favoriteScope(userId, workspaceId, viewId);

  const mutation = useMutation({
    retry: false,
    // 기능 : 클릭 당시의 실제 View와 상태로 등록 또는 해제를 요청합니다.
    mutationFn(command: FavoriteCommand) {
      return command.isFavorite
        ? deleteWorkspaceViewFavorite(command.workspaceId, command.viewId)
        : createWorkspaceViewFavorite(command.workspaceId, command.viewId);
    },
    // 기능 : 저장 이전 GET이 성공 응답의 상태를 덮어쓰지 못하게 취소합니다.
    async onMutate(command) {
      // 1. 현재 화면이 이동해도 요청 당시 사용자·Workspace의 조회만 취소한다.
      setErrorDismissed(false);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: workspaceViewQueryKeys.headers(command.userId, command.workspaceId) }),
        queryClient.cancelQueries({ queryKey: sidebarViewFavoriteQueryKeys.list(command.userId, command.workspaceId), exact: true }),
      ]);
    },
    // 기능 : 서버가 확인한 별표만 표시하고 일치하는 초기 헤더의 캐시를 갱신합니다.
    onSuccess(response: ViewFavoriteResponse, command) {
      // 1. 비초기 View도 사이드바 재조회 전 실제 응답의 상태를 표시한다.
      setConfirmed({ scope: favoriteScope(command.userId, command.workspaceId, response.viewId), isFavorite: response.isFavorite, receivedAt: Date.now() });
      // 2. 다른 View·사용자·Workspace 헤더는 보존하고 같은 View의 별표만 바꾼다.
      queryClient.setQueriesData<WorkspaceViewHeaderResponse>(
        { queryKey: workspaceViewQueryKeys.headers(command.userId, command.workspaceId) },
        header => header?.viewId?.toLowerCase() === response.viewId.toLowerCase() ? { ...header, isFavorite: response.isFavorite } : header,
      );
    },
    // 기능 : 성공 또는 불확실한 실패 뒤 서버 상태를 재확인하고 중복 방지를 해제합니다.
    onSettled(_response, error, command) {
      // 1. 클라이언트에서 사이드바 PK를 만들지 않고 기존 조회로 최종 상태를 받는다.
      inFlight.current = false;
      void queryClient.invalidateQueries({ queryKey: sidebarViewFavoriteQueryKeys.list(command.userId, command.workspaceId), exact: true });
      // 2. 부재한 View 오류는 목록도 갱신하고 그 외에는 관련 헤더만 재조회한다.
      const queryKey = error instanceof ApiClientError && error.statusCode === 404
        ? workspaceViewQueryKeys.workspace(command.userId, command.workspaceId)
        : workspaceViewQueryKeys.headers(command.userId, command.workspaceId);
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  // 1. 이후 성공한 GET이 있으면 그 상태를 우선하고 다른 범위의 확인 응답은 표시하지 않는다.
  const isFavorite = confirmed?.scope === scope && confirmed.receivedAt >= serverUpdatedAt
    ? confirmed.isFavorite : serverIsFavorite;
  const currentError = mutation.isError && mutation.variables &&
    favoriteScope(mutation.variables.userId, mutation.variables.workspaceId, mutation.variables.viewId) === scope
      ? mutation.error : null;
  const error: ViewFavoriteError | null = !currentError ? null
    : currentError instanceof ApiClientError && [403, 404].includes(currentError.statusCode) ? "UNAVAILABLE"
    : currentError instanceof ApiClientError && currentError.statusCode === 401 ? "UNAUTHORIZED" : "SAVE_FAILED";
  const canToggle = enabled && Boolean(userId && workspaceId && viewId) &&
    isFavorite !== null && !mutation.isPending && error !== "UNAVAILABLE";

  // 기능 : 두 반응형 헤더나 빠른 연속 클릭에서도 쓰기 요청을 한 번만 시작합니다.
  function handleToggleFavorite() {
    // 1. 빈 대상·미확인 상태·처리 중 동작은 요청하지 않고 클릭 순간의 ID를 보존한다.
    if (!canToggle || inFlight.current || !userId || !workspaceId || !viewId || isFavorite === null) return;
    inFlight.current = true;
    mutation.mutate({ userId, workspaceId, viewId, isFavorite });
  }

  // 기능 : 확인한 변경 실패 안내만 닫고 현재 별표·선택은 보존합니다.
  function dismissError() {
    if (!mutation.isPending) setErrorDismissed(true);
  }

  return { isFavorite, isPending: mutation.isPending, error: isErrorDismissed ? null : error, canToggle, onToggle: handleToggleFavorite, onDismissError: dismissError };
}
