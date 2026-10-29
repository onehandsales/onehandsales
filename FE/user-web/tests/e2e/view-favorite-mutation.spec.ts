import { expect, test, type Page, type Route } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./support/user-web-api-mocks";

const WORKSPACE = "workspace-e2e-001", OTHER_WORKSPACE = "workspace-e2e-002";
const OBJECT_PATH = `/app/workspaces/${WORKSPACE}/objects/object-definition-company`;
const LIST_PATH = `/app/workspaces/${WORKSPACE}/lists/list-definition-pipeline`;
const ADD = "현재 보기 즐겨찾기 등록", REMOVE = "현재 보기 즐겨찾기 해제";
type Favorite = { id: string; viewDefinitionId: string; name: string; icon: string | null };

// 기능 : 실제 헤더·캐시·사이드바에서 개인 즐겨찾기 서버 상태를 제어합니다.
async function setupScenario(page: Page) {
  await setupUserWebApiMocks(page, { store: { createdWorkspace: { id: OTHER_WORKSPACE, name: "두 번째 작업 공간", kind: "PERSONAL" } } });
  await seedAuthenticatedSession(page);
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/attribute-definitions", route => route.fulfill({ json: [] }));
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/record-definitions*", route => route.fulfill({ json: { items: [], pageInfo: { hasNextPage: false, nextCursor: null } } }));
  const state = {
    noViews: false, favoriteReadStatus: 200, writeStatus: 200,
    writeStatuses: [] as number[], commitBeforeFailure: false,
    gate: null as Promise<void> | null,
    writes: [] as { method: string; workspaceId: string; viewDefinitionId: string; body: string | null; authorization: string | undefined; status: number }[],
    headerReads: [] as string[], favoriteReads: [] as string[],
    favorites: new Map<string, Favorite[]>([
      [WORKSPACE, [{ id: "keep-first", viewDefinitionId: "keep-view", name: "먼저 등록한 보기", icon: null }]],
      [OTHER_WORKSPACE, [{ id: "other", viewDefinitionId: "other-view", name: "다른 공간 보기", icon: null }]],
    ]),
  };
  const names: Record<string, string> = { "view-all": "전체 회사", "view-seoul": "단계별 회사", "view-pipeline": "전체 영업", "view-stage": "단계별 영업" };

  // 기능 : 인증이 유지된 테스트 API에만 브라우저 origin의 JSON·preflight를 반환합니다.
  async function respond(route: Route, body: unknown, status = 200) {
    const headers = {
      "access-control-allow-origin": route.request().headers().origin ?? "http://127.0.0.1:5175",
      "access-control-allow-credentials": "true", "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
      "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id",
    };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    return route.fulfill({ json: body, status, headers });
  }

  // 기능 : 초기 보기 상태는 같은 Workspace의 개인 즐겨찾기 원장으로 조회합니다.
  async function handleHeader(route: Route) {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const url = new URL(route.request().url()), workspaceId = url.pathname.split("/")[5]!;
    state.headerReads.push(workspaceId);
    const object = url.searchParams.get("targetType") === "OBJECT";
    const viewDefinitionId = object ? "view-all" : "view-pipeline";
    const target = { id: url.searchParams.get("targetId"), name: object ? "회사" : "영업 파이프라인", icon: null };
    return respond(route, {
      viewId: state.noViews ? null : viewDefinitionId, viewName: state.noViews ? null : names[viewDefinitionId], viewIcon: null,
      viewType: state.noViews ? null : "TABLE", isFavorite: state.favorites.get(workspaceId)?.some(row => row.viewDefinitionId === viewDefinitionId) ?? false,
      objectDefinition: object ? target : null, listDefinition: object ? null : target,
    });
  }

  // 기능 : 보기 선택은 원래 종류별 API와 현재 선택 ID를 사용합니다.
  async function handleViews(route: Route) {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const url = new URL(route.request().url());
    const ids = url.pathname.includes("/object-definitions/") ? ["view-all", "view-seoul"] : ["view-pipeline", "view-stage"];
    return respond(route, { items: state.noViews ? [] : ids.map((viewDefinitionId, index) => ({ viewDefinitionId, viewName: names[viewDefinitionId], viewIcon: null, viewType: index ? "KANBAN" : "TABLE", isSelected: url.searchParams.get("viewDefinitionId") === viewDefinitionId })) });
  }

  // 기능 : 서버 순서·식별자를 보존한 개인 즐겨찾기 목록을 재조회합니다.
  async function handleFavorites(route: Route) {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const workspaceId = new URL(route.request().url()).pathname.split("/")[6]!;
    state.favoriteReads.push(workspaceId);
    return respond(route, state.favoriteReadStatus === 200 ? state.favorites.get(workspaceId) ?? [] : { error: "private read failure" }, state.favoriteReadStatus);
  }

  // 기능 : 실제 API 계약의 신규·재요청·삭제·실패와 지연 응답을 재현합니다.
  async function handleMutation(route: Route) {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const request = route.request(), parts = new URL(request.url()).pathname.split("/");
    const workspaceId = parts[5]!, viewDefinitionId = parts[8]!, method = request.method();
    const status = state.writeStatuses.shift() ?? state.writeStatus;
    const record = { method, workspaceId, viewDefinitionId, body: request.postData(), authorization: request.headers().authorization, status };
    state.writes.push(record);
    if (state.gate) await state.gate;
    const rows = state.favorites.get(workspaceId) ?? [];
    const existing = rows.some(row => row.viewDefinitionId === viewDefinitionId);
    if (status < 400 || state.commitBeforeFailure) {
      if (method === "POST" && !existing) rows.push({ id: "server-favorite-" + viewDefinitionId, viewDefinitionId, name: names[viewDefinitionId]!, icon: null });
      if (method === "DELETE") state.favorites.set(workspaceId, rows.filter(row => row.viewDefinitionId !== viewDefinitionId));
      else state.favorites.set(workspaceId, rows);
    }
    if (status >= 400) return respond(route, { statusCode: status, error: "private mutation failure", message: "private mutation failure" }, status);
    record.status = method === "POST" && !existing ? 201 : 200;
    return respond(route, { viewDefinitionId, isFavorite: method === "POST" }, record.status);
  }

  await page.route(/\/api\/users\/me\/workspaces\/[^/]+\/view-header(?:\?.*)?$/, handleHeader);
  await page.route(/\/api\/users\/me\/workspaces\/[^/]+\/view-header\/(object|list)-definitions\/[^/]+\/view-definitions(?:\?.*)?$/, handleViews);
  await page.route(/\/api\/users\/me\/sidebar\/workspaces\/[^/]+\/view-favorites$/, handleFavorites);
  await page.route(/\/api\/users\/me\/workspaces\/[^/]+\/view-header\/view-definitions\/[^/]+\/favorite$/, handleMutation);
  return state;
}

// 기능 : 현재 화면 크기에서 보이는 공통 헤더만 조작합니다.
function header(page: Page) { return page.locator('[data-testid="workspace-view-header"]:visible'); }
// 기능 : 현재 Workspace의 개인 사이드바 행만 검사합니다.
function favorites(page: Page) { return page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("list", { name: "즐겨찾기", exact: true }); }
// 기능 : 사용자 조작 중 완료하지 않은 쓰기 응답을 제어합니다.
function gate() { let release!: () => void; const promise = new Promise<void>(resolve => { release = resolve; }); return { promise, release }; }

for (const scenario of [{ name: "Object", path: OBJECT_PATH, id: "view-all", title: "전체 회사" }, { name: "List", path: LIST_PATH, id: "view-pipeline", title: "전체 영업" }]) {
  // 기능 : 같은 공통 헤더에서 관리항목·업무목록의 즐겨찾기를 등록·해제합니다.
  test(`${scenario.name} adds and deletes the current View and refreshes the sidebar in server order`, async ({ page }) => {
    const state = await setupScenario(page); await page.goto(scenario.path);
    await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기"]);
    await header(page).getByRole("button", { name: ADD, exact: true }).click();
    await expect(header(page).getByRole("button", { name: REMOVE, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기", scenario.title]);
    await header(page).getByRole("button", { name: REMOVE, exact: true }).click();
    await expect(header(page).getByRole("button", { name: ADD, exact: true })).toHaveAttribute("aria-pressed", "false");
    await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기"]);
    expect(state.writes.map(row => [row.method, row.viewDefinitionId, row.status])).toEqual([["POST", scenario.id, 201], ["DELETE", scenario.id, 200]]);
    expect(state.writes.every(row => row.body === null && row.workspaceId === WORKSPACE && row.authorization === "Bearer e2e-user-web-access-token")).toBe(true);
    expect(state.headerReads.length).toBeGreaterThan(1); expect(state.favoriteReads.length).toBeGreaterThan(1);
  });
}

// 기능 : 드롭다운의 두 번째 보기도 자신의 View ID로 변경하고 선택을 보존합니다.
test("keeps a noninitial selection after registering and unregistering its own View", async ({ page }) => {
  const state = await setupScenario(page); await page.goto(OBJECT_PATH);
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click();
  await header(page).getByRole("option", { name: /단계별 회사/ }).click();
  await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기", "단계별 회사"]);
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("단계별 회사");
  await header(page).getByRole("button", { name: REMOVE, exact: true }).click();
  await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기"]);
  expect(state.writes.map(row => row.viewDefinitionId)).toEqual(["view-seoul", "view-seoul"]);
});

// 기능 : 이미 다른 요청에서 등록된 View의 POST 200도 중복 행 없이 성공으로 반영합니다.
test("accepts an idempotent 200 from an already registered View", async ({ page }) => {
  const state = await setupScenario(page); await page.goto(OBJECT_PATH);
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toBeEnabled();
  state.favorites.get(WORKSPACE)!.push({ id: "existing-server-id", viewDefinitionId: "view-all", name: "전체 회사", icon: null });
  await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect(header(page).getByRole("button", { name: REMOVE, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기", "전체 회사"]);
  expect(state.writes[0]!.status).toBe(200);
});

// 기능 : 응답 전 같은 이벤트의 연속 클릭도 한 번만 전송하고 기존 별표를 유지합니다.
test("blocks duplicate clicks while pending and preserves the prior state", async ({ page }) => {
  const state = await setupScenario(page), pending = gate(); state.gate = pending.promise;
  await page.goto(OBJECT_PATH);
  const button = header(page).getByRole("button", { name: ADD, exact: true });
  await button.evaluate(element => { element.click(); element.click(); });
  await expect(button).toBeDisabled(); await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => state.writes.length).toBe(1);
  pending.release();
  await expect(header(page).getByRole("button", { name: REMOVE, exact: true })).toBeEnabled();
});

// 기능 : 실패 원문을 숨기고 기존 상태·안내 닫기·사용자 재시도를 제공합니다.
test("shows a safe failure and supports retry without optimistic side effects", async ({ page }) => {
  const state = await setupScenario(page); state.writeStatus = 500; await page.goto(OBJECT_PATH);
  await header(page).getByRole("button", { name: ADD, exact: true }).click();
  const alert = header(page).getByRole("alert");
  await expect(alert).toContainText("즐겨찾기를 변경하지 못했어요.");
  await expect(alert).not.toContainText("private");
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const box = await header(page).getByRole("alert").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기"]);
  await alert.getByRole("button", { name: "닫기", exact: true }).click();
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toBeFocused();
  state.writeStatus = 200;
  await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect(header(page).getByRole("button", { name: REMOVE, exact: true })).toBeEnabled();
  expect(state.writes).toHaveLength(2);
});

// 기능 : 응답 실패 전에 서버에 반영된 경우도 GET으로 실제 상태를 재확인하며 자동 재전송하지 않습니다.
test("reconciles an uncertain failure from subsequent reads", async ({ page }) => {
  const state = await setupScenario(page); state.writeStatus = 500; state.commitBeforeFailure = true;
  await page.goto(OBJECT_PATH); await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect(header(page).getByRole("button", { name: REMOVE, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기", "전체 회사"]);
  expect(state.writes).toHaveLength(1);
});

// 기능 : 현재 보기 접근이 거부되면 새 쓰기를 막고 다른 보기 선택으로 이어갑니다.
test("keeps a forbidden view disabled after closing its error", async ({ page }) => {
  const state = await setupScenario(page); state.writeStatus = 404; await page.goto(OBJECT_PATH);
  await header(page).getByRole("button", { name: "보기 선택", exact: true }).click(); await header(page).getByRole("option").last().click();
  await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect(header(page).getByRole("alert")).toContainText("다른 보기를 선택해 주세요.");
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toBeDisabled();
  await header(page).getByRole("alert").getByRole("button", { name: "닫기", exact: true }).click();
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toBeDisabled();
  expect(state.writes).toHaveLength(1);
});

// 기능 : 이전 보기에서 시작한 응답이 업무목록의 헤더·별표를 바꾸지 않습니다.
test("isolates a late mutation after selecting another target", async ({ page }) => {
  const state = await setupScenario(page), pending = gate(); state.gate = pending.promise;
  await page.goto(OBJECT_PATH); await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  await page.getByRole("link", { name: "영업 파이프라인", exact: true }).click();
  await expect(header(page).getByRole("button", { name: "보기 선택", exact: true })).toContainText("전체 영업");
  pending.release();
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toBeEnabled();
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기", "전체 회사"]);
});

// 기능 : 진행 중 Workspace를 이동해도 새 공간의 별표·사이드바를 덮어쓰지 않습니다.
test("isolates late writes when the workspace changes", async ({ page }) => {
  const state = await setupScenario(page), pending = gate(); state.gate = pending.promise;
  await page.goto(OBJECT_PATH); await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  await page.getByRole("button", { name: "E2E Workspace 계정 메뉴 열기", exact: true }).click();
  await page.getByRole("menuitem", { name: "두 번째 작업 공간", exact: true }).click();
  await page.getByRole("link", { name: "Company", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/app/workspaces/${OTHER_WORKSPACE}/objects/`));
  pending.release();
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toBeEnabled();
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(favorites(page).getByRole("listitem")).toHaveText(["다른 공간 보기"]);
  expect(state.writes[0]!.workspaceId).toBe(WORKSPACE);
});

// 기능 : 모바일과 데스크톱이 같은 별표 상태를 공유하고 키보드로도 변경할 수 있습니다.
test("supports keyboard toggling and responsive shared state", async ({ page }, testInfo) => {
  await setupScenario(page); await page.goto(OBJECT_PATH);
  const button = header(page).getByRole("button", { name: ADD, exact: true });
  await button.focus(); await page.keyboard.press("Space");
  await expect(header(page).getByRole("button", { name: REMOVE, exact: true })).toHaveAttribute("aria-pressed", "true");
  for (const width of [1440, 1024, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    const star = header(page).getByRole("button", { name: REMOVE, exact: true });
    await expect(star).toBeInViewport(); await expect(star).toHaveAttribute("aria-pressed", "true");
    const box = await header(page).boundingBox(); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
  await page.screenshot({ path: testInfo.outputPath("favorite-mobile.png") });
  await header(page).getByRole("button", { name: REMOVE, exact: true }).focus(); await page.keyboard.press("Enter");
  await expect(header(page).getByRole("button", { name: ADD, exact: true })).toHaveAttribute("aria-pressed", "false");
});

// 기능 : View가 없는 정상 헤더에는 별표 쓰기를 제공하지 않습니다.
test("disables the favorite action without a current View", async ({ page }) => {
  const state = await setupScenario(page); state.noViews = true; await page.goto(OBJECT_PATH);
  await expect(header(page).getByRole("button", { name: "보기 없음", exact: true })).toBeDisabled();
  expect(state.writes).toEqual([]);
});

// 기능 : 기존 apiClient의 401 세션 갱신과 같은 경로 재요청을 유지합니다.
test("reuses the shared auth refresh after a 401", async ({ page }) => {
  const state = await setupScenario(page); state.writeStatuses = [401, 200]; await page.goto(OBJECT_PATH);
  await header(page).getByRole("button", { name: ADD, exact: true }).click();
  await expect(header(page).getByRole("button", { name: REMOVE, exact: true })).toBeEnabled();
  expect(state.writes.map(row => row.viewDefinitionId)).toEqual(["view-all", "view-all"]);
  await expect(favorites(page).getByRole("listitem")).toHaveText(["먼저 등록한 보기", "전체 회사"]);
});
