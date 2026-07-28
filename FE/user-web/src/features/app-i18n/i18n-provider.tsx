import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useAuthSession } from "@/features/auth";
import {
  DEFAULT_APP_COUNTRY_CODE,
  DEFAULT_APP_TIME_ZONE,
  type AppI18nKey,
  type AppI18nResource,
  getBrowserAppLocale,
  normalizeAppCurrencyCode,
  normalizeAppLocale,
  normalizeAppPhoneCountryCode,
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
import { translateLegacyAppStaticText } from "@/features/app-i18n/legacy-static-text";

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

type LegacyTextRecord = {
  readonly original: string;
  readonly translated: string;
};

const LEGACY_APP_I18N_ROOT_SELECTOR = "[data-app-i18n-root]";
const LEGACY_APP_I18N_ATTRIBUTE_NAMES = [
  "aria-label",
  "placeholder",
  "title",
] as const;
const LEGACY_APP_I18N_SKIP_SELECTOR = "script, style, code, pre, textarea";

// 기능 : 레거시 정적 문구 DOM node의 원문과 마지막 번역문을 보존합니다.
const legacyTextNodeRecords = new WeakMap<Text, LegacyTextRecord>();
const legacyAttributeRecords = new WeakMap<
  Element,
  Map<string, LegacyTextRecord>
>();

// 기능 : 직접 리소스화되지 않은 /app 정적 문구를 렌더링 후 보조 번역합니다.
function applyLegacyStaticTextTranslation(locale: AppI18nContextValue["locale"]) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.querySelector(LEGACY_APP_I18N_ROOT_SELECTOR);

  if (!root) {
    return;
  }

  const translateTextNode = (node: Text) => {
    const parent = node.parentElement;

    if (parent?.closest(LEGACY_APP_I18N_SKIP_SELECTOR)) {
      return;
    }

    const current = node.nodeValue ?? "";
    const previous = legacyTextNodeRecords.get(node);
    const original =
      previous && previous.translated === current ? previous.original : current;
    const translated = translateLegacyAppStaticText(original, locale);

    legacyTextNodeRecords.set(node, { original, translated });

    if (current !== translated) {
      node.nodeValue = translated;
    }
  };

  const translateElementAttributes = (element: Element) => {
    let records = legacyAttributeRecords.get(element);

    if (!records) {
      records = new Map<string, LegacyTextRecord>();
      legacyAttributeRecords.set(element, records);
    }

    LEGACY_APP_I18N_ATTRIBUTE_NAMES.forEach((attributeName) => {
      const current = element.getAttribute(attributeName);

      if (!current) {
        records?.delete(attributeName);
        return;
      }

      const previous = records?.get(attributeName);
      const original =
        previous && previous.translated === current ? previous.original : current;
      const translated = translateLegacyAppStaticText(original, locale);

      records?.set(attributeName, { original, translated });

      if (current !== translated) {
        element.setAttribute(attributeName, translated);
      }
    });
  };

  const walk = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
  );

  translateElementAttributes(root);

  while (walk.nextNode()) {
    const node = walk.currentNode;

    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node as Text);
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(node as Element);
    }
  }
}

// 기능 : 인증 사용자 설정을 기준으로 앱 전용 i18n 상태와 formatter를 제공합니다.
export function AppI18nProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useAuthSession();
  const browserLocale = useMemo(() => getBrowserAppLocale(), []);
  const locale = normalizeAppLocale(user?.preferredLocale ?? browserLocale);
  const timeZone = user?.timeZone || DEFAULT_APP_TIME_ZONE;
  const countryCode = normalizeAppPhoneCountryCode(
    user?.countryCode ?? DEFAULT_APP_COUNTRY_CODE
  );
  const defaultCurrencyCode = normalizeAppCurrencyCode(user?.defaultCurrencyCode);

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

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    applyLegacyStaticTextTranslation(locale);

    const observer = new MutationObserver((mutations) => {
      const hasAppMutation = mutations.some((mutation) => {
        const target =
          mutation.target.nodeType === Node.ELEMENT_NODE
            ? (mutation.target as Element)
            : mutation.target.parentElement;

        return Boolean(target?.closest(LEGACY_APP_I18N_ROOT_SELECTOR));
      });

      if (hasAppMutation) {
        applyLegacyStaticTextTranslation(locale);
      }
    });

    observer.observe(document.body, {
      attributeFilter: [...LEGACY_APP_I18N_ATTRIBUTE_NAMES],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [locale]);

  return <AppI18nContext.Provider value={value}>{children}</AppI18nContext.Provider>;
}
