import { describe, it, expect } from "vitest";
import { formattedViewNumber } from "./view-data-display";
import { eventCoversDay } from "./view-data-dates";
import type { ViewDataBinding, ViewEvent } from "../types/view-data";

const binding: ViewDataBinding = { id: "measure", attributeDefinitionId: "number", sourceScope: "RECORD", referenceAttributeIdPath: [], role: "DISPLAY", label: "Amount", attributeType: "Number", isMultiselect: false, isHidden: false, width: null, format: null, currencyCode: null };
// 기능 : 시각화 표시에서도 큰 Decimal과 현지 날짜 경계를 보존하는지 검사합니다.
describe("View display precision and date boundaries", () => {
  it("formats large decimals without Number coercion", () => {
    expect(formattedViewNumber("9007199254740993.55", binding)).toBe("9,007,199,254,740,993.55");
    expect(formattedViewNumber("-0.005", { ...binding, format: { fractionDigits: 2 } })).toBe("-0.01");
    expect(formattedViewNumber("0.75", { ...binding, format: { style: "PERCENT", valueScale: 1, fractionDigits: 0 } })).toBe("75%");
  });
  it("excludes a timestamp ending at local midnight, not UTC midnight", () => {
    const event = { dateKind: "TIMESTAMP", start: "2026-11-08T15:00:00Z", end: "2026-11-09T15:00:00Z", endInclusive: false } as ViewEvent;
    expect(eventCoversDay(event, "2026-11-09", "Asia/Seoul")).toBe(true);
    expect(eventCoversDay(event, "2026-11-10", "Asia/Seoul")).toBe(false);
    expect(eventCoversDay({ ...event, end: "2026-11-10T00:00:00Z" }, "2026-11-10", "Asia/Seoul")).toBe(true);
  });
  it("keeps all-day end inclusion independent of the viewer timezone", () => {
    const event = { dateKind: "DATE", start: "2026-11-09", end: "2026-11-11", endInclusive: true } as ViewEvent;
    expect(eventCoversDay(event, "2026-11-11", "America/Los_Angeles")).toBe(true);
    expect(eventCoversDay({ ...event, endInclusive: false }, "2026-11-11", "Asia/Seoul")).toBe(false);
  });
});
