import { DomainError } from "@/shared/domain/errors/domain-error";

export const MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE =
  "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.";
export const MEETING_NOTE_AI_DRAFT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE =
  "AI 기능 설정을 확인하고 있어요. 지금은 직접 작성으로 이어갈 수 있어요.";
export const MEETING_NOTE_AUDIO_REQUIRED_SAFE_MESSAGE =
  "녹음하거나 오디오 파일을 선택해 주세요.";
export const MEETING_NOTE_AUDIO_TYPE_UNSUPPORTED_SAFE_MESSAGE =
  "오디오 파일만 올릴 수 있어요.";
export const MEETING_NOTE_AUDIO_TOO_LARGE_SAFE_MESSAGE =
  "25MB 이하 오디오 파일만 올릴 수 있어요.";
export const MEETING_NOTE_STT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE =
  "음성 인식 기능을 사용할 수 없어요. 잠시 후 다시 시도하거나 직접 작성으로 이어갈 수 있어요.";
export const MEETING_NOTE_STT_TRANSCRIPTION_FAILED_SAFE_MESSAGE =
  "음성을 텍스트로 바꾸지 못했어요. 다시 녹음하거나 파일을 바꿔 주세요.";
export const MEETING_NOTE_STT_AI_DRAFT_FAILED_SAFE_MESSAGE =
  "녹취를 회의록 초안으로 만들지 못했어요. 잠시 후 다시 시도하거나 직접 작성으로 이어갈 수 있어요.";

export type MeetingNoteAudioValidationErrorCode =
  | "AUDIO_REQUIRED"
  | "AUDIO_TYPE_UNSUPPORTED"
  | "AUDIO_TOO_LARGE";

// 역할 : MeetingNoteAudioValidationError STT 오디오 업로드 검증 실패를 안전한 API 코드로 표현합니다.
export class MeetingNoteAudioValidationError extends DomainError {
  // 기능 : 사용자에게 보여줄 수 있는 오디오 검증 오류를 생성합니다.
  constructor(code: MeetingNoteAudioValidationErrorCode, message: string) {
    super(code, message, { field: "audio", retryable: true });
  }
}

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

// 역할 : MeetingNoteSttProviderUnavailableError STT provider 사용 불가 오류를 G03 안전 코드로 표현합니다.
export class MeetingNoteSttProviderUnavailableError extends DomainError {
  // 기능 : STT provider 설정 또는 가용성 오류를 사용자 안전 오류로 생성합니다.
  constructor(
    internalMessage = "Meeting note STT provider is unavailable"
  ) {
    void internalMessage;
    super(
      "STT_PROVIDER_UNAVAILABLE",
      MEETING_NOTE_STT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE,
      { retryable: true }
    );
  }
}

// 역할 : MeetingNoteSttTranscriptionFailedError STT 변환 실패를 G03 안전 코드로 표현합니다.
export class MeetingNoteSttTranscriptionFailedError extends DomainError {
  // 기능 : STT provider 호출 또는 transcript 생성 실패를 사용자 안전 오류로 생성합니다.
  constructor(
    internalMessage = "Meeting note STT transcription failed"
  ) {
    void internalMessage;
    super(
      "STT_TRANSCRIPTION_FAILED",
      MEETING_NOTE_STT_TRANSCRIPTION_FAILED_SAFE_MESSAGE,
      { retryable: true }
    );
  }
}

// 역할 : MeetingNoteSttAiDraftFailedError STT transcript 기반 AI 초안 실패를 G03 안전 코드로 표현합니다.
export class MeetingNoteSttAiDraftFailedError extends DomainError {
  // 기능 : STT transcript를 회의록 초안으로 바꾸지 못한 오류를 사용자 안전 오류로 생성합니다.
  constructor(
    internalMessage = "Meeting note STT AI draft generation failed"
  ) {
    void internalMessage;
    super("AI_DRAFT_FAILED", MEETING_NOTE_STT_AI_DRAFT_FAILED_SAFE_MESSAGE, {
      retryable: true,
    });
  }
}
