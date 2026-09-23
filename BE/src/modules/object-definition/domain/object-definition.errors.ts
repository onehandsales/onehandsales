import { DomainError } from "@/shared/domain/errors/domain-error";

export type ObjectDefinitionValidationErrorCode =
  | "OBJECT_DEFINITION_NAME_REQUIRED"
  | "OBJECT_DEFINITION_NAME_TOO_LONG";

// 역할 : ObjectDefinitionSidebarWorkspaceNotFoundError 사이드바 Object 목록을 조회할 수 없는 Workspace 상태를 표현합니다.
export class ObjectDefinitionSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace의 Object 목록 조회 오류를 생성합니다.
  constructor() {
    super("ObjectDefinitionSidebarWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : ObjectDefinitionWorkspaceNotFoundError 생성할 수 없는 Workspace 상태를 표현합니다.
export class ObjectDefinitionWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace의 ObjectDefinition 생성 오류를 생성합니다.
  constructor() {
    super("ObjectDefinitionWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : ObjectDefinitionValidationError ObjectDefinition 입력 검증 실패를 안전한 API 오류로 표현합니다.
export class ObjectDefinitionValidationError extends DomainError {
  // 기능 : 클라이언트가 처리할 ObjectDefinition 필드 단위 검증 오류를 생성합니다.
  constructor(
    code: ObjectDefinitionValidationErrorCode,
    field: "objectDefinitionName",
    message: string
  ) {
    super(code, message, { field });
  }
}

// 역할 : ObjectDefinitionApiSlugAlreadyExistsError Workspace 안의 apiSlug 중복을 표현합니다.
export class ObjectDefinitionApiSlugAlreadyExistsError extends DomainError {
  // 기능 : 같은 Workspace 안에 동일 apiSlug가 이미 있을 때 conflict 오류를 생성합니다.
  constructor() {
    super(
      "ObjectDefinitionApiSlugAlreadyExists",
      "Object definition api slug already exists"
    );
  }
}
