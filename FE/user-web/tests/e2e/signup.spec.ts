import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

// 기능 : 샘플 자격 증명만 사용해 원본 가입 폼을 채운다.
async function fillSignup(page: Page, email = "signup@example.test") {
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByRole("textbox", { name: "Full Name", exact: true }).fill("Sample Owner");
  await page.getByLabel("Password", { exact: true }).fill("SampleOnly123!");
  await page.getByRole("checkbox", { name: /I'm not a robot/ }).check();
}
// 기능 : 시나리오 도구를 열어 실패·지연·메일 확인을 명시적으로 선택한다.
async function scenario(page: Page, value: string) { await page.getByText("Local authentication scenarios", { exact: true }).click(); await page.getByRole("combobox", { name: "Authentication scenario" }).selectOption(value); }

test("signup validates, retries without losing input and carries the selected plan through authentication", async ({ page }) => {
  await page.goto("/pricing"); await page.getByRole("radio", { name: "Monthly", exact: true }).check(); await page.getByRole("article", { name: "Business", exact: true }).getByRole("link", { name: "Start for free" }).first().click();
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();
  await page.getByRole("button", { name: "Create Free Account", exact: true }).click(); await expect(page.locator(".auth-error")).toContainText(["Enter a valid email", "Enter your full name", "no less than 10", "Complete the local"]);
  await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeFocused();
  await page.getByRole("textbox", { name: "Email", exact: true }).pressSequentially("sample@example.test"); await expect(page.getByRole("textbox", { name: "Email", exact: true })).toHaveValue("sample@example.test"); await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeFocused();
  await page.getByLabel("Password", { exact: true }).fill("short"); await page.getByRole("textbox", { name: "Full Name" }).click();
  const tooltip = await page.locator(".auth-password-tooltip").boundingBox(); const label = await page.locator(".auth-label-row label").boundingBox();
  expect(tooltip && label && tooltip.y + tooltip.height <= label.y).toBeTruthy();
  await fillSignup(page); await scenario(page, "fail-once"); await page.getByRole("button", { name: "Create Free Account", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("failed"); await expect(page.getByLabel("Password", { exact: true })).toHaveValue("SampleOnly123!");
  await page.locator(".auth-signup form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page).toHaveURL("/onboarding"); await expect(page.locator("h1")).toContainText("Sample Owner"); await expect(page.locator(".auth-intent")).toContainText("pricing-monthly-business"); await expect(page.locator(".auth-intent")).toContainText("$79 USD");
  expect(await page.evaluate(() => location.href + JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain("SampleOnly123!");
  await page.getByRole("button", { name: "End local session" }).click(); await expect(page).toHaveURL("/signup"); await expect(page.locator(".auth-intent")).toHaveCount(0); await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
});

test("slow signup cancellation, route departure and synthetic IME cannot create a late session", async ({ page }) => {
  await page.goto("/signup"); await fillSignup(page); await scenario(page, "slow");
  const password = page.getByLabel("Password", { exact: true }); await password.dispatchEvent("compositionstart"); await password.press("Enter"); await expect(page.locator(".auth-progress")).toHaveCount(0); await password.dispatchEvent("compositionend");
  await page.getByRole("button", { name: "Create Free Account", exact: true }).click(); await page.getByRole("button", { name: "Cancel this attempt" }).click(); await page.waitForTimeout(1600); await expect(page).toHaveURL("/signup"); await expect(password).toHaveValue("SampleOnly123!");
  await page.getByRole("button", { name: "Create Free Account", exact: true }).click(); await page.getByRole("link", { name: "Back to landing", exact: true }).click(); await page.waitForTimeout(1600); await expect(page).toHaveURL("/");
  await page.locator("header").getByRole("link", { name: "Start free", exact: true }).click(); await expect(password).toHaveValue("");
  await page.getByText("Local authentication scenarios", { exact: true }).click(); await page.getByRole("combobox", { name: "Authentication scenario" }).selectOption("normal");
  await fillSignup(page); await page.getByRole("button", { name: "Create Free Account", exact: true }).click(); await expect(page.locator("h1")).toContainText("Sample Owner");
});

test("social cancellation restores focus; a sample identity succeeds and duplicate signup remains editable", async ({ page }) => {
  await page.goto("/signup"); const google = page.getByRole("button", { name: "Sign up with Google", exact: true }); await google.click(); await expect(page.getByRole("dialog")).toContainText("No Google account"); await page.keyboard.press("Escape"); await expect(google).toBeFocused();
  await google.click(); await page.getByRole("button", { name: "Continue with sample Google identity" }).click(); await expect(page.locator("h1")).toContainText("Google Preview"); await page.getByRole("button", { name: "End local session" }).click();
  await fillSignup(page, "google-preview@example.test"); await page.getByRole("button", { name: "Create Free Account", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("already has a local preview account"); await expect(page.getByRole("textbox", { name: "Full Name" })).toHaveValue("Sample Owner");
});

test("local email verification survives StrictMode, supports expiry/cancel/retry and confirms no real email", async ({ page }) => {
  await page.goto("/pricing"); await page.getByRole("article", { name: "Starter", exact: true }).getByRole("link", { name: "Start for free" }).first().click(); await scenario(page, "verify-email"); await fillSignup(page); await page.getByRole("button", { name: "Create Free Account", exact: true }).click();
  await expect(page).toHaveURL("/verify-email"); await expect(page.getByRole("button", { name: "Confirm sample email" })).toBeEnabled(); await expect(page.locator("main")).toContainText("No email has been sent");
  await page.getByRole("button", { name: "Expire sample link" }).click(); await expect(page.getByRole("button", { name: "Confirm sample email" })).toBeDisabled(); await page.getByRole("link", { name: "Cancel and return to signup" }).click();
  await expect(page.locator(".auth-intent")).toContainText("pricing-yearly-starter");
  await fillSignup(page); await page.getByRole("button", { name: "Create Free Account", exact: true }).click(); await page.getByRole("button", { name: "Confirm sample email" }).click(); await expect(page.locator("h1")).toContainText("Sample Owner"); await expect(page.locator(".auth-intent")).toContainText("pricing-yearly-starter");
});

test("narrow signup exposes complete fields and buttons with long Korean input and text enlargement", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 }); await page.goto("/signup"); await fillSignup(page); await page.getByRole("textbox", { name: "Full Name" }).fill("아주 긴 한국어 이름을 포함한 가상 사업자 이름".repeat(3));
  await page.getByRole("button", { name: "Show password" }).click(); await expect(page.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  await page.addStyleTag({ content: '.auth-card { font-size: 24px; } .auth-card input, .auth-card button, .auth-card label { font-size: 24px!important; }' });
  const clipped = await page.locator("h1, .auth-card input, .auth-card button, .auth-card label").evaluateAll(elements => elements.filter(element => { const r = element.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(element => element.tagName)); expect(clipped).toEqual([]);
  await page.getByRole("button", { name: "Cancel and clear draft" }).click(); await expect(page.locator("h1")).toBeVisible();
});
