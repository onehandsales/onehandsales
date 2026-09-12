type DateFormatOptions = {
  readonly fallback?: string;
  readonly includeYear?: boolean;
  readonly locale?: string;
  readonly timeZone?: string;
  readonly year?: "2-digit" | "numeric";
};
type DateValue = Date | string | null | undefined;
type CustomDateFormatOptions = Intl.DateTimeFormatOptions & {
  readonly fallback?: string;
  readonly locale?: string;
};

const DEFAULT_FALLBACK = "-";
const LOCALE = "ko-KR";

// 기능 : 앱 전역 formatter가 주입되지 않은 기존 호출의 날짜 표시를 처리합니다.
export function formatDateWithOptions(
  value: DateValue,
  { fallback, locale, ...intlOptions }: CustomDateFormatOptions
) {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!value) {
    return fallback ?? DEFAULT_FALLBACK;
  }

  // 2. 시간 계산에 필요한 기준 값을 준비한다.
  const date = new Date(value);

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : String(value);
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return new Intl.DateTimeFormat(locale ?? LOCALE, intlOptions).format(date);
}

// 기능 : 기존 날짜 표시 유틸에서 locale/timeZone 선택값을 받을 수 있게 합니다.
export function formatDate(
  value: DateValue,
  options: DateFormatOptions = {}
) {
  return formatDateWithOptions(value, {
    ...(options.year
      ? { year: options.year }
      : options.includeYear
        ? { year: "numeric" }
        : {}),
    fallback: options.fallback,
    locale: options.locale,
    month: "2-digit",
    day: "2-digit",
    timeZone: options.timeZone,
  });
}

// 기능 : 기존 날짜시간 표시 유틸에서 locale/timeZone 선택값을 받을 수 있게 합니다.
export function formatDateTime(
  value: DateValue,
  options: DateFormatOptions = {}
) {
  return formatDateWithOptions(value, {
    ...(options.year
      ? { year: options.year }
      : options.includeYear
        ? { year: "numeric" }
        : {}),
    fallback: options.fallback,
    locale: options.locale,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: options.timeZone,
  });
}

// 기능 : 기존 금액 표시 유틸에서 locale 선택값을 받을 수 있게 합니다.
export function formatMoney(
  amount: number,
  currency: string,
  options: { readonly locale?: string } = {}
) {
  const locale = options.locale ?? LOCALE;

  try {
    return new Intl.NumberFormat(locale, {
      currency,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}
