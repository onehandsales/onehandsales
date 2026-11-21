import { test, expect } from "./fixtures";

test("resources → filtered search → article → real back/forward preserves URL and scroll", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Resources", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Bonsai Business Software Blog");
  await page.getByRole("button", { name: "Start a business", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search articles" }).fill("marketing");
  await expect(page.locator(".blog-grid .blog-card")).toHaveCount(1);
  await expect(page).toHaveURL(/category=Start\+a\+business&q=marketing/);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 289));
  const scroll = await page.evaluate(() => scrollY);
  await page.getByRole("link", { name: /7 steps to launching/ }).click();
  await expect(page.locator("h1")).toHaveText("7 steps to launching your digital marketing agency");
  await page.getByRole("link", { name: "2. Find your niche", exact: true }).click();
  await expect(page.getByRole("link", { name: "2. Find your niche", exact: true })).toHaveAttribute("aria-current", "location");
  await expect(page.getByRole("heading", { name: "2. Find your niche", exact: true })).toBeInViewport();
  await page.getByRole("link", { name: "← Back to Blog" }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("marketing");
  await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(4);
  await page.goForward(); await expect(page.locator("h1")).toContainText("7 steps");
  await page.reload(); await expect(page.locator("h1")).toContainText("7 steps");
});

test("empty, no-match, page bounds and history remain distinct", async ({ page }) => {
  await page.goto("/blog?category=General&page=2");
  await expect(page.locator(".blog-pagination")).toContainText("2 / 4");
  await page.getByRole("button", { name: "Next ›", exact: true }).click();
  await expect(page.locator(".blog-pagination")).toContainText("3 / 4");
  await page.goBack(); await expect(page.locator(".blog-pagination")).toContainText("2 / 4");
  await page.getByRole("searchbox").fill("검색결과가없는아주긴한국어".repeat(10));
  await expect(page.getByRole("heading", { name: "No matching articles" })).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.locator(".blog-grid .blog-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Taxes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No articles available" })).toBeVisible();
  await page.reload(); await expect(page.getByRole("button", { name: "Taxes", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/blog?category=unknown&page=-3"); await expect(page.locator(".blog-pagination")).toContainText("1 / 4");
});

test("mock failure retries without losing query and slow old searches never replace the latest intent", async ({ page }) => {
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("read-error");
  await page.getByRole("link", { name: "Public", exact: true }).click();
  await page.getByRole("button", { name: "Resources", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("could not be loaded");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator(".blog-grid .blog-card")).toHaveCount(6);
  // 이유 : 카드 등장과 로컬 이미지 준비를 구분해 문서 교체로 인한 정적 요청 취소를 피한다.
  await expect.poll(() => page.locator(".blog-grid img").evaluateAll(images => images.filter(image => image.getBoundingClientRect().top < innerHeight).every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.waitForLoadState("networkidle");
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("slow");
  await page.getByRole("link", { name: "Public", exact: true }).click();
  await page.getByRole("button", { name: "Resources", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Loading articles");
  await page.getByRole("searchbox").fill("agency");
  await expect(page).toHaveURL(/q=agency/);
  await page.getByRole("searchbox").fill("photography");
  await expect(page.locator(".blog-card h2")).toHaveText("How to get into photography");
  await page.waitForTimeout(1600); await expect(page.locator(".blog-card h2")).toHaveText("How to get into photography");
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("normal");
});

test("narrow article, keyboard TOC and signup preserve the email draft without external calls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/blog/how-to-start-a-digital-marketing-agency");
  const toc = page.getByRole("link", { name: "2. Find your niche", exact: true });
  await toc.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "2. Find your niche", exact: true })).toBeInViewport();
  const email = page.getByRole("textbox", { name: "Email address" });
  await email.scrollIntoViewIfNeeded(); await email.fill("블로그입력오류".repeat(15));
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a valid email address.");
  await email.fill("blog@example.test");
  await email.dispatchEvent("compositionstart"); await email.press("Enter");
  await expect(page).toHaveURL(/\/blog\//);
  await email.dispatchEvent("compositionend");
  await page.locator(".article-signup form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page).toHaveURL("/signup"); await expect(page.locator("main")).toContainText("blog@example.test");
  await page.goBack(); await email.scrollIntoViewIfNeeded(); await expect(email).toHaveValue("blog@example.test");
  const clipped = await page.locator("h1, .article-body h2, .article-signup input, .article-signup button").evaluateAll(elements => elements.filter(element => { const box = element.getBoundingClientRect(); return box.left < -1 || box.right > innerWidth + 1; }).map(element => element.tagName));
  expect(clipped).toEqual([]);
});
