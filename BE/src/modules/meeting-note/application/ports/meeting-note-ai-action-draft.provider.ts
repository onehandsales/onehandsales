import type {
  MeetingNoteAiProviderCallMetadata,
  MeetingNoteAiProviderInfo,
} from "./meeting-note-ai-provider-call-log.repository";

export const MEETING_NOTE_AI_ACTION_DRAFT_PROVIDER = Symbol(
  "MEETING_NOTE_AI_ACTION_DRAFT_PROVIDER"
);

// 역할 : MeetingNoteNextActionConfidenceValue 다음 행동 후보 신뢰도 값을 정의합니다.
export enum MeetingNoteNextActionConfidenceValue {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// 역할 : MeetingNoteFollowUpChannelValue follow-up 문안 채널 값을 정의합니다.
export enum MeetingNoteFollowUpChannelValue {
  EMAIL = "EMAIL",
  SMS = "SMS",
}

// 역할 : MeetingNoteFollowUpToneValue follow-up 문안 톤 값을 정의합니다.
export enum MeetingNoteFollowUpToneValue {
  POLITE = "POLITE",
  FRIENDLY = "FRIENDLY",
  FORMAL = "FORMAL",
}

// 역할 : MeetingNoteAiActionCompanyContext provider에 전달할 회사 snapshot 맥락을 정의합니다.
export interface MeetingNoteAiActionCompanyContext {
  readonly companyId: string | null;
  readonly name: string;
  readonly field: string | null;
  readonly region: string | null;
}

// 역할 : MeetingNoteAiActionContactContext provider에 전달할 담당자 snapshot 맥락을 정의합니다.
export interface MeetingNoteAiActionContactContext {
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly name: string;
  readonly companyName: string | null;
  readonly department: string | null;
  readonly jobGrade: string | null;
}

// 역할 : MeetingNoteAiActionProductContext provider에 전달할 제품 snapshot 맥락을 정의합니다.
export interface MeetingNoteAiActionProductContext {
  readonly productId: string | null;
  readonly name: string;
  readonly price: number | null;
  readonly category: string | null;
  readonly status: string | null;
}

// 역할 : MeetingNoteAiActionDealContext provider에 전달할 딜 snapshot 맥락을 정의합니다.
export interface MeetingNoteAiActionDealContext {
  readonly dealId: string;
  readonly name: string;
  readonly status: string;
  readonly cost: number;
  readonly expectedEndDate: string;
}

// 역할 : MeetingNoteAiActionContext 저장된 회의록 기반 AI 후속 작업 맥락을 정의합니다.
export interface MeetingNoteAiActionContext {
  readonly meetingNoteId: string;
  readonly title: string;
  readonly meetingAt: string | null;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly companies: readonly MeetingNoteAiActionCompanyContext[];
  readonly contacts: readonly MeetingNoteAiActionContactContext[];
  readonly products: readonly MeetingNoteAiActionProductContext[];
  readonly deals: readonly MeetingNoteAiActionDealContext[];
}

// 역할 : MeetingNoteNextActionDraftCandidate provider가 반환하는 다음 행동 후보 구조를 정의합니다.
export interface MeetingNoteNextActionDraftCandidate {
  readonly title: string;
  readonly memo: string | null;
  readonly recommendedDueDate: string | null;
  readonly dealId: string | null;
  readonly confidence: MeetingNoteNextActionConfidenceValue;
  readonly reason: string | null;
}

// 역할 : MeetingNoteFollowUpDraftContent provider가 반환하는 follow-up 문안 구조를 정의합니다.
export interface MeetingNoteFollowUpDraftContent {
  readonly subject: string | null;
  readonly body: string;
  readonly copyableText: string;
}

// 역할 : CreateMeetingNoteNextActionDraftInput 다음 행동 후보 provider 입력을 정의합니다.
export interface CreateMeetingNoteNextActionDraftInput {
  readonly context: MeetingNoteAiActionContext;
  readonly targetDealId: string | null;
  readonly maxCandidates: number;
}

// 역할 : CreateMeetingNoteFollowUpDraftInput follow-up 문안 provider 입력을 정의합니다.
export interface CreateMeetingNoteFollowUpDraftInput {
  readonly context: MeetingNoteAiActionContext;
  readonly channel: MeetingNoteFollowUpChannelValue;
  readonly recipientContactId: string | null;
  readonly dealId: string | null;
  readonly tone: MeetingNoteFollowUpToneValue;
  readonly language: string;
}

// 역할 : MeetingNoteNextActionDraftProviderResult 다음 행동 후보와 provider metadata를 함께 정의합니다.
export interface MeetingNoteNextActionDraftProviderResult {
  readonly items: readonly MeetingNoteNextActionDraftCandidate[];
  readonly providerCall: MeetingNoteAiProviderCallMetadata;
}

// 역할 : MeetingNoteFollowUpDraftProviderResult follow-up 문안과 provider metadata를 함께 정의합니다.
export interface MeetingNoteFollowUpDraftProviderResult {
  readonly draft: MeetingNoteFollowUpDraftContent;
  readonly providerCall: MeetingNoteAiProviderCallMetadata;
}

// 역할 : MeetingNoteAiActionDraftProvider 저장된 회의록 기반 AI 후속 작업 provider 계약을 정의합니다.
export interface MeetingNoteAiActionDraftProvider {
  // 기능 : provider 호출 로그를 만들 때 사용할 provider 식별 정보를 반환합니다.
  getMetadata(): MeetingNoteAiProviderInfo;

  // 기능 : 저장된 회의록에서 다음 행동 후보를 생성합니다.
  createNextActionDraft(
    input: CreateMeetingNoteNextActionDraftInput
  ): Promise<MeetingNoteNextActionDraftProviderResult>;

  // 기능 : 저장된 회의록에서 follow-up 문안 초안을 생성합니다.
  createFollowUpDraft(
    input: CreateMeetingNoteFollowUpDraftInput
  ): Promise<MeetingNoteFollowUpDraftProviderResult>;
}
