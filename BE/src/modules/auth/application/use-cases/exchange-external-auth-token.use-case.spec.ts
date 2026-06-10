import { ConfigService } from "@nestjs/config";
import {
  type AuthDeviceRecord,
  type AuthDeviceSlot,
  type AuthMeRecord,
  type AuthOAuthAccountRecord,
  type AuthRepository,
  type AuthSessionRecord,
  type AuthUserRecord,
  type CreateAuthDeviceInput,
  type CreateAuthSessionInput,
  type CreateAuthUserInput,
  type UpdateUserLoginInput,
} from "@/modules/auth/application/ports/auth.repository";
import type { AppTokenIssuer } from "@/modules/auth/application/ports/app-token.port";
import type { SecureTokenService } from "@/modules/auth/application/ports/secure-token.port";
import { DeviceSlotAlreadyRegisteredError } from "@/modules/auth/domain/auth.errors";
import type {
  ExternalAuthProvider,
  ExternalAuthVerifier,
  VerifiedExternalUser,
} from "@/shared/application/ports/external-auth-verifier.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ExchangeExternalAuthTokenUseCase } from "./exchange-external-auth-token.use-case";

class FakeExternalAuthVerifier implements ExternalAuthVerifier {
  constructor(private readonly verifiedUser: VerifiedExternalUser) {}

  async verifyAccessToken(): Promise<VerifiedExternalUser> {
    return this.verifiedUser;
  }
}

class FakeAppTokenIssuer implements AppTokenIssuer {
  async issueAccessToken() {
    return {
      accessToken: "app-access-token",
      accessTokenExpiresAt: new Date("2026-06-06T00:15:00.000Z"),
    };
  }

  async verifyAccessToken() {
    return {
      userId: "user-1",
      sessionId: "session-1",
    };
  }
}

class FakeSecureTokenService implements SecureTokenService {
  createToken(): string {
    return "refresh-token";
  }

  hash(value: string): string {
    return `hash:${value}`;
  }
}

class FakeAuthRepository implements AuthRepository {
  users: AuthUserRecord[] = [];
  oauthAccounts: AuthOAuthAccountRecord[] = [];
  devices: AuthDeviceRecord[] = [];
  sessions: AuthSessionRecord[] = [];

  async runInTransaction<T>(
    work: (repository: AuthRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  async findOAuthAccount(
    provider: ExternalAuthProvider,
    providerUserId: string
  ): Promise<AuthOAuthAccountRecord | null> {
    return (
      this.oauthAccounts.find(
        (account) =>
          account.provider === provider && account.providerUserId === providerUserId
      ) ?? null
    );
  }

  async createUserWithOAuthAccount(
    input: CreateAuthUserInput
  ): Promise<AuthUserRecord> {
    const user: AuthUserRecord = {
      id: `user-${this.users.length + 1}`,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      status: "ACTIVE",
      deletedAt: null,
    };
    this.users.push(user);
    this.oauthAccounts.push({
      id: `oauth-${this.oauthAccounts.length + 1}`,
      userId: user.id,
      provider: input.provider,
      providerUserId: input.providerUserId,
    });

    return user;
  }

  async updateUserAfterLogin(input: UpdateUserLoginInput): Promise<AuthUserRecord> {
    const user = this.getUser(input.userId);
    const updated: AuthUserRecord = {
      ...user,
      email: input.email,
      role: input.role ?? user.role,
    };
    this.users = this.users.map((item) => (item.id === user.id ? updated : item));

    return updated;
  }

  async getMe(userId: string): Promise<AuthMeRecord | null> {
    const user = this.users.find((item) => item.id === userId);

    if (!user) {
      return null;
    }

    const oauthAccount = this.oauthAccounts.find(
      (account) => account.userId === user.id
    );

    return {
      ...user,
      supabaseUserId: oauthAccount?.providerUserId ?? null,
    };
  }

  async findActiveDeviceBySlot(
    userId: string,
    slot: AuthDeviceSlot
  ): Promise<AuthDeviceRecord | null> {
    return (
      this.devices.find((device) => device.userId === userId && device.slot === slot) ??
      null
    );
  }

  async createAuthDevice(input: CreateAuthDeviceInput): Promise<AuthDeviceRecord> {
    const device: AuthDeviceRecord = {
      id: `device-${this.devices.length + 1}`,
      userId: input.userId,
      slot: input.slot,
      deviceIdHash: input.deviceIdHash,
      label: input.label,
    };
    this.devices.push(device);

    return device;
  }

  async updateAuthDeviceSeen(
    authDeviceId: string,
    label: string | null
  ): Promise<AuthDeviceRecord> {
    const device = this.getDevice(authDeviceId);
    const updated: AuthDeviceRecord = {
      ...device,
      label,
    };
    this.devices = this.devices.map((item) =>
      item.id === authDeviceId ? updated : item
    );

    return updated;
  }

  async replaceAuthDevice(): Promise<void> {}

  async revokeActiveSessionsByDevice(): Promise<void> {}

  async createAuthSession(input: CreateAuthSessionInput): Promise<AuthSessionRecord> {
    const session: AuthSessionRecord = {
      id: `session-${this.sessions.length + 1}`,
      userId: input.userId,
      status: "ACTIVE",
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
    };
    this.sessions.push(session);

    return session;
  }

  async findSessionByIdWithUser(): Promise<{
    session: AuthSessionRecord;
    user: CurrentUserContext;
  } | null> {
    return null;
  }

  async findSessionByRefreshTokenHash(): Promise<{
    session: AuthSessionRecord;
    user: CurrentUserContext;
  } | null> {
    return null;
  }

  async rotateRefreshToken(): Promise<void> {}

  async revokeSession(): Promise<void> {}

  private getUser(userId: string): AuthUserRecord {
    const user = this.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error(`Missing fake user: ${userId}`);
    }

    return user;
  }

  private getDevice(authDeviceId: string): AuthDeviceRecord {
    const device = this.devices.find((item) => item.id === authDeviceId);

    if (!device) {
      throw new Error(`Missing fake device: ${authDeviceId}`);
    }

    return device;
  }
}

describe("ExchangeExternalAuthTokenUseCase", () => {
  it("creates an initial admin user, device, and session", async () => {
    const repository = new FakeAuthRepository();
    const useCase = createUseCase(repository, {
      email: "Admin@Example.com",
      name: "Admin User",
    });

    const result = await useCase.execute({
      supabaseAccessToken: "supabase-token",
      deviceSlot: "personal_laptop",
      deviceId: "stable-device-id",
      deviceLabel: "개인 노트북 Chrome",
      replaceExistingDevice: false,
      userAgent: "Jest",
      ipAddress: "127.0.0.1",
    });

    expect(result.response.accessToken).toBe("app-access-token");
    expect(result.response.user.role).toBe("ADMIN");
    expect(result.response.user.email).toBe("admin@example.com");
    expect(result.response.device?.slot).toBe("personal_laptop");
    expect(result.refreshToken).toBe("refresh-token");
    expect(repository.users).toHaveLength(1);
    expect(repository.devices).toHaveLength(1);
    expect(repository.sessions).toHaveLength(1);
    expect(repository.sessions[0]?.refreshTokenHash).toBe(
      "hash:refresh:refresh-token"
    );
  });

  it("rejects a different active device in the same slot without replacement", async () => {
    const repository = new FakeAuthRepository();
    repository.users.push({
      id: "user-1",
      email: "user@example.com",
      displayName: "User",
      role: "USER",
      status: "ACTIVE",
      deletedAt: null,
    });
    repository.oauthAccounts.push({
      id: "oauth-1",
      userId: "user-1",
      provider: "google",
      providerUserId: "external-user-1",
    });
    repository.devices.push({
      id: "device-1",
      userId: "user-1",
      slot: "work_laptop",
      deviceIdHash: "hash:device:other-device-id",
      label: "회사 노트북",
    });
    const useCase = createUseCase(repository, {
      email: "user@example.com",
      name: "User",
    });

    await expect(
      useCase.execute({
        supabaseAccessToken: "supabase-token",
        deviceSlot: "work_laptop",
        deviceId: "stable-device-id",
        deviceLabel: "새 회사 노트북",
        replaceExistingDevice: false,
        userAgent: "Jest",
        ipAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(DeviceSlotAlreadyRegisteredError);
    expect(repository.sessions).toHaveLength(0);
  });
});

function createUseCase(
  repository: FakeAuthRepository,
  user: { readonly email: string; readonly name: string | null }
): ExchangeExternalAuthTokenUseCase {
  return new ExchangeExternalAuthTokenUseCase(
    new FakeExternalAuthVerifier({
      provider: "google",
      providerAccountId: "external-user-1",
      authUserId: "external-user-1",
      email: user.email,
      name: user.name,
    }),
    repository,
    new FakeAppTokenIssuer(),
    new FakeSecureTokenService(),
    new ConfigService({
      INITIAL_ADMIN_EMAILS: "admin@example.com",
      APP_SESSION_TTL_DAYS: "7",
    })
  );
}

