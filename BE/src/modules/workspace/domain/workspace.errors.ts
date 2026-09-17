import { DomainError } from "@/shared/domain/errors/domain-error";

export type WorkspaceValidationErrorCode =
  | "WORKSPACE_NAME_REQUIRED"
  | "WORKSPACE_NAME_TOO_LONG";

// 역할 : WorkspaceSidebarWorkspaceNotFoundError 사이드바에서 조회할 수 없는 Workspace 상태를 표현합니다.
export class WorkspaceSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace 단건 조회 오류를 생성합니다.
  constructor() {
    super("WorkspaceSidebarWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : WorkspaceValidationError Workspace 입력 검증 실패를 안전한 API 오류로 표현합니다.
export class WorkspaceValidationError extends DomainError {
  // 기능 : 클라이언트가 처리할 Workspace 필드 단위 검증 오류를 생성합니다.
  constructor(
    code: WorkspaceValidationErrorCode,
    field: "workspaceName",
    message: string
  ) {
    super(code, message, { field });
  }
}
