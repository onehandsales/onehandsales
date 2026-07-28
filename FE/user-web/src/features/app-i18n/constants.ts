export const APP_SUPPORTED_LOCALES = ["ko-KR", "en"] as const;
export const DEFAULT_APP_LOCALE = "ko-KR";
export const DEFAULT_APP_TIME_ZONE = "Asia/Seoul";
export const DEFAULT_APP_COUNTRY_CODE = "KR";
export const DEFAULT_APP_CURRENCY_CODE = "KRW";
export const APP_SUPPORTED_CURRENCY_CODES = ["KRW", "USD"] as const;
export const APP_SUPPORTED_PHONE_COUNTRY_CODES = ["KR", "US"] as const;

export type AppLocale = (typeof APP_SUPPORTED_LOCALES)[number];
export type AppCurrencyCode = (typeof APP_SUPPORTED_CURRENCY_CODES)[number];
export type AppPhoneCountryCode =
  (typeof APP_SUPPORTED_PHONE_COUNTRY_CODES)[number];

export type AppI18nResource = Record<string, Readonly<Record<string, string>>>;

export type AppI18nKey = `${string}.${string}`;

// 기능 : 입력 locale이 앱에서 지원하는 locale인지 확인합니다.
export function isAppLocale(value: string): value is AppLocale {
  return APP_SUPPORTED_LOCALES.includes(value as AppLocale);
}

// 기능 : 입력 통화 코드가 앱에서 지원하는 통화인지 확인합니다.
export function isAppCurrencyCode(value: string): value is AppCurrencyCode {
  return APP_SUPPORTED_CURRENCY_CODES.includes(value as AppCurrencyCode);
}

// 기능 : 입력 국가 코드가 담당자 전화번호에서 지원하는 국가인지 확인합니다.
export function isAppPhoneCountryCode(
  value: string
): value is AppPhoneCountryCode {
  return APP_SUPPORTED_PHONE_COUNTRY_CODES.includes(value as AppPhoneCountryCode);
}

// 기능 : 서버/사용자 국가 코드를 담당자 전화번호 지원 국가로 정규화합니다.
export function normalizeAppPhoneCountryCode(
  value: string | null | undefined
): AppPhoneCountryCode {
  const normalized = value?.trim().toUpperCase();

  return normalized && isAppPhoneCountryCode(normalized)
    ? normalized
    : DEFAULT_APP_COUNTRY_CODE;
}

// 기능 : 사용자/서버 통화 코드를 앱 지원 통화로 정규화합니다.
export function normalizeAppCurrencyCode(
  value: string | null | undefined
): AppCurrencyCode {
  const normalized = value?.trim().toUpperCase();

  return normalized && isAppCurrencyCode(normalized)
    ? normalized
    : DEFAULT_APP_CURRENCY_CODE;
}

// 기능 : 사용자/브라우저 locale을 앱 지원 locale로 정규화합니다.
export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  const normalized = value?.trim().replace("_", "-").toLowerCase();

  if (!normalized) {
    return DEFAULT_APP_LOCALE;
  }

  if (normalized === "ko" || normalized === "ko-kr") {
    return "ko-KR";
  }

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  return DEFAULT_APP_LOCALE;
}

// 기능 : 브라우저 locale을 앱 초기 fallback locale로 변환합니다.
export function getBrowserAppLocale(): AppLocale {
  if (typeof window === "undefined") {
    return DEFAULT_APP_LOCALE;
  }

  return normalizeAppLocale(window.navigator.language);
}

// 기능 : 앱 locale을 Intl API에서 사용할 수 있는 locale 문자열로 변환합니다.
export function toIntlLocale(locale: AppLocale): string {
  return locale === "en" ? "en-US" : locale;
}
