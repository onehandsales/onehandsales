export type FollowUpDeliveryChannel = "EMAIL" | "SMS";

export type FollowUpEmailProvider = "GOOGLE" | "MICROSOFT";

export type FollowUpEmailConnectionStatus =
  | "CONNECTED"
  | "RECONNECT_REQUIRED"
  | "DISCONNECTED";

export type FollowUpSmsSenderNumberStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REVOKED";

export type FollowUpMessageStatus = "DRAFT" | "SENDING" | "SENT" | "FAILED";

export type FollowUpTargetType =
  | "AI_WEEKLY_REPORT"
  | "DEAL"
  | "CONTACT"
  | "MEETING_NOTE"
  | "SCHEDULE";

export type FollowUpEmailConnection = {
  readonly id: string;
  readonly provider: FollowUpEmailProvider;
  readonly providerAccountEmail: string;
  readonly status: FollowUpEmailConnectionStatus;
  readonly connectedAt: string;
  readonly reconnectRequiredAt: string | null;
  readonly disconnectedAt: string | null;
};

export type FollowUpSmsSenderNumber = {
  readonly id: string;
  readonly phoneE164Masked: string;
  readonly status: FollowUpSmsSenderNumberStatus;
  readonly verifiedAt: string | null;
  readonly revokedAt: string | null;
  readonly verificationExpiresAt: string | null;
};

export type FollowUpConsentNotice = {
  readonly channel: FollowUpDeliveryChannel;
  readonly acknowledgedAt: string;
};

export type FollowUpDeliverySettings = {
  readonly emailConnections: readonly FollowUpEmailConnection[];
  readonly smsSenderNumbers: readonly FollowUpSmsSenderNumber[];
  readonly consentNotices: readonly FollowUpConsentNotice[];
};

export type StartFollowUpEmailConnectionInput = {
  readonly provider: FollowUpEmailProvider;
  readonly redirectUri: string;
};

export type StartFollowUpEmailConnectionResponse = {
  readonly authorizationUrl: string;
  readonly stateExpiresAt: string;
};

export type DisconnectFollowUpEmailConnectionInput = {
  readonly connectionId: string;
};

export type RequestFollowUpSmsSenderNumberVerificationInput = {
  readonly phoneE164: string;
};

export type RequestFollowUpSmsSenderNumberVerificationResponse = {
  readonly senderNumber: Pick<
    FollowUpSmsSenderNumber,
    "id" | "phoneE164Masked" | "status" | "verificationExpiresAt"
  >;
};

export type VerifyFollowUpSmsSenderNumberInput = {
  readonly senderNumberId: string;
  readonly code: string;
};

export type RevokeFollowUpSmsSenderNumberInput = {
  readonly senderNumberId: string;
};

export type AcknowledgeFollowUpConsentNoticeInput = {
  readonly channel: FollowUpDeliveryChannel;
};

export type FollowUpMessageSender = {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly phoneE164Masked: string | null;
};

export type FollowUpMessageRecipient = {
  readonly contactId: string | null;
  readonly name: string;
  readonly email: string | null;
  readonly phoneE164Masked: string | null;
};

export type FollowUpMessageTarget = {
  readonly targetType: FollowUpTargetType;
  readonly targetId: string;
  readonly targetPath: string;
  readonly targetLabel: string | null;
};

export type FollowUpDeliveryAttempt = {
  readonly id: string;
  readonly status: string;
  readonly attemptNumber: number;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly providerStatusCode: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly nextRetryAt: string | null;
  readonly latencyMs: number | null;
  readonly estimatedCostAmount: string | null;
  readonly costCurrency: string;
  readonly sentAt: string | null;
  readonly failedAt: string | null;
  readonly createdAt: string;
};

export type FollowUpMessageListItem = {
  readonly id: string;
  readonly status: FollowUpMessageStatus;
  readonly channel: FollowUpDeliveryChannel;
  readonly languageTag: string;
  readonly sender: FollowUpMessageSender;
  readonly recipient: FollowUpMessageRecipient;
  readonly subject: string | null;
  readonly bodyPreview: string;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly retryCount: number;
  readonly sentAt: string | null;
  readonly failedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sourceReportId: string | null;
  readonly sourceSuggestionId: string | null;
  readonly targets: readonly FollowUpMessageTarget[];
};

export type FollowUpMessage = FollowUpMessageListItem & {
  readonly body: string;
  readonly deliveryAttempts: readonly FollowUpDeliveryAttempt[];
};

export type FollowUpMessageListParams = {
  readonly sourceReportId?: string | null;
  readonly targetType?: FollowUpTargetType | null;
  readonly targetId?: string | null;
  readonly page?: number;
};

export type FollowUpMessageListResponse = {
  readonly items: readonly FollowUpMessageListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

export type CreateFollowUpDraftInput = {
  readonly sourceReportId: string;
  readonly sourceSuggestionId: string;
  readonly channel: FollowUpDeliveryChannel;
  readonly languageTag: string;
  readonly recipientContactId: string;
};

export type UpdateFollowUpMessageInput = {
  readonly messageId: string;
  readonly subject?: string | null;
  readonly body?: string;
  readonly recipientContactId?: string;
};
