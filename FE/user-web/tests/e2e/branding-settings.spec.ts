import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
const logoFile = "tests/fixtures/recorded-company-logo.png";
// 기능 : 실제 가상 로그인과 기존 회사 설정 탐색으로 브랜드 화면을 연다.
async function enter(page: Page, actor = "Alex") {
  await page.goto("/login?returnTo=%2Fapp%2Fsettings%2Fcompany"); await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Continue as " + actor }).click(); await expect(page.getByLabel("Company Name", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Branding", exact: true }).click(); await expect(page.getByRole("combobox", { name: "Header Image" })).toBeVisible();
}
// 기능 : 브랜드 저장에도 사용하는 회사 목 시나리오를 제품 밖 도구에서 선택한다.
async function scenario(page: Page, value: string) {
  const controls = page.locator(".company-tools"); if (await controls.getAttribute("open") === null) await controls.locator("summary").click();
  await page.getByLabel("Company scenario").selectOption(value);
}
// 기능 : 목록의 실제 옵션을 누르고 대응하는 로컬 헤더 자산 준비를 기다린다.
async function header(page: Page, name: string) {
  await page.getByRole("combobox", { name: "Header Image" }).click(); await page.getByRole("option", { name, exact: true }).click(); await page.waitForLoadState("networkidle");
}
// 기능 : 개발 도구의 실제 workspace 선택기를 연다.
async function tools(page: Page) { const panel = page.locator(".preview-tools"); if (await panel.getAttribute("open") === null) await panel.locator("summary").click(); }

test("branding previews separately, commits shared logo only on Save, and reloads saved defaults through real history", async ({ page }) => {
  await enter(page); await expect(page.getByRole("link", { name: "Branding", exact: true })).toHaveAttribute("aria-current", "page");
  await page.getByLabel("Choose company logo").setInputFiles(logoFile); await expect(page.getByAltText("Company logo preview")).toBeVisible();
  await header(page, "Abstract"); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "abstract"); await header(page, "Plant");
  await expect(page.getByText("Your branding settings have been saved.", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Save Changes", exact: true }).dblclick(); await expect(page.getByRole("status")).toContainText("branding settings have been saved");
  await page.getByRole("link", { name: "Account", exact: true }).click(); await expect(page.getByAltText("Company logo preview")).toBeVisible(); await expect(page.getByLabel("Company Name", { exact: true })).toHaveValue("Studio A");
  await page.goBack(); await expect(page.getByRole("combobox", { name: "Header Image" })).toContainText("Plant"); await header(page, "Abstract");
  await page.getByRole("button", { name: "Discard changes" }).click(); await expect(page.getByRole("combobox", { name: "Header Image" })).toContainText("Plant");
  await header(page, "No image"); await page.goForward(); await expect(page.getByLabel("Company Name", { exact: true })).toBeVisible(); await page.goBack(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "plant");
  await page.reload(); await expect(page).toHaveURL(/\/login\?returnTo=/); await page.waitForLoadState("networkidle"); await page.getByRole("button", { name: "Continue as Alex" }).click(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "none"); await expect(page.getByAltText("Company logo preview")).toHaveCount(0);
});

test("failed saves keep edits, cancel preserves draft, new selections and navigation cancel late commits", async ({ page }) => {
  await enter(page); await header(page, "Plant"); await scenario(page, "save-error"); await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByRole("alert")).toContainText("changes are still here"); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "plant"); await page.getByRole("button", { name: "Save Changes" }).dblclick(); await expect(page.getByRole("status")).toContainText("have been saved");
  await scenario(page, "slow"); await header(page, "Abstract"); await page.getByRole("button", { name: "Save Changes" }).click(); await page.getByRole("button", { name: "Cancel save" }).click(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "abstract");
  await page.getByRole("button", { name: "Save Changes" }).click(); await header(page, "No image"); await page.waitForTimeout(1600); await expect(page.getByText("Your branding settings have been saved.")).toHaveCount(0);
  await page.getByRole("button", { name: "Discard changes" }).click(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "plant");
  await header(page, "Abstract"); await page.getByRole("button", { name: "Save Changes" }).click(); await page.getByRole("link", { name: "Account", exact: true }).click(); await expect(page.getByLabel("Company Name", { exact: true })).toBeVisible(); await page.goBack(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "plant"); await scenario(page, "normal");
});

test("branding read failure, empty and denied states recover; workspace and logout discard pending drafts", async ({ page }) => {
  await enter(page); await scenario(page, "read-error"); await expect(page.getByRole("heading", { name: "Branding could not be loaded" })).toBeVisible(); await page.getByRole("button", { name: "Retry branding" }).click(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "none");
  await scenario(page, "empty"); await expect(page.getByRole("heading", { name: "No company branding" })).toBeVisible(); await scenario(page, "denied"); await expect(page.getByRole("heading", { name: "Branding access unavailable" })).toBeVisible(); await scenario(page, "normal");
  await header(page, "Plant"); await page.getByRole("button", { name: "Save Changes" }).click(); await expect(page.getByRole("status")).toContainText("have been saved");
  await scenario(page, "slow"); await header(page, "Abstract"); await page.getByRole("button", { name: "Save Changes" }).click(); await tools(page); await page.getByRole("combobox", { name: "Workspace", exact: true }).selectOption("studio-a-two"); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "none");
  await page.getByRole("combobox", { name: "Workspace", exact: true }).selectOption("studio-a"); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "plant");
  await scenario(page, "slow"); await header(page, "Abstract"); await page.getByRole("button", { name: "Save Changes" }).click(); await page.locator(".auth-account > button").click(); await page.getByRole("button", { name: "Logout", exact: true }).click(); await expect(page).toHaveURL(/\/login/); await page.getByRole("button", { name: "Continue as Alex" }).click(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "plant");
  await tools(page); await page.getByRole("combobox", { name: "Session", exact: true }).selectOption("preview-b"); await expect(page.getByRole("combobox", { name: "Header Image" })).toBeDisabled(); await expect(page.getByRole("button", { name: "Save Changes" })).toBeDisabled(); await expect(page.locator(".sample-invoice")).toHaveAttribute("data-header", "none");
  await page.getByRole("button", { name: "Reset preview" }).click(); await expect(page).toHaveURL("/components");
});

test("local logo retries, cancellation and Discard cannot change company data or leak blob URLs", async ({ page }) => {
  await page.addInitScript(function trackUrls() {
    const create = URL.createObjectURL.bind(URL); const revoke = URL.revokeObjectURL.bind(URL); const live = new Set<string>(); Object.assign(window, { brandUrls: live });
    // 기능 : 실제 생성된 URL 수를 관찰하며 원래 브라우저 동작을 유지한다.
    URL.createObjectURL = function createUrl(blob) { const url = create(blob); live.add(url); return url; };
    // 기능 : 실제 해제된 URL을 관찰 목록에서도 제거한다.
    URL.revokeObjectURL = function revokeUrl(url) { live.delete(url); revoke(url); };
  });
  await enter(page); const input = page.getByLabel("Choose company logo");
  await input.setInputFiles({ name: "bad.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") }); await expect(page.getByRole("alert")).toContainText("2 MB");
  await scenario(page, "logo-error"); await input.setInputFiles(logoFile); await expect(page.getByRole("alert")).toContainText("Unable to read"); await page.getByRole("button", { name: "Retry image" }).click(); await expect(page.getByAltText("Company logo preview")).toBeVisible();
  await page.getByRole("button", { name: "Discard changes" }).click(); await expect(page.getByAltText("Company logo preview")).toHaveCount(0); await expect(page.getByRole("button", { name: "Save Changes" })).toBeEnabled();
  await scenario(page, "slow"); await input.setInputFiles(logoFile); await page.getByRole("button", { name: "Cancel image" }).click(); await page.waitForTimeout(1600); await expect(page.getByAltText("Company logo preview")).toHaveCount(0);
  await input.setInputFiles(logoFile); await page.getByRole("button", { name: "Discard changes" }).click(); await expect(page.getByRole("button", { name: "Save Changes" })).toBeEnabled(); await expect(page.getByAltText("Company logo preview")).toHaveCount(0); await scenario(page, "normal");
  await input.setInputFiles(logoFile); await expect(page.getByAltText("Company logo preview")).toBeVisible(); await page.getByRole("button", { name: "Save Changes" }).click(); await expect(page.getByRole("status")).toContainText("have been saved");
  await page.getByRole("button", { name: "Remove company logo" }).click(); await page.getByRole("link", { name: "Account", exact: true }).click(); await expect(page.getByAltText("Company logo preview")).toBeVisible();
  await page.getByLabel("Company Name", { exact: true }).fill("G15 保持 한글"); await page.getByRole("button", { name: "Disabled", exact: true }).click(); await page.getByRole("button", { name: "Save Changes" }).click(); await expect(page.getByRole("status")).toContainText("company changes have been saved");
  await page.getByRole("link", { name: "Branding", exact: true }).click(); await header(page, "Plant"); await page.getByRole("button", { name: "Remove company logo" }).click(); await page.getByRole("button", { name: "Save Changes" }).click(); await expect(page.getByRole("status")).toContainText("branding settings have been saved");
  await page.getByRole("link", { name: "Account", exact: true }).click(); await expect(page.getByLabel("Company Name", { exact: true })).toHaveValue("G15 保持 한글"); await expect(page.getByRole("button", { name: "Disabled", exact: true })).toHaveAttribute("aria-pressed", "true"); await expect(page.getByAltText("Company logo preview")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "brandUrls").size)).toBe(0);
});

test("header keyboard, outside click and unknown options preserve focus, saved choices and permissions", async ({ page }) => {
  await enter(page); const combo = page.getByRole("combobox", { name: "Header Image" }); await combo.focus(); await combo.press("ArrowDown"); await expect(page.getByRole("listbox")).toBeVisible(); await combo.press("Escape"); await expect(combo).toBeFocused(); await expect(combo).toHaveAttribute("aria-expanded", "false");
  await combo.press("ArrowDown"); await combo.press("Enter"); await page.waitForLoadState("networkidle"); await expect(combo).toContainText("Abstract"); await combo.click(); await page.getByRole("heading", { name: "Brand Preview" }).click(); await expect(combo).toHaveAttribute("aria-expanded", "false");
  await combo.click(); await combo.press("End"); await combo.press("Enter"); const dialog = page.getByRole("dialog"); await expect(dialog).toContainText("not available in the recorded preview"); await page.keyboard.press("Escape"); await expect(combo).toBeFocused(); await expect(combo).toContainText("Abstract");
  await combo.click(); await page.getByRole("option", { name: "Desk", exact: true }).click(); await dialog.getByRole("button", { name: "Return to branding" }).click(); await expect(combo).toContainText("Abstract");
  await page.getByRole("button", { name: "Brand Font: Select a font", exact: true }).click(); await page.keyboard.press("Escape"); await expect(page.getByRole("button", { name: "Brand Font: Select a font", exact: true })).toBeFocused();
  await page.getByRole("radio", { name: "Remove all branding", exact: true }).click(); await expect(dialog).toBeVisible(); await page.keyboard.press("Escape"); await expect(page.getByRole("radio", { name: "Show Bonsai branding", exact: true })).toBeChecked(); await expect(page.getByRole("radio", { name: "Remove all branding", exact: true })).not.toBeChecked();
  await page.getByRole("button", { name: "Save Changes" }).click(); await expect(page.getByRole("status")).toContainText("have been saved");
});

test("narrow and enlarged branding retains full controls, long Korean file names and composition guards", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 }); await enter(page);
  await page.getByLabel("Choose company logo").setInputFiles({ name: "아주긴회사로고파일이름".repeat(8) + ".png", mimeType: "image/png", buffer: readFileSync(logoFile) }); await expect(page.getByAltText("Company logo preview")).toBeVisible();
  const combo = page.getByRole("combobox", { name: "Header Image" }); await combo.focus(); await combo.dispatchEvent("compositionstart"); await combo.press("Enter"); await expect(page.getByText("Your branding settings have been saved.")).toHaveCount(0); await combo.dispatchEvent("compositionend"); await page.keyboard.press("Escape"); await header(page, "Plant");
  await page.addStyleTag({ content: '.branding-settings :is(h1,h2,h3,p,label,legend,button){font-size:24px!important;line-height:1.35!important}' });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const clipped = await page.locator('.branding-settings h1,.branding-settings h2,.branding-settings h3,.brand-fields button,.brand-fields label,.brand-preview,.branding-panel .company-save').evaluateAll(nodes => nodes.filter(node => { const box = node.getBoundingClientRect(); return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1 || (node instanceof HTMLElement && node.scrollWidth > node.clientWidth + 2)); }).map(node => node.textContent));
    expect(clipped).toEqual([]);
    await combo.click(); await combo.press("End"); await expect(page.getByRole("option", { name: "Custom Header" })).toBeInViewport(); await combo.press("Escape");
  }
  await page.getByRole("button", { name: "Save Changes" }).click(); await expect(page.getByRole("status")).toContainText("have been saved");
});
