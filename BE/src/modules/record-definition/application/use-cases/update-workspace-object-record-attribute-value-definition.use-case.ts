import { Inject, Injectable } from "@nestjs/common";
import {
  OBJECT_DEFINITION_ACCESS_QUERY,
  type ObjectDefinitionAccessQuery,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import {
  RECORD_DEFINITION_COMMAND_REPOSITORY,
  type RecordAttributeValueDefinitionValuePatch,
  type RecordDefinitionCommandRepository,
} from "@/modules/record-definition/application/ports/record-definition-command.repository";
import type { RecordAttributeValueType } from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import {
  RecordAttributeValueDefinitionNotFoundError,
  RecordAttributeValueDefinitionValidationError,
  RecordDefinitionObjectDefinitionNotFoundError,
  RecordDefinitionRecordNotFoundError,
  RecordDefinitionWorkspaceNotFoundError,
} from "@/modules/record-definition/domain/record-definition.errors";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  APPLICATION_LOGGER,
  type ApplicationLogger,
} from "@/shared/application/ports/application-logger.port";
import {
  TRANSACTION_MANAGER,
  type TransactionContext,
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";

type JsonObject = Record<string, unknown>;

// 역할 : UpdateWorkspaceObjectRecordAttributeValueDefinitionCommand가 cell value 수정 요청 값을 정의합니다.
export interface UpdateWorkspaceObjectRecordAttributeValueDefinitionCommand {
  readonly hasValue: boolean;
  readonly value: unknown;
}

// 역할 : UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse가 cell value 수정 응답 값을 정의합니다.
export interface UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse {
  readonly recordAttributeValueDefinitionId: string;
}

// 역할 : UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase가 ObjectDefinition 목록 cell value 수정을 담당합니다.
@Injectable()
export class UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase {
  // 기능 : Workspace/Object/Record 저장소 포트와 transaction manager, logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(RECORD_DEFINITION_COMMAND_REPOSITORY)
    private readonly recordDefinitionCommandRepository: RecordDefinitionCommandRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 Record cell value를 수정합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string,
    recordDefinitionId: string,
    recordAttributeValueDefinitionId: string,
    command: UpdateWorkspaceObjectRecordAttributeValueDefinitionCommand
  ): Promise<UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse> {
    // 1. request body가 수정할 value key를 명시했는지 먼저 검증한다.
    this.assertValueKey(command);

    // 2. 현재 사용자가 요청 Workspace의 멤버인지 확인하고 수정 감사 주체 Actor를 조회한다.
    const workspaceAccess =
      await this.workspaceAccessQuery.getWorkspaceMemberAccess(
        currentUser.id,
        workspaceId
      );

    if (!workspaceAccess) {
      throw new RecordDefinitionWorkspaceNotFoundError();
    }

    if (!workspaceAccess.actorId) {
      throw new Error("Workspace member actor is missing");
    }

    const updatedByActorId = workspaceAccess.actorId;

    // 3. 요청 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
    const hasObjectDefinition =
      await this.objectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({
        workspaceId,
        objectDefinitionId,
      });

    if (!hasObjectDefinition) {
      throw new RecordDefinitionObjectDefinitionNotFoundError();
    }

    // 4. 요청 RecordDefinition이 Workspace/ObjectDefinition 경계 안에 있는지 확인한다.
    const hasRecordDefinition =
      await this.recordDefinitionCommandRepository.hasRecordDefinitionInWorkspaceObject(
        {
          workspaceId,
          objectDefinitionId,
          recordDefinitionId,
        }
      );

    if (!hasRecordDefinition) {
      throw new RecordDefinitionRecordNotFoundError();
    }

    // 5. 수정 대상 cell value row와 연결 AttributeDefinition 정합성을 조회한다.
    const recordAttributeValueDefinition =
      await this.recordDefinitionCommandRepository.findRecordAttributeValueDefinitionForUpdate(
        {
          workspaceId,
          objectDefinitionId,
          recordDefinitionId,
          recordAttributeValueDefinitionId,
        }
      );

    if (!recordAttributeValueDefinition) {
      throw new RecordAttributeValueDefinitionNotFoundError();
    }

    // 6. DB에 저장된 attributeType snapshot 기준으로 요청 값을 저장 컬럼 값으로 매핑한다.
    const values = this.mapValueByAttributeType(
      recordAttributeValueDefinition.attributeType,
      command.value
    );

    // 7. cell value row와 부모 RecordDefinition audit update를 하나의 transaction으로 저장한다.
    const updated = await this.transactionManager.runInTransaction((context) =>
      this.updateRecordAttributeValueDefinitionInTransaction({
        workspaceId,
        objectDefinitionId,
        recordDefinitionId,
        recordAttributeValueDefinitionId,
        updatedByActorId,
        values,
        transactionContext: context,
      })
    );

    // 8. 값 원문 없이 수정 이벤트만 구조화 로그로 남긴다.
    this.logUpdatedEvent({
      userId: currentUser.id,
      workspaceId,
      objectDefinitionId,
      recordDefinitionId,
      recordAttributeValueDefinitionId: updated.id,
      attributeDefinitionId:
        recordAttributeValueDefinition.attributeDefinitionId,
      attributeType: recordAttributeValueDefinition.attributeType,
    });

    return {
      recordAttributeValueDefinitionId: updated.id,
    };
  }

  // 기능 : RecordAttributeValueDefinition과 부모 RecordDefinition audit update를 같은 transaction context로 저장합니다.
  private updateRecordAttributeValueDefinitionInTransaction(input: {
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly recordDefinitionId: string;
    readonly recordAttributeValueDefinitionId: string;
    readonly updatedByActorId: string;
    readonly values: RecordAttributeValueDefinitionValuePatch;
    readonly transactionContext: TransactionContext;
  }) {
    // 1. 저장소에 transaction context를 전달해 cell value와 부모 RecordDefinition을 원자적으로 수정한다.
    return this.recordDefinitionCommandRepository.updateRecordAttributeValueDefinition(
      input
    );
  }

  // 기능 : request body에 value key가 포함되어 있는지 확인합니다.
  private assertValueKey(
    command: UpdateWorkspaceObjectRecordAttributeValueDefinitionCommand
  ): void {
    if (!command.hasValue || command.value === undefined) {
      throw new RecordAttributeValueDefinitionValidationError(
        "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_REQUIRED",
        "value",
        "Record attribute value definition value is required"
      );
    }
  }

  // 기능 : AttributeType snapshot에 맞게 request value를 저장 컬럼 값으로 변환합니다.
  private mapValueByAttributeType(
    attributeType: RecordAttributeValueType,
    value: unknown
  ): RecordAttributeValueDefinitionValuePatch {
    if (value === null) {
      return this.createEmptyValuePatch();
    }

    switch (attributeType) {
      case "Text":
      case "EmailAddress":
      case "Domain":
      case "PhoneNumber":
        return {
          ...this.createEmptyValuePatch(),
          textValue: this.assertStringValue(value),
        };
      case "Number":
      case "Rating":
      case "Currency":
        return {
          ...this.createEmptyValuePatch(),
          numberValue: this.assertDecimalStringValue(value),
        };
      case "Checkbox":
        return {
          ...this.createEmptyValuePatch(),
          booleanValue: this.assertBooleanValue(value),
        };
      case "Date":
        return {
          ...this.createEmptyValuePatch(),
          dateValue: this.assertDateValue(value),
        };
      case "Timestamp":
        return {
          ...this.createEmptyValuePatch(),
          timestampValue: this.assertTimestampValue(value),
        };
      case "Location": {
        const objectValue = this.assertObjectValue(value);
        return {
          ...this.createEmptyValuePatch(),
          textValue: this.pickOptionalString(objectValue, "text"),
          jsonValue: objectValue,
        };
      }
      case "PersonalName": {
        const objectValue = this.assertObjectValue(value);
        return {
          ...this.createEmptyValuePatch(),
          textValue: this.pickOptionalString(objectValue, "displayName"),
          jsonValue: objectValue,
        };
      }
      case "Interaction": {
        const objectValue = this.assertObjectValue(value);
        return {
          ...this.createEmptyValuePatch(),
          textValue: this.pickOptionalString(objectValue, "summary"),
          timestampValue: this.pickOptionalTimestamp(objectValue, "occurredAt"),
          jsonValue: objectValue,
        };
      }
      case "Select":
      case "Status":
      case "RecordReference":
      case "ActorReference":
        return {
          ...this.createEmptyValuePatch(),
          jsonValue: this.assertObjectValue(value),
        };
    }
  }

  // 기능 : 모든 cell value 저장 컬럼을 null로 초기화한 update 값을 생성합니다.
  private createEmptyValuePatch(): RecordAttributeValueDefinitionValuePatch {
    return {
      jsonValue: null,
      textValue: null,
      numberValue: null,
      booleanValue: null,
      dateValue: null,
      timestampValue: null,
      selectOptionId: null,
      statusOptionId: null,
      targetRecordDefinitionId: null,
      targetObjectDefinitionId: null,
      targetActorId: null,
    };
  }

  // 기능 : value가 문자열인지 확인하고 반환합니다.
  private assertStringValue(value: unknown): string {
    if (typeof value !== "string") {
      throw this.createInvalidValueError();
    }

    return value;
  }

  // 기능 : value가 boolean인지 확인하고 반환합니다.
  private assertBooleanValue(value: unknown): boolean {
    if (typeof value !== "boolean") {
      throw this.createInvalidValueError();
    }

    return value;
  }

  // 기능 : value가 Decimal로 저장 가능한 문자열인지 확인하고 반환합니다.
  private assertDecimalStringValue(value: unknown): string {
    if (typeof value !== "string" || !/^-?\d+(\.\d+)?$/.test(value)) {
      throw this.createInvalidValueError();
    }

    return value;
  }

  // 기능 : value가 YYYY-MM-DD 날짜 문자열인지 확인하고 Date 값으로 변환합니다.
  private assertDateValue(value: unknown): Date {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw this.createInvalidValueError();
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      throw this.createInvalidValueError();
    }

    return date;
  }

  // 기능 : value가 timezone 정보가 있는 ISO datetime 문자열인지 확인하고 Date 값으로 변환합니다.
  private assertTimestampValue(value: unknown): Date {
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ) {
      throw this.createInvalidValueError();
    }

    const timestamp = new Date(value);

    if (Number.isNaN(timestamp.getTime())) {
      throw this.createInvalidValueError();
    }

    return timestamp;
  }

  // 기능 : value가 JSON object 형태인지 확인하고 반환합니다.
  private assertObjectValue(value: unknown): JsonObject {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw this.createInvalidValueError();
    }

    return value as JsonObject;
  }

  // 기능 : object value에서 표시용 문자열 필드를 선택적으로 추출합니다.
  private pickOptionalString(value: JsonObject, key: string): string | null {
    const candidate = value[key];

    if (candidate === undefined || candidate === null) {
      return null;
    }

    if (typeof candidate !== "string") {
      throw this.createInvalidValueError();
    }

    return candidate;
  }

  // 기능 : object value에서 선택적 timestamp 필드를 추출하고 Date 값으로 변환합니다.
  private pickOptionalTimestamp(value: JsonObject, key: string): Date | null {
    const candidate = value[key];

    if (candidate === undefined || candidate === null) {
      return null;
    }

    return this.assertTimestampValue(candidate);
  }

  // 기능 : cell value 검증 실패 오류를 생성합니다.
  private createInvalidValueError(): RecordAttributeValueDefinitionValidationError {
    return new RecordAttributeValueDefinitionValidationError(
      "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID",
      "value",
      "Record attribute value definition value is invalid"
    );
  }

  // 기능 : RecordAttributeValueDefinition 수정 이벤트를 사용자 입력 원문 없이 구조화 로그로 남깁니다.
  private logUpdatedEvent(fields: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly recordDefinitionId: string;
    readonly recordAttributeValueDefinitionId: string;
    readonly attributeDefinitionId: string;
    readonly attributeType: RecordAttributeValueType;
  }): void {
    this.logger.log(
      JSON.stringify({
        event: "crm.recordAttributeValueDefinition.updated",
        ...fields,
      }),
      "UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase"
    );
  }
}
