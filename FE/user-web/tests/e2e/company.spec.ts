import { test, expect } from "./fixtures";
// 기능 : 필요한 이미지와 로컬 요청이 준비된 화면만 다음 navigation의 출발점으로 삼는다.
async function waitForCompanyImages(page: import("@playwright/test").Page) {
  await expect.poll(() => page.locator("main img").evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await page.waitForLoadState("networkidle");
}

test("affiliate actions use distinct local destinations and browser history restores the original section", async ({ page }) => {
  await page.goto("/"); await page.getByRole("textbox", { name: "Email address" }).fill("retained@example.test"); await page.locator("footer").getByRole("link", { name: "Affiliate Program", exact: true }).click();
  await expect(page.locator("h1")).toContainText("Grow your"); await waitForCompanyImages(page);
  await expect(page.locator(".affiliate-steps")).toContainText("200% CPA"); await expect(page.locator(".affiliate-benefits")).toContainText("Starter monthly plan: $50"); await expect(page.locator("main form, main input, main select")).toHaveCount(0);
  await page.locator(".affiliate-join").getByRole("link", { name: "Contact us", exact: true }).click(); await expect(page.locator("main")).toContainText("mailto:affiliates@hellobonsai.com"); await page.getByRole("button", { name: "Back to source" }).click(); await expect(page.locator(".affiliate-join")).toBeInViewport();
  await page.locator(".affiliate-join").getByRole("link", { name: "Get started", exact: true }).click(); await expect(page.locator("main")).toContainText("https://hellobonsai.firstpromoter.com/"); await page.goBack(); await page.goForward(); await expect(page.locator("main h1")).toHaveText("Affiliate application"); await page.getByRole("button", { name: "Back to source" }).click(); await page.locator("header").getByRole("link", { name: "Bonsai home", exact: true }).click(); await expect(page.getByRole("textbox", { name: "Email address" })).toHaveValue("retained@example.test"); await page.locator("footer").getByRole("link", { name: "Affiliate Program", exact: true }).click(); await waitForCompanyImages(page); await page.locator(".affiliate-join").getByRole("link", { name: "Get started", exact: true }).click(); await expect(page.locator("main h1")).toHaveText("Affiliate application"); await page.reload(); await page.getByRole("button", { name: "Back to source" }).click(); await expect(page.locator("h1")).toContainText("Grow your"); await waitForCompanyImages(page);
  await page.locator("header").getByRole("link", { name: "Bonsai home", exact: true }).click(); await expect(page.getByRole("textbox", { name: "Email address" })).toHaveValue("");
});

test("careers and social destinations preserve route-specific return and do not claim application success", async ({ page }) => {
  await page.goto("/careers"); await expect(page.locator("h1")).toContainText("We are hiring"); await waitForCompanyImages(page);
  await expect(page.locator(".careers-benefits article")).toHaveCount(6); await expect(page.locator(".careers-values article")).toHaveCount(3);
  const cta = page.getByRole("link", { name: "View open positions" }); await cta.focus(); await page.keyboard.press("Enter"); await expect(page.locator("main")).toContainText("https://bonsai.crew.work/jobs"); await expect(page.locator("main")).toContainText("No application has been submitted"); await page.getByRole("button", { name: "Back to source" }).click(); await expect(page.locator("h1")).toContainText("We are hiring");
  await page.locator("footer").getByRole("link", { name: "LinkedIn", exact: true }).click(); await expect(page.locator("main h1")).toHaveText("LinkedIn"); await page.getByRole("button", { name: "Back to source" }).click(); await expect(page.locator("h1")).toContainText("We are hiring"); await expect(page.locator("footer .public-footer-social")).toBeInViewport();
  await page.goto("/outbound/careers"); await expect(page.locator("main h1")).toHaveText("Open positions"); await page.getByRole("button", { name: "Back to source" }).click(); await expect(page).toHaveURL("/careers"); await waitForCompanyImages(page);
});

test("historical policies distinguish excerpts, versions and local cookie or privacy contacts", async ({ page }) => {
  await page.goto("/legal/privacy"); await expect(page.locator("h1")).toHaveText("Privacy"); await expect(page.locator(".legal-reference-label")).toContainText("not the policy of this preview"); await expect(page.locator(".policy-omission")).toContainText("not the complete legal document");
  await page.getByRole("link", { name: "https://www.iubenda.com/privacy-policy/35324406/cookie-policy", exact: true }).click(); await expect(page.locator("main h1")).toHaveText("Cookie Policy"); await expect(page.locator("main")).toContainText("no cookie preference has changed"); await page.getByRole("button", { name: "Back to source" }).click(); await expect(page.locator(".privacy-bottom")).toBeInViewport();
  await page.getByRole("link", { name: "View historical privacy contact" }).click(); await expect(page.locator("main")).toContainText("mailto:team@hellobonsai.com"); await page.goBack(); await page.locator(".policy-links").getByRole("link", { name: "Terms & Conditions" }).click(); await expect(page.locator(".policy-copy")).toContainText("Last Updated: June 30, 2020"); await expect(page.locator("main form, main input, main [role=checkbox]")).toHaveCount(0);
  await page.reload(); await expect(page.locator("h1")).toHaveText("Terms & Conditions"); await expect(page.locator(".policy-omission")).toContainText("original signup has not been confirmed"); await page.goBack(); await expect(page.locator("h1")).toHaveText("Privacy");
});

test("company screens keep content and CTA bounds usable at 320px and CSS text enlargement", async ({ page }) => {
  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/affiliates"); await waitForCompanyImages(page);
    await expect(page.locator(".affiliate-branch")).toBeHidden(); const bounds = await page.locator(".affiliate-reference-art").boundingBox(); expect(bounds).not.toBeNull(); expect(bounds!.x).toBeGreaterThanOrEqual(0); expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 320, height: 600 });
  for (const route of ["/affiliates", "/careers", "/legal/privacy", "/legal/terms", "/outbound/affiliate-application"]) {
    await page.goto(route); await waitForCompanyImages(page);
    await page.addStyleTag({ content: ".public-company main {font-size:20px} .public-company main p, .public-company .company-cards p, .public-company .policy-copy {font-size:20px;line-height:1.5}" });
    const clipped = await page.locator("main h1, main h2, main h3, main p, main a, main button, main dd").evaluateAll(elements => elements.filter(el => { const r=el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth+1 || (el.scrollWidth > el.clientWidth+2 && getComputedStyle(el).overflowX !== "visible")); }).map(el=>el.textContent?.slice(0,55))); expect(clipped).toEqual([]);
    if (route === "/careers") { const cta=page.getByRole("link", {name:"View open positions"}); await cta.focus(); await page.keyboard.press("Enter"); await expect(page.locator("main h1")).toHaveText("Open positions"); await page.goBack(); await expect(cta).toBeVisible(); }
  }
});
