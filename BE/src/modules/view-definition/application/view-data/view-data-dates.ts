import type { ViewDataQueryContext } from "./view-data-query-context";
import { localDate } from "./view-data-query-context";
import type { ViewEvent, ViewDataItem } from "./view-data.types";
import { ViewDataNeedsConfiguration } from "./view-data.errors";
// 기능 : 날짜/시각 일정을 정상·기간 미설정·잘못된 기간으로 분리합니다.
export function dateEvents(context: ViewDataQueryContext) {
  const start = context.binding("START_DATE", ["Date", "Timestamp"])!;
  const end = context.binding("END_DATE", ["Date", "Timestamp"], false);
  if (end && start.attributeType !== end.attributeType)
    throw new ViewDataNeedsConfiguration(
      "DATE_TYPES_MUST_MATCH",
      "END_DATE",
      end.id,
    );
  const events: ViewEvent[] = [],
    unscheduled: ViewDataItem[] = [],
    invalid: ViewDataItem[] = [];
  for (const source of context.items) {
    const item = context.values.item(source);
    const startCell = item.cells.find((cell) => cell.bindingId === start.id),
      endCell = item.cells.find((cell) => cell.bindingId === end?.id);
    if (
      (startCell?.values.length ?? 0) > 1 ||
      (endCell?.values.length ?? 0) > 1
    )
      throw new ViewDataNeedsConfiguration(
        "ROLE_MULTIPLE_VALUES",
        "START_DATE",
      );
    const startValue = startCell?.values[0]?.value,
      endValue = endCell?.values[0]?.value;
    if (
      startCell?.state === "INVALID" ||
      endCell?.state === "INVALID" ||
      startCell?.state === "UNAVAILABLE" ||
      endCell?.state === "UNAVAILABLE"
    ) {
      invalid.push(item);
      continue;
    }
    if (
      typeof startValue !== "string" ||
      (typeof endValue !== "string" &&
        context.snapshot.configuration.view.type !== "CALENDAR")
    ) {
      unscheduled.push(item);
      continue;
    }
    if (typeof endValue === "string" && endValue < startValue) {
      invalid.push(item);
      continue;
    }
    const dateKind = start.attributeType === "Date" ? "DATE" : "TIMESTAMP";
    if (
      dateKind === "DATE" &&
      typeof endValue === "string" &&
      context.dateEndInclusive === null
    )
      throw new ViewDataNeedsConfiguration(
        "DATE_END_POLICY_REQUIRED",
        "END_DATE",
        end?.id ?? null,
      );
    const endInclusive =
      dateKind === "DATE" ? (context.dateEndInclusive ?? true) : false;
    const event: ViewEvent = {
      item,
      dateKind,
      start: startValue,
      end: typeof endValue === "string" ? endValue : null,
      endInclusive,
    };
    const startDay =
      dateKind === "DATE"
        ? startValue
        : localDate(new Date(startValue), context.range.timeZone);
    const endDay = event.end
      ? dateKind === "DATE"
        ? event.end
        : localDate(new Date(event.end), context.range.timeZone)
      : startDay;
    // 1. 날짜만 있으면 선택한 종료일 정책을 적용하고 시각 기간은 반열린 구간이다.
    let endsAfterStart = endDay >= context.range.startDate;
    if (event.end && dateKind === "DATE" && !endInclusive)
      endsAfterStart = event.end > context.range.startDate;
    if (
      event.end &&
      dateKind === "TIMESTAMP" &&
      endDay === context.range.startDate
    ) {
      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: context.range.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }).format(new Date(event.end));
      endsAfterStart = time !== "00:00:00" || event.end === event.start;
    }
    if (startDay < context.range.endDateExclusive && endsAfterStart)
      events.push(event);
  }
  context.eligibleCount = events.length;
  return { events, unscheduled, invalid };
}
