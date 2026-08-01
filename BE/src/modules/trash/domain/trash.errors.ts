import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : TrashTargetTypeUnsupportedError 지원하지 않는 휴지통 대상 유형 오류를 표현합니다.
export class TrashTargetTypeUnsupportedError extends DomainError {
  // 기능 : targetType allowlist 밖의 요청을 안전한 400 오류로 변환합니다.
  constructor() {
    super("TRASH_TARGET_TYPE_UNSUPPORTED", "지원하지 않는 휴지통 대상이에요", {
      field: "targetType",
    });
  }
}

// 역할 : TrashRecordNotFoundError 복구 문의 대상 휴지통 row 없음 오류를 표현합니다.
export class TrashRecordNotFoundError extends DomainError {
  // 기능 : 삭제 row가 없거나 사용자 소유가 아닌 경우의 404 오류를 생성합니다.
  constructor() {
    super("TRASH_RECORD_NOT_FOUND", "휴지통 데이터를 찾을 수 없어요", {
      field: "targetId",
    });
  }
}

// 역할 : TrashRecoveryRequestNotAllowedBeforeExpiryError 복구 기간 전 요청 차단 오류를 표현합니다.
export class TrashRecoveryRequestNotAllowedBeforeExpiryError extends DomainError {
  // 기능 : 무료 셀프 복구 기간이 남은 row의 문의 생성을 409 오류로 거부합니다.
  constructor() {
    super(
      "TRASH_RECOVERY_REQUEST_NOT_ALLOWED_BEFORE_EXPIRY",
      "무료 복구 기간이 지나야 복구 문의를 남길 수 있어요",
      { field: "targetId" }
    );
  }
}
