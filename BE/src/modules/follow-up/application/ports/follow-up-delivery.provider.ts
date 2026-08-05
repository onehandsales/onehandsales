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

// 역할 : 외부 provider 실패에서 저장 가능한 비식별 상세 정보를 정의합니다.
export interface FollowUpProviderSafeDetail extends Record<string, unknown> {
  providerRequestId?: string;
  retryAfterSeconds?: number;
  providerRegion?: string;
  providerStatusReason?: string;
}

// 역할 : follow-up provider 발송 성공 결과 계약을 정의합니다.
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

// 역할 : follow-up provider 발송 실패 결과 계약을 정의합니다.
export interface FollowUpProviderDeliveryFailure {
  ok: false;
  provider: string;
  providerStatusCode?: string;
  safeErrorCode: string;
  safeErrorMessage: string;
  retryable: boolean;
  latencyMs?: number;
  detailJson: FollowUpProviderSafeDetail;
}

export type FollowUpProviderDeliveryResult =
  | FollowUpProviderDeliverySuccess
  | FollowUpProviderDeliveryFailure;

// 역할 : email OAuth authorization URL 생성 입력 계약을 정의합니다.
export interface FollowUpEmailAuthorizationUrlInput {
  provider: ExternalEmailProviderValue;
  state: string;
  redirectUri: string;
  scopes: readonly string[];
}

// 역할 : email OAuth authorization URL 생성 결과 계약을 정의합니다.
export interface FollowUpEmailAuthorizationUrlResult {
  authorizationUrl: string;
  stateExpiresAt?: Date;
}

// 역할 : 외부 email provider token/profile 조회 결과 계약을 정의합니다.
export interface FollowUpEmailTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: readonly string[];
  providerAccountId?: string;
  providerAccountEmail: string;
}

// 역할 : follow-up email 실제 발송 입력 계약을 정의합니다.
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

// 역할 : follow-up email provider adapter가 구현해야 하는 계약을 정의합니다.
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

// 역할 : SMS 인증 코드 발송 입력 계약을 정의합니다.
export interface FollowUpSmsVerificationInput {
  provider?: string;
  senderPhoneE164: string;
  verificationCode: string;
  locale: string;
  idempotencyKey: string;
}

// 역할 : follow-up SMS 실제 발송 입력 계약을 정의합니다.
export interface FollowUpSmsSendInput {
  provider?: string;
  senderPhoneE164: string;
  recipientPhoneE164: string;
  body: string;
  idempotencyKey: string;
}

// 역할 : follow-up SMS provider adapter가 구현해야 하는 계약을 정의합니다.
export interface FollowUpSmsDeliveryProvider {
  sendVerificationCode(
    input: FollowUpSmsVerificationInput
  ): Promise<FollowUpProviderDeliveryResult>;
  sendSms(input: FollowUpSmsSendInput): Promise<FollowUpProviderDeliveryResult>;
}
