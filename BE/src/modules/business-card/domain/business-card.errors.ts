import { DomainError } from "@/shared/domain/errors/domain-error";

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
