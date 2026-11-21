import { test, expect } from "./fixtures";
import type { Page, TestInfo } from "@playwright/test";

// 기능 : 결함 수정 후 실제 화면 상태를 재검토 가능한 캡처로 남긴다.
async function captureState(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(name + ".png");
  await page.screenshot({ path });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

// 기능 : 실제 가상 로그인 후 저장된 회사 설정을 준비한다.
async function openSettings(page: Page) {
  await page.goto("/login?returnTo=%2Fapp%2Fsettings%2Fcompany");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Continue as Alex" }).click();
  await expect(page.getByRole("textbox", { name: "Company Name", exact: true })).toHaveValue("Studio A");
}

// 기능 : 회사 저장 실패·재시도를 기존 로컬 도구로 선택한다.
async function companyScenario(page: Page, value: string) {
  const controls = page.locator(".company-tools");
  if (await controls.getAttribute("open") === null) await controls.locator("summary").click();
  await page.getByLabel("Company scenario").selectOption(value);
}

test("audit G02: shared signup links deduplicate double clicks and preserve keyboard and new-tab navigation", async ({ page, context }, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const start = page.locator(".public-auth-links").getByRole("link", { name: "Start free", exact: true });
  const initial = await page.evaluate(() => history.length);
  await start.dblclick();
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(initial + 1);
  await captureState(page, testInfo, "signup-single-entry");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Run your entire business in one place" })).toBeVisible();
  await start.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();
  await page.goBack(); await expect(start).toBeVisible();
  const opened = context.waitForEvent("page");
  await start.click({ modifiers: ["ControlOrMeta"] });
  const other = await opened;
  await expect(other.getByRole("heading", { name: "Create your free account" })).toBeVisible();
  await other.waitForLoadState("networkidle"); await other.close();
  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: "Product", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "CRM", exact: true }).click();
  await expect(page.locator("main h1")).toContainText("CRM");
  const crmHistory = await page.evaluate(() => history.length);
  await page.locator(".public-auth-links").getByRole("link", { name: "Start free", exact: true }).dblclick();
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();
  expect(await page.evaluate(() => history.length)).toBe(crmHistory + 1);
  await page.goBack(); await expect(page).toHaveURL("/crm");
});

for (const origin of ["/help/collections/96965?q=portal", "/support"]) {
  test(`audit G08: TOC and related article return preserve ${origin}`, async ({ page }, testInfo) => {
    await page.goto(origin);
    if (origin === "/support") await page.getByRole("link", { name: "How can I use my Client Portal?", exact: true }).click();
    else await page.locator(".help-result-list a").click();
    await expect(page.locator("main h1")).toContainText("Client Portal");
    const back = page.getByRole("link", { name: "Back to previous help page" });
    await expect(back).toHaveAttribute("href", origin);
    const toc = page.getByRole("link", { name: "How do I update my Client Portal branding?", exact: true });
    await toc.focus(); await page.keyboard.press("Enter");
    await expect(toc).toHaveAttribute("aria-current", "location");
    await expect(back).toHaveAttribute("href", origin);
    await captureState(page, testInfo, "help-toc-origin");
    const articleUrl = page.url();
    await page.getByRole("link", { name: "Can I send files to my client?", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Article body not provided" })).toBeVisible();
    await back.click(); await expect(page).toHaveURL(articleUrl);
    await expect(back).toHaveAttribute("href", origin);
    await back.click(); await expect(page).toHaveURL(origin);
    if (origin !== "/support") await expect(page.getByRole("searchbox", { name: "Search for articles" })).toHaveValue("portal");
    await page.goBack(); await expect(back).toHaveAttribute("href", origin);
    await page.goForward(); await expect(page).toHaveURL(origin);
    await page.waitForLoadState("networkidle");
    await page.goto(articleUrl);
    await expect(back).toHaveAttribute("href", "/help");
    await page.waitForLoadState("networkidle");
    await page.reload(); await expect(back).toHaveAttribute("href", "/help");
  });
}

test("audit G15: discarding an open address editor releases the company save and preserves normal cancellation", async ({ page }, testInfo) => {
  await openSettings(page);
  await page.getByRole("button", { name: "Add Address", exact: true }).click();
  await page.getByLabel("Address 1", { exact: true }).fill("Discard this address");
  await page.getByRole("button", { name: "Discard changes", exact: true }).click();
  const name = page.getByRole("textbox", { name: "Company Name", exact: true });
  await expect(name).toHaveValue("Studio A");
  await name.fill("Discard recovered 한글 회사");
  const save = page.getByRole("button", { name: "Save Changes", exact: true });
  await expect(save).toBeEnabled();
  await captureState(page, testInfo, "discard-save-released");
  await save.click();
  await expect(page.locator(".company-save-notice")).toBeVisible();
  await page.getByRole("button", { name: "Add Address", exact: true }).click();
  await page.getByLabel("Address 1", { exact: true }).fill("Cancelled address");
  await page.getByRole("button", { name: "Cancel address" }).click();
  await expect(save).toBeEnabled();
  await page.getByRole("button", { name: "Add Address", exact: true }).click();
  await expect(page.getByLabel("Address 1", { exact: true })).toHaveValue("");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Add Address", exact: true })).toBeFocused();
  await page.getByRole("link", { name: "Back to dashboard" }).click(); await page.goBack();
  await expect(name).toHaveValue("Discard recovered 한글 회사"); await expect(save).toBeEnabled();
});

test("audit G15: latest parent country survives address save without discarding address or currency edits", async ({ page }, testInfo) => {
  await openSettings(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Add Address", exact: true }).click();
  await page.getByLabel("Address 1", { exact: true }).fill("서울시 긴 주소 초안");
  await page.getByRole("combobox", { name: "Currency", exact: true }).selectOption("USD");
  const outerCountry = page.getByRole("combobox", { name: "Country", exact: true }).first();
  await outerCountry.selectOption("Singapore");
  await page.getByRole("button", { name: "Save Address", exact: true }).click();
  await expect(outerCountry).toHaveValue("Singapore");
  await expect(page.locator(".company-settings-logo")).toContainText("USD");
  await page.locator(".company-address-summary").click();
  const innerCountry = page.locator(".company-address-fields").getByRole("combobox", { name: "Country", exact: true });
  await innerCountry.selectOption("South Korea");
  await outerCountry.selectOption("Malaysia"); await outerCountry.selectOption("Singapore");
  await expect(innerCountry).toHaveValue("Singapore");
  await expect(page.getByLabel("Address 1", { exact: true })).toHaveValue("서울시 긴 주소 초안");
  await expect(page.getByRole("combobox", { name: "Currency", exact: true })).toHaveValue("USD");
  await innerCountry.selectOption("South Korea"); await page.getByRole("button", { name: "Cancel address" }).click();
  await expect(outerCountry).toHaveValue("Singapore");
  await page.locator(".company-address-summary").click();
  await innerCountry.selectOption("South Korea");
  await page.getByRole("button", { name: "Save Address", exact: true }).click();
  await expect(outerCountry).toHaveValue("South Korea");
  await outerCountry.selectOption("Singapore");
  await captureState(page, testInfo, "latest-country-and-currency");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page.locator(".company-save-notice")).toBeVisible();
  await page.getByRole("link", { name: "Back to dashboard" }).click(); await page.goBack();
  await expect(outerCountry).toHaveValue("Singapore");
  await expect(page.locator(".company-address-summary")).toContainText("서울시 긴 주소 초안");
});

test("audit G15: profile links use committed slugs through failures, discard, successful save and disabled profiles", async ({ page }, testInfo) => {
  await openSettings(page);
  const slug = page.getByRole("textbox", { name: "Profile URL slug" });
  const view = page.getByRole("link", { name: /View Profile/ });
  await slug.fill("unsaved-profile-draft");
  await expect(view).toHaveAttribute("href", "/u/studio-a");
  await captureState(page, testInfo, "unsaved-slug-saved-destination");
  await view.click(); await expect(page.locator("h1")).toHaveText("Studio A");
  await page.goBack(); await expect(slug).toHaveValue("studio-a");
  await slug.fill("discarded-profile"); await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(slug).toHaveValue("studio-a"); await expect(view).toHaveAttribute("href", "/u/studio-a");
  await slug.fill("saved-profile"); await companyScenario(page, "save-error");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.locator(".company-error")).toBeVisible();
  await expect(slug).toHaveValue("saved-profile"); await expect(view).toHaveAttribute("href", "/u/studio-a");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.locator(".company-save-notice")).toBeVisible();
  await expect(view).toHaveAttribute("href", "/u/saved-profile");
  await companyScenario(page, "normal");
  await view.click(); await expect(page.locator("h1")).toHaveText("Studio A");
  await page.goBack(); await expect(slug).toHaveValue("saved-profile");
  await page.getByRole("button", { name: "Disabled", exact: true }).click();
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.locator(".company-save-notice")).toBeVisible();
  await view.click(); await expect(page.locator("h1")).toHaveText("This public profile is unavailable");
});

// 기능 : 보호 경로에서 가입한 사용자의 온보딩 초안을 만든다.
async function beginProtectedSetup(page: Page) {
  await page.goto("/app/settings/company?from=recheck#details");
  await page.getByRole("link", { name: "Sign Up", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("recheck@example.test");
  await page.getByRole("textbox", { name: "Full Name" }).fill("Recheck Owner");
  await page.getByLabel("Password", { exact: true }).fill("SampleOnly123!");
  await page.getByRole("checkbox", { name: /I'm not a robot/ }).check();
  await page.getByRole("button", { name: "Create Free Account", exact: true }).click();
  await expect(page.locator("h1")).toContainText("Recheck Owner");
  await page.getByRole("combobox", { name: "What kind of work does your business do?" }).fill("Design");
  await page.getByRole("option", { name: "Design", exact: true }).click();
  await page.getByRole("textbox", { name: "What is your business called?" }).fill("Retained setup company");
}

// 기능 : 미수록 질문을 만들지 않고 기존 관찰 단계만 완료한다.
async function finishSetup(page: Page) {
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("combobox", { name: "What type of business do you have?" }).selectOption("Unregistered Business");
  await page.getByRole("combobox", { name: "What is your estimated yearly revenue?" }).selectOption("RM0 - RM50,000");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Continue to team" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
}

for (const resume of ["history", "dashboard"] as const) {
  test(`audit G13: pause and ${resume} resume distinguish restored history from a new destination`, async ({ page }, testInfo) => {
    await beginProtectedSetup(page); const original = page.url();
    await page.getByRole("link", { name: "Pause setup and return to landing" }).click();
    await expect(page.getByRole("heading", { name: "Run your entire business in one place" })).toBeVisible();
    if (resume === "history") {
      await page.goBack(); await expect(page).toHaveURL(original);
      await page.goForward(); await expect(page).toHaveURL("/");
      await page.goBack(); await expect(page).toHaveURL(original);
    } else {
      await page.getByRole("link", { name: "Go to dashboard", exact: true }).click();
      await expect(page).toHaveURL("/onboarding?returnTo=%2Fapp");
    }
    await expect(page.getByRole("textbox", { name: "What is your business called?" })).toHaveValue("Retained setup company");
    await captureState(page, testInfo, "setup-resume-" + resume);
    await finishSetup(page);
    await expect(page).toHaveURL(resume === "history" ? "/app/settings/company?from=recheck#details" : "/app");
    await expect(page.getByRole("heading", { name: resume === "history" ? "Company Settings" : "Add company details", exact: true })).toBeVisible();
  });
}
