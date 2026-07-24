import type { FollowUpDeliveryChannelValue } from "./follow-up-delivery.provider";

export const FOLLOW_UP_MESSAGE_REPOSITORY = Symbol(
  "FOLLOW_UP_MESSAGE_REPOSITORY"
);

export type FollowUpMessageStatusValue =
  | "DRAFT"
  | "SENDING"
  | "SENT"
  | "FAILED";
export type FollowUpTargetTypeValue =
  | "AI_WEEKLY_REPORT"
  | "DEAL"
  | "CONTACT"
  | "MEETING_NOTE"
  | "SCHEDULE";
export type FollowUpDeliveryAttemptStatusValue =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "CANCELED";
export type ExternalEmailProviderValue = "GOOGLE" | "MICROSOFT";
export type ExternalEmailConnectionStatusValue =
  | "CONNECTED"
  | "RECONNECT_REQUIRED"
  | "DISCONNECTED";
export type SmsSenderNumberStatusValue =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REVOKED";
export type AiWeeklySalesReportSuggestionTypeValue =
  | "RISK"
  | "NEXT_ACTION"
  | "FOLLOW_UP"
  | "DATA_CLEANUP";
export type AiProviderCallStatusValue =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";
export type FollowUpDraftProviderOperationValue =
  | "FOLLOW_UP_EMAIL_DRAFT"
  | "FOLLOW_UP_SMS_DRAFT";

export interface FollowUpReportRecord {
  readonly id: string;
  readonly userId: string;
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly timeZone: string;
  readonly locale: string;
}

export interface FollowUpSuggestionRecord {
  readonly id: string;
  readonly reportId: string;
  readonly userId: string;
  readonly type: AiWeeklySalesReportSuggestionTypeValue;
  readonly title: string;
  readonly body: string;
  readonly reason: string | null;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly targetPath: string | null;
  readonly targetLabel: string | null;
  readonly payloadJson: Record<string, unknown>;
}

export interface FollowUpDraftSourceRecord {
  readonly report: FollowUpReportRecord;
  readonly suggestion: FollowUpSuggestionRecord;
}

export interface FollowUpContactRecord {
  readonly id: string;
  readonly userId: string;
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
}

export interface FollowUpEmailConnectionRecord {
  readonly id: string;
  readonly userId: string;
  readonly provider: ExternalEmailProviderValue;
  readonly providerAccountEmail: string;
  readonly status: ExternalEmailConnectionStatusValue;
  readonly encryptedAccessToken: string | null;
  readonly encryptedRefreshToken: string | null;
  readonly connectedAt: Date;
  readonly lastSentAt: Date | null;
  readonly lastSendSafeErrorCode: string | null;
}

export interface FollowUpSmsSenderNumberRecord {
  readonly id: string;
  readonly userId: string;
  readonly phoneE164Ciphertext: string;
  readonly phoneE164Masked: string;
  readonly status: SmsSenderNumberStatusValue;
  readonly provider: string | null;
  readonly lastSentAt: Date | null;
  readonly lastSendSafeErrorCode: string | null;
}

export interface FollowUpConsentNoticeRecord {
  readonly id: string;
  readonly userId: string;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly acknowledgedAt: Date;
}

export interface FollowUpMessageTargetRecord {
  readonly id: string;
  readonly userId: string;
  readonly messageId: string;
  readonly targetType: FollowUpTargetTypeValue;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
  readonly createdAt: Date;
}

export interface FollowUpDeliveryAttemptRecord {
  readonly id: string;
  readonly userId: string;
  readonly messageId: string;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly status: FollowUpDeliveryAttemptStatusValue;
  readonly attemptNumber: number;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly providerStatusCode: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly nextRetryAt: Date | null;
  readonly latencyMs: number | null;
  readonly estimatedCostAmount: string | null;
  readonly costCurrency: string;
  readonly sentAt: Date | null;
  readonly failedAt: Date | null;
  readonly detailJson: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FollowUpMessageRecord {
  readonly id: string;
  readonly userId: string;
  readonly sourceReportId: string | null;
  readonly sourceSuggestionId: string | null;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly status: FollowUpMessageStatusValue;
  readonly languageTag: string;
  readonly emailConnectionId: string | null;
  readonly smsSenderNumberId: string | null;
  readonly senderDisplayName: string | null;
  readonly senderEmail: string | null;
  readonly senderPhoneE164Masked: string | null;
  readonly recipientContactId: string | null;
  readonly recipientName: string;
  readonly recipientEmail: string | null;
  readonly recipientPhoneE164Masked: string | null;
  readonly subject: string | null;
  readonly body: string;
  readonly bodyPreview: string;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly retryCount: number;
  readonly sentAt: Date | null;
  readonly failedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FollowUpMessageDetailRecord extends FollowUpMessageRecord {
  readonly targets: readonly FollowUpMessageTargetRecord[];
  readonly deliveryAttempts: readonly FollowUpDeliveryAttemptRecord[];
}

export interface FollowUpMessagePageRecord {
  readonly items: readonly FollowUpMessageDetailRecord[];
  readonly totalCount: number;
}

export interface CreateDraftProviderCallSucceededInput {
  readonly userId: string;
  readonly reportId: string;
  readonly operation: FollowUpDraftProviderOperationValue;
  readonly provider: string;
  readonly model: string;
  readonly requestId: string | null;
  readonly latencyMs: number | null;
  readonly inputTokenCount: number | null;
  readonly outputTokenCount: number | null;
  readonly totalTokenCount: number | null;
  readonly estimatedCostAmount: string | null;
  readonly costCurrency: string | null;
  readonly startedAt: Date;
  readonly completedAt: Date;
  readonly metadataJson: Record<string, unknown>;
}

export interface CreateDraftProviderCallFailedInput {
  readonly userId: string;
  readonly reportId: string;
  readonly operation: FollowUpDraftProviderOperationValue;
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number | null;
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
  readonly startedAt: Date;
  readonly failedAt: Date;
  readonly metadataJson: Record<string, unknown>;
}

export interface CreateFollowUpDraftInput {
  readonly userId: string;
  readonly sourceReportId: string;
  readonly sourceSuggestionId: string;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly languageTag: string;
  readonly emailConnectionId: string | null;
  readonly smsSenderNumberId: string | null;
  readonly senderDisplayName: string | null;
  readonly senderEmail: string | null;
  readonly senderPhoneE164Masked: string | null;
  readonly recipientContactId: string;
  readonly recipientName: string;
  readonly recipientEmail: string | null;
  readonly recipientPhoneE164Masked: string | null;
  readonly subject: string | null;
  readonly body: string;
  readonly bodyPreview: string;
  readonly targets: readonly CreateFollowUpMessageTargetInput[];
  readonly providerCall: CreateDraftProviderCallSucceededInput;
}

export interface CreateFollowUpMessageTargetInput {
  readonly userId: string;
  readonly targetType: FollowUpTargetTypeValue;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
}

export interface UpdateFollowUpMessageDraftInput {
  readonly userId: string;
  readonly messageId: string;
  readonly recipientContactId?: string;
  readonly recipientName?: string;
  readonly recipientEmail?: string | null;
  readonly recipientPhoneE164Masked?: string | null;
  readonly subject?: string | null;
  readonly body?: string;
  readonly bodyPreview?: string;
}

export interface BeginFollowUpDeliveryAttemptInput {
  readonly userId: string;
  readonly messageId: string;
  readonly allowedStatuses: readonly FollowUpMessageStatusValue[];
  readonly now: Date;
}

export interface BeginFollowUpDeliveryAttemptResult {
  readonly message: FollowUpMessageDetailRecord;
  readonly attempt: FollowUpDeliveryAttemptRecord;
}

export interface MarkFollowUpDeliverySucceededInput {
  readonly userId: string;
  readonly messageId: string;
  readonly attemptId: string;
  readonly provider: string;
  readonly providerMessageId: string | null;
  readonly providerStatusCode: string | null;
  readonly latencyMs: number | null;
  readonly estimatedCostAmount: string | null;
  readonly costCurrency: string | null;
  readonly detailJson: Record<string, unknown>;
  readonly sentAt: Date;
}

export interface MarkFollowUpDeliveryFailedInput {
  readonly userId: string;
  readonly messageId: string;
  readonly attemptId: string;
  readonly provider: string;
  readonly providerStatusCode: string | null;
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
  readonly latencyMs: number | null;
  readonly detailJson: Record<string, unknown>;
  readonly failedAt: Date;
}

export interface ListFollowUpMessagesInput {
  readonly userId: string;
  readonly sourceReportId: string | null;
  readonly targetType: FollowUpTargetTypeValue | null;
  readonly targetId: string | null;
  readonly page: number;
  readonly pageSize: number;
}

export interface FollowUpMessageRepository {
  runInTransaction<T>(
    work: (repository: FollowUpMessageRepository) => Promise<T>
  ): Promise<T>;
  findDraftSource(input: {
    readonly userId: string;
    readonly reportId: string;
    readonly suggestionId: string;
  }): Promise<FollowUpDraftSourceRecord | null>;
  findContactForUser(input: {
    readonly userId: string;
    readonly contactId: string;
  }): Promise<FollowUpContactRecord | null>;
  isRecipientAllowedForSuggestion(input: {
    readonly userId: string;
    readonly suggestion: FollowUpSuggestionRecord;
    readonly recipientContactId: string;
  }): Promise<boolean>;
  findReadyEmailConnectionForUser(
    userId: string
  ): Promise<FollowUpEmailConnectionRecord | null>;
  findEmailConnectionForSend(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<FollowUpEmailConnectionRecord | null>;
  findVerifiedSmsSenderNumberForUser(
    userId: string
  ): Promise<FollowUpSmsSenderNumberRecord | null>;
  findSmsSenderNumberForSend(input: {
    readonly userId: string;
    readonly senderNumberId: string;
  }): Promise<FollowUpSmsSenderNumberRecord | null>;
  findConsentNotice(input: {
    readonly userId: string;
    readonly channel: FollowUpDeliveryChannelValue;
  }): Promise<FollowUpConsentNoticeRecord | null>;
  createDraftWithProviderCall(
    input: CreateFollowUpDraftInput
  ): Promise<FollowUpMessageDetailRecord>;
  createDraftProviderCallFailure(
    input: CreateDraftProviderCallFailedInput
  ): Promise<void>;
  findMessageForUser(input: {
    readonly userId: string;
    readonly messageId: string;
  }): Promise<FollowUpMessageDetailRecord | null>;
  updateDraftMessage(
    input: UpdateFollowUpMessageDraftInput
  ): Promise<FollowUpMessageDetailRecord | null>;
  beginDeliveryAttempt(
    input: BeginFollowUpDeliveryAttemptInput
  ): Promise<BeginFollowUpDeliveryAttemptResult | null>;
  markDeliverySucceeded(
    input: MarkFollowUpDeliverySucceededInput
  ): Promise<FollowUpMessageDetailRecord | null>;
  markDeliveryFailed(
    input: MarkFollowUpDeliveryFailedInput
  ): Promise<FollowUpMessageDetailRecord | null>;
  listMessages(
    input: ListFollowUpMessagesInput
  ): Promise<FollowUpMessagePageRecord>;
}
