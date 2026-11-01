import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 저장 설정을 안전하게 실행할 수 없는 상태를 구분합니다.
export class ViewDataConfigurationError extends DomainError {
  // 기능 : 민감한 설정 원문을 포함하지 않는 오류를 생성합니다.
  constructor() {
    super("ViewDataConfigurationInvalid", "View configuration is invalid");
  }
}
// 역할 : 지원하지 않거나 부족한 설정을 정상 안내 응답으로 변환합니다.
export class ViewDataNeedsConfiguration extends Error {
  // 기능 : FE 안내에 사용할 안전한 코드와 필드만 보존합니다.
  constructor(
    readonly code: string,
    readonly field: string | null = null,
    readonly bindingId: string | null = null,
  ) {
    super(code);
  }
}
// 기능 : 계산/응답 안전 상한을 넘으면 부분 결과를 버립니다.
export function assertViewDataLimit(count: number, maximum: number): void {
  if (count > maximum)
    throw new DomainError(
      "ViewDataQueryLimitExceeded",
      "View query exceeds the supported limit",
    );
}
