import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : RecordDefinitionWorkspaceNotFoundError RecordDefinition 목록을 조회할 수 없는 Workspace 상태를 표현합니다.
export class RecordDefinitionWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace의 RecordDefinition 목록 조회 오류를 생성합니다.
  constructor() {
    super("RecordDefinitionWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : RecordDefinitionObjectDefinitionNotFoundError RecordDefinition 목록을 조회할 수 없는 ObjectDefinition 상태를 표현합니다.
export class RecordDefinitionObjectDefinitionNotFoundError extends DomainError {
  // 기능 : 요청 Workspace에 속하지 않는 ObjectDefinition의 RecordDefinition 목록 조회 오류를 생성합니다.
  constructor() {
    super(
      "RecordDefinitionObjectDefinitionNotFound",
      "Object definition not found"
    );
  }
}
