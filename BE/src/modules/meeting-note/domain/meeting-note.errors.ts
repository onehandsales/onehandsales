import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : MeetingNoteNotFoundError 회의록을 찾지 못한 도메인 오류를 표현합니다.
export class MeetingNoteNotFoundError extends DomainError {
  // 기능 : 회의록 없음 오류를 표준 도메인 오류 코드로 생성합니다.
  constructor() {
    super("MeetingNoteNotFound", "Meeting note was not found");
  }
}

// 역할 : RelatedCompanyNotFoundError 연결 회사가 없거나 소유자가 다른 오류를 표현합니다.
export class RelatedCompanyNotFoundError extends DomainError {
  // 기능 : 연결 회사 없음 오류를 표준 도메인 오류 코드로 생성합니다.
  constructor() {
    super("CompanyNotFound", "Related company was not found");
  }
}

// 역할 : RelatedContactNotFoundError 연결 연락처가 없거나 소유자가 다른 오류를 표현합니다.
export class RelatedContactNotFoundError extends DomainError {
  // 기능 : 연결 연락처 없음 오류를 표준 도메인 오류 코드로 생성합니다.
  constructor() {
    super("ContactNotFound", "Related contact was not found");
  }
}

// 역할 : RelatedProductNotFoundError 연결 제품이 없거나 소유자가 다른 오류를 표현합니다.
export class RelatedProductNotFoundError extends DomainError {
  // 기능 : 연결 제품 없음 오류를 표준 도메인 오류 코드로 생성합니다.
  constructor() {
    super("ProductNotFound", "Related product was not found");
  }
}

// 역할 : RelatedDealNotFoundError 연결 딜이 없거나 소유자가 다른 오류를 표현합니다.
export class RelatedDealNotFoundError extends DomainError {
  // 기능 : 연결 딜 없음 오류를 표준 도메인 오류 코드로 생성합니다.
  constructor() {
    super("DealNotFound", "Related deal was not found");
  }
}
