import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ExternalAuthProvider } from "@/shared/application/ports/external-auth-verifier.port";

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export type AuthUserRole = "USER" | "ADMIN";
export type AuthUserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type AuthDeviceSlot = "mobile" | "personal_laptop" | "work_laptop";

// 역할 : AuthUserRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AuthUserRecord {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: AuthUserRole;
  readonly status: AuthUserStatus;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly signupLocale: string | null;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string | null;
  readonly lastLoginLocale: string | null;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string | null;
  readonly deletedAt: Date | null;
}

// 역할 : AuthMeRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AuthMeRecord extends AuthUserRecord {
  readonly supabaseUserId: string | null;
}

// 역할 : AuthOAuthAccountRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AuthOAuthAccountRecord {
  readonly id: string;
  readonly userId: string;
  readonly provider: ExternalAuthProvider;
  readonly providerUserId: string;
}

// 역할 : AuthDeviceRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AuthDeviceRecord {
  readonly id: string;
  readonly userId: string;
  readonly slot: AuthDeviceSlot;
  readonly deviceIdHash: string;
  readonly label: string | null;
}

// 역할 : AuthSessionRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AuthSessionRecord {
  readonly id: string;
  readonly userId: string;
  readonly authDeviceId: string;
  readonly status: "ACTIVE" | "REVOKED" | "EXPIRED";
  readonly refreshTokenHash: string | null;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}

// 역할 : CreateAuthUserInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateAuthUserInput {
  readonly email: string;
  readonly displayName: string | null;
  readonly role: AuthUserRole;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly signupLocale: string;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string;
  readonly lastLoginLocale: string;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string;
  readonly provider: ExternalAuthProvider;
  readonly providerUserId: string;
  readonly providerEmail: string;
}

// 역할 : UpdateUserLoginInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateUserLoginInput {
  readonly userId: string;
  readonly email: string;
  readonly lastLoginLocale: string;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string;
  readonly role?: AuthUserRole;
}

// 역할 : CreateAuthDeviceInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateAuthDeviceInput {
  readonly userId: string;
  readonly slot: AuthDeviceSlot;
  readonly deviceIdHash: string;
  readonly label: string | null;
  readonly now: Date;
}

// 역할 : CreateAuthSessionInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateAuthSessionInput {
  readonly userId: string;
  readonly authDeviceId: string;
  readonly refreshTokenHash: string;
  readonly expiresAt: Date;
  readonly userAgent: string | null;
  readonly ipAddressHash: string | null;
  readonly now: Date;
}

// 역할 : AuthRepository 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface AuthRepository {
  // 기능 : 인증 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(work: (repository: AuthRepository) => Promise<T>): Promise<T>;
  // 기능 : OAuth 제공자 계정 식별자로 연결된 계정을 조회합니다.
  findOAuthAccount(
    provider: ExternalAuthProvider,
    providerUserId: string
  ): Promise<AuthOAuthAccountRecord | null>;
  // 기능 : 기존 OAuth 계정의 provider 사용자 식별자를 최신 안정 식별자로 갱신합니다.
  updateOAuthAccountProviderUserId(
    oauthAccountId: string,
    providerUserId: string,
    now: Date
  ): Promise<AuthOAuthAccountRecord>;
  // 기능 : 사용자와 OAuth 계정을 함께 생성합니다.
  createUserWithOAuthAccount(
    input: CreateAuthUserInput,
    now: Date
  ): Promise<AuthUserRecord>;
  // 기능 : 로그인 성공 후 사용자 로그인 메타데이터를 갱신합니다.
  updateUserAfterLogin(input: UpdateUserLoginInput, now: Date): Promise<AuthUserRecord>;
  // 기능 : 인증 응답용 내 정보 레코드를 조회합니다.
  getMe(userId: string): Promise<AuthMeRecord | null>;
  // 기능 : 사용자와 기기 슬롯 기준 활성 기기를 조회합니다.
  findActiveDeviceBySlot(
    userId: string,
    slot: AuthDeviceSlot
  ): Promise<AuthDeviceRecord | null>;
  // 기능 : 새 인증 기기 레코드를 생성합니다.
  createAuthDevice(input: CreateAuthDeviceInput): Promise<AuthDeviceRecord>;
  // 기능 : 인증 기기의 라벨과 마지막 사용 시각을 갱신합니다.
  updateAuthDeviceSeen(
    authDeviceId: string,
    label: string | null,
    now: Date
  ): Promise<AuthDeviceRecord>;
  // 기능 : 인증 기기를 교체 상태로 변경합니다.
  replaceAuthDevice(authDeviceId: string, now: Date): Promise<void>;
  // 기능 : 인증 기기에 연결된 활성 세션을 모두 폐기합니다.
  revokeActiveSessionsByDevice(authDeviceId: string, now: Date): Promise<void>;
  // 기능 : refresh token 기반 인증 세션을 생성합니다.
  createAuthSession(input: CreateAuthSessionInput): Promise<AuthSessionRecord>;
  // 기능 : 기기에 연결된 재사용 가능한 활성 세션을 조회합니다.
  findActiveSessionByDevice(
    authDeviceId: string,
    now: Date
  ): Promise<AuthSessionRecord | null>;
  // 기능 : 세션 ID로 세션과 사용자 컨텍스트를 조회합니다.
  findSessionByIdWithUser(
    sessionId: string
  ): Promise<{ session: AuthSessionRecord; user: CurrentUserContext } | null>;
  // 기능 : refresh token 해시로 세션과 사용자 컨텍스트를 조회합니다.
  findSessionByRefreshTokenHash(
    refreshTokenHash: string
  ): Promise<{ session: AuthSessionRecord; user: CurrentUserContext } | null>;
  // 기능 : 세션의 refresh token과 만료 정보를 갱신합니다.
  rotateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    now: Date
  ): Promise<void>;
  // 기능 : 단일 인증 세션을 폐기합니다.
  revokeSession(sessionId: string, now: Date): Promise<void>;
}
