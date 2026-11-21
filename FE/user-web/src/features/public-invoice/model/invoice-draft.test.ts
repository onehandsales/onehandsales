import { expect, it } from "vitest";
import { calculateInvoice, createInvoiceDraft, decimalUnits, formatInvoiceAmount, validateInvoice } from "./invoice-draft";

it("matches 10 + 15% = 11.50 and blank additions do not change the amount", () => {
  const seed = createInvoiceDraft();
  const draft = { ...seed, items: [{ id: "first", description: "Poster Design", quantity: "1", unitPrice: "10" }, ...seed.items] };
  const totals = calculateInvoice(draft);
  expect([totals.subtotal, totals.tax, totals.total].map(formatInvoiceAmount)).toEqual(["10.00", "1.50", "11.50"]);
  expect(totals.lines[1]?.cents).toBeNull(); expect(validateInvoice(draft)).toEqual([]);
  expect(calculateInvoice({ ...draft, items: seed.items }).total).toBe(0n);
});
it("uses documented decimal rounding and never loses cents at the allowed upper bound", () => {
  const seed = createInvoiceDraft();
  const totals = calculateInvoice({ ...seed, items: [{ id: "a", description: "Half cent", quantity: "0.5", unitPrice: "0.01" }, { id: "b", description: "Decimal", quantity: "3", unitPrice: "0.10" }] });
  expect(totals.subtotal).toBe(31n); expect(totals.tax).toBe(5n); expect(totals.total).toBe(36n);
  const large = calculateInvoice({ ...seed, items: [{ id: "max", description: "Boundary", quantity: "1000000", unitPrice: "1000000" }] });
  expect(formatInvoiceAmount(large.total)).toBe("1150000000000.00");
  expect(decimalUnits("1.005", 2)).toBeNull(); expect(decimalUnits("-1", 3)).toBeNull(); expect(decimalUnits("1e6", 2)).toBeNull(); expect(decimalUnits("1000001", 2)).toBeNull();
});
it("distinguishes partial rows, zero, blank rows and impossible calendar dates", () => {
  const seed = createInvoiceDraft();
  const partial = { ...seed, dueDate: "2024-02-30", items: [{ id: "x", description: "Draft", quantity: "", unitPrice: "-2" }] };
  expect(validateInvoice(partial).map(issue => issue.field)).toEqual(["dueDate", "x-quantity", "x-unitPrice"]);
  expect(validateInvoice({ ...seed, dueDate: "2024-02-29", items: [{ id: "x", description: "Free item", quantity: "0", unitPrice: "0" }] })).toEqual([]);
  expect(validateInvoice({ ...seed, items: [] }).map(issue => issue.field)).toEqual(["items"]);
});
