import { Inject, Injectable } from "@nestjs/common";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY, type AttributeDefinitionMetadataQuery } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import { LIST_STATUS_ATTRIBUTE_CREATOR, type ListStatusAttributeCreator } from "@/modules/attribute-definition/application/ports/list-status-attribute-creator.port";
import { OBJECT_DEFINITION_ACCESS_QUERY, type ObjectDefinitionAccessQuery } from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import { LIST_INITIAL_VIEW_CREATOR, type ListInitialViewCreator, type ListInitialViewGroup, type ListInitialViewType } from "@/modules/view-definition/application/ports/list-initial-view-creator.port";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { APPLICATION_LOGGER, type ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import { TRANSACTION_MANAGER, type TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { ListDefinitionSourceNotFoundError, ListDefinitionWorkspaceNotFoundError } from "../../domain/list-definition.errors";
import { LIST_DEFINITION_COMMAND_REPOSITORY, type ListDefinitionCommandRepository } from "../ports/list-definition-command.repository";

// 역할 : 새 목록의 이름·기준 속성·첫 보기와 선택적 단계 생성을 요청합니다.
export interface CreateWorkspaceListDefinitionCommand {
  readonly listDefinitionName: string;
  readonly objectDefinitionId: string;
  readonly titleAttributeDefinitionId: string;
  readonly viewType: ListInitialViewType;
  readonly icon?: string | null;
  readonly description?: string | null;
  readonly kanban?: {
    readonly attributeDefinitionId?: string;
    readonly newStatus?: { readonly title: string; readonly options: readonly string[] };
  };
}

// 역할 : 함께 생성한 List와 첫 보기의 식별자를 반환합니다.
export interface CreateWorkspaceListDefinitionResponse {
  readonly listDefinitionId: string;
  readonly viewDefinitionId: string;
}

// 역할 : 접근·입력 검증과 각 소유 모듈의 원자적 목록 생성을 조율합니다.
@Injectable()
export class CreateWorkspaceListDefinitionUseCase {
  // 기능 : 소유 모듈의 공개 port와 공통 transaction/logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly workspaceAccess: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY) private readonly objectAccess: ObjectDefinitionAccessQuery,
    @Inject(ATTRIBUTE_DEFINITION_METADATA_QUERY) private readonly attributes: AttributeDefinitionMetadataQuery,
    @Inject(LIST_DEFINITION_COMMAND_REPOSITORY) private readonly lists: ListDefinitionCommandRepository,
    @Inject(LIST_STATUS_ATTRIBUTE_CREATOR) private readonly statuses: ListStatusAttributeCreator,
    @Inject(LIST_INITIAL_VIEW_CREATOR) private readonly views: ListInitialViewCreator,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
  ) {}

  // 기능 : 요청한 Workspace에 비어 있는 업무 목록과 사용 가능한 첫 보기를 함께 생성합니다.
  async execute(user: CurrentUserContext, workspaceId: string, command: CreateWorkspaceListDefinitionCommand,
    requestId?: string): Promise<CreateWorkspaceListDefinitionResponse> {
    // 1. 화면 입력을 정규화하고 보드의 조건부 입력을 검증한다.
    workspaceId = workspaceId.toLowerCase();
    const logFields = { requestId: requestId ?? null, userId: user.id, workspaceId };
    let result: CreateWorkspaceListDefinitionResponse;
    try {
      const objectDefinitionId = command.objectDefinitionId.toLowerCase();
      const titleAttributeDefinitionId = command.titleAttributeDefinitionId.toLowerCase();
      const name = this.requiredText(command.listDefinitionName, "listDefinitionName");
      const kanban = this.validateKanban(command);
      if (command.description && Array.from(command.description).length > 300) this.invalid("description");
      // 2. 현재 멤버십·Actor와 기준 관리 항목의 Workspace 소속을 확인한다.
      const access = await this.workspaceAccess.getWorkspaceMemberAccess(user.id, workspaceId);
      if (!access) throw new ListDefinitionWorkspaceNotFoundError();
      if (!access.actorId) throw new Error("Workspace member actor is missing");
      if (!await this.objectAccess.hasObjectDefinitionInWorkspace({ workspaceId, objectDefinitionId })) {
        throw new ListDefinitionSourceNotFoundError();
      }
      const audit = { workspaceId, createdByActorId: access.actorId };
      // 3. 각 소유 모듈의 쓰기를 동일 transaction에 묶는다.
      result = await this.transactions.runInTransaction(async context => {
        // 1. 동일 transaction에서 첫 보기 속성들의 Workspace/Object 소속을 다시 확인한다.
        const ids = [...new Set([titleAttributeDefinitionId, ...(kanban?.attributeDefinitionId ? [kanban.attributeDefinitionId] : [])])];
        const attributes = await this.attributes.findAttributes(workspaceId, ids, context);
        if (ids.some(id => !attributes.some(attribute => attribute.id === id && attribute.workspaceId === workspaceId &&
          attribute.objectDefinitionId === objectDefinitionId && attribute.listDefinitionId === null))) {
          throw new ListDefinitionSourceNotFoundError();
        }
        let group: ListInitialViewGroup | null = null;
        if (kanban?.attributeDefinitionId) {
          const attribute = attributes.find(item => item.id === kanban.attributeDefinitionId)!;
          if (attribute.isMultiselect || (attribute.type !== "Status" && attribute.type !== "Select")) this.invalid("kanban.attributeDefinitionId");
          group = { attributeDefinitionId: attribute.id, sourceScope: "RECORD" };
        }
        // 2. List 원장을 생성하고 필요한 경우에만 목록 전용 상태와 옵션을 만든다.
        const list = await this.lists.create({ ...audit, name, icon: command.icon || null, description: command.description || null }, context);
        if (kanban?.newStatus) {
          const attribute = await this.statuses.create({ ...audit, listDefinitionId: list.id, ...kanban.newStatus }, context);
          group = { attributeDefinitionId: attribute.id, sourceScope: "LIST_ENTRY" };
        }
        // 3. 첫 보기와 제목·그룹 설정까지 저장되어야 전체 요청이 성공한다.
        const view = await this.views.create({ ...audit, listDefinitionId: list.id, name: `전체 ${name}`,
          type: command.viewType, titleAttributeDefinitionId, group }, context);
        return { listDefinitionId: list.id, viewDefinitionId: view.id };
      });
    } catch (error) {
      // 4. 사전 검증과 rollback된 실패를 원문 없이 안전한 식별자·오류 코드로 구분한다.
      const message = JSON.stringify({ event: "crm.listDefinition.createFailed", ...logFields,
        errorCode: error instanceof DomainError ? error.code : "InternalServerError" });
      if (error instanceof DomainError) this.logger.warn(message, "CreateWorkspaceListDefinitionUseCase");
      else this.logger.error(message, undefined, "CreateWorkspaceListDefinitionUseCase");
      throw error;
    }
    // 5. commit이 완료된 후 성공을 알린다.
    this.logger.log(JSON.stringify({ event: "crm.listDefinition.created", ...logFields, ...result }), "CreateWorkspaceListDefinitionUseCase");
    return result;
  }

  // 기능 : 첫 보기 타입과 기존 상태 또는 신규 단계 중 하나의 선택을 검증합니다.
  private validateKanban(command: CreateWorkspaceListDefinitionCommand): CreateWorkspaceListDefinitionCommand["kanban"] {
    if (!["TABLE", "LIST", "KANBAN"].includes(command.viewType)) this.invalid("viewType");
    if (command.viewType !== "KANBAN") {
      if (command.kanban !== undefined) this.invalid("kanban");
      return undefined;
    }
    const input = command.kanban;
    if (!input || Boolean(input.attributeDefinitionId) === Boolean(input.newStatus)) this.invalid("kanban");
    if (!input.newStatus) return { attributeDefinitionId: input.attributeDefinitionId!.toLowerCase() };
    const title = this.requiredText(input.newStatus.title, "kanban.newStatus.title");
    const options = input.newStatus.options.map(value => this.requiredText(value, "kanban.newStatus.options"));
    if (options.length < 1 || options.length > 50 || new Set(options).size !== options.length) this.invalid("kanban.newStatus.options");
    return { newStatus: { title, options } };
  }

  // 기능 : 필수 이름을 공백 제거 후 Unicode 문자 길이 기준으로 검증합니다.
  private requiredText(value: string, field: string): string {
    const normalized = value.trim();
    if (!normalized || Array.from(normalized).length > 80) this.invalid(field);
    return normalized;
  }

  // 기능 : 사용자 입력 원문 없이 수정할 필드만 포함한 검증 오류를 반환합니다.
  private invalid(field: string): never {
    throw new DomainError("ValidationError", "Invalid list creation input", { field });
  }
}
