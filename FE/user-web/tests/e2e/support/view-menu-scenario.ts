import type { Page, Route } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./user-web-api-mocks";
import type { ViewDisplayRole, ViewMenu, ViewMenuResponses, ViewSettingsResponse } from "../../../src/features/crm-view/types/view-menu";
import type { WorkspaceViewType } from "../../../src/features/crm-view/types/workspace-view";

export const VIEW_TYPES: readonly WorkspaceViewType[] = ["TABLE", "KANBAN", "LIST", "GALLERY", "CALENDAR", "TIMELINE", "GANTT", "CHART", "PIVOT", "MAP", "DASHBOARD"];
export const MENU_OBJECT_PATH = "/app/workspaces/workspace-e2e-001/objects/object-definition-company";
export const MENU_LIST_PATH = "/app/workspaces/workspace-e2e-001/lists/list-definition-pipeline";
const attributes = [
  { id: "name", title: "계약명", type: "Text" }, { id: "amount", title: "금액", type: "Currency" },
  { id: "date", title: "종료일", type: "Date" }, { id: "status", title: "계약 상태", type: "Status" },
].map(item => ({ ...item, objectDefinitionId: "object-definition-company", listDefinitionId: null, icon: null, isMultiselect: false, configJson: null }));

// 기능 : 역할 중복·숨김·위젯 원본을 포함한 실제 응답 형태의 설정을 구성합니다.
export function makeViewSettings(viewType: WorkspaceViewType): ViewSettingsResponse {
  const roles: readonly ViewDisplayRole[] = ["TITLE", "BODY", "IMAGE", "START_DATE", "END_DATE", "PROGRESS", "MEASURE", "LOCATION"];
  const displayRows = [
    { id: "visible-name", attributeDefinitionId: "name", isHidden: false },
    { id: "hidden-amount", attributeDefinitionId: "amount", isHidden: true },
    { id: "visible-date", attributeDefinitionId: "date", isHidden: false },
  ].map((row, sortOrder) => ({ ...row, sourceScope: "RECORD" as const, referenceAttributeIdPathJson: [], attributeDisplayRole: "DISPLAY" as const, sortOrder, labelOverride: null, width: 140, formatJson: null }));
  return { viewDefinitionId: "view-" + viewType.toLowerCase(), viewType, viewName: viewType, objectDefinitionId: "object-definition-company", listDefinitionId: null,
    configJson: { cardSize: "MEDIUM", chartType: "BAR", aggregation: "SUM", showLegend: true, showEmptyGroups: false, showDependencies: true, showRowTotals: true, showColumnTotals: false, showLabels: true, fitToData: false, gridColumns: 12 },
    attributeDefinitions: attributes, selectOptions: [], statusOptions: [{ id: "status-open", attributeDefinitionId: "status", title: "진행 중", color: null, sortOrder: 0 }],
    viewAttributeSettingDefinitions: [...displayRows, ...(viewType === "TABLE" ? [] : roles.map((role, sortOrder) => ({ ...displayRows[0]!, id: "role-" + role, attributeDisplayRole: role, sortOrder: sortOrder + 3, formatJson: { dateFormat: "YYYY-MM-DD" } })))],
    viewGroupDefinitions: (["GROUP", "SERIES", "PIVOT_ROW", "PIVOT_COLUMN"] as const).map((groupRole, sortOrder) => ({ id: "group-" + groupRole, groupRole, sourceScope: "RECORD", attributeDefinitionId: "status", referenceAttributeIdPathJson: [], sortDirection: "ASC", sortOrder, configJson: null })),
    viewGroupSettingDefinitions: [{ id: "stage-open", viewGroupDefinitionId: "group-GROUP", attributeDefinitionId: "status", statusOptionId: "status-open", selectOptionId: null, groupKeyJson: null, sortOrder: 0, labelOverride: null, isHidden: true, isFold: true, configJson: null }],
    viewWidgetDefinitions: [
      { id: "widget-one", contentViewDefinitionId: "source", titleOverride: "월별 매출", sortOrder: 0, isHidden: false, layoutJson: { x: 0, y: 0, width: 6, height: 4 }, configJson: { showTitle: false } },
      { id: "widget-two", contentViewDefinitionId: "source", titleOverride: "숨긴 매출", sortOrder: 1, isHidden: true, layoutJson: { x: 6, y: 0, width: 6, height: 4 }, configJson: null },
    ], contentViewDefinitions: [{ id: "source", name: "원본 매출", type: "CHART", icon: null }],
  };
}

// 기능 : 공통 메뉴의 초기 조회·선택·지연·오류를 브라우저에서 제어합니다.
export async function setupViewMenuScenario(page: Page, initialType: WorkspaceViewType = "TABLE") {
  await setupUserWebApiMocks(page);
  await seedAuthenticatedSession(page);
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/attribute-definitions", route => route.fulfill({ json: attributes.map(item => ({ ...item, config: null })) }));
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/record-definitions*", route => route.fulfill({ json: { items: [], pageInfo: { hasNextPage: false, nextCursor: null } } }));
  const state = { initialType, noView: false, status: 200, requests: [] as { view: string; menu: string }[], writes: [] as string[],
    gate: null as Promise<void> | null, transform: (data: ViewSettingsResponse) => data };
  page.on("request", request => { if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) && new URL(request.url()).pathname.startsWith("/api/")) state.writes.push(request.url()); });
  // 기능 : 인증 API origin과 OPTIONS 요청에 맞는 응답을 제공합니다.
  async function respond(route: Route, body: unknown, status = 200) {
    const headers = { "access-control-allow-origin": route.request().headers().origin ?? "http://127.0.0.1:5175", "access-control-allow-credentials": "true", "access-control-allow-methods": "GET, OPTIONS", "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id" };
    return route.request().method() === "OPTIONS" ? route.fulfill({ status: 204, headers }) : route.fulfill({ status, json: body, headers });
  }
  await page.route(/\/view-header\?/, route => {
    const list = new URL(route.request().url()).searchParams.get("targetType") === "LIST";
    return respond(route, { viewId: state.noView ? null : "view-" + state.initialType.toLowerCase(), viewType: state.noView ? null : state.initialType, viewName: state.noView ? null : state.initialType, viewIcon: null, isFavorite: false,
      objectDefinition: list ? null : { id: "object-definition-company", name: "계약", icon: null }, listDefinition: list ? { id: "list-definition-pipeline", name: "업무목록", icon: null } : null });
  });
  await page.route(/\/view-header\/(object|list)-definitions\/[^/]+\/view-definitions/, route => respond(route, { items: VIEW_TYPES.map(viewType => ({ viewDefinitionId: "view-" + viewType.toLowerCase(), viewName: viewType, viewIcon: null, viewType, isSelected: false })) }));
  await page.route(/\/view-header\/view-definitions\/[^/]+\/(filters|sorts|settings)$/, async route => {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const parts = new URL(route.request().url()).pathname.split("/");
    const menu = parts.at(-1) as ViewMenu;
    const view = parts.at(-2)!;
    state.requests.push({ view, menu });
    const status = state.status;
    if (state.gate) await state.gate;
    if (status !== 200) return respond(route, { statusCode: status, error: "Unavailable" }, status);
    const settings = state.transform(makeViewSettings(view.replace("view-", "").toUpperCase() as WorkspaceViewType));
    const responses: ViewMenuResponses = {
      settings,
      sorts: { viewDefinitionId: view, viewType: settings.viewType, attributeDefinitions: attributes, viewSortDefinitions: [
        { id: "sort-date", sourceScope: "RECORD", attributeDefinitionId: "date", referenceAttributeIdPathJson: [], sortDirection: "DESC", sortOrder: 0, configJson: null },
        { id: "sort-amount", sourceScope: "RECORD", attributeDefinitionId: "amount", referenceAttributeIdPathJson: [], sortDirection: "ASC", sortOrder: 1, configJson: { nulls: "FIRST" } },
      ] },
      filters: { viewDefinitionId: view, viewType: settings.viewType, attributeDefinitions: attributes, selectOptions: [], statusOptions: settings.statusOptions,
        viewFilterGroupDefinitions: [{ id: "root", parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", sortOrder: 0 }, { id: "child", parentViewFilterGroupDefinitionId: "root", conditionGroupOperator: "OR", sortOrder: 0 }],
        viewFilterConditionDefinitions: [{ id: "condition", viewFilterGroupDefinitionId: "child", sourceScope: "RECORD", attributeDefinitionId: "amount", referenceAttributeIdPathJson: [], comparisonOperator: "gte", comparisonValueJson: 500, multiValueMatchMode: "ANY", sortOrder: 0 }],
      },
    };
    return respond(route, responses[menu]);
  });
  return state;
}
