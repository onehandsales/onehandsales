import { Inject, Injectable } from "@nestjs/common";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY, type AttributeDefinitionMetadataQuery, type AttributeDefinitionMetadata, type AttributeOptionMetadata } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { OBJECT_DEFINITION_SUMMARY_QUERY, type ObjectDefinitionSummaryQuery } from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import { LIST_DEFINITION_SUMMARY_QUERY, type ListDefinitionSummaryQuery } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import { APPLICATION_LOGGER, type ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { JsonValue } from "@/shared/application/types/json-value";
import { ViewHeaderConfigurationInvalidError, ViewHeaderViewDefinitionNotFoundError, ViewHeaderWorkspaceNotFoundError, type ViewHeaderInvalidReason } from "../domain/view-definition.errors";
import { VIEW_HEADER_CONFIGURATION_QUERY, VIEW_HEADER_CLOCK, type ViewHeaderConfigurationQuery } from "./ports/view-header-configuration-query.port";
import type { ViewHeaderScope, ViewHeaderDefinition, ViewConfigurationRow, ViewFilterRows, ViewGroupSettingRow } from "./view-header-configuration";
import * as map from "./view-header-menu.mapper";

// 역할 : 세 메뉴의 접근·일괄 메타데이터·참조 검증을 조합합니다.
@Injectable()
export class ViewHeaderMenuReader {
  // 기능 : 소유 모듈의 공개 조회와 로그·시계 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly access: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_SUMMARY_QUERY) private readonly objects: ObjectDefinitionSummaryQuery,
    @Inject(LIST_DEFINITION_SUMMARY_QUERY) private readonly lists: ListDefinitionSummaryQuery,
    @Inject(VIEW_HEADER_CONFIGURATION_QUERY) private readonly views: ViewHeaderConfigurationQuery,
    @Inject(ATTRIBUTE_DEFINITION_METADATA_QUERY) private readonly metadata: AttributeDefinitionMetadataQuery,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
    @Inject(VIEW_HEADER_CLOCK) private readonly now: () => number,
  ) {}

  // 기능 : 저장된 필터 계층과 조건·속성·옵션을 반환합니다.
  filters(user: CurrentUserContext, workspaceId: string, viewId: string, requestId: string | null) {
    return this.read(user, workspaceId, viewId, requestId, "filters", async (scope, view, counts) => {
      // 1. 해당 View의 필터만 조회하고 전체 계층을 검증한다.
      const rows = await this.views.findFilters(scope);
      counts.filterGroups = rows.viewFilterGroupDefinitions.length;
      counts.filterConditions = rows.viewFilterConditionDefinitions.length;
      this.validateRows(scope, [...rows.viewFilterGroupDefinitions, ...rows.viewFilterConditionDefinitions]);
      this.validateFilterTree(rows);
      // 2. 경로와 최종 속성의 메타데이터 및 옵션을 일괄 복원한다.
      const attributes = await this.attributes(scope, rows.viewFilterConditionDefinitions);
      const options = await this.options(scope, attributes, []);
      // 3. 내부 소속과 시각을 제외한 계약 필드를 반환한다.
      return { viewDefinitionId: view.id, viewType: view.type,
        viewFilterGroupDefinitions: rows.viewFilterGroupDefinitions.map(map.mapFilterGroup),
        viewFilterConditionDefinitions: rows.viewFilterConditionDefinitions.map(map.mapFilterCondition),
        attributeDefinitions: attributes.map(map.mapAttribute), ...options };
    });
  }

  // 기능 : 저장된 정렬의 우선순위와 방향을 반환합니다.
  sorts(user: CurrentUserContext, workspaceId: string, viewId: string, requestId: string | null) {
    return this.read(user, workspaceId, viewId, requestId, "sorts", async (scope, view, counts) => {
      // 1. 정렬 행과 참조 속성만 조회하고 옵션·본문 값은 읽지 않는다.
      const rows = await this.views.findSorts(scope);
      counts.sorts = rows.length;
      this.validateRows(scope, rows);
      const attributes = await this.attributes(scope, rows);
      return { viewDefinitionId: view.id, viewType: view.type, viewSortDefinitions: rows.map(map.mapSort), attributeDefinitions: attributes.map(map.mapAttribute) };
    });
  }

  // 기능 : 타입과 무관하게 저장된 표시·그룹·위젯 설정을 반환합니다.
  settings(user: CurrentUserContext, workspaceId: string, viewId: string, requestId: string | null) {
    return this.read(user, workspaceId, viewId, requestId, "settings", async (scope, view, counts) => {
      // 1. 네 설정 목록의 소속과 그룹 기준의 정확한 Attribute 일치를 확인한다.
      const rows = await this.views.findSettings(scope);
      for (const [name, values] of Object.entries(rows)) counts[name] = values.length;
      this.validateRows(scope, Object.values(rows).flat());
      const groups = new Map(rows.viewGroupDefinitions.map(row => [row.id.toLowerCase(), row]));
      for (const setting of rows.viewGroupSettingDefinitions) {
        const parent = groups.get(setting.viewGroupDefinitionId.toLowerCase());
        if (!parent || parent.attributeDefinitionId.toLowerCase() !== setting.attributeDefinitionId.toLowerCase()) this.invalid("group_attribute_mismatch");
      }
      // 2. 최종·경로·그룹 설정의 속성 및 명시 옵션을 검증한다.
      const attributes = await this.attributes(scope, [...rows.viewAttributeSettingDefinitions, ...rows.viewGroupDefinitions], rows.viewGroupSettingDefinitions.map(row => row.attributeDefinitionId));
      const options = await this.options(scope, attributes, rows.viewGroupSettingDefinitions);
      // 3. 직접 위젯 원본만 조회하고 누락을 확인한다.
      const ids = uniqueIds(rows.viewWidgetDefinitions.map(row => row.contentViewDefinitionId));
      const contents = ids.length ? await this.views.findContentViews(scope.workspaceId, ids) : [];
      const contentMap = new Map(contents.map(row => [row.id.toLowerCase(), row]));
      if (ids.some(id => !contentMap.has(id)) || contents.some(row => row.workspaceId.toLowerCase() !== scope.workspaceId)) this.invalid("widget_content_unavailable");
      // 4. 숨김·반복 행과 저장 JSON을 그대로 공개 응답에 매핑한다.
      return { viewDefinitionId: view.id, viewType: view.type, viewName: view.name,
        objectDefinitionId: view.objectDefinitionId, listDefinitionId: view.listDefinitionId, configJson: view.configJson,
        viewAttributeSettingDefinitions: rows.viewAttributeSettingDefinitions.map(map.mapAttributeSetting),
        viewGroupDefinitions: rows.viewGroupDefinitions.map(map.mapGroup),
        viewGroupSettingDefinitions: rows.viewGroupSettingDefinitions.map(map.mapGroupSetting),
        viewWidgetDefinitions: rows.viewWidgetDefinitions.map(map.mapWidget),
        contentViewDefinitions: contents.map(map.mapContentView),
        attributeDefinitions: attributes.map(map.mapAttribute), ...options };
    });
  }

  // 기능 : 인증된 멤버의 선택 View를 확인하고 읽기 실패를 안전하게 기록합니다.
  private async read<T>(user: CurrentUserContext, workspaceId: string, viewId: string, requestId: string | null, menu: "filters" | "sorts" | "settings", work: (scope: ViewHeaderScope, view: ViewHeaderDefinition, counts: Record<string, number>) => Promise<T>): Promise<T> {
    const scope = { workspaceId: workspaceId.toLowerCase(), viewDefinitionId: viewId.toLowerCase() };
    const started = this.now();
    const counts: Record<string, number> = {};
    try {
      // 1. Actor가 없는 멤버도 읽을 수 있으며 소속 검증 전에 설정을 읽지 않는다.
      if (!await this.access.hasWorkspaceMembership(user.id, scope.workspaceId)) throw new ViewHeaderWorkspaceNotFoundError();
      const view = await this.views.findView(scope);
      if (!view || view.workspaceId.toLowerCase() !== scope.workspaceId || view.id.toLowerCase() !== scope.viewDefinitionId) throw new ViewHeaderViewDefinitionNotFoundError();
      // 2. 명시된 Object/List 원본을 각 소유 모듈에서 확인한다.
      if (view.objectDefinitionId && !await this.objects.findObjectDefinitionSummary({ workspaceId: scope.workspaceId, objectDefinitionId: view.objectDefinitionId })) this.invalid("view_target_unavailable");
      if (view.listDefinitionId && !await this.lists.findListDefinitionSummary({ workspaceId: scope.workspaceId, listDefinitionId: view.listDefinitionId })) this.invalid("view_target_unavailable");
      return await work(scope, view, counts);
    } catch (error) {
      // 3. 접근 부재는 기존 access log에 맡기고 저장/서버 실패만 원문 없이 기록한다.
      if (!(error instanceof ViewHeaderWorkspaceNotFoundError) && !(error instanceof ViewHeaderViewDefinitionNotFoundError)) {
        this.logger.error(JSON.stringify({ event: `view.header.${menu}.read_failed`, requestId, userId: user.id, ...scope, menu,
          durationMs: Math.max(0, this.now() - started), counts,
          errorCode: error instanceof ViewHeaderConfigurationInvalidError ? error.code : "InternalServerError",
          reason: error instanceof ViewHeaderConfigurationInvalidError ? error.reason : "unexpected_failure" }), undefined, "ViewHeaderMenuReader");
      }
      throw error;
    }
  }

  // 기능 : 조회 adapter가 반환한 하위 행의 소속을 다시 확인합니다.
  private validateRows(scope: ViewHeaderScope, rows: ViewConfigurationRow[]) {
    if (rows.some(row => row.workspaceId.toLowerCase() !== scope.workspaceId || row.viewDefinitionId.toLowerCase() !== scope.viewDefinitionId)) this.invalid("configuration_scope_invalid");
  }

  // 기능 : 직접·경로 속성의 UUID와 Workspace를 검증합니다.
  private async attributes(scope: ViewHeaderScope, rows: { attributeDefinitionId: string; referenceAttributeIdPathJson: JsonValue }[], additional: string[] = []) {
    // 1. 경로 원본은 유지하고 batch 조회 키만 중복 제거한다.
    const ids = uniqueIds([...additional, ...rows.flatMap(row => [row.attributeDefinitionId, ...map.readReferencePath(row.referenceAttributeIdPathJson)])]);
    const attributes = ids.length ? await this.metadata.findAttributes(scope.workspaceId, ids) : [];
    const found = new Set(attributes.map(row => row.id.toLowerCase()));
    const requested = new Set(ids);
    // 2. 참조 누락과 교차 Workspace를 같은 설정 오류로 처리한다.
    if (ids.some(id => !found.has(id)) || attributes.some(row => row.workspaceId.toLowerCase() !== scope.workspaceId || !requested.has(row.id.toLowerCase()))) this.invalid("attribute_unavailable");
    return attributes;
  }

  // 기능 : 전체 옵션과 명시 옵션의 정확한 소속을 검사합니다.
  private async options(scope: ViewHeaderScope, attributes: AttributeDefinitionMetadata[], settings: ViewGroupSettingRow[]) {
    const input = { workspaceId: scope.workspaceId,
      selectAttributeIds: attributes.filter(row => row.type === "Select").map(row => row.id),
      statusAttributeIds: attributes.filter(row => row.type === "Status").map(row => row.id),
      selectOptionIds: uniqueIds(settings.flatMap(row => row.selectOptionId ? [row.selectOptionId] : [])),
      statusOptionIds: uniqueIds(settings.flatMap(row => row.statusOptionId ? [row.statusOptionId] : [])) };
    // 1. 옵션 대상이 없으면 Port 호출도 생략한다.
    if (![input.selectAttributeIds, input.statusAttributeIds, input.selectOptionIds, input.statusOptionIds].some(ids => ids.length)) return { selectOptions: [], statusOptions: [] };
    const options = await this.metadata.findOptions(input);
    const attributeIds = new Set(attributes.map(row => row.id.toLowerCase()));
    for (const option of [...options.selectOptions, ...options.statusOptions]) {
      if (option.workspaceId.toLowerCase() !== scope.workspaceId || !attributeIds.has(option.attributeDefinitionId.toLowerCase())) this.invalid("group_option_invalid");
    }
    // 2. 같은 Workspace의 다른 속성 옵션도 잘못된 그룹 연결로 거부한다.
    this.validateOptions(settings, options.selectOptions, "selectOptionId");
    this.validateOptions(settings, options.statusOptions, "statusOptionId");
    return { selectOptions: options.selectOptions.map(map.mapOption), statusOptions: options.statusOptions.map(map.mapOption) };
  }

  // 기능 : 각 그룹 설정의 명시 옵션이 같은 Attribute에 속하는지 확인합니다.
  private validateOptions(settings: ViewGroupSettingRow[], options: AttributeOptionMetadata[], field: "selectOptionId" | "statusOptionId") {
    const byId = new Map(options.map(option => [option.id.toLowerCase(), option]));
    for (const setting of settings) {
      const id = setting[field];
      if (!id) continue;
      const option = byId.get(id.toLowerCase());
      if (!option || option.attributeDefinitionId.toLowerCase() !== setting.attributeDefinitionId.toLowerCase()) this.invalid("group_option_invalid");
    }
  }

  // 기능 : 루트 없는 컴포넌트까지 검사해 끊어진 부모와 모든 순환을 차단합니다.
  private validateFilterTree(rows: ViewFilterRows) {
    const groups = new Map(rows.viewFilterGroupDefinitions.map(row => [row.id.toLowerCase(), row]));
    const done = new Set<string>();
    // 1. 각 그룹의 부모 체인을 반복문으로 방문해 깊은 계층의 호출 스택 증가를 피한다.
    for (const start of groups.keys()) {
      const visiting = new Set<string>();
      let id: string | null = start;
      while (id !== null && !done.has(id)) {
        if (visiting.has(id)) this.invalid("filter_cycle");
        const group = groups.get(id);
        if (!group) this.invalid("filter_parent_invalid");
        visiting.add(id);
        id = group.parentViewFilterGroupDefinitionId?.toLowerCase() ?? null;
      }
      for (const visited of visiting) done.add(visited);
    }
    // 2. 조건도 현재 View에 있는 그룹만 참조하도록 확인한다.
    if (rows.viewFilterConditionDefinitions.some(row => !groups.has(row.viewFilterGroupDefinitionId.toLowerCase()))) this.invalid("filter_parent_invalid");
  }

  // 기능 : 민감한 원본 없이 고정 원인 코드로 읽기를 중단합니다.
  private invalid(reason: ViewHeaderInvalidReason): never { throw new ViewHeaderConfigurationInvalidError(reason); }
}

// 기능 : 저장 문자열과 분리된 UUID 비교·조회 키를 만듭니다.
function uniqueIds(ids: string[]): string[] { return [...new Set(ids.map(id => id.toLowerCase()))]; }
