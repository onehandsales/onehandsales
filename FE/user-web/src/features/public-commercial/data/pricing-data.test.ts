import { describe, expect, it } from "vitest";
import { createPlanSelection, pricingPlans, readBillingCycle } from "./pricing-data";

describe("historical price selection boundary", () => {
  it("keeps monthly prices separate from annual equivalents and derived subtotals", () => {
    expect(pricingPlans.map(plan => createPlanSelection(plan, "monthly").displayedMonthlyAmount)).toEqual([25, 39, 79]);
    expect(pricingPlans.map(plan => createPlanSelection(plan, "yearly").displayedMonthlyAmount)).toEqual([21, 32, 66]);
    expect(pricingPlans.map(plan => createPlanSelection(plan, "monthly").derivedAnnualSubtotal)).toEqual([null, null, null]);
    expect(pricingPlans.map(plan => createPlanSelection(plan, "yearly").derivedAnnualSubtotal)).toEqual([252, 384, 792]);
    expect(pricingPlans.map(plan => createPlanSelection(plan, "yearly").amountMeaning)).toEqual(Array(3).fill("annual-monthly-equivalent"));
  });
  it("accepts only the known monthly URL value and otherwise keeps the observed initial yearly state", () => {
    expect(readBillingCycle("monthly")).toBe("monthly");
    for (const value of [null, "", "yearly", "annual", "MONTHLY", "__proto__"]) expect(readBillingCycle(value)).toBe("yearly");
  });
});
