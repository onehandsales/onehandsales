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

export class ImportJobRowNotFoundError extends DomainError {
  constructor() {
    super("ImportJobRowNotFound", "불러오기 row를 찾을 수 없습니다.");
  }
}

export class ImportJobExpiredError extends DomainError {
  constructor() {
    super("ImportJobExpired", "불러오기 작업이 만료되었습니다.");
  }
}

export class ImportJobAlreadyClosedError extends DomainError {
  constructor() {
    super("ImportJobAlreadyClosed", "이미 종료된 불러오기 작업입니다.");
  }
}

export class ImportJobAlreadyConfirmedError extends DomainError {
  constructor() {
    super("ImportJobAlreadyConfirmed", "이미 확정된 불러오기 작업입니다.");
  }
}

export class ImportJobNotReadyError extends DomainError {
  constructor() {
    super("ImportJobNotReady", "아직 확정할 수 없는 불러오기 작업입니다.");
  }
}

export class ImportMappingRequiredError extends DomainError {
  constructor() {
    super("ImportMappingRequired", "컬럼 매칭이 필요합니다.");
  }
}

export class InvalidImportMappingError extends DomainError {
  constructor() {
    super("InvalidImportMapping", "컬럼 매칭 값이 올바르지 않습니다.");
  }
}

export class ImportFileStorageFailedError extends DomainError {
  constructor() {
    super(
      "ImportFileStorageFailed",
      "파일을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
  }
}

export class ImportMappingFailedError extends DomainError {
  constructor() {
    super("ImportMappingFailed", "컬럼 매칭을 생성하지 못했습니다.");
  }
}

export class ImportConfirmFailedError extends DomainError {
  constructor() {
    super("ImportConfirmFailed", "불러오기 확정에 실패했습니다.");
  }
}
