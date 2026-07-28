import { createContext, useContext } from "react";
import type {
  AppCurrencyFormatOptions,
  AppDateFormatOptions,
  AppDateValue,
  AppPhoneFormatOptions,
} from "@/features/app-i18n/formatters";
import type { AppI18nKey, AppLocale } from "@/features/app-i18n/constants";

export type AppI18nTranslateOptions = {
  readonly values?: Record<string, string | number>;
};

export type AppI18nContextValue = {
  readonly locale: AppLocale;
  readonly timeZone: string;
  readonly countryCode: string;
  readonly defaultCurrencyCode: string;
  readonly t: (key: AppI18nKey, options?: AppI18nTranslateOptions) => string;
  readonly formatDate: (
    value: AppDateValue,
    options?: AppDateFormatOptions
  ) => string;
  readonly formatDateTime: (
    value: AppDateValue,
    options?: AppDateFormatOptions
  ) => string;
  readonly formatCurrency: (
    amount: number | null | undefined,
    options?: AppCurrencyFormatOptions
  ) => string;
  readonly formatPhoneDisplay: (
    value: string | null | undefined,
    options?: AppPhoneFormatOptions
  ) => string;
};

export const AppI18nContext = createContext<AppI18nContextValue | null>(null);

// 기능 : 앱 i18n context를 조회하고 provider 누락을 개발 중에 빠르게 드러냅니다.
export function useAppI18n() {
  const context = useContext(AppI18nContext);

  if (!context) {
    throw new Error("useAppI18n must be used within AppI18nProvider");
  }

  return context;
}
