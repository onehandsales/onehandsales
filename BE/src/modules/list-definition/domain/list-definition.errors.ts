import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 목록을 생성할 Workspace 부재와 접근 권한 부재를 구분 없이 표현합니다.
export class ListDefinitionWorkspaceNotFoundError extends DomainError {
  // 기능 : 접근할 수 없는 업무 공간을 안전한 오류로 반환합니다.
  constructor() { super("ListDefinitionWorkspaceNotFound", "Workspace not found"); }
}

// 역할 : 첫 보기에서 참조할 관리 항목·속성의 부재 또는 소속 불일치를 표현합니다.
export class ListDefinitionSourceNotFoundError extends DomainError {
  // 기능 : 다른 공간의 자료 존재 여부를 노출하지 않습니다.
  constructor() { super("ListDefinitionSourceNotFound", "List source not found"); }
}

// 역할 : 같은 업무 공간에 이미 존재하는 목록 이름 충돌을 표현합니다.
export class ListDefinitionApiSlugAlreadyExistsError extends DomainError {
  // 기능 : 입력 원문 없이 목록 이름 중복을 반환합니다.
  constructor() { super("ListDefinitionApiSlugAlreadyExists", "List name already exists"); }
}

// 역할 : 사이드바 업무 목록을 조회할 수 없는 Workspace 상태를 표현합니다.
export class ListDefinitionSidebarWorkspaceNotFoundError extends DomainError {
  // 기능 : Workspace 부재와 멤버십 부재를 같은 조회 오류로 표현합니다.
  constructor() {
    super("ListDefinitionSidebarWorkspaceNotFound", "Workspace not found");
  }
}
