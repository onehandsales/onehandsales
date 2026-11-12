import { useAppI18n } from "@/features/app-i18n";
import { Link } from "react-router-dom";
import { toWorkspaceViewPath } from "@/features/workspace";
import { useQueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api-client";
import type { WorkspaceViewHeaderModel } from "../hooks/use-workspace-view-header";
import { isSupportedViewDataType, VIEW_DATA_PAGE_SIZE, type ViewMainDataModel } from "../hooks/use-view-main-data";
import type { ViewDataItem, ViewMainResponse } from "../types/view-data";
import { ViewDataTable } from "./view-data-table";
import { ViewDataList } from "./view-data-list";
import { ViewDataKanban } from "./view-data-kanban";

// 기능 : 본문의 로딩·빈 상태·설정 부족·오류와 세 타입 화면을 공통으로 관리합니다.
export function ViewMainContent({ header, model, searching, onCreate, creating }: {
  readonly header: WorkspaceViewHeaderModel; readonly model: ViewMainDataModel; readonly searching: boolean;
  readonly onCreate?: (() => void) | undefined; readonly creating: boolean;
}) {
  const { t } = useAppI18n();
  const client = useQueryClient();
  const { query, scope } = model;
  const response = query.data?.pages[0];
  const entryWorkspaceId = header.workspaceId;
  const entryViewId = header.currentView?.viewDefinitionId;
  // 기능 : 원본 Record 수정 후 같은 원본을 포함할 수 있는 본문 캐시를 무효화합니다.
  async function refreshValues() {
    // 1. 원본의 캐시를 무효화하고 요청 당시 보기의 첫 페이지를 갱신한다.
    const prefix = ["crm-view", header.userId?.toLowerCase(), header.workspaceId?.toLowerCase(), "data"];
    await client.resetQueries({ queryKey: prefix });
  }
  // 기능 : 페이지 맥락 오류는 처음부터, 접근 불가는 헤더부터 복구합니다.
  function recover() {
    if (query.error instanceof ApiClientError && [403, 404].includes(query.error.statusCode)) header.onRetry();
    else if (query.isFetchNextPageError && !(query.error instanceof ApiClientError && [400, 409].includes(query.error.statusCode))) void query.fetchNextPage();
    else model.restart();
  }
  if (header.isLoading) return <ViewDataLoading />;
  if (header.isError) return <ViewDataMessage text={t("viewData.unavailable")} onRetry={header.onRetry} />;
  if (header.isTargetSelectionRequired) return <div className="flex flex-col items-center gap-3 px-4 py-12 text-[13px] text-[#787774]" data-testid="view-target-choice">
    <p>{t("viewHeader.targetChoiceTitle")}</p>
    {entryWorkspaceId && entryViewId && header.targetChoices?.map(target => <Link className="max-w-full rounded bg-[#F3F2EF] px-3 py-2 text-[#326ACD]" key={target.type}
      to={toWorkspaceViewPath(entryWorkspaceId, entryViewId, target.type)}>{t(target.type === "OBJECT" ? "viewHeader.objectTarget" : "viewHeader.listTarget")} · {target.name}</Link>)}
  </div>;
  if (header.isTargetMissing) return <ViewDataMessage text={t("viewHeader.targetMissing")} onRetry={header.onRetry} />;
  if (!header.currentView) return <ViewDataMessage text={t("viewData.noView")} />;
  if (!isSupportedViewDataType(header.currentView.viewType)) return <ViewDataMessage text={t("viewData.unsupported")} />;
  if (query.isPending || searching && !response) return <ViewDataLoading />;
  if (!response || !scope) return <ViewDataMessage text={t(query.error instanceof ApiClientError && [403, 404].includes(query.error.statusCode) ? "viewData.unavailable" : "viewData.failed")} onRetry={recover} />;
  if (response.state === "NEEDS_CONFIGURATION") return <ViewDataMessage text={t("viewData.needsConfiguration")} onRetry={model.restart} />;
  // 2. 같은 Record의 여러 Entry를 보존하고 같은 표시 occurrence만 중복 제거한다.
  const pages: ViewMainResponse[] = query.data?.pages ?? [];
  const items = [...new Map(pages.flatMap(page => page.state === "READY" && page.viewType !== "KANBAN" ? page.data.items : [])
    .map(item => [item.occurrenceKey, item] as const)).values()] as ViewDataItem[];
  const editing = { userId: header.userId ?? undefined, workspaceId: scope.workspaceId, onSaved: refreshValues };
  const stale = query.error instanceof ApiClientError && [400, 409].includes(query.error.statusCode);
  return <div aria-busy={query.isFetching || searching} data-testid="view-main-content">
    {searching && <p role="status" className="px-3 py-1 text-[11px] text-[#9B9A97]">{t("viewData.searching")}</p>}
    {response.viewType === "TABLE" ? <ViewDataTable key={`${scope.userId}:${scope.workspaceId}:${scope.sourceType}:${scope.targetId}:${scope.viewDefinitionId}:${response.configurationFingerprint}`} scope={scope} response={response} items={items} editing={editing} onCreate={onCreate} creating={creating} />
      : response.viewType === "LIST" ? <ViewDataList key={response.configurationFingerprint} response={response} items={items} editing={editing} />
        : <ViewDataKanban response={response} input={{ ...scope, q: model.q, limit: VIEW_DATA_PAGE_SIZE }} onRestart={model.restart} editing={{ ...editing, userId: header.userId ?? undefined }} />}
    {response.viewType !== "KANBAN" && !items.length && <p className="px-4 py-4 text-[13px] text-[#9B9A97]">{t(model.q ? "common.searchEmpty" : "objectList.emptyRecords")}</p>}
    {query.isError && <div role="alert" className="flex flex-wrap items-center justify-center gap-2 px-4 py-4 text-[12px] text-[#787774]">
      <span>{t(stale ? "viewData.stale" : "viewData.loadMoreFailed")}</span><button className="text-[#326ACD]" type="button" onClick={recover}>{t(stale ? "viewData.restart" : "common.retry")}</button>
    </div>}
    {query.hasNextPage && !query.isError && <div className="flex h-12 items-center justify-center"><button className="h-8 rounded-md bg-[#F3F2EF] px-2.5 text-[14px] text-[#374151] hover:bg-[#EDEBE6] disabled:opacity-50" type="button" disabled={query.isFetchingNextPage} onClick={() => { void query.fetchNextPage(); }}>{t(query.isFetchingNextPage ? "common.loading" : "common.loadMore")}</button></div>}
    <p className="px-4 py-3 text-[11px] text-[#9B9A97]">{t("viewData.count", { values: { count: response.summary?.eligibleItemCount ?? 0 } })}</p>
  </div>;
}

// 기능 : 기존 표의 행 높이와 색상을 유지한 본문 로딩 표시를 제공합니다.
function ViewDataLoading() {
  const { t } = useAppI18n();
  return <div role="status" aria-label={t("objectList.loadingRecords")} className="space-y-px">
    <div className="h-9 border-b border-[#EEEDEA] bg-[#FAFAF8]" />
    {[0, 1, 2].map(row => <div key={row} className="flex h-10 items-center gap-10 border-b border-[#F1F0EC] px-4"><span className="h-3 w-28 animate-pulse rounded bg-[#F3F2EF]" /><span className="h-3 w-20 animate-pulse rounded bg-[#F3F2EF]" /></div>)}
  </div>;
}

// 기능 : 오류를 정상 빈 결과와 구분하고 같은 화면에서 복구할 수 있게 합니다.
function ViewDataMessage({ text, onRetry }: { readonly text: string; readonly onRetry?: (() => void) | undefined }) {
  const { t } = useAppI18n();
  return <div role={onRetry ? "alert" : "status"} className="flex flex-col items-center gap-3 px-4 py-12 text-center text-[13px] text-[#787774]">
    <p>{text}</p>{onRetry && <button className="rounded bg-[#F3F2EF] px-3 py-1.5 text-[#326ACD]" type="button" onClick={onRetry}>{t("common.retry")}</button>}
  </div>;
}
