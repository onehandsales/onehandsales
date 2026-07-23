export const GOOGLE_CALENDAR_OAUTH_PROVIDER = Symbol(
  "GOOGLE_CALENDAR_OAUTH_PROVIDER"
);

export interface CreateGoogleCalendarAuthorizationUrlInput {
  readonly state: string;
  readonly scopes: readonly string[];
}

export interface GoogleCalendarTokenExchangeResult {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly idToken: string;
  readonly expiresInSeconds: number | null;
  readonly grantedScopes: string[];
}

export interface GoogleCalendarIdentity {
  readonly providerAccountId: string;
  readonly email: string;
  readonly emailVerified: boolean;
}

export interface GoogleCalendarOAuthProvider {
  createAuthorizationUrl(
    input: CreateGoogleCalendarAuthorizationUrlInput
  ): string;
  exchangeAuthorizationCode(
    code: string
  ): Promise<GoogleCalendarTokenExchangeResult>;
  verifyIdToken(idToken: string): Promise<GoogleCalendarIdentity>;
}
