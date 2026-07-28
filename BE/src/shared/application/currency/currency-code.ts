import { FieldValidationDomainError } from "@/shared/domain/errors/common.errors";

export const SUPPORTED_CURRENCY_CODES = ["KRW", "USD"] as const;
export const DEFAULT_CURRENCY_CODE = "KRW";

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCY_CODES)[number];

const SUPPORTED_CURRENCY_CODE_SET = new Set<string>(SUPPORTED_CURRENCY_CODES);

// 기능 : 입력 통화 코드가 Product/Deal에서 지원하는 통화인지 확인합니다.
export function isSupportedCurrencyCode(
  value: string
): value is SupportedCurrencyCode {
  return SUPPORTED_CURRENCY_CODE_SET.has(value);
}

// 기능 : 외부 입력 통화 코드를 대문자로 정규화하고 지원 여부를 검증합니다.
export function normalizeCurrencyCode(
  value: string | null | undefined,
  field = "currencyCode"
): SupportedCurrencyCode {
  const normalized = value?.trim().toUpperCase() ?? "";

  if (!isSupportedCurrencyCode(normalized)) {
    throw new FieldValidationDomainError(
      "CURRENCY_UNSUPPORTED",
      field,
      "currencyCode must be KRW or USD"
    );
  }

  return normalized;
}

// 기능 : 명시 통화, 사용자 기본 통화, 서비스 기본 통화 순서로 저장 통화를 결정합니다.
export function resolveCurrencyCodeWithDefault(
  explicitCurrencyCode: string | null | undefined,
  defaultCurrencyCode: string | null | undefined
): SupportedCurrencyCode {
  return normalizeCurrencyCode(
    explicitCurrencyCode ?? defaultCurrencyCode ?? DEFAULT_CURRENCY_CODE
  );
}
