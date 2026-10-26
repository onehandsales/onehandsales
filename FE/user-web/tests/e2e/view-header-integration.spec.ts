import { expect, test, type Page, type Route } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./support/user-web-api-mocks";

const OBJECT_PATH = "/app/workspaces/workspace-e2e-001/objects/object-definition-company";
const LIST_PATH = "/app/workspaces/workspace-e2e-001/lists/list-definition-pipeline";

// 기능 : 실제 화면 흐름에서 세 API의 호출 시점과 응답 차이를 제어합니다.
async function setupScenario(page: Page) {
  await setupUserWebApiMocks(page);
  await seedAuthenticatedSession(page);
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/attribute-definitions", route =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/record-definitions*", route =>
    route.fulfill({ json: { items: [], pageInfo: { hasNextPage: false, nextCursor: null } } }),
  );
  const state = {
    headerStatus: 200, listStatus: 200, noViews: false, initialFavorite: false,
    headerGate: null as Promise<void> | null, listGate: null as Promise<void> | null,
    headers: [] as URL[], lists: [] as URL[], writes: [] as string[],
    authorizations: [] as (string | undefined)[],
  };
  page.on("request", request => {
    if (new URL(request.url()).pathname.startsWith("/api/") &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) state.writes.push(request.url());
  });

  // 기능 : 브라우저의 기존 API origin에 맞는 안전한 테스트 JSON을 반환합니다.
  async function respond(route: Route, body: unknown, status = 200) {
    const headers = {
      "access-control-allow-origin": route.request().headers().origin ?? "http://127.0.0.1:5175",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
    } else {
      await route.fulfill({ json: body, status, headers });
    }
  }

  // 기능 : 사이드바 이름과 다른 헤더 이름·대상 ID를 반환해 응답 사용을 검증합니다.
  async function handleHeader(route: Route) {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const url = new URL(route.request().url());
    state.headers.push(url);
    state.authorizations.push(route.request().headers().authorization);
    if (url.searchParams.get("targetId") === "object-definition-company" && state.headerGate) await state.headerGate;
    if (state.headerStatus !== 200) return respond(route, { statusCode: state.headerStatus, error: "Unavailable" }, state.headerStatus);
    const type = url.searchParams.get("targetType");
    const person = url.searchParams.get("targetId")?.includes("person");
    const target = type === "OBJECT"
      ? { id: person ? "person-from-header" : "company-from-header", name: person ? "고객 서버 이름" : "회사 서버 이름", icon: "emoji:🏢" }
      : { id: "pipeline-from-header", name: "영업 파이프라인 서버", icon: "kanban" };
    return respond(route, {
      viewId: state.noViews ? null : type === "OBJECT" ? "view-all" : "view-list-all",
      viewName: state.noViews ? null : type === "OBJECT" ? "전체 회사" : "담당자별 업무",
      viewIcon: null, viewType: state.noViews ? null : "TABLE", isFavorite: state.initialFavorite,
      objectDefinition: type === "OBJECT" ? target : null,
      listDefinition: type === "LIST" ? target : null,
    });
  }

  // 기능 : 현재 선택 표시와 서버 순서를 유지하는 두 종류의 목록을 반환합니다.
  async function handleViews(route: Route) {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const url = new URL(route.request().url());
    state.lists.push(url);
    state.authorizations.push(route.request().headers().authorization);
    if (state.listGate) await state.listGate;
    if (state.listStatus !== 200) return respond(route, { statusCode: state.listStatus, error: "Unavailable" }, state.listStatus);
    const object = url.pathname.includes("/object-definitions/");
    const rows = object ? [
      { viewId: "view-all", viewName: "전체 회사", viewIcon: null, viewType: "TABLE" },
      { viewId: "view-seoul", viewName: "단계별 회사", viewIcon: null, viewType: "KANBAN" },
    ] : [
      { viewId: "view-list-all", viewName: "담당자별 업무", viewIcon: null, viewType: "TABLE" },
      { viewId: "view-monthly", viewName: "단계별 영업", viewIcon: null, viewType: "KANBAN" },
    ];
    return respond(route, { items: state.noViews ? [] : rows.map(row => ({
      ...row, isSelected: row.viewId === url.searchParams.get("viewId"),
    })) });
  }

  await page.route(/\/api\/users\/me\/workspaces\/[^/]+\/view-header(?:\?.*)?$/, handleHeader);
  await page.route(/\/api\/users\/me\/workspaces\/[^/]+\/(object|list)-definitions\/[^/]+\/view-definitions(?:\?.*)?$/, handleViews);
  return state;
}

// 기능 : 반응형 화면에서 현재 보이는 공통 헤더만 선택합니다.
function header(page: Page) {
  return page.locator('[data-testid="workspace-view-header"]:visible');
}

// 기능 : 빠른 대상 전환 테스트에 필요한 해제 가능한 요청 지연을 생성합니다.
function createGate() {
  let release = () => {};
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

test("loads an Object header first and its view list only when opened", async ({ page }, testInfo) => {
  const state = await setupScenario(page);
  await page.goto("/app");
  const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
  await navigation.getByRole("link", { name: "Company", exact: true }).click();
  await expect(header(page).getByRole("heading")).toHaveText("회사 서버 이름");
  expect(state.headers).toHaveLength(1);
  expect(state.headers[0]!.searchParams.get("targetType")).toBe("OBJECT");
  expect(state.headers[0]!.searchParams.get("targetId")).toBe("object-definition-company");
  expect(state.lists).toHaveLength(0);
  await expect(header(page).getByRole("img", { name: "즐겨찾기에 등록되지 않은 보기" })).toBeVisible();

  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  const menu = header(page).getByRole("dialog");
  await expect(menu.getByRole("option")).toHaveText(["전체 회사표", "단계별 회사칸반"]);
  expect(state.lists[0]!.pathname).toContain("/object-definitions/company-from-header/view-definitions");
  expect(state.lists[0]!.searchParams.get("viewId")).toBe("view-all");
  await expect(menu.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  await menu.getByRole("option", { name: /단계별 회사/ }).click();
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("단계별 회사");
  await expect(header(page).getByRole("img", { name: "즐겨찾기에 등록된 보기", exact: true })).toBeVisible();
  await expect(menu).not.toBeVisible();

  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await expect(menu.getByRole("option").last()).toHaveAttribute("aria-selected", "true");
  expect(state.lists.at(-1)!.searchParams.get("viewId")).toBe("view-seoul");
  const count = state.lists.length;
  await menu.getByRole("textbox", { name: "보기 검색" }).fill("전체");
  await expect(menu.getByRole("option")).toHaveCount(1);
  expect(state.lists).toHaveLength(count);
  await menu.getByRole("textbox", { name: "보기 검색" }).fill("찾을 수 없는 보기");
  await expect(menu).toContainText("일치하는 보기가 없어요.");
  await expect(menu.getByText("저장된 보기가 없어요.")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("object-header.png") });
  expect(state.authorizations.every(value => value === "Bearer e2e-user-web-access-token")).toBe(true);
  expect(state.writes).toEqual([]);
});

test("connects List navigation and calls only its own view-list API", async ({ page }) => {
  const state = await setupScenario(page);
  await page.goto("/app");
  const link = page.getByRole("link", { name: "영업 파이프라인", exact: true });
  await link.click();
  await expect(page).toHaveURL(new RegExp(LIST_PATH + "$"));
  await expect(link).toHaveAttribute("aria-current", "page");
  await expect(header(page).getByRole("heading")).toHaveText("영업 파이프라인 서버");
  expect(state.headers[0]!.searchParams.get("targetType")).toBe("LIST");
  expect(state.lists).toHaveLength(0);
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await expect(header(page).getByRole("option")).toHaveCount(2);
  expect(state.lists[0]!.pathname).toContain("/list-definitions/pipeline-from-header/view-definitions");
  await header(page).getByRole("option").last().click();
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("단계별 영업");
  await expect(header(page).getByRole("img", { name: "즐겨찾기에 등록된 보기", exact: true })).toBeVisible();
  expect(state.lists.every(url => !url.pathname.includes("/object-definitions/"))).toBe(true);
  expect(state.writes).toEqual([]);
});

test("keeps the target name and omits selection query when no views exist", async ({ page }) => {
  const state = await setupScenario(page);
  state.noViews = true;
  await page.goto(OBJECT_PATH);
  await expect(header(page).getByRole("heading")).toHaveText("회사 서버 이름");
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("보기 없음");
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await expect(header(page).getByRole("dialog")).toContainText("저장된 보기가 없어요.");
  expect(state.lists[0]!.searchParams.has("viewId")).toBe(false);
  await expect(header(page).getByRole("button", { name: "새 보기 만들기", exact: true })).toHaveCount(0);
  expect(state.writes).toEqual([]);
});

test("shows a retryable header error without requesting view lists", async ({ page }) => {
  const state = await setupScenario(page);
  state.headerStatus = 500;
  await page.goto(OBJECT_PATH);
  const alert = page.locator('.app-page-header:visible').getByRole("alert");
  await expect(alert).toContainText("상단 정보를 불러오지 못했어요.");
  expect(state.lists).toHaveLength(0);
  state.headerStatus = 200;
  await alert.getByRole("button", { name: "다시 시도" }).click();
  await expect(header(page).getByRole("heading")).toHaveText("회사 서버 이름");
});

test("distinguishes inaccessible targets from an empty view list", async ({ page }) => {
  const state = await setupScenario(page);
  state.headerStatus = 404;
  await page.goto(LIST_PATH);
  await expect(page.locator('.app-page-header:visible').getByRole("alert")).toContainText("이 항목을 열 수 없어요.");
  await expect(page.getByRole("button", { name: "보기 선택", exact: true })).toHaveCount(0);
  expect(state.lists).toHaveLength(0);
});

test("retries a failed dropdown without turning it into an empty state", async ({ page }) => {
  const state = await setupScenario(page);
  state.listStatus = 500;
  await page.goto(LIST_PATH);
  await expect(header(page).getByRole("heading")).toHaveText("영업 파이프라인 서버");
  const initialHeaderCount = state.headers.length;
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  const alert = header(page).getByRole("alert");
  await expect(alert).toContainText("보기를 불러오지 못했어요.");
  await expect(header(page).getByText("저장된 보기가 없어요.")).toHaveCount(0);
  state.listStatus = 200;
  await alert.getByRole("button", { name: "다시 시도" }).click();
  await expect(header(page).getByRole("option")).toHaveCount(2);
  expect(state.headers).toHaveLength(initialHeaderCount);
});

test("keeps newer target data when an older header request completes late", async ({ page }) => {
  const state = await setupScenario(page);
  const gate = createGate();
  state.headerGate = gate.promise;
  await page.goto("/app");
  const pending = page.waitForRequest(request => new URL(request.url()).searchParams.get("targetId") === "object-definition-company");
  await page.getByRole("link", { name: "Company", exact: true }).click();
  await pending;
  await expect(page.locator('.app-page-header:visible').getByRole("status")).toBeVisible();
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(header(page).getByRole("heading")).toHaveText("영업 파이프라인 서버");
  gate.release();
  await expect(header(page).getByRole("heading")).toHaveText("영업 파이프라인 서버");
  await expect(header(page).getByRole("heading", { name: "회사 서버 이름" })).toHaveCount(0);
  expect(state.lists).toHaveLength(0);
});

test("supports keyboard selection and shares selection across responsive headers", async ({ page }, testInfo) => {
  const state = await setupScenario(page);
  await page.goto(OBJECT_PATH);
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await expect(header(page).getByRole("option")).toHaveCount(2);
  await expect(header(page).getByRole("textbox", { name: "보기 검색" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("단계별 회사");
  for (const width of [1024, 390, 360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(header(page)).toHaveCount(1);
    await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("단계별 회사");
    const box = await header(page).boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  const dialog = header(page).getByRole("dialog");
  await expect(dialog.getByRole("option")).toHaveCount(2);
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  await page.screenshot({ path: testInfo.outputPath("mobile-header.png") });
  expect(state.writes).toEqual([]);
});

test("keeps initial favorite state authoritative and distinguishes unknown state after switching", async ({ page }) => {
  const state = await setupScenario(page);
  state.initialFavorite = true;
  await page.route("**/api/users/me/sidebar/workspaces/*/view-favorites", route =>
    route.fulfill({ status: 500, json: { error: "InternalServerError" } }),
  );
  await page.goto(OBJECT_PATH);
  await expect(header(page).getByRole("img", { name: "즐겨찾기에 등록된 보기", exact: true })).toBeVisible();
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await header(page).getByRole("option").last().click();
  await expect(header(page).getByRole("img", { name: "즐겨찾기 상태 미확인", exact: true })).toBeVisible();
  expect(state.writes).toEqual([]);
});

test("closes an old dropdown and isolates its late response after a target switch", async ({ page }) => {
  const state = await setupScenario(page);
  const gate = createGate();
  state.listGate = gate.promise;
  await page.goto(OBJECT_PATH);
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await expect(header(page).getByRole("status")).toHaveText("보기를 불러오고 있어요.");
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(header(page).getByRole("heading")).toHaveText("영업 파이프라인 서버");
  state.listGate = null;
  gate.release();
  await expect(header(page).getByRole("dialog")).toHaveCount(0);
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("담당자별 업무");
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await expect(header(page).getByRole("option")).toHaveText(["담당자별 업무표", "단계별 영업칸반"]);
  expect(state.lists.at(-1)!.pathname).toContain("/list-definitions/");
});
