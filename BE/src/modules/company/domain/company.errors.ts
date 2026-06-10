import { DomainError } from "@/shared/domain/errors/domain-error";

export class CompanyNotFoundError extends DomainError {
  // 기능 : 회사가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("CompanyNotFound", "Company was not found");
  }
}

export class CompanyFieldNotFoundError extends DomainError {
  // 기능 : 회사 분야가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("CompanyFieldNotFound", "Company field was not found");
  }
}

export class CompanyRegionNotFoundError extends DomainError {
  // 기능 : 회사 지역이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("CompanyRegionNotFound", "Company region was not found");
  }
}

export class DuplicateCompanyFieldError extends DomainError {
  // 기능 : 같은 사용자 안에서 회사 분야 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateCompanyField", "Company field already exists");
  }
}

export class DuplicateCompanyRegionError extends DomainError {
  // 기능 : 같은 사용자 안에서 회사 지역 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateCompanyRegion", "Company region already exists");
  }
}

export class CompanyFieldInUseError extends DomainError {
  // 기능 : 회사에 매핑된 분야 삭제 시도 오류를 생성합니다.
  constructor() {
    super("CompanyFieldInUse", "Company field is in use");
  }
}

export class CompanyRegionInUseError extends DomainError {
  // 기능 : 회사에 매핑된 지역 삭제 시도 오류를 생성합니다.
  constructor() {
    super("CompanyRegionInUse", "Company region is in use");
  }
}

export class CompanyMemoLogNotFoundError extends DomainError {
  // 기능 : 회사 메모 로그가 없거나 수정 권한이 없는 경우의 오류를 생성합니다.
  constructor() {
    super("CompanyMemoLogNotFound", "Company memo log was not found");
  }
}

export class CompanyPrivateMemoLogNotFoundError extends DomainError {
  // 기능 : 회사 개인 비밀 메모 로그가 없거나 수정 권한이 없는 경우의 오류를 생성합니다.
  constructor() {
    super(
      "CompanyPrivateMemoLogNotFound",
      "Company private memo log was not found"
    );
  }
}

export class PrivateMemoEncryptFailedError extends DomainError {
  // 기능 : 개인 비밀 메모 암호화 실패 오류를 생성합니다.
  constructor() {
    super("PrivateMemoEncryptFailed", "Private memo encryption failed");
  }
}

export class PrivateMemoDecryptFailedError extends DomainError {
  // 기능 : 개인 비밀 메모 복호화 실패 오류를 생성합니다.
  constructor() {
    super("PrivateMemoDecryptFailed", "Private memo decryption failed");
  }
}
