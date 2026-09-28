import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : AttributeDefinitionWorkspaceNotFoundError AttributeDefinition 목록을 조회할 수 없는 Workspace 상태를 표현합니다.
export class AttributeDefinitionWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace의 AttributeDefinition 목록 조회 오류를 생성합니다.
  constructor() {
    super("AttributeDefinitionWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : AttributeDefinitionObjectDefinitionNotFoundError AttributeDefinition 목록을 조회할 수 없는 ObjectDefinition 상태를 표현합니다.
export class AttributeDefinitionObjectDefinitionNotFoundError extends DomainError {
  // 기능 : 요청 Workspace에 속하지 않는 ObjectDefinition의 AttributeDefinition 목록 조회 오류를 생성합니다.
  constructor() {
    super(
      "AttributeDefinitionObjectDefinitionNotFound",
      "Object definition not found"
    );
  }
}
