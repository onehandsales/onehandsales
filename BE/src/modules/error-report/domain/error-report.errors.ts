import { DomainError } from "@/shared/domain/errors/domain-error";

export type ErrorReportValidationErrorCode =
  | "ERROR_REPORT_DESCRIPTION_REQUIRED"
  | "ERROR_REPORT_DESCRIPTION_TOO_SHORT"
  | "ERROR_REPORT_DESCRIPTION_TOO_LONG"
  | "ERROR_REPORT_PAGE_URL_REQUIRED"
  | "ERROR_REPORT_PAGE_URL_TOO_LONG"
  | "ERROR_REPORT_SCREENSHOT_TYPE_UNSUPPORTED"
  | "ERROR_REPORT_SCREENSHOT_TOO_LARGE";

// 역할 : ErrorReportValidationError 에러 신고 입력 검증 실패를 안전한 API 코드로 표현합니다.
export class ErrorReportValidationError extends DomainError {
  // 기능 : 클라이언트가 처리할 수 있는 필드 단위 에러 신고 검증 오류를 생성합니다.
  constructor(
    code: ErrorReportValidationErrorCode,
    field: "description" | "pageUrl" | "screenshot",
    message: string
  ) {
    super(code, message, { field });
  }
}

// 역할 : ErrorReportUserNotFoundError 인증된 사용자 row를 찾지 못한 오류를 표현합니다.
export class ErrorReportUserNotFoundError extends DomainError {
  // 기능 : 에러 신고 접수에 필요한 사용자 snapshot 조회 실패 오류를 생성합니다.
  constructor() {
    super(
      "ERROR_REPORT_USER_NOT_FOUND",
      "에러 신고를 접수할 사용자 정보를 찾지 못했어요."
    );
  }
}

// 역할 : ErrorReportScreenshotStorageFailedError screenshot 저장소 실패를 안전한 API 코드로 표현합니다.
export class ErrorReportScreenshotStorageFailedError extends DomainError {
  // 기능 : 외부 storage 실패를 사용자에게 안전한 오류로 변환합니다.
  constructor() {
    super(
      "ERROR_REPORT_SCREENSHOT_STORAGE_FAILED",
      "지금은 에러 신고를 접수하기 어려워요. 잠시 후 다시 시도해 주세요.",
      { retryable: true }
    );
  }
}
