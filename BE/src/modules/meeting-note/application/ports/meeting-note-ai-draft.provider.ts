export const MEETING_NOTE_AI_DRAFT_PROVIDER = Symbol(
  "MEETING_NOTE_AI_DRAFT_PROVIDER"
);

// 역할 : MeetingNoteDraftCompanyContext AI 초안 생성 prompt에 전달할 회사 선택 맥락을 정의합니다.
export interface MeetingNoteDraftCompanyContext {
  readonly id: string;
  readonly name: string;
  readonly field: string;
  readonly region: string;
}

// 역할 : MeetingNoteDraftContactContext AI 초안 생성 prompt에 전달할 담당자 선택 맥락을 정의합니다.
export interface MeetingNoteDraftContactContext {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly email: string;
  readonly mobile: string;
  readonly companyName: string;
  readonly department: string;
  readonly jobGrade: string;
}

// 역할 : MeetingNoteDraftProductContext AI 초안 생성 prompt에 전달할 제품 선택 맥락을 정의합니다.
export interface MeetingNoteDraftProductContext {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
  readonly status: string;
}

// 역할 : MeetingNoteDraftDealContext AI 초안 생성 prompt에 전달할 딜 선택 맥락을 정의합니다.
export interface MeetingNoteDraftDealContext {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly cost: number;
  readonly expectedEndDate: string;
}

// 역할 : MeetingNoteDraftContext 사용자가 선택한 회의록 연결 맥락 전체를 정의합니다.
export interface MeetingNoteDraftContext {
  readonly meetingLocalDateTime: string;
  readonly companies: readonly MeetingNoteDraftCompanyContext[];
  readonly contacts: readonly MeetingNoteDraftContactContext[];
  readonly products: readonly MeetingNoteDraftProductContext[];
  readonly deals: readonly MeetingNoteDraftDealContext[];
}

// 역할 : MeetingNoteDraftContent AI가 생성해도 되는 회의록 본문 초안 필드만 정의합니다.
export interface MeetingNoteDraftContent {
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
}

// 역할 : CreateMeetingNoteTextDraftInput 텍스트 기반 AI 초안 생성 provider 입력 계약을 정의합니다.
export interface CreateMeetingNoteTextDraftInput {
  readonly rawText: string;
  readonly context: MeetingNoteDraftContext;
}

// 역할 : MeetingNoteAiDraftProvider 회의록 AI 초안 생성을 외부 provider 뒤로 숨기는 application port입니다.
export interface MeetingNoteAiDraftProvider {
  // 기능 : 회의 원문 텍스트를 회의록 본문 초안으로 변환합니다.
  createTextDraft(
    input: CreateMeetingNoteTextDraftInput
  ): Promise<MeetingNoteDraftContent>;
}
