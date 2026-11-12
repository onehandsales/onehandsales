import { expect, test, type Page } from "@playwright/test";
import { DATA_OBJECT_PATH, setupViewDataScenario } from "./support/view-data-scenario";

// 기능 : 현재 화면의 컬럼 표시명을 임시 상태에 적용합니다.
async function label(page: Page, value: string) {
  const table = page.locator('[data-testid="view-main-content"]:visible').getByRole("table");
  await table.getByRole("columnheader").filter({ hasText: "회사명" }).getByRole("button").first().click();
  await page.getByRole("textbox", { name: "컬럼 표시명", exact: true }).fill(value);
  await page.getByRole("button", { name: "적용", exact: true }).click();
}
test("applies a column label locally, discards it, then saves and restores it after reload", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  await label(page, "고객사");
  const bar = page.locator('[data-testid="view-configuration-bar"]:visible');
  await expect(bar).toBeVisible(); expect(state.writes).toHaveLength(0);
  await expect.poll(() => state.previews.length).toBeGreaterThan(0);
  await bar.getByRole("button", { name: "변경 되돌리기" }).click();
  await expect(bar).not.toBeVisible();
  await label(page, "고객사");
  await bar.getByRole("button", { name: "보기 설정 저장" }).click();
  await expect(bar).toContainText("저장했어요");
  expect(state.writes).toHaveLength(1);
  expect(state.writes[0]?.path).toMatch(/\/configuration$/);
  await page.reload();
  await expect(page.locator('[data-testid="view-main-content"]:visible').getByRole("columnheader").filter({ hasText: "고객사" })).toBeVisible();
});
test("preserves edits after a save failure and resolves a conflict only on explicit latest selection", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH); await label(page, "고객사");
  const bar = page.locator('[data-testid="view-configuration-bar"]:visible'); state.configurationError = 500;
  await bar.getByRole("button", { name: "보기 설정 저장" }).click();
  await expect(bar.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("columnheader").filter({ hasText: "고객사" })).toBeVisible();
  state.configurationError = 409;
  await bar.getByRole("button", { name: "보기 설정 저장" }).click();
  await expect(bar.getByRole("button", { name: "내 변경을 버리고 최신 설정 사용" })).toBeVisible();
  await bar.getByRole("button", { name: "내 변경을 버리고 최신 설정 사용" }).click();
  await expect(bar).not.toBeVisible();
  await expect(page.getByRole("columnheader").filter({ hasText: "회사명" })).toBeVisible();
});

test("saves filters, sorting and display settings in one command", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  const toolbar = page.locator('[data-testid="view-header-toolbar"]:visible');
  await toolbar.getByRole("button", { name: "필터", exact: true }).click();
  await toolbar.getByRole("button", { name: "필터 추가", exact: true }).click();
  await page.keyboard.press("Escape");
  await toolbar.getByRole("button", { name: "정렬", exact: true }).click();
  await toolbar.getByRole("button", { name: "정렬 추가", exact: true }).click();
  await page.keyboard.press("Escape");
  await toolbar.getByRole("button", { name: "보기 설정", exact: true }).click();
  await toolbar.getByRole("combobox", { name: "표시 간격", exact: true }).selectOption("COMPACT");
  await page.keyboard.press("Escape");
  expect(state.writes).toHaveLength(0);
  await page.getByRole("button", { name: "보기 설정 저장", exact: true }).click();
  await expect(page.locator('[data-testid="view-configuration-bar"]:visible')).toContainText("저장했어요");
  expect(state.writes).toHaveLength(1);
  expect(state.configurationChanges["view-table"]).toMatchObject({ filters: { viewFilterConditionDefinitions: [expect.objectContaining({ comparisonOperator: "is_not_empty" })] }, sorts: { viewSortDefinitions: [expect.objectContaining({ sortDirection: "ASC" })] }, settings: { configJson: { rowDensity: "COMPACT" } } });
});
