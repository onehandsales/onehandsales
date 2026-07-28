import { useCallback, useMemo, type ReactNode } from "react";
import { useAuthSession } from "@/features/auth";
import {
  DEFAULT_APP_COUNTRY_CODE,
  DEFAULT_APP_CURRENCY_CODE,
  DEFAULT_APP_TIME_ZONE,
  type AppI18nKey,
  type AppI18nResource,
  getBrowserAppLocale,
  normalizeAppLocale,
} from "@/features/app-i18n/constants";
import { enResource } from "@/features/app-i18n/resources/en";
import { koKRResource } from "@/features/app-i18n/resources/ko-KR";
import {
  formatAppCurrency,
  formatAppDate,
  formatAppDateTime,
  formatPhoneDisplay,
} from "@/features/app-i18n/formatters";
import {
  AppI18nContext,
  type AppI18nContextValue,
  type AppI18nTranslateOptions,
} from "@/features/app-i18n/use-app-i18n";

const appI18nResources = {
  "ko-KR": koKRResource,
  en: enResource,
} satisfies Record<string, AppI18nResource>;

// 기능 : 번역 문자열의 간단한 치환값을 적용합니다.
function interpolateTemplate(template: string, options?: AppI18nTranslateOptions) {
  if (!options?.values) {
    return template;
  }

  return Object.entries(options.values).reduce((nextTemplate, [key, value]) => {
    return nextTemplate.replaceAll(`{${key}}`, String(value));
  }, template);
}

// 기능 : resource에서 dot key에 맞는 번역 문자열을 찾습니다.
function getResourceText(resource: AppI18nResource, key: AppI18nKey) {
  const [namespace, messageKey] = key.split(".") as [
    keyof AppI18nResource,
    string,
  ];
  const namespaceResource = resource[namespace] as Record<string, string>;

  return namespaceResource[messageKey] ?? null;
}

// 기능 : 인증 사용자 설정을 기준으로 앱 전용 i18n 상태와 formatter를 제공합니다.
export function AppI18nProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useAuthSession();
  const browserLocale = useMemo(() => getBrowserAppLocale(), []);
  const locale = normalizeAppLocale(user?.preferredLocale ?? browserLocale);
  const timeZone = user?.timeZone || DEFAULT_APP_TIME_ZONE;
  const countryCode = user?.countryCode || DEFAULT_APP_COUNTRY_CODE;
  const defaultCurrencyCode =
    user?.defaultCurrencyCode || DEFAULT_APP_CURRENCY_CODE;

  const t = useCallback<AppI18nContextValue["t"]>(
    (key, options) => {
      const activeText = getResourceText(appI18nResources[locale], key);
      const fallbackText = getResourceText(appI18nResources["ko-KR"], key);

      return interpolateTemplate(activeText ?? fallbackText ?? key, options);
    },
    [locale]
  );

  const value = useMemo<AppI18nContextValue>(
    () => ({
      locale,
      timeZone,
      countryCode,
      defaultCurrencyCode,
      t,
      formatDate: (valueToFormat, options) =>
        formatAppDate(valueToFormat, {
          ...options,
          locale: options?.locale ?? locale,
          timeZone: options?.timeZone ?? timeZone,
        }),
      formatDateTime: (valueToFormat, options) =>
        formatAppDateTime(valueToFormat, {
          ...options,
          locale: options?.locale ?? locale,
          timeZone: options?.timeZone ?? timeZone,
        }),
      formatCurrency: (amount, options) =>
        formatAppCurrency(amount, {
          ...options,
          currencyCode: options?.currencyCode ?? defaultCurrencyCode,
          locale: options?.locale ?? locale,
        }),
      formatPhoneDisplay: (valueToFormat, options) =>
        formatPhoneDisplay(valueToFormat, {
          ...options,
          countryCode: options?.countryCode ?? countryCode,
          locale: options?.locale ?? locale,
        }),
    }),
    [countryCode, defaultCurrencyCode, locale, t, timeZone]
  );

  return <AppI18nContext.Provider value={value}>{children}</AppI18nContext.Provider>;
}
