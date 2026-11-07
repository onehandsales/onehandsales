import { expect, test, type Page, type Route } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./support/user-web-api-mocks";

const home = "/app/workspaces/workspace-e2e-001";
const objectId = "object-definition-created";
const viewId = "view-definition-created";
const createdPath = `${home}/view-definitions/${viewId}?sourceType=OBJECT`;

// 기능 : 실제 생성 UX와 헤더·TABLE을 유지하면서 모든 API를 mock해 실행 중 DB를 변경하지 않습니다.
async function setupCreation(page: Page) {
  const api = await setupUserWebApiMocks(page);
  await seedAuthenticatedSession(page);
  const state = { created: false, fail: false, delay: false, attempts: 0, sidebarReads: 0, writes: [] as Record<string, unknown>[] };
  let release: (() => void) | undefined;
  const pending = new Promise<void>(resolve => { release = resolve; });
  const object = { id: objectId, name: "매물", icon: "lucide:box" };

  // 기능 : 기존 개발 서버의 API origin에 맞는 CORS 응답을 제공합니다.
  async function respond(route: Route, body: unknown, status = 200) {
    const headers = {
      "access-control-allow-origin": route.request().headers().origin ?? "http://localhost:5173",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id",
    };
    await route.fulfill(route.request().method() === "OPTIONS" ? { status: 204, headers } : { json: body, status, headers });
  }

  await page.route(/\/workspaces\/workspace-e2e-001\/object-definitions$/, async route => {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    state.attempts += 1;
    state.writes.push(route.request().postDataJSON() as Record<string, unknown>);
    if (state.delay) await pending;
    if (state.fail) return respond(route, { statusCode: 409, error: "ObjectDefinitionApiSlugAlreadyExists", message: "이미 존재하는 관리 항목 이름입니다." }, 409);
    state.created = true;
    return respond(route, { objectDefinitionId: objectId, viewDefinitionId: viewId }, 201);
  });
  await page.route(/\/sidebar\/workspaces\/workspace-e2e-001\/objects$/, route => {
    state.sidebarReads += 1;
    return respond(route, state.created ? [{ id: objectId, singularName: "매물", pluralName: "매물", icon: object.icon }] : []);
  });
  const header = { viewId, viewName: "전체 매물", viewType: "TABLE", viewIcon: null, isFavorite: false, objectDefinition: object, listDefinition: null };
  await page.route(/\/view-header\/view-definitions\/view-definition-created$/, route => respond(route, header));
  await page.route(/\/view-header\?.*targetId=object-definition-created/, route => respond(route, header));
  await page.route(/\/view-header\/object-definitions\/object-definition-created\/view-definitions(?:\?.*)?$/, route => respond(route, {
    items: [{ viewDefinitionId: viewId, viewName: "전체 매물", viewType: "TABLE", viewIcon: null, isSelected: true }],
  }));
  await page.route(/\/view-definitions\/view-definition-created\/data(?:\?.*)?$/, route => respond(route, {
    viewDefinitionId: viewId, viewType: "TABLE", viewName: "전체 매물", state: "READY", part: "MAIN",
    source: { kind: "OBJECT", objectDefinitionId: objectId, listDefinitionId: null, itemKind: "RECORD" },
    configurationFingerprint: "created-configuration", issues: [],
    bindings: [{ id: "name-binding", attributeDefinitionId: "name", sourceScope: "RECORD", referenceAttributeIdPath: [], role: "TITLE", label: "이름", attributeType: "Text", isMultiselect: false, isHidden: false, width: null, format: null, currencyCode: null }],
    summary: { sourceItemCount: 0, matchedItemCount: 0, eligibleItemCount: 0 },
    data: { presentation: { rowDensity: "COMFORTABLE" }, columnBindingIds: ["name-binding"], items: [], groups: [], pageInfo: { hasNextPage: false, nextCursor: null } },
  }));
  await page.goto(home);
  await page.getByRole("navigation", { name: "Workspace navigation" }).getByRole("button", { name: "관리 대상 추가", exact: true }).last().click();
  const dialog = page.getByRole("dialog").first();
  await expect(dialog.getByRole("button", { name: "다음", exact: true })).toBeDisabled();
  await dialog.getByLabel("관리 항목 이름").fill(" 매물 ");
  await dialog.getByRole("button", { name: "다음", exact: true }).click();
  await expect(dialog.getByRole("heading", { name: "매물의 아이콘과 설명을 정해 주세요.", exact: true })).toBeVisible();
  await dialog.getByLabel("관리 항목 설명 (선택)").fill("매물 정보를 관리해요.");
  return { api, state, dialog, release: () => release?.() };
}

test.describe("관리 항목과 첫 TABLE 생성", () => {
  test("기존 두 단계 입력을 유지하고 생성된 TABLE과 사이드바를 연다", async ({ page }) => {
    const { state, dialog, api } = await setupCreation(page);
    await dialog.getByRole("button", { name: "이전", exact: true }).click();
    await expect(dialog.getByLabel("관리 항목 이름")).toHaveValue(" 매물 ");
    await dialog.getByRole("button", { name: "다음", exact: true }).click();
    await expect(dialog.getByLabel("관리 항목 설명 (선택)")).toHaveValue("매물 정보를 관리해요.");
    const beforeReads = state.sidebarReads;
    // 같은 이벤트 턴에 두 번 눌러도 mutation은 하나만 시작한다.
    await dialog.getByRole("button", { name: "생성", exact: true }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
    await expect(page).toHaveURL(createdPath);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".app-page-header:visible").getByText("전체 매물", { exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /^이름 속성 메뉴 열기/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Workspace navigation" }).getByText("매물", { exact: true })).toBeVisible();
    expect(state.attempts).toBe(1);
    expect(state.writes).toEqual([{ objectDefinitionName: "매물", icon: expect.any(String), description: "매물 정보를 관리해요." }]);
    expect(state.sidebarReads).toBeGreaterThan(beforeReads);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    await page.reload();
    await expect(page.getByRole("columnheader", { name: /^이름 속성 메뉴 열기/ })).toBeVisible();
  });

  test("생성 실패 시 입력과 현재 경로를 보존하고 재시도한다", async ({ page }) => {
    const { state, dialog } = await setupCreation(page);
    state.fail = true;
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect(dialog.getByText("이미 존재하는 관리 항목 이름입니다.", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(home);
    await expect(dialog.getByLabel("관리 항목 설명 (선택)")).toHaveValue("매물 정보를 관리해요.");
    state.fail = false;
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect(page).toHaveURL(createdPath);
    expect(state.attempts).toBe(2);
  });

  test("닫힌 모달의 늦은 성공 응답은 새 화면으로 이동하지 않는다", async ({ page }) => {
    const { state, dialog, release } = await setupCreation(page);
    state.delay = true;
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    await expect.poll(() => state.attempts).toBe(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const beforeReads = state.sidebarReads;
    release();
    // 원래 cache가 갱신될 때까지 기다려 늦은 성공 처리 자체가 실행됐음을 확인한다.
    await expect.poll(() => state.sidebarReads).toBeGreaterThan(beforeReads);
    await expect(page).toHaveURL(home);
    await expect(page.getByRole("navigation", { name: "Workspace navigation" }).getByText("매물", { exact: true })).toBeVisible();
  });
});
