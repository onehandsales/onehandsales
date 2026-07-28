import { DomainError } from "./domain-error";

// 역할 : UnauthorizedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class UnauthorizedError extends DomainError {
  // 기능 : 인증 실패 도메인 오류를 생성합니다.
  constructor(message = "Unauthorized") {
    super("Unauthorized", message);
  }
}

// 역할 : ForbiddenError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ForbiddenError extends DomainError {
  // 기능 : 권한 부족 도메인 오류를 생성합니다.
  constructor(message = "Forbidden") {
    super("Forbidden", message);
  }
}

// 역할 : ValidationDomainError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ValidationDomainError extends DomainError {
  // 기능 : 입력 검증 실패 도메인 오류를 생성합니다.
  constructor(message = "Validation failed") {
    super("ValidationError", message);
  }
}

// 역할 : FieldValidationDomainError 필드 단위 검증 실패를 안전한 API 오류로 표현합니다.
export class FieldValidationDomainError extends DomainError {
  // 기능 : 클라이언트가 처리할 오류 코드와 필드명을 포함한 검증 오류를 생성합니다.
  constructor(code: string, field: string, message = "Validation failed") {
    super(code, message, { field });
  }
}

// 역할 : DeletedResourceError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DeletedResourceError extends DomainError {
  // 기능 : 삭제된 리소스 접근 도메인 오류를 생성합니다.
  constructor(readonly operation: "read" | "write", message = "Deleted resource") {
    super("DeletedResource", message, { operation });
  }
}
