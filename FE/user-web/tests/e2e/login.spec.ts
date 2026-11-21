import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

// 기능 : 실제 로그인 폼에 공개 샘플 자격만 입력한다.
async function fillLogin(page: Page, password = "PreviewOnly123!") { await page.getByRole("textbox", { name: "Email", exact: true }).fill("alex@example.test"); await page.getByLabel("Password", { exact: true }).fill(password); await page.getByRole("checkbox", { name: /I'm not a robot/ }).check(); }
// 기능 : 목 인증 시나리오를 실제 도구로 선택한다.
async function scenario(page: Page, value: string) { const details = page.locator(".auth-tools"); if (!await details.evaluate(element => element.hasAttribute("open"))) await details.locator("summary").click(); await page.getByRole("combobox", { name: "Authentication scenario" }).selectOption(value); }
// 기능 : 계정 메뉴의 실제 로그아웃을 실행한다.
async function openAccount(page: Page) { await page.locator(".auth-account > button").click(); }

test("login preserves failed input, supports retry, logout and protected-history recovery", async ({ page }) => {
  await page.goto("/app"); await expect(page).toHaveURL(/\/login\?returnTo=/); await fillLogin(page, "WrongSample123!"); await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect"); await expect(page.getByLabel("Password", { exact: true })).toHaveValue("WrongSample123!"); await page.getByLabel("Password", { exact: true }).fill("PreviewOnly123!");
  await scenario(page, "fail-once"); await page.getByRole("button", { name: "Log in", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("failed"); await page.locator(".auth-login form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByRole("heading", { name: "Good evening, Alex (preview)." })).toBeVisible(); await openAccount(page); await page.keyboard.press("Escape"); await expect(page.locator(".auth-account > button")).toBeFocused(); await openAccount(page); await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Log in to Bonsai"); await expect(page.getByRole("status")).toContainText("Signed out"); await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await page.goBack(); await expect(page).not.toHaveURL(/\/app(?:$|\/)/); await page.goto("/app"); await expect(page.locator("h1")).toHaveText("Log in to Bonsai");
});

test("slow login cancellation and synthetic IME cannot create a late session", async ({ page }) => {
  await page.goto("/login"); await fillLogin(page); await scenario(page, "slow"); const password = page.getByLabel("Password", { exact: true }); await password.dispatchEvent("compositionstart"); await password.press("Enter"); await expect(page.getByRole("button", { name: "Cancel login" })).toHaveCount(0); await password.dispatchEvent("compositionend");
  await page.getByRole("button", { name: "Log in", exact: true }).click(); await page.getByRole("button", { name: "Cancel login" }).click(); await page.waitForTimeout(1600); await expect(password).toHaveValue("PreviewOnly123!");
  await page.getByRole("button", { name: "Expire local check" }).click(); await expect(page.getByRole("checkbox")).not.toBeChecked(); await page.getByRole("button", { name: "Log in", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("Complete the local");
  await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "Log in", exact: true }).click(); await page.getByRole("link", { name: "Back to landing", exact: true }).click(); await page.waitForTimeout(1600); await page.locator("header").getByRole("link", { name: "Log in", exact: true }).click(); await expect(password).toHaveValue("");
});

test("two-factor code is required, expiry and renewal work, and cancellation restores an empty login", async ({ page }) => {
  await page.goto("/login"); await fillLogin(page); await scenario(page, "two-factor"); await page.getByRole("button", { name: "Log in", exact: true }).click(); await expect(page).toHaveURL("/two-factor");
  await page.getByRole("textbox", { name: "Sample verification code" }).fill("000000"); await page.getByRole("button", { name: "Verify sample code", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("Incorrect"); await page.getByRole("button", { name: "Expire sample code", exact: true }).click(); await expect(page.getByRole("button", { name: "Verify sample code", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Request another local code" }).click(); await page.getByRole("textbox", { name: "Sample verification code" }).fill("123456"); await page.getByRole("button", { name: "Verify sample code", exact: true }).click(); await expect(page.getByRole("heading", { name: "Good evening, Alex (preview)." })).toBeVisible();
  await openAccount(page); await page.getByRole("button", { name: "Logout", exact: true }).click(); await fillLogin(page); await scenario(page, "two-factor"); await page.getByRole("button", { name: "Log in", exact: true }).click(); await page.getByRole("link", { name: "Cancel and return to login" }).click(); await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await page.goto("/two-factor"); await expect(page.locator("main")).toContainText("unavailable");
});

test("logout failure, cancellation and local expiry use real protected navigation", async ({ page }) => {
  await page.goto("/login"); await fillLogin(page); await page.getByRole("button", { name: "Log in", exact: true }).click(); await openAccount(page); await scenario(page, "fail-once"); await page.getByRole("button", { name: "Logout", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("failed"); await expect(page).toHaveURL("/app");
  await scenario(page, "slow"); await page.getByRole("button", { name: "Logout", exact: true }).click(); await page.getByRole("button", { name: "Cancel logout" }).click(); await page.waitForTimeout(1600); await expect(page).toHaveURL("/app");
  await scenario(page, "normal"); await page.getByText("Local session expiry", { exact: true }).click(); await page.getByRole("button", { name: "Expire local session" }).click(); await expect(page.locator("h1")).toHaveText("Log in to Bonsai"); await expect(page.getByRole("status")).toContainText("expired"); await page.reload(); await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
});

test("social mock cancellation restores focus, Apple uses Blair, and narrow login keeps controls visible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 }); await page.goto("/login"); const apple = page.getByRole("button", { name: "Sign in with Apple", exact: true }); await apple.click(); await expect(page.getByRole("dialog")).toContainText("No OAuth"); await page.keyboard.press("Escape"); await expect(apple).toBeFocused();
  await page.addStyleTag({ content: '.auth-login input, .auth-login button {font-size:24px!important;}' });
  const clipped = await page.locator(".auth-login h1, .auth-login input, .auth-login button").evaluateAll(elements => elements.filter(element => { const r = element.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(element => element.tagName)); expect(clipped).toEqual([]);
  await apple.click(); await page.getByRole("button", { name: "Continue with sample identity" }).click(); await expect(page.locator(".auth-account > button")).toHaveAccessibleName("Blair (preview)");
});
