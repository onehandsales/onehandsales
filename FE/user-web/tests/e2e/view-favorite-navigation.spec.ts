import { expect, test, type Page } from "@playwright/test";
import { DATA_LIST_PATH, setupViewDataScenario } from "./support/view-data-scenario";

const base = "/app/workspaces/workspace-e2e-001/view-definitions/";
// 기능 : 두 반응형 shell 중 현재 보이는 헤더만 선택합니다.
function header(page: Page) { return page.locator('[data-testid="workspace-view-header"]:visible'); }
// 기능 : 현재 보이는 공통 본문에서만 기록과 보드 상태를 확인합니다.
function body(page: Page) { return page.locator('[data-testid="view-main-content"]:visible'); }
// 기능 : 기존 보기 드롭다운으로 다른 저장 View를 선택합니다.
async function choose(page: Page, name: string) {
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await header(page).getByRole("option", { name: new RegExp(name) }).click();
}

test("stars a nondefault List View and opens that exact View from the sidebar", async ({ page }, testInfo) => {
  const state = await setupViewDataScenario(page);
  await page.goto(DATA_LIST_PATH);
  await expect(body(page).getByRole("table")).toBeVisible();
  await choose(page, "단계별 진행");
  await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  await header(page).getByRole("button", { name: "현재 보기 즐겨찾기 등록", exact: true }).click();
  const favorite = page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("link", { name: "단계별 진행", exact: true });
  await expect(favorite).toBeVisible();
  state.requests.length = 0; state.headers.length = 0;
  await favorite.click();
  await expect(page).toHaveURL(base + "view-kanban");
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(3);
  await expect(header(page).getByRole("heading")).toHaveText("영업 파이프라인");
  await expect(header(page).getByRole("button", { name: "현재 보기 즐겨찾기 해제", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(favorite).toHaveAttribute("aria-current", "page");
  expect(state.headers).toHaveLength(1);
  expect(state.headers[0]!.pathname).toContain("/view-header/view-definitions/view-kanban");
  expect(state.requests.length).toBeGreaterThan(0);
  expect(state.requests.every(url => url.pathname.endsWith("/view-kanban/data") && url.searchParams.get("sourceType") === "LIST")).toBe(true);
  expect(state.menuReads).toEqual([]);
  expect(state.legacyReads).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("favorite-kanban.png") });
});

test("opens an Object favorite in the same spreadsheet and searches its records", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.favorites = ["TABLE"]; state.sources["view-table"] = "OBJECT";
  await page.goto("/app");
  await page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("link", { name: "전체 업무", exact: true }).click();
  await expect(body(page).getByRole("table")).toContainText("A회사");
  await expect(body(page).getByRole("row")).toHaveCount(3);
  await expect(header(page).getByRole("heading")).toHaveText("회사");
  const toolbar = page.locator('[data-testid="view-header-toolbar"]:visible');
  await toolbar.getByRole("button", { name: "검색", exact: true }).click();
  await toolbar.getByRole("searchbox").fill("A회사");
  await expect(body(page).getByRole("row")).toHaveCount(2);
  expect(state.requests.some(url => url.searchParams.get("q") === "A회사" && url.searchParams.get("sourceType") === "OBJECT")).toBe(true);
  expect(state.headers.every(url => url.pathname.endsWith("/view-definitions/view-table"))).toBe(true);
  expect(state.writes).toEqual([]);
});

test("preserves LIST selection on reload, dropdown selection and browser back", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.favorites = ["LIST"];
  await page.goto(base + "view-list");
  await expect(body(page).getByTestId("view-list")).toBeVisible();
  await page.reload();
  await expect(body(page).getByRole("listitem")).toHaveCount(3);
  await choose(page, "단계별 진행");
  await expect(page).toHaveURL(base + "view-kanban?sourceType=LIST");
  await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(base + "view-list");
  await expect(body(page).getByTestId("view-list")).toBeVisible();
  expect(state.requests.every(url => !url.pathname.includes("view-table"))).toBe(true);
  expect(state.headers.every(url => !url.searchParams.has("targetType"))).toBe(true);
});

test("asks for the affiliation of a dual-source View and persists the explicit choice", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.sources["view-kanban"] = "BOTH";
  await page.goto(base + "view-kanban");
  const choice = page.locator('[data-testid="view-target-choice"]:visible');
  await expect(choice.getByRole("link")).toHaveCount(2);
  expect(state.requests).toEqual([]);
  await choice.getByRole("link", { name: "업무목록 · 영업 파이프라인", exact: true }).click();
  await expect(page).toHaveURL(base + "view-kanban?sourceType=LIST");
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(3);
  await page.reload();
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(3);
  expect(state.requests.every(url => url.searchParams.get("sourceType") === "LIST")).toBe(true);
  expect(state.writes).toEqual([]);
});

test("keeps an unaffiliated View and recovers after a valid source is attached", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.sources["view-list"] = "NONE";
  await page.goto(base + "view-list");
  await expect(page.locator('[data-testid="workspace-object-list-page"]:visible').getByText("이 보기에 연결된 항목이 없어요.")).toBeVisible();
  expect(state.requests).toEqual([]);
  state.sources["view-list"] = "LIST";
  await page.locator('[data-testid="workspace-object-list-page"]:visible').getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(body(page).getByTestId("view-list")).toBeVisible();
});

test("does not fall back to a default View on 404 or a mismatched response", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.directError = 404;
  await page.goto(base + "view-kanban");
  await expect(page.locator('.app-page-header:visible').getByRole("alert")).toContainText("이 항목을 열 수 없어요.");
  expect(state.requests).toEqual([]);
  state.directError = 0;
  await page.locator('.app-page-header:visible').getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  state.mismatchedHeader = true; state.requests.length = 0;
  await page.reload();
  await expect(page.locator('.app-page-header:visible').getByRole("alert")).toContainText("상단 정보를 불러오지 못했어요.");
  expect(state.requests).toEqual([]);
  expect(state.headers.every(url => !url.searchParams.has("targetType"))).toBe(true);
});

test("ignores a delayed old favorite header after selecting another favorite", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.favorites = ["KANBAN", "LIST"]; state.delayedViews = ["view-kanban"];
  await page.goto("/app");
  const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
  const pending = page.waitForRequest(request => new URL(request.url()).pathname.endsWith("/view-header/view-definitions/view-kanban"));
  await navigation.getByRole("link", { name: "단계별 진행", exact: true }).click(); await pending;
  await navigation.getByRole("link", { name: "담당자별 업무", exact: true }).click();
  await expect(body(page).getByTestId("view-list")).toBeVisible();
  await page.waitForTimeout(800);
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("담당자별 업무");
  expect(state.requests.every(url => url.pathname.endsWith("/view-list/data"))).toBe(true);
});

test("shares the favorite View across mobile and desktop headers", async ({ page }, testInfo) => {
  const state = await setupViewDataScenario(page); state.favorites = ["KANBAN"];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "view-kanban");
  await expect(header(page)).toHaveCount(1);
  await expect(body(page).getByTestId("kanban-card")).toHaveCount(3);
  await expect(header(page).getByRole("button", { name: "현재 보기 즐겨찾기 해제", exact: true })).toHaveAttribute("aria-pressed", "true");
  const initialHeaderReads = state.headers.length;
  await page.screenshot({ path: testInfo.outputPath("favorite-mobile.png") });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(header(page)).toHaveCount(1);
  await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  expect(state.headers).toHaveLength(initialHeaderReads);
  expect(state.headers.every(url => url.pathname.endsWith("/view-definitions/view-kanban"))).toBe(true);
});

test("loads each existing menu only when opened from a favorite", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  await page.goto(base + "view-kanban"); await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  expect(state.menuReads).toEqual([]);
  const toolbar = page.locator('[data-testid="view-header-toolbar"]:visible');
  for (const [label, suffix] of [["필터", "filters"], ["정렬", "sorts"], ["보기 설정", "settings"]]) {
    await toolbar.getByRole("button", { name: label, exact: true }).click();
    await expect(toolbar.getByRole("dialog")).toContainText("설정은 현재 화면에서 미리보기로만 유지돼요.");
    await expect.poll(() => state.menuReads.filter(url => url.pathname.endsWith("/" + suffix)).length).toBe(1);
    await expect(toolbar.getByRole("dialog").getByRole("status")).toHaveCount(0);
    await expect(toolbar.getByRole("dialog").getByRole("alert")).toHaveCount(0);
    await page.keyboard.press("Escape");
  }
  expect(state.menuReads.every(url => url.pathname.includes("/view-definitions/view-kanban/"))).toBe(true);
  expect(state.writes).toEqual([]);
});

test("unfavorites an opened View without losing the active screen", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.favorites = ["KANBAN"];
  await page.goto(base + "view-kanban"); await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
  await expect(navigation.getByRole("link", { name: "단계별 진행", exact: true })).toBeVisible();
  await header(page).getByRole("button", { name: "현재 보기 즐겨찾기 해제", exact: true }).click();
  await expect(header(page).getByRole("button", { name: "현재 보기 즐겨찾기 등록", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(navigation.getByRole("link", { name: "단계별 진행", exact: true })).toHaveCount(0);
  await expect(body(page).getByTestId("view-kanban")).toBeVisible();
  expect(state.writes.map(write => write.method)).toEqual(["DELETE"]);
  expect(state.headers.every(url => url.pathname.endsWith("/view-definitions/view-kanban"))).toBe(true);
});

test("rejects a URL choosing an absent or invalid source before loading data", async ({ page }) => {
  const state = await setupViewDataScenario(page);
  for (const query of ["sourceType=OBJECT", "sourceType=UNKNOWN", "sourceType=LIST&sourceType=OBJECT"]) {
    await page.goto(base + "view-kanban?" + query);
    await expect(page.locator('.app-page-header:visible').getByRole("alert")).toContainText("이 항목을 열 수 없어요.");
  }
  expect(state.requests).toEqual([]);
});
