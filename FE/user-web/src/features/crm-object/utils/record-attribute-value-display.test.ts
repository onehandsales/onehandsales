import { describe, expect, it } from "vitest";
import type { AppCurrencyFormatOptions } from "@/features/app-i18n/formatters";
import type {
  AttributeDefinitionConfig,
  WorkspaceObjectRecordAttributeValueListItem,
} from "@/features/crm-object";
import {
  getRecordAttributeValueDisplayText,
  type RecordAttributeValueBooleanLabels,
  type RecordAttributeValueFormatters,
} from "./record-attribute-value-display";

// 역할 : booleanLabels가 cell 표시 테스트에서 사용할 checkbox 표시 문구를 정의합니다.
const booleanLabels: RecordAttributeValueBooleanLabels = {
  falseLabel: "아니요",
  trueLabel: "예",
};

// 기능 : Currency 표시 테스트에서 통화 코드와 소수 자리 옵션을 드러내는 문자열을 만듭니다.
function formatTestCurrency(
  amount: number | null | undefined,
  options?: AppCurrencyFormatOptions,
) {
  const formattedAmount =
    amount?.toLocaleString("en-US", {
      maximumFractionDigits: options?.maximumFractionDigits ?? 0,
      minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    }) ?? "";

  return `${options?.currencyCode ?? "KRW"}:${formattedAmount}`;
}

// 기능 : 날짜/시간 표시 테스트에서 입력 문자열을 그대로 반환합니다.
function formatTestDateTime(value: string) {
  return value;
}

// 역할 : formatters가 cell 표시 테스트에서 사용할 앱 포맷터 대역을 정의합니다.
const formatters: RecordAttributeValueFormatters = {
  formatCurrency: formatTestCurrency,
  formatDate: formatTestDateTime,
  formatDateTime: formatTestDateTime,
};

// 기능 : Currency AttributeDefinition config 테스트 값을 생성합니다.
function makeCurrencyConfig(
  defaultCurrencyCode: string,
): AttributeDefinitionConfig {
  return {
    currency: {
      defaultCurrencyCode,
      displayType: "symbol",
    },
  };
}

// 기능 : Currency cell 표시 테스트용 RecordAttributeValue 값을 생성합니다.
function makeCurrencyValue(
  overrides: Partial<WorkspaceObjectRecordAttributeValueListItem> = {},
): WorkspaceObjectRecordAttributeValueListItem {
  return {
    id: "value-1",
    attributeDefinitionId: "attribute-1",
    attributeType: "Currency",
    booleanValue: null,
    dateValue: null,
    jsonValue: null,
    numberValue: null,
    selectOptionId: null,
    statusOptionId: null,
    targetActorId: null,
    targetObjectDefinitionId: null,
    targetRecordDefinitionId: null,
    textValue: null,
    timestampValue: null,
    ...overrides,
  };
}

// 기능 : RecordAttributeValue 화면 표시 문자열 계산을 검증합니다.
describe("getRecordAttributeValueDisplayText", () => {
  it("formats currency values with the attribute definition currency config", () => {
    const result = getRecordAttributeValueDisplayText(
      makeCurrencyValue({ numberValue: "10000" }),
      booleanLabels,
      formatters,
      makeCurrencyConfig("USD"),
    );

    expect(result).toBe("USD:10,000");
  });

  it("falls back to the app default currency when currency config is missing", () => {
    const result = getRecordAttributeValueDisplayText(
      makeCurrencyValue({ numberValue: "10000" }),
      booleanLabels,
      formatters,
      null,
    );

    expect(result).toBe("KRW:10,000");
  });

  it("keeps decimal precision from the stored currency amount", () => {
    const result = getRecordAttributeValueDisplayText(
      makeCurrencyValue({ numberValue: "10000.50" }),
      booleanLabels,
      formatters,
      makeCurrencyConfig("USD"),
    );

    expect(result).toBe("USD:10,000.50");
  });

  it("keeps an empty currency value visually empty", () => {
    const result = getRecordAttributeValueDisplayText(
      makeCurrencyValue(),
      booleanLabels,
      formatters,
      makeCurrencyConfig("USD"),
    );

    expect(result).toBe("");
  });
});
