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

export type AppI18nResource = {
  readonly common: {
    readonly close: string;
    readonly retry: string;
    readonly save: string;
    readonly saving: string;
    readonly noRecord: string;
  };
  readonly settings: {
    readonly profileTitle: string;
    readonly profileDescription: string;
    readonly name: string;
    readonly noName: string;
    readonly displayLanguage: string;
    readonly timeZone: string;
    readonly defaultCountry: string;
    readonly defaultCurrency: string;
    readonly profileSaved: string;
    readonly nameTooLong: string;
  };
  readonly navigation: {
    readonly home: string;
    readonly companies: string;
    readonly contacts: string;
    readonly products: string;
    readonly deals: string;
    readonly schedules: string;
    readonly meetingNotes: string;
    readonly businessCards: string;
    readonly settings: string;
  };
  readonly importExport: {
    readonly excelDownload: string;
    readonly templateLanguage: string;
    readonly templateLanguageHelp: string;
    readonly koreanTemplate: string;
    readonly englishTemplate: string;
    readonly downloadTemplate: string;
    readonly validationInvalidImportField: string;
    readonly validationRequiredImportField: string;
    readonly validationNumberImportField: string;
    readonly validationEmailImportField: string;
    readonly validationPhoneImportField: string;
  };
  readonly errors: {
    readonly unknown: string;
    readonly USER_LOCALE_UNSUPPORTED: string;
    readonly USER_TIMEZONE_INVALID: string;
    readonly USER_COUNTRY_UNSUPPORTED: string;
    readonly USER_DEFAULT_CURRENCY_UNSUPPORTED: string;
    readonly CURRENCY_UNSUPPORTED: string;
    readonly AMOUNT_INTEGER_REQUIRED: string;
    readonly CONTACT_PHONE_COUNTRY_UNSUPPORTED: string;
    readonly CONTACT_PHONE_INVALID: string;
  };
};

type NamespaceKey<TNamespace extends keyof AppI18nResource> =
  `${TNamespace}.${Extract<keyof AppI18nResource[TNamespace], string>}`;

export type AppI18nKey = {
  [TNamespace in keyof AppI18nResource]: NamespaceKey<TNamespace>;
}[keyof AppI18nResource];

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
