import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
// 기능 : 검증 시나리오를 선택하고 실제 공개 메뉴를 통해 도움말로 이동한다.
async function enterHelpScenario(page: Page, scenario: string) {
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click(); await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption(scenario);
  await page.getByRole("link", { name: "Public", exact: true }).click(); await page.getByRole("button", { name: "Resources", exact: true }).click(); await page.locator("#public-mega-menu").getByRole("link", { name: "Help Center", exact: true }).click();
}

test("help collections, search, language and actual article history preserve their separate states", async ({ page }) => {
  await page.goto("/help?q=%20%20"); await expect(page.locator(".help-collection")).toHaveCount(14); await expect(page.getByRole("heading", { name: "FAQ: Answers and insights from the Bonsai Team" })).toBeVisible(); await expect(page.getByRole("combobox", { name: "Help language" })).toHaveValue("en");
  await page.getByRole("link", { name: /General Questions & Overview Get all/ }).click(); await expect(page.locator("main h1")).toHaveText("General Questions & Overview");
  const search = page.getByRole("searchbox", { name: "Search for articles" }); await search.fill("portal"); await search.press("Enter"); await expect(page).toHaveURL(/collections\/96965\?q=portal/);
  await expect(page.locator(".help-result-list a")).toHaveCount(1); await page.locator(".help-result-list a").click(); await expect(page.locator("main h1")).toHaveText("What is the Client Portal and how can I use it?");
  await page.goBack(); await expect(search).toHaveValue("portal"); await page.goForward(); await expect(page.locator("main h1")).toContainText("Client Portal");
  await page.getByRole("link", { name: "Back to previous help page" }).click(); await expect(search).toHaveValue("portal");
  await search.fill("없는 문서"); await search.press("Enter"); await expect(page.getByRole("status")).toHaveText("No articles match this search."); await page.reload(); await expect(search).toHaveValue("없는 문서");
  await page.goto("/help?lang=ko"); await expect(page.locator("main h1")).toHaveText("Language unavailable"); await page.getByRole("combobox", { name: "Help language" }).selectOption("en"); await expect(page.locator(".help-collection")).toHaveCount(14);
});

test("article TOC, unavailable video, static settings and feedback keep real focus and navigation", async ({ page }) => {
  await page.goto("/help"); await page.locator(".help-popular a").first().click();
  await page.locator(".help-topbar").getByRole("button", { name: "Feature Requests", exact: true }).click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.goBack(); await expect(page.getByRole("dialog")).toHaveCount(0); await page.locator(".help-popular a").first().click();
  await page.locator(".help-footer").getByRole("button", { name: "Email Support", exact: true }).click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.goBack(); await expect(page.getByRole("dialog")).toHaveCount(0); await page.locator(".help-popular a").first().click();
  const video = page.getByRole("button", { name: "View Client Portal video availability" }); await video.click(); await expect(page.getByRole("dialog")).toContainText("Playback has not started"); await page.keyboard.press("Escape"); await expect(video).toBeFocused();
  const branding = page.getByRole("link", { name: "How do I update my Client Portal branding?", exact: true }); await branding.focus(); await page.keyboard.press("Enter"); await expect(branding).toHaveAttribute("aria-current", "location"); await expect(page.locator(".help-branding-image")).toBeVisible();
  await page.getByRole("button", { name: "Branding settings", exact: true }).click(); await expect(page.getByRole("dialog")).toContainText("G16"); await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Helpful", exact: true }).click(); await expect(page.getByRole("status")).toContainText("local preview");
  await page.getByRole("link", { name: "Can I send files to my client?", exact: true }).click(); await expect(page.getByRole("heading", { name: "Article body not provided" })).toBeVisible(); await page.goBack(); await expect(page.getByRole("button", { name: "Helpful", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.reload(); await expect(page.getByRole("button", { name: "Helpful", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.goto("/help/articles/missing"); await expect(page.getByRole("heading", { name: "Article not found" })).toBeVisible();
});

test("help read failure, empty data and slow searches do not replace the latest URL intent", async ({ page }) => {
  await enterHelpScenario(page, "read-error"); await expect(page.getByRole("alert")).toContainText("could not be loaded"); await page.getByRole("button", { name: "Try again", exact: true }).click(); await expect(page.locator(".help-collection")).toHaveCount(14); await page.waitForLoadState("networkidle");
  await enterHelpScenario(page, "empty"); await expect(page.getByRole("heading", { name: "No help articles available" })).toBeVisible();
  await enterHelpScenario(page, "slow"); const search = page.getByRole("searchbox"); await search.fill("payment"); await search.press("Enter"); await search.fill("portal"); await search.press("Enter");
  await expect(page).toHaveURL(/help\?q=portal$/); await expect(search).toHaveValue("portal"); await expect(page.locator(".help-result-list a")).toHaveCount(1); await expect(page.locator(".help-result-list a")).toContainText("Client Portal"); await page.waitForTimeout(1600); await expect(page.locator(".help-result-list a")).toHaveCount(1);
  await page.goto("/help"); await expect(page.locator(".help-collection")).toHaveCount(14);
});

test("feedback retains failed choice, allows retry and cancels obsolete writes on selection or departure", async ({ page }) => {
  await enterHelpScenario(page, "write-error"); await page.locator(".help-popular a").first().click(); await page.getByRole("button", { name: "Helpful", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("could not be saved"); await expect(page.getByRole("button", { name: "Helpful", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Try again", exact: true }).click(); await expect(page.getByRole("status")).toContainText("saved in this local preview");
  await enterHelpScenario(page, "slow"); await page.locator(".help-popular a").first().click(); await page.getByRole("button", { name: "Not helpful", exact: true }).click(); await page.getByRole("button", { name: "Somewhat helpful", exact: true }).click(); await expect(page.getByRole("status")).toContainText("saved in this local preview"); await expect(page.getByRole("button", { name: "Somewhat helpful", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Helpful", exact: true }).click(); await page.getByRole("button", { name: "Cancel feedback" }).click(); await page.waitForTimeout(1600); await expect(page.getByRole("button", { name: "Somewhat helpful", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Helpful", exact: true }).click(); await page.getByRole("link", { name: "Can I send files to my client?", exact: true }).click(); await page.waitForTimeout(1600); await page.goBack(); await expect(page.getByRole("button", { name: "Somewhat helpful", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/help"); await expect(page.locator(".help-collection")).toHaveCount(14);
});

test("contact links, narrow help, keyboard and synthetic IME remain local and visible", async ({ page }) => {
  await page.goto("/support"); await expect(page.locator("h1")).toHaveText("How can we help?"); await expect(page.locator("main form")).toHaveCount(0);
  await page.getByRole("button", { name: "Email us", exact: true }).click(); await expect(page.getByRole("dialog")).toContainText("mailto:support@hellobonsai.com"); await page.keyboard.press("Escape"); await expect(page.getByRole("button", { name: "Email us", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Go to the app", exact: true }).click(); await expect(page.getByRole("dialog")).toContainText("will not be created"); await page.getByRole("link", { name: "Continue to preview app" }).click(); await expect(page).toHaveURL(/login\?returnTo=%2Fapp/); await page.goBack(); await expect(page.locator("h1")).toHaveText("How can we help?");
  await page.getByRole("link", { name: "How can I use my Client Portal?", exact: true }).click(); await expect(page.locator("main h1")).toContainText("Client Portal"); await page.goBack();
  await page.setViewportSize({ width: 320, height: 600 }); await page.getByRole("link", { name: "Visit our help center" }).click(); await expect(page.locator(".help-collection")).toHaveCount(14);
  const search = page.getByRole("searchbox"); await search.fill("긴 한국어 검색어 ".repeat(15)); await search.dispatchEvent("compositionstart"); await search.press("Enter"); await expect(page).toHaveURL("/help"); await search.dispatchEvent("compositionend"); await search.press("Enter"); await expect(page.getByRole("status")).toContainText("No articles match");
  const clipped = await page.locator(".help-web h1, .help-web input, .help-web button, .help-topbar nav, .help-web select").evaluateAll(elements => elements.filter(element => { const r = element.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); }).map(element => element.tagName)); expect(clipped).toEqual([]);
  await page.goto("/help/articles/4409019"); await expect(page.locator(".help-branding-image")).toBeVisible(); await page.getByRole("button", { name: "View Client Portal video availability" }).click(); await page.keyboard.press("Escape");
});
