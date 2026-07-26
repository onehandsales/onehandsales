export const MEETING_NOTE_AI_PROVIDER_CALL_LOG_REPOSITORY = Symbol(
  "MEETING_NOTE_AI_PROVIDER_CALL_LOG_REPOSITORY"
);

export type MeetingNoteAiProviderCallOperationValue =
  | "MEETING_NOTE_TEXT_DRAFT"
  | "MEETING_NOTE_STT_TRANSCRIPTION"
  | "MEETING_NOTE_STT_DRAFT";

export type MeetingNoteAiProviderCallStatusValue =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";

// 역할 : MeetingNoteAiProviderInfo provider 호출 로그에 필요한 provider 식별 정보를 정의합니다.
export interface MeetingNoteAiProviderInfo {
  readonly provider: string;
  readonly model: string;
}

// 역할 : MeetingNoteAiProviderCallMetadata provider 응답에서 안전하게 저장할 수 있는 사용량 정보를 정의합니다.
export interface MeetingNoteAiProviderCallMetadata {
  readonly requestId?: string | null;
  readonly inputTokenCount?: number | null;
  readonly outputTokenCount?: number | null;
  readonly totalTokenCount?: number | null;
  readonly estimatedCostAmount?: string | null;
  readonly costCurrency?: string | null;
}

// 역할 : MeetingNoteAiProviderCallLogRecord 생성된 provider call log의 최소 식별자를 정의합니다.
export interface MeetingNoteAiProviderCallLogRecord {
  readonly id: string;
}

// 역할 : CreateMeetingNoteAiProviderCallLogInput provider 호출 시작 로그 생성 입력을 정의합니다.
export interface CreateMeetingNoteAiProviderCallLogInput {
  readonly userId: string;
  readonly operation: MeetingNoteAiProviderCallOperationValue;
  readonly targetType: "MEETING_NOTE_DRAFT";
  readonly targetId: string | null;
  readonly provider: string;
  readonly model: string;
  readonly startedAt: Date;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : MarkMeetingNoteAiProviderCallSucceededInput provider 호출 성공 로그 갱신 입력을 정의합니다.
export interface MarkMeetingNoteAiProviderCallSucceededInput
  extends MeetingNoteAiProviderCallMetadata {
  readonly userId: string;
  readonly providerCallLogId: string;
  readonly latencyMs: number;
  readonly completedAt: Date;
}

// 역할 : MarkMeetingNoteAiProviderCallFailedInput provider 호출 실패 로그 갱신 입력을 정의합니다.
export interface MarkMeetingNoteAiProviderCallFailedInput {
  readonly userId: string;
  readonly providerCallLogId: string;
  readonly latencyMs: number | null;
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
  readonly failedAt: Date;
}

// 역할 : MeetingNoteAiProviderCallLogRepository 회의록 AI provider 호출 로그 영속성 계약을 정의합니다.
export interface MeetingNoteAiProviderCallLogRepository {
  // 기능 : provider 호출 전 PENDING 상태의 로그를 생성합니다.
  createProviderCallLog(
    input: CreateMeetingNoteAiProviderCallLogInput
  ): Promise<MeetingNoteAiProviderCallLogRecord>;

  // 기능 : PENDING provider 호출 로그를 성공 상태와 사용량 정보로 갱신합니다.
  markProviderCallSucceeded(
    input: MarkMeetingNoteAiProviderCallSucceededInput
  ): Promise<void>;

  // 기능 : PENDING provider 호출 로그를 실패 상태와 안전한 오류 정보로 갱신합니다.
  markProviderCallFailed(
    input: MarkMeetingNoteAiProviderCallFailedInput
  ): Promise<void>;
}
