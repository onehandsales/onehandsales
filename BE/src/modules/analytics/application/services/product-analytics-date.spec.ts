import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import {
  addDaysToProductAnalyticsDate,
  formatProductAnalyticsDateOnlyDate,
  resolveProductAnalyticsEventDate,
  toProductAnalyticsDateOnlyDate,
} from "./product-analytics-date";

describe("product analytics date helpers", () => {
  it("resolves eventDate from UTC instant with the user's timezone", () => {
    const occurredAt = new Date("2026-07-29T15:30:00.000Z");

    expect(resolveProductAnalyticsEventDate(occurredAt, "Asia/Seoul")).toBe(
      "2026-07-30"
    );
    expect(
      resolveProductAnalyticsEventDate(occurredAt, "America/Los_Angeles")
    ).toBe("2026-07-29");
  });

  it("adds retention day offsets without depending on server local timezone", () => {
    expect(addDaysToProductAnalyticsDate("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDaysToProductAnalyticsDate("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDaysToProductAnalyticsDate("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("converts date-only values to Prisma date storage values", () => {
    const date = toProductAnalyticsDateOnlyDate("2026-07-30");

    expect(date.toISOString()).toBe("2026-07-30T00:00:00.000Z");
    expect(formatProductAnalyticsDateOnlyDate(date)).toBe("2026-07-30");
  });

  it("rejects invalid date-only values", () => {
    expect(() => toProductAnalyticsDateOnlyDate("2026-02-31")).toThrow(
      ValidationDomainError
    );
    expect(() => addDaysToProductAnalyticsDate("20260730", 1)).toThrow(
      ValidationDomainError
    );
  });
});
