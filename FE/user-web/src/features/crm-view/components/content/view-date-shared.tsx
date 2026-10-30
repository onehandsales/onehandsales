import { useId, useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { useViewData, type ViewDataScope } from "../../hooks/use-view-data";
import type {
  ViewDataRequest,
  ViewEvent,
  ViewRange,
  ViewDependency,
  ViewGanttTask,
  ViewDataGroup,
} from "../../types/view-data";
import {
  ViewRecordCard,
  ViewPagination,
  viewButton,
} from "./view-content-shared";
import { eventDay, dayNumber } from "../../utils/view-data-dates";

// 기능 : 기간 막대와 현재 페이지에서 연결 가능한 의존 관계를 그립니다.
export function DateBars({
  events: allEvents,
  range,
  dependencies = [],
  groups = [],
  timeScale = "WEEK",
}: {
  events: (ViewEvent | ViewGanttTask)[];
  range: ViewRange;
  dependencies?: ViewDependency[];
  groups?: ViewDataGroup[];
  timeScale?: string;
}) {
  const { t } = useAppI18n();
  const arrowId = useId().replaceAll(":", "");
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const events = allEvents.filter(event => event.item.groupPath.every(key => !(folded[key] ?? groups.find(group => group.key === key)?.isFold ?? false)));
  const days = dayNumber(range.endDateExclusive) - dayNumber(range.startDate),
    width = Math.max(700, days * (timeScale === "DAY" ? 28 : timeScale === "MONTH" ? 8 : 18)),
    rowHeight = 46;
  const positions = events.map((event) => {
    const start = eventDay(event.start, event.dateKind, range.timeZone),
      end = event.end
        ? eventDay(event.end, event.dateKind, range.timeZone)
        : start;
    const a = Math.max(0, dayNumber(start) - dayNumber(range.startDate)),
      b = Math.min(
        days,
        dayNumber(end) -
          dayNumber(range.startDate) +
          (event.endInclusive || !event.end ? 1 : 0),
      );
    return {
      x: (a / days) * width,
      end: Math.max((a / days) * width + 4, (b / days) * width),
    };
  });
  return (
    <div className="overflow-x-auto">
      {groups.length > 0 && <div className="flex flex-wrap gap-2 border-b px-3 py-2">{groups.filter(group => !group.isHidden).map(group => { const closed = folded[group.key] ?? group.isFold; return <button key={group.key} type="button" className={viewButton} aria-expanded={!closed} onClick={() => setFolded(previous => ({ ...previous, [group.key]: !closed }))}>{closed ? "▸" : "▾"} {group.label} · {group.count}</button>; })}</div>}
      <div style={{ minWidth: width + 200 }}>
        <div className="flex border-b text-xs text-[#787774]">
          <div className="w-[200px] shrink-0 px-3 py-2">
            {t("viewContent.record")}
          </div>
          <div className="relative h-9" style={{ width }}>
            {Array.from({ length: days }, (_, index) =>
              index % (timeScale === "MONTH" ? 30 : timeScale === "WEEK" ? 7 : 1) === 0 ? (
                <span
                  key={index}
                  className="absolute border-l pl-1 pt-2"
                  style={{ left: (index / days) * width }}
                >
                  {new Date((dayNumber(range.startDate) + index) * 86400000)
                    .toISOString()
                    .slice(5, 10)}
                </span>
              ) : null,
            )}
          </div>
        </div>
        <div className="relative">
          {events.map((event, index) => (
            <div
              key={event.item.occurrenceKey}
              className="flex border-b"
              style={{ height: rowHeight }}
            >
              <div
                className="flex w-[200px] shrink-0 items-center truncate px-3 text-xs"
                title={event.item.title}
              >
                {event.item.title}
              </div>
              <div className="relative" style={{ width }}>
                <div
                  className="absolute top-2.5 h-6 overflow-hidden rounded bg-[#DCEAF4] text-xs text-[#35627F]"
                  style={{
                    left: positions[index]!.x,
                    width: positions[index]!.end - positions[index]!.x,
                  }}
                  title={`${event.item.title}: ${event.start} → ${event.end ?? event.start}`}
                >
                  <span className="relative z-[1] px-2 leading-6">
                    {event.item.title}
                  </span>
                  {"progress" in event && event.progress && (
                    <span
                      className="absolute inset-y-0 left-0 bg-[#8EC5E5]/50"
                      style={{
                        width: `${Number(event.progress.ratio) * 100}%`,
                      }}
                    />
                  )}
                </div>
                {"progress" in event && event.progress && (
                  <span
                    className="absolute top-3 text-[10px] text-[#787774]"
                    style={{
                      left: Math.min(width - 35, positions[index]!.end + 6),
                    }}
                  >
                    {Number(event.progress.ratio) * 100}%
                  </span>
                )}
              </div>
            </div>
          ))}
          <svg
            className="pointer-events-none absolute left-[200px] top-0 overflow-visible"
            width={width}
            height={events.length * rowHeight}
            aria-label={t("viewContent.dependencies")}
          >
            <defs>
              <marker
                id={arrowId}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0 0L10 5L0 10" fill="#9B9A97" />
              </marker>
            </defs>
            {dependencies
              .filter((edge) => edge.renderable)
              .map((edge) => {
                const from = events.findIndex(
                    (event) => event.item.itemKey === edge.source.itemKeys[0],
                  ),
                  to = events.findIndex(
                    (event) => event.item.itemKey === edge.target.itemKeys[0],
                  );
                if (from < 0 || to < 0) return null;
                const startAtEnd = edge.type.startsWith("FINISH"),
                  endAtEnd = edge.type.endsWith("FINISH"),
                  x1 = startAtEnd ? positions[from]!.end : positions[from]!.x,
                  x2 = endAtEnd ? positions[to]!.end : positions[to]!.x,
                  y1 = from * rowHeight + 23,
                  y2 = to * rowHeight + 23;
                return (
                  <path
                    key={edge.id}
                    d={`M${x1},${y1} H${x1 + 10} V${y2} H${x2}`}
                    fill="none"
                    stroke="#9B9A97"
                    markerEnd={`url(#${arrowId})`}
                  >
                    <title>
                      {edge.type}: {edge.offset.value} {edge.offset.unit}
                    </title>
                  </path>
                );
              })}
          </svg>
        </div>
      </div>
    </div>
  );
}
// 기능 : 미설정·잘못된 기간 목록은 사용자가 열었을 때만 같은 API로 조회합니다.
export function DateExceptions({
  scope,
  request,
  unscheduledCount,
  invalidDateCount,
}: {
  scope: ViewDataScope;
  request: ViewDataRequest;
  unscheduledCount: number;
  invalidDateCount: number;
}) {
  return (
    <div className="space-y-2 px-4 py-3">
      {unscheduledCount > 0 && (
        <DateExceptionList
          scope={scope}
          request={request}
          part="UNSCHEDULED_ITEMS"
          count={unscheduledCount}
        />
      )}
      {invalidDateCount > 0 && (
        <DateExceptionList
          scope={scope}
          request={request}
          part="INVALID_DATE_ITEMS"
          count={invalidDateCount}
        />
      )}
    </div>
  );
}
// 기능 : 예외 목록의 펼침·페이지·실패 상태를 주 일정과 분리합니다.
function DateExceptionList({
  scope,
  request,
  part,
  count,
}: {
  scope: ViewDataScope;
  request: ViewDataRequest;
  part: "UNSCHEDULED_ITEMS" | "INVALID_DATE_ITEMS";
  count: number;
}) {
  const { t } = useAppI18n();
  const [open, setOpen] = useState(false),
    [cursor, setCursor] = useState<string | undefined>();
  const query = useViewData(scope, { ...request, cursor, part }, open);
  const page =
    query.data?.state === "READY" &&
    query.data.part !== "MAIN" &&
    query.data.part !== "MAP_MARKERS"
      ? query.data.data
      : null;
  return (
    <section>
      <button
        className="text-xs text-[#787774]"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "▾" : "▸"}{" "}
        {t(
          `viewContent.${part === "UNSCHEDULED_ITEMS" ? "unscheduled" : "invalidDates"}`,
        )}{" "}
        · {count}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {query.isPending && <p role="status">{t("viewContent.loading")}</p>}
          {query.isError && (
            <button className={viewButton} onClick={() => void query.refetch()}>
              {t("viewContent.retry")}
            </button>
          )}
          {page?.items.map((item) => (
            <ViewRecordCard
              key={item.itemKey}
              item={item}
              bindings={query.data!.bindings}
            />
          ))}
          {page && (
            <ViewPagination
              pageInfo={page.pageInfo}
              onNext={setCursor}
              {...(cursor ? { onFirst: () => setCursor(undefined) } : {})}
            />
          )}
        </div>
      )}
    </section>
  );
}
