import type { Page } from "@playwright/test";
import { test, expect, enterWorkspace } from "./fixtures";

// 기능 : URL 변경뿐 아니라 목적지의 이미지·폰트가 준비된 상태를 확인한다.
async function ready(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
}

test("pricing toggle uses historical prices, actual history and direct URL refresh", async ({ page }) => {
  await page.goto("/"); await ready(page);
  await page.locator("header").getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Pick the best plan for your business");
  await expect(page).toHaveTitle("Pricing · Bonsai UI preview");
  await expect(page.getByRole("radio", { name: /Yearly/ })).toBeChecked();
  await expect(page.locator(".pricing-amount strong")).toHaveText(["21", "32", "66"]);
  await page.getByRole("radio", { name: "Monthly", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Monthly", exact: true })).toBeChecked();
  await expect(page.locator(".pricing-amount strong")).toHaveText(["25", "39", "79"]);
  await expect(page.locator(".pricing-recommendation")).toHaveText("Most popular");
  await expect(page.getByText("Billed annually.", { exact: false })).toHaveCount(0);
  await page.reload(); await expect(page.getByRole("radio", { name: "Monthly", exact: true })).toBeChecked();
  await page.goBack(); await expect(page.getByRole("radio", { name: /Yearly/ })).toBeChecked();
  await page.goForward(); await expect(page.locator(".pricing-amount strong")).toHaveText(["25", "39", "79"]);
  await page.goto("/pricing?billing=unknown"); await expect(page.getByRole("radio", { name: /Yearly/ })).toBeChecked();
  await page.getByRole("radio", { name: /Yearly/ }).focus(); await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "Monthly", exact: true })).toBeChecked();
  await page.getByRole("link", { name: "Learn more", exact: true }).click();
  await expect(page).toHaveURL("/taxes"); await expect(page.locator("main")).toContainText("G03");
  await page.goBack(); await expect(page.getByRole("radio", { name: "Monthly", exact: true })).toBeChecked();
});

test("different plan handoffs keep older history snapshots and cancellation preserves the cycle", async ({ page }) => {
  await page.goto("/pricing");
  await page.getByRole("article", { name: "Starter", exact: true }).getByRole("link", { name: "Start for free" }).first().click();
  await expect(page.locator("main")).toContainText("pricing-yearly-starter");
  await expect(page.locator("main")).toContainText("$252 USD");
  await page.getByRole("link", { name: "Back to landing", exact: true }).click();
  await page.locator("header").getByRole("link", { name: "Pricing", exact: true }).click();
  await page.getByRole("radio", { name: "Monthly", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Monthly", exact: true })).toBeChecked();
  await page.getByRole("article", { name: "Business", exact: true }).getByRole("link", { name: "Start for free" }).last().click();
  await expect(page.locator("main")).toContainText("pricing-monthly-business");
  await expect(page.locator("main")).toContainText("$79 USD");
  await expect(page.locator("main")).not.toContainText("Calculated annual subtotal");
  await page.goBack(); await page.goBack(); await page.goBack(); await page.goBack();
  await expect(page.locator("main")).toContainText("pricing-yearly-starter");
  await expect(page.locator("main")).not.toContainText("pricing-monthly-business");
  await page.goForward(); await page.goForward(); await page.goForward(); await page.goForward();
  await expect(page.locator("main")).toContainText("pricing-monthly-business");
  await page.getByRole("button", { name: "Cancel and clear draft" }).click();
  await expect(page).toHaveURL("/pricing?billing=monthly");
  await expect(page.getByRole("radio", { name: "Monthly", exact: true })).toBeChecked();
  await page.getByRole("article", { name: "Professional", exact: true }).getByRole("link", { name: "Start for free" }).first().click();
  await expect(page.locator("main")).toContainText("$39 USD");
  await page.reload(); await expect(page.locator("main")).toContainText("직접 URL·새 탭·새로고침에서는 인계가 초기화됩니다.");
  await expect(page.locator("main")).not.toContainText("$39 USD");
});

test("rapid cycle changes and repeated plan clicks create only the first handoff", async ({ page, context }) => {
  await page.goto("/pricing");
  await page.locator(".pricing-cycle").evaluate(fieldset => {
    fieldset.querySelector<HTMLInputElement>('input[value="monthly"]')?.click();
    fieldset.querySelector<HTMLInputElement>('input[value="yearly"]')?.click();
  });
  await expect(page.getByRole("radio", { name: /Yearly/ })).toBeChecked();
  for (const name of ["Monthly", "Yearly", "Monthly"]) {
    const radio = page.getByRole("radio", { name: new RegExp(`^${name}`) }); await radio.click(); await expect(radio).toBeChecked();
  }
  await page.locator(".pricing-plans").evaluate(plans => {
    document.querySelector<HTMLInputElement>('.pricing-cycle input[value="yearly"]')?.click();
    document.querySelector<HTMLInputElement>('.pricing-cycle input[value="monthly"]')?.click();
    const link = plans.querySelector<HTMLAnchorElement>('.is-recommended a');
    link?.click(); link?.click();
  });
  await expect(page.locator("main")).toContainText("pricing-monthly-professional");
  await page.goBack(); await expect(page).toHaveURL("/pricing?billing=monthly");
  await expect(page.locator("h1")).toBeVisible();
  await page.goForward(); await expect(page.locator("main")).toContainText("pricing-monthly-professional");
  const other = await context.newPage(); await other.goto("/signup");
  await expect(other.locator("main")).not.toContainText("pricing-monthly-professional"); await ready(other); await other.close();
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }))).not.toContain("pricing-monthly-professional");
});

test("explicit mock session routes plan choice to G79 handoff without changing workspace access", async ({ page }) => {
  await enterWorkspace(page);
  await page.getByRole("link", { name: "Public site", exact: true }).click(); await ready(page);
  await page.locator("header").getByRole("link", { name: "Pricing", exact: true }).click();
  await page.getByRole("article", { name: "Business", exact: true }).getByRole("link", { name: "Start for free" }).first().click();
  await expect(page).toHaveURL("/preview/subscription");
  await expect(page.locator("main")).toContainText("G79");
  await expect(page.locator("main")).toContainText("$792 USD");
  await expect(page.locator("main")).toContainText("구독·역할·권한은 변경되지 않습니다.");
  await page.getByRole("button", { name: "Cancel and clear draft" }).click();
  await page.getByRole("link", { name: "Go to dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Good evening, Alex (preview)." })).toBeVisible();
});

test("reviews poster explicitly lacks media, traps focus, closes and resets on browser return", async ({ page }) => {
  await page.goto("/"); await ready(page);
  await page.locator("header").getByRole("link", { name: "Reviews", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("What Bonsai customers say"); await ready(page);
  await expect(page).toHaveTitle("Reviews · Bonsai UI preview");
  const trigger = page.getByRole("button", { name: "Open customer video" });
  await trigger.focus(); await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog"); await expect(dialog).toContainText("영상 파일과 자막이 제공되지 않습니다");
  await expect(page.locator("video, iframe, audio")).toHaveCount(0);
  await page.keyboard.press("Shift+Tab"); await expect(dialog.getByRole("button", { name: "Back to reviews" })).toBeFocused();
  await page.keyboard.press("Tab"); await expect(dialog.getByRole("button", { name: "Close dialog" })).toBeFocused();
  await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
  await trigger.click(); await dialog.getByRole("button", { name: "Back to reviews" }).click(); await expect(trigger).toBeFocused();
  await trigger.click(); await page.goBack(); await expect(page.getByRole("heading", { name: "Run your entire business in one place" })).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.goForward(); await expect(page.locator("h1")).toHaveText("What Bonsai customers say");
  await expect(dialog).toHaveCount(0); await ready(page);
  await trigger.click(); await page.reload(); await expect(dialog).toHaveCount(0); await ready(page);
});

test("review badges and author links use local destinations and real back restores card scroll", async ({ page }) => {
  await page.goto("/reviews"); await ready(page);
  await expect(page.locator(".review-card")).toHaveCount(30);
  await expect(page.locator("#review-07-brandon")).toContainText("Full Stack Developer");
  await page.getByRole("link", { name: "Bonsai reviews on G2", exact: true }).click();
  await expect(page).toHaveURL("/outbound/reviews/g2");
  await expect(page.locator("main")).toContainText("https://www.g2.com/products/bonsai/reviews");
  await page.goBack(); await ready(page);
  const author = page.locator("#review-11-brianna").getByRole("link", { name: "Photographer" });
  await author.scrollIntoViewIfNeeded(); const y = await page.evaluate(() => scrollY);
  await author.click(); await expect(page.locator("h1")).toHaveText("Brianna, Photographer");
  await expect(page.locator("main")).toContainText("https://bricocreative.com/");
  await page.goBack(); await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
  await page.getByRole("link", { name: "Bonsai reviews on Capterra" }).click();
  await expect(page.locator("main")).toContainText("https://www.capterra.com/p/238825/Bonsai/");
  await page.getByRole("button", { name: "Back to reviews" }).click();
  await expect(page.locator("h1")).toHaveText("What Bonsai customers say");
  await ready(page);
});

test("pricing and review contents remain inside narrow and enlarged layouts including long Korean", async ({ page }) => {
  test.setTimeout(90000);
  for (const path of ["/pricing", "/reviews"]) {
    await page.goto(path); await ready(page);
    await expect(page.locator(path === "/pricing" ? "h1" : ".review-section h2")).not.toContainText(/foryour|ownersacross/);
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const violations = await page.locator("main h1, main h2, main h3, .pricing-description, .pricing-features li > span:last-child, .pricing-plan .public-button, .pricing-cycle, .review-card p, .review-video-poster").evaluateAll(elements => elements.flatMap(el => {
        const rect = el.getBoundingClientRect(); const card = el.closest("article")?.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1 || el.scrollWidth > el.clientWidth + 2 || (card && (rect.left < card.left || rect.right > card.right)) ? [el.textContent?.slice(0, 60)] : [];
      }));
      expect(violations, `${path} at ${width}`).toEqual([]);
    }
    await page.setViewportSize({ width: 800, height: 900 });
    await page.evaluate(() => { document.body.style.zoom = "200%"; const heading = document.querySelector("main h1"); if (heading) heading.textContent = "길게입력한한국어제목도잘리지않는지확인합니다".repeat(3); });
    const bounds = await page.locator("main h1").evaluate(el => ({ rect: el.getBoundingClientRect().right, overflow: el.scrollWidth - el.clientWidth }));
    expect(bounds.rect).toBeLessThanOrEqual(801); expect(bounds.overflow).toBeLessThanOrEqual(2);
    await page.evaluate(() => { document.body.style.zoom = ""; });
  }
});
