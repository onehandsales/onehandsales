export const EXTERNAL_AUTH_VERIFIER = Symbol("EXTERNAL_AUTH_VERIFIER");

export type ExternalAuthProvider = "google";

// 역할 : VerifiedExternalUser 인터페이스가 구현해야 하는 계약을 정의합니다.
export interface VerifiedExternalUser {
  provider: ExternalAuthProvider;
  providerAccountId: string;
  authUserId: string;
  email: string;
  name: string | null;
}

// 역할 : ExternalAuthVerifier 포트가 외부 의존성 또는 공통 기능에 대해 제공해야 하는 계약을 정의합니다.
export interface ExternalAuthVerifier {
  // 기능 : 외부 인증 access token을 검증하고 외부 사용자 정보를 반환합니다.
  verifyAccessToken(accessToken: string): Promise<VerifiedExternalUser>;
}
