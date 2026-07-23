import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type CreateGoogleCalendarAuthorizationUrlInput,
  type GoogleCalendarIdentity,
  type GoogleCalendarOAuthProvider,
  type GoogleCalendarTokenExchangeResult,
} from "@/modules/schedule/application/ports/google-calendar-oauth.provider";
import { GoogleCalendarProviderUnavailableError } from "@/modules/schedule/domain/google-calendar.errors";

type JoseModule = typeof import("jose");
type JwtPayload = {
  readonly sub?: unknown;
  readonly email?: unknown;
  readonly email_verified?: unknown;
};

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const importEsm = new Function("specifier", "return import(specifier)") as (
  specifier: string
) => Promise<JoseModule>;

@Injectable()
export class GoogleCalendarOAuthProviderAdapter
  implements GoogleCalendarOAuthProvider
{
  private joseModule: Promise<JoseModule> | null = null;

  constructor(private readonly configService: ConfigService) {}

  createAuthorizationUrl(
    input: CreateGoogleCalendarAuthorizationUrlInput
  ): string {
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", this.getClientId());
    url.searchParams.set("redirect_uri", this.getRedirectUri());
    url.searchParams.set("scope", input.scopes.join(" "));
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("state", input.state);

    return url.toString();
  }

  async exchangeAuthorizationCode(
    code: string
  ): Promise<GoogleCalendarTokenExchangeResult> {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: this.getClientId(),
        client_secret: this.getClientSecret(),
        redirect_uri: this.getRedirectUri(),
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new GoogleCalendarProviderUnavailableError(
        "Google Calendar token exchange failed"
      );
    }

    const body = (await response.json()) as Record<string, unknown>;
    const accessToken = body.access_token;
    const idToken = body.id_token;

    if (typeof accessToken !== "string" || typeof idToken !== "string") {
      throw new GoogleCalendarProviderUnavailableError(
        "Google Calendar token response was invalid"
      );
    }

    return {
      accessToken,
      refreshToken:
        typeof body.refresh_token === "string" ? body.refresh_token : null,
      idToken,
      expiresInSeconds:
        typeof body.expires_in === "number" ? body.expires_in : null,
      grantedScopes:
        typeof body.scope === "string"
          ? body.scope.split(" ").filter((scope) => scope.length > 0)
          : [],
    };
  }

  async verifyIdToken(idToken: string): Promise<GoogleCalendarIdentity> {
    const { createRemoteJWKSet, jwtVerify } = await this.getJose();
    const jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: GOOGLE_ISSUERS,
      audience: this.getClientId(),
    });
    const googlePayload = payload as JwtPayload;

    if (
      typeof googlePayload.sub !== "string" ||
      typeof googlePayload.email !== "string" ||
      googlePayload.email_verified !== true
    ) {
      throw new GoogleCalendarProviderUnavailableError(
        "Google Calendar identity token was invalid"
      );
    }

    return {
      providerAccountId: googlePayload.sub,
      email: googlePayload.email,
      emailVerified: true,
    };
  }

  private getJose(): Promise<JoseModule> {
    this.joseModule ??= importEsm("jose");
    return this.joseModule;
  }

  private getClientId(): string {
    return this.getRequiredConfig("GOOGLE_CALENDAR_CLIENT_ID");
  }

  private getClientSecret(): string {
    return this.getRequiredConfig("GOOGLE_CALENDAR_CLIENT_SECRET");
  }

  private getRedirectUri(): string {
    return this.getRequiredConfig("GOOGLE_CALENDAR_REDIRECT_URI");
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value || value.trim().length === 0) {
      throw new GoogleCalendarProviderUnavailableError(`${key} is missing`);
    }

    return value;
  }
}
