import type { Page, Route } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./user-web-api-mocks";
import type { SupportedViewDataType, ViewDataBinding, ViewDataItem, ViewMainResponse, ViewKanbanResponse } from "../../../src/features/crm-view/types/view-data";

export const DATA_OBJECT_PATH = "/app/workspaces/workspace-e2e-001/objects/object-definition-company";
export const DATA_LIST_PATH = "/app/workspaces/workspace-e2e-001/lists/list-definition-pipeline";
const names = { TABLE: "전체 업무", KANBAN: "단계별 진행", LIST: "담당자별 업무" };
const binding: ViewDataBinding = { id: "title", attributeDefinitionId: "name", sourceScope: "RECORD", referenceAttributeIdPath: [], role: "TITLE", label: "회사명", attributeType: "Text", isMultiselect: false, isHidden: false, width: 190, format: null, currencyCode: null };

// 기능 : 실제 route·헤더·본문을 유지하고 원격 API 응답만 제어합니다.
export async function setupViewDataScenario(page: Page, preferredLocale: "ko-KR" | "en" = "ko-KR") {
  await setupUserWebApiMocks(page, { store: { preferredLocale } }); await seedAuthenticatedSession(page);
  const state = { requests: [] as URL[], writes: [] as { method: string; path: string; body: unknown }[], legacyReads: [] as string[],
    columns: [] as { id: string; name: string; type: string }[], columnError: 0, columnErrorCode: "InternalServerError", delayColumn: false, columnResponseLost: false,
    columnLabels: {} as Record<string, string | null>, labelError: 0, delayLabel: false,
    pagination: false, folded: false, hidden: false, noView: false, needsConfiguration: false, empty: false,
    mainError: 0, groupError: 0, nextError: 0, version: 1, added: 0, delayObject: false, delayList: false, delayWrite: false, titles: {} as Record<string, string>,
    references: false, recordResponseLost: false, recordError: 0, creationIds: [] as string[],
    headers: [] as URL[], menuReads: [] as URL[], favorites: [] as SupportedViewDataType[],
    sources: {} as Record<string, "OBJECT" | "LIST" | "BOTH" | "NONE">, directError: 0, mismatchedHeader: false, delayedViews: [] as string[] };
  page.on("request", request => {
    const url = new URL(request.url());
    if (request.method() === "GET" && /\/object-definitions\/[^/]+\/record-definitions/.test(url.pathname)) state.legacyReads.push(url.pathname);
    if (request.method() === "GET" && /\/view-definitions\/[^/]+\/(filters|sorts|settings)$/.test(url.pathname)) state.menuReads.push(url);
  });
  // 기능 : 개발 서버와 API origin 사이의 실제 preflight 조건을 재현합니다.
  async function respond(route: Route, body: unknown, status = 200) {
    const headers = { "access-control-allow-origin": route.request().headers().origin ?? "http://127.0.0.1:5175", "access-control-allow-credentials": "true", "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS", "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id" };
    await route.fulfill(route.request().method() === "OPTIONS" ? { status: 204, headers } : { json: body, status, headers });
  }
  // 기능 : 같은 Record의 여러 Entry와 큰 Decimal·빈 값을 포함한 표시 항목을 만듭니다.
  function items(list: boolean): ViewDataItem[] {
    if (state.empty) return [];
    const count = (state.pagination ? 27 : list ? 3 : 2) + state.added;
    return Array.from({ length: count }, (_, index) => {
      const record = list && index < 2 ? "record-0" : "record-" + index;
      const id = list ? "entry-" + index : record;
      const title = state.titles[record] ?? (index === 0 || list && index === 1 ? "A회사" : "회사 " + index);
      return { itemKey: (list ? "LIST_ENTRY:" : "RECORD:") + id, occurrenceKey: id, recordDefinitionId: record,
        objectDefinitionId: "object-definition-company", listEntryDefinitionId: list ? id : null, title, groupPath: [],
        cells: [
          { bindingId: "title", state: "VALUE", values: [{ valueDefinitionId: "name-" + record, sourceEntity: { kind: "RECORD", id: record }, value: title }] },
          { bindingId: "amount", state: "VALUE", values: [{ valueDefinitionId: "amount-" + record, sourceEntity: { kind: "RECORD", id: record }, value: "9007199254740992.0000000002" }, { valueDefinitionId: "amount-second-" + record, sourceEntity: { kind: "RECORD", id: record }, value: "0" }] },
          ...(state.references ? [{ bindingId: "company", state: "VALUE" as const, values: [{ valueDefinitionId: "company-" + record, sourceEntity: { kind: "RECORD" as const, id: record }, value: { recordDefinitionId: "company-openai", label: "OpenAI" } }] }] : []),
          ...(list ? [{ bindingId: "note", state: "VALUE" as const, values: [{ valueDefinitionId: "note-" + id, sourceEntity: { kind: "LIST_ENTRY" as const, id }, value: "업무 " + index }] }] : []),
        ] };
    });
  }
  // 기능 : 세 타입에 공통인 원본과 바인딩을 현재 요청 맥락에 맞춰 구성합니다.
  function data(url: URL, type: SupportedViewDataType): ViewMainResponse {
    const list = url.searchParams.get("sourceType") === "LIST";
    const all = items(list), q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const filtered = all.filter(item => item.title.toLowerCase().includes(q));
    const base = { viewDefinitionId: "view-" + type.toLowerCase(), viewType: type, viewName: names[type],
      source: { kind: list ? "LIST" as const : "OBJECT" as const, objectDefinitionId: list ? null : "object-definition-company", listDefinitionId: list ? "list-definition-pipeline" : null, itemKind: list ? "LIST_ENTRY" as const : "RECORD" as const },
      configurationFingerprint: "configuration-" + state.version, issues: [], bindings: [binding,
        { ...binding, id: "amount", attributeDefinitionId: "amount", label: "금액", role: "DISPLAY", attributeType: "Number", isMultiselect: true, width: 320 },
        ...(list ? [{ ...binding, id: "note", attributeDefinitionId: "note", label: "업무 메모", role: "DISPLAY", sourceScope: "LIST_ENTRY" as const }] : state.columns.map(column => ({ ...binding, id: column.id, attributeDefinitionId: `attribute-${column.id}`, label: column.name, role: "DISPLAY", attributeType: column.type })))],
      summary: { sourceItemCount: all.length, matchedItemCount: filtered.length, eligibleItemCount: filtered.length } };
    if (state.references) base.bindings.push({ ...binding, id: "company", attributeDefinitionId: "company", label: "대상 회사", role: "DISPLAY", attributeType: "RecordReference" });
    base.bindings = base.bindings.map(value => ({ ...value, label: state.columnLabels[`${base.viewDefinitionId}:${value.id}`] ?? value.label }));
    if (state.needsConfiguration) return { ...base, viewType: type, state: "NEEDS_CONFIGURATION", part: "MAIN", summary: null, bindings: [], data: null };
    const offset = url.searchParams.has("cursor") ? 25 : 0;
    const pageInfo = { hasNextPage: filtered.length > offset + 25, nextCursor: filtered.length > offset + 25 ? "main-next" : null };
    if (type === "TABLE") return { ...base, state: "READY", part: "MAIN", viewType: "TABLE", data: { presentation: { rowDensity: null }, columnBindingIds: base.bindings.map(value => value.id), items: filtered.slice(offset, offset + 25), groups: [], pageInfo } };
    if (type === "LIST") return { ...base, state: "READY", part: "MAIN", viewType: "LIST", data: { presentation: { rowDensity: null }, items: filtered.slice(offset, offset + 25).map(item => ({ ...item, occurrenceKey: item.occurrenceKey + ":owner", groupPath: ["owner"] })), groups: [{ key: "owner", parentKey: null, label: "김영업", color: null, count: filtered.length, isHidden: false, isFold: false }], pageInfo } };
    const first = filtered.slice(0, -1), second = filtered.slice(-1);
    return { ...base, state: "READY", part: "MAIN", viewType: "KANBAN", data: { presentation: { cardDensity: null, showEmptyGroups: null }, groupDefinitionId: "stage", unassignedCount: 0,
      columns: [first, second].map((rows, index) => ({ key: "stage-" + index, parentKey: null, label: index ? "제안 중" : "상담 중", color: null, count: rows.length, isHidden: index === 1 && state.hidden, isFold: index === 1 && state.folded,
        groupToken: "token-" + index + "-" + state.version,
        items: index === 1 && (state.hidden || state.folded) ? [] : rows.slice(0, 25),
        pageInfo: { hasNextPage: rows.length > 25 && index === 0, nextCursor: rows.length > 25 && index === 0 ? "stage-next" : null }, calculations: [] })) } };
  }
  await page.route(/\/view-header(?:\?.*)?$/, async route => {
    const url = new URL(route.request().url()); if (route.request().method() === "GET") state.headers.push(url);
    const list = url.searchParams.get("targetType") === "LIST";
    await respond(route, { viewId: state.noView ? null : "view-table", viewType: state.noView ? null : "TABLE", viewName: state.noView ? null : names.TABLE, viewIcon: null, isFavorite: state.favorites.includes("TABLE"),
      objectDefinition: list ? null : { id: "object-definition-company", name: "회사", icon: null },
      listDefinition: list ? { id: "list-definition-pipeline", name: "영업 파이프라인", icon: null } : null });
  });
  await page.route(/\/view-header\/view-definitions\/[^/]+$/, async route => {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const url = new URL(route.request().url()); state.headers.push(url);
    const id = url.pathname.split("/").at(-1)!;
    if (state.delayedViews.includes(id)) await new Promise(resolve => setTimeout(resolve, 700));
    if (state.directError) return respond(route, { statusCode: state.directError, error: "ViewHeaderViewDefinitionNotFound" }, state.directError);
    const type = id.replace("view-", "").toUpperCase() as SupportedViewDataType;
    const source = state.sources[id] ?? "LIST";
    return respond(route, { viewId: state.mismatchedHeader ? "other-view" : id, viewName: names[type], viewType: type, viewIcon: null,
      isFavorite: state.favorites.includes(type), objectDefinition: source === "OBJECT" || source === "BOTH" ? { id: "object-definition-company", name: "회사", icon: null } : null,
      listDefinition: source === "LIST" || source === "BOTH" ? { id: "list-definition-pipeline", name: "영업 파이프라인", icon: null } : null });
  });
  await page.route(/\/sidebar\/workspaces\/[^/]+\/view-favorites$/, route => respond(route, state.favorites.map(type => ({ id: "favorite-" + type, viewDefinitionId: "view-" + type.toLowerCase(), name: names[type], icon: null }))));
  await page.route(/\/view-header\/view-definitions\/[^/]+\/favorite$/, async route => {
    const method = route.request().method(); if (method === "OPTIONS") return respond(route, null);
    const url = new URL(route.request().url()); const id = url.pathname.split("/").at(-2)!;
    const type = id.replace("view-", "").toUpperCase() as SupportedViewDataType;
    state.writes.push({ method, path: url.pathname, body: null });
    state.favorites = method === "DELETE" ? state.favorites.filter(value => value !== type) : [...new Set([...state.favorites, type])];
    return respond(route, { viewDefinitionId: id, isFavorite: state.favorites.includes(type) });
  });
  await page.route(/\/view-header\/view-definitions\/[^/]+\/(filters|sorts|settings)$/, route => {
    const path = new URL(route.request().url()).pathname, id = path.split("/").at(-2)!;
    const type = id.replace("view-", "").toUpperCase() as SupportedViewDataType;
    const base = { viewDefinitionId: id, viewType: type, attributeDefinitions: [], selectOptions: [], statusOptions: [] };
    if (path.endsWith("/filters")) return respond(route, { ...base, viewFilterGroupDefinitions: [], viewFilterConditionDefinitions: [] });
    if (path.endsWith("/sorts")) return respond(route, { ...base, viewSortDefinitions: [] });
    return respond(route, { ...base, viewName: names[type], objectDefinitionId: null, listDefinitionId: "list-definition-pipeline", configJson: null,
      viewAttributeSettingDefinitions: [], viewGroupDefinitions: [], viewGroupSettingDefinitions: [], viewWidgetDefinitions: [], contentViewDefinitions: [] });
  });
  await page.route(/\/view-header\/(object|list)-definitions\/[^/]+\/view-definitions(?:\?.*)?$/, route => respond(route, { items: (["TABLE", "KANBAN", "LIST"] as const).map(viewType => ({ viewDefinitionId: "view-" + viewType.toLowerCase(), viewName: names[viewType], viewType, viewIcon: null, isSelected: false })) }));
  await page.route(/\/view-definitions\/[^/]+\/data(?:\?.*)?$/, async route => {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const url = new URL(route.request().url()); state.requests.push(url);
    if (state.delayObject && url.searchParams.get("sourceType") === "OBJECT") await new Promise(resolve => setTimeout(resolve, 600));
    if (state.delayList && url.searchParams.get("sourceType") === "LIST") await new Promise(resolve => setTimeout(resolve, 1200));
    const type = url.pathname.split("/").at(-2)!.replace("view-", "").toUpperCase() as SupportedViewDataType;
    const response = data(url, type);
    const group = url.searchParams.get("part") === "GROUP_ITEMS";
    const error = group ? state.groupError : url.searchParams.has("cursor") ? state.nextError : state.mainError;
    if (error) return respond(route, { statusCode: error, error: error === 409 ? "ViewDataCursorStale" : "InternalServerError", message: "Safe failure" }, error);
    if (group) {
      const board = response as ViewKanbanResponse;
      const column = board.data.columns.find(value => value.groupToken === url.searchParams.get("groupToken"))!;
      const rows = items(url.searchParams.get("sourceType") === "LIST");
      const candidates = column.key === "stage-0" ? rows.slice(0, -1) : rows.slice(-1);
      const offset = url.searchParams.has("cursor") ? 25 : 0;
      return respond(route, { ...board, part: "GROUP_ITEMS", data: { groupKey: column.key, groupToken: column.groupToken, items: candidates.slice(offset, offset + 25), pageInfo: { hasNextPage: false, nextCursor: null } } });
    }
    await respond(route, response);
  });
  await page.route(/\/view-definitions\/[^/]+\/columns$/, async route => {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const body = route.request().postDataJSON();
    state.writes.push({ method: "POST", path: new URL(route.request().url()).pathname, body });
    if (state.delayColumn) await new Promise(resolve => setTimeout(resolve, 600));
    if (state.columnError) return respond(route, { statusCode: state.columnError, error: state.columnErrorCode }, state.columnError);
    const existing = state.columns.some(column => column.id === body.creationId);
    if (!existing) { state.columns.push({ id: body.creationId, name: body.attributeDefinitionName, type: body.attributeType }); state.version++; }
    if (state.columnResponseLost) { state.columnResponseLost = false; await route.abort("failed"); return; }
    return respond(route, { viewDefinitionId: "view-table", objectDefinitionId: "object-definition-company", attributeDefinitionId: `attribute-${body.creationId}`, viewAttributeSettingDefinitionId: body.creationId }, existing ? 200 : 201);
  });
  await page.route(/\/view-definitions\/[^/]+\/columns\/[^/]+$/, async route => {
    if (route.request().method() === "OPTIONS") return respond(route, null);
    const path = new URL(route.request().url()).pathname, parts = path.split("/");
    const viewId = parts.at(-3)!, columnId = parts.at(-1)!, body = route.request().postDataJSON();
    state.writes.push({ method: route.request().method(), path, body });
    if (state.delayLabel) await new Promise(resolve => setTimeout(resolve, 800));
    if (state.labelError) return respond(route, { statusCode: state.labelError, error: "InternalServerError" }, state.labelError);
    state.columnLabels[`${viewId}:${columnId}`] = body.labelOverride;
    state.version++;
    return respond(route, { viewDefinitionId: viewId, viewAttributeSettingDefinitionId: columnId, labelOverride: body.labelOverride });
  });
  await page.route(/\/object-definitions\/[^/]+\/record-definitions(?:\/.*)?$/, async route => {
    const request = route.request(), method = request.method(), path = new URL(request.url()).pathname;
    if (method === "OPTIONS") return respond(route, null);
    if (method === "GET" && path.endsWith("/form") && new URL(request.url()).searchParams.has("attributeDefinitionId")) return respond(route, {
      items: [{ id: "company-openai", label: "OpenAI" }, { id: "company-samsung", label: "SAMSUNG" }], pageInfo: { hasNextPage: false, nextCursor: null },
    });
    if (method === "GET" && path.endsWith("/form")) return respond(route, { attributes: [
      { id: "name", title: "회사명", type: "Text", isMultiselect: false },
      { id: "amount", title: "금액", type: "Number", isMultiselect: true },
      ...(state.references ? [{ id: "company", title: "대상 회사", type: "RecordReference", isMultiselect: false }] : []),
    ] });
    if (method === "GET") { state.legacyReads.push(path); return respond(route, { items: [], pageInfo: { hasNextPage: false, nextCursor: null } }); }
    const body = request.postData() ? request.postDataJSON() : null; state.writes.push({ method, path, body });
    if (state.delayWrite) await new Promise(resolve => setTimeout(resolve, 400));
    if (state.recordError) return respond(route, { error: "InternalServerError" }, state.recordError);
    if (method === "PATCH" && typeof body.value === "string") state.titles[path.split("/").at(-3)!] = body.value;
    if (method === "POST" && !state.creationIds.includes(body.creationId)) { state.added++; state.creationIds.push(body.creationId); }
    if (method === "POST" && state.recordResponseLost) { state.recordResponseLost = false; return route.abort("failed"); }
    return respond(route, method === "POST" ? { recordDefinitionId: "created-record" } : { recordAttributeValueDefinitionId: path.split("/").at(-1) });
  });
  return state;
}
