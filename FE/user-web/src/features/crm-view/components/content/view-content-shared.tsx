import type { ReactNode } from "react";
import { useAppI18n } from "@/features/app-i18n";
import type {
  ViewCell,
  ViewDataBinding,
  ViewDataItem,
  ViewDataRequest,
  ViewPageInfo,
  ViewMainResponse,
} from "../../types/view-data";
import type { WorkspaceViewType } from "../../types/workspace-view";
import type { ViewDataScope } from "../../hooks/use-view-data";
import { formattedViewNumber } from "../../utils/view-data-display";

export type ViewCellRenderer = (
  item: ViewDataItem,
  binding: ViewDataBinding,
  cell: ViewCell | undefined,
) => ReactNode | undefined;
export type ViewContentProps<T extends WorkspaceViewType> = {
  response: Extract<ViewMainResponse, { viewType: T }>;
  scope: ViewDataScope;
  request: ViewDataRequest;
  onRequest: (request: ViewDataRequest) => void;
  renderCell?: ViewCellRenderer | undefined;
};
export const viewButton =
  "rounded border border-[#E7E7E5] bg-white px-3 py-1.5 text-xs text-[#575752] hover:bg-[#F7F7F5] disabled:opacity-50";

// 기능 : 값 상태와 타입을 구분하여 다중값을 빠뜨리지 않고 표시합니다.
export function ViewCellDisplay({
  cell,
  binding,
}: {
  cell: ViewCell | undefined;
  binding: ViewDataBinding;
}) {
  const { t, formatDateTime } = useAppI18n();
  if (!cell || cell.state === "EMPTY")
    return <span className="text-[#B4B3AF]">—</span>;
  if (cell.state !== "VALUE")
    return (
      <span
        className="text-amber-700"
        title={t(
          `viewContent.${cell.state === "INVALID" ? "invalidValue" : "unavailableValue"}`,
        )}
      >
        —
      </span>
    );
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {cell.values.map((value) => {
        const raw = value.value;
        let label = "";
        if (typeof raw === "boolean") label = raw ? "✓" : "—";
        else if (typeof raw === "string")
          label = ["Number", "Currency", "Rating"].includes(
            binding.attributeType,
          )
            ? formattedViewNumber(raw, binding)
            : binding.attributeType === "Timestamp"
              ? formatDateTime(raw)
              : raw;
        else if (typeof raw === "number") label = String(raw);
        else if (raw && !Array.isArray(raw))
          label = String(
            raw.label ??
              raw.displayName ??
              raw.text ??
              raw.summary ??
              t("viewContent.untitled"),
          );
        const badge = [
          "Status",
          "Select",
          "RecordReference",
          "ActorReference",
        ].includes(binding.attributeType);
        return (
          <span
            key={`${value.sourceEntity.kind}:${value.sourceEntity.id}:${value.valueDefinitionId}`}
            className={
              badge
                ? "max-w-full truncate rounded bg-[#F1F2F5] px-1.5 py-0.5 text-xs text-[#575752]"
                : "max-w-full whitespace-pre-wrap break-words"
            }
          >
            {label || "—"}
          </span>
        );
      })}
    </span>
  );
}
// 기능 : 카드의 TITLE 외 표시 속성과 안전한 다중값을 구성합니다.
export function ViewRecordCard({
  item,
  bindings,
  compact = false,
}: {
  item: ViewDataItem;
  bindings: ViewDataBinding[];
  compact?: boolean;
}) {
  return (
    <article
      className={`rounded-md border border-[#E8E7E4] bg-white ${compact ? "p-2" : "p-3"}`}
      data-item-key={item.itemKey}
    >
      <h3 className="break-words text-sm font-medium text-[#37352F]">
        {item.title}
      </h3>
      <dl className="mt-2 space-y-1.5 text-xs">
        {bindings
          .filter((binding) => !binding.isHidden && binding.role === "DISPLAY")
          .map((binding) => (
            <div className="flex min-w-0 items-start gap-2" key={binding.id}>
              <dt className="w-20 shrink-0 truncate text-[#9B9A97]">
                {binding.label}
              </dt>
              <dd className="min-w-0">
                <ViewCellDisplay
                  binding={binding}
                  cell={item.cells.find(
                    (cell) => cell.bindingId === binding.id,
                  )}
                />
              </dd>
            </div>
          ))}
      </dl>
    </article>
  );
}
// 기능 : 누락과 실제 빈 조회 결과를 구분하는 본문 빈 상태를 표시합니다.
export function ViewEmpty() {
  const { t } = useAppI18n();
  return (
    <p className="px-5 py-12 text-center text-sm text-[#9B9A97]">
      {t("viewContent.empty")}
    </p>
  );
}
// 기능 : 페이지 이어 읽기와 첫 페이지 이동을 같은 위치에 제공합니다.
export function ViewPagination({
  pageInfo,
  onNext,
  onFirst,
  busy = false,
}: {
  pageInfo: ViewPageInfo;
  onNext: (cursor: string) => void;
  onFirst?: () => void;
  busy?: boolean;
}) {
  const { t } = useAppI18n();
  return (
    <div className="flex justify-end gap-2 px-3 py-3">
      {onFirst && (
        <button
          type="button"
          className={viewButton}
          disabled={busy}
          onClick={onFirst}
        >
          {t("viewContent.firstPage")}
        </button>
      )}
      {pageInfo.hasNextPage && pageInfo.nextCursor && (
        <button
          type="button"
          className={viewButton}
          disabled={busy}
          onClick={() => onNext(pageInfo.nextCursor!)}
        >
          {t("viewContent.nextPage")}
        </button>
      )}
    </div>
  );
}
