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
