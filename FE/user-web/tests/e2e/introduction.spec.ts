import type { Page } from "@playwright/test";
import { test, expect, enterWorkspace } from "./fixtures";

// 기능 : 다음 직접 이동 전에 현재 화면의 로컬 홍보 이미지가 실제로 준비됐는지 확인한다.
async function waitForArtwork(page: Page) {
  await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 10000 }).toBe(true);
  await page.waitForLoadState("networkidle");
}

test("landing menus enter the three original introductions and all artwork stays local and static", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("button", { name: "Industries", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "Consulting", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("The business software for consultants");
  await waitForArtwork(page);
  await expect(page).toHaveTitle("Consulting Software · Bonsai UI preview");
  await page.getByRole("button", { name: "Product", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "CRM", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("CRM Software to keep clients & projects organized");
  await expect(page.getByRole("button", { name: "Add new client", exact: true })).toHaveCount(0);
  await page.locator(".intro-template-card").first().click();
  await expect(page).toHaveURL("/form-template/tax-intake-form");
  await expect(page.locator("main")).toContainText("G06");
  await page.goBack();
  await page.locator(".public-audiences").getByRole("link", { name: "Small businesses", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Small business management software");
  await waitForArtwork(page);
  for (const path of ["/crm", "/software/consulting", "/software/small-businesses"]) {
    await page.goto(path); await page.waitForLoadState("networkidle");
    await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.locator(".public-pending")).toHaveCount(0);
    await page.reload(); await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible();
    await waitForArtwork(page);
  }
});

test("introduction email drafts are scoped, repeated submits deduplicate, and cancellation returns to the source", async ({ page }) => {
  await page.goto("/crm");
  const email = page.getByRole("textbox", { name: "Email address" });
  await email.fill("crm@example.test");
  await page.getByRole("button", { name: "Industries", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "Consulting", exact: true }).click();
  await expect(email).toHaveValue("");
  await email.fill("잘못된이메일을입력한컨설팅사용자".repeat(8));
  await email.press("Enter");
  await expect(page.getByRole("alert")).toHaveText("Enter a valid email address.");
  await expect(email).toBeFocused();
  await email.fill("consulting@example.test");
  await email.dispatchEvent("compositionstart"); await email.press("Enter");
  await expect(page).toHaveURL("/software/consulting");
  await email.dispatchEvent("compositionend");
  await page.locator("form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page).toHaveURL("/signup");
  await expect(page.locator("main")).toContainText("consulting@example.test");
  await page.goBack(); await expect(page).toHaveURL("/software/consulting");
  await expect(email).toHaveValue("consulting@example.test");
  await page.goForward(); await page.getByRole("button", { name: "Cancel and clear draft" }).click();
  await expect(page).toHaveURL("/software/consulting"); await expect(email).toHaveValue("");
  await page.getByRole("button", { name: "Product", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "CRM", exact: true }).click();
  await expect(email).toHaveValue("crm@example.test");
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain("crm@example.test");
  await page.reload(); await expect(email).toHaveValue("");
});

test("FAQ keyboard controls reveal dated answers, close prior answers and hand off locally", async ({ page }) => {
  await page.goto("/crm");
  const first = page.getByRole("button", { name: "Does Bonsai offer lead generation automation?" });
  const second = page.getByRole("button", { name: "Can I qualify leads with Bonsai CRM?" });
  const third = page.getByRole("button", { name: "Who is Bonsai CRM Best For?" });
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await first.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Does Bonsai offer lead generation automation?" })).toContainText("Absolutely.");
  await second.focus(); await page.keyboard.press("Space");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("region", { name: "Can I qualify leads with Bonsai CRM?" })).toContainText("custom tagging");
  await third.click();
  await page.getByRole("region", { name: "Who is Bonsai CRM Best For?" }).getByRole("link", { name: "consultants", exact: true }).click();
  await expect(page).toHaveURL("/software/consulting");
  await expect(page.locator("h1")).toHaveText("The business software for consultants");
  await waitForArtwork(page);
  await page.goBack(); await expect(third).toHaveAttribute("aria-expanded", "false");
  await first.click(); await first.click(); await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("region", { name: "Does Bonsai offer lead generation automation?" }).getByRole("link", { name: "Bonsai Forms", exact: true }).click();
  await expect(page).toHaveURL("/forms"); await expect(page.locator("main")).toContainText("G03");
});

test("related articles retain stable destinations, real history and an explicit unknown page two", async ({ page }) => {
  await page.goto("/software/small-businesses"); await page.waitForLoadState("networkidle");
  await expect(page.locator(".intro-article-grid article")).toHaveCount(12);
  const article = page.getByRole("link", { name: /The 2024 Complete Guide for Agency Project Management/ });
  await article.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await article.click(); await expect(page).toHaveURL("/blog/agency-project-management");
  await expect(page.locator("main")).toContainText("G05");
  await page.goBack();
  await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(4);
  await page.getByRole("link", { name: "Next ›", exact: true }).click();
  await expect(page).toHaveURL(/contentPage=2#related-content$/);
  await expect(page.getByText("2페이지의 원본 콘텐츠는 아직 확인되지 않았습니다.")).toBeVisible();
  await expect(page.locator(".intro-article-grid")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "More Small businesses content" })).toBeFocused();
  await page.reload(); await expect(page.getByText("2페이지의 원본 콘텐츠는 아직 확인되지 않았습니다.")).toBeVisible();
  await page.getByRole("link", { name: "Previous ‹", exact: true }).click();
  await expect(page.locator(".intro-article-grid article")).toHaveCount(12);
  await page.goBack(); await expect(page.locator(".intro-pagination")).toContainText("2 / 2");
  await page.goForward(); await expect(page.locator(".intro-pagination")).toContainText("1 / 2");
});

test("narrow introductions and demo handoff preserve focus, Escape, scroll and visible content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/software/small-businesses");
  const demo = page.getByRole("button", { name: "Book a demo", exact: true });
  await demo.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("heading")).toBeFocused();
  await page.keyboard.press("Shift+Tab"); await expect(page.getByRole("button", { name: "Back to introduction" })).toBeFocused();
  await page.keyboard.press("Tab"); await expect(page.getByRole("button", { name: "Close dialog" })).toBeFocused();
  await page.keyboard.press("Escape"); await expect(demo).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await demo.click(); await page.getByRole("button", { name: "Back to introduction" }).click(); await expect(demo).toBeFocused();
  for (const path of ["/software/small-businesses", "/software/consulting", "/crm"]) {
    await page.goto(path); await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
    // 기능 : overflow 숨김에 가려진 제목·이메일·제출 버튼까지 화면 안에서 조작 가능한지 확인한다.
    const clipped = await page.locator(".intro-hero-copy h1, .intro-hero-copy > p, .intro-hero form, .intro-hero form input, .intro-hero form button").evaluateAll(elements => elements.filter(element => {
      const box = element.getBoundingClientRect(); return box.left < -1 || box.right > innerWidth + 1;
    }).map(element => element.tagName));
    expect(clipped).toEqual([]);
    if (path !== "/software/small-businesses") {
      await page.getByRole("textbox", { name: "Email address" }).fill("narrow@example.test");
      await page.locator(".intro-hero form").getByRole("button", { name: "Start free" }).click();
      await expect(page).toHaveURL("/signup");
      await page.getByRole("button", { name: "Cancel and clear draft" }).click();
      await expect(page).toHaveURL(path); await waitForArtwork(page);
    }
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page.keyboard.press("Escape"); await expect(page.getByRole("button", { name: "Toggle navigation" })).toBeFocused();
  }
  const question = page.getByRole("button", { name: "Who is Bonsai CRM Best For?" });
  await question.click(); await expect(page.getByRole("region", { name: "Who is Bonsai CRM Best For?" })).toBeVisible();
});

test("scroll never changes a session and the dashboard header requires an explicitly chosen mock session", async ({ page }) => {
  await page.goto("/software/small-businesses");
  await page.locator(".intro-articles").scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Go to dashboard", exact: true })).toHaveCount(0);
  await expect(page.locator(".public-auth-links").getByRole("link", { name: "Log in", exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await enterWorkspace(page);
  await page.getByRole("link", { name: "Public", exact: true }).click();
  await page.locator(".public-audiences").getByRole("link", { name: "Small businesses", exact: true }).click();
  await page.locator(".intro-articles").scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Go to dashboard", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Go to dashboard", exact: true }).click();
  await expect(page).toHaveURL("/app");
  await page.goBack(); await page.waitForLoadState("networkidle");
  await page.reload(); await page.waitForLoadState("networkidle");
  await expect(page.getByRole("link", { name: "Go to dashboard", exact: true })).toHaveCount(0);
});
