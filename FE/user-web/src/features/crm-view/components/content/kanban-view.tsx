import { useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { useViewData } from "../../hooks/use-view-data";
import { decimalLabel } from "../../utils/view-data-display";
import type { ViewMainDataByType } from "../../types/view-data";
import type { ViewContentProps } from "./view-content-shared";
import {
  ViewRecordCard,
  ViewPagination,
  viewButton,
} from "./view-content-shared";
// 기능 : 각 단계의 독립 페이지와 접힘 상태를 보존하는 보드를 표시합니다.
export function KanbanView(props: ViewContentProps<"KANBAN">) {
  return (
    <div
      className="flex min-h-72 items-start gap-3 overflow-x-auto p-4"
      data-testid="view-kanban"
    >
      {props.response.data.columns.map((column) => (
        <KanbanColumn
          key={`${props.response.configurationFingerprint}:${column.key}`}
          column={column}
          {...props}
        />
      ))}
    </div>
  );
}
// 기능 : 한 열의 이어 읽기 실패와 로딩을 다른 열과 분리합니다.
function KanbanColumn({
  column,
  response,
  scope,
  request,
}: ViewContentProps<"KANBAN"> & {
  column: ViewMainDataByType["KANBAN"]["columns"][number];
}) {
  const { t } = useAppI18n();
  const [cursor, setCursor] = useState<string | undefined>();
  const [folded, setFolded] = useState(column.isFold);
  const query = useViewData(
    scope,
    {
      ...request,
      part: "GROUP_ITEMS",
      groupToken: column.groupToken,
      ...(cursor ? { cursor } : {}),
    },
    !!cursor,
  );
  const page =
    cursor && query.data?.state === "READY" && query.data.part === "GROUP_ITEMS"
      ? query.data.data
      : column;
  return (
    <section className="w-72 shrink-0 rounded-md bg-[#F7F7F5] p-2">
      <button
        type="button"
        onClick={() => setFolded(!folded)}
        className="flex w-full items-center gap-2 px-1 py-2 text-left text-sm font-medium"
        aria-expanded={!folded}
      >
        <span aria-hidden>{folded ? "▸" : "▾"}</span>
        {column.label}
        <span className="text-xs text-[#9B9A97]">{column.count}</span>
      </button>
      {!folded && (
        <>
          <div className="space-y-2" aria-busy={query.isFetching}>
            {page.items.map((item) => (
              <ViewRecordCard
                key={item.occurrenceKey}
                item={item}
                bindings={response.bindings}
                compact={response.data.presentation.cardDensity === "COMPACT"}
              />
            ))}
          </div>
          {query.isError && (
            <p role="alert" className="p-2 text-xs text-red-700">
              {t("viewContent.loadError")}{" "}
              <button
                className={viewButton}
                onClick={() => { if (cursor) setCursor(undefined); else void query.refetch(); }}
              >
                {t("viewContent.retry")}
              </button>
            </p>
          )}
          <ViewPagination
            pageInfo={page.pageInfo}
            onNext={setCursor}
            {...(cursor ? { onFirst: () => setCursor(undefined) } : {})}
            busy={query.isFetching}
          />
          {column.calculations.map((calculation, index) => <p key={calculation.metric.bindingId ?? index} className="px-2 pb-2 text-xs text-[#787774]">{calculation.metric.aggregation}: {decimalLabel(calculation.result.value, calculation.metric.currencyCode)}</p>)}
        </>
      )}
    </section>
  );
}
