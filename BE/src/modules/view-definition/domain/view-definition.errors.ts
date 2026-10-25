import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 현재 사용자가 즐겨찾기를 조회할 수 없는 Workspace 상태를 표현합니다.
export class ViewFavoriteSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : Workspace 부재와 멤버십 부재를 같은 조회 오류로 처리합니다.
  constructor() {
    super("ViewFavoriteSidebarWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : 헤더를 조회할 수 없는 Workspace 상태를 표현합니다.
export class ViewHeaderWorkspaceNotFoundError extends DomainError {
  // 기능 : Workspace 부재와 비멤버 상태를 동일한 404로 표현합니다.
  constructor() {
    super("ViewHeaderWorkspaceNotFound", "Workspace not found");
  }
}

// 역할 : 헤더 대상 Object가 요청 Workspace에 없는 상태를 표현합니다.
export class ViewHeaderObjectDefinitionNotFoundError extends DomainError {
  // 기능 : Object 부재와 다른 Workspace의 Object를 동일한 404로 표현합니다.
  constructor() {
    super("ViewHeaderObjectDefinitionNotFound", "Object definition not found");
  }
}

// 역할 : 헤더 대상 List가 요청 Workspace에 없는 상태를 표현합니다.
export class ViewHeaderListDefinitionNotFoundError extends DomainError {
  // 기능 : List 부재와 다른 Workspace의 List를 동일한 404로 표현합니다.
  constructor() {
    super("ViewHeaderListDefinitionNotFound", "List definition not found");
  }
}
