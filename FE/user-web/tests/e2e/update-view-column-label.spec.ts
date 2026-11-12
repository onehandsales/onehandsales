import { expect, test, type Page } from "@playwright/test";
import { DATA_OBJECT_PATH, setupViewDataScenario } from "./support/view-data-scenario";

// 기능 : 실제 TABLE 헤더에서 표시명 편집기를 엽니다.
async function openLabel(page: Page, name = "회사명") {
  await page.getByRole("button", { name: `${name} 속성 메뉴 열기`, exact: true }).click();
  const input = page.getByRole("textbox", { name: "컬럼 표시명", exact: true });
  await expect(input).toBeFocused();
  return input;
}

test("saves one View label, survives reload, resets cursors and restores the original name", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.pagination = true;
  await page.goto(DATA_OBJECT_PATH);
  const table = page.locator('[data-testid="view-table"]:visible');
  await page.getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(table.getByRole("row")).toHaveCount(28);
  const input = await openLabel(page);
  await input.fill(" 영업 고객 ");
  const reads = state.requests.length;
  await input.press("Enter");
  expect(state.writes).toHaveLength(0);
  await page.getByRole("button", { name: "보기 설정 저장", exact: true }).click();
  await expect(page.getByRole("button", { name: "영업 고객 속성 메뉴 열기", exact: true })).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(26);
  expect(state.requests.slice(reads).every(url => !url.searchParams.has("cursor"))).toBe(true);
  expect(state.writes).toEqual([expect.objectContaining({ method: "PATCH", path: expect.stringContaining("/view-definitions/view-table/configuration"), body: expect.objectContaining({ changes: expect.objectContaining({ settings: expect.any(Object) }) }) })]);
  await expect(table).toContainText("A회사");
  await page.reload();
  await openLabel(page, "영업 고객");
  await page.getByRole("button", { name: "원본 이름으로 되돌리기", exact: true }).click();
  await page.getByRole("button", { name: "보기 설정 저장", exact: true }).click();
  await expect(page.getByRole("button", { name: "회사명 속성 메뉴 열기", exact: true })).toBeVisible();
  await expect.poll(() => state.columnLabels["view-table:title"]).toBeNull();
  expect(state.titles).toEqual({});
});

test("retains a failed draft and prevents duplicate submissions while saving", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.configurationError = 500;
  await page.goto(DATA_OBJECT_PATH);
  const input = await openLabel(page);
  await input.fill("예상 매출"); await input.press("Enter");
  const save = page.getByRole("button", { name: "보기 설정 저장", exact: true });
  await save.click();
  await expect(page.getByRole("alert")).toContainText("저장하지 못했어요");
  await expect(page.getByRole("button", { name: "예상 매출 속성 메뉴 열기", exact: true })).toBeVisible();
  state.configurationError = 0; state.delayLabel = true;
  await save.click();
  await expect(page.getByRole("button", { name: "저장 중", exact: true })).toBeDisabled();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-testid="view-configuration-bar"]:visible')).toContainText("저장했어요");
  await expect(page.getByRole("button", { name: "예상 매출 속성 메뉴 열기", exact: true })).toBeVisible();
  expect(state.writes).toHaveLength(2);
});

test("retries only the read after a committed label encounters a refresh failure", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  const input = await openLabel(page);
  await input.fill("저장된 이름"); state.mainError = 500;
  await input.press("Enter");
  await page.getByRole("button", { name: "보기 설정 저장", exact: true }).click();
  await expect(page.locator('[data-testid="view-configuration-bar"]:visible')).toContainText("저장했어요");
  await expect(page.getByRole("alert")).toBeVisible();
  expect(state.writes).toHaveLength(1);
  state.mainError = 0;
  await page.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(page.getByRole("button", { name: "저장된 이름 속성 메뉴 열기", exact: true })).toBeVisible();
  expect(state.writes).toHaveLength(1);
});

test("cancels without writing and protects Korean composition on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  let input = await openLabel(page);
  await input.fill("취소할 이름"); await input.press("Escape");
  expect(state.writes).toHaveLength(0);
  input = await openLabel(page);
  await input.fill("새 표시명");
  await input.dispatchEvent("compositionstart"); await input.press("Enter");
  await expect(input).toBeVisible(); expect(state.writes).toHaveLength(0);
  await input.dispatchEvent("compositionend"); await input.press("Enter");
  await expect(page.getByRole("button", { name: "새 표시명 속성 메뉴 열기", exact: true })).toBeVisible();
  expect(state.writes).toHaveLength(0);
  await page.getByRole("button", { name: "보기 설정 저장", exact: true }).click();
  await expect(page.locator('[data-testid="view-configuration-bar"]:visible')).toContainText("저장했어요");
  expect(state.writes).toHaveLength(1);
});

test("does not apply a late TABLE save to the selected LIST view", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.delayLabel = true;
  await page.goto(DATA_OBJECT_PATH);
  const input = await openLabel(page); await input.fill("표 전용 이름"); await input.press("Enter");
  await page.getByRole("button", { name: "보기 설정 저장", exact: true }).click();
  const header = page.locator('[data-testid="workspace-view-header"]:visible');
  await header.getByRole("button", { name: "보기 선택", exact: true }).click();
  await header.getByRole("option", { name: /담당자별 업무/ }).click();
  await expect(page.locator('[data-testid="view-list"]:visible')).toBeVisible();
  await expect.poll(() => state.columnLabels["view-table:title"]).toBe("표 전용 이름");
  await expect(page.locator('[data-testid="view-list"]:visible')).not.toContainText("표 전용 이름");
  expect(state.columnLabels["view-list:title"]).toBeUndefined();
  expect(state.writes).toHaveLength(1);
});
