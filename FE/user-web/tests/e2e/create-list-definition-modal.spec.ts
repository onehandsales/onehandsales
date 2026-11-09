import { expect, test, type Page, type Route } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./support/user-web-api-mocks";

const home = "/app/workspaces/workspace-e2e-001";
const listId = "created-list";
const viewId = "created-list-view";
const createdPath = `${home}/view-definitions/${viewId}?sourceType=LIST`;
const listIcons: Record<string, string> = { TABLE: "lucide:table-2", LIST: "lucide:list", KANBAN: "lucide:columns-3" };

// 기능 : 실제 목록 생성 화면을 사용하고 모든 API를 mock하여 사용자 DB를 변경하지 않습니다.
async function setupCreation(page: Page, options: { noObjects?: boolean; failAttributes?: boolean } = {}) {
  const api = await setupUserWebApiMocks(page);
  await seedAuthenticatedSession(page);
  const state = { created: false, fail: false, delay: false, attempts: 0, sidebarReads: 0,
    failAttributes: options.failAttributes ?? false, viewType: "TABLE", writes: [] as Record<string, unknown>[] };
  let release: (() => void) | undefined;
  const pending = new Promise<void>(resolve => { release = resolve; });

  // 기능 : 실행 중인 FE의 origin에서 인증 헤더를 포함한 mock 요청을 허용합니다.
  async function respond(route: Route, body: unknown, status = 200) {
    const headers = {
      "access-control-allow-origin": route.request().headers().origin ?? "http://localhost:5173",
      "access-control-allow-credentials": "true", "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id",
    };
    await route.fulfill(route.request().method() === "OPTIONS" ? { status: 204, headers } : { json: body, status, headers });
  }
  await page.route(/\/sidebar\/workspaces\/workspace-e2e-001\/objects$/, route => respond(route,
    options.noObjects ? [] : [{ id: "property", singularName: "매물", pluralName: "매물", icon: null }]));
  await page.route(/\/object-definitions\/property\/attribute-definitions$/, route => respond(route,
    state.failAttributes ? { error: "InternalServerError" } : [
      { id: "name", title: "매물명", type: "Text", icon: null, isMultiselect: false, config: null },
      { id: "status", title: "거래 상태", type: "Status", icon: null, isMultiselect: false, config: null },
    ], state.failAttributes ? 500 : 200));
  await page.route(/\/workspaces\/workspace-e2e-001\/list-definitions$/, async route => {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    state.attempts += 1;
    const body = route.request().postDataJSON() as Record<string, unknown>;
    state.writes.push(body); state.viewType = String(body.viewType);
    if (state.delay) await pending;
    if (state.fail) return respond(route, { statusCode: 409, error: "ListDefinitionApiSlugAlreadyExists", message: "List name already exists" }, 409);
    state.created = true;
    return respond(route, { listDefinitionId: listId, viewDefinitionId: viewId }, 201);
  });
  await page.route(/\/sidebar\/workspaces\/workspace-e2e-001\/lists$/, route => {
    state.sidebarReads += 1;
    return respond(route, state.created ? [{ id: listId, name: "매물 상담", icon: listIcons[state.viewType] }] : []);
  });
  // 기능 : 새 List와 View의 저장 후 조회 응답을 현재 선택한 보기 타입으로 제공합니다.
  function header() { return { viewId, viewName: "전체 매물 상담", viewType: state.viewType, viewIcon: null, isFavorite: false,
    objectDefinition: null, listDefinition: { id: listId, name: "매물 상담", icon: listIcons[state.viewType] } }; }
  await page.route(/\/view-header\/view-definitions\/created-list-view$/, route => respond(route, header()));
  await page.route(/\/view-header\?.*targetId=created-list/, route => respond(route, header()));
  await page.route(/\/view-header\/list-definitions\/created-list\/view-definitions(?:\?.*)?$/, route => respond(route, {
    items: [{ viewDefinitionId: viewId, viewName: "전체 매물 상담", viewType: state.viewType, viewIcon: null, isSelected: true }],
  }));
  await page.route(/\/view-definitions\/created-list-view\/data(?:\?.*)?$/, route => respond(route, {
    viewDefinitionId: viewId, viewType: state.viewType, viewName: "전체 매물 상담", state: "READY", part: "MAIN",
    source: { kind: "LIST", objectDefinitionId: null, listDefinitionId: listId, itemKind: "LIST_ENTRY" },
    configurationFingerprint: "created-list-config", issues: [],
    bindings: [{ id: "name-binding", attributeDefinitionId: "name", sourceScope: "RECORD", referenceAttributeIdPath: [], role: "TITLE", label: "매물명", attributeType: "Text", isMultiselect: false, isHidden: false, width: null, format: null, currencyCode: null }],
    summary: { sourceItemCount: 0, matchedItemCount: 0, eligibleItemCount: 0 },
    data: state.viewType === "KANBAN" ? { presentation: { cardDensity: "COMFORTABLE", showEmptyGroups: true }, columns: [] }
      : { presentation: { rowDensity: "COMFORTABLE" }, ...(state.viewType === "TABLE" ? { columnBindingIds: ["name-binding"] } : {}),
        items: [], groups: [], pageInfo: { hasNextPage: false, nextCursor: null } },
  }));
  await page.goto(home);
  await page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("button", { name: "업무 목록 추가", exact: true }).last().click();
  const dialog = page.getByRole("dialog").first();
  return { api, state, dialog, release: () => release?.() };
}

// 기능 : 필수 이름과 관리 항목을 입력하고 기본 제목 선택으로 보기 단계로 이동합니다.
async function enterDetails(page: Page) {
  const dialog = page.getByRole("dialog").first();
  await expect(dialog.getByRole("button", { name: "다음", exact: true })).toBeDisabled();
  await dialog.getByLabel("업무 목록 이름", { exact: true }).fill(" 매물 상담 ");
  await dialog.getByRole("combobox", { name: "관리할 항목", exact: true }).click();
  await dialog.getByRole("option", { name: "매물", exact: true }).click();
  await expect(dialog.getByRole("combobox", { name: "제목으로 표시할 정보", exact: true })).toHaveValue("name");
  await dialog.getByRole("button", { name: "다음", exact: true }).click();
  await expect(dialog.getByRole("radio", { name: /^표/ })).toBeChecked();
  await expect(dialog.getByRole("button", { name: "아이콘 선택하기", exact: true })).toHaveCount(0);
}

// 기능 : 서버가 반환한 목록 아이콘이 sidebar와 header에 표시되는지 확인합니다.
async function expectListIcon(page: Page, iconClass: string) {
  await expect(page.getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "매물 상담", exact: true }).last().locator(`svg.${iconClass}`)).toBeVisible();
  await expect(page.locator(".app-page-header:visible").locator(`svg.${iconClass}`).first()).toBeVisible();
}

test.describe("업무 목록과 첫 보기 생성", () => {
  test("관리 항목을 검색·키보드로 선택하고 모달을 유지하며 선택을 해제한다", async ({ page }) => {
    const { dialog, state } = await setupCreation(page);
    const trigger = dialog.getByRole("combobox", { name: "관리할 항목", exact: true });
    const search = dialog.getByRole("textbox", { name: "관리할 항목 검색", exact: true });
    await dialog.getByLabel("업무 목록 이름", { exact: true }).fill("매물 상담");
    await trigger.focus();
    await trigger.press("ArrowDown");
    await expect(search).toBeFocused();
    await search.fill("검색 결과 없음");
    await expect(dialog.getByRole("status")).toHaveText("일치하는 항목이 없어요.");
    await search.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await search.fill("매물");
    await search.press("ArrowDown");
    const option = dialog.getByRole("option", { name: "매물", exact: true });
    await expect(option).toBeFocused();
    await option.press("Enter");
    await expect(trigger).toContainText("매물");
    await expect(trigger).toBeFocused();
    await expect(dialog.getByRole("combobox", { name: "제목으로 표시할 정보", exact: true })).toHaveValue("name");
    await expect(dialog.getByRole("button", { name: "다음", exact: true })).toBeEnabled();
    await dialog.getByRole("combobox", { name: "제목으로 표시할 정보", exact: true }).selectOption("status");
    await trigger.click();
    await expect(option).toHaveAttribute("aria-selected", "true");
    await option.click();
    await expect(dialog.getByRole("combobox", { name: "제목으로 표시할 정보", exact: true })).toHaveValue("status");
    await trigger.click();
    await search.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await trigger.click();
    await dialog.getByRole("option", { name: "선택해 주세요", exact: true }).click();
    await expect(trigger).toContainText("선택해 주세요");
    await expect(dialog.getByRole("combobox", { name: "제목으로 표시할 정보", exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "다음", exact: true })).toBeDisabled();
    await trigger.click();
    await dialog.getByLabel("업무 목록 이름", { exact: true }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(state.attempts).toBe(0);
  });

  test("표 기본 선택, 중복 제출 차단, sidebar 갱신과 새로고침 후 복원", async ({ page }) => {
    const { state, dialog, api } = await setupCreation(page);
    await enterDetails(page);
    await dialog.getByLabel("설명 (옵션)", { exact: true }).fill("매물 상담을 관리해요.");
    const reads = state.sidebarReads;
    await dialog.getByRole("button", { name: "생성", exact: true }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
    await expect(page).toHaveURL(createdPath);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: /^매물명 속성 메뉴 열기/ })).toBeVisible();
    expect(state.attempts).toBe(1);
    expect(state.writes[0]).toEqual({ listDefinitionName: "매물 상담", objectDefinitionId: "property", titleAttributeDefinitionId: "name", viewType: "TABLE", description: "매물 상담을 관리해요." });
    await expectListIcon(page, "lucide-table2");
    expect(state.sidebarReads).toBeGreaterThan(reads);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    await page.reload();
    await expect(page.getByRole("columnheader", { name: /^매물명 속성 메뉴 열기/ })).toBeVisible();
    await expectListIcon(page, "lucide-table2");
  });

  test("기존 상태를 보드로 사용하고 새 상태 입력을 보내지 않는다", async ({ page }) => {
    const { state, dialog } = await setupCreation(page);
    await enterDetails(page);
    await dialog.getByRole("radio", { name: /^보드/ }).check();
    await dialog.getByRole("combobox", { name: "단계 기준", exact: true }).selectOption("existing");
    await expect(dialog.getByRole("combobox", { name: "상태 정보 선택", exact: true })).toHaveValue("status");
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect(page).toHaveURL(createdPath);
    expect(state.writes[0]).toMatchObject({ viewType: "KANBAN", kanban: { attributeDefinitionId: "status" } });
    expect(state.writes[0]).not.toHaveProperty("icon");
    await expectListIcon(page, "lucide-columns3");
    await expect(page.locator(".app-page-header:visible").getByText("전체 매물 상담", { exact: true })).toBeVisible();
  });

  test("목록 전용 단계 입력을 검증하고 입력한 순서를 보존한다", async ({ page }) => {
    const { state, dialog } = await setupCreation(page);
    await enterDetails(page);
    await dialog.getByRole("radio", { name: /^보드/ }).check();
    await expect(dialog.getByRole("button", { name: "생성", exact: true })).toBeDisabled();
    await dialog.getByLabel("단계 정보 이름", { exact: true }).fill(" 상담 단계 ");
    await dialog.getByLabel("단계 이름 (한 줄에 하나씩)", { exact: false }).fill("상담\n 상담 ");
    await expect(dialog.getByRole("button", { name: "생성", exact: true })).toBeDisabled();
    await dialog.getByLabel("단계 이름 (한 줄에 하나씩)", { exact: false }).fill(" 접수 \n 방문 \n 계약 ");
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect(page).toHaveURL(createdPath);
    expect(state.writes[0]).toMatchObject({ kanban: { newStatus: { title: "상담 단계", options: ["접수", "방문", "계약"] } } });
  });

  test("목록 보기로 바꾸면 숨겨진 보드 설정을 보내지 않는다", async ({ page }) => {
    const { state, dialog } = await setupCreation(page);
    await enterDetails(page);
    await dialog.getByRole("radio", { name: /^보드/ }).check();
    await dialog.getByRole("radio", { name: /^목록/ }).check();
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect(page).toHaveURL(createdPath);
    expect(state.writes[0]?.viewType).toBe("LIST");
    expect(state.writes[0]).not.toHaveProperty("kanban");
    expect(state.writes[0]).not.toHaveProperty("icon");
    await expectListIcon(page, "lucide-list");
  });

  test("중복 이름 오류 후 입력을 유지하고 재시도한다", async ({ page }) => {
    const { state, dialog } = await setupCreation(page);
    await enterDetails(page);
    state.fail = true;
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect(dialog.getByRole("alert")).toContainText("같은 이름");
    await expect(page).toHaveURL(home);
    state.fail = false;
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect(page).toHaveURL(createdPath);
    expect(state.attempts).toBe(2);
  });

  test("닫힌 모달의 응답은 cache만 갱신하고 재열린 입력을 보존한다", async ({ page }) => {
    const { state, dialog, release } = await setupCreation(page);
    await enterDetails(page);
    state.delay = true;
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect.poll(() => state.attempts).toBe(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("button", { name: "업무 목록 추가", exact: true }).last().click();
    await page.getByLabel("업무 목록 이름", { exact: true }).fill("다른 목록");
    const reads = state.sidebarReads;
    release();
    await expect.poll(() => state.sidebarReads).toBeGreaterThan(reads);
    await expect(page).toHaveURL(home);
    await expect(page.getByLabel("업무 목록 이름", { exact: true })).toHaveValue("다른 목록");
  });

  test("관리 항목이 없으면 기존 관리 항목 생성 모달로 안내한다", async ({ page }) => {
    const { dialog, state } = await setupCreation(page, { noObjects: true });
    await dialog.getByRole("button", { name: "관리 항목 만들기", exact: true }).click();
    await expect(page.getByLabel("관리 항목 이름", { exact: true })).toBeVisible();
    expect(state.attempts).toBe(0);
  });

  test("속성 조회 실패를 재시도하고 제목을 선택한다", async ({ page }) => {
    const { dialog, state } = await setupCreation(page, { failAttributes: true });
    await dialog.getByLabel("업무 목록 이름", { exact: true }).fill("매물 상담");
    await dialog.getByRole("combobox", { name: "관리할 항목", exact: true }).click();
    await dialog.getByRole("option", { name: "매물", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "다음", exact: true })).toBeDisabled();
    await expect(dialog.getByRole("alert")).toBeVisible();
    state.failAttributes = false;
    await dialog.getByRole("button", { name: "다시 시도", exact: true }).click();
    await expect(dialog.getByRole("combobox", { name: "제목으로 표시할 정보", exact: true })).toHaveValue("name");
    await expect(dialog.getByRole("button", { name: "다음", exact: true })).toBeEnabled();
  });
});
