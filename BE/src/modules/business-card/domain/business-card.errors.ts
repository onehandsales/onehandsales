import { DomainError } from "@/shared/domain/errors/domain-error";

export type BusinessCardImageValidationErrorCode =
  | "IMAGE_REQUIRED"
  | "IMAGE_TYPE_UNSUPPORTED"
  | "IMAGE_TOO_LARGE";

// 역할 : BusinessCardImageValidationError 명함 이미지 업로드 검증 실패를 안전한 API 코드로 표현합니다.
export class BusinessCardImageValidationError extends DomainError {
  // 기능 : 사용자에게 보여줄 수 있는 이미지 검증 오류를 생성합니다.
  constructor(code: BusinessCardImageValidationErrorCode, message: string) {
    super(code, message, { field: "image" });
  }
}

// 역할 : BusinessCardScanLogNotFoundError 명함 스캔 로그가 없거나 소유자가 다른 오류를 표현합니다.
export class BusinessCardScanLogNotFoundError extends DomainError {
  constructor() {
    super("BusinessCardScanLogNotFound", "Business card scan log was not found");
  }
}

// 역할 : BusinessCardScanNotConfirmableError 확정 저장할 수 없는 로그 상태 오류를 표현합니다.
export class BusinessCardScanNotConfirmableError extends DomainError {
  constructor() {
    super(
      "BusinessCardScanNotConfirmable",
      "Business card scan log is not confirmable"
    );
  }
}
