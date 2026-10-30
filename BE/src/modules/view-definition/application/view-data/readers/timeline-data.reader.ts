import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType, ViewItemPage } from "../view-data.types";
import { dateEvents } from "../view-data-dates";
import { groupedRows } from "../view-data-groups";
// 기능 : 유효 기간의 막대와 기간 미설정 목록을 분리합니다.
export function readTimelineData(
  context: ViewDataQueryContext,
): ViewMainDataByType["TIMELINE"] | ViewItemPage {
  const presentation = context.presentation(
    { timeScale: "WEEK" },
    { timeScale: ["DAY", "WEEK", "MONTH"] },
  );
  const dates = dateEvents(context);
  if (
    context.part === "UNSCHEDULED_ITEMS" ||
    context.part === "INVALID_DATE_ITEMS"
  ) {
    const items =
      context.part === "UNSCHEDULED_ITEMS" ? dates.unscheduled : dates.invalid;
    context.eligibleCount = items.length;
    return context.page(items);
  }
  const { groups, rows } = groupedRows(context),
    byId = new Map(dates.events.map((event) => [event.item.itemKey, event]));
  const bars = rows.flatMap((row) => {
    const event = byId.get(row.item.key);
    return event
      ? [{ ...event, item: context.values.item(row.item, row.path) }]
      : [];
  });
  context.eligibleCount = new Set(bars.map((bar) => bar.item.itemKey)).size;
  const page = context.page(bars);
  return {
    presentation,
    range: context.range,
    bars: page.items,
    groups,
    unscheduledCount: dates.unscheduled.length,
    invalidDateCount: dates.invalid.length,
    pageInfo: page.pageInfo,
  };
}
