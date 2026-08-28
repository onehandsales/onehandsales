// 역할 : Follow-up 초안 provider 구현체를 주입하기 위한 토큰입니다.
export const FOLLOW_UP_DRAFT_PROVIDER = Symbol("FOLLOW_UP_DRAFT_PROVIDER");

// 역할 : Follow-up 초안을 생성할 발송 채널 값을 정의합니다.
export type FollowUpDraftChannelValue = "EMAIL" | "SMS";

// 역할 : Follow-up 초안 생성에 필요한 AI 주간 리포트 컨텍스트를 정의합니다.
export interface FollowUpDraftReportContext {
  readonly id: string;
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly timeZone: string;
  readonly locale: string;
}

// 역할 : Follow-up 초안 생성에 필요한 추천 항목 컨텍스트를 정의합니다.
export interface FollowUpDraftSuggestionContext {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly reason: string | null;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly targetLabel: string | null;
  readonly payloadJson: Record<string, unknown>;
}

// 역할 : Follow-up 초안 수신자 후보 정보를 정의합니다.
export interface FollowUpDraftRecipientContext {
  readonly id: string;
  readonly name: string;
  readonly email: string | null;
  readonly mobile: string | null;
}

// 역할 : Follow-up 초안 provider 호출에 필요한 입력 계약을 정의합니다.
export interface GenerateFollowUpDraftInput {
  readonly userId: string;
  readonly channel: FollowUpDraftChannelValue;
  readonly languageTag: string;
  readonly report: FollowUpDraftReportContext;
  readonly suggestion: FollowUpDraftSuggestionContext;
  readonly recipient: FollowUpDraftRecipientContext;
}

// 역할 : Follow-up 초안 provider 사용량 집계 값을 정의합니다.
export interface FollowUpDraftProviderUsage {
  readonly inputTokenCount?: number | null;
  readonly outputTokenCount?: number | null;
  readonly totalTokenCount?: number | null;
  readonly estimatedCostAmount?: string | null;
  readonly costCurrency?: string | null;
}

// 역할 : Follow-up 초안 provider의 식별 metadata를 정의합니다.
export interface FollowUpDraftProviderMetadata {
  readonly provider: string;
  readonly model: string;
}

// 역할 : Follow-up 초안 provider가 반환하는 생성 결과 계약을 정의합니다.
export interface FollowUpDraftProviderResult
  extends FollowUpDraftProviderMetadata {
  readonly requestId?: string | null;
  readonly subject?: string | null;
  readonly body: string;
  readonly usage?: FollowUpDraftProviderUsage;
}

// 역할 : Follow-up 초안 provider 실패를 안전한 에러 정보로 전달합니다.
export class FollowUpDraftProviderFailure extends Error {
  // 기능 : 외부 provider 실패의 안전한 code/message와 재시도 가능 여부를 보관합니다.
  constructor(
    readonly safeErrorCode: string,
    readonly safeErrorMessage: string,
    readonly retryable = false
  ) {
    super(safeErrorMessage);
    this.name = "FollowUpDraftProviderFailure";
  }
}

// 역할 : Follow-up 초안 provider 구현체가 제공해야 하는 생성 계약을 정의합니다.
export interface FollowUpDraftProvider {
  // 기능 : 현재 provider 식별 metadata를 반환합니다.
  getMetadata(): FollowUpDraftProviderMetadata;

  // 기능 : 리포트 추천과 수신자 정보를 바탕으로 Follow-up 발송 초안을 생성합니다.
  generateDraft(
    input: GenerateFollowUpDraftInput
  ): Promise<FollowUpDraftProviderResult>;
}
