import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api-client";
import { getViewMainData } from "../api/view-data-api";
import { viewDataQueryKeys } from "../api/view-data-query-keys";
import type { SupportedViewDataType, ViewDataScope, ViewMainResponse } from "../types/view-data";
import type { WorkspaceViewHeaderModel } from "./use-workspace-view-header";

export const VIEW_DATA_PAGE_SIZE = 25;

// 기능 : 현재 본문 API로 실행할 수 있는 세 타입을 확인합니다.
export function isSupportedViewDataType(type: string | undefined): type is SupportedViewDataType {
  return type === "TABLE" || type === "KANBAN" || type === "LIST";
}

// 기능 : 빠른 연속 검색 입력을 모아 같은 대상의 마지막 검색만 실행합니다.
export function useViewSearch(value: string) {
  const normalized = value.trim().normalize("NFC");
  const [query, setQuery] = useState(normalized);
  useEffect(() => {
    // 1. 다음 입력이나 화면 해제 시 이전 검색 예약을 취소한다.
    const timer = window.setTimeout(() => setQuery(normalized), 250);
    return () => window.clearTimeout(timer);
  }, [normalized]);
  return { query, isWaiting: query !== normalized };
}

// 기능 : 공통 헤더가 선택한 보기의 저장된 본문을 검색과 cursor로 조회합니다.
export function useViewMainData(header: WorkspaceViewHeaderModel, q: string, timeZone: string) {
  const client = useQueryClient();
  const view = header.currentView;
  const scope: ViewDataScope | null = header.userId && header.workspaceId && header.targetType && header.target && view
    ? { userId: header.userId, workspaceId: header.workspaceId, sourceType: header.targetType,
      targetId: header.target.id, viewDefinitionId: view.viewDefinitionId, viewType: view.viewType, timeZone } : null;
  const queryKey = viewDataQueryKeys.main(scope, q, VIEW_DATA_PAGE_SIZE);
  // 기능 : 요청 취소 신호를 전달하고 설정이 다른 페이지의 병합을 막습니다.
  async function fetchPage({ pageParam, signal }: { readonly pageParam: string | null; readonly signal: AbortSignal }) {
    // 1. 헤더의 확정된 선택과 같은 조회 맥락만 요청한다.
    if (!scope) throw new Error("View data scope required");
    const response = await getViewMainData({ ...scope, q, limit: VIEW_DATA_PAGE_SIZE, cursor: pageParam }, signal);
    const previous = client.getQueryData<InfiniteData<ViewMainResponse>>(queryKey)?.pages[0];
    if (pageParam && (response.state !== "READY" || previous && previous.configurationFingerprint !== response.configurationFingerprint))
      throw new ApiClientError({ statusCode: 409, code: "ViewDataCursorStale", message: "View data changed", raw: null });
    return response;
  }
  const query = useInfiniteQuery({
    queryKey, queryFn: fetchPage, initialPageParam: null as string | null,
    // 기능 : 표·목록만 본문 cursor로 이어 읽고 칸반은 열별 조회에 맡깁니다.
    getNextPageParam(last: ViewMainResponse) {
      return last.state === "READY" && last.viewType !== "KANBAN" && last.data.pageInfo.hasNextPage
        ? last.data.pageInfo.nextCursor ?? undefined : undefined;
    },
    enabled: Boolean(scope && !header.isLoading && !header.isError && isSupportedViewDataType(view?.viewType)),
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: false,
  });
  // 기능 : 만료·변경된 페이지 체인을 버리고 첫 페이지부터 복구합니다.
  function restart() {
    // 1. 현재 보기의 본문과 열별 페이지를 취소하고 새 MAIN을 읽는다.
    void client.cancelQueries({ queryKey: ["crm-view", header.userId?.toLowerCase(), header.workspaceId?.toLowerCase(), "data"] });
    void client.resetQueries({ queryKey, exact: true });
  }
  return { query, scope, q, restart };
}
export type ViewMainDataModel = ReturnType<typeof useViewMainData>;
