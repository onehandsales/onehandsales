import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

// 기능 : 실제 폼에서 가상 복구 요청을 만들고 링크 상태를 확인한다.
async function requestLink(page: Page, email = "alex@example.test") { await page.getByRole("textbox", { name: "Reset email" }).fill(email); await page.getByRole("checkbox", { name: /I'm not a robot/ }).check(); await page.getByRole("button", { name: "Send password reset email", exact: true }).click(); await expect(page.locator(".auth-reset-message")).toContainText("no email was sent"); }
// 기능 : 원본 밖의 장애 분기를 명시적 목 도구로 선택한다.
async function scenario(page: Page, value: string) { const details = page.locator(".auth-tools"); if (!await details.evaluate(element => element.hasAttribute("open"))) await details.locator("summary").click(); await page.getByRole("combobox", { name: "Authentication scenario" }).selectOption(value); }
// 기능 : 변경 전후 암호로 같은 계정의 실제 로그인 폼을 확인한다.
async function login(page: Page, password: string) { await page.getByRole("textbox", { name: "Email", exact: true }).fill("alex@example.test"); await page.getByLabel("Password", { exact: true }).fill(password); await page.getByRole("checkbox", { name: /I'm not a robot/ }).check(); await page.getByRole("button", { name: "Log in", exact: true }).click(); }

test("password reset separates receipt, weak input clearing, retry and blank login without automatic authentication", async ({ page }) => {
  await page.goto("/login"); await page.getByRole("link", { name: "Reset Password", exact: true }).click(); await requestLink(page); await page.getByRole("link", { name: "Open local reset link" }).click();
  const password = page.getByLabel("New Password", { exact: true }); await password.fill("weak"); await page.getByRole("button", { name: "Save New Password", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("Password is too weak"); await expect(password).toHaveValue(""); await expect(password).toBeFocused();
  await password.fill("Replacement123!"); await expect(page.getByRole("alert")).toContainText("Password is too weak"); await scenario(page, "fail-once"); await page.getByRole("button", { name: "Save New Password", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("failed"); await expect(password).toHaveValue("Replacement123!");
  await page.locator(".auth-reset-new form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); }); await expect(page).toHaveURL("/login"); await expect(page.getByRole("status")).toContainText("new password has been set"); await expect(page.getByRole("textbox", { name: "Email", exact: true })).toHaveValue(""); await expect(page.getByLabel("Password", { exact: true })).toHaveValue(""); await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.locator(".login-changelog")).toContainText("New Collaborators project view"); await login(page, "PreviewOnly123!"); await expect(page.getByRole("alert")).toContainText("incorrect"); await login(page, "Replacement123!"); await expect(page.locator(".auth-account > button")).toHaveAccessibleName("Alex (preview)");
  expect(await page.evaluate(() => location.href + JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain("Replacement123!");
});

test("unknown address, invalid direct URL, expiry, fresh link and refresh remain distinct", async ({ page }) => {
  await page.goto("/password/new"); await expect(page.locator("main")).toContainText("unavailable, expired or already used"); await page.getByRole("link", { name: "Request a new local link" }).click(); await requestLink(page, "unknown@example.test"); await expect(page.getByRole("link", { name: "Open local reset link" })).toHaveCount(0);
  await page.getByRole("button", { name: "Prepare another local request" }).click(); await requestLink(page); await page.getByRole("link", { name: "Open local reset link" }).click(); await page.getByRole("button", { name: "Expire local reset link" }).click(); await expect(page.getByRole("button", { name: "Save New Password", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Request a new local link" }).click(); await page.getByRole("button", { name: "Prepare another local request" }).click(); await requestLink(page); await page.getByRole("link", { name: "Open local reset link" }).click(); await page.reload(); await expect(page.locator("main")).toContainText("unavailable, expired or already used");
  await page.getByRole("link", { name: "Resend Verification Email", exact: true }).click(); await expect(page.locator("main")).toContainText("separate from password recovery");
});

test("slow reset cancellation and departure preserve input without changing the password; IME remains guarded", async ({ page }) => {
  await page.goto("/password/reset"); await scenario(page, "slow"); await page.getByRole("textbox", { name: "Reset email" }).fill("alex@example.test"); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "Send password reset email", exact: true }).click(); await page.getByRole("button", { name: "Cancel request" }).click(); await page.waitForTimeout(1600); await expect(page.getByRole("textbox", { name: "Reset email" })).toHaveValue("alex@example.test"); await expect(page.locator(".auth-reset-message")).toHaveCount(0);
  await scenario(page, "normal"); await requestLink(page); await page.getByRole("link", { name: "Open local reset link" }).click(); await expect(page.getByRole("heading", { name: "New Password", exact: true })).toBeVisible(); await scenario(page, "slow"); const password = page.getByLabel("New Password", { exact: true }); await password.fill("Replacement123!"); await password.dispatchEvent("compositionstart"); await password.press("Enter"); await expect(page.getByRole("button", { name: "Cancel password change" })).toHaveCount(0); await password.dispatchEvent("compositionend");
  await page.getByRole("button", { name: "Save New Password", exact: true }).click(); await page.getByRole("button", { name: "Cancel password change" }).click(); await page.waitForTimeout(1600); await expect(password).toHaveValue("Replacement123!");
  await page.getByRole("button", { name: "Save New Password", exact: true }).click(); await page.getByRole("link", { name: "Cancel and return to login" }).click(); await page.waitForTimeout(1600); await expect(page).toHaveURL("/login"); await scenario(page, "normal"); await login(page, "PreviewOnly123!"); await expect(page.locator(".auth-account > button")).toHaveAccessibleName("Alex (preview)");
});

test("pricing intent survives recovery while the completed login fields remain empty", async ({ page }) => {
  await page.goto("/pricing"); await page.getByRole("article", { name: "Starter", exact: true }).getByRole("link", { name: "Start for free" }).first().click(); await page.locator(".auth-header").getByRole("link", { name: "Log in", exact: true }).click(); await page.getByRole("link", { name: "Reset Password", exact: true }).click();
  await requestLink(page); await page.getByRole("link", { name: "Open local reset link" }).click(); await page.getByLabel("New Password", { exact: true }).fill("Replacement123!"); await page.getByRole("button", { name: "Save New Password", exact: true }).click(); await expect(page.getByRole("textbox", { name: "Email", exact: true })).toHaveValue(""); await expect(page.locator(".auth-intent")).toContainText("pricing-yearly-starter");
  await login(page, "Replacement123!"); await expect(page.locator(".auth-intent")).toContainText("pricing-yearly-starter"); await expect(page).toHaveURL("/auth/continue");
});

test("narrow recovery keeps input, errors and complete actions within bounds", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 }); await page.goto("/password/reset"); await page.getByRole("textbox", { name: "Reset email" }).fill("아주긴한글오류입력".repeat(20)); await page.getByRole("button", { name: "Send password reset email", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("valid email");
  await page.addStyleTag({ content: '.auth-reset input, .auth-reset button, .auth-reset a {font-size:24px!important;}' });
  const clipped = await page.locator(".auth-reset h1, .auth-reset input, .auth-reset button, .auth-reset a").evaluateAll(elements => elements.filter(element => { const r = element.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(element => element.tagName)); expect(clipped).toEqual([]);
});
