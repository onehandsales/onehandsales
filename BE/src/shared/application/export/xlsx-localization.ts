import {
  DEFAULT_CURRENCY_CODE,
  normalizeCurrencyCode,
} from "@/shared/application/currency/currency-code";
import {
  DEFAULT_USER_TIME_ZONE,
  isValidIanaTimeZone,
} from "@/shared/application/time-zone/time-zone";

export const XLSX_SUPPORTED_LOCALES = ["ko-KR", "en"] as const;

export type XlsxSupportedLocale = (typeof XLSX_SUPPORTED_LOCALES)[number];

// 역할 : XlsxLocalizationContext export와 template 다운로드에서 쓰는 표시 기준을 정의합니다.
export interface XlsxLocalizationContext {
  readonly locale: XlsxSupportedLocale;
  readonly intlLocale: string;
  readonly timeZone: string;
  readonly defaultCurrencyCode: string;
}

// 역할 : ResolveXlsxLocalizationInput 사용자 설정과 query override를 함께 받는 입력입니다.
export interface ResolveXlsxLocalizationInput {
  readonly locale?: string | null | undefined;
  readonly preferredLocale?: string | null | undefined;
  readonly timeZone?: string | null | undefined;
  readonly userTimeZone?: string | null | undefined;
  readonly defaultCurrencyCode?: string | null | undefined;
}

type ZonedDateTimeParts = {
  readonly year: string;
  readonly month: string;
  readonly day: string;
  readonly hour: string;
  readonly minute: string;
  readonly second: string;
};

const XLSX_SUPPORTED_LOCALE_SET = new Set<string>(XLSX_SUPPORTED_LOCALES);

// 기능 : query 또는 사용자 locale을 ko-KR/en 지원 범위로 정규화합니다.
export function normalizeXlsxLocale(
  value: string | null | undefined,
  fallback?: string | null
): XlsxSupportedLocale {
  // 1. 이후 처리에 사용할 normalized을 계산한다.
  const normalized = normalizeLocaleText(value);

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (normalized && XLSX_SUPPORTED_LOCALE_SET.has(normalized)) {
    return normalized as XlsxSupportedLocale;
  }

  // 3. 이후 처리에 사용할 fallbackLocale을 계산한다.
  const fallbackLocale = normalizeLocaleText(fallback);

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (fallbackLocale && XLSX_SUPPORTED_LOCALE_SET.has(fallbackLocale)) {
    return fallbackLocale as XlsxSupportedLocale;
  }

  // 5. 계산된 결과를 호출자에게 반환한다.
  return "ko-KR";
}

// 기능 : 사용자 설정과 query override를 합쳐 xlsx 표시 기준을 계산합니다.
export function resolveXlsxLocalizationContext(
  input: ResolveXlsxLocalizationInput
): XlsxLocalizationContext {
  // 1. 이후 처리에 사용할 locale을 계산한다.
  const locale = normalizeXlsxLocale(input.locale, input.preferredLocale);
  // 2. 이후 처리에 사용할 requestedTimeZone을 계산한다.
  const requestedTimeZone = input.timeZone?.trim();
  // 3. 이후 처리에 사용할 userTimeZone을 계산한다.
  const userTimeZone = input.userTimeZone?.trim();
  // 4. 이후 처리에 사용할 timeZone을 계산한다.
  const timeZone =
    requestedTimeZone && isValidIanaTimeZone(requestedTimeZone)
      ? requestedTimeZone
      : userTimeZone && isValidIanaTimeZone(userTimeZone)
        ? userTimeZone
        : DEFAULT_USER_TIME_ZONE;
  // 5. 이후 처리에 사용할 defaultCurrencyCode을 계산한다.
  const defaultCurrencyCode = normalizeCurrencyCode(
    input.defaultCurrencyCode ?? DEFAULT_CURRENCY_CODE
  );

  // 6. 계산된 결과를 호출자에게 반환한다.
  return {
    locale,
    intlLocale: locale === "en" ? "en-US" : "ko-KR",
    timeZone,
    defaultCurrencyCode,
  };
}

// 기능 : UTC instant를 사용자 timezone 기준의 export 표시 문자열로 변환합니다.
export function formatXlsxDateTime(
  value: Date | null | undefined,
  context: XlsxLocalizationContext
): string | null {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!value || Number.isNaN(value.getTime())) {
    return null;
  }

  // 2. 이후 처리에 사용할 parts을 계산한다.
  const parts = getZonedDateTimeParts(value, context.timeZone);

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (context.locale === "en") {
    return `${parts.month}/${parts.day}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

// 기능 : row 통화 코드를 기준으로 export용 통화 문자열을 만듭니다.
export function formatXlsxCurrency(
  amount: number | null | undefined,
  currencyCode: string | null | undefined,
  context: XlsxLocalizationContext
): string | null {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return null;
  }

  const normalizedCurrencyCode = normalizeCurrencyCode(
    currencyCode ?? context.defaultCurrencyCode
  );

  try {
    return new Intl.NumberFormat(context.intlLocale, {
      currency: normalizedCurrencyCode,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(context.intlLocale)} ${normalizedCurrencyCode}`;
  }
}

// 기능 : locale별 dictionary에서 현재 locale 문자열을 고르고 없으면 한국어로 대체합니다.
export function getXlsxLocalizedText(
  dictionary: Readonly<Record<XlsxSupportedLocale, string>> | undefined,
  locale: XlsxSupportedLocale,
  fallback = ""
): string {
  return dictionary?.[locale] ?? dictionary?.["ko-KR"] ?? fallback;
}

// 기능 : 다양한 locale 입력 표기를 앱 지원 locale 표기로 맞춥니다.
function normalizeLocaleText(value: string | null | undefined): string | null {
  // 1. 이후 처리에 사용할 normalized을 계산한다.
  const normalized = value?.trim().replace("_", "-").toLowerCase();

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!normalized) {
    return null;
  }

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (normalized === "ko" || normalized === "ko-kr") {
    return "ko-KR";
  }

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  // 5. 계산된 결과를 호출자에게 반환한다.
  return normalized;
}

// 기능 : Intl formatToParts 결과에서 날짜/시간 숫자 part를 안정적으로 추출합니다.
function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateTimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: partMap.get("year") ?? "0000",
    month: partMap.get("month") ?? "00",
    day: partMap.get("day") ?? "00",
    hour: normalizeHourPart(partMap.get("hour") ?? "00"),
    minute: partMap.get("minute") ?? "00",
    second: partMap.get("second") ?? "00",
  };
}

// 기능 : 일부 런타임에서 자정이 24시로 표시되는 값을 00시로 맞춥니다.
function normalizeHourPart(hour: string): string {
  return hour === "24" ? "00" : hour;
}
