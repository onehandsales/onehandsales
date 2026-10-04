import { Inject, Injectable } from "@nestjs/common";
import {
  ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY,
  type AttributeDefinitionCommandRepository,
  type UpdateAttributeDefinitionPatch,
} from "@/modules/attribute-definition/application/ports/attribute-definition-command.repository";
import {
  AttributeDefinitionApiSlugAlreadyExistsError,
  AttributeDefinitionNotFoundError,
  AttributeDefinitionObjectDefinitionNotFoundError,
  AttributeDefinitionValidationError,
  AttributeDefinitionWorkspaceNotFoundError,
} from "@/modules/attribute-definition/domain/attribute-definition.errors";
import {
  OBJECT_DEFINITION_ACCESS_QUERY,
  type ObjectDefinitionAccessQuery,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  APPLICATION_LOGGER,
  type ApplicationLogger,
} from "@/shared/application/ports/application-logger.port";

const MAX_ATTRIBUTE_DEFINITION_TITLE_LENGTH = 80;

// 역할 : UpdateWorkspaceObjectAttributeDefinitionCommand가 속성 수정 요청 값을 정의합니다.
export interface UpdateWorkspaceObjectAttributeDefinitionCommand {
  // 기능 : title 필드가 request body에 명시되었는지 나타냅니다.
  readonly hasTitle: boolean;
  // 기능 : title 필드가 명시된 경우 저장 기준 title 값을 전달합니다.
  readonly title?: string | null;
  // 기능 : description 필드가 request body에 명시되었는지 나타냅니다.
  readonly hasDescription: boolean;
  // 기능 : description 필드가 명시된 경우 저장 기준 description 값을 전달합니다.
  readonly description?: string | null;
  // 기능 : icon 필드가 request body에 명시되었는지 나타냅니다.
  readonly hasIcon: boolean;
  // 기능 : icon 필드가 명시된 경우 저장 기준 icon 값을 전달합니다.
  readonly icon?: string | null;
  // 기능 : isMultiselect 필드가 request body에 명시되었는지 나타냅니다.
  readonly hasIsMultiselect: boolean;
  // 기능 : isMultiselect 필드가 명시된 경우 저장 기준 boolean 값을 전달합니다.
  readonly isMultiselect?: boolean | null;
}

// 역할 : UpdateWorkspaceObjectAttributeDefinitionResponse가 속성 수정 응답 값을 정의합니다.
export interface UpdateWorkspaceObjectAttributeDefinitionResponse {
  // 기능 : 수정된 AttributeDefinition 식별자만 응답합니다.
  readonly attributeDefinitionId: string;
}

// 역할 : AttributeDefinitionUpdatedLogFields가 AttributeDefinition 수정 이벤트 로그 필드를 정의합니다.
interface AttributeDefinitionUpdatedLogFields {
  // 기능 : 요청한 사용자 식별자를 기록합니다.
  readonly userId: string;
  // 기능 : 수정이 발생한 Workspace 경계를 기록합니다.
  readonly workspaceId: string;
  // 기능 : 수정이 발생한 ObjectDefinition 경계를 기록합니다.
  readonly objectDefinitionId: string;
  // 기능 : 수정된 AttributeDefinition 식별자를 기록합니다.
  readonly attributeDefinitionId: string;
  // 기능 : 수정 감사 주체 Actor 식별자를 기록합니다.
  readonly actorId: string;
  // 기능 : request body에 포함된 필드명만 기록합니다.
  readonly changedFields: readonly string[];
}

// 역할 : UpdateWorkspaceObjectAttributeDefinitionUseCase가 현재 ObjectDefinition의 AttributeDefinition 수정을 담당합니다.
@Injectable()
export class UpdateWorkspaceObjectAttributeDefinitionUseCase {
  // 기능 : Workspace/ObjectDefinition 접근 포트, AttributeDefinition 저장소, logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY)
    private readonly attributeDefinitionCommandRepository: AttributeDefinitionCommandRepository,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 AttributeDefinition을 부분 수정합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string,
    attributeDefinitionId: string,
    command: UpdateWorkspaceObjectAttributeDefinitionCommand
  ): Promise<UpdateWorkspaceObjectAttributeDefinitionResponse> {
    // 1. request body가 수정할 계약 필드를 하나 이상 명시했는지 먼저 검증한다.
    this.assertPatchHasFields(command);

    // 2. request에 포함된 필드만 저장 기준 값으로 정규화한다.
    const patch = this.createPatch(command);
    const changedFields = this.getChangedFields(command);

    // 3. 현재 사용자가 요청 Workspace의 멤버인지 확인하고 수정 감사 주체 Actor를 조회한다.
    const workspaceAccess =
      await this.workspaceAccessQuery.getWorkspaceMemberAccess(
        currentUser.id,
        workspaceId
      );

    if (!workspaceAccess) {
      throw new AttributeDefinitionWorkspaceNotFoundError();
    }

    if (!workspaceAccess.actorId) {
      throw new Error("Workspace member actor is missing");
    }

    const updatedByActorId = workspaceAccess.actorId;

    // 4. 요청 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
    const hasObjectDefinition =
      await this.objectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({
        workspaceId,
        objectDefinitionId,
      });

    if (!hasObjectDefinition) {
      throw new AttributeDefinitionObjectDefinitionNotFoundError();
    }

    // 5. 요청 AttributeDefinition이 Workspace/ObjectDefinition 경계 안에 있는지 확인한다.
    const attributeDefinition =
      await this.attributeDefinitionCommandRepository.findAttributeDefinitionForUpdate(
        {
          workspaceId,
          objectDefinitionId,
          attributeDefinitionId,
        }
      );

    if (!attributeDefinition) {
      throw new AttributeDefinitionNotFoundError();
    }

    // 6. title 변경으로 apiSlug가 달라지는 경우 같은 ObjectDefinition 안의 중복을 확인한다.
    if (
      patch.apiSlug !== undefined &&
      patch.apiSlug !== attributeDefinition.apiSlug
    ) {
      const hasSameApiSlug =
        await this.attributeDefinitionCommandRepository.hasAttributeDefinitionApiSlug(
          {
            workspaceId,
            objectDefinitionId,
            apiSlug: patch.apiSlug,
            excludeAttributeDefinitionId: attributeDefinitionId,
          }
        );

      if (hasSameApiSlug) {
        throw new AttributeDefinitionApiSlugAlreadyExistsError();
      }
    }

    // 7. request에 포함된 필드만 AttributeDefinition row에 반영한다.
    const updated =
      await this.attributeDefinitionCommandRepository.updateAttributeDefinition({
        workspaceId,
        objectDefinitionId,
        attributeDefinitionId,
        updatedByActorId,
        patch,
      });

    // 8. 사용자 입력 원문 없이 수정 이벤트만 구조화 로그로 남긴다.
    this.logUpdatedEvent({
      userId: currentUser.id,
      workspaceId,
      objectDefinitionId,
      attributeDefinitionId: updated.id,
      actorId: updatedByActorId,
      changedFields,
    });

    return {
      attributeDefinitionId: updated.id,
    };
  }

  // 기능 : request body에 수정 대상 필드가 포함되어 있는지 확인합니다.
  private assertPatchHasFields(
    command: UpdateWorkspaceObjectAttributeDefinitionCommand
  ): void {
    if (
      !command.hasTitle &&
      !command.hasDescription &&
      !command.hasIcon &&
      !command.hasIsMultiselect
    ) {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_UPDATE_FIELD_REQUIRED",
        "body",
        "At least one attribute definition update field is required"
      );
    }
  }

  // 기능 : request에 포함된 필드만 저장 patch 값으로 정규화합니다.
  private createPatch(
    command: UpdateWorkspaceObjectAttributeDefinitionCommand
  ): UpdateAttributeDefinitionPatch {
    return {
      ...(command.hasTitle ? this.createTitlePatch(command.title) : {}),
      ...(command.hasDescription
        ? { description: this.normalizeOptionalText(command.description) }
        : {}),
      ...(command.hasIcon
        ? { icon: this.normalizeOptionalText(command.icon) }
        : {}),
      ...(command.hasIsMultiselect
        ? { isMultiselect: this.normalizeIsMultiselect(command.isMultiselect) }
        : {}),
    };
  }

  // 기능 : AttributeDefinition title 입력값을 trim하고 title/apiSlug 저장 patch를 생성합니다.
  private createTitlePatch(value: string | null | undefined): {
    readonly title: string;
    readonly apiSlug: string;
  } {
    const title = this.normalizeTitle(value);

    return {
      title,
      apiSlug: title,
    };
  }

  // 기능 : AttributeDefinition title 입력값을 trim하고 필수/길이 조건을 검증합니다.
  private normalizeTitle(value: string | null | undefined): string {
    if (typeof value !== "string") {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_TITLE_REQUIRED",
        "title",
        "Attribute definition title is required"
      );
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_TITLE_REQUIRED",
        "title",
        "Attribute definition title is required"
      );
    }

    if (Array.from(normalized).length > MAX_ATTRIBUTE_DEFINITION_TITLE_LENGTH) {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_TITLE_TOO_LONG",
        "title",
        "Attribute definition title must be 80 characters or fewer"
      );
    }

    return normalized;
  }

  // 기능 : 선택 입력값을 trim 없이 저장 가능한 문자열 또는 null로 정규화합니다.
  private normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === undefined || value === null || value.length === 0) {
      return null;
    }

    return value;
  }

  // 기능 : isMultiselect 입력값이 boolean인지 확인합니다.
  private normalizeIsMultiselect(value: boolean | null | undefined): boolean {
    if (typeof value !== "boolean") {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_MULTISELECT_INVALID",
        "isMultiselect",
        "Attribute definition multiselect must be a boolean"
      );
    }

    return value;
  }

  // 기능 : request body에 포함된 수정 필드명을 관측 가능한 배열로 반환합니다.
  private getChangedFields(
    command: UpdateWorkspaceObjectAttributeDefinitionCommand
  ): string[] {
    const changedFields: string[] = [];

    if (command.hasTitle) {
      changedFields.push("title");
    }

    if (command.hasDescription) {
      changedFields.push("description");
    }

    if (command.hasIcon) {
      changedFields.push("icon");
    }

    if (command.hasIsMultiselect) {
      changedFields.push("isMultiselect");
    }

    return changedFields;
  }

  // 기능 : AttributeDefinition 수정 이벤트를 사용자 입력 원문 없이 구조화 로그로 남깁니다.
  private logUpdatedEvent(fields: AttributeDefinitionUpdatedLogFields): void {
    this.logger.log(
      JSON.stringify({
        event: "crm.attributeDefinition.updated",
        ...fields,
      }),
      "UpdateWorkspaceObjectAttributeDefinitionUseCase"
    );
  }
}
