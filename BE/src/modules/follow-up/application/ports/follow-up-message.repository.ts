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

// 역할 : follow-up source AI report 조회 결과 계약을 정의합니다.
export interface FollowUpReportRecord {
  readonly id: string;
  readonly userId: string;
  readonly weekStart: Date;
  readonly weekEnd: Date;
  readonly timeZone: string;
  readonly locale: string;
}

// 역할 : follow-up source AI suggestion 조회 결과 계약을 정의합니다.
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

// 역할 : follow-up 초안 생성 source aggregate 계약을 정의합니다.
export interface FollowUpDraftSourceRecord {
  readonly report: FollowUpReportRecord;
  readonly suggestion: FollowUpSuggestionRecord;
}

// 역할 : follow-up 수신 담당자 조회 결과 계약을 정의합니다.
export interface FollowUpContactRecord {
  readonly id: string;
  readonly userId: string;
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
}

// 역할 : follow-up email 발송에 사용할 외부 email connection 조회 결과 계약을 정의합니다.
export interface FollowUpEmailConnectionRecord {
  readonly id: string;
  readonly userId: string;
  readonly provider: ExternalEmailProviderValue;
  readonly providerAccountId: string | null;
  readonly providerAccountEmail: string;
  readonly status: ExternalEmailConnectionStatusValue;
  readonly encryptedAccessToken: string | null;
  readonly encryptedRefreshToken: string | null;
  readonly tokenExpiresAt: Date | null;
  readonly grantedScopes: readonly string[];
  readonly connectedAt: Date;
  readonly reconnectRequiredAt: Date | null;
  readonly lastSentAt: Date | null;
  readonly lastSendSafeErrorCode: string | null;
}

// 역할 : follow-up SMS 발송에 사용할 발신번호 조회 결과 계약을 정의합니다.
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

// 역할 : follow-up 첫 발송 주의 안내 확인 이력 계약을 정의합니다.
export interface FollowUpConsentNoticeRecord {
  readonly id: string;
  readonly userId: string;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly acknowledgedAt: Date;
}

// 역할 : follow-up message가 노출될 timeline target 계약을 정의합니다.
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

// 역할 : follow-up provider 발송 시도 이력 계약을 정의합니다.
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

// 역할 : follow-up message 기본 조회 결과 계약을 정의합니다.
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

// 역할 : follow-up message 상세 조회 결과 계약을 정의합니다.
export interface FollowUpMessageDetailRecord extends FollowUpMessageRecord {
  readonly targets: readonly FollowUpMessageTargetRecord[];
  readonly deliveryAttempts: readonly FollowUpDeliveryAttemptRecord[];
}

// 역할 : follow-up message 목록 페이지 조회 결과 계약을 정의합니다.
export interface FollowUpMessagePageRecord {
  readonly items: readonly FollowUpMessageDetailRecord[];
  readonly totalCount: number;
}

// 역할 : AI draft provider 성공 이력 저장 입력 계약을 정의합니다.
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

// 역할 : AI draft provider 실패 이력 저장 입력 계약을 정의합니다.
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

// 역할 : follow-up 초안과 provider call 성공 이력을 함께 저장하는 입력 계약을 정의합니다.
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

// 역할 : follow-up message timeline target 생성 입력 계약을 정의합니다.
export interface CreateFollowUpMessageTargetInput {
  readonly userId: string;
  readonly targetType: FollowUpTargetTypeValue;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
}

// 역할 : follow-up 초안 수정 입력 계약을 정의합니다.
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

// 역할 : follow-up 발송 시도 시작 입력 계약을 정의합니다.
export interface BeginFollowUpDeliveryAttemptInput {
  readonly userId: string;
  readonly messageId: string;
  readonly allowedStatuses: readonly FollowUpMessageStatusValue[];
  readonly now: Date;
}

// 역할 : follow-up 발송 시도 시작 결과 계약을 정의합니다.
export interface BeginFollowUpDeliveryAttemptResult {
  readonly message: FollowUpMessageDetailRecord;
  readonly attempt: FollowUpDeliveryAttemptRecord;
}

// 역할 : follow-up 발송 성공 반영 입력 계약을 정의합니다.
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

// 역할 : follow-up 발송 실패 반영 입력 계약을 정의합니다.
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

// 역할 : email connection refresh token 저장 입력 계약을 정의합니다.
export interface RefreshFollowUpEmailConnectionTokensInput {
  readonly userId: string;
  readonly connectionId: string;
  readonly providerAccountId: string | null;
  readonly providerAccountEmail: string;
  readonly encryptedAccessToken: string;
  readonly encryptedRefreshToken?: string;
  readonly tokenExpiresAt: Date | null;
  readonly grantedScopes: readonly string[];
}

// 역할 : follow-up message 목록 조회 입력 계약을 정의합니다.
export interface ListFollowUpMessagesInput {
  readonly userId: string;
  readonly sourceReportId: string | null;
  readonly targetType: FollowUpTargetTypeValue | null;
  readonly targetId: string | null;
  readonly page: number;
  readonly pageSize: number;
}

// 역할 : follow-up message 저장소가 구현해야 하는 application persistence 계약을 정의합니다.
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
  refreshEmailConnectionTokens(
    input: RefreshFollowUpEmailConnectionTokensInput
  ): Promise<FollowUpEmailConnectionRecord | null>;
  listMessages(
    input: ListFollowUpMessagesInput
  ): Promise<FollowUpMessagePageRecord>;
}
