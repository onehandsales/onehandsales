import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 현재 사용자가 즐겨찾기를 조회할 수 없는 Workspace 상태를 표현합니다.
export class ViewFavoriteSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : Workspace 부재와 멤버십 부재를 같은 조회 오류로 처리합니다.
  constructor() {
    super("ViewFavoriteSidebarWorkspaceNotFound", "Workspace not found");
  }
}
