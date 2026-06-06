export const APP_TOKEN_ISSUER = Symbol("APP_TOKEN_ISSUER");

export interface AppAccessTokenPayload {
  readonly userId: string;
  readonly sessionId: string;
}

export interface IssuedAppAccessToken {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: Date;
}

export interface AppTokenIssuer {
  issueAccessToken(payload: AppAccessTokenPayload): Promise<IssuedAppAccessToken>;
  verifyAccessToken(accessToken: string): Promise<AppAccessTokenPayload>;
}

