import type { ViewEvent } from "../types/view-data";
// 기능 : 날짜 전용 값은 보존하고 시각만 응답 시간대의 날짜로 변환합니다.
export function eventDay(
  value: string,
  kind: ViewEvent["dateKind"],
  timeZone: string,
): string {
  if (kind === "DATE") return value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  return ["year", "month", "day"]
    .map((key) => parts.find((part) => part.type === key)!.value)
    .join("-");
}
// 기능 : 날짜를 달력 간격 계산용 정수로만 변환합니다.
export function dayNumber(value: string): number {
  return Date.parse(value.slice(0, 10)) / 86400000;
}
// 기능 : 현지 자정의 종료 시각을 다음 날 일정으로 잘못 표시하지 않습니다.
export function eventCoversDay(
  event: ViewEvent,
  date: string,
  timeZone: string,
): boolean {
  const start = eventDay(event.start, event.dateKind, timeZone),
    end = event.end ? eventDay(event.end, event.dateKind, timeZone) : start;
  if (date < start) return false;
  if (!event.end || event.endInclusive || event.end === event.start)
    return date <= end;
  if (date < end) return true;
  if (date > end || event.dateKind === "DATE") return false;
  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).format(new Date(event.end)) !== "00:00:00"
  );
}
