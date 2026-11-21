import { describe, expect, it } from "vitest";
import { allArticles, readCategory, selectArticles } from "./article-catalog";

describe("public article selection", () => {
  it("combines category with case-insensitive search and preserves stable identity", () => {
    const result = selectArticles("Start a business", " MARKETing ", 99);
    expect(result.items.map(item => item.id)).toEqual(["how-to-start-a-digital-marketing-agency"]);
    expect(result.items[0]).toBe(allArticles.find(item => item.id === "how-to-start-a-digital-marketing-agency"));
    expect(result.page).toBe(1);
    expect(selectArticles("Legal", "marketing", 1).total).toBe(0);
    expect(selectArticles("Legal", "marketing", 1).categoryEmpty).toBe(false);
    expect(selectArticles("Taxes", "", 1).categoryEmpty).toBe(true);
  });
  it("keeps IDs unique, clamps page bounds and rejects unknown categories", () => {
    expect(new Set(allArticles.map(item => item.id)).size).toBe(allArticles.length);
    expect(selectArticles("General", "", -5).page).toBe(1);
    expect(selectArticles("General", "", 99).page).toBe(4);
    expect(selectArticles("General", "", 1, true).categoryEmpty).toBe(true);
    expect(readCategory("__proto__")).toBe("");
  });
});
