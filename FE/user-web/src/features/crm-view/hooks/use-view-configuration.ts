import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ApiClientError } from "@/lib/api-client";
import { getViewConfiguration, updateViewConfiguration } from "../api/view-configuration-api";
import { viewConfigurationQueryKeys } from "../api/view-configuration-query-keys";
import { viewDataQueryKeys } from "../api/view-data-query-keys";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import { configurationChanges } from "../utils/view-configuration";
import type { ViewConfigurationResponse, ViewConfigurationScope } from "../types/view-configuration";
import type { ViewAttributeSetting, ViewMenu, ViewMenuResponses } from "../types/view-menu";
import type { WorkspaceViewHeaderModel } from "./use-workspace-view-header";

// 기능 : 세 메뉴와 표의 컬럼 편집을 하나의 저장 기준·임시 상태로 관리합니다.
export function useViewConfiguration(header: WorkspaceViewHeaderModel, scopeKey: string, enabled: boolean) {
  const client = useQueryClient();
  const scope: ViewConfigurationScope | null = header.userId && header.workspaceId && header.currentView && header.targetType && header.target
    ? { userId: header.userId, workspaceId: header.workspaceId, viewDefinitionId: header.currentView.viewDefinitionId, sourceType: header.targetType } : null;
  const [editing, setEditing] = useState<{ scope: string; baseline: ViewConfigurationResponse; draft: ViewConfigurationResponse } | null>(null);
  const [status, setStatus] = useState<{ scope: string; saving: boolean; error: unknown; saved: boolean } | null>(null);
  const [pendingScopes, setPendingScopes] = useState<ReadonlySet<string>>(new Set());
  const busy = useRef(new Set<string>());
  const visit = useRef({ scopeKey });
  if (visit.current.scopeKey !== scopeKey) visit.current = { scopeKey };
  const currentEditing = useRef(editing);
  currentEditing.current = editing;
  const current = editing?.scope === scopeKey ? editing : null;
  const queryKey = viewConfigurationQueryKeys.detail(scope);
  const query = useQuery({ queryKey, queryFn: ({ signal }) => {
    if (!scope) throw new Error("View configuration scope required");
    return getViewConfiguration(scope, signal);
  }, enabled: enabled && !!scope && !header.isLoading && !header.isError, staleTime: 30000, retry: false, refetchOnWindowFocus: false });
  const data = current?.draft ?? query.data;
  const changes = current ? configurationChanges(current.baseline, current.draft) : {};
  const isDirty = Object.keys(changes).length > 0;
  const isSaving = pendingScopes.has(scopeKey);
  const error = status?.scope === scopeKey ? status.error : null;
  const command = isDirty && current ? { baseConfigurationVersion: current.baseline.configurationVersion, changes } : undefined;
  useEffect(() => {
    // 1. 다른 보기에는 이전 임시 상태나 저장 메시지를 복원하지 않는다.
    setEditing(null); setStatus(null);
    return () => { void client.cancelQueries({ queryKey, exact: true }); };
    // 원본 맥락의 직렬화 키로 query 취소 범위를 고정한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey, client]);
  useEffect(() => {
    if (!isDirty) return;
    // 기능 : 브라우저를 닫을 때 저장하지 않은 입력의 유실을 알립니다.
    function leave(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [isDirty]);
  // 기능 : 서버 캐시를 바꾸지 않고 선택 메뉴만 같은 임시 상태에 반영합니다.
  function change<K extends ViewMenu>(name: K, value: ViewMenuResponses[K]) {
    if (!data || busy.current.has(scopeKey)) return;
    setEditing(previous => {
      const active = previous?.scope === scopeKey ? previous : { scope: scopeKey, baseline: data, draft: data };
      return { ...active, draft: { ...active.draft, [name]: value } };
    });
    setStatus(null);
  }
  // 기능 : 세 메뉴가 동일한 읽기·오류 상태와 독립 입력 함수를 사용하게 합니다.
  function menu<K extends ViewMenu>(name: K) {
    return { data: data?.[name], change: (value: ViewMenuResponses[K]) => change(name, value), isPending: !data && query.isPending,
      isError: !data && query.isError, error: query.error, retry: query.refetch };
  }
  // 기능 : 표의 표시명·너비·숨김도 같은 settings section으로 편집합니다.
  function changeColumn(id: string, values: Partial<ViewAttributeSetting>) {
    if (!data) return;
    change("settings", { ...data.settings, viewAttributeSettingDefinitions: data.settings.viewAttributeSettingDefinitions.map(row => row.id === id ? { ...row, ...values } : row) });
  }
  // 기능 : 드래그한 열의 우선순위를 설정에 보존하고 숨긴 열도 유지합니다.
  function reorderColumns(ids: readonly string[]) {
    if (!data) return;
    const ordered = [...ids, ...data.settings.viewAttributeSettingDefinitions.filter(row => !ids.includes(row.id)).map(row => row.id)];
    change("settings", { ...data.settings, viewAttributeSettingDefinitions: data.settings.viewAttributeSettingDefinitions.map(row => ({ ...row, sortOrder: ordered.indexOf(row.id) })) });
  }
  // 기능 : 저장 결과가 돌아오기 전에는 입력을 유지하고 실패에도 임시 상태를 보존합니다.
  async function save() {
    if (!scope || !command || busy.current.has(scopeKey)) return;
    const requestedVisit = visit.current;
    busy.current.add(scopeKey); setPendingScopes(new Set(busy.current));
    setStatus({ scope: scopeKey, saving: true, error: null, saved: false });
    try {
      // 1. 요청 당시 scope의 캐시만 갱신한다.
      const result = await updateViewConfiguration(scope, command);
      client.setQueryData(queryKey, result);
      if (visit.current === requestedVisit) {
        setEditing(null); setStatus({ scope: scopeKey, saving: false, error: null, saved: true });
      }
      // 2. 설정과 연결된 본문·열별 페이지·기존 메뉴 조회를 다시 읽는다.
      await Promise.all([
        client.resetQueries(viewDataQueryKeys.forView(scope)),
        client.invalidateQueries({ queryKey: workspaceViewQueryKeys.menus(scope.userId, scope.workspaceId, scope.viewDefinitionId) }),
        client.invalidateQueries({ queryKey: viewConfigurationQueryKeys.view(scope.userId, scope.workspaceId, scope.viewDefinitionId), refetchType: "none" }),
      ]);
    } catch (failure) {
      if (visit.current === requestedVisit) setStatus({ scope: scopeKey, saving: false, error: failure, saved: false });
    } finally {
      busy.current.delete(scopeKey); setPendingScopes(new Set(busy.current));
    }
  }
  // 기능 : 사용자가 명시적으로 되돌리면 전체 임시 변경을 폐기합니다.
  function discard() { if (!busy.current.has(scopeKey)) { setEditing(null); setStatus(null); } }
  // 기능 : 충돌 상태에서 사용자가 최신 설정을 선택했을 때만 임시 입력을 교체합니다.
  async function useLatest() {
    if (busy.current.has(scopeKey)) return;
    const requestedVisit = visit.current, requestedEditing = currentEditing.current;
    const result = await query.refetch();
    if (!result.error && visit.current === requestedVisit && currentEditing.current === requestedEditing) discard();
  }
  return { filters: menu("filters"), sorts: menu("sorts"), settings: menu("settings"), candidates: data?.candidates ?? [],
    configurationScope: scope, command, isDirty, isSaving, error, isConflict: error instanceof ApiClientError && error.statusCode === 409,
    isSaved: status?.scope === scopeKey && status.saved, isConfigurationReady: !!data, save, discard, useLatest, changeColumn, reorderColumns };
}
