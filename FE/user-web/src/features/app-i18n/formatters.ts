import {
  DEFAULT_APP_CURRENCY_CODE,
  DEFAULT_APP_LOCALE,
  DEFAULT_APP_TIME_ZONE,
  type AppLocale,
  normalizeAppLocale,
  toIntlLocale,
} from "@/features/app-i18n/constants";

export type AppDateValue = Date | string | null | undefined;

export type AppDateFormatOptions = {
  readonly fallback?: string;
  readonly includeYear?: boolean;
  readonly locale?: AppLocale | string;
  readonly timeZone?: string;
  readonly year?: "2-digit" | "numeric";
};

export type AppCurrencyFormatOptions = {
  readonly currencyCode?: string;
  readonly fallback?: string;
  readonly locale?: AppLocale | string;
};

export type AppPhoneFormatOptions = {
  readonly countryCode?: string;
  readonly fallback?: string;
  readonly locale?: AppLocale | string;
};

const DEFAULT_FALLBACK = "-";

// 기능 : 날짜 표시 옵션의 locale을 Intl API용 locale로 변환합니다.
function resolveIntlLocale(locale: AppLocale | string | undefined) {
  return toIntlLocale(locale ? normalizeAppLocale(locale) : DEFAULT_APP_LOCALE);
}

// 기능 : 날짜 입력값을 안전한 Date 객체로 변환합니다.
function toValidDate(value: AppDateValue) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// 기능 : 앱 locale/timezone 기준으로 날짜를 표시합니다.
export function formatAppDate(
  value: AppDateValue,
  options: AppDateFormatOptions = {}
) {
  return formatAppDateWithOptions(value, {
    ...(options.year
      ? { year: options.year }
      : options.includeYear
        ? { year: "numeric" as const }
        : {}),
    fallback: options.fallback,
    locale: options.locale,
    month: "2-digit",
    day: "2-digit",
    timeZone: options.timeZone,
  });
}

// 기능 : 앱 locale/timezone 기준으로 날짜와 시간을 표시합니다.
export function formatAppDateTime(
  value: AppDateValue,
  options: AppDateFormatOptions = {}
) {
  return formatAppDateWithOptions(value, {
    ...(options.year
      ? { year: options.year }
      : options.includeYear
        ? { year: "numeric" as const }
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

// 기능 : Intl DateTimeFormat 옵션으로 앱 날짜/시간 표시 문자열을 만듭니다.
export function formatAppDateWithOptions(
  value: AppDateValue,
  options: Intl.DateTimeFormatOptions &
    Pick<AppDateFormatOptions, "fallback" | "locale" | "timeZone">
) {
  const { fallback, locale, timeZone, ...intlOptions } = options;
  const date = toValidDate(value);

  if (!date) {
    return fallback ?? DEFAULT_FALLBACK;
  }

  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    timeZone: timeZone ?? DEFAULT_APP_TIME_ZONE,
    ...intlOptions,
  }).format(date);
}

// 기능 : 앱 locale과 통화 기준으로 금액을 표시합니다.
export function formatAppCurrency(
  amount: number | null | undefined,
  options: AppCurrencyFormatOptions = {}
) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return options.fallback ?? DEFAULT_FALLBACK;
  }

  const currencyCode = options.currencyCode ?? DEFAULT_APP_CURRENCY_CODE;
  const intlLocale = resolveIntlLocale(options.locale);

  try {
    return new Intl.NumberFormat(intlLocale, {
      currency: currencyCode,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(intlLocale)} ${currencyCode}`;
  }
}

// 기능 : 전화번호 문자열을 앱 locale과 국가 기준으로 표시합니다.
export function formatPhoneDisplay(
  value: string | null | undefined,
  options: AppPhoneFormatOptions = {}
) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return options.fallback ?? DEFAULT_FALLBACK;
  }

  if (options.countryCode === "US" && /^\+?1\d{10}$/.test(trimmed)) {
    const digits = trimmed.replace(/^\+?1/, "");
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (options.countryCode === "KR" && /^\+?82\d{9,10}$/.test(trimmed)) {
    return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  }

  return trimmed;
}
