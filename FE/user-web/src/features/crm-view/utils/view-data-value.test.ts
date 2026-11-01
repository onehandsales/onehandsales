import { describe, expect, it } from "vitest";
import { formatViewDecimal, formatViewValue, toEditableRecordValue } from "./view-data-value";
import type { ViewDataBinding } from "../types/view-data";

const binding: ViewDataBinding = { id: "binding", attributeDefinitionId: "amount", attributeType: "Number", role: "DISPLAY", label: "Amount", sourceScope: "RECORD", referenceAttributeIdPath: [], isHidden: false, isMultiselect: true, width: 150, format: null, currencyCode: null };

describe("View values and existing editor adaptation", () => {
  it("preserves Decimal precision, sign, zero and explicit rounding", () => {
    expect(formatViewDecimal("9007199254740992.0000000002", binding, "en")).toBe("9,007,199,254,740,992.0000000002");
    expect(formatViewDecimal("-0.0000000001", binding, "en")).toBe("-0.0000000001");
    expect(formatViewDecimal("0", binding, "en")).toBe("0");
    expect(formatViewDecimal("12.345", { ...binding, format: { fractionDigits: 2 } }, "en")).toBe("12.35");
  });
  it("applies percent scaling and currency without floating point conversion", () => {
    expect(formatViewDecimal("0.6", { ...binding, format: { style: "PERCENT", valueScale: 100 } }, "en")).toBe("60%");
    expect(formatViewDecimal("60", { ...binding, format: { style: "PERCENT", valueScale: 1 } }, "en")).toBe("60%");
    expect(formatViewDecimal("9007199254740992.12", { ...binding, attributeType: "Currency", currencyCode: "USD" }, "en")).toBe("$9,007,199,254,740,992.12");
  });
  it("honors saved grouping while preserving large Decimal precision", () => {
    expect(formatViewDecimal("9007199254740992.0000000002", { ...binding, format: { useGrouping: true } }, "en")).toBe("9,007,199,254,740,992.0000000002");
    expect(formatViewDecimal("9007199254740992.0000000002", { ...binding, format: { useGrouping: false } }, "en")).toBe("9007199254740992.0000000002");
    expect(formatViewDecimal("1234.56", { ...binding, format: { useGrouping: false } }, "de-DE")).toBe("1234,56");
  });
  it("honors disabled grouping for currency and scaled percentages", () => {
    expect(formatViewDecimal("9007199254740992.12", { ...binding, attributeType: "Currency", currencyCode: "USD", format: { useGrouping: false } }, "en")).toBe("$9007199254740992.12");
    expect(formatViewDecimal("12.345", { ...binding, format: { style: "PERCENT", valueScale: 100, useGrouping: false } }, "en")).toBe("1234.5%");
  });
  it("preserves date-only values across timezones and uses the user's zone for instants", () => {
    const date = { ...binding, attributeType: "Date", format: { dateFormat: "YYYY-MM-DD" } };
    expect(formatViewValue("2026-11-01", date, "en", "America/Los_Angeles", "Yes", "No")).toBe("2026-11-01");
    const timestamp = { ...date, attributeType: "Timestamp" };
    expect(formatViewValue("2026-11-01T00:00:00Z", timestamp, "en", "America/Los_Angeles", "Yes", "No")).toBe("2026-10-31");
  });
  it("shows false and reference labels while keeping identifiers out of text", () => {
    expect(formatViewValue(false, binding, "en", "UTC", "Yes", "No")).toBe("No");
    expect(formatViewValue({ actorId: "private-id", label: "Owner" }, binding, "en", "UTC", "Yes", "No")).toBe("Owner");
    expect(formatViewValue({ actorId: "private-id", label: null }, binding, "en", "UTC", "Yes", "No")).toBe("");
  });
  it("retains each value row ID when reusing an existing Record editor", () => {
    const first = toEditableRecordValue(binding, { valueDefinitionId: "one", sourceEntity: { kind: "RECORD", id: "record" }, value: "0.1234567891" });
    const second = toEditableRecordValue(binding, { valueDefinitionId: "two", sourceEntity: { kind: "RECORD", id: "record" }, value: "0.9" });
    expect(first).toMatchObject({ id: "one", attributeDefinitionId: "amount", numberValue: "0.1234567891" });
    expect(second).toMatchObject({ id: "two", numberValue: "0.9" });
  });
});
