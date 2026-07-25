import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : DealNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DealNotFoundError extends DomainError {
  // 기능 : 딜이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("DealNotFound", "Deal was not found");
  }
}

// 역할 : RelatedResourceNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class RelatedResourceNotFoundError extends DomainError {
  // 기능 : 딜에 연결할 회사/담당자/제품이 없거나 담당자가 회사에 속하지 않는 경우의 오류를 생성합니다.
  constructor() {
    super("RelatedResourceNotFound", "Related resource was not found");
  }
}

// 역할 : DealFollowingActionLogNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DealFollowingActionLogNotFoundError extends DomainError {
  // 기능 : 딜 다음 행동 로그가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super(
      "DealFollowingActionLogNotFound",
      "Deal following action log was not found"
    );
  }
}

// 역할 : DealMemoLogNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DealMemoLogNotFoundError extends DomainError {
  // 기능 : 딜 메모 로그가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("DealMemoLogNotFound", "Deal memo log was not found");
  }
}

// 역할 : DealActivityNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DealActivityNotFoundError extends DomainError {
  // 기능 : 딜 활동이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("DealActivityNotFound", "Deal activity was not found");
  }
}

// 역할 : DealActivityNotEditableError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DealActivityNotEditableError extends DomainError {
  // 기능 : 자동 생성된 딜 활동 수정 시도 오류를 생성합니다.
  constructor() {
    super("DealActivityNotEditable", "Deal activity is not editable");
  }
}

// 역할 : DealExportFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DealExportFailedError extends DomainError {
  // 기능 : 딜 xlsx export 파일 생성 실패 오류를 생성합니다.
  constructor() {
    super("DealExportFailed", "Deal export failed");
  }
}
