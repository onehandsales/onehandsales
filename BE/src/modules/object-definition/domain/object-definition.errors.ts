import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : ObjectDefinitionSidebarWorkspaceNotFoundError 사이드바 Object 목록을 조회할 수 없는 Workspace 상태를 표현합니다.
export class ObjectDefinitionSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : 현재 사용자가 접근할 수 없는 Workspace의 Object 목록 조회 오류를 생성합니다.
  constructor() {
    super("ObjectDefinitionSidebarWorkspaceNotFound", "Workspace not found");
  }
}
