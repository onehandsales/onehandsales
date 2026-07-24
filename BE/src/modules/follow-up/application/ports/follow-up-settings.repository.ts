export const FOLLOW_UP_SETTINGS_REPOSITORY = Symbol(
  "FOLLOW_UP_SETTINGS_REPOSITORY"
);

export type ExternalEmailProviderValue = "GOOGLE" | "MICROSOFT";
export type ExternalEmailConnectionStatusValue =
  | "CONNECTED"
  | "RECONNECT_REQUIRED"
  | "DISCONNECTED";
export type SmsSenderNumberStatusValue =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REVOKED";
export type FollowUpDeliveryChannelValue = "EMAIL" | "SMS";

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
  readonly disconnectedAt: Date | null;
  readonly reconnectRequiredAt: Date | null;
  readonly lastSentAt: Date | null;
  readonly lastSendSafeErrorCode: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FollowUpEmailOAuthStateRecord {
  readonly id: string;
  readonly userId: string;
  readonly provider: ExternalEmailProviderValue;
  readonly stateHash: string;
  readonly redirectUri: string;
  readonly expiresAt: Date;
  readonly consumedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SmsSenderNumberRecord {
  readonly id: string;
  readonly userId: string;
  readonly phoneE164Hash: string;
  readonly phoneE164Ciphertext: string;
  readonly phoneE164Masked: string;
  readonly status: SmsSenderNumberStatusValue;
  readonly provider: string | null;
  readonly providerSenderId: string | null;
  readonly verificationCodeHash: string | null;
  readonly verificationExpiresAt: Date | null;
  readonly verifiedAt: Date | null;
  readonly revokedAt: Date | null;
  readonly lastSentAt: Date | null;
  readonly lastSendSafeErrorCode: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FollowUpConsentNoticeRecord {
  readonly id: string;
  readonly userId: string;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly acknowledgedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FollowUpDeliverySettingsAggregate {
  readonly emailConnections: readonly FollowUpEmailConnectionRecord[];
  readonly smsSenderNumbers: readonly SmsSenderNumberRecord[];
  readonly consentNotices: readonly FollowUpConsentNoticeRecord[];
}

export interface CreateFollowUpEmailOAuthStateInput {
  readonly userId: string;
  readonly provider: ExternalEmailProviderValue;
  readonly stateHash: string;
  readonly redirectUri: string;
  readonly expiresAt: Date;
  readonly now: Date;
}

export interface UpsertFollowUpEmailConnectionInput {
  readonly userId: string;
  readonly provider: ExternalEmailProviderValue;
  readonly providerAccountId: string | null;
  readonly providerAccountEmail: string;
  readonly encryptedAccessToken: string;
  readonly encryptedRefreshToken?: string;
  readonly tokenExpiresAt: Date | null;
  readonly grantedScopes: readonly string[];
  readonly connectedAt: Date;
}

export interface ConsumeOAuthStateAndUpsertConnectionInput {
  readonly stateId: string;
  readonly now: Date;
  readonly connection: UpsertFollowUpEmailConnectionInput;
}

export interface DisconnectFollowUpEmailConnectionInput {
  readonly userId: string;
  readonly connectionId: string;
  readonly disconnectedAt: Date;
}

export interface UpsertSmsSenderNumberVerificationInput {
  readonly userId: string;
  readonly phoneE164Hash: string;
  readonly phoneE164Ciphertext: string;
  readonly phoneE164Masked: string;
  readonly provider: string | null;
  readonly providerSenderId: string | null;
  readonly verificationCodeHash: string;
  readonly verificationExpiresAt: Date;
  readonly now: Date;
}

export interface VerifySmsSenderNumberInput {
  readonly userId: string;
  readonly senderNumberId: string;
  readonly verifiedAt: Date;
}

export interface RevokeSmsSenderNumberInput {
  readonly userId: string;
  readonly senderNumberId: string;
  readonly revokedAt: Date;
}

export interface UpsertFollowUpConsentNoticeInput {
  readonly userId: string;
  readonly channel: FollowUpDeliveryChannelValue;
  readonly acknowledgedAt: Date;
}

export interface FindOAuthStateInput {
  readonly provider: ExternalEmailProviderValue;
  readonly stateHash: string;
  readonly now: Date;
}

export interface FindEmailConnectionInput {
  readonly userId: string;
  readonly connectionId: string;
}

export interface FindSmsSenderNumberInput {
  readonly userId: string;
  readonly senderNumberId: string;
}

export interface FollowUpSettingsRepository {
  runInTransaction<T>(
    work: (repository: FollowUpSettingsRepository) => Promise<T>
  ): Promise<T>;
  getSettingsAggregate(userId: string): Promise<FollowUpDeliverySettingsAggregate>;
  createEmailOAuthState(
    input: CreateFollowUpEmailOAuthStateInput
  ): Promise<FollowUpEmailOAuthStateRecord>;
  findUsableEmailOAuthState(
    input: FindOAuthStateInput
  ): Promise<FollowUpEmailOAuthStateRecord | null>;
  consumeOAuthStateAndUpsertEmailConnection(
    input: ConsumeOAuthStateAndUpsertConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null>;
  findEmailConnectionForUser(
    input: FindEmailConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null>;
  disconnectEmailConnection(
    input: DisconnectFollowUpEmailConnectionInput
  ): Promise<FollowUpEmailConnectionRecord | null>;
  upsertSmsSenderNumberVerification(
    input: UpsertSmsSenderNumberVerificationInput
  ): Promise<SmsSenderNumberRecord>;
  findSmsSenderNumberForUser(
    input: FindSmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null>;
  markSmsSenderNumberVerified(
    input: VerifySmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null>;
  revokeSmsSenderNumber(
    input: RevokeSmsSenderNumberInput
  ): Promise<SmsSenderNumberRecord | null>;
  upsertConsentNotice(
    input: UpsertFollowUpConsentNoticeInput
  ): Promise<FollowUpConsentNoticeRecord>;
}
