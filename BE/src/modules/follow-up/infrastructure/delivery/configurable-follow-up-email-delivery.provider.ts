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
  FollowUpProviderDeliveryResult,
} from "@/modules/follow-up/application/ports/follow-up-delivery.provider";
import {
  FollowUpProviderRequestFailedError,
  FollowUpProviderUnavailableError,
} from "@/modules/follow-up/domain/follow-up-delivery.errors";

const GOOGLE_AUTHORIZATION_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const MICROSOFT_AUTHORIZATION_BASE_URL =
  "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_BASE_URL =
  "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token";
const MICROSOFT_PROFILE_URL = "https://graph.microsoft.com/v1.0/me";

interface EmailProviderConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly authorizationUrl: string;
  readonly tokenUrl: string;
  readonly profileUrl: string;
}

interface TokenEndpointResponse {
  readonly access_token?: unknown;
  readonly refresh_token?: unknown;
  readonly expires_in?: unknown;
  readonly scope?: unknown;
}

interface ProfileResponse {
  readonly id?: unknown;
  readonly sub?: unknown;
  readonly mail?: unknown;
  readonly userPrincipalName?: unknown;
  readonly email?: unknown;
}

@Injectable()
export class ConfigurableFollowUpEmailDeliveryProvider
  implements FollowUpEmailDeliveryProvider
{
  constructor(private readonly configService: ConfigService) {}

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
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    return Promise.resolve({ authorizationUrl: url.toString() });
  }

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
      redirectUri: input.redirectUri,
      grantType: "authorization_code",
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
      scopes: this.toScopes(tokenResponse.scope),
      ...(providerAccountId ? { providerAccountId } : {}),
      providerAccountEmail: this.toProviderAccountEmail(profile),
    };
  }

  async refreshAccessToken(input: {
    provider: ExternalEmailProviderValue;
    refreshToken: string;
  }): Promise<FollowUpEmailTokenSet> {
    const config = this.getProviderConfigOrNull(input.provider);

    if (!config) {
      return this.createTestTokenSet(input.provider);
    }

    const tokenResponse = await this.requestToken(config, {
      refreshToken: input.refreshToken,
      grantType: "refresh_token",
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
      ...(expiresAt ? { expiresAt } : {}),
      scopes: this.toScopes(tokenResponse.scope),
      ...(providerAccountId ? { providerAccountId } : {}),
      providerAccountEmail: this.toProviderAccountEmail(profile),
    };
  }

  revokeConnection(): Promise<void> {
    return Promise.resolve();
  }

  sendEmail(
    input: FollowUpEmailSendInput
  ): Promise<FollowUpProviderDeliveryResult> {
    return Promise.resolve({
      ok: false,
      provider: input.provider.toLowerCase(),
      safeErrorCode: "FollowUpSendNotImplemented",
      safeErrorMessage:
        "Follow-up email sending is implemented in the send backend goal.",
      retryable: false,
      detailJson: {
        providerStatusReason: "G07_REQUIRED",
      },
    });
  }

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

  private async requestToken(
    config: EmailProviderConfig,
    input:
      | {
          readonly grantType: "authorization_code";
          readonly code: string;
          readonly redirectUri: string;
        }
      | {
          readonly grantType: "refresh_token";
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

    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new FollowUpProviderRequestFailedError(
        "Follow-up email token request failed."
      );
    }

    return (await response.json()) as TokenEndpointResponse;
  }

  private async requestProfile(
    profileUrl: string,
    accessToken: string
  ): Promise<ProfileResponse> {
    const response = await fetch(profileUrl, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new FollowUpProviderRequestFailedError(
        "Follow-up email profile request failed."
      );
    }

    return (await response.json()) as ProfileResponse;
  }

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
      return this.allowTestProvider() ? null : this.throwMissingConfig("Microsoft");
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

  private toExpiresAt(value: unknown): Date | undefined {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      return undefined;
    }

    return new Date(Date.now() + value * 1000);
  }

  private toScopes(value: unknown): readonly string[] {
    if (typeof value !== "string") {
      return [];
    }

    return value
      .split(/\s+/)
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0);
  }

  private requireTokenText(value: unknown, label: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new FollowUpProviderRequestFailedError(
        `Follow-up email ${label} was missing.`
      );
    }

    return value.trim();
  }

  private toProviderAccountId(profile: ProfileResponse): string | undefined {
    const value = profile.id ?? profile.sub;

    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined;
  }

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

  private getOptionalConfig(key: string): string | null {
    return this.configService.get<string>(key)?.trim() || null;
  }

  private allowTestProvider(): boolean {
    return this.configService.get<string>("NODE_ENV") !== "production";
  }

  private throwMissingConfig(providerName: string): never {
    throw new FollowUpProviderUnavailableError(
      `${providerName} follow-up email provider is not configured.`
    );
  }
}
