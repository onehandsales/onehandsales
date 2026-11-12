import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { ApiClientError } from "@/lib/api-client";
import type { ViewDataBinding, ViewDataRequest, ViewKanbanColumn, ViewKanbanResponse } from "../types/view-data";
import { useViewKanbanColumn } from "../hooks/use-view-kanban-column";
import { ViewDataCell, type ViewCellEditing } from "./view-data-cell";

// 기능 : MAIN에서 받은 카드와 해당 열의 추가 페이지를 독립적으로 표시합니다.
function KanbanColumn({ column, input, bindings, onRestart, editing, compact }: {
  readonly column: ViewKanbanColumn; readonly input: ViewDataRequest; readonly bindings: readonly ViewDataBinding[]; readonly onRestart: () => void;
  readonly editing: ViewCellEditing;
  readonly compact: boolean;
}) {
  const { t } = useAppI18n();
  const [expanded, setExpanded] = useState(!column.isFold);
  const query = useViewKanbanColumn(input, column, expanded);
  const cards = query.data?.pages.flatMap(page => page.items) ?? [];
  const stale = query.error instanceof ApiClientError && [400, 409].includes(query.error.statusCode);
  return <section className={expanded ? "w-[280px] shrink-0" : "w-10 shrink-0"} aria-label={column.label} data-testid="kanban-column">
    <button className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] font-medium text-[#65645F] hover:bg-[#F0EFEC]" type="button"
      aria-label={t(expanded ? "viewData.collapseGroup" : "viewData.expandGroup", { values: { name: column.label } })} aria-expanded={expanded} onClick={() => setExpanded(current => !current)}>
      {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
      {expanded && <><span className="h-2 w-2 shrink-0 rounded-full bg-[#9B9A97]" style={{ backgroundColor: column.color ?? undefined }} /><span className="truncate">{column.label}</span><span className="text-[#9B9A97]">{column.count}</span></>}
    </button>
    {!expanded ? <p className="mx-auto mt-2 text-[12px] text-[#9B9A97] [writing-mode:vertical-rl]">{column.label} · {column.count}</p> : <div className="space-y-2 rounded-lg bg-[#F8F7F4] p-2">
      {cards.map(item => <article key={item.occurrenceKey} className="rounded-lg border border-[#E7E6E2] bg-white text-[13px] text-[#37352F] shadow-[0_1px_2px_rgba(0,0,0,0.03)]" style={{ paddingBlock: compact ? 2 : 8 }} data-testid="kanban-card">
        <div className="h-9 pb-1 font-semibold">{bindings.find(binding => binding.role === "TITLE") ? <ViewDataCell binding={bindings.find(binding => binding.role === "TITLE")!} item={item} editing={editing} primary /> : item.title}</div>
        {bindings.filter(binding => !binding.isHidden && binding.role !== "TITLE").map(binding => <div key={binding.id} className="flex min-h-7 items-center">
          <span className="w-16 shrink-0 truncate pl-3 text-[11px] text-[#9B9A97]" title={binding.label}>{binding.label}</span>
          <ViewDataCell binding={binding} item={item} editing={editing} />
        </div>)}
      </article>)}
      {query.isPending && <p role="status" className="px-2 py-3 text-[12px] text-[#9B9A97]">{t("common.loading")}</p>}
      {!cards.length && !query.isPending && !query.isError && <p className="px-2 py-3 text-[12px] text-[#9B9A97]">{t("viewData.emptyGroup")}</p>}
      {query.isError && <div role="alert" className="px-2 py-2 text-[12px] text-[#787774]">
        <p>{t(stale ? "viewData.stale" : "viewData.loadMoreFailed")}</p>
        <button className="mt-2 text-[#326ACD]" type="button" onClick={stale ? onRestart : () => { if (cards.length) void query.fetchNextPage(); else void query.refetch(); }}>{t(stale ? "viewData.restart" : "common.retry")}</button>
      </div>}
      {query.hasNextPage && !query.isError && <button className="h-8 w-full rounded text-[12px] text-[#787774] hover:bg-[#EEEDEA] disabled:opacity-50" type="button"
        disabled={query.isFetchingNextPage} onClick={() => { void query.fetchNextPage(); }}>{t(query.isFetchingNextPage ? "common.loading" : "common.loadMore")}</button>}
    </div>}
  </section>;
}

// 기능 : 저장된 단계 순서·숨김·접힘과 전체 건수를 칸반 보드에 반영합니다.
export function ViewDataKanban({ response, input, onRestart, editing }: {
  readonly response: ViewKanbanResponse; readonly input: ViewDataRequest; readonly onRestart: () => void;
  readonly editing: ViewCellEditing;
}) {
  const { t } = useAppI18n();
  const columns = response.data.columns.filter(column => !column.isHidden);
  return <div data-testid="view-kanban">
    <div className="flex min-w-max items-start gap-3 p-3">
      {columns.map(column => <KanbanColumn key={column.groupToken} column={column} input={input} bindings={response.bindings} onRestart={onRestart} editing={editing} compact={response.data.presentation.cardDensity === "COMPACT"} />)}
      {!columns.length && <p className="p-2 text-[13px] text-[#9B9A97]">{t("viewData.emptyGroup")}</p>}
    </div>
    <p className="px-4 pb-3 text-[11px] text-[#9B9A97]">{t("viewData.unassigned", { values: { count: response.data.unassignedCount } })}</p>
  </div>;
}
