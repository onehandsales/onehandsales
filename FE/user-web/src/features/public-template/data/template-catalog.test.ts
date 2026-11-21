import { describe, expect, it } from "vitest";
import { selectTemplates } from "./template-catalog";

describe("public template identity and filters", () => {
  it("keeps the incorrect observed label separate from the document type and combines independent filters", () => {
    const result = selectTemplates("Invoices", "General", "itemized", 500);
    expect(result.page).toBe(1);
    expect(result.items.map(item => item.id)).toEqual(["invoice-template--itemized-bill"]);
    expect(result.items[0]).toMatchObject({ type: "Invoices", observedLabel: "Task management", image: "" });
    expect(selectTemplates("Quotes", "General", "itemized", 1).noMatch).toBe(true);
    expect(selectTemplates("All", "", "", 1, true).empty).toBe(true);
    const all = selectTemplates("All", "", "", 1); const next = selectTemplates("All", "", "", 2);
    expect(all.items.some(item => next.items.some(other => other.id === item.id))).toBe(false);
  });
});
