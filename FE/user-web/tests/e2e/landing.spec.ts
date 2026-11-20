import { test, expect } from "./fixtures";

test("landing loads local Gellix and all original sections, with no preview tools or APIs", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { name: "Run your entire business in one place" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Development tools" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Manage clients" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trusted by thousands of business owners" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.fonts.check('700 60px "Bonsai Public Gellix"'))).toBe(true);
  await expect(page.locator("h1")).toHaveCSS("font-size", "60px");
  await expect.poll(() => page.locator(".public-web img").evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Run your entire business in one place" })).toBeVisible();
});

test("menus support hover, keyboard, Escape, outside click, template selection and local handoffs", async ({ page }) => {
  await page.goto("/");
  const product = page.getByRole("button", { name: "Product", exact: true });
  await product.hover();
  await expect(product).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#public-mega-menu").getByRole("heading", { name: "Client Management" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(product).toBeFocused();
  await expect(product).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter");
  await expect(product).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("heading", { name: "Run your entire business in one place" }).click();
  await expect(product).toHaveAttribute("aria-expanded", "false");
  const templates = page.getByRole("button", { name: "Templates", exact: true });
  await templates.click();
  const contract = page.getByRole("tab", { name: "Contract Templates" });
  await contract.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: "Invoice Templates" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Basic Invoice Template");
  await page.getByRole("tabpanel").getByRole("link", { name: "See all templates" }).click();
  await expect(page).toHaveURL("/invoice-template");
  await expect(page.getByText("Local UI preview · Not implemented", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("G06");
  await page.goBack();
  await expect(templates).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Pick the best plan for your business" })).toBeVisible();
  await page.goBack(); await page.goForward();
  await expect(page).toHaveURL("/pricing");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Pick the best plan for your business" })).toBeVisible();
});

test("email validation, IME, retry, back retention, cancel and refresh stay in memory", async ({ page, context }) => {
  await page.goto("/");
  const email = page.getByRole("textbox", { name: "Email address" });
  const submit = page.locator("form").getByRole("button", { name: "Start free", exact: true });
  await email.fill("invalid"); await submit.click();
  await expect(page.getByRole("alert")).toHaveText("Enter a valid email address.");
  await expect(email).toHaveValue("invalid"); await expect(email).toBeFocused();
  await email.fill("preview@example.test");
  await email.dispatchEvent("compositionstart"); await email.press("Enter");
  await expect(page).toHaveURL("/");
  await email.dispatchEvent("compositionend");
  // 기능 : 같은 이벤트 주기의 연속 제출 뒤에도 뒤로 한 번이면 랜딩으로 복귀하는지 확인한다.
  await page.locator("form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page).toHaveURL("/signup");
  await expect(page.locator("main")).toContainText("preview@example.test");
  await expect(page.locator("main")).toContainText("hero-email");
  expect(await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }))).not.toContain("preview@example.test");
  await page.goBack(); await expect(page).toHaveURL("/"); await expect(email).toHaveValue("preview@example.test");
  await page.goForward();
  await page.getByRole("button", { name: "Cancel and clear draft" }).click();
  await expect(page).toHaveURL("/"); await expect(email).toHaveValue("");
  await email.fill("another@example.test"); await submit.click(); await page.reload();
  await expect(page.locator("main")).not.toContainText("another@example.test");
  const tab = await context.newPage(); await tab.goto("/signup");
  await expect(tab.locator("main")).toContainText("직접 URL·새 탭·새로고침에서는 인계가 초기화됩니다.");
  await tab.waitForLoadState("networkidle"); await tab.close();
});

test("testimonial, finance, branding, footer disclosure and history restore real scroll", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Testimonial 01: Alison" }).click();
  await expect(page.locator(".public-testimonial-copy")).toContainText("Big fan.");
  await page.locator(".public-testimonial-photo").evaluate((image: HTMLImageElement) => image.decode());
  await page.getByRole("button", { name: "Testimonial 03: Alexandre" }).click();
  await expect(page.locator(".public-testimonial-photo")).toHaveAttribute("alt", "Alexandre, Business Consultant");
  await page.getByRole("button", { name: "Banking", exact: true }).click();
  await expect(page.getByRole("img", { name: "Banking product illustration" })).toBeVisible();
  await page.locator(".public-finance-art > img").evaluate((image: HTMLImageElement) => image.decode());
  await page.getByRole("button", { name: "Doc templates Send professional-looking", exact: false }).click();
  await expect(page.getByRole("img", { name: "Doc templates product illustration" })).toBeVisible();
  await page.locator(".public-experience-options").getByRole("button", { name: /^Client CRM/ }).click();
  await expect(page.locator(".public-experience-options").getByRole("button", { name: /^Doc templates/ })).toHaveCSS("border-top-color", "rgb(199, 208, 202)");
  const contracts = page.locator("footer details").filter({ has: page.locator("summary", { hasText: /^Contracts$/ }) });
  await contracts.locator("summary").click();
  await expect(contracts).toHaveAttribute("open", "");
  await contracts.locator("summary").click();
  await expect(contracts).not.toHaveAttribute("open");
  const privacy = page.locator("footer").getByRole("link", { name: "Privacy", exact: true });
  await privacy.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await privacy.click(); await expect(page.locator("main")).toContainText("G09");
  await page.goBack();
  await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(4);
  await page.locator(".public-trial-banner").getByRole("link", { name: "Start free trial now" }).click();
  await expect(page.locator("main")).toContainText("footer-trial");
});

test("narrow widths, mobile menu, long Korean input, zoom and reduced motion keep controls usable", async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.waitForLoadState("networkidle");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  await toggle.click(); await page.getByRole("button", { name: "Industries", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "Consulting", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("The business software for consultants");
  await page.waitForLoadState("networkidle");
  await page.locator("header").getByRole("link", { name: "Bonsai home", exact: true }).click();
  await toggle.click(); await page.keyboard.press("Escape"); await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  const input = page.getByRole("textbox", { name: "Email address" });
  await input.fill("한글 조합과 아주 긴 이메일 입력 검증 ".repeat(8));
  await page.locator("form").getByRole("button", { name: "Start free" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await input.fill("zoom@example.test"); await page.locator("form").getByRole("button", { name: "Start free" }).click();
  await expect(page.locator("main")).toContainText("zoom@example.test");
  await page.getByRole("button", { name: "Cancel and clear draft" }).click();
  await page.evaluate(() => { document.documentElement.style.zoom = ""; });
});

test("G01 reset clears public draft while session and component previews remain separate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Email address" }).fill("discard@example.test");
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Choose a preview session" })).toBeVisible();
  await page.getByRole("link", { name: "Components", exact: true }).click();
  await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("button", { name: "Reset preview" }).click();
  await expect(page).toHaveURL("/components");
  await page.getByRole("link", { name: "Public", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Email address" })).toHaveValue("");
});

test("mobile close and breakpoint changes clear submenus and keep keyboard targets reachable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  const product = page.getByRole("button", { name: "Product", exact: true });
  await toggle.click(); await product.click(); await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#public-mega-menu")).toHaveCount(0);
  await toggle.click();
  await expect(product).toHaveAttribute("aria-expanded", "false");
  await product.click();
  const navigation = await page.getByRole("navigation", { name: "Main navigation" }).boundingBox();
  const submenu = await page.locator("#public-mega-menu").boundingBox();
  if (!submenu || !navigation) throw new Error("Opened navigation and submenu must have visible bounds");
  expect(submenu.y).toBeGreaterThanOrEqual(navigation.y + navigation.height);
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await page.getByRole("tab", { name: "Contract Templates" }).focus();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Form Templates" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#public-mega-menu").getByRole("link", { name: "All Templates", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel").getByRole("link").first()).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("mobile-template-keyboard.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Templates", exact: true })).toBeFocused();
  await page.keyboard.press("Escape"); await expect(toggle).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(product).toBeFocused();
  await product.press("Enter");
  await expect(page.locator("#public-mega-menu")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 500 });
  await expect(page.locator("#public-mega-menu")).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("each public destination family has an explicit local Goal boundary", async ({ page }) => {
  for (const [path, goal] of [["/scheduling", "G03"], ["/resources", "G05"],
    ["/resources/online-signature-maker", "G05"], ["/alternatives/freshbooks", "G05"],
    ["/a/online-contract-maker", "G05"], ["/templates/contracts", "G06"], ["/invoice-generator", "G07"],
    ["/help", "G08"], ["/support", "G08"], ["/affiliates", "G09"], ["/outbound/linkedin", "G09"]]) {
    await page.goto(path!);
    await expect(page.locator("main")).toContainText("Local UI preview · Not implemented");
    await expect(page.locator("main")).toContainText(goal!);
    await page.waitForLoadState("networkidle");
  }
});
