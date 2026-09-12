import {
  DEFAULT_APP_CURRENCY_CODE,
  DEFAULT_APP_LOCALE,
  DEFAULT_APP_TIME_ZONE,
  type AppLocale,
  normalizeAppPhoneCountryCode,
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
  // 1. 이후 단계에서 사용할 객체 구조분해 값을 준비한다.
  const { fallback, locale, timeZone, ...intlOptions } = options;
  // 2. 이후 단계에서 사용할 date 값을 준비한다.
  const date = toValidDate(value);

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!date) {
    return fallback ?? DEFAULT_FALLBACK;
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
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
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return options.fallback ?? DEFAULT_FALLBACK;
  }

  // 2. 이후 단계에서 사용할 currencyCode 값을 준비한다.
  const currencyCode = options.currencyCode ?? DEFAULT_APP_CURRENCY_CODE;
  // 3. 이후 단계에서 사용할 intlLocale 값을 준비한다.
  const intlLocale = resolveIntlLocale(options.locale);

  // 4. 실패 가능성이 있는 작업을 실행하고 오류를 처리한다.
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
  // 1. 이후 단계에서 사용할 trimmed 값을 준비한다.
  const trimmed = value?.trim();
  // 2. 이후 단계에서 사용할 countryCode 값을 준비한다.
  const countryCode = normalizeAppPhoneCountryCode(options.countryCode);

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!trimmed) {
    return options.fallback ?? DEFAULT_FALLBACK;
  }

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (countryCode === "US" && /^\+?1\d{10}$/.test(trimmed)) {
    const digits = trimmed.replace(/^\+?1/, "");
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // 5. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (countryCode === "KR") {
    const digits = trimmed.replace(/\D/g, "");
    const nationalNumber = digits.startsWith("82")
      ? `0${digits.slice(2)}`
      : digits;

    if (/^010\d{8}$/.test(nationalNumber)) {
      return `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(
        3,
        7
      )}-${nationalNumber.slice(7)}`;
    }
  }

  // 6. 계산된 결과를 호출자에게 반환한다.
  return trimmed;
}
