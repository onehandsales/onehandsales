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
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (typeof document === "undefined") {
    return;
  }

  // 2. 이후 단계에서 사용할 root 값을 준비한다.
  const root = document.querySelector(LEGACY_APP_I18N_ROOT_SELECTOR);

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!root) {
    return;
  }

  // 기능 : translate Text Node 기능을 수행합니다.
  // 4. 이후 단계에서 사용할 translateTextNode 값을 준비한다.
  const translateTextNode = (node: Text) => {
    // 1. 이후 단계에서 사용할 parent 값을 준비한다.
    const parent = node.parentElement;

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (parent?.closest(LEGACY_APP_I18N_SKIP_SELECTOR)) {
      return;
    }

    // 3. 이후 단계에서 사용할 current 값을 준비한다.
    const current = node.nodeValue ?? "";
    // 4. 이후 단계에서 사용할 previous 값을 준비한다.
    const previous = legacyTextNodeRecords.get(node);
    // 5. 이후 단계에서 사용할 original 값을 준비한다.
    const original =
      previous && previous.translated === current ? previous.original : current;
    // 6. 이후 단계에서 사용할 translated 값을 준비한다.
    const translated = translateLegacyAppStaticText(original, locale);

    // 7. 현재 단계에서 필요한 동작을 실행한다.
    legacyTextNodeRecords.set(node, { original, translated });

    // 8. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (current !== translated) {
      node.nodeValue = translated;
    }
  };

  // 기능 : translate Element Attributes 기능을 수행합니다.
  // 5. 이후 단계에서 사용할 translateElementAttributes 값을 준비한다.
  const translateElementAttributes = (element: Element) => {
    let records = legacyAttributeRecords.get(element);

    if (!records) {
      records = new Map<string, LegacyTextRecord>();
      legacyAttributeRecords.set(element, records);
    }

    LEGACY_APP_I18N_ATTRIBUTE_NAMES.forEach((attributeName) => {
      // 1. 이후 단계에서 사용할 current 값을 준비한다.
      const current = element.getAttribute(attributeName);

      // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (!current) {
        records?.delete(attributeName);
        return;
      }

      // 3. 이후 단계에서 사용할 previous 값을 준비한다.
      const previous = records?.get(attributeName);
      // 4. 이후 단계에서 사용할 original 값을 준비한다.
      const original =
        previous && previous.translated === current ? previous.original : current;
      // 5. 이후 단계에서 사용할 translated 값을 준비한다.
      const translated = translateLegacyAppStaticText(original, locale);

      // 6. 현재 단계에서 필요한 동작을 실행한다.
      records?.set(attributeName, { original, translated });

      // 7. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (current !== translated) {
        element.setAttribute(attributeName, translated);
      }
    });
  };

  // 6. 이후 단계에서 사용할 walk 값을 준비한다.
  const walk = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
  );

  // 7. 현재 단계에서 필요한 동작을 실행한다.
  translateElementAttributes(root);

  // 8. 현재 처리 흐름의 다음 단계를 수행한다.
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
  // 1. 처리 흐름에 필요한 { user } 값을 준비한다.
  const { user } = useAuthSession();
  // 2. 처리 흐름에 필요한 browserLocale 값을 준비한다.
  const browserLocale = useMemo(() => getBrowserAppLocale(), []);
  // 3. 이후 단계에서 사용할 locale 값을 준비한다.
  const locale = normalizeAppLocale(user?.preferredLocale ?? browserLocale);
  // 4. 이후 단계에서 사용할 timeZone 값을 준비한다.
  const timeZone = user?.timeZone || DEFAULT_APP_TIME_ZONE;
  // 5. 이후 단계에서 사용할 countryCode 값을 준비한다.
  const countryCode = normalizeAppPhoneCountryCode(
    user?.countryCode ?? DEFAULT_APP_COUNTRY_CODE
  );
  // 6. 이후 단계에서 사용할 defaultCurrencyCode 값을 준비한다.
  const defaultCurrencyCode = normalizeAppCurrencyCode(user?.defaultCurrencyCode);

  // 7. 처리 흐름에 필요한 t 값을 준비한다.
  const t = useCallback<AppI18nContextValue["t"]>(
    (key, options) => {
      const activeText = getResourceText(appI18nResources[locale], key);
      const fallbackText = getResourceText(appI18nResources["ko-KR"], key);

      return interpolateTemplate(activeText ?? fallbackText ?? key, options);
    },
    [locale]
  );

  // 8. 처리 흐름에 필요한 value 값을 준비한다.
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

  // 9. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (typeof document === "undefined") {
      return;
    }

    // 2. 현재 단계에서 필요한 동작을 실행한다.
    applyLegacyStaticTextTranslation(locale);

    // 3. 이후 단계에서 사용할 observer 값을 준비한다.
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

    // 4. 현재 단계에서 필요한 동작을 실행한다.
    observer.observe(document.body, {
      attributeFilter: [...LEGACY_APP_I18N_ATTRIBUTE_NAMES],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    // 5. 계산된 결과를 호출자에게 반환한다.
    return () => observer.disconnect();
  }, [locale]);

  // 10. 계산된 결과를 호출자에게 반환한다.
  return <AppI18nContext.Provider value={value}>{children}</AppI18nContext.Provider>;
}
