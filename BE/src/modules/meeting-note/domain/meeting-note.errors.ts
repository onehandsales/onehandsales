import { DomainError } from "@/shared/domain/errors/domain-error";

export const MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE =
  "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.";
export const MEETING_NOTE_AI_DRAFT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE =
  "AI 기능 설정을 확인하고 있어요. 지금은 직접 작성으로 이어갈 수 있어요.";

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

// 역할 : MeetingNoteAiDraftProviderUnavailableError AI/STT provider 설정이 없는 오류를 표현합니다.
export class MeetingNoteAiDraftProviderUnavailableError extends DomainError {
  // 기능 : provider 설정 누락 오류를 도메인 오류 코드로 생성합니다.
  constructor(
    internalMessage = "Meeting note AI draft provider is not configured"
  ) {
    void internalMessage;
    super(
      "MeetingNoteAiDraftProviderUnavailable",
      MEETING_NOTE_AI_DRAFT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE,
      { retryable: false }
    );
  }
}

// 역할 : MeetingNoteAiDraftFailedError AI/STT provider 초안 생성 실패 오류를 표현합니다.
export class MeetingNoteAiDraftFailedError extends DomainError {
  // 기능 : provider 호출 또는 응답 파싱 실패를 도메인 오류 코드로 생성합니다.
  constructor(
    internalMessage = "Meeting note AI draft generation failed",
    retryable = false
  ) {
    void internalMessage;
    super("MeetingNoteAiDraftFailed", MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE, {
      retryable,
    });
  }
}
