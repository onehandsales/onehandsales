import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : ContactNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactNotFoundError extends DomainError {
  // 기능 : 거래처가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("ContactNotFound", "Contact was not found");
  }
}

// 역할 : ContactDepartmentNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactDepartmentNotFoundError extends DomainError {
  // 기능 : 거래처 부서가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("ContactDepartmentNotFound", "Contact department was not found");
  }
}

// 역할 : ContactJobGradeNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactJobGradeNotFoundError extends DomainError {
  // 기능 : 거래처 직급이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("ContactJobGradeNotFound", "Contact job grade was not found");
  }
}

// 역할 : DuplicateContactDepartmentError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DuplicateContactDepartmentError extends DomainError {
  // 기능 : 같은 사용자 안에서 거래처 부서 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateContactDepartment", "Contact department already exists");
  }
}

// 역할 : DuplicateContactJobGradeError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DuplicateContactJobGradeError extends DomainError {
  // 기능 : 같은 사용자 안에서 거래처 직급 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateContactJobGrade", "Contact job grade already exists");
  }
}

// 역할 : ContactDepartmentInUseError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactDepartmentInUseError extends DomainError {
  // 기능 : 거래처에 매핑된 부서 삭제 시도 오류를 생성합니다.
  constructor() {
    super("ContactDepartmentInUse", "Contact department is in use");
  }
}

// 역할 : ContactJobGradeInUseError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactJobGradeInUseError extends DomainError {
  // 기능 : 거래처에 매핑된 직급 삭제 시도 오류를 생성합니다.
  constructor() {
    super("ContactJobGradeInUse", "Contact job grade is in use");
  }
}

// 역할 : ContactMemoLogNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactMemoLogNotFoundError extends DomainError {
  // 기능 : 거래처 일반 메모 로그가 없거나 수정 권한이 없는 경우의 오류를 생성합니다.
  constructor() {
    super("ContactMemoLogNotFound", "Contact memo log was not found");
  }
}

// 역할 : ContactPrivateMemoLogNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactPrivateMemoLogNotFoundError extends DomainError {
  // 기능 : 거래처 개인 비밀 메모 로그가 없거나 수정 권한이 없는 경우의 오류를 생성합니다.
  constructor() {
    super(
      "ContactPrivateMemoLogNotFound",
      "Contact private memo log was not found"
    );
  }
}

// 역할 : ContactPrivateMemoEncryptFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactPrivateMemoEncryptFailedError extends DomainError {
  // 기능 : 거래처 개인 비밀 메모 암호화 실패 오류를 생성합니다.
  constructor() {
    super("PrivateMemoEncryptFailed", "Private memo encryption failed");
  }
}

// 역할 : ContactPrivateMemoDecryptFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ContactPrivateMemoDecryptFailedError extends DomainError {
  // 기능 : 거래처 개인 비밀 메모 복호화 실패 오류를 생성합니다.
  constructor() {
    super("PrivateMemoDecryptFailed", "Private memo decryption failed");
  }
}
