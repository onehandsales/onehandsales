import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { ViewHeaderToolbar } from "@/components/layout/view-header-toolbar";
import { useAppI18n } from "@/features/app-i18n";
import { createWorkspaceObjectRecordDefinition, useWorkspaceObjectAttributeDefinitionsQuery } from "@/features/crm-object";
import { ViewMainContent, useViewMainData, useViewSearch, viewDataQueryKeys, VIEW_DATA_PAGE_SIZE } from "@/features/crm-view";

// 기능 : 같은 보기의 검색·페이지·열 상태를 유지하고 다른 선택에서는 본문을 새로 구성합니다.
export function WorkspaceViewPage() {
  const context = useOutletContext<AppShellOutletContext>();
  const { timeZone } = useAppI18n();
  return <WorkspaceViewContent key={context.viewMenus.scope + ":" + timeZone} context={context} />;
}

// 기능 : 사이드바 Object와 List를 같은 저장 보기 본문 API에 연결합니다.
function WorkspaceViewContent({ context }: { readonly context: AppShellOutletContext }) {
  const { headerToolbarElement, viewHeaderModel: header, viewMenus: menus, viewSearch, onViewSearchChange } = context;
  const { t, timeZone } = useAppI18n();
  const client = useQueryClient();
  const { query: q, isWaiting } = useViewSearch(viewSearch);
  const model = useViewMainData(header, q, timeZone);
  const [creating, setCreating] = useState(false);
  const [creation, setCreation] = useState<"success" | "error" | null>(null);
  const creatingRef = useRef(false);
  // 1. Object의 전체 속성은 메뉴 후보가 필요할 때만 읽고 본문 열은 View 응답을 따른다.
  const attributes = useWorkspaceObjectAttributeDefinitionsQuery({ userId: header.userId, workspaceId: header.workspaceId,
    objectDefinitionId: header.targetType === "OBJECT" ? header.target?.id ?? null : null,
    enabled: header.targetType === "OBJECT" && menus.active !== null });
  const ready = model.query.data?.pages[0]?.state === "READY";
  const canCreate = header.targetType === "OBJECT" && Boolean(header.target && model.scope && ready);
  // 기능 : 기존 빈 Record 생성 API를 재사용하고 새 저장 결과로 본문을 다시 읽습니다.
  async function createRecord() {
    if (!canCreate || !model.scope || creatingRef.current) return;
    // 1. 중복 클릭을 차단하고 요청 당시의 Object와 query 범위를 고정한다.
    const scope = model.scope;
    creatingRef.current = true; setCreating(true); setCreation(null);
    try {
      await createWorkspaceObjectRecordDefinition({ workspaceId: scope.workspaceId, objectDefinitionId: scope.targetId });
      await client.resetQueries({ queryKey: viewDataQueryKeys.main(scope, q, VIEW_DATA_PAGE_SIZE), exact: true });
      setCreation("success");
    } catch {
      setCreation("error");
    } finally { creatingRef.current = false; setCreating(false); }
  }
  // 기능 : 헤더와 하단 추가 버튼에 같은 생성 동작을 제공합니다.
  function handleCreate() { void createRecord(); }
  const toolbar = <ViewHeaderToolbar header={header} menus={menus} attributes={attributes.data ?? []}
    searchLabel={t("common.search")} searchValue={viewSearch} onSearchChange={onViewSearchChange}
    {...(canCreate ? { onCreateRecord: handleCreate } : {})} isCreatingRecord={creating}
    createUnavailable={header.targetType === "LIST"} />;
  return <section className="flex h-[calc(100dvh-var(--topbar-height))] min-h-0 flex-1 flex-col overflow-hidden bg-white"
    aria-label={header.target?.name ?? t("shell.appFallbackTitle")} data-testid={header.targetType === "LIST" ? "workspace-list-page" : "workspace-object-list-page"}>
    {headerToolbarElement ? createPortal(toolbar, headerToolbarElement) : <div className="flex h-[var(--topbar-height)] shrink-0 items-center bg-white px-3 lg:hidden">{toolbar}</div>}
    {creation && <div role={creation === "error" ? "alert" : "status"} className="shrink-0 px-4 py-2 text-[12px] text-[#787774]">{t(creation === "success" ? "viewData.created" : "viewData.createFailed")}</div>}
    <div className="notion-scrollbar min-h-0 flex-1 overflow-auto">
      <ViewMainContent header={header} model={model} searching={isWaiting} onCreate={canCreate ? handleCreate : undefined} creating={creating} />
    </div>
  </section>;
}
