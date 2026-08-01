import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : DataExportRequestNotFoundError 사용자 데이터 export 요청 없음 오류를 표현합니다.
export class DataExportRequestNotFoundError extends DomainError {
  // 기능 : 요청이 없거나 현재 사용자 소유가 아닐 때 안전한 404 오류를 생성합니다.
  constructor() {
    super("DATA_EXPORT_REQUEST_NOT_FOUND", "데이터 export 요청을 찾을 수 없어요", {
      field: "requestId",
    });
  }
}

// 역할 : DataExportRequestIdInvalidError 사용자 데이터 export 요청 ID 형식 오류를 표현합니다.
export class DataExportRequestIdInvalidError extends DomainError {
  // 기능 : requestId가 UUID 형식이 아닐 때 field detail을 포함합니다.
  constructor() {
    super("DATA_EXPORT_REQUEST_ID_INVALID", "요청 ID 형식이 올바르지 않아요", {
      field: "requestId",
    });
  }
}

// 역할 : DataExportIncludeSensitiveUnsupportedError G08 민감 데이터 export 보류 오류를 표현합니다.
export class DataExportIncludeSensitiveUnsupportedError extends DomainError {
  // 기능 : 별도 확인 UI 없는 includeSensitive=true 요청을 거부합니다.
  constructor() {
    super(
      "DATA_EXPORT_INCLUDE_SENSITIVE_UNSUPPORTED",
      "민감 데이터 포함 export는 아직 요청할 수 없어요",
      { field: "includeSensitive" }
    );
  }
}

// 역할 : DataExportFormatUnsupportedError 사용자 데이터 export 형식 오류를 표현합니다.
export class DataExportFormatUnsupportedError extends DomainError {
  // 기능 : G08에서 지원하지 않는 export format 요청을 거부합니다.
  constructor() {
    super("DATA_EXPORT_FORMAT_UNSUPPORTED", "지원하지 않는 export 형식이에요", {
      field: "format",
    });
  }
}

// 역할 : AccountDeletionConfirmTextInvalidError 계정 삭제 확인 문구 오류를 표현합니다.
export class AccountDeletionConfirmTextInvalidError extends DomainError {
  // 기능 : confirmText가 DELETE MY ACCOUNT와 정확히 일치하지 않으면 거부합니다.
  constructor() {
    super(
      "ACCOUNT_DELETION_CONFIRM_TEXT_INVALID",
      "확인 문구를 정확히 입력해 주세요",
      { field: "confirmText" }
    );
  }
}

// 역할 : AccountDeletionRequestNotFoundError 계정 삭제 요청 없음 오류를 표현합니다.
export class AccountDeletionRequestNotFoundError extends DomainError {
  // 기능 : 요청이 없거나 현재 사용자 소유가 아닐 때 안전한 404 오류를 생성합니다.
  constructor() {
    super(
      "ACCOUNT_DELETION_REQUEST_NOT_FOUND",
      "계정 삭제 요청을 찾을 수 없어요",
      { field: "requestId" }
    );
  }
}

// 역할 : AccountDeletionRequestIdInvalidError 계정 삭제 요청 ID 형식 오류를 표현합니다.
export class AccountDeletionRequestIdInvalidError extends DomainError {
  // 기능 : requestId가 UUID 형식이 아닐 때 field detail을 포함합니다.
  constructor() {
    super(
      "ACCOUNT_DELETION_REQUEST_ID_INVALID",
      "요청 ID 형식이 올바르지 않아요",
      { field: "requestId" }
    );
  }
}

// 역할 : AccountDeletionRequestNotCancelableError 계정 삭제 요청 취소 불가 오류를 표현합니다.
export class AccountDeletionRequestNotCancelableError extends DomainError {
  // 기능 : 유예 기간이 지났거나 처리 중인 삭제 요청 취소를 거부합니다.
  constructor() {
    super(
      "ACCOUNT_DELETION_REQUEST_NOT_CANCELABLE",
      "이 계정 삭제 요청은 취소할 수 없어요",
      { field: "requestId" }
    );
  }
}
