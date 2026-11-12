import { Inject, Injectable } from "@nestjs/common";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { WORKSPACE_SNAPSHOT_QUERY, type WorkspaceSnapshotQuery } from "@/modules/workspace/application/ports/workspace-snapshot-query.port";
import { WORKSPACE_ACTOR_OPTIONS_QUERY, type WorkspaceActorOptionsQuery } from "@/modules/workspace/application/ports/workspace-actor-options-query.port";
import { VIEW_ATTRIBUTE_CATALOG_QUERY, type ViewAttributeCatalogQuery } from "@/modules/attribute-definition/application/ports/view-attribute-catalog-query.port";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY, type AttributeDefinitionMetadataQuery } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import { RECORD_OPTIONS_QUERY, type RecordOptionsQuery } from "@/modules/record-definition/application/ports/record-options-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { READ_SNAPSHOT_RUNNER, type ReadSnapshotRunner } from "@/shared/application/ports/read-snapshot-runner.port";
import { TRANSACTION_MANAGER, type TransactionManager, type TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { APPLICATION_LOGGER, type ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { VIEW_DATA_CONFIGURATION_QUERY, type ViewDataConfiguration, type ViewDataConfigurationQuery } from "./ports/view-data-configuration-query.port";
import { VIEW_DATA_TOKEN_CODEC, type ViewDataTokenCodec } from "./ports/view-data-token-codec.port";
import { VIEW_CONFIGURATION_COMMAND, type ViewConfigurationCommandRepository } from "./ports/view-configuration-command.repository";
import { ViewDataLoader, resolveViewSource } from "./view-data/view-data-loader";
import { ViewDataQueryContext, assertSupportedViewType, validateViewDataRequest } from "./view-data/view-data-query-context";
import { ViewDataConfigurationError, ViewDataNeedsConfiguration, assertViewDataLimit } from "./view-data/view-data.errors";
import { readViewData } from "./view-data/view-data-readers";
import { jsonObject, referencePath, UUID } from "./view-data/view-data-json";
import type { ViewDataRequest } from "./view-data/view-data.types";
import type { ViewHeaderScope } from "./view-header-configuration";
import { canonicalConfiguration, invalidViewConfiguration, mergeViewConfiguration, parseViewConfigurationChanges, viewConfigurationSections } from "./view-configuration";
import * as map from "./view-header-menu.mapper";

// 역할 : 설정 저장/미리보기의 기준과 변경 의도를 정의합니다.
export interface ViewConfigurationCommand { readonly baseConfigurationVersion: string; readonly changes: unknown }
// 역할 : 선택 후보를 현재 원본과 속성 경로에 한정하는 입력입니다.
export interface ViewConfigurationOptions {
  readonly sourceType?: "OBJECT" | "LIST"; readonly sourceScope: "RECORD" | "LIST_ENTRY"; readonly attributeDefinitionId: string;
  readonly referenceAttributeIdPath?: string; readonly q?: string; readonly cursor?: string; readonly limit?: number;
}
// 역할 : 설정 조회·미리보기·저장의 권한과 transaction을 조율합니다.
@Injectable()
export class ViewConfigurationService {
  // 기능 : 모든 데이터 접근을 소유 모듈의 공개 port로 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly access: WorkspaceAccessQuery,
    @Inject(WORKSPACE_SNAPSHOT_QUERY) private readonly workspace: WorkspaceSnapshotQuery,
    @Inject(VIEW_DATA_CONFIGURATION_QUERY) private readonly views: ViewDataConfigurationQuery,
    @Inject(VIEW_CONFIGURATION_COMMAND) private readonly commands: ViewConfigurationCommandRepository,
    @Inject(VIEW_DATA_TOKEN_CODEC) private readonly tokens: ViewDataTokenCodec,
    @Inject(READ_SNAPSHOT_RUNNER) private readonly snapshots: ReadSnapshotRunner,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(VIEW_ATTRIBUTE_CATALOG_QUERY) private readonly catalog: ViewAttributeCatalogQuery,
    @Inject(ATTRIBUTE_DEFINITION_METADATA_QUERY) private readonly metadata: AttributeDefinitionMetadataQuery,
    @Inject(WORKSPACE_ACTOR_OPTIONS_QUERY) private readonly actors: WorkspaceActorOptionsQuery,
    @Inject(RECORD_OPTIONS_QUERY) private readonly records: RecordOptionsQuery,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
    private readonly loader: ViewDataLoader,
  ) {}
  // 기능 : 저장 상태와 편집 후보를 같은 읽기 시점에 반환합니다.
  get(user: CurrentUserContext, scope: ViewHeaderScope, request: ViewDataRequest) {
    return this.snapshots.run(async context => {
      const configuration = await this.read(user, scope, context);
      return this.response(configuration, request, context);
    });
  }
  // 기능 : 업무 DB에 쓰지 않고 변경한 설정으로 전체 데이터의 페이지를 계산합니다.
  preview(user: CurrentUserContext, scope: ViewHeaderScope, command: ViewConfigurationCommand, request: ViewDataRequest) {
    const changes = parseViewConfigurationChanges(command.changes);
    return this.snapshots.run(async context => {
      // 1. 기준 설정이 바뀌면 다른 사용자의 변경을 임시 상태에 섞지 않는다.
      const current = await this.read(user, scope, context);
      this.assertVersion(current, command.baseConfigurationVersion);
      const next = mergeViewConfiguration(current, changes);
      return this.executeConfiguration(user, next, request, context);
    });
  }
  // 기능 : View 잠금 안에서 설정 전체를 검증하고 변경 section을 원자적으로 저장합니다.
  async update(user: CurrentUserContext, scope: ViewHeaderScope, command: ViewConfigurationCommand, request: ViewDataRequest, requestId: string | null) {
    try {
      const changes = parseViewConfigurationChanges(command.changes);
      const member = await this.access.getWorkspaceMemberAccess(user.id, scope.workspaceId);
      if (!member) this.notFound();
      if (!member.actorId) throw new Error("Workspace member actor is missing");
      const result = await this.transactions.runInTransaction(async context => {
        // 1. 기존 컬럼 쓰기와 같은 잠금 이후 최신 멤버십과 설정을 읽는다.
        if (!await this.commands.lock(scope, context)) this.notFound();
        const current = await this.read(user, scope, context);
        const before = viewConfigurationSections(current);
        const identical = Object.keys(changes).every(key => this.tokens.fingerprint(canonicalConfiguration(before[key as keyof typeof before])) === this.tokens.fingerprint(canonicalConfiguration(changes[key as keyof typeof changes])));
        // 2. 재전송된 동일 상태는 감사 시각과 다른 section을 보존한다.
        if (identical) return this.response(current, request, context);
        this.assertVersion(current, command.baseConfigurationVersion);
        const next = mergeViewConfiguration(current, changes);
        await this.executeConfiguration(user, next, request, context);
        // 3. 모두 검증된 변경만 저장하고 DB가 확정한 상태로 응답한다.
        await this.commands.save(current, next, changes, member.actorId!, context);
        return this.response(await this.read(user, scope, context), request, context);
      }, { timeoutMs: 20000 });
      this.logger.log(JSON.stringify({ event: "view.configuration.saved", requestId, userId: user.id, ...scope }), "ViewConfigurationService");
      return result;
    } catch (error) {
      const message = JSON.stringify({ event: "view.configuration.failed", requestId, userId: user.id, ...scope, errorCode: error instanceof DomainError ? error.code : "InternalServerError" });
      if (error instanceof DomainError) this.logger.warn(message, "ViewConfigurationService");
      else this.logger.error(message, undefined, "ViewConfigurationService");
      throw error;
    }
  }
  // 기능 : 기존 옵션 port를 View의 원본·경로에 맞게 조합합니다.
  options(user: CurrentUserContext, scope: ViewHeaderScope, query: ViewConfigurationOptions) {
    return this.snapshots.run(async context => {
      const current = await this.read(user, scope, context);
      const path = query.referenceAttributeIdPath ? query.referenceAttributeIdPath.split(",") : [];
      if (path.length > 3 || path.some(id => !UUID.test(id))) invalidViewConfiguration("referenceAttributeIdPath");
      const reference = { sourceScope: query.sourceScope, attributeDefinitionId: query.attributeDefinitionId.toLowerCase(), referenceAttributeIdPathJson: path.map(id => id.toLowerCase()) };
      // 1. 조회 원본과 동일한 필드 검증기를 사용하되 현재 저장 필터와 무관하게 후보를 찾는다.
      const candidate = mergeViewConfiguration(current, { filters: { viewFilterGroupDefinitions: [], viewFilterConditionDefinitions: [] }, sorts: { viewSortDefinitions: [] }, settings: {
        configJson: null, viewAttributeSettingDefinitions: [{ ...reference, id: current.view.id, attributeDisplayRole: "DISPLAY", sortOrder: 0, labelOverride: null, width: null, isHidden: false, formatJson: null }],
        viewGroupDefinitions: [], viewGroupSettingDefinitions: [],
      } });
      const snapshot = await this.loader.load(candidate, resolveViewSource(current.view, query), context);
      // KANBAN 그룹 필수 규칙 대신 공통 필드 경로·소속 검증만 적용한다.
      new ViewDataQueryContext(snapshot, {}, user, this.tokens);
      const attribute = snapshot.attributes.get(reference.attributeDefinitionId)!;
      const q = query.q?.trim() ?? "", cursor = query.cursor?.toLowerCase() ?? null, limit = query.limit ?? 25;
      let items: { id: string; label: string | null; color?: string | null }[];
      if (attribute.type === "Select" || attribute.type === "Status") {
        items = [...snapshot.options.values()].filter(row => row.attributeDefinitionId === attribute.id && row.title.toLocaleLowerCase().includes(q.toLocaleLowerCase()) && (!cursor || row.id > cursor))
          .sort((a, b) => a.id.localeCompare(b.id)).slice(0, limit + 1).map(row => ({ id: row.id, label: row.title, color: row.color }));
      } else if (attribute.type === "ActorReference") items = await this.actors.actorOptions(scope.workspaceId, q, cursor, limit + 1, context);
      else if (attribute.type === "RecordReference") {
        const targets = new Set(snapshot.relationships.flatMap(row => row.sourceAttributeDefinitionId === attribute.id ? [row.targetObjectDefinitionId] : row.targetAttributeDefinitionId === attribute.id ? [row.sourceObjectDefinitionId] : []));
        const configured = jsonObject(jsonObject(attribute.configJson).recordReference).objectDefinitionId;
        if (typeof configured === "string") targets.add(configured);
        if (targets.size > 1) invalidViewConfiguration("attributeDefinitionId");
        const target = [...targets][0] ?? null;
        items = await this.records.find({ workspaceId: scope.workspaceId, objectId: target, titleAttributeIds: snapshot.titles.filter(row => !target || row.objectDefinitionId === target).map(row => row.attributeDefinitionId), q, cursor, take: limit + 1 }, context);
      } else invalidViewConfiguration("attributeDefinitionId");
      // 2. 후보가 더 있을 때만 다음 cursor를 공개한다.
      const page = items.slice(0, limit), hasNextPage = items.length > limit;
      return { items: page.map(row => ({ id: row.id, label: row.label, color: row.color ?? null })), pageInfo: { hasNextPage, nextCursor: hasNextPage ? page.at(-1)!.id : null } };
    }).catch(error => {
      if (error instanceof ViewDataConfigurationError || error instanceof ViewDataNeedsConfiguration) invalidViewConfiguration("attributeDefinitionId");
      throw error;
    });
  }
  // 기능 : 읽기 snapshot 또는 쓰기 transaction 안에서 접근을 재검증합니다.
  private async read(user: CurrentUserContext, scope: ViewHeaderScope, context: TransactionContext) {
    if (!await this.workspace.hasMembership(user.id, scope.workspaceId, context)) this.notFound();
    const result = await this.views.read(scope, context);
    if (!result || result.view.workspaceId !== scope.workspaceId || result.view.id !== scope.viewDefinitionId) this.notFound();
    assertSupportedViewType(result.view.type);
    for (const [key, rows] of Object.entries(result)) if (key !== "view" && Array.isArray(rows) && rows.some(row => row.workspaceId !== scope.workspaceId || row.viewDefinitionId !== scope.viewDefinitionId)) this.notFound();
    return result;
  }
  // 기능 : 실행 가능한 최종 상태만 저장 또는 미리보기로 넘깁니다.
  private async executeConfiguration(user: CurrentUserContext, configuration: ViewDataConfiguration, request: ViewDataRequest, context: TransactionContext) {
    try {
      validateViewDataRequest(configuration.view.type, request);
      const snapshot = await this.loader.load(configuration, resolveViewSource(configuration.view, request), context);
      for (const row of configuration.viewGroupSettingDefinitions) {
        if (row.selectOptionId && row.statusOptionId) invalidViewConfiguration("settings.groupSettings");
        for (const id of [row.selectOptionId, row.statusOptionId]) if (id && snapshot.options.get(id)?.attributeDefinitionId !== row.attributeDefinitionId) invalidViewConfiguration("settings.groupSettings");
        const type = snapshot.attributes.get(row.attributeDefinitionId)?.type;
        if (row.selectOptionId && type !== "Select" || row.statusOptionId && type !== "Status") invalidViewConfiguration("settings.groupSettings");
      }
      return readViewData(new ViewDataQueryContext(snapshot, request, user, this.tokens));
    } catch (error) {
      if (error instanceof ViewDataConfigurationError || error instanceof ViewDataNeedsConfiguration) invalidViewConfiguration(error instanceof ViewDataNeedsConfiguration ? error.field ?? "changes" : "changes");
      throw error;
    }
  }
  // 기능 : 기존 메뉴 DTO를 한 번의 snapshot과 버전으로 묶습니다.
  private async response(configuration: ViewDataConfiguration, request: ViewDataRequest, context: TransactionContext) {
    const source = resolveViewSource(configuration.view, request), workspaceId = configuration.view.workspaceId;
    const candidates = source.kind === "NONE" ? [] : await this.catalog.list(workspaceId, source.objectDefinitionId, source.listDefinitionId, context);
    const configured = [...configuration.viewAttributeSettingDefinitions, ...configuration.viewFilterConditionDefinitions, ...configuration.viewSortDefinitions, ...configuration.viewGroupDefinitions];
    const ids = [...new Set(configured.flatMap(row => [row.attributeDefinitionId, ...referencePath(row.referenceAttributeIdPathJson)]))];
    const attributes = [...new Map([...candidates, ...await this.metadata.findAttributes(workspaceId, ids, context)].map(row => [row.id, row])).values()];
    assertViewDataLimit(attributes.length, 500);
    const options = await this.metadata.findOptions({ workspaceId, selectAttributeIds: attributes.filter(row => row.type === "Select").map(row => row.id), statusAttributeIds: attributes.filter(row => row.type === "Status").map(row => row.id), selectOptionIds: [], statusOptionIds: [] }, context);
    assertViewDataLimit(options.selectOptions.length + options.statusOptions.length, 10000);
    const optionResponse = { selectOptions: options.selectOptions.map(map.mapOption), statusOptions: options.statusOptions.map(map.mapOption) };
    const base = { viewDefinitionId: configuration.view.id, viewType: configuration.view.type, attributeDefinitions: attributes.map(map.mapAttribute) };
    const sections = viewConfigurationSections(configuration);
    return { configurationVersion: this.version(configuration), candidates: candidates.map(map.mapAttribute),
      filters: { ...base, ...sections.filters, ...optionResponse }, sorts: { ...base, ...sections.sorts },
      settings: { ...base, ...sections.settings, ...optionResponse, viewName: configuration.view.name, objectDefinitionId: configuration.view.objectDefinitionId, listDefinitionId: configuration.view.listDefinitionId, viewWidgetDefinitions: [], contentViewDefinitions: [] },
    };
  }
  // 기능 : 자식 설정 변경도 감지하며 업무 값 변경과는 독립된 버전을 만듭니다.
  private version(configuration: ViewDataConfiguration) {
    return this.tokens.fingerprint(canonicalConfiguration({ type: configuration.view.type, objectDefinitionId: configuration.view.objectDefinitionId, listDefinitionId: configuration.view.listDefinitionId, configuration: viewConfigurationSections(configuration) }));
  }
  // 기능 : 기준이 달라진 편집을 덮어쓰기 대신 충돌로 반환합니다.
  private assertVersion(configuration: ViewDataConfiguration, version: string) {
    if (this.version(configuration) !== version) throw new DomainError("ViewConfigurationConflict", "보기 설정이 다른 곳에서 변경됐어요. 최신 설정을 확인해 주세요.");
  }
  // 기능 : 존재 여부와 다른 Workspace 접근을 같은 오류로 숨깁니다.
  private notFound(): never { throw new DomainError("ViewConfigurationNotFound", "보기를 찾을 수 없어요."); }
}
