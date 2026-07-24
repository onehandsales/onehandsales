export const FOLLOW_UP_EMAIL_DELIVERY_PROVIDER = Symbol(
  "FOLLOW_UP_EMAIL_DELIVERY_PROVIDER"
);

export const FOLLOW_UP_SMS_DELIVERY_PROVIDER = Symbol(
  "FOLLOW_UP_SMS_DELIVERY_PROVIDER"
);

export type ExternalEmailProviderValue = "GOOGLE" | "MICROSOFT";
export type FollowUpDeliveryChannelValue = "EMAIL" | "SMS";

export type FollowUpProviderOperation =
  | "EMAIL_CONNECT"
  | "EMAIL_REFRESH"
  | "EMAIL_REVOKE"
  | "EMAIL_SEND"
  | "SMS_VERIFY_SEND"
  | "SMS_SEND";

export interface FollowUpProviderSafeDetail {
  providerRequestId?: string;
  retryAfterSeconds?: number;
  providerRegion?: string;
  providerStatusReason?: string;
}

export interface FollowUpProviderDeliverySuccess {
  ok: true;
  provider: string;
  providerMessageId?: string;
  providerStatusCode?: string;
  latencyMs?: number;
  estimatedCostAmount?: string;
  costCurrency?: string;
  detailJson?: FollowUpProviderSafeDetail;
}

export interface FollowUpProviderDeliveryFailure {
  ok: false;
  provider: string;
  providerStatusCode?: string;
  safeErrorCode: string;
  safeErrorMessage: string;
  retryable: boolean;
  detailJson: FollowUpProviderSafeDetail;
}

export type FollowUpProviderDeliveryResult =
  | FollowUpProviderDeliverySuccess
  | FollowUpProviderDeliveryFailure;

export interface FollowUpEmailAuthorizationUrlInput {
  provider: ExternalEmailProviderValue;
  state: string;
  redirectUri: string;
  scopes: readonly string[];
}

export interface FollowUpEmailAuthorizationUrlResult {
  authorizationUrl: string;
  stateExpiresAt?: Date;
}

export interface FollowUpEmailTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: readonly string[];
  providerAccountId?: string;
  providerAccountEmail: string;
}

export interface FollowUpEmailSendInput {
  provider: ExternalEmailProviderValue;
  accessToken: string;
  from: {
    displayName?: string;
    email: string;
  };
  to: {
    name?: string;
    email: string;
  };
  subject: string;
  body: string;
  idempotencyKey: string;
}

export interface FollowUpEmailDeliveryProvider {
  createAuthorizationUrl(
    input: FollowUpEmailAuthorizationUrlInput
  ): Promise<FollowUpEmailAuthorizationUrlResult>;
  exchangeAuthorizationCode(input: {
    provider: ExternalEmailProviderValue;
    code: string;
    redirectUri: string;
  }): Promise<FollowUpEmailTokenSet>;
  refreshAccessToken(input: {
    provider: ExternalEmailProviderValue;
    refreshToken: string;
  }): Promise<FollowUpEmailTokenSet>;
  revokeConnection(input: {
    provider: ExternalEmailProviderValue;
    accessToken: string;
    refreshToken?: string;
  }): Promise<void>;
  sendEmail(input: FollowUpEmailSendInput): Promise<FollowUpProviderDeliveryResult>;
}

export interface FollowUpSmsVerificationInput {
  provider?: string;
  senderPhoneE164: string;
  verificationCode: string;
  locale: string;
  idempotencyKey: string;
}

export interface FollowUpSmsSendInput {
  provider?: string;
  senderPhoneE164: string;
  recipientPhoneE164: string;
  body: string;
  idempotencyKey: string;
}

export interface FollowUpSmsDeliveryProvider {
  sendVerificationCode(
    input: FollowUpSmsVerificationInput
  ): Promise<FollowUpProviderDeliveryResult>;
  sendSms(input: FollowUpSmsSendInput): Promise<FollowUpProviderDeliveryResult>;
}
