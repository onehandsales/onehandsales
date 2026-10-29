import { expect, test, type Page } from "@playwright/test";
import { MENU_LIST_PATH, MENU_OBJECT_PATH, setupViewMenuScenario, VIEW_TYPES } from "./support/view-menu-scenario";

// 기능 : 반응형 화면에서 현재 표시된 도구만 선택합니다.
function toolbar(page: Page) { return page.locator('[data-testid="view-header-toolbar"]:visible'); }
// 기능 : 공통 보기 선택을 통해 실제 메뉴 조회 대상을 전환합니다.
async function selectView(page: Page, name: string) {
  const header = page.locator('[data-testid="workspace-view-header"]:visible');
  await header.getByRole("button", { name: "보기 선택", exact: true }).click();
  await header.getByRole("option").filter({ hasText: name }).click();
}

for (const type of VIEW_TYPES) {
  // 기능 : 11개 타입의 버튼 노출과 설정 역할을 실제 화면에서 검증합니다.
  test(`${type} exposes its own tools and settings`, async ({ page }, testInfo) => {
    const state = await setupViewMenuScenario(page, type);
    await page.goto(MENU_OBJECT_PATH);
    await expect(toolbar(page).getByRole("button", { name: "보기 설정", exact: true })).toBeEnabled();
    expect(state.requests).toEqual([]);
    await expect(toolbar(page).getByRole("button", { name: "필터", exact: true })).toHaveCount(type === "DASHBOARD" ? 0 : 1);
    await expect(toolbar(page).getByRole("button", { name: /^(정렬|목록 정렬)$/ })).toHaveCount(["CALENDAR", "CHART", "PIVOT", "DASHBOARD"].includes(type) ? 0 : 1);
    await expect(toolbar(page).getByRole("button", { name: /검색/ })).toHaveCount(["CHART", "PIVOT", "DASHBOARD"].includes(type) ? 0 : 1);
    await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
    const dialog = toolbar(page).getByRole("dialog");
    await expect(dialog.getByText("레이아웃", { exact: true })).toBeVisible();
    await expect(dialog).toHaveCSS("width", "264px");
    const markers = { TABLE: "표시 정보", KANBAN: "단계 기준", LIST: "제목 정보", GALLERY: "이미지", CALENDAR: "시작 날짜", TIMELINE: "막대 제목", GANTT: "진행률", CHART: "차트 종류", PIVOT: "행 기준", MAP: "위치 기준", DASHBOARD: "표시할 위젯" };
    await expect(dialog.getByText(markers[type], { exact: true })).toBeVisible();
    await expect(dialog.getByText("표시 정보", { exact: true })).toHaveCount(["CHART", "PIVOT", "DASHBOARD"].includes(type) ? 0 : 1);
    expect(state.requests).toEqual([{ view: "view-" + type.toLowerCase(), menu: "settings" }]);
    expect(state.writes).toEqual([]);
    if (["TABLE", "KANBAN", "DASHBOARD"].includes(type)) await page.screenshot({ path: testInfo.outputPath(type.toLowerCase() + "-settings.png") });
  });
}

// 기능 : 원래 체크박스 UX와 화면 크기 변경 후 임시 편집 유지·보기 전환 초기화를 확인합니다.
test("keeps checkbox drafts across close and responsive change, resets when switching views", async ({ page }) => {
  const state = await setupViewMenuScenario(page);
  await page.goto(MENU_OBJECT_PATH);
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  let dialog = toolbar(page).getByRole("dialog");
  await expect(dialog.getByLabel("계약명", { exact: true })).toBeChecked();
  await expect(dialog.getByLabel("금액", { exact: true })).not.toBeChecked();
  await dialog.getByLabel("금액", { exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(toolbar(page).getByRole("button", { name: "보기 설정", exact: true })).toBeFocused();
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  await expect(toolbar(page).getByLabel("금액", { exact: true })).toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  dialog = toolbar(page).getByRole("dialog");
  await expect(dialog.getByLabel("금액", { exact: true })).toBeChecked();
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(11);
  expect(box!.x + box!.width).toBeLessThanOrEqual(379);
  expect(state.requests).toHaveLength(1);
  await page.keyboard.press("Escape");
  await selectView(page, "KANBAN");
  await selectView(page, "TABLE");
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  await expect(toolbar(page).getByLabel("금액", { exact: true })).not.toBeChecked();
  expect(state.writes).toEqual([]);
});

// 기능 : 중첩 필터와 여러 정렬을 편집해도 저장 구조와 방향을 잃지 않습니다.
test("edits nested filters and sort priorities inside the original inputs", async ({ page }) => {
  const state = await setupViewMenuScenario(page);
  await page.goto(MENU_OBJECT_PATH);
  await toolbar(page).getByRole("button", { name: "필터", exact: true }).click();
  let dialog = toolbar(page).getByRole("dialog");
  await expect(dialog.getByLabel("조건 결합 방식").first()).toHaveValue("AND");
  await expect(dialog.getByLabel("조건 결합 방식").last()).toHaveValue("OR");
  await expect(dialog.getByLabel("조건 값 입력")).toHaveValue("500");
  await dialog.getByLabel("조건 값 입력").fill("750");
  await page.keyboard.press("Escape");
  await toolbar(page).getByRole("button", { name: "필터", exact: true }).click();
  await expect(toolbar(page).getByLabel("조건 값 입력")).toHaveValue("750");
  await page.keyboard.press("Escape");
  await toolbar(page).getByRole("button", { name: "정렬", exact: true }).click();
  dialog = toolbar(page).getByRole("dialog");
  await expect(dialog.getByLabel("정렬 방향").first()).toHaveValue("DESC");
  await expect(dialog.getByLabel("정렬 방향").last()).toHaveValue("ASC");
  await dialog.getByLabel("정렬 방향").first().selectOption("ASC");
  await dialog.getByRole("button", { name: "정렬 추가", exact: true }).click();
  await expect(dialog.getByLabel("정렬 방향")).toHaveCount(3);
  await expect(dialog).toHaveCSS("width", "340px");
  expect(state.requests.map(item => item.menu)).toEqual(["filters", "sorts"]);
  expect(state.writes).toEqual([]);
});

// 기능 : 조회 실패를 빈 설정으로 표시하지 않고 같은 메뉴에서 재시도합니다.
test("retries failed menus and keeps missing settings unset", async ({ page }) => {
  const state = await setupViewMenuScenario(page, "GALLERY");
  state.status = 500;
  state.transform = data => ({ ...data, configJson: null });
  await page.goto(MENU_OBJECT_PATH);
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  await expect(toolbar(page).getByRole("alert")).toContainText("설정을 불러오지 못했어요.");
  state.status = 200;
  await toolbar(page).getByRole("button", { name: "다시 시도" }).click();
  await expect(toolbar(page).getByRole("dialog")).toContainText("미설정");
  await expect(toolbar(page).getByText("보통", { exact: true })).toHaveCount(0);
  expect(state.requests).toHaveLength(2);
});

// 기능 : 단계의 숨김과 접힘, 위젯 제목과 제목 표시를 서로 독립적으로 편집합니다.
test("keeps stage visibility and folding separate and retains duplicate widget sources", async ({ page }) => {
  await setupViewMenuScenario(page, "KANBAN");
  await page.goto(MENU_LIST_PATH);
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  await toolbar(page).getByRole("button", { name: "단계 표시·접힘" }).click();
  await expect(toolbar(page).getByLabel("진행 중", { exact: true })).not.toBeChecked();
  await expect(toolbar(page).getByLabel("진행 중 접힘 상태")).toHaveValue("folded");
  await toolbar(page).getByLabel("진행 중", { exact: true }).check();
  await expect(toolbar(page).getByLabel("진행 중 접힘 상태")).toHaveValue("folded");
  await page.keyboard.press("Escape");
  await selectView(page, "DASHBOARD");
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  await expect(toolbar(page).getByLabel("숨긴 매출", { exact: true })).not.toBeChecked();
  await toolbar(page).getByRole("button", { name: "위젯 제목·표시 옵션" }).click();
  await expect(toolbar(page).getByLabel("월별 매출 위젯 제목")).toHaveValue("월별 매출");
  await expect(toolbar(page).getByLabel("제목 표시", { exact: true }).first()).not.toBeChecked();
  await toolbar(page).getByRole("button", { name: "뒤로" }).click();
  await toolbar(page).getByRole("button", { name: "원본 보기 확인" }).click();
  await expect(toolbar(page).getByText("원본 매출 · 차트", { exact: true })).toHaveCount(2);
});

// 기능 : 숨긴 역할의 체크를 반복해도 다른 역할·알 수 없는 저장값은 그대로 유지합니다.
test("keeps role visibility reversible and safely displays unknown configuration values", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const state = await setupViewMenuScenario(page, "GALLERY");
  state.transform = data => ({ ...data, configJson: { cardSize: "constructor" }, viewAttributeSettingDefinitions: data.viewAttributeSettingDefinitions.map(row => row.attributeDisplayRole === "TITLE" ? { ...row, isHidden: true } : row) });
  await page.goto(MENU_OBJECT_PATH);
  await toolbar(page).getByRole("button", { name: "보기 설정", exact: true }).click();
  const title = toolbar(page).getByLabel("제목 정보 · 이 정보 표시", { exact: true });
  await expect(title).not.toBeChecked();
  await title.check();
  await title.uncheck();
  await expect(toolbar(page).getByLabel("본문 미리보기 · 이 정보 표시", { exact: true })).toBeChecked();
  await expect(toolbar(page).getByText("constructor", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  expect(state.writes).toEqual([]);
});
