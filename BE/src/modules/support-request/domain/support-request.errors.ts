import { DomainError } from "@/shared/domain/errors/domain-error";

export type SupportRequestValidationErrorCode =
  | "SUPPORT_REQUEST_TYPE_REQUIRED"
  | "SUPPORT_REQUEST_TYPE_INVALID"
  | "SUPPORT_REQUEST_DESCRIPTION_REQUIRED"
  | "SUPPORT_REQUEST_DESCRIPTION_TOO_LONG"
  | "SUPPORT_REQUEST_PAGE_URL_REQUIRED"
  | "SUPPORT_REQUEST_PAGE_URL_TOO_LONG";

// 역할 : SupportRequestValidationError 지원 요청 입력 검증 실패를 안전한 API 코드로 표현합니다.
export class SupportRequestValidationError extends DomainError {
  // 기능 : 클라이언트가 처리할 수 있는 필드 단위 지원 요청 검증 오류를 생성합니다.
  constructor(
    code: SupportRequestValidationErrorCode,
    field: "type" | "description" | "pageUrl",
    message: string
  ) {
    super(code, message, { field });
  }
}

// 역할 : SupportRequestUserNotFoundError 인증된 사용자 row를 찾지 못한 오류를 표현합니다.
export class SupportRequestUserNotFoundError extends DomainError {
  // 기능 : 지원 요청 접수에 필요한 사용자 snapshot 조회 실패 오류를 생성합니다.
  constructor() {
    super(
      "SUPPORT_REQUEST_USER_NOT_FOUND",
      "지원 요청을 접수할 사용자 정보를 찾지 못했어요."
    );
  }
}
