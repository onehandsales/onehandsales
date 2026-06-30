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
