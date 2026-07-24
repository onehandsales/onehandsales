export const FOLLOW_UP_DRAFT_PROVIDER = Symbol("FOLLOW_UP_DRAFT_PROVIDER");

export type FollowUpDraftChannelValue = "EMAIL" | "SMS";

export interface FollowUpDraftReportContext {
  readonly id: string;
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly timeZone: string;
  readonly locale: string;
}

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

export interface FollowUpDraftRecipientContext {
  readonly id: string;
  readonly name: string;
  readonly email: string | null;
  readonly mobile: string | null;
}

export interface GenerateFollowUpDraftInput {
  readonly userId: string;
  readonly channel: FollowUpDraftChannelValue;
  readonly languageTag: string;
  readonly report: FollowUpDraftReportContext;
  readonly suggestion: FollowUpDraftSuggestionContext;
  readonly recipient: FollowUpDraftRecipientContext;
}

export interface FollowUpDraftProviderUsage {
  readonly inputTokenCount?: number | null;
  readonly outputTokenCount?: number | null;
  readonly totalTokenCount?: number | null;
  readonly estimatedCostAmount?: string | null;
  readonly costCurrency?: string | null;
}

export interface FollowUpDraftProviderMetadata {
  readonly provider: string;
  readonly model: string;
}

export interface FollowUpDraftProviderResult
  extends FollowUpDraftProviderMetadata {
  readonly requestId?: string | null;
  readonly subject?: string | null;
  readonly body: string;
  readonly usage?: FollowUpDraftProviderUsage;
}

export class FollowUpDraftProviderFailure extends Error {
  constructor(
    readonly safeErrorCode: string,
    readonly safeErrorMessage: string,
    readonly retryable = false
  ) {
    super(safeErrorMessage);
    this.name = "FollowUpDraftProviderFailure";
  }
}

export interface FollowUpDraftProvider {
  getMetadata(): FollowUpDraftProviderMetadata;

  generateDraft(
    input: GenerateFollowUpDraftInput
  ): Promise<FollowUpDraftProviderResult>;
}
