import { expect, test, type Page } from "@playwright/test";
import { DATA_OBJECT_PATH, DATA_LIST_PATH, setupViewDataScenario } from "./support/view-data-scenario";

// 기능 : 헤더 초안과 Portal 팝오버를 각각 선택합니다.
function draft(page: Page) { return page.getByTestId("inline-attribute-column"); }
function types(page: Page) { return page.getByTestId("attribute-type-popover"); }
// 기능 : 실제 컬럼 추가 버튼으로 이름 입력과 유형 목록을 엽니다.
async function start(page: Page) {
  await page.getByRole("button", { name: "컬럼 추가", exact: true }).click();
  await expect(draft(page).getByRole("textbox", { name: "속성 이름" })).toBeFocused();
  await expect(types(page)).toBeVisible();
  await expect(types(page)).toHaveAccessibleName("유형 선택");
  await expect(types(page).getByRole("searchbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "컬럼 추가", exact: true })).toHaveCount(0);
}
// 기능 : 유형을 먼저 고르면 저장 없이 이름 작성을 이어갑니다.
async function chooseType(page: Page, label: string) {
  await types(page).getByRole("option", { name: label, exact: true }).click();
}

// 기능 : 제목 옆 돋보기로 검색창을 표시하고 입력 포커스를 확인합니다.
async function openTypeSearch(page: Page) {
  const toggle = types(page).getByRole("button", { name: /^(유형 검색|Search types)$/ });
  await toggle.click();
  await expect(types(page).getByRole("searchbox")).toBeFocused();
  const buttonBounds = await toggle.boundingBox();
  const searchBounds = await types(page).getByRole("searchbox").boundingBox();
  expect(searchBounds!.x).toBeGreaterThanOrEqual(buttonBounds!.x + buttonBounds!.width);
  expect(searchBounds!.y + searchBounds!.height / 2).toBeCloseTo(buttonBounds!.y + buttonBounds!.height / 2, 0);
}

test("creates an empty object's column by name then type and restores it after reload", async ({ page }, info) => {
  const state = await setupViewDataScenario(page); state.empty = true;
  await page.goto(DATA_OBJECT_PATH);
  await expect(page.getByRole("button", { name: "컬럼 추가", exact: true })).toBeVisible();
  const addAreaBounds = await page.getByRole("columnheader").last().boundingBox();
  const headerCount = await page.getByRole("columnheader").count();
  const cellCount = await page.getByRole("cell").count();
  await start(page);
  await expect(page.getByRole("columnheader")).toHaveCount(headerCount);
  await expect(page.getByRole("cell")).toHaveCount(cellCount);
  await expect(draft(page).getByPlaceholder("컬럼명을 작성해주세요.")).toBeFocused();
  await expect(draft(page).locator("select")).toHaveCount(0);
  await expect(draft(page).getByRole("button", { name: /저장|취소/ })).toHaveCount(0);
  await expect(types(page).getByRole("option")).toHaveCount(17);
  expect(await types(page).evaluate(element => element.parentElement === document.body)).toBe(true);
  const headerBounds = await draft(page).boundingBox();
  const popupBounds = await types(page).boundingBox();
  expect(headerBounds!.width).toBe(220);
  expect(headerBounds!.x).toBe(addAreaBounds!.x);
  expect(popupBounds!.y).toBeGreaterThanOrEqual(headerBounds!.y + headerBounds!.height);
  expect(popupBounds!.x).toBe(headerBounds!.x);
  await draft(page).getByRole("textbox").fill("매매가격");
  await page.screenshot({ path: info.outputPath("inline-attribute.png") });
  await chooseType(page, "금액");
  await expect(draft(page)).toHaveCount(0);
  await expect(page.getByRole("columnheader").filter({ hasText: "매매가격" })).toBeVisible();
  await expect(page.getByRole("button", { name: "컬럼 추가", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader")).toHaveCount(headerCount + 1);
  expect(state.writes).toHaveLength(1);
  expect(state.writes[0]?.body).toEqual({ creationId: expect.any(String), attributeDefinitionName: "매매가격", attributeType: "Currency" });
  expect(state.added).toBe(0);
  await page.reload();
  await expect(page.getByRole("columnheader").filter({ hasText: "매매가격" }).locator("svg.lucide-banknote")).toBeVisible();
});

test("chooses a type first, ignores IME Enter and cancels with Escape without writes", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await chooseType(page, "위치·주소");
  await expect(types(page)).toHaveCount(0);
  await expect(draft(page).getByRole("textbox")).toBeFocused();
  await expect(draft(page).locator("svg.lucide-map-pin")).toBeVisible();
  await draft(page).getByRole("textbox").fill("주소");
  await draft(page).getByRole("textbox").dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true });
  expect(state.writes).toHaveLength(0);
  await draft(page).getByRole("textbox").press("Escape");
  await expect(draft(page)).toHaveCount(0);
  await expect(types(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "컬럼 추가", exact: true })).toBeFocused();
  expect(state.writes).toHaveLength(0);
});

test("cancels unnamed drafts on outside click and restores the original add area without writes", async ({ page }, info) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  const add = page.getByRole("button", { name: "컬럼 추가", exact: true });
  await expect(add).toBeVisible();
  const originalBounds = await add.boundingBox();
  const headerCount = await page.getByRole("columnheader").count();
  const outside = page.getByRole("checkbox", { name: "전체 선택", exact: true });

  for (const scenario of ["empty", "type-only", "cleared"] as const) {
    await start(page);
    if (scenario === "empty") await page.screenshot({ path: info.outputPath("empty-name-editor.png") });
    // 1. 검색창과 유형 목록은 같은 작성 영역이므로 빈 이름이어도 닫히지 않는다.
    await openTypeSearch(page);
    await types(page).getByRole("searchbox").fill("텍스트");
    await expect(draft(page)).toBeVisible();
    if (scenario === "empty") {
      await expect(types(page).getByRole("option")).toHaveCount(1);
      await types(page).getByRole("button", { name: "유형 검색", exact: true }).click();
      await expect(types(page).getByRole("searchbox")).toHaveCount(0);
      await expect(types(page).getByRole("option")).toHaveCount(17);
      await openTypeSearch(page);
      await expect(types(page).getByRole("searchbox")).toHaveValue("");
      await page.screenshot({ path: info.outputPath("type-search-open.png") });
    }
    if (scenario === "type-only") {
      await chooseType(page, "텍스트");
      await draft(page).getByRole("textbox").fill("   ");
    }
    if (scenario === "cleared") {
      await draft(page).getByRole("textbox").fill("임시 이름");
      await draft(page).getByRole("textbox").clear();
    }
    await outside.click();
    await expect(draft(page)).toHaveCount(0);
    await expect(types(page)).toHaveCount(0);
    await expect(add).toBeVisible();
    await expect(outside).toBeFocused();
    await expect(page.getByRole("columnheader")).toHaveCount(headerCount);
    expect((await add.boundingBox())!.x).toBe(originalBounds!.x);
    expect(state.writes).toHaveLength(0);
    expect(state.columns).toHaveLength(0);
  }
  await page.screenshot({ path: info.outputPath("empty-name-restored.png") });
});

test("keeps named incomplete drafts on outside click and creates with searchable keyboard selection", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await draft(page).getByRole("textbox").fill("예상 금액");
  await page.getByRole("columnheader").filter({ hasText: "회사명" }).click();
  await expect(types(page)).toHaveCount(0);
  await expect(draft(page).getByRole("textbox")).toHaveValue("예상 금액");
  expect(state.writes).toHaveLength(0);
  await draft(page).getByRole("textbox").click();
  await draft(page).getByRole("textbox").press("Enter");
  await expect(types(page).getByRole("option").first()).toBeFocused();
  await openTypeSearch(page);
  await types(page).getByRole("searchbox").fill("없는 유형");
  await expect(types(page).getByRole("status")).toHaveText("일치하는 유형이 없어요.");
  await types(page).getByRole("searchbox").fill("금액");
  await expect(types(page).getByRole("option")).toHaveCount(1);
  expect(state.writes).toHaveLength(0);
  await types(page).getByRole("searchbox").press("ArrowDown");
  await expect(types(page).getByRole("option", { name: "금액" })).toBeFocused();
  await types(page).getByRole("option", { name: "금액" }).press("Enter");
  await expect(draft(page)).toHaveCount(0);
  expect(state.columns).toEqual([expect.objectContaining({ name: "예상 금액", type: "Currency" })]);
  expect(state.writes).toHaveLength(1);
});

test("treats the portaled picker as part of the editor and saves the newly selected type", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await chooseType(page, "텍스트");
  await draft(page).getByRole("textbox").fill("예상 금액");
  await draft(page).getByRole("button", { name: "정보 유형 선택" }).click();
  await openTypeSearch(page);
  await types(page).getByRole("searchbox").fill("금액");
  expect(state.writes).toHaveLength(0);
  await chooseType(page, "금액");
  await expect(draft(page)).toHaveCount(0);
  expect(state.writes).toHaveLength(1);
  expect(state.columns[0]?.type).toBe("Currency");
});

test("preserves failed input and retries the same ID without duplicate submission", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.columnError = 500; state.delayColumn = true;
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await chooseType(page, "텍스트");
  await draft(page).getByRole("textbox").fill("주소");
  await draft(page).getByRole("textbox").press("Enter");
  await expect(draft(page).getByRole("textbox")).toBeDisabled();
  await expect(types(page).getByRole("alert")).toContainText("다시 시도");
  await expect(draft(page).getByRole("textbox")).toHaveValue("주소");
  expect(state.writes).toHaveLength(1);
  // 1. 실패 뒤 바깥 클릭은 자동 POST를 반복하지 않는다.
  await page.getByRole("columnheader").filter({ hasText: "회사명" }).click();
  await expect(types(page)).toHaveCount(0);
  expect(state.writes).toHaveLength(1);
  state.columnError = 0;
  await draft(page).getByRole("textbox").click();
  await types(page).getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(draft(page)).toHaveCount(0);
  expect(state.writes).toHaveLength(2);
  expect(state.writes[1]?.body).toEqual(state.writes[0]?.body);
  expect(state.columns).toHaveLength(1);
});

test("reuses a committed creation after losing its HTTP response", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.columnResponseLost = true;
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await chooseType(page, "숫자");
  await draft(page).getByRole("textbox").fill("층수");
  await draft(page).getByRole("textbox").press("Enter");
  await expect(types(page).getByRole("alert")).toBeVisible();
  await types(page).getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(draft(page)).toHaveCount(0);
  expect(state.columns).toHaveLength(1);
  expect(state.writes[1]?.body).toEqual(state.writes[0]?.body);
});

test("saves complete input on outside click and shows a type-specific icon", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await chooseType(page, "날짜");
  await draft(page).getByRole("textbox").fill("계약일");
  await page.getByRole("columnheader").filter({ hasText: "회사명" }).click();
  await expect(draft(page)).toHaveCount(0);
  await expect(page.getByRole("columnheader").filter({ hasText: "계약일" }).locator("svg.lucide-calendar")).toBeVisible();
  expect(state.writes).toHaveLength(1);
});

test("does not apply a delayed Object creation to the List screen", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.delayColumn = true;
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await chooseType(page, "텍스트");
  await draft(page).getByRole("textbox").fill("매물 설명");
  await draft(page).getByRole("textbox").press("Enter");
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(DATA_LIST_PATH));
  await expect(page.getByRole("table")).toContainText("업무 0");
  await expect(draft(page)).toHaveCount(0);
  await expect(types(page)).toHaveCount(0);
  await expect.poll(() => state.columns.length).toBe(1);
  await expect(page.getByRole("columnheader").filter({ hasText: "매물 설명" })).toHaveCount(0);
});

test("recovers a failed refresh without creating another attribute", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await start(page);
  await chooseType(page, "텍스트");
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
  await chooseType(page, "텍스트");
  await draft(page).getByRole("textbox").fill("주소");
  await draft(page).getByRole("textbox").press("Enter");
  await expect(types(page).getByRole("alert")).toContainText("속성 수에 도달");
  await expect(draft(page).getByRole("textbox")).toHaveValue("주소");
  expect(state.columns).toHaveLength(0);
});

test("keeps English two-column types and the editor inside a narrow viewport", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await setupViewDataScenario(page, "en");
  await page.goto(DATA_OBJECT_PATH);
  await page.getByRole("button", { name: "Add column", exact: true }).click();
  await expect(draft(page).getByPlaceholder("Enter a column name.")).toBeFocused();
  await expect(types(page)).toHaveAccessibleName("Choose type");
  await expect(types(page).getByRole("searchbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add column", exact: true })).toHaveCount(0);
  expect((await draft(page).boundingBox())!.width).toBe(220);
  await expect(types(page).getByRole("option")).toHaveCount(17);
  await draft(page).getByRole("textbox").fill("Visited");
  const panelBounds = await types(page).boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(panelBounds!.x).toBeGreaterThanOrEqual(8);
  expect(panelBounds!.x + panelBounds!.width).toBeLessThanOrEqual(382);
  const first = await types(page).getByRole("option").nth(0).boundingBox();
  const second = await types(page).getByRole("option").nth(1).boundingBox();
  expect(first!.y).toBe(second!.y);
  expect(second!.x).toBeGreaterThan(first!.x);
  const controls = await draft(page).locator("input, button").evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width };
  }));
  for (const control of controls) { expect(control.width).toBeGreaterThan(15); expect(control.left).toBeGreaterThanOrEqual(0); expect(control.right).toBeLessThanOrEqual(390); }
  await page.screenshot({ path: info.outputPath("inline-attribute-mobile-en.png") });
  // 1. 검색창 조작도 저장을 유발하지 않고, 선택 시 한 번만 저장한다.
  await openTypeSearch(page);
  await page.screenshot({ path: info.outputPath("inline-attribute-mobile-search-en.png") });
  await types(page).getByRole("searchbox").fill("checkbox");
  expect(state.writes).toHaveLength(0);
  await chooseType(page, "Checkbox");
  await expect(page.getByRole("columnheader").filter({ hasText: "Visited" })).toBeVisible();
  expect(state.writes).toHaveLength(1);
});
