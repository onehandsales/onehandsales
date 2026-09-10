import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : CompanyNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class CompanyNotFoundError extends DomainError {
  // 기능 : 회사가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("CompanyNotFound", "Company was not found");
  }
}

// 역할 : CompanyFieldNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class CompanyFieldNotFoundError extends DomainError {
  // 기능 : 회사 분야가 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("CompanyFieldNotFound", "Company field was not found");
  }
}

// 역할 : CompanyRegionNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class CompanyRegionNotFoundError extends DomainError {
  // 기능 : 회사 지역이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("CompanyRegionNotFound", "Company region was not found");
  }
}

// 역할 : DuplicateCompanyFieldError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DuplicateCompanyFieldError extends DomainError {
  // 기능 : 같은 사용자 안에서 회사 분야 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateCompanyField", "Company field already exists");
  }
}

// 역할 : DuplicateCompanyRegionError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DuplicateCompanyRegionError extends DomainError {
  // 기능 : 같은 사용자 안에서 회사 지역 이름이 중복된 경우의 오류를 생성합니다.
  constructor() {
    super("DuplicateCompanyRegion", "Company region already exists");
  }
}

// 역할 : CompanyFieldInUseError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class CompanyFieldInUseError extends DomainError {
  // 기능 : 회사에 매핑된 분야 삭제 시도 오류를 생성합니다.
  constructor() {
    super("CompanyFieldInUse", "Company field is in use");
  }
}

// 역할 : CompanyRegionInUseError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class CompanyRegionInUseError extends DomainError {
  // 기능 : 회사에 매핑된 지역 삭제 시도 오류를 생성합니다.
  constructor() {
    super("CompanyRegionInUse", "Company region is in use");
  }
}

// 역할 : CompanyExportFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class CompanyExportFailedError extends DomainError {
  // 기능 : 회사 xlsx export 파일 생성 실패 오류를 생성합니다.
  constructor() {
    super("CompanyExportFailed", "Company export failed");
  }
}
