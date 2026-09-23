import { Inject, Injectable } from "@nestjs/common";
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
  readonly id: string;
}

// 역할 : CreateWorkspaceObjectDefinitionUseCase가 현재 Workspace의 ObjectDefinition 생성을 담당합니다.
@Injectable()
export class CreateWorkspaceObjectDefinitionUseCase {
  // 기능 : Workspace 접근 포트, ObjectDefinition 쓰기 저장소, logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_COMMAND_REPOSITORY)
    private readonly objectDefinitionCommandRepository: ObjectDefinitionCommandRepository,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace에 ObjectDefinition을 생성합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    command: CreateWorkspaceObjectDefinitionCommand
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

    // 4. ObjectDefinition을 생성하고 생성된 ID를 반환한다.
    const created =
      await this.objectDefinitionCommandRepository.createObjectDefinition({
        workspaceId,
        createdByActorId: workspaceAccess.actorId,
        apiSlug: objectDefinitionName,
        singularName: objectDefinitionName,
        pluralName: objectDefinitionName,
        icon: this.normalizeOptionalText(command.icon),
        description: this.normalizeOptionalText(command.description),
      });

    // 5. 원문 이름과 설명 없이 생성 이벤트만 구조화 로그로 남긴다.
    this.logCreatedEvent({
      userId: currentUser.id,
      workspaceId,
      objectDefinitionId: created.id,
    });

    return created;
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
    readonly userId: string;
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
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
