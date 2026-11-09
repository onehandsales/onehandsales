import { expect, test, type Page } from "@playwright/test";
import { DATA_OBJECT_PATH, DATA_LIST_PATH, setupViewDataScenario } from "./support/view-data-scenario";

// 기능 : 현재 화면의 임시 속성 컬럼만 선택합니다.
function draft(page: Page) { return page.getByTestId("inline-attribute-column"); }
// 기능 : 실제 컬럼 추가 버튼으로 인라인 입력을 엽니다.
async function start(page: Page) {
  await page.getByRole("button", { name: "속성 추가", exact: true }).click();
  await expect(draft(page).getByRole("textbox", { name: "속성 이름" })).toBeFocused();
}

test("creates an empty object's column inline and restores it after reload", async ({ page }, info) => {
  const state = await setupViewDataScenario(page); state.empty = true;
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(draft(page).getByRole("combobox").locator("option")).toHaveCount(18);
  await draft(page).getByRole("combobox").selectOption("Currency");
  await expect(draft(page).locator("svg.lucide-banknote")).toBeVisible();
  await draft(page).getByRole("textbox").fill("매매가격");
  await page.screenshot({ path: info.outputPath("inline-attribute.png") });
  await draft(page).getByRole("textbox").press("Enter");
  await expect(draft(page)).toHaveCount(0);
  await expect(page.getByRole("columnheader").filter({ hasText: "매매가격" })).toBeVisible();
  expect(state.writes).toHaveLength(1);
  expect(state.writes[0]?.body).toEqual({ creationId: expect.any(String), attributeDefinitionName: "매매가격", attributeType: "Currency" });
  expect(state.added).toBe(0);
  await page.reload();
  await expect(page.getByRole("columnheader").filter({ hasText: "매매가격" })).toBeVisible();
  await expect(page.getByRole("columnheader").filter({ hasText: "매매가격" }).locator("svg.lucide-banknote")).toBeVisible();
});

test("keeps incomplete input, ignores IME Enter and cancels with Escape without writes", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("textbox").fill("주소");
  await draft(page).getByRole("textbox").press("Enter");
  await expect(draft(page)).toBeVisible(); expect(state.writes).toHaveLength(0);
  await draft(page).getByRole("combobox").selectOption("Location");
  await draft(page).getByRole("textbox").dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true });
  expect(state.writes).toHaveLength(0);
  await draft(page).getByRole("textbox").press("Escape");
  await expect(draft(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "속성 추가", exact: true })).toBeFocused();
  expect(state.writes).toHaveLength(0);
});

test("preserves failed input and retries the same ID without duplicate submission", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.columnError = 500; state.delayColumn = true;
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("combobox").selectOption("Text");
  await draft(page).getByRole("textbox").fill("주소");
  await draft(page).getByRole("textbox").press("Enter");
  await expect(draft(page).getByRole("button", { name: "저장", exact: true })).toBeDisabled();
  await expect(draft(page).getByRole("alert")).toContainText("다시 저장");
  await expect(draft(page).getByRole("textbox")).toHaveValue("주소");
  expect(state.writes).toHaveLength(1);
  state.columnError = 0;
  await draft(page).getByRole("button", { name: "저장", exact: true }).click();
  await expect(draft(page)).toHaveCount(0);
  expect(state.writes).toHaveLength(2);
  expect(state.writes[1]?.body).toEqual(state.writes[0]?.body);
  expect(state.columns).toHaveLength(1);
});

test("reuses a committed creation after losing its HTTP response", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.columnResponseLost = true;
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("combobox").selectOption("Number");
  await draft(page).getByRole("textbox").fill("층수");
  await draft(page).getByRole("textbox").press("Enter");
  await expect(draft(page).getByRole("alert")).toBeVisible();
  await draft(page).getByRole("button", { name: "저장", exact: true }).click();
  await expect(draft(page)).toHaveCount(0);
  expect(state.columns).toHaveLength(1);
  expect(state.writes[1]?.body).toEqual(state.writes[0]?.body);
});

test("saves complete input on outside click and shows a type-specific icon", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("combobox").selectOption("Date");
  await draft(page).getByRole("textbox").fill("계약일");
  await page.getByRole("columnheader").filter({ hasText: "회사명" }).click();
  await expect(draft(page)).toHaveCount(0);
  await expect(page.getByRole("columnheader").filter({ hasText: "계약일" }).locator("svg.lucide-calendar")).toBeVisible();
  expect(state.writes).toHaveLength(1);
});

test("does not apply a delayed Object creation to the List screen", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.delayColumn = true;
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("combobox").selectOption("Text");
  await draft(page).getByRole("textbox").fill("매물 설명");
  await draft(page).getByRole("textbox").press("Enter");
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(DATA_LIST_PATH));
  await expect(page.getByRole("table")).toContainText("업무 0");
  await expect(draft(page)).toHaveCount(0);
  await expect.poll(() => state.columns.length).toBe(1);
  await expect(page.getByRole("columnheader").filter({ hasText: "매물 설명" })).toHaveCount(0);
});

test("recovers a failed refresh without creating another attribute", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("combobox").selectOption("Text");
  await draft(page).getByRole("textbox").fill("주소");
  state.mainError = 500;
  await draft(page).getByRole("textbox").press("Enter");
  await expect(page.getByRole("alert")).toBeVisible();
  expect(state.columns).toHaveLength(1); expect(state.writes).toHaveLength(1);
  state.mainError = 0;
  await page.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(page.getByRole("columnheader").filter({ hasText: "주소" })).toBeVisible();
  expect(state.columns).toHaveLength(1); expect(state.writes).toHaveLength(1);
});

test("keeps the input and explains the View column limit", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.columnError = 409; state.columnErrorCode = "ViewColumnLimitExceeded";
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("combobox").selectOption("Text");
  await draft(page).getByRole("textbox").fill("주소");
  await draft(page).getByRole("textbox").press("Enter");
  await expect(draft(page).getByRole("alert")).toContainText("속성 수에 도달");
  await expect(draft(page).getByRole("textbox")).toHaveValue("주소");
  expect(state.columns).toHaveLength(0);
});

test("keeps English inline controls usable at a narrow viewport", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await setupViewDataScenario(page, "en");
  await page.goto(DATA_OBJECT_PATH);
  await page.getByRole("button", { name: "Add Property", exact: true }).click();
  await expect(draft(page).getByRole("textbox", { name: "Attribute name" })).toBeFocused();
  const type = draft(page).getByRole("combobox", { name: "Choose information type" });
  await expect(type.locator("option[value='Checkbox']")).toHaveText("Checkbox");
  await type.selectOption("Checkbox");
  await draft(page).getByRole("textbox").fill("Visited");
  const controls = await draft(page).locator("input, select, button").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width };
  }));
  for (const control of controls) { expect(control.width).toBeGreaterThan(15); expect(control.left).toBeGreaterThanOrEqual(0); expect(control.right).toBeLessThanOrEqual(390); }
  await page.screenshot({ path: info.outputPath("inline-attribute-mobile-en.png") });
  await draft(page).getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("columnheader").filter({ hasText: "Visited" })).toBeVisible();
  expect(state.columns).toHaveLength(1);
});
