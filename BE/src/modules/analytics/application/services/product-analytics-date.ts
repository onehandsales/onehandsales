import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const PRODUCT_ANALYTICS_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 역할 : ProductAnalyticsCalendarDate 제품 분석 date-only 계산에 쓰는 calendar 구성요소를 정의합니다.
interface ProductAnalyticsCalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

// 기능 : UTC instant를 사용자 timezone 기준 eventDate로 변환합니다.
export function resolveProductAnalyticsEventDate(
  occurredAt: Date,
  timeZone: string
): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    calendar: "iso8601",
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
  const values = new Map(
    formatter
      .formatToParts(occurredAt)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");

  if (!year || !month || !day) {
    throw new ValidationDomainError("eventDate formatter returned invalid date");
  }

  return [year, month, day].join("-");
}

// 기능 : 사용자 timezone 기준 date-only 값에 retention day offset을 더합니다.
export function addDaysToProductAnalyticsDate(
  eventDate: string,
  dayOffset: number
): string {
  const date = parseProductAnalyticsDateOnly(eventDate, "eventDate");
  const shifted = new Date(
    Date.UTC(date.year, date.month - 1, date.day + dayOffset)
  );

  return formatProductAnalyticsDateOnlyDate(shifted);
}

// 기능 : YYYY-MM-DD date-only 값을 Prisma @db.Date 저장용 UTC Date로 변환합니다.
export function toProductAnalyticsDateOnlyDate(eventDate: string): Date {
  const date = parseProductAnalyticsDateOnly(eventDate, "eventDate");

  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

// 기능 : Prisma @db.Date 값을 YYYY-MM-DD date-only 문자열로 변환합니다.
export function formatProductAnalyticsDateOnlyDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

// 기능 : YYYY-MM-DD 문자열을 실제 calendar date 구성요소로 검증하고 분해합니다.
function parseProductAnalyticsDateOnly(
  value: string,
  fieldName: string
): ProductAnalyticsCalendarDate {
  if (!PRODUCT_ANALYTICS_DATE_ONLY_PATTERN.test(value)) {
    throw new ValidationDomainError(`${fieldName} must be YYYY-MM-DD`);
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ValidationDomainError(`${fieldName} must be a valid date`);
  }

  return { year, month, day };
}
