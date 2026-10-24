import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 사이드바 업무 목록을 조회할 수 없는 Workspace 상태를 표현합니다.
export class ListDefinitionSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : Workspace 부재와 멤버십 부재를 같은 조회 오류로 표현합니다.
  constructor() {
    super("ListDefinitionSidebarWorkspaceNotFound", "Workspace not found");
  }
}
