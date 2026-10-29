import { ViewHeaderMenuReader } from "./view-header-menu-reader";
import type { ViewHeaderConfigurationQuery } from "./ports/view-header-configuration-query.port";
import type { AttributeDefinitionMetadataQuery } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import type { WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { ObjectDefinitionSummaryQuery } from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import type { ListDefinitionSummaryQuery } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import type { ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ViewFilterGroupRow, ViewFilterConditionRow, ViewSettingsRows, ViewGroupRow, ViewGroupSettingRow } from "./view-header-configuration";
import { readReferencePath } from "./view-header-menu.mapper";

const W = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", V = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const A = "cccccccc-cccc-4ccc-8ccc-cccccccccccc", B = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const row = { id: V, workspaceId: W, viewDefinitionId: V, createdAt: new Date("2026-01-01T00:00:00Z"), sortOrder: 0 };
const user: CurrentUserContext = { id: A, sessionId: A, email: "test@example.com", displayName: "Test", platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul" };

// 기능 : 기본 필터 그룹을 생성하고 참조 오류 사례만 덮어씁니다.
function group(extra: Partial<ViewFilterGroupRow> = {}): ViewFilterGroupRow { return { ...row, parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", ...extra }; }
// 기능 : 저장 원본과 미확정 연산자를 가진 조건을 구성합니다.
function condition(extra: Partial<ViewFilterConditionRow> = {}): ViewFilterConditionRow {
  return { ...row, viewFilterGroupDefinitionId: V, sourceScope: "RECORD", attributeDefinitionId: A, referenceAttributeIdPathJson: [], comparisonOperator: "futureOperator", comparisonValueJson: null, multiValueMatchMode: "ANY", ...extra };
}
// 기능 : 빈 보기 설정 결과를 만듭니다.
function settings(extra: Partial<ViewSettingsRows> = {}): ViewSettingsRows {
  return { viewAttributeSettingDefinitions: [], viewGroupDefinitions: [], viewGroupSettingDefinitions: [], viewWidgetDefinitions: [], ...extra };
}
// 기능 : 저장된 그룹 기준을 만듭니다.
function viewGroup(): ViewGroupRow { return { ...row, sourceScope: "LIST_ENTRY", attributeDefinitionId: A, referenceAttributeIdPathJson: [], groupRole: "GROUP", sortDirection: "DESC", configJson: null }; }
// 기능 : 그룹별 표시 상태를 만듭니다.
function groupSetting(extra: Partial<ViewGroupSettingRow> = {}): ViewGroupSettingRow {
  return { ...row, viewGroupDefinitionId: V, attributeDefinitionId: A, statusOptionId: null, selectOptionId: B, groupKeyJson: null, labelOverride: null, isHidden: true, isFold: true, configJson: null, ...extra };
}

// 기능 : 세 메뉴의 권한·읽기 무결성·부수 효과와 로그를 검증합니다.
describe("ViewHeaderMenuReader", () => {
  let views: jest.Mocked<ViewHeaderConfigurationQuery>;
  let metadata: jest.Mocked<AttributeDefinitionMetadataQuery>;
  let access: jest.Mocked<WorkspaceAccessQuery>;
  let objects: jest.Mocked<ObjectDefinitionSummaryQuery>;
  let lists: jest.Mocked<ListDefinitionSummaryQuery>;
  let logger: jest.Mocked<ApplicationLogger>;
  let reader: ViewHeaderMenuReader;

  // 기능 : 소유 모듈의 공개 Port만 대체한 읽기 테스트를 준비합니다.
  beforeEach(() => {
    views = { findView: jest.fn().mockResolvedValue({ id: V, workspaceId: W, objectDefinitionId: null, listDefinitionId: null, name: "view", type: "TABLE", configJson: null }), findFilters: jest.fn().mockResolvedValue({ viewFilterGroupDefinitions: [], viewFilterConditionDefinitions: [] }), findSorts: jest.fn().mockResolvedValue([]), findSettings: jest.fn().mockResolvedValue(settings()), findContentViews: jest.fn().mockResolvedValue([]) };
    metadata = { findAttributes: jest.fn().mockResolvedValue([{ id: A, workspaceId: W, objectDefinitionId: B, listDefinitionId: null, type: "Select", title: "field", icon: null, isMultiselect: false, configJson: ["raw", 1] }]), findOptions: jest.fn().mockResolvedValue({ selectOptions: [{ id: B, workspaceId: W, attributeDefinitionId: A, title: "option", color: null, sortOrder: 0, createdAt: row.createdAt }], statusOptions: [] }) };
    access = { hasWorkspaceMembership: jest.fn().mockResolvedValue(true), getWorkspaceMemberAccess: jest.fn() };
    objects = { findObjectDefinitionSummary: jest.fn().mockResolvedValue({ id: B, singularName: "object", icon: null }) };
    lists = { findListDefinitionSummary: jest.fn().mockResolvedValue({ id: B, name: "list", icon: null }) };
    logger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };
    reader = new ViewHeaderMenuReader(access, objects, lists, views, metadata, logger, () => 100);
  });

  // 기능 : Actor 조회 없이 빈 메뉴를 읽고 불필요한 batch와 다른 메뉴 조회를 생략합니다.
  it.each(["filters", "sorts", "settings"] as const)("reads empty %s with no metadata calls", async menu => {
    expect(await reader[menu](user, W.toUpperCase(), V.toUpperCase(), null)).toMatchObject({ viewDefinitionId: V, viewType: "TABLE", attributeDefinitions: [] });
    expect(access.hasWorkspaceMembership).toHaveBeenCalledWith(A, W);
    expect(access.getWorkspaceMemberAccess).not.toHaveBeenCalled();
    expect(metadata.findAttributes).not.toHaveBeenCalled();
    expect(metadata.findOptions).not.toHaveBeenCalled();
    expect(views.findContentViews).not.toHaveBeenCalled();
    expect([views.findFilters, views.findSorts, views.findSettings].reduce((n, mock) => n + mock.mock.calls.length, 0)).toBe(1);
  });

  // 기능 : 비멤버의 존재 탐색을 차단합니다.
  it("stops before all View reads for nonmembers", async () => {
    access.hasWorkspaceMembership.mockResolvedValue(false);
    await expect(reader.filters(user, W, V, null)).rejects.toMatchObject({ code: "ViewHeaderWorkspaceNotFound" });
    expect(views.findView).not.toHaveBeenCalled();
  });

  // 기능 : 없는 View와 교차 Workspace View를 같은 404로 처리합니다.
  it.each([null, { id: V, workspaceId: B }])("hides inaccessible Views", async value => {
    views.findView.mockResolvedValue(value as Awaited<ReturnType<ViewHeaderConfigurationQuery["findView"]>>);
    await expect(reader.sorts(user, W, V, null)).rejects.toMatchObject({ code: "ViewHeaderViewDefinitionNotFound" });
    expect(views.findSorts).not.toHaveBeenCalled();
  });

  // 기능 : 두 원본 참조를 각각 검증하며 임의 XOR를 적용하지 않습니다.
  it("checks both optional owner references and classifies broken references as 500", async () => {
    const view = await views.findView({ workspaceId: W, viewDefinitionId: V });
    views.findView.mockResolvedValue({ ...view!, objectDefinitionId: B, listDefinitionId: B });
    await reader.sorts(user, W, V, null);
    expect(objects.findObjectDefinitionSummary).toHaveBeenCalledTimes(1);
    expect(lists.findListDefinitionSummary).toHaveBeenCalledTimes(1);
    lists.findListDefinitionSummary.mockResolvedValue(null);
    await expect(reader.sorts(user, W, V, null)).rejects.toMatchObject({ code: "ViewHeaderConfigurationInvalid", reason: "view_target_unavailable" });
  });

  // 기능 : 여러 루트와 빈 그룹, 미정 연산자·비교 JSON을 그대로 보존합니다.
  it("preserves saved paths, roots, JSON and reads attributes once", async () => {
    views.findFilters.mockResolvedValue({ viewFilterGroupDefinitions: [group(), group({ id: B })], viewFilterConditionDefinitions: [condition({ referenceAttributeIdPathJson: [A.toUpperCase(), A], comparisonValueJson: { amount: "123456789012345678.90" } })] });
    const result = await reader.filters(user, W, V, null);
    expect(result.viewFilterConditionDefinitions[0]).toMatchObject({ referenceAttributeIdPathJson: [A.toUpperCase(), A], comparisonOperator: "futureOperator", comparisonValueJson: { amount: "123456789012345678.90" } });
    expect(result.viewFilterGroupDefinitions).toHaveLength(2);
    expect(metadata.findAttributes).toHaveBeenCalledWith(W, [A]);
    expect(metadata.findAttributes).toHaveBeenCalledTimes(1);
    expect(result.attributeDefinitions[0]).not.toHaveProperty("workspaceId");
    expect(result.viewFilterGroupDefinitions[0]).not.toHaveProperty("createdAt");
  });

  // 기능 : 루트 유무와 관계없이 끊어진 부모와 순환을 거부합니다.
  it.each([
    [group({ parentViewFilterGroupDefinitionId: B })],
    [group({ parentViewFilterGroupDefinitionId: V })],
    [group({ parentViewFilterGroupDefinitionId: B }), group({ id: B, parentViewFilterGroupDefinitionId: V })],
  ])("rejects broken/cyclic hierarchy %j", async (...groups) => {
    views.findFilters.mockResolvedValue({ viewFilterGroupDefinitions: groups, viewFilterConditionDefinitions: [] });
    await expect(reader.filters(user, W, V, null)).rejects.toMatchObject({ code: "ViewHeaderConfigurationInvalid" });
  });

  // 기능 : 부모 map에 없는 조건과 교차 View 행을 누락시키지 않고 오류 처리합니다.
  it("rejects missing condition groups and foreign configuration scope", async () => {
    views.findFilters.mockResolvedValue({ viewFilterGroupDefinitions: [], viewFilterConditionDefinitions: [condition()] });
    await expect(reader.filters(user, W, V, null)).rejects.toMatchObject({ reason: "filter_parent_invalid" });
    views.findFilters.mockResolvedValue({ viewFilterGroupDefinitions: [group({ workspaceId: B })], viewFilterConditionDefinitions: [] });
    await expect(reader.filters(user, W, V, null)).rejects.toMatchObject({ reason: "configuration_scope_invalid" });
  });

  // 기능 : 저장 경로 형식 오류는 DB 값 보정 없이 안전한 오류가 됩니다.
  it.each([null, {}, [1], ["invalid"], "[]"])("rejects invalid stored path %j", value => {
    expect(() => readReferencePath(value)).toThrow("View configuration is invalid");
  });

  // 기능 : 경로 중간 속성도 누락과 교차 Workspace를 확인합니다.
  it("requires every referenced attribute in the request Workspace", async () => {
    views.findFilters.mockResolvedValue({ viewFilterGroupDefinitions: [group()], viewFilterConditionDefinitions: [condition({ referenceAttributeIdPathJson: [B] })] });
    await expect(reader.filters(user, W, V, null)).rejects.toMatchObject({ reason: "attribute_unavailable" });
    metadata.findAttributes.mockResolvedValue([{ ...(await metadata.findAttributes(W, []))[0]!, workspaceId: B }]);
    await expect(reader.filters(user, W, V, null)).rejects.toMatchObject({ reason: "attribute_unavailable" });
  });

  // 기능 : 정렬은 원본 방향과 config를 보존하고 옵션을 읽지 않습니다.
  it("preserves directions without querying options", async () => {
    views.findSorts.mockResolvedValue([{ ...row, attributeDefinitionId: A, referenceAttributeIdPathJson: [], sourceScope: "RECORD", sortDirection: "DESC", configJson: ["raw"] }]);
    expect((await reader.sorts(user, W, V, null)).viewSortDefinitions[0]).toMatchObject({ sortDirection: "DESC", configJson: ["raw"] });
    expect(metadata.findOptions).not.toHaveBeenCalled();
  });

  // 기능 : 부모 그룹과 설정의 속성 불일치를 차단합니다.
  it("rejects GroupSetting attribute mismatch", async () => {
    views.findSettings.mockResolvedValue(settings({ viewGroupDefinitions: [viewGroup()], viewGroupSettingDefinitions: [groupSetting({ attributeDefinitionId: B })] }));
    await expect(reader.settings(user, W, V, null)).rejects.toMatchObject({ reason: "group_attribute_mismatch" });
  });

  // 기능 : 같은 Workspace의 다른 속성 옵션 및 누락 옵션을 차단합니다.
  it.each(["foreign-attribute", "missing", "foreign-workspace"])("rejects %s group option", async kind => {
    views.findSettings.mockResolvedValue(settings({ viewGroupDefinitions: [viewGroup()], viewGroupSettingDefinitions: [groupSetting()] }));
    const options = await metadata.findOptions({ workspaceId: W, selectAttributeIds: [], statusAttributeIds: [], selectOptionIds: [], statusOptionIds: [] });
    metadata.findOptions.mockResolvedValue({ selectOptions: kind === "missing" ? [] : [{ ...options.selectOptions[0]!, ...(kind === "foreign-workspace" ? { workspaceId: B } : { attributeDefinitionId: B }) }], statusOptions: [] });
    await expect(reader.settings(user, W, V, null)).rejects.toMatchObject({ reason: "group_option_invalid" });
  });

  // 기능 : 11개 View 타입에서 숨김 상태와 직접 원본 위젯을 보존합니다.
  it.each(["TABLE", "KANBAN", "LIST", "GALLERY", "CALENDAR", "TIMELINE", "GANTT", "CHART", "PIVOT", "MAP", "DASHBOARD"] as const)("reads %s settings without type restrictions", async type => {
    views.findView.mockResolvedValue({ id: V, workspaceId: W, objectDefinitionId: null, listDefinitionId: null, name: "view", type, configJson: { showTitle: false } });
    const widget = { ...row, contentViewDefinitionId: V, titleOverride: null, isHidden: true, layoutJson: ["raw"], configJson: null };
    views.findSettings.mockResolvedValue(settings({ viewGroupDefinitions: [viewGroup()], viewGroupSettingDefinitions: [groupSetting()], viewWidgetDefinitions: [widget, { ...widget, id: B }] }));
    views.findContentViews.mockResolvedValue([{ id: V, workspaceId: W, name: "view", type, icon: null }]);
    const result = await reader.settings(user, W, V, "request-1");
    expect(result.viewWidgetDefinitions).toHaveLength(2);
    expect(result.viewGroupSettingDefinitions[0]).toMatchObject({ isHidden: true, isFold: true, labelOverride: null });
    expect(views.findContentViews).toHaveBeenCalledWith(W, [V]);
    expect(views.findSettings).toHaveBeenCalledTimes(1);
    expect(result.selectOptions).toHaveLength(1);
  });

  // 기능 : 위젯 원본 누락을 성공의 빈 목록으로 숨기지 않습니다.
  it("fails on unavailable widget content", async () => {
    views.findSettings.mockResolvedValue(settings({ viewWidgetDefinitions: [{ ...row, contentViewDefinitionId: B, titleOverride: null, isHidden: false, layoutJson: {}, configJson: null }] }));
    await expect(reader.settings(user, W, V, null)).rejects.toMatchObject({ reason: "widget_content_unavailable" });
  });

  // 기능 : 서버 원문 오류와 비교값을 로그에 넣지 않고 요청 ID를 보존합니다.
  it("logs safe failure context", async () => {
    views.findSorts.mockRejectedValue(new Error("private-token-and-database-detail"));
    await expect(reader.sorts(user, W, V, "request-123")).rejects.toThrow();
    const log = logger.error.mock.calls[0]![0];
    expect(log).toContain("request-123");
    expect(log).toContain("view.header.sorts.read_failed");
    expect(log).not.toContain("private-token");
  });
});
