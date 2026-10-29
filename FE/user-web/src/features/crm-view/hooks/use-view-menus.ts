import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getViewMenu } from "../api/view-menu-api";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import type { ViewMenu, ViewMenuResponses } from "../types/view-menu";
import type { WorkspaceViewHeaderModel } from "./use-workspace-view-header";

// 기능 : 메뉴 하나의 서버 상태와 저장하지 않은 화면 편집 상태를 분리합니다.
function useMenuData<K extends ViewMenu>(header: WorkspaceViewHeaderModel, menu: K, active: ViewMenu | null, scope: string) {
  const client = useQueryClient();
  const viewId = header.currentView?.viewDefinitionId ?? null;
  const [draft, setDraft] = useState<{ readonly scope: string; readonly data: ViewMenuResponses[K] } | null>(null);
  const currentDraft = draft?.scope === scope ? draft.data : undefined;
  const enabled = active === menu && !currentDraft && Boolean(header.userId && header.workspaceId && viewId) && !header.isLoading && !header.isError;
  const queryKey = workspaceViewQueryKeys.menu(header.userId, header.workspaceId, viewId, menu);

  // 기능 : 확정된 보기의 메뉴를 조회하고 타입이 바뀐 오래된 응답을 거부합니다.
  async function fetchMenu({ signal }: { readonly signal: AbortSignal }) {
    // 1. 요청 시점의 ID와 타입이 일치하는 응답만 소비한다.
    if (!header.workspaceId || !viewId) throw new Error("View menu target is required");
    const result = await getViewMenu(header.workspaceId, viewId, menu, signal);
    if (result.viewType !== header.currentView?.viewType) throw new Error("View menu type mismatch");
    return result;
  }
  const query = useQuery({ queryKey, queryFn: fetchMenu, enabled, staleTime: 30_000, retry: false, refetchOnWindowFocus: false });

  useEffect(() => {
    // 2. 다른 보기로 이동하면 이전 임시 편집을 버린다.
    setDraft(null);
  }, [scope]);
  useEffect(() => {
    // 3. 메뉴를 닫거나 대상을 바꾸면 진행 중인 요청도 취소한다.
    if (!enabled) return;
    return () => { void client.cancelQueries({ queryKey: workspaceViewQueryKeys.menu(header.userId, header.workspaceId, viewId, menu), exact: true }); };
  }, [client, enabled, header.userId, header.workspaceId, viewId, menu]);

  // 기능 : 서버 캐시를 수정하지 않고 현재 보기의 임시 입력만 변경합니다.
  function change(data: ViewMenuResponses[K]) {
    setDraft({ scope, data });
  }
  return { data: currentDraft ?? query.data, change, isPending: !currentDraft && query.isPending,
    isError: !currentDraft && query.isError, error: query.error, retry: query.refetch };
}

// 기능 : 두 반응형 화면이 메뉴 조회와 임시 편집을 하나의 상태로 공유합니다.
export function useViewMenus(header: WorkspaceViewHeaderModel) {
  const scope = JSON.stringify([header.userId, header.workspaceId, header.targetType, header.target?.id, header.currentView?.viewDefinitionId, header.currentView?.viewType]);
  const [opened, setOpened] = useState<{ readonly scope: string; readonly menu: ViewMenu } | null>(null);
  const active = opened?.scope === scope ? opened.menu : null;
  const filters = useMenuData(header, "filters", active, scope);
  const sorts = useMenuData(header, "sorts", active, scope);
  const settings = useMenuData(header, "settings", active, scope);
  useEffect(() => {
    // 1. 다른 보기에서는 메뉴도 닫힌 상태로 시작한다.
    setOpened(null);
  }, [scope]);
  // 기능 : 사용자가 연 메뉴 하나만 조회 대상으로 지정합니다.
  function open(menu: ViewMenu | null) {
    setOpened(menu ? { scope, menu } : null);
  }
  return { scope, filters, sorts, settings, open };
}
export type ViewMenusModel = ReturnType<typeof useViewMenus>;
