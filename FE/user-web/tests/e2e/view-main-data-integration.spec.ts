import { expect, test, type Page } from "@playwright/test";
import { DATA_LIST_PATH, DATA_OBJECT_PATH, setupViewDataScenario } from "./support/view-data-scenario";

// 기능 : 현재 반응형 화면에서 보이는 본문만 검사합니다.
function body(page: Page) { return page.locator('[data-testid="view-main-content"]:visible'); }
// 기능 : 현재 헤더의 도구만 선택합니다.
function toolbar(page: Page) { return page.locator('[data-testid="view-header-toolbar"]:visible'); }
// 기능 : 실제 보기 메뉴를 사용해 선택 ID와 본문 타입을 전환합니다.
async function chooseView(page: Page, name: string) {
  const header = page.locator('[data-testid="workspace-view-header"]:visible');
  await header.getByRole("button", { name: "보기 선택", exact: true }).click();
  await header.getByRole("option", { name: new RegExp(name) }).click();
}

test("connects sidebar Object and List clicks to the shared saved-view body", async ({ page }, testInfo) => {
  const state = await setupViewDataScenario(page);
  await page.goto("/app");
  const nav = page.getByRole("navigation", { name: "Workspace navigation" });
  await nav.getByRole("link", { name: "Company", exact: true }).click();
  await expect(body(page).getByRole("table")).toBeVisible();
  await expect(body(page).getByRole("table")).toContainText("A회사");
  expect(state.requests.some(url => url.searchParams.get("sourceType") === "OBJECT")).toBe(true);
  expect(state.legacyReads).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("table-object.png") });
  await nav.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(body(page).getByRole("table")).toContainText("업무 0");
  await expect(body(page).getByRole("table")).toContainText("업무 1");
  await expect(body(page).getByRole("row")).toHaveCount(4);
  expect(state.requests.some(url => url.searchParams.get("sourceType") === "LIST")).toBe(true);
  expect(state.writes).toEqual([]);
});

test("switches TABLE KANBAN LIST and keeps header/sidebar context", async ({ page }, testInfo) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_LIST_PATH);
  await expect(body(page).getByRole("table")).toBeVisible();
  await chooseView(page, "단계별 진행");
  await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath("kanban.png") });
  await chooseView(page, "담당자별 업무");
  await expect(body(page).getByTestId("view-list")).toBeVisible();
  await expect(body(page).getByRole("listitem")).toHaveCount(3);
  await expect(body(page).getByRole("button", { name: /김영업/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "영업 파이프라인", exact: true })).toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: testInfo.outputPath("list.png") });
  expect(state.requests.map(url => url.pathname.split("/").at(-2))).toEqual(expect.arrayContaining(["view-table", "view-kanban", "view-list"]));
  expect(state.requests.every(url => url.searchParams.get("sourceType") === "LIST")).toBe(true);
  expect(state.writes).toEqual([]);
});

test("uses server search and resets query pages when switching views", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.pagination = true;
  await page.goto(DATA_OBJECT_PATH);
  await expect(body(page).getByRole("row")).toHaveCount(26);
  await body(page).getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(body(page).getByRole("row")).toHaveCount(28);
  await toolbar(page).getByRole("button", { name: "검색", exact: true }).click();
  await toolbar(page).getByRole("searchbox").fill("A회사");
  await expect(body(page).getByRole("row")).toHaveCount(2);
  const search = state.requests.find(url => url.searchParams.get("q") === "A회사");
  expect(search?.searchParams.has("cursor")).toBe(false);
  await chooseView(page, "담당자별 업무");
  await expect(body(page).getByRole("listitem")).toHaveCount(25);
  expect(state.requests.at(-1)?.searchParams.has("q")).toBe(false);
});

test("uses independent Kanban column cursors and loads folded columns on expand", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.pagination = true; state.folded = true;
  await page.goto(DATA_LIST_PATH); await chooseView(page, "단계별 진행");
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(25);
  expect(state.requests.filter(url => url.searchParams.get("part") === "GROUP_ITEMS")).toHaveLength(0);
  await body(page).getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(26);
  await body(page).getByRole("button", { name: "제안 중 펼치기", exact: true }).click();
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(27);
  const groups = state.requests.filter(url => url.searchParams.get("part") === "GROUP_ITEMS");
  expect(groups.some(url => url.searchParams.get("groupToken") === "token-0-1" && url.searchParams.get("cursor") === "stage-next")).toBe(true);
  expect(groups.some(url => url.searchParams.get("groupToken") === "token-1-1" && !url.searchParams.has("cursor"))).toBe(true);
  expect(state.writes).toEqual([]);
});

test("keeps loaded rows on next-page failure and restarts stale cursors", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.pagination = true; state.nextError = 409;
  await page.goto(DATA_OBJECT_PATH); await expect(body(page).getByRole("row")).toHaveCount(26);
  await body(page).getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(body(page).getByRole("alert")).toContainText("처음부터 다시");
  await expect(body(page).getByRole("row")).toHaveCount(26);
  state.nextError = 0;
  await body(page).getByRole("button", { name: "처음부터 다시 불러오기", exact: true }).click();
  await expect(body(page).getByRole("alert")).toHaveCount(0);
  expect(state.requests.at(-1)?.searchParams.has("cursor")).toBe(false);
});

test("separates empty, missing view, configuration guidance and retryable failures", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.mainError = 500;
  await page.goto(DATA_OBJECT_PATH);
  const section = page.locator('[data-testid="workspace-object-list-page"]:visible');
  await expect(section.getByRole("alert")).toContainText("기록을 불러오지 못했어요");
  state.mainError = 0; state.needsConfiguration = true;
  await section.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(section).toContainText("보기 설정을 확인");
  state.needsConfiguration = false; state.empty = true;
  await section.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(body(page).getByRole("table")).toBeVisible();
  await expect(body(page)).toContainText("아직 생성된 기록이 없어요");
  state.noView = true; await page.reload();
  await expect(section).toContainText("저장된 보기가 없어요");
});

test("preserves table resizing, column menus and existing direct Record cell edits", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  await expect(body(page).getByRole("table")).toBeVisible();
  await expect(body(page)).toContainText("9,007,199,254,740,992.0000000002");
  const handle = body(page).getByRole("button", { name: "회사명 폭 조절", exact: true });
  const bounds = (await handle.boundingBox())!;
  await page.mouse.move(bounds.x + 3, bounds.y + 12); await page.mouse.down(); await page.mouse.move(bounds.x + 65, bounds.y + 12); await page.mouse.up();
  await expect(body(page)).toContainText("열 표시 변경은 현재 화면의 미리보기");
  await body(page).getByRole("button", { name: "회사명 속성 메뉴 열기", exact: true }).click();
  await expect(body(page).getByRole("dialog", { name: "회사명", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await body(page).getByRole("button", { name: "회사명", exact: true }).filter({ hasText: "A회사" }).click();
  const editor = body(page).getByRole("textbox", { name: "회사명", exact: true });
  await editor.fill("변경된 회사"); await editor.press("Enter");
  await expect(body(page)).toContainText("변경된 회사");
  expect(state.writes).toEqual([expect.objectContaining({ method: "PATCH", path: expect.stringContaining("/record-definitions/record-0/record-attribute-values-definitions/name-record-0"), body: { value: "변경된 회사" } })]);
});

test("does not overwrite List body with a delayed Object response", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.delayObject = true;
  await page.goto(DATA_OBJECT_PATH);
  await expect.poll(() => state.requests.some(url => url.searchParams.get("sourceType") === "OBJECT")).toBe(true);
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(body(page).getByRole("table")).toContainText("업무 1");
  await page.waitForTimeout(700);
  await expect(body(page).getByRole("table")).toContainText("업무 1");
  await expect(body(page).getByRole("row")).toHaveCount(4);
});

test("keeps mobile search and horizontal table scrolling within the body", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  await expect(body(page).getByRole("table")).toBeVisible();
  await toolbar(page).getByRole("button", { name: "검색", exact: true }).click();
  await toolbar(page).getByRole("searchbox").fill("A회사");
  await expect(body(page).getByRole("row")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("table-mobile.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(body(page).getByRole("row")).toHaveCount(2);
  await toolbar(page).getByRole("button", { name: "검색", exact: true }).click();
  await expect(toolbar(page).getByRole("searchbox")).toHaveValue("A회사");
});

test("reuses Object record creation and leaves List creation unavailable", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  await expect(body(page).getByRole("row")).toHaveCount(3);
  await toolbar(page).getByRole("button", { name: "기록 추가", exact: true }).click();
  await expect(body(page).getByRole("row")).toHaveCount(4);
  expect(state.writes).toEqual([expect.objectContaining({ method: "POST", body: null, path: expect.stringContaining("/object-definitions/object-definition-company/record-definitions") })]);
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(toolbar(page).getByRole("button", { name: "기록 추가", exact: true })).toBeDisabled();
});

test("restarts MAIN when a Kanban column token becomes stale", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.pagination = true;
  await page.goto(DATA_LIST_PATH); await chooseView(page, "단계별 진행");
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(26);
  state.groupError = 409;
  await body(page).getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(body(page).getByRole("alert")).toContainText("처음부터 다시");
  state.groupError = 0; state.version++;
  await body(page).getByRole("button", { name: "처음부터 다시 불러오기", exact: true }).click();
  await expect(body(page).getByRole("alert")).toHaveCount(0);
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(26);
  await body(page).getByRole("button", { name: "더 보기", exact: true }).click();
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(27);
  expect(state.requests.at(-1)?.searchParams.get("groupToken")).toBe("token-0-2");
});

test("keeps column order and visibility changes in the current view preview", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  const first = body(page).getByRole("button", { name: "회사명 속성 메뉴 열기", exact: true });
  const second = body(page).getByRole("button", { name: "금액 속성 메뉴 열기", exact: true });
  const from = (await first.boundingBox())!, to = (await second.boundingBox())!;
  await page.mouse.move(from.x + 30, from.y + 15); await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + 15, { steps: 8 }); await page.mouse.up();
  const headings = body(page).getByRole("columnheader");
  await expect(headings.nth(1)).toContainText("금액");
  await first.click();
  await body(page).getByRole("button", { name: "숨기기", exact: true }).click();
  await expect(first).toHaveCount(0);
  await body(page).getByRole("button", { name: "초기화", exact: true }).click();
  await expect(first).toBeVisible();
  expect(state.writes).toEqual([]);
});

test("does not cancel a new List query when an old Record save completes late", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_OBJECT_PATH);
  await body(page).getByRole("button", { name: "회사명", exact: true }).filter({ hasText: "A회사" }).click();
  const editor = body(page).getByRole("textbox", { name: "회사명", exact: true });
  state.delayWrite = true; state.delayList = true;
  await editor.fill("저장 후 이동"); await editor.press("Enter");
  await expect.poll(() => state.writes.length).toBe(1);
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(body(page).getByRole("table")).toContainText("업무 1");
  await expect(body(page).getByRole("table")).toContainText("저장 후 이동");
  await expect(body(page).getByRole("row")).toHaveCount(4);
});
