import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : WorkspaceSidebarWorkspaceNotFoundError 사이드바에서 조회할 수 없는 Workspace 상태를 표현합니다.
export class WorkspaceSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace 단건 조회 오류를 생성합니다.
  constructor() {
    super("WorkspaceSidebarWorkspaceNotFound", "Workspace not found");
  }
}
