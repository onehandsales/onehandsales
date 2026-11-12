import { useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { ViewHeaderToolbar } from "@/components/layout/view-header-toolbar";
import { useAppI18n } from "@/features/app-i18n";
import { CreateRecordDialog, useWorkspaceObjectAttributeDefinitionsQuery } from "@/features/crm-object";
import { ViewConfigurationBar, ViewMainContent, useViewMainData, useViewSearch } from "@/features/crm-view";

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
  const model = useViewMainData(header, q, timeZone, menus.command);
  const [createOpen, setCreateOpen] = useState(false);
  const [creation, setCreation] = useState<"success" | "refreshError" | null>(null);
  // 1. Object의 전체 속성은 메뉴 후보가 필요할 때만 읽고 본문 열은 View 응답을 따른다.
  const attributes = useWorkspaceObjectAttributeDefinitionsQuery({ userId: header.userId, workspaceId: header.workspaceId,
    objectDefinitionId: header.targetType === "OBJECT" ? header.target?.id ?? null : null,
    enabled: header.targetType === "OBJECT" && menus.active !== null });
  const ready = model.query.data?.pages[0]?.state === "READY";
  const canCreate = header.targetType === "OBJECT" && Boolean(header.target && model.scope && ready);
  // 기능 : 저장 성공 후 관련 Record를 표시하는 모든 View 캐시를 다시 읽습니다.
  async function refreshCreated() {
    setCreateOpen(false); setCreation("success");
    try {
      await client.resetQueries({ queryKey: ["crm-view", header.userId?.toLowerCase(), header.workspaceId?.toLowerCase(), "data"] }, { throwOnError: true });
    } catch {
      setCreation("refreshError");
    }
  }
  // 기능 : 헤더와 하단 추가 버튼에 같은 생성 동작을 제공합니다.
  function handleCreate() { if (canCreate) { setCreation(null); setCreateOpen(true); } }
  const toolbar = <ViewHeaderToolbar header={header} menus={menus} attributes={attributes.data ?? []}
    searchLabel={t("common.search")} searchValue={viewSearch} onSearchChange={onViewSearchChange}
    {...(canCreate ? { onCreateRecord: handleCreate } : {})} isCreatingRecord={false}
    createUnavailable={header.targetType === "LIST"} />;
  return <section className="flex h-[calc(100dvh-var(--topbar-height))] min-h-0 flex-1 flex-col overflow-hidden bg-white"
    aria-label={header.target?.name ?? t("shell.appFallbackTitle")} data-testid={header.targetType === "LIST" ? "workspace-list-page" : "workspace-object-list-page"}>
    {headerToolbarElement ? createPortal(toolbar, headerToolbarElement) : <div className="flex h-[var(--topbar-height)] shrink-0 items-center bg-white px-3 lg:hidden">{toolbar}</div>}
    <ViewConfigurationBar menus={menus} />
    {creation && <div role="status" className="shrink-0 px-4 py-2 text-[12px] text-[#787774]">{creation === "success" ? "기록을 저장했어요. 현재 보기의 필터와 정렬에 따라 표시돼요." : "기록은 저장됐어요. 화면을 새로고침해 주세요."}</div>}
    {createOpen && model.scope && header.userId && <CreateRecordDialog scope={{ userId: header.userId, workspaceId: model.scope.workspaceId, objectDefinitionId: model.scope.targetId }} objectName={header.target?.name ?? ""}
      onClose={() => setCreateOpen(false)} onCreated={() => { void refreshCreated(); }} />}
    <div className="notion-scrollbar min-h-0 flex-1 overflow-auto">
      <ViewMainContent header={header} model={model} searching={isWaiting || model.isPreviewWaiting} onCreate={canCreate ? handleCreate : undefined} creating={false} menus={menus} />
    </div>
  </section>;
}
