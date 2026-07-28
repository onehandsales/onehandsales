export const APP_SUPPORTED_LOCALES = ["ko-KR", "en"] as const;
export const DEFAULT_APP_LOCALE = "ko-KR";
export const DEFAULT_APP_TIME_ZONE = "Asia/Seoul";
export const DEFAULT_APP_COUNTRY_CODE = "KR";
export const DEFAULT_APP_CURRENCY_CODE = "KRW";

export type AppLocale = (typeof APP_SUPPORTED_LOCALES)[number];

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
  readonly errors: {
    readonly unknown: string;
    readonly USER_LOCALE_UNSUPPORTED: string;
    readonly USER_TIMEZONE_INVALID: string;
    readonly USER_COUNTRY_UNSUPPORTED: string;
    readonly USER_DEFAULT_CURRENCY_UNSUPPORTED: string;
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
