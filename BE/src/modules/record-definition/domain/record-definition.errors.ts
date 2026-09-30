import { DomainError } from "@/shared/domain/errors/domain-error";

export type RecordAttributeValueDefinitionValidationErrorCode =
  | "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_REQUIRED"
  | "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_INVALID";

// 역할 : RecordDefinitionWorkspaceNotFoundError RecordDefinition을 다룰 수 없는 Workspace 상태를 표현합니다.
export class RecordDefinitionWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace의 RecordDefinition 요청 오류를 생성합니다.
  constructor() {
    super("RecordDefinitionWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : RecordDefinitionRecordNotFoundError 수정할 수 없는 RecordDefinition 상태를 표현합니다.
export class RecordDefinitionRecordNotFoundError extends DomainError {
  // 기능 : 요청 Workspace/ObjectDefinition에 속하지 않는 RecordDefinition 요청 오류를 생성합니다.
  constructor() {
    super("RecordDefinitionRecordNotFound", "Record definition not found");
  }
}

// 역할 : RecordAttributeValueDefinitionNotFoundError 수정할 수 없는 cell value row 상태를 표현합니다.
export class RecordAttributeValueDefinitionNotFoundError extends DomainError {
  // 기능 : 요청 RecordDefinition에 속하지 않는 RecordAttributeValueDefinition 요청 오류를 생성합니다.
  constructor() {
    super(
      "RecordAttributeValueDefinitionNotFound",
      "Record attribute value definition not found"
    );
  }
}

// 역할 : RecordAttributeValueDefinitionValidationError cell value 입력 검증 실패를 안전한 API 오류로 표현합니다.
export class RecordAttributeValueDefinitionValidationError extends DomainError {
  // 기능 : 클라이언트가 처리할 cell value 필드 단위 검증 오류를 생성합니다.
  constructor(
    code: RecordAttributeValueDefinitionValidationErrorCode,
    field: "value",
    message: string
  ) {
    super(code, message, { field });
  }
}

// 역할 : RecordDefinitionObjectDefinitionNotFoundError RecordDefinition을 다룰 수 없는 ObjectDefinition 상태를 표현합니다.
export class RecordDefinitionObjectDefinitionNotFoundError extends DomainError {
  // 기능 : 요청 Workspace에 속하지 않는 ObjectDefinition의 RecordDefinition 요청 오류를 생성합니다.
  constructor() {
    super(
      "RecordDefinitionObjectDefinitionNotFound",
      "Object definition not found"
    );
  }
}
