import { test, expect, enterWorkspace, openEditor } from "./fixtures";

test("public, protected deep link, history, refresh and shared boundaries use no APIs", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("onehand.userWeb.accessToken", "non-secret-obsolete-preview-value"));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "OneHand CRM" })).toBeVisible();
  await page.goto("/app/items/sample-001");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await page.getByRole("button", { name: "Continue as Alex" }).click();
  await expect(page).toHaveURL(/\/app\/items\/sample-001$/);
  await expect(page.getByRole("heading", { name: "Design Resources" })).toBeVisible();
  await page.getByRole("link", { name: "Back to items" }).click();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Preview item" })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Workspace preview" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Choose a preview session" })).toBeVisible();
  await page.goto("/share/sample");
  await expect(page.getByRole("heading", { name: "Shared preview", exact: true })).toBeVisible();
  await page.goto("/share/missing");
  await expect(page.getByRole("heading", { name: "Shared preview unavailable" })).toBeVisible();
  await page.goto("/app/items/missing");
  await page.getByRole("button", { name: "Continue as Blair" }).click();
  await expect(page.getByText("This preview item could not be found.")).toBeVisible();
  await page.goto("/no-such-preview");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("same-ID edit propagates, cancel discards drafts, and refresh resets data", async ({ page }) => {
  await enterWorkspace(page);
  await openEditor(page);
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Cancelled draft");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Edit name" })).toBeFocused();
  await page.getByRole("button", { name: "Edit name" }).click();
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue("Design Resources");
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Saved once");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Saved once" })).toBeVisible();
  await expect(page.getByText("2024-02-06T09:00:01.000Z")).toBeVisible();
  await page.getByRole("link", { name: "Back to items" }).click();
  await expect(page.getByRole("link", { name: /Saved once View item/ })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Continue as Alex" }).click();
  await expect(page.getByRole("link", { name: /Design Resources View item/ })).toBeVisible();
});

test("query failure retries, empty and restricted states remain distinct", async ({ page }) => {
  await enterWorkspace(page);
  await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("read-error");
  await expect(page.getByText("Unable to load this preview.")).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("link", { name: /Design Resources View item/ })).toBeVisible();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("empty");
  await expect(page.getByRole("heading", { name: "No preview items" })).toBeVisible();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("denied");
  await expect(page.getByRole("heading", { name: "Access restricted" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("normal");
  await expect(page.getByRole("link", { name: /Design Resources View item/ })).toBeVisible();
});

test("failed save keeps input, IME Enter does not submit, retry saves once", async ({ page }) => {
  await enterWorkspace(page);
  await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("write-error");
  await openEditor(page);
  const input = page.getByRole("textbox", { name: "Name", exact: true });
  await input.fill("한글 조합 중");
  await input.dispatchEvent("compositionstart");
  await input.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
  await input.dispatchEvent("compositionend");
  await input.fill("입력 보존 후 재시도");
  // 기능 : 같은 이벤트 주기의 중복 제출이 두 번 저장되지 않는지 실제 폼으로 확인한다.
  await page.locator("#preview-item-form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.getByRole("alert")).toHaveText("Unable to save. Your changes are still here.");
  await expect(input).toHaveValue("입력 보존 후 재시도");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "입력 보존 후 재시도" })).toBeVisible();
  await expect(page.getByText("2024-02-06T09:00:01.000Z")).toBeVisible();
});

test("cancelled slow save, actor/workspace changes and reset isolate all state", async ({ page }) => {
  await enterWorkspace(page);
  await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("slow");
  await openEditor(page);
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Late write");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.getByRole("combobox", { name: "Session", exact: true }).selectOption("preview-b");
  await expect(page.getByRole("heading", { name: "Member sample" })).toBeVisible();
  await page.getByRole("combobox", { name: "Session", exact: true }).selectOption("preview-a");
  await expect(page.getByRole("heading", { name: "Design Resources" })).toBeVisible();
  await page.getByRole("combobox", { name: "Workspace", exact: true }).selectOption("studio-a-two");
  await expect(page.getByRole("heading", { name: "Second studio sample" })).toBeVisible();
  await page.getByRole("button", { name: "Reset preview" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("combobox", { name: "Scenario", exact: true })).toHaveValue("normal");
  await expect(page.getByRole("combobox", { name: "Session", exact: true })).toHaveValue("guest");
});

test("reference dialog traps focus, closes by keyboard and restores trigger", async ({ page }, testInfo) => {
  await page.goto("/components");
  await page.evaluate(() => document.fonts.ready);
  const trigger = page.getByRole("button", { name: "Add Client", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "New Client" })).toBeFocused();
  await expect(dialog).toHaveCSS("width", "460px");
  await expect(dialog.getByLabel("Company Name")).toHaveCSS("min-height", "40px");
  await page.screenshot({ path: testInfo.outputPath("reference-dialog.png") });
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    await expect.poll(() => page.evaluate(() => document.querySelector("dialog")?.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(10, 100);
  await expect(dialog).toHaveCount(0);
});

test("narrow widths, long Korean, zoom and dialog scrolling keep controls reachable", async ({ page }, testInfo) => {
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/components");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 500 });
  await enterWorkspace(page);
  await openEditor(page);
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("아주 긴 한글 제목으로 좁은 화면의 줄바꿈과 저장 버튼 접근을 확인합니다 ".repeat(6));
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Edit name" }).click();
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.evaluate(() => { document.documentElement.style.zoom = ""; });
  await page.screenshot({ path: testInfo.outputPath("narrow-long-text.png"), fullPage: true });
});
