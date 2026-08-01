import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : AdminForbiddenError Admin API 접근 권한 부족 오류를 표현합니다.
export class AdminForbiddenError extends DomainError {
  // 기능 : 관리자 권한이 없는 요청의 오류 코드를 생성합니다.
  constructor() {
    super("ADMIN_FORBIDDEN", "관리자 권한이 필요해요");
  }
}

// 역할 : AdminReasonRequiredError 민감 원문 조회 사유 검증 오류를 표현합니다.
export class AdminReasonRequiredError extends DomainError {
  // 기능 : 사유가 없거나 길이 정책을 벗어난 경우 field detail을 포함합니다.
  constructor() {
    super(
      "ADMIN_REASON_REQUIRED",
      "민감 원문 조회 사유는 10자 이상 1000자 이하로 입력해 주세요",
      { field: "reason" }
    );
  }
}

// 역할 : AdminTargetNotFoundError Admin 민감 원문 조회 대상 없음 오류를 표현합니다.
export class AdminTargetNotFoundError extends DomainError {
  // 기능 : 대상 사용자 또는 대상 record가 확인되지 않은 경우의 오류를 생성합니다.
  constructor() {
    super("ADMIN_TARGET_NOT_FOUND", "대상 데이터를 찾을 수 없어요", {
      field: "targetId",
    });
  }
}

// 역할 : AdminSensitiveFieldSetUnsupportedError 허용되지 않은 민감 필드 묶음 오류를 표현합니다.
export class AdminSensitiveFieldSetUnsupportedError extends DomainError {
  // 기능 : fieldSet과 targetType 조합이 허용되지 않은 경우 field detail을 포함합니다.
  constructor() {
    super(
      "ADMIN_SENSITIVE_FIELDSET_UNSUPPORTED",
      "허용되지 않은 민감 원문 조회 범위예요",
      { field: "fieldSet" }
    );
  }
}

// 역할 : AdminDomainUnsupportedError Admin 도메인 탭 미지원 domain 오류를 표현합니다.
export class AdminDomainUnsupportedError extends DomainError {
  // 기능 : domain query가 G04 allowlist 밖인 경우 field detail을 포함합니다.
  constructor() {
    super("ADMIN_DOMAIN_UNSUPPORTED", "지원하지 않는 도메인 조회예요", {
      field: "domain",
    });
  }
}

// 역할 : AdminUserNotFoundError Admin 사용자 overview 대상 없음 오류를 표현합니다.
export class AdminUserNotFoundError extends DomainError {
  // 기능 : Admin 사용자 목록/상세/timeline 대상 사용자가 없을 때의 오류를 생성합니다.
  constructor() {
    super("ADMIN_USER_NOT_FOUND", "사용자를 찾을 수 없어요", {
      field: "userId",
    });
  }
}

// 역할 : AdminAnalyticsRangeRequiredError Admin analytics 기간 필수 검증 오류를 표현합니다.
export class AdminAnalyticsRangeRequiredError extends DomainError {
  // 기능 : from/to가 없거나 올바른 ISO instant가 아닐 때 field detail을 포함합니다.
  constructor(field: "from" | "to") {
    super("ADMIN_ANALYTICS_RANGE_REQUIRED", "분석 기간을 입력해 주세요", {
      field,
    });
  }
}

// 역할 : AdminAnalyticsRangeTooLargeError Admin analytics 기간 상한 검증 오류를 표현합니다.
export class AdminAnalyticsRangeTooLargeError extends DomainError {
  // 기능 : 조회 기간이 운영 overview 상한을 넘었을 때 오류를 생성합니다.
  constructor() {
    super(
      "ADMIN_ANALYTICS_RANGE_TOO_LARGE",
      "분석 기간은 최대 366일까지 조회할 수 있어요",
      { field: "to" }
    );
  }
}

// 역할 : AdminTimezoneInvalidError Admin analytics timezone 검증 오류를 표현합니다.
export class AdminTimezoneInvalidError extends DomainError {
  // 기능 : IANA timezone으로 해석할 수 없는 값에 대한 오류를 생성합니다.
  constructor() {
    super("ADMIN_TIMEZONE_INVALID", "지원하지 않는 timezone이에요", {
      field: "timeZone",
    });
  }
}
