import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : ImportTemplateNotFoundError 불러오기 양식이 없을 때의 오류를 표현합니다.
export class ImportTemplateNotFoundError extends DomainError {
  // 기능 : 불러오기 양식 없음 오류를 생성합니다.
  constructor() {
    super("ImportTemplateNotFound", "불러오기 양식을 찾을 수 없습니다.");
  }
}

// 역할 : ImportTemplateSchemaInvalidError 저장된 불러오기 양식 정의 오류를 표현합니다.
export class ImportTemplateSchemaInvalidError extends DomainError {
  // 기능 : 불러오기 양식 정의 오류를 생성합니다.
  constructor(message = "불러오기 양식 정의가 올바르지 않습니다.") {
    super("ImportTemplateSchemaInvalid", message);
  }
}

// 역할 : ImportUserLogNotFoundError 불러오기 로그가 없을 때의 오류를 표현합니다.
export class ImportUserLogNotFoundError extends DomainError {
  // 기능 : 불러오기 로그 없음 오류를 생성합니다.
  constructor() {
    super("ImportUserLogNotFound", "불러오기 내역을 찾을 수 없습니다.");
  }
}

// 역할 : ImportJobNotFoundError 확정 전 임시 불러오기 job이 없을 때의 오류를 표현합니다.
export class ImportJobNotFoundError extends DomainError {
  // 기능 : 임시 불러오기 job 없음 오류를 생성합니다.
  constructor() {
    super("ImportJobNotFound", "불러오기 작업을 찾을 수 없습니다.");
  }
}

// 역할 : ImportJobRowNotFoundError 현재 사용자 import job에 속한 row가 없을 때의 오류를 표현합니다.
export class ImportJobRowNotFoundError extends DomainError {
  // 기능 : 임시 불러오기 row 없음 오류를 생성합니다.
  constructor() {
    super("ImportJobRowNotFound", "불러오기 row를 찾을 수 없습니다.");
  }
}

// 역할 : ImportJobExpiredError 임시 불러오기 job의 TTL이 만료되었을 때의 오류를 표현합니다.
export class ImportJobExpiredError extends DomainError {
  // 기능 : 임시 불러오기 job 만료 오류를 생성합니다.
  constructor() {
    super("ImportJobExpired", "불러오기 작업이 만료되었습니다.");
  }
}

// 역할 : ImportJobAlreadyClosedError 이미 종료된 임시 불러오기 job 수정 오류를 표현합니다.
export class ImportJobAlreadyClosedError extends DomainError {
  // 기능 : 종료된 임시 불러오기 job 접근 오류를 생성합니다.
  constructor() {
    super("ImportJobAlreadyClosed", "이미 종료된 불러오기 작업입니다.");
  }
}

// 역할 : ImportJobAlreadyConfirmedError 이미 확정된 import job의 중복 확정 오류를 표현합니다.
export class ImportJobAlreadyConfirmedError extends DomainError {
  // 기능 : 중복 확정 오류를 생성합니다.
  constructor() {
    super("ImportJobAlreadyConfirmed", "이미 확정된 불러오기 작업입니다.");
  }
}

// 역할 : ImportJobNotReadyError 아직 확정 가능 상태가 아닌 import job 오류를 표현합니다.
export class ImportJobNotReadyError extends DomainError {
  // 기능 : 확정 준비 전 상태 오류를 생성합니다.
  constructor() {
    super("ImportJobNotReady", "아직 확정할 수 없는 불러오기 작업입니다.");
  }
}

// 역할 : ImportMappingRequiredError 확정 전 필수 컬럼 매핑 누락 오류를 표현합니다.
export class ImportMappingRequiredError extends DomainError {
  // 기능 : 필수 컬럼 매핑 누락 오류를 생성합니다.
  constructor() {
    super("ImportMappingRequired", "컬럼 매칭이 필요합니다.");
  }
}

// 역할 : InvalidImportMappingError 사용자가 제출한 컬럼 매핑 값 오류를 표현합니다.
export class InvalidImportMappingError extends DomainError {
  // 기능 : 잘못된 컬럼 매핑 오류를 생성합니다.
  constructor() {
    super("InvalidImportMapping", "컬럼 매칭 값이 올바르지 않습니다.");
  }
}

// 역할 : ImportFileStorageFailedError 업로드 원본 파일 저장 실패 오류를 표현합니다.
export class ImportFileStorageFailedError extends DomainError {
  // 기능 : 원본 파일 저장 실패 오류를 생성합니다.
  constructor() {
    super(
      "ImportFileStorageFailed",
      "파일을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
  }
}

// 역할 : UnsupportedImportFileTypeError 지원하지 않는 import 파일 형식 오류를 표현합니다.
export class UnsupportedImportFileTypeError extends DomainError {
  // 기능 : 파일 형식 불가 오류를 생성합니다.
  constructor() {
    super("UnsupportedImportFileType", "CSV 또는 XLSX 파일을 올려 주세요.");
  }
}

// 역할 : ImportFileParseFailedError import 파일 파싱 실패 오류를 표현합니다.
export class ImportFileParseFailedError extends DomainError {
  // 기능 : 파일 파싱 실패 오류를 생성합니다.
  constructor() {
    super("ImportFileParseFailed", "파일을 읽지 못했습니다. 형식을 확인해 주세요.");
  }
}

// 역할 : ImportMappingFailedError import 컬럼 매핑 생성 실패 오류를 표현합니다.
export class ImportMappingFailedError extends DomainError {
  // 기능 : 컬럼 매핑 생성 실패 오류를 생성합니다.
  constructor() {
    super("ImportMappingFailed", "컬럼 매칭을 생성하지 못했습니다.");
  }
}

// 역할 : ImportConfirmFailedError import job 확정 처리 실패 오류를 표현합니다.
export class ImportConfirmFailedError extends DomainError {
  // 기능 : import job 확정 실패 오류를 생성합니다.
  constructor() {
    super("ImportConfirmFailed", "불러오기 확정에 실패했습니다.");
  }
}

// 역할 : ImportConfirmValidationFailedError 확정 중 row 상태 검증 실패 오류를 표현합니다.
export class ImportConfirmValidationFailedError extends DomainError {
  // 기능 : 확정 전 row 수정 필요 오류를 생성합니다.
  constructor() {
    super(
      "ImportConfirmValidationFailed",
      "불러오기 확정 전에 수정이 필요한 row가 있습니다."
    );
  }
}
