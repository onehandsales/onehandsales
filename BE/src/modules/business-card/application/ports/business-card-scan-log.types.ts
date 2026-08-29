// 역할 : BusinessCardScanStatusValue 명함 OCR 처리 상태 값을 정의합니다.
export const BusinessCardScanStatusValue = {
  OCR_SUCCESS: "OCR_SUCCESS",
  OCR_FAILED: "OCR_FAILED",
  CONFIRMED: "CONFIRMED",
} as const;

// 역할 : BusinessCardScanStatusValue 명함 OCR 처리 상태 값 타입을 정의합니다.
export type BusinessCardScanStatusValue =
  (typeof BusinessCardScanStatusValue)[keyof typeof BusinessCardScanStatusValue];

// 역할 : BusinessCardResolutionValue 명함 확정 시 기존/신규 연결 결과 값을 정의합니다.
export const BusinessCardResolutionValue = {
  EXISTING: "EXISTING",
  CREATED: "CREATED",
} as const;

// 역할 : BusinessCardResolutionValue 명함 확정 결과 값 타입을 정의합니다.
export type BusinessCardResolutionValue =
  (typeof BusinessCardResolutionValue)[keyof typeof BusinessCardResolutionValue];

// 역할 : BusinessCardSafeFailureCodeValue 사용자에게 노출 가능한 OCR 실패 코드를 정의합니다.
export const BusinessCardSafeFailureCodeValue = {
  IMAGE_QUALITY_LOW: "IMAGE_QUALITY_LOW",
  OCR_PARSE_FAILED: "OCR_PARSE_FAILED",
  OCR_PROVIDER_UNAVAILABLE: "OCR_PROVIDER_UNAVAILABLE",
  OCR_RATE_LIMITED: "OCR_RATE_LIMITED",
  OCR_UNKNOWN_FAILED: "OCR_UNKNOWN_FAILED",
} as const;

// 역할 : BusinessCardSafeFailureCodeValue 사용자에게 노출 가능한 OCR 실패 코드 타입을 정의합니다.
export type BusinessCardSafeFailureCodeValue =
  (typeof BusinessCardSafeFailureCodeValue)[keyof typeof BusinessCardSafeFailureCodeValue];
