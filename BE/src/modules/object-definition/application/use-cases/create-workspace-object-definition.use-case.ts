import { Inject, Injectable } from "@nestjs/common";
import {
  OBJECT_TEXT_ATTRIBUTE_CREATOR,
  type ObjectTextAttributeCreator,
} from "@/modules/attribute-definition/application/ports/object-text-attribute-creator.port";
import {
  OBJECT_TABLE_VIEW_CREATOR,
  type ObjectTableViewCreator,
} from "@/modules/view-definition/application/ports/object-table-view-creator.port";
import {
  TRANSACTION_MANAGER,
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";
import {
  OBJECT_DEFINITION_COMMAND_REPOSITORY,
  type ObjectDefinitionCommandRepository,
} from "@/modules/object-definition/application/ports/object-definition-command.repository";
import {
  ObjectDefinitionApiSlugAlreadyExistsError,
  ObjectDefinitionValidationError,
  ObjectDefinitionWorkspaceNotFoundError,
} from "@/modules/object-definition/domain/object-definition.errors";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  APPLICATION_LOGGER,
  type ApplicationLogger,
} from "@/shared/application/ports/application-logger.port";

const MAX_OBJECT_DEFINITION_NAME_LENGTH = 80;

// 역할 : CreateWorkspaceObjectDefinitionCommand가 관리 항목 생성 요청 값을 정의합니다.
export interface CreateWorkspaceObjectDefinitionCommand {
  readonly objectDefinitionName: string;
  readonly icon?: string | null;
  readonly description?: string | null;
}

// 역할 : CreateWorkspaceObjectDefinitionResponse가 관리 항목 생성 응답 값을 정의합니다.
export interface CreateWorkspaceObjectDefinitionResponse {
  readonly objectDefinitionId: string;
  readonly viewDefinitionId: string;
}

// 역할 : 현재 Workspace의 관리 항목·기본 속성·첫 TABLE 생성을 원자적으로 조율합니다.
@Injectable()
export class CreateWorkspaceObjectDefinitionUseCase {
  // 기능 : 접근·자체 저장소·각 소유 모듈 공개 생성 포트와 transaction, logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_COMMAND_REPOSITORY)
    private readonly objectDefinitionCommandRepository: ObjectDefinitionCommandRepository,
    @Inject(OBJECT_TEXT_ATTRIBUTE_CREATOR)
    private readonly objectTextAttributeCreator: ObjectTextAttributeCreator,
    @Inject(OBJECT_TABLE_VIEW_CREATOR)
    private readonly objectTableViewCreator: ObjectTableViewCreator,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 접근 가능한 Workspace에 관리 항목과 첫 TABLE을 함께 생성합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    command: CreateWorkspaceObjectDefinitionCommand,
    requestId?: string
  ): Promise<CreateWorkspaceObjectDefinitionResponse> {
    // 1. 사용자가 입력한 관리 항목 이름을 저장 기준 이름으로 정규화한다.
    const objectDefinitionName = this.normalizeObjectDefinitionName(
      command.objectDefinitionName
    );

    // 2. 현재 사용자가 요청 Workspace의 멤버인지 확인하고 감사 주체 Actor를 조회한다.
    const workspaceAccess =
      await this.workspaceAccessQuery.getWorkspaceMemberAccess(
        currentUser.id,
        workspaceId
      );

    if (!workspaceAccess) {
      throw new ObjectDefinitionWorkspaceNotFoundError();
    }

    if (!workspaceAccess.actorId) {
      throw new Error("Workspace member actor is missing");
    }

    // 3. 같은 Workspace 안에서 같은 apiSlug가 이미 있는지 확인한다.
    const hasSameApiSlug =
      await this.objectDefinitionCommandRepository.hasObjectDefinitionApiSlug({
        workspaceId,
        apiSlug: objectDefinitionName,
      });

    if (hasSameApiSlug) {
      throw new ObjectDefinitionApiSlugAlreadyExistsError();
    }

    // 4. 검증된 동일 Workspace/Actor로 각 소유 모듈의 쓰기를 하나의 transaction에 묶는다.
    const audit = { workspaceId, createdByActorId: workspaceAccess.actorId };
    let result: CreateWorkspaceObjectDefinitionResponse;
    try {
      result = await this.transactionManager.runInTransaction(async context => {
        // 1. 관리 대상 자체를 생성한다. 동시 이름 중복은 저장소의 unique 오류 변환으로 차단한다.
        const object = await this.objectDefinitionCommandRepository.createObjectDefinition({
          ...audit,
          apiSlug: objectDefinitionName,
          singularName: objectDefinitionName,
          pluralName: objectDefinitionName,
          icon: this.normalizeOptionalText(command.icon),
          description: this.normalizeOptionalText(command.description),
        }, context);
        // 2. 새 Object에 공통 이름 속성을 생성한다. 업종별 속성이나 Record는 만들지 않는다.
        const attribute = await this.objectTextAttributeCreator.create({
          ...audit,
          objectDefinitionId: object.id,
          apiSlug: "name",
          title: "이름",
        }, context);
        // 3. 첫 TABLE과 제목 열 표시 설정이 모두 저장되어야 전체 생성이 성공한다.
        const view = await this.objectTableViewCreator.create({
          ...audit,
          objectDefinitionId: object.id,
          titleAttributeDefinitionId: attribute.id,
          name: `전체 ${objectDefinitionName}`,
        }, context);
        return { objectDefinitionId: object.id, viewDefinitionId: view.id };
      });
    } catch (error) {
      // 5. rollback된 저장 실패는 원문 입력·exception 없이 식별자만 남기고 기존 오류로 전파한다.
      const message = JSON.stringify({
        event: "crm.objectDefinition.createFailed",
        requestId: requestId ?? null,
        userId: currentUser.id,
        workspaceId,
      });
      if (error instanceof ObjectDefinitionApiSlugAlreadyExistsError) {
        this.logger.warn(message, "CreateWorkspaceObjectDefinitionUseCase");
      } else {
        this.logger.error(message, undefined, "CreateWorkspaceObjectDefinitionUseCase");
      }
      throw error;
    }

    // 6. commit 이후에만 성공 로그와 생성된 Object/View ID를 반환한다.
    this.logCreatedEvent({
      requestId: requestId ?? null,
      userId: currentUser.id,
      workspaceId,
      ...result,
    });

    return result;
  }

  // 기능 : ObjectDefinition 이름 입력값을 trim하고 필수/길이 조건을 검증합니다.
  private normalizeObjectDefinitionName(objectDefinitionName: string): string {
    // 1. 앞뒤 공백을 제거해 실제 저장 기준 입력값을 만든다.
    const normalized = objectDefinitionName.trim();

    // 2. 공백만 입력한 이름은 생성할 수 없도록 차단한다.
    if (normalized.length === 0) {
      throw new ObjectDefinitionValidationError(
        "OBJECT_DEFINITION_NAME_REQUIRED",
        "objectDefinitionName",
        "Object definition name is required"
      );
    }

    // 3. 사용자 입력 기준 최대 길이를 초과하면 저장하지 않는다.
    if (Array.from(normalized).length > MAX_OBJECT_DEFINITION_NAME_LENGTH) {
      throw new ObjectDefinitionValidationError(
        "OBJECT_DEFINITION_NAME_TOO_LONG",
        "objectDefinitionName",
        "Object definition name must be 80 characters or fewer"
      );
    }

    // 4. 정규화된 이름을 호출자에게 반환한다.
    return normalized;
  }

  // 기능 : 선택 입력값을 trim 없이 저장 가능한 문자열 또는 null로 정규화합니다.
  private normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === undefined || value === null || value.length === 0) {
      return null;
    }

    return value;
  }

  // 기능 : ObjectDefinition 생성 이벤트를 사용자 입력 원문 없이 구조화 로그로 남깁니다.
  private logCreatedEvent(fields: {
    readonly requestId: string | null;
    readonly userId: string;
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly viewDefinitionId: string;
  }): void {
    this.logger.log(
      JSON.stringify({
        event: "crm.objectDefinition.created",
        ...fields,
      }),
      "CreateWorkspaceObjectDefinitionUseCase"
    );
  }
}
