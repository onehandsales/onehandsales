import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ExternalAuthProvider } from "@/shared/application/ports/external-auth-verifier.port";

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export type AuthUserRole = "USER" | "ADMIN";
export type AuthUserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type AuthDeviceSlot = "mobile" | "personal_laptop" | "work_laptop";

export interface AuthUserRecord {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: AuthUserRole;
  readonly status: AuthUserStatus;
  readonly deletedAt: Date | null;
}

export interface AuthMeRecord extends AuthUserRecord {
  readonly supabaseUserId: string | null;
}

export interface AuthOAuthAccountRecord {
  readonly id: string;
  readonly userId: string;
  readonly provider: ExternalAuthProvider;
  readonly providerUserId: string;
}

export interface AuthDeviceRecord {
  readonly id: string;
  readonly userId: string;
  readonly slot: AuthDeviceSlot;
  readonly deviceIdHash: string;
  readonly label: string | null;
}

export interface AuthSessionRecord {
  readonly id: string;
  readonly userId: string;
  readonly status: "ACTIVE" | "REVOKED" | "EXPIRED";
  readonly refreshTokenHash: string | null;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}

export interface CreateAuthUserInput {
  readonly email: string;
  readonly displayName: string | null;
  readonly role: AuthUserRole;
  readonly provider: ExternalAuthProvider;
  readonly providerUserId: string;
  readonly providerEmail: string;
}

export interface UpdateUserLoginInput {
  readonly userId: string;
  readonly email: string;
  readonly role?: AuthUserRole;
}

export interface CreateAuthDeviceInput {
  readonly userId: string;
  readonly slot: AuthDeviceSlot;
  readonly deviceIdHash: string;
  readonly label: string | null;
  readonly now: Date;
}

export interface CreateAuthSessionInput {
  readonly userId: string;
  readonly authDeviceId: string;
  readonly refreshTokenHash: string;
  readonly expiresAt: Date;
  readonly userAgent: string | null;
  readonly ipAddressHash: string | null;
  readonly now: Date;
}

export interface AuthRepository {
  runInTransaction<T>(work: (repository: AuthRepository) => Promise<T>): Promise<T>;
  findOAuthAccount(
    provider: ExternalAuthProvider,
    providerUserId: string
  ): Promise<AuthOAuthAccountRecord | null>;
  createUserWithOAuthAccount(
    input: CreateAuthUserInput,
    now: Date
  ): Promise<AuthUserRecord>;
  updateUserAfterLogin(input: UpdateUserLoginInput, now: Date): Promise<AuthUserRecord>;
  getMe(userId: string): Promise<AuthMeRecord | null>;
  findActiveDeviceBySlot(
    userId: string,
    slot: AuthDeviceSlot
  ): Promise<AuthDeviceRecord | null>;
  createAuthDevice(input: CreateAuthDeviceInput): Promise<AuthDeviceRecord>;
  updateAuthDeviceSeen(
    authDeviceId: string,
    label: string | null,
    now: Date
  ): Promise<AuthDeviceRecord>;
  replaceAuthDevice(authDeviceId: string, now: Date): Promise<void>;
  revokeActiveSessionsByDevice(authDeviceId: string, now: Date): Promise<void>;
  createAuthSession(input: CreateAuthSessionInput): Promise<AuthSessionRecord>;
  findSessionByIdWithUser(
    sessionId: string
  ): Promise<{ session: AuthSessionRecord; user: CurrentUserContext } | null>;
  findSessionByRefreshTokenHash(
    refreshTokenHash: string
  ): Promise<{ session: AuthSessionRecord; user: CurrentUserContext } | null>;
  rotateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    now: Date
  ): Promise<void>;
  revokeSession(sessionId: string, now: Date): Promise<void>;
}

