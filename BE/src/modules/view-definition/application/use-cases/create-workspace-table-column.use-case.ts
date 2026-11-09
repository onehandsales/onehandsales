import { Inject, Injectable } from "@nestjs/common";
import { OBJECT_ATTRIBUTE_CREATOR, type ObjectAttributeCreator } from "@/modules/attribute-definition/application/ports/object-attribute-creator.port";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY, type AttributeDefinitionMetadataQuery } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import { isAttributeDefinitionType } from "@/modules/attribute-definition/application/attribute-definition-type";
import { AttributeDefinitionValidationError } from "@/modules/attribute-definition/domain/attribute-definition.errors";
import { OBJECT_DEFINITION_ACCESS_QUERY, type ObjectDefinitionAccessQuery } from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import { TRANSACTION_MANAGER, type TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { APPLICATION_LOGGER, type ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { VIEW_COLUMN_COMMAND_REPOSITORY, type ViewColumnCommandRepository } from "../ports/view-column-command.repository";
import { ViewColumnError } from "../../domain/view-column.errors";

// 역할 : 임시 컬럼의 생성 ID와 사용자가 선택한 속성 정의를 전달합니다.
export interface CreateWorkspaceTableColumnCommand {
  readonly creationId: string;
  readonly attributeDefinitionName: string;
  readonly attributeType: string;
}
// 역할 : 생성된 원본 속성과 표시 설정의 식별자를 반환합니다.
export interface CreateWorkspaceTableColumnResponse {
  readonly viewDefinitionId: string;
  readonly objectDefinitionId: string;
  readonly attributeDefinitionId: string;
  readonly viewAttributeSettingDefinitionId: string;
}

// 역할 : Object TABLE의 속성·빈 셀·보기 연결을 원자적으로 생성합니다.
@Injectable()
export class CreateWorkspaceTableColumnUseCase {
  // 기능 : 각 소유 모듈의 공개 계약과 View 쓰기·트랜잭션·로그 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly workspace: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY) private readonly objects: ObjectDefinitionAccessQuery,
    @Inject(OBJECT_ATTRIBUTE_CREATOR) private readonly attributes: ObjectAttributeCreator,
    @Inject(ATTRIBUTE_DEFINITION_METADATA_QUERY) private readonly metadata: AttributeDefinitionMetadataQuery,
    @Inject(VIEW_COLUMN_COMMAND_REPOSITORY) private readonly columns: ViewColumnCommandRepository,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
  ) {}

  // 기능 : 동일 생성 ID의 재시도를 재사용하고 새 속성은 현재 View에만 표시합니다.
  async execute(user: CurrentUserContext, workspaceId: string, viewId: string, command: CreateWorkspaceTableColumnCommand, requestId: string | null = null): Promise<CreateWorkspaceTableColumnResponse & { created: boolean }> {
    // 1. 입력·UUID 표기를 정규화하고 Workspace 멤버와 서버 Actor를 확인한다.
    const name = command.attributeDefinitionName.trim();
    if (!name) throw new AttributeDefinitionValidationError("ATTRIBUTE_DEFINITION_NAME_REQUIRED", "attributeDefinitionName", "Attribute name is required");
    if (name.length > 80) throw new AttributeDefinitionValidationError("ATTRIBUTE_DEFINITION_NAME_TOO_LONG", "attributeDefinitionName", "Attribute name is too long");
    if (!isAttributeDefinitionType(command.attributeType)) throw new AttributeDefinitionValidationError("ATTRIBUTE_DEFINITION_TYPE_UNKNOWN", "attributeType", "Attribute type is unknown");
    const workspace = workspaceId.toLowerCase(), view = viewId.toLowerCase(), id = command.creationId.toLowerCase();
    const member = await this.workspace.getWorkspaceMemberAccess(user.id, workspace);
    if (!member) throw new ViewColumnError("ViewColumnNotFound");
    if (!member.actorId) throw new Error("Workspace member actor is missing");
    const actorId = member.actorId;
    try {
      const result = await this.transactions.runInTransaction(async context => {
        // 2. View를 잠그고 API 범위와 원본 Object의 Workspace 소속을 검증한다.
        const target = await this.columns.lockView(workspace, view, context);
        if (!target) throw new ViewColumnError("ViewColumnNotFound");
        if (target.type !== "TABLE" || !target.objectDefinitionId || target.listDefinitionId) throw new ViewColumnError("ViewColumnTargetUnsupported");
        const objectId = target.objectDefinitionId;
        if (!await this.objects.hasObjectDefinitionInWorkspace({ workspaceId: workspace, objectDefinitionId: objectId })) throw new ViewColumnError("ViewColumnNotFound");
        // 3. 기존 요청은 소속·Actor·원본 입력이 모두 같을 때만 쓰기 없이 재사용한다.
        const existing = await this.columns.findCreation(id, context);
        if (existing) {
          if (existing.workspaceId !== workspace || existing.viewDefinitionId !== view || existing.createdByActorId !== actorId || existing.sourceScope !== "RECORD" || existing.attributeDisplayRole !== "DISPLAY" || !Array.isArray(existing.referenceAttributeIdPathJson) || existing.referenceAttributeIdPathJson.length) throw new ViewColumnError("ViewColumnCreationConflict");
          const [attribute] = await this.metadata.findAttributes(workspace, [existing.attributeDefinitionId], context);
          if (!attribute || attribute.objectDefinitionId !== objectId || attribute.listDefinitionId || attribute.title !== name || attribute.type !== command.attributeType) throw new ViewColumnError("ViewColumnCreationConflict");
          return { viewDefinitionId: view, objectDefinitionId: objectId, attributeDefinitionId: attribute.id, viewAttributeSettingDefinitionId: id, created: false };
        }
        // 4. 기존 본문 조회 한도를 지키고 Attribute 공개 포트에 같은 트랜잭션을 전달한다.
        const placement = await this.columns.placement(workspace, view, context);
        if (placement.count >= 500) throw new ViewColumnError("ViewColumnLimitExceeded");
        const attribute = await this.attributes.create({ currentUser: user, workspaceId: workspace, objectDefinitionId: objectId, attributeDefinitionName: name, attributeType: command.attributeType }, context);
        await this.columns.create({ id, workspaceId: workspace, viewDefinitionId: view, attributeDefinitionId: attribute.attributeDefinitionId, createdByActorId: actorId, sortOrder: placement.lastSortOrder === null ? 0 : placement.lastSortOrder + 1 }, context);
        return { viewDefinitionId: view, objectDefinitionId: objectId, ...attribute, viewAttributeSettingDefinitionId: id, created: true };
      });
      // 5. commit 이후 식별자만 기록하고 HTTP 계층에 신규 여부를 전달한다.
      if (result.created) this.logger.log(JSON.stringify({ event: "crm.viewColumn.created", requestId, userId: user.id, workspaceId: workspace, ...result }), "CreateWorkspaceTableColumnUseCase");
      return result;
    } catch (error) {
      this.logger.warn(JSON.stringify({ event: "crm.viewColumn.createFailed", requestId, userId: user.id, workspaceId: workspace, viewDefinitionId: view }), "CreateWorkspaceTableColumnUseCase");
      throw error;
    }
  }
}
