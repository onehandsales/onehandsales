import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 인라인 컬럼 생성의 공개 오류 코드와 고정 메시지를 정의합니다.
export class ViewColumnError extends DomainError {
  // 기능 : 입력 원문과 다른 Workspace 정보를 노출하지 않는 오류를 생성합니다.
  constructor(code: "ViewColumnNotFound" | "ViewColumnTargetUnsupported" | "ViewColumnCreationConflict" | "ViewColumnLimitExceeded") {
    super(code, {
      ViewColumnNotFound: "View definition not found",
      ViewColumnTargetUnsupported: "Only object table views support column creation",
      ViewColumnCreationConflict: "Column creation request conflicts with an existing request",
      ViewColumnLimitExceeded: "View column limit exceeded",
    }[code]);
  }
}
