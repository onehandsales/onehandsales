import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : AttributeDefinitionValidationErrorCode가 AttributeDefinition API 검증 오류 코드를 정의합니다.
export type AttributeDefinitionValidationErrorCode =
  | "ATTRIBUTE_DEFINITION_NAME_REQUIRED"
  | "ATTRIBUTE_DEFINITION_NAME_TOO_LONG"
  | "ATTRIBUTE_DEFINITION_UPDATE_FIELD_REQUIRED"
  | "ATTRIBUTE_DEFINITION_TITLE_REQUIRED"
  | "ATTRIBUTE_DEFINITION_TITLE_TOO_LONG"
  | "ATTRIBUTE_DEFINITION_MULTISELECT_INVALID"
  | "ATTRIBUTE_DEFINITION_TYPE_UNKNOWN"
  | "ATTRIBUTE_DEFINITION_CONFIG_INVALID";

// 역할 : AttributeDefinitionValidationField가 AttributeDefinition API 검증 오류 대상 필드를 정의합니다.
export type AttributeDefinitionValidationField =
  | "attributeDefinitionName"
  | "attributeType"
  | "config"
  | "body"
  | "title"
  | "isMultiselect";

// 역할 : AttributeDefinitionWorkspaceNotFoundError AttributeDefinition을 다룰 수 없는 Workspace 상태를 표현합니다.
export class AttributeDefinitionWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace의 AttributeDefinition 요청 오류를 생성합니다.
  constructor() {
    super("AttributeDefinitionWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : AttributeDefinitionObjectDefinitionNotFoundError AttributeDefinition을 다룰 수 없는 ObjectDefinition 상태를 표현합니다.
export class AttributeDefinitionObjectDefinitionNotFoundError extends DomainError {
  // 기능 : 요청 Workspace에 속하지 않는 ObjectDefinition의 AttributeDefinition 요청 오류를 생성합니다.
  constructor() {
    super(
      "AttributeDefinitionObjectDefinitionNotFound",
      "Object definition not found"
    );
  }
}

// 역할 : AttributeDefinitionNotFoundError 조회할 수 없는 AttributeDefinition 상태를 표현합니다.
export class AttributeDefinitionNotFoundError extends DomainError {
  // 기능 : 요청 Workspace/ObjectDefinition에 속하지 않는 AttributeDefinition 요청 오류를 생성합니다.
  constructor() {
    super("AttributeDefinitionNotFound", "Attribute definition not found");
  }
}

// 역할 : AttributeDefinitionValidationError AttributeDefinition 입력 검증 실패를 안전한 API 오류로 표현합니다.
export class AttributeDefinitionValidationError extends DomainError {
  // 기능 : 클라이언트가 처리할 AttributeDefinition 필드 단위 검증 오류를 생성합니다.
  constructor(
    code: AttributeDefinitionValidationErrorCode,
    field: AttributeDefinitionValidationField,
    message: string
  ) {
    super(code, message, { field });
  }
}

// 역할 : AttributeDefinitionApiSlugAlreadyExistsError ObjectDefinition 안의 apiSlug 중복을 표현합니다.
export class AttributeDefinitionApiSlugAlreadyExistsError extends DomainError {
  // 기능 : 같은 ObjectDefinition 안에 동일 apiSlug가 이미 있을 때 conflict 오류를 생성합니다.
  constructor() {
    super(
      "AttributeDefinitionApiSlugAlreadyExists",
      "Attribute definition api slug already exists"
    );
  }
}
