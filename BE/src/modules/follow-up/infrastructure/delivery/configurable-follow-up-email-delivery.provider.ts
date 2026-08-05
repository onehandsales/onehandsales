import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  ExternalEmailProviderValue,
  FollowUpEmailAuthorizationUrlInput,
  FollowUpEmailAuthorizationUrlResult,
  FollowUpEmailDeliveryProvider,
  FollowUpEmailSendInput,
  FollowUpEmailTokenSet,
  FollowUpProviderDeliveryFailure,
  FollowUpProviderDeliveryResult,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import {
  FollowUpEmailReconnectRequiredError,
  FollowUpProviderRequestFailedError,
  FollowUpProviderUnavailableError,
} from "@/modules/follow-up/domain/follow-up-delivery.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const GOOGLE_AUTHORIZATION_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const MICROSOFT_AUTHORIZATION_BASE_URL =
  "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_BASE_URL =
  "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token";
const MICROSOFT_PROFILE_URL = "https://graph.microsoft.com/v1.0/me";
const MICROSOFT_SEND_URL = "https://graph.microsoft.com/v1.0/me/sendMail";
const PROVIDER_TIMEOUT_MS = 10_000;

// 역할 : 외부 email provider OAuth와 profile endpoint 설정을 정의합니다.
interface EmailProviderConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly authorizationUrl: string;
  readonly tokenUrl: string;
  readonly profileUrl: string;
}

// 역할 : OAuth token endpoint에서 필요한 safe 필드만 읽는 응답 계약을 정의합니다.
interface TokenEndpointResponse {
  readonly access_token?: unknown;
  readonly refresh_token?: unknown;
  readonly expires_in?: unknown;
  readonly scope?: unknown;
}

// 역할 : provider profile endpoint에서 sender 식별에 필요한 필드만 읽는 응답 계약을 정의합니다.
interface ProfileResponse {
  readonly id?: unknown;
  readonly sub?: unknown;
  readonly mail?: unknown;
  readonly userPrincipalName?: unknown;
  readonly email?: unknown;
}

// 역할 : Gmail messages.send 성공 응답에서 저장 가능한 message id만 읽는 계약을 정의합니다.
interface GmailSendResponse {
  readonly id?: unknown;
}

// 역할 : provider HTTP 실패를 사용자 안전 오류로 바꾼 결과 계약을 정의합니다.
interface ProviderHttpFailureMapping {
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
  readonly safeCategory: string;
}

// 역할 : Gmail/Microsoft follow-up email 실제 연동을 담당합니다.
@Injectable()
export class ConfigurableFollowUpEmailDeliveryProvider
  implements FollowUpEmailDeliveryProvider
{
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  // 기능 : provider별 send-only scope를 포함한 OAuth authorization URL을 만듭니다.
  createAuthorizationUrl(
    input: FollowUpEmailAuthorizationUrlInput
  ): Promise<FollowUpEmailAuthorizationUrlResult> {
    const config = this.getProviderConfigOrNull(input.provider);

    if (!config) {
      return Promise.resolve(this.createTestAuthorizationUrl(input));
    }

    const url = new URL(config.authorizationUrl);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", input.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", input.scopes.join(" "));
    url.searchParams.set("state", input.state);

    if (input.provider === "GOOGLE") {
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "consent");
    } else {
      url.searchParams.set("prompt", "select_account");
    }

    return Promise.resolve({ authorizationUrl: url.toString() });
  }

  // 기능 : authorization code를 token/profile로 교환해 email connection 저장용 token set을 만듭니다.
  async exchangeAuthorizationCode(input: {
    provider: ExternalEmailProviderValue;
    code: string;
    redirectUri: string;
  }): Promise<FollowUpEmailTokenSet> {
    const config = this.getProviderConfigOrNull(input.provider);

    if (!config) {
      return this.createTestTokenSet(input.provider);
    }

    const tokenResponse = await this.requestToken(config, {
      code: input.code,
      grantType: "authorization_code",
      provider: input.provider,
      redirectUri: input.redirectUri,
    });
    const accessToken = this.requireTokenText(
      tokenResponse.access_token,
      "access token"
    );
    const profile = await this.requestProfile(config.profileUrl, accessToken);

    const expiresAt = this.toExpiresAt(tokenResponse.expires_in);
    const providerAccountId = this.toProviderAccountId(profile);

    return {
      accessToken,
      ...(typeof tokenResponse.refresh_token === "string" &&
      tokenResponse.refresh_token.trim().length > 0
        ? { refreshToken: tokenResponse.refresh_token.trim() }
        : {}),
      ...(expiresAt ? { expiresAt } : {}),
      scopes: this.toScopes(tokenResponse.scope, this.getScopes(input.provider)),
      ...(providerAccountId ? { providerAccountId } : {}),
      providerAccountEmail: this.toProviderAccountEmail(profile),
    };
  }

  // 기능 : refresh token으로 access token을 갱신하고 provider account를 다시 확인합니다.
  async refreshAccessToken(input: {
    provider: ExternalEmailProviderValue;
    refreshToken: string;
  }): Promise<FollowUpEmailTokenSet> {
    const config = this.getProviderConfigOrNull(input.provider);

    if (!config) {
      return this.createTestTokenSet(input.provider);
    }

    const tokenResponse = await this.requestToken(config, {
      grantType: "refresh_token",
      provider: input.provider,
      refreshToken: input.refreshToken,
    });
    const accessToken = this.requireTokenText(
      tokenResponse.access_token,
      "access token"
    );
    const profile = await this.requestProfile(config.profileUrl, accessToken);

    const expiresAt = this.toExpiresAt(tokenResponse.expires_in);
    const providerAccountId = this.toProviderAccountId(profile);

    return {
      accessToken,
      ...(typeof tokenResponse.refresh_token === "string" &&
      tokenResponse.refresh_token.trim().length > 0
        ? { refreshToken: tokenResponse.refresh_token.trim() }
        : {}),
      ...(expiresAt ? { expiresAt } : {}),
      scopes: this.toScopes(tokenResponse.scope, this.getScopes(input.provider)),
      ...(providerAccountId ? { providerAccountId } : {}),
      providerAccountEmail: this.toProviderAccountEmail(profile),
    };
  }

  // 기능 : 현재 G10 범위에서는 provider revoke endpoint 호출 없이 local disconnect만 허용합니다.
  revokeConnection(): Promise<void> {
    return Promise.resolve();
  }

  // 기능 : smoke allowlist를 먼저 검사한 뒤 Gmail/Microsoft 실제 발송 API를 호출합니다.
  async sendEmail(
    input: FollowUpEmailSendInput
  ): Promise<FollowUpProviderDeliveryResult> {
    const startedAt = Date.now();
    const smokeFailure = this.createSmokeAllowlistFailure(input, startedAt);

    if (smokeFailure) {
      this.logProviderFailure(smokeFailure);
      return smokeFailure;
    }

    try {
      const config = this.getProviderConfigOrNull(input.provider);

      if (!config) {
        return this.createTestSendSuccess(input, startedAt);
      }

      if (input.provider === "GOOGLE") {
        return await this.sendGmailEmail(input, startedAt);
      }

      return await this.sendMicrosoftEmail(input, startedAt);
    } catch (error) {
      const failure = this.createProviderExceptionFailure(
        input.provider,
        error,
        startedAt
      );
      this.logProviderFailure(failure);

      return failure;
    }
  }

  // 기능 : Gmail MIME raw message를 만들어 users.messages.send를 호출합니다.
  private async sendGmailEmail(
    input: FollowUpEmailSendInput,
    startedAt: number
  ): Promise<FollowUpProviderDeliveryResult> {
    // Gmail API는 RFC 2822 MIME 전체를 base64url raw 필드에 담아 보낸다.
    const raw = this.encodeBase64Url(this.createGmailMimeMessage(input));
    const response = await this.fetchWithTimeout(GOOGLE_SEND_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const failure = await this.createHttpFailure(
        "google",
        response,
        startedAt
      );
      this.logProviderFailure(failure);

      return failure;
    }

    const body = (await this.readJsonObject(response)) as GmailSendResponse;
    const providerMessageId =
      typeof body.id === "string" && body.id.trim().length > 0
        ? body.id.trim()
        : undefined;

    return {
      ok: true,
      provider: "google",
      ...(providerMessageId ? { providerMessageId } : {}),
      providerStatusCode: String(response.status),
      latencyMs: this.toLatencyMs(startedAt),
      detailJson: {
        providerStatusReason: "ACCEPTED",
      },
    };
  }

  // 기능 : Microsoft Graph sendMail JSON body를 만들어 plain text email을 전송합니다.
  private async sendMicrosoftEmail(
    input: FollowUpEmailSendInput,
    startedAt: number
  ): Promise<FollowUpProviderDeliveryResult> {
    const response = await this.fetchWithTimeout(MICROSOFT_SEND_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(this.createMicrosoftSendMailBody(input)),
    });

    if (!response.ok) {
      const failure = await this.createHttpFailure(
        "microsoft",
        response,
        startedAt
      );
      this.logProviderFailure(failure);

      return failure;
    }

    return {
      ok: true,
      provider: "microsoft",
      providerStatusCode: String(response.status),
      latencyMs: this.toLatencyMs(startedAt),
      detailJson: {
        providerStatusReason: "ACCEPTED",
      },
    };
  }

  // 기능 : non-production provider env가 없을 때 자동 테스트용 OAuth URL을 만듭니다.
  private createTestAuthorizationUrl(
    input: FollowUpEmailAuthorizationUrlInput
  ): FollowUpEmailAuthorizationUrlResult {
    const url = new URL(
      `https://follow-up-oauth.local/${input.provider.toLowerCase()}/authorize`
    );
    url.searchParams.set("state", input.state);
    url.searchParams.set("redirect_uri", input.redirectUri);
    url.searchParams.set("scope", input.scopes.join(" "));

    return { authorizationUrl: url.toString() };
  }

  // 기능 : non-production 자동 테스트용 email token set을 만듭니다.
  private createTestTokenSet(
    provider: ExternalEmailProviderValue
  ): FollowUpEmailTokenSet {
    const providerSlug = provider.toLowerCase();

    return {
      accessToken: `test-access-${randomUUID()}`,
      refreshToken: `test-refresh-${randomUUID()}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      scopes: this.getScopes(provider),
      providerAccountId: `test-${providerSlug}-account`,
      providerAccountEmail: `follow-up-${providerSlug}@example.test`,
    };
  }

  // 기능 : non-production 자동 테스트용 email 발송 성공 결과를 만듭니다.
  private createTestSendSuccess(
    input: FollowUpEmailSendInput,
    startedAt: number
  ): FollowUpProviderDeliveryResult {
    return {
      ok: true,
      provider: input.provider.toLowerCase(),
      providerMessageId: `test-email-${input.idempotencyKey}`,
      providerStatusCode: "202",
      latencyMs: this.toLatencyMs(startedAt),
      detailJson: {
        providerStatusReason: "TEST_PROVIDER",
      },
    };
  }

  // 기능 : OAuth token endpoint를 timeout 안에서 호출하고 refresh invalid_grant를 재연결 오류로 분류합니다.
  private async requestToken(
    config: EmailProviderConfig,
    input:
      | {
          readonly grantType: "authorization_code";
          readonly provider: ExternalEmailProviderValue;
          readonly code: string;
          readonly redirectUri: string;
        }
      | {
          readonly grantType: "refresh_token";
          readonly provider: ExternalEmailProviderValue;
          readonly refreshToken: string;
        }
  ): Promise<TokenEndpointResponse> {
    const body = new URLSearchParams();
    body.set("client_id", config.clientId);
    body.set("client_secret", config.clientSecret);
    body.set("grant_type", input.grantType);

    if (input.grantType === "authorization_code") {
      body.set("code", input.code);
      body.set("redirect_uri", input.redirectUri);
    } else {
      body.set("refresh_token", input.refreshToken);
    }

    const response = await this.fetchWithTimeout(config.tokenUrl, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const reason = await this.extractProviderStatusReason(response);

      if (
        input.grantType === "refresh_token" &&
        this.isRefreshReconnectFailure(response.status, reason)
      ) {
        throw new FollowUpEmailReconnectRequiredError();
      }

      throw new FollowUpProviderRequestFailedError(
        "Follow-up email token request failed."
      );
    }

    return (await response.json()) as TokenEndpointResponse;
  }

  // 기능 : provider profile endpoint에서 계정 email을 확인합니다.
  private async requestProfile(
    profileUrl: string,
    accessToken: string
  ): Promise<ProfileResponse> {
    const response = await this.fetchWithTimeout(profileUrl, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new FollowUpEmailReconnectRequiredError();
      }

      throw new FollowUpProviderRequestFailedError(
        "Follow-up email profile request failed."
      );
    }

    return (await response.json()) as ProfileResponse;
  }

  // 기능 : provider별 credential과 OAuth/Profile endpoint 설정을 읽습니다.
  private getProviderConfigOrNull(
    provider: ExternalEmailProviderValue
  ): EmailProviderConfig | null {
    if (provider === "GOOGLE") {
      const clientId = this.getOptionalConfig("FOLLOW_UP_GOOGLE_CLIENT_ID");
      const clientSecret = this.getOptionalConfig(
        "FOLLOW_UP_GOOGLE_CLIENT_SECRET"
      );

      if (!clientId || !clientSecret) {
        return this.allowTestProvider()
          ? null
          : this.throwMissingConfig("Google");
      }

      return {
        clientId,
        clientSecret,
        authorizationUrl: GOOGLE_AUTHORIZATION_URL,
        tokenUrl: GOOGLE_TOKEN_URL,
        profileUrl: GOOGLE_USERINFO_URL,
      };
    }

    const clientId = this.getOptionalConfig("FOLLOW_UP_MICROSOFT_CLIENT_ID");
    const clientSecret = this.getOptionalConfig(
      "FOLLOW_UP_MICROSOFT_CLIENT_SECRET"
    );
    const tenantId =
      this.getOptionalConfig("FOLLOW_UP_MICROSOFT_TENANT_ID") ?? "common";

    if (!clientId || !clientSecret) {
      return this.allowTestProvider()
        ? null
        : this.throwMissingConfig("Microsoft");
    }

    return {
      clientId,
      clientSecret,
      authorizationUrl: MICROSOFT_AUTHORIZATION_BASE_URL.replace(
        "{tenant}",
        encodeURIComponent(tenantId)
      ),
      tokenUrl: MICROSOFT_TOKEN_BASE_URL.replace(
        "{tenant}",
        encodeURIComponent(tenantId)
      ),
      profileUrl: MICROSOFT_PROFILE_URL,
    };
  }

  // 기능 : provider별 OAuth 최소 scope를 반환합니다.
  private getScopes(provider: ExternalEmailProviderValue): readonly string[] {
    if (provider === "GOOGLE") {
      return [
        "openid",
        "email",
        "https://www.googleapis.com/auth/gmail.send",
      ];
    }

    return ["openid", "email", "offline_access", "User.Read", "Mail.Send"];
  }

  // 기능 : provider timeout과 네트워크 실패를 공통 fetch 경로로 제어합니다.
  private async fetchWithTimeout(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 기능 : smoke mode에서 allowlist 밖 수신자를 provider 호출 없이 차단합니다.
  private createSmokeAllowlistFailure(
    input: FollowUpEmailSendInput,
    startedAt: number
  ): FollowUpProviderDeliveryFailure | null {
    if (!this.isSmokeMode()) {
      return null;
    }

    const allowedRecipients = this.getSmokeAllowedRecipients();
    const recipient = input.to.email.trim().toLowerCase();

    if (allowedRecipients.has(recipient)) {
      return null;
    }

    return {
      ok: false,
      provider: input.provider.toLowerCase(),
      providerStatusCode: "SMOKE_BLOCKED",
      safeErrorCode: "FollowUpEmailSmokeRecipientNotAllowed",
      safeErrorMessage:
        "Smoke 검증 수신자로 등록된 이메일에만 보낼 수 있어요.",
      retryable: false,
      latencyMs: this.toLatencyMs(startedAt),
      detailJson: {
        providerStatusReason: "SMOKE_RECIPIENT_NOT_ALLOWED",
        safeCategory: "SMOKE",
        smokeMode: true,
        externalCallSkipped: true,
      },
    };
  }

  // 기능 : Gmail 발송에 필요한 plain text MIME message를 생성합니다.
  private createGmailMimeMessage(input: FollowUpEmailSendInput): string {
    const headers = [
      `From: ${this.formatMimeAddress(input.from.email, input.from.displayName)}`,
      `To: ${this.formatMimeAddress(input.to.email, input.to.name)}`,
      `Subject: ${this.encodeMimeHeaderValue(input.subject)}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
    ];

    return `${headers.join("\r\n")}\r\n\r\n${this.normalizeBodyLineEndings(
      input.body
    )}`;
  }

  // 기능 : Microsoft Graph sendMail의 Text body request를 생성합니다.
  private createMicrosoftSendMailBody(input: FollowUpEmailSendInput): Record<string, unknown> {
    const emailAddress: { address: string; name?: string } = {
      address: input.to.email,
    };
    const recipientName = input.to.name?.trim();

    if (recipientName) {
      emailAddress.name = recipientName;
    }

    return {
      message: {
        subject: input.subject,
        body: {
          contentType: "Text",
          content: input.body,
        },
        toRecipients: [
          {
            emailAddress,
          },
        ],
      },
      saveToSentItems: true,
    };
  }

  // 기능 : provider HTTP 실패 status를 G10 safe error 계약으로 변환합니다.
  private async createHttpFailure(
    provider: "google" | "microsoft",
    response: Response,
    startedAt: number
  ): Promise<FollowUpProviderDeliveryFailure> {
    const reason = await this.extractProviderStatusReason(response);
    const mapping = this.mapHttpFailure(response.status, reason);
    const retryAfterSeconds = this.parseRetryAfterSeconds(
      response.headers.get("retry-after")
    );
    const requestId = this.getProviderRequestId(response);

    return {
      ok: false,
      provider,
      providerStatusCode: String(response.status),
      safeErrorCode: mapping.safeErrorCode,
      safeErrorMessage: mapping.safeErrorMessage,
      retryable: mapping.retryable,
      latencyMs: this.toLatencyMs(startedAt),
      detailJson: {
        providerStatusReason: reason,
        safeCategory: mapping.safeCategory,
        ...(requestId ? { providerRequestId: requestId } : {}),
        ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
      },
    };
  }

  // 기능 : 예외로 끝난 provider 호출을 safe failure 결과로 변환합니다.
  private createProviderExceptionFailure(
    provider: ExternalEmailProviderValue,
    error: unknown,
    startedAt: number
  ): FollowUpProviderDeliveryFailure {
    const providerSlug = provider.toLowerCase();

    if (error instanceof FollowUpEmailReconnectRequiredError) {
      return {
        ok: false,
        provider: providerSlug,
        safeErrorCode: "FollowUpEmailReconnectRequired",
        safeErrorMessage:
          "이메일 연결이 만료됐어요. 다시 연결한 뒤 재시도해 주세요.",
        retryable: false,
        latencyMs: this.toLatencyMs(startedAt),
        detailJson: {
          providerStatusReason: "RECONNECT_REQUIRED",
          safeCategory: "AUTH",
        },
      };
    }

    if (error instanceof FollowUpProviderUnavailableError) {
      return {
        ok: false,
        provider: providerSlug,
        safeErrorCode: "FollowUpProviderUnavailable",
        safeErrorMessage: "이메일 provider 설정을 확인해 주세요.",
        retryable: false,
        latencyMs: this.toLatencyMs(startedAt),
        detailJson: {
          providerStatusReason: "PROVIDER_NOT_CONFIGURED",
          safeCategory: "CONFIG",
        },
      };
    }

    if (this.isAbortError(error)) {
      return {
        ok: false,
        provider: providerSlug,
        safeErrorCode: "FollowUpProviderTemporaryFailure",
        safeErrorMessage:
          "메일 provider 응답이 지연되고 있어요. 잠시 뒤 다시 시도해 주세요.",
        retryable: true,
        latencyMs: this.toLatencyMs(startedAt),
        detailJson: {
          providerStatusReason: "TIMEOUT",
          safeCategory: "TEMPORARY",
        },
      };
    }

    return {
      ok: false,
      provider: providerSlug,
      safeErrorCode: "FollowUpProviderTemporaryFailure",
      safeErrorMessage:
        "메일 provider 요청을 완료하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
      retryable: true,
      latencyMs: this.toLatencyMs(startedAt),
      detailJson: {
        providerStatusReason:
          error instanceof Error && error.name.trim().length > 0
            ? error.name
            : "NETWORK_OR_PROVIDER_ERROR",
        safeCategory: "TEMPORARY",
      },
    };
  }

  // 기능 : HTTP status와 provider safe reason을 발송 safe error로 매핑합니다.
  private mapHttpFailure(
    status: number,
    reason: string
  ): ProviderHttpFailureMapping {
    if (status === 401 || status === 403) {
      return {
        safeErrorCode: "FollowUpEmailReconnectRequired",
        safeErrorMessage:
          "이메일 연결이 만료됐어요. 다시 연결한 뒤 재시도해 주세요.",
        retryable: false,
        safeCategory: "AUTH",
      };
    }

    if (status === 400 || this.isInvalidRecipientReason(reason)) {
      return {
        safeErrorCode: "FollowUpInvalidRecipient",
        safeErrorMessage: "수신자 이메일 주소를 확인한 뒤 다시 보내 주세요.",
        retryable: false,
        safeCategory: "RECIPIENT",
      };
    }

    if (status === 408 || status === 429 || status >= 500) {
      return {
        safeErrorCode: "FollowUpProviderTemporaryFailure",
        safeErrorMessage:
          "메일 provider 응답이 지연되고 있어요. 잠시 뒤 다시 시도해 주세요.",
        retryable: true,
        safeCategory: "TEMPORARY",
      };
    }

    return {
      safeErrorCode: "FollowUpProviderRequestFailed",
      safeErrorMessage:
        "메일 provider 요청을 완료하지 못했어요. 내용을 확인한 뒤 다시 시도해 주세요.",
      retryable: false,
      safeCategory: "REQUEST",
    };
  }

  // 기능 : provider error body에서 저장 가능한 code/status만 추출합니다.
  private async extractProviderStatusReason(response: Response): Promise<string> {
    try {
      const body = (await response.clone().json()) as unknown;
      const reason = this.extractSafeReasonFromJson(body);

      return reason ?? `HTTP_${response.status}`;
    } catch {
      return `HTTP_${response.status}`;
    }
  }

  // 기능 : provider JSON error에서 raw message 없이 code/status 필드만 읽습니다.
  private extractSafeReasonFromJson(value: unknown): string | null {
    if (!value || typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    const directError = record.error;

    if (typeof directError === "string" && directError.trim().length > 0) {
      return this.sanitizeStatusReason(directError);
    }

    if (directError && typeof directError === "object") {
      const errorRecord = directError as Record<string, unknown>;
      const nestedReason = errorRecord.status ?? errorRecord.code;

      if (typeof nestedReason === "string" && nestedReason.trim().length > 0) {
        return this.sanitizeStatusReason(nestedReason);
      }

      if (typeof nestedReason === "number") {
        return `PROVIDER_CODE_${nestedReason}`;
      }
    }

    const status = record.status ?? record.code;

    if (typeof status === "string" && status.trim().length > 0) {
      return this.sanitizeStatusReason(status);
    }

    if (typeof status === "number") {
      return `PROVIDER_CODE_${status}`;
    }

    return null;
  }

  // 기능 : provider request id header를 비식별 추적 값으로 추출합니다.
  private getProviderRequestId(response: Response): string | null {
    return (
      response.headers.get("x-request-id") ??
      response.headers.get("request-id") ??
      response.headers.get("x-ms-request-id") ??
      response.headers.get("x-guploader-uploadid")
    );
  }

  // 기능 : Retry-After header를 초 단위 safe detail로 변환합니다.
  private parseRetryAfterSeconds(value: string | null): number | undefined {
    if (!value) {
      return undefined;
    }

    const seconds = Number.parseInt(value, 10);

    return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
  }

  // 기능 : token refresh 실패 중 재연결이 필요한 provider reason을 식별합니다.
  private isRefreshReconnectFailure(status: number, reason: string): boolean {
    const normalizedReason = reason.toLowerCase();

    return (
      status === 400 ||
      status === 401 ||
      normalizedReason.includes("invalid_grant") ||
      normalizedReason.includes("interaction_required") ||
      normalizedReason.includes("consent_required")
    );
  }

  // 기능 : provider reason이 잘못된 수신자 계열인지 식별합니다.
  private isInvalidRecipientReason(reason: string): boolean {
    const normalizedReason = reason.toLowerCase();

    return (
      normalizedReason.includes("recipient") ||
      normalizedReason.includes("invalid_to") ||
      normalizedReason.includes("invalidaddress") ||
      normalizedReason.includes("invalid_argument")
    );
  }

  // 기능 : MIME header에 들어가는 표시 이름과 주소를 안전한 형식으로 만듭니다.
  private formatMimeAddress(email: string, displayName?: string): string {
    const sanitizedEmail = this.sanitizeHeaderValue(email);
    const sanitizedName = displayName
      ? this.sanitizeHeaderValue(displayName)
      : "";

    if (!sanitizedName) {
      return `<${sanitizedEmail}>`;
    }

    return `${this.encodeMimeHeaderValue(sanitizedName)} <${sanitizedEmail}>`;
  }

  // 기능 : Subject와 display name을 UTF-8 encoded-word로 변환합니다.
  private encodeMimeHeaderValue(value: string): string {
    const sanitized = this.sanitizeHeaderValue(value);

    return `=?UTF-8?B?${Buffer.from(sanitized, "utf8").toString("base64")}?=`;
  }

  // 기능 : MIME header injection을 막기 위해 줄바꿈을 공백으로 접습니다.
  private sanitizeHeaderValue(value: string): string {
    return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // 기능 : provider status reason에 허용되는 안전한 문자만 남깁니다.
  private sanitizeStatusReason(value: string): string {
    const normalized = value.replace(/[^A-Za-z0-9_.:-]/g, "_").slice(0, 80);

    return normalized.length > 0 ? normalized : "PROVIDER_ERROR";
  }

  // 기능 : plain text body의 줄바꿈을 MIME 표준 CRLF로 정규화합니다.
  private normalizeBodyLineEndings(value: string): string {
    return value.replace(/\r\n|\r|\n/g, "\r\n");
  }

  // 기능 : Gmail raw 필드에 넣기 위해 MIME 문자열을 base64url로 인코딩합니다.
  private encodeBase64Url(value: string): string {
    return Buffer.from(value, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  // 기능 : 성공 응답 JSON에서 필요한 safe field만 읽도록 객체 여부를 확인합니다.
  private async readJsonObject(response: Response): Promise<Record<string, unknown>> {
    try {
      const value = (await response.json()) as unknown;

      return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  // 기능 : seconds 기반 expires_in 값을 UTC 만료 시각으로 변환합니다.
  private toExpiresAt(value: unknown): Date | undefined {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      return undefined;
    }

    return new Date(Date.now() + value * 1000);
  }

  // 기능 : provider token response의 scope 문자열을 배열로 정규화합니다.
  private toScopes(
    value: unknown,
    fallbackScopes: readonly string[]
  ): readonly string[] {
    if (typeof value !== "string") {
      return fallbackScopes;
    }

    const scopes = value
      .split(/\s+/)
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0);

    return scopes.length > 0 ? scopes : fallbackScopes;
  }

  // 기능 : provider token 필수 문자열 값을 검증합니다.
  private requireTokenText(value: unknown, label: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new FollowUpProviderRequestFailedError(
        `Follow-up email ${label} was missing.`
      );
    }

    return value.trim();
  }

  // 기능 : provider profile에서 안전한 계정 식별자를 추출합니다.
  private toProviderAccountId(profile: ProfileResponse): string | undefined {
    const value = profile.id ?? profile.sub;

    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined;
  }

  // 기능 : provider profile에서 sender email을 추출합니다.
  private toProviderAccountEmail(profile: ProfileResponse): string {
    const value =
      typeof profile.email === "string" && profile.email.trim().length > 0
        ? profile.email
        : typeof profile.mail === "string" && profile.mail.trim().length > 0
          ? profile.mail
          : profile.userPrincipalName;

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new FollowUpProviderRequestFailedError(
        "Follow-up email account email was missing."
      );
    }

    return value.trim();
  }

  // 기능 : 선택 환경 변수를 trim된 문자열 또는 null로 읽습니다.
  private getOptionalConfig(key: string): string | null {
    return this.configService.get<string>(key)?.trim() || null;
  }

  // 기능 : production이 아닌 환경에서 test provider fallback을 허용합니다.
  private allowTestProvider(): boolean {
    return this.configService.get<string>("NODE_ENV") !== "production";
  }

  // 기능 : G10 smoke mode 활성화 여부를 환경 변수에서 읽습니다.
  private isSmokeMode(): boolean {
    return (
      this.configService
        .get<string>("FOLLOW_UP_EMAIL_SMOKE_MODE")
        ?.trim()
        .toLowerCase() === "true"
    );
  }

  // 기능 : smoke mode에서 실제 provider 호출이 허용된 수신자 목록을 읽습니다.
  private getSmokeAllowedRecipients(): Set<string> {
    const raw =
      this.configService.get<string>(
        "FOLLOW_UP_EMAIL_SMOKE_ALLOWED_RECIPIENTS"
      ) ?? "";

    return new Set(
      raw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    );
  }

  // 기능 : AbortController 기반 timeout 오류인지 확인합니다.
  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    );
  }

  // 기능 : provider 호출 시작 시각에서 경과 시간을 밀리초로 계산합니다.
  private toLatencyMs(startedAt: number): number {
    return Math.max(Date.now() - startedAt, 0);
  }

  // 기능 : provider 실패 로그를 safe field만 포함해 남깁니다.
  private logProviderFailure(failure: FollowUpProviderDeliveryFailure): void {
    this.logger.warn(
      JSON.stringify({
        event: `provider.${failure.provider}.followUpSend.failed`,
        provider: failure.provider,
        providerStatusCode: failure.providerStatusCode ?? null,
        safeErrorCode: failure.safeErrorCode,
        retryable: failure.retryable,
        latencyMs: failure.latencyMs ?? null,
      }),
      "ConfigurableFollowUpEmailDeliveryProvider"
    );
  }

  // 기능 : provider credential 누락을 production safe error로 변환합니다.
  private throwMissingConfig(providerName: string): never {
    throw new FollowUpProviderUnavailableError(
      `${providerName} follow-up email provider is not configured.`
    );
  }
}
