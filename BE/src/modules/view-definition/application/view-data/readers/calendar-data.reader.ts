import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType, ViewItemPage } from "../view-data.types";
import { dateEvents } from "../view-data-dates";
// 기능 : Calendar의 하루 일정·기간 일정과 날짜 예외 목록을 반환합니다.
export function readCalendarData(
  context: ViewDataQueryContext,
): ViewMainDataByType["CALENDAR"] | ViewItemPage {
  const presentation = context.presentation(
    { initialMode: "MONTH", weekStartsOn: "MONDAY" },
    { initialMode: ["MONTH", "WEEK"], weekStartsOn: ["MONDAY", "SUNDAY"] },
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
  const page = context.page(dates.events);
  return {
    presentation,
    range: context.range,
    events: page.items,
    unscheduledCount: dates.unscheduled.length,
    invalidDateCount: dates.invalid.length,
    pageInfo: page.pageInfo,
  };
}
