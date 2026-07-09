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
import {
  ExchangeExternalAuthTokenUseCase,
  type ExchangeExternalAuthTokenCommand,
} from "./exchange-external-auth-token.use-case";

// 역할 : FakeExternalAuthVerifier 클래스가 맡은 백엔드 책임을 구현합니다.
class FakeExternalAuthVerifier implements ExternalAuthVerifier {
  // 기능 : 테스트에서 반환할 외부 인증 사용자 정보를 주입받습니다.
  constructor(private readonly verifiedUser: VerifiedExternalUser) {}

  // 기능 : 테스트용 외부 인증 사용자 정보를 반환합니다.
  async verifyAccessToken(): Promise<VerifiedExternalUser> {
    return this.verifiedUser;
  }
}

// 역할 : FakeAppTokenIssuer 클래스가 맡은 백엔드 책임을 구현합니다.
class FakeAppTokenIssuer implements AppTokenIssuer {
  // 기능 : 테스트용 고정 앱 access token 발급 결과를 반환합니다.
  async issueAccessToken() {
    return {
      accessToken: "app-access-token",
      accessTokenExpiresAt: new Date("2026-06-06T00:15:00.000Z"),
    };
  }

  // 기능 : 테스트용 고정 앱 access token payload를 반환합니다.
  async verifyAccessToken() {
    return {
      userId: "user-1",
      sessionId: "session-1",
    };
  }
}

// 역할 : FakeSecureTokenService 공통 기능 또는 application 서비스를 제공합니다.
class FakeSecureTokenService implements SecureTokenService {
  // 기능 : 테스트용 고정 refresh token을 생성합니다.
  createToken(): string {
    return "refresh-token";
  }

  // 기능 : 테스트에서 비교 가능한 고정 해시 문자열을 생성합니다.
  hash(value: string): string {
    return `hash:${value}`;
  }
}

// 역할 : FakeAuthRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
class FakeAuthRepository implements AuthRepository {
  users: AuthUserRecord[] = [];
  oauthAccounts: AuthOAuthAccountRecord[] = [];
  devices: AuthDeviceRecord[] = [];
  sessions: AuthSessionRecord[] = [];

  // 기능 : 테스트 트랜잭션 작업을 현재 fake 저장소로 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: AuthRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  // 기능 : fake OAuth 계정 목록에서 제공자와 계정 ID가 일치하는 계정을 조회합니다.
  async findOAuthAccount(
    provider: ExternalAuthProvider,
    providerUserId: string
  ): Promise<AuthOAuthAccountRecord | null> {
    return (
      this.oauthAccounts.find(
        // 기능 : provider와 providerUserId가 모두 일치하는 fake OAuth 계정을 찾습니다.
        (account) =>
          account.provider === provider && account.providerUserId === providerUserId
      ) ?? null
    );
  }

  // 기능 : fake OAuth 계정의 providerUserId를 안정 식별자로 갱신합니다.
  async updateOAuthAccountProviderUserId(
    oauthAccountId: string,
    providerUserId: string
  ): Promise<AuthOAuthAccountRecord> {
    const account = this.oauthAccounts.find((item) => item.id === oauthAccountId);

    if (!account) {
      throw new Error(`Missing fake OAuth account: ${oauthAccountId}`);
    }

    const updated: AuthOAuthAccountRecord = {
      ...account,
      providerUserId,
    };
    this.oauthAccounts = this.oauthAccounts.map((item) =>
      item.id === oauthAccountId ? updated : item
    );

    return updated;
  }

  // 기능 : fake 사용자와 OAuth 계정을 생성해 메모리 목록에 저장합니다.
  async createUserWithOAuthAccount(
    input: CreateAuthUserInput
  ): Promise<AuthUserRecord> {
    const user: AuthUserRecord = {
      id: `user-${this.users.length + 1}`,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      status: "ACTIVE",
      timeZone: input.timeZone,
      preferredLocale: input.preferredLocale,
      signupLocale: input.signupLocale,
      signupCountryCode: input.signupCountryCode,
      signupTimeZone: input.signupTimeZone,
      lastLoginLocale: input.lastLoginLocale,
      lastLoginCountryCode: input.lastLoginCountryCode,
      lastLoginTimeZone: input.lastLoginTimeZone,
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

  // 기능 : fake 사용자의 이메일과 역할을 로그인 결과로 갱신합니다.
  async updateUserAfterLogin(input: UpdateUserLoginInput): Promise<AuthUserRecord> {
    const user = this.getUser(input.userId);
    const updated: AuthUserRecord = {
      ...user,
      email: input.email,
      role: input.role ?? user.role,
      lastLoginLocale: input.lastLoginLocale,
      lastLoginCountryCode: input.lastLoginCountryCode,
      lastLoginTimeZone: input.lastLoginTimeZone,
    };
    // 기능 : 갱신 대상 사용자만 교체한 fake 사용자 목록을 만듭니다.
    this.users = this.users.map((item) => (item.id === user.id ? updated : item));

    return updated;
  }

  // 기능 : fake 사용자 목록에서 내 정보 응답용 사용자와 OAuth 계정을 조회합니다.
  async getMe(userId: string): Promise<AuthMeRecord | null> {
    // 기능 : userId와 일치하는 fake 사용자를 찾습니다.
    const user = this.users.find((item) => item.id === userId);

    if (!user) {
      return null;
    }

    const oauthAccount = this.oauthAccounts.find(
      // 기능 : fake 사용자에 연결된 OAuth 계정을 찾습니다.
      (account) => account.userId === user.id
    );

    return {
      ...user,
      supabaseUserId: oauthAccount?.providerUserId ?? null,
    };
  }

  // 기능 : fake 기기 목록에서 사용자와 슬롯이 일치하는 활성 기기를 조회합니다.
  async findActiveDeviceBySlot(
    userId: string,
    slot: AuthDeviceSlot
  ): Promise<AuthDeviceRecord | null> {
    return (
      // 기능 : userId와 slot이 모두 일치하는 fake 기기를 찾습니다.
      this.devices.find((device) => device.userId === userId && device.slot === slot) ??
      null
    );
  }

  // 기능 : fake 인증 기기를 생성해 메모리 목록에 저장합니다.
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

  // 기능 : fake 인증 기기의 라벨을 갱신합니다.
  async updateAuthDeviceSeen(
    authDeviceId: string,
    label: string | null
  ): Promise<AuthDeviceRecord> {
    const device = this.getDevice(authDeviceId);
    const updated: AuthDeviceRecord = {
      ...device,
      label,
    };
    this.devices = this.devices.map(
      // 기능 : 갱신 대상 기기만 교체한 fake 기기 목록을 만듭니다.
      (item) => (item.id === authDeviceId ? updated : item)
    );

    return updated;
  }

  // 기능 : 현재 테스트에서 별도 동작 없이 기기 교체 호출을 수용합니다.
  async replaceAuthDevice(): Promise<void> {}

  // 기능 : 현재 테스트에서 별도 동작 없이 기기 세션 폐기 호출을 수용합니다.
  async revokeActiveSessionsByDevice(): Promise<void> {}

  // 기능 : fake 인증 세션을 생성해 메모리 목록에 저장합니다.
  async createAuthSession(input: CreateAuthSessionInput): Promise<AuthSessionRecord> {
    const session: AuthSessionRecord = {
      id: `session-${this.sessions.length + 1}`,
      userId: input.userId,
      authDeviceId: input.authDeviceId,
      status: "ACTIVE",
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
    };
    this.sessions.push(session);

    return session;
  }

  // 기능 : fake 세션 목록에서 기기에 연결된 활성 세션을 조회합니다.
  async findActiveSessionByDevice(
    authDeviceId: string,
    now: Date
  ): Promise<AuthSessionRecord | null> {
    return (
      this.sessions.find(
        (session) =>
          session.authDeviceId === authDeviceId &&
          session.status === "ACTIVE" &&
          session.expiresAt > now
      ) ?? null
    );
  }

  // 기능 : 현재 테스트에서 사용하지 않는 세션 ID 조회를 null로 처리합니다.
  async findSessionByIdWithUser(): Promise<{
    session: AuthSessionRecord;
    user: CurrentUserContext;
  } | null> {
    return null;
  }

  // 기능 : 현재 테스트에서 사용하지 않는 refresh token 세션 조회를 null로 처리합니다.
  async findSessionByRefreshTokenHash(): Promise<{
    session: AuthSessionRecord;
    user: CurrentUserContext;
  } | null> {
    return null;
  }

  // 기능 : fake 세션의 refresh token과 만료 시각을 갱신합니다.
  async rotateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    this.sessions = this.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            refreshTokenHash,
            expiresAt,
          }
        : session
    );
  }

  // 기능 : 현재 테스트에서 별도 동작 없이 세션 폐기 호출을 수용합니다.
  async revokeSession(): Promise<void> {}

  // 기능 : fake 사용자 목록에서 지정 사용자 ID의 레코드를 가져옵니다.
  private getUser(userId: string): AuthUserRecord {
    // 기능 : userId와 일치하는 fake 사용자 레코드를 찾습니다.
    const user = this.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error(`Missing fake user: ${userId}`);
    }

    return user;
  }

  // 기능 : fake 기기 목록에서 지정 기기 ID의 레코드를 가져옵니다.
  private getDevice(authDeviceId: string): AuthDeviceRecord {
    // 기능 : authDeviceId와 일치하는 fake 기기 레코드를 찾습니다.
    const device = this.devices.find((item) => item.id === authDeviceId);

    if (!device) {
      throw new Error(`Missing fake device: ${authDeviceId}`);
    }

    return device;
  }
}

function makeAuthUser(overrides: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    id: "user-1",
    email: "user@example.com",
    displayName: "User",
    role: "USER",
    status: "ACTIVE",
    timeZone: "Asia/Seoul",
    preferredLocale: "ko-KR",
    signupLocale: "ko-KR",
    signupCountryCode: "KR",
    signupTimeZone: "Asia/Seoul",
    lastLoginLocale: "ko-KR",
    lastLoginCountryCode: "KR",
    lastLoginTimeZone: "Asia/Seoul",
    deletedAt: null,
    ...overrides,
  };
}

function makeExchangeCommand(
  overrides: Partial<ExchangeExternalAuthTokenCommand> = {}
): ExchangeExternalAuthTokenCommand {
  return {
    supabaseAccessToken: "supabase-token",
    deviceSlot: "personal_laptop",
    deviceId: "stable-device-id",
    deviceLabel: "개인 노트북 Chrome",
    replaceExistingDevice: false,
    locale: "ko-KR",
    timeZone: "Asia/Seoul",
    countryCode: "KR",
    userAgent: "Jest",
    ipAddress: "127.0.0.1",
    ...overrides,
  };
}

// 기능 : ExchangeExternalAuthTokenUseCase의 사용자, 기기, 세션 생성 시나리오를 테스트합니다.
describe("ExchangeExternalAuthTokenUseCase", () => {
  // 기능 : 초기 관리자 사용자의 첫 로그인 시 생성 흐름을 검증합니다.
  it("creates an initial admin user, device, and session", async () => {
    const repository = new FakeAuthRepository();
    const useCase = createUseCase(repository, {
      email: "Admin@Example.com",
      name: "Admin User",
    });

    const result = await useCase.execute(makeExchangeCommand());

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

  // 기능 : 동일 슬롯에 다른 활성 기기가 있을 때 교체 옵션 없이는 거부되는지 검증합니다.
  it("rejects a different active device in the same slot without replacement", async () => {
    const repository = new FakeAuthRepository();
    repository.users.push(
      makeAuthUser({
        email: "user@example.com",
        displayName: "User",
      })
    );
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
      useCase.execute(
        makeExchangeCommand({
          deviceSlot: "work_laptop",
          deviceLabel: "새 회사 노트북",
        })
      )
    ).rejects.toBeInstanceOf(DeviceSlotAlreadyRegisteredError);
    expect(repository.sessions).toHaveLength(0);
  });

  // 기능 : 같은 기기의 반복 token exchange가 AuthSession row를 늘리지 않는지 검증합니다.
  it("reuses the active session for repeated exchanges from the same device", async () => {
    const repository = new FakeAuthRepository();
    const useCase = createUseCase(repository, {
      email: "user@example.com",
      name: "User",
    });
    const command = makeExchangeCommand();

    const first = await useCase.execute(command);
    const second = await useCase.execute(command);

    expect(first.response.accessToken).toBe("app-access-token");
    expect(second.response.accessToken).toBe("app-access-token");
    expect(repository.devices).toHaveLength(1);
    expect(repository.sessions).toHaveLength(1);
    expect(repository.sessions[0]?.id).toBe("session-1");
  });

  // 기능 : 기존 사용자의 명시 설정 시간대는 로그인 환경 메타데이터로 덮어쓰지 않습니다.
  it("preserves the existing user timezone while updating last login metadata", async () => {
    const repository = new FakeAuthRepository();
    repository.users.push(
      makeAuthUser({
        email: "user@example.com",
        displayName: "User",
        timeZone: "America/New_York",
        lastLoginTimeZone: "America/New_York",
      })
    );
    repository.oauthAccounts.push({
      id: "oauth-1",
      userId: "user-1",
      provider: "google",
      providerUserId: "external-user-1",
    });
    const useCase = createUseCase(repository, {
      email: "user@example.com",
      name: "User",
    });

    const result = await useCase.execute(
      makeExchangeCommand({
        locale: "ko-KR",
        timeZone: "Asia/Seoul",
        countryCode: "KR",
      })
    );

    expect(result.response.user.timeZone).toBe("America/New_York");
    expect(result.response.user.lastLoginLocale).toBe("ko-KR");
    expect(result.response.user.lastLoginCountryCode).toBe("KR");
    expect(result.response.user.lastLoginTimeZone).toBe("Asia/Seoul");
    expect(repository.users[0]?.timeZone).toBe("America/New_York");
  });

  // 기능 : 기존 Supabase user id 기반 OAuth 매핑을 provider 계정 ID 기반 매핑으로 승격합니다.
  it("upgrades a legacy Supabase auth id OAuth mapping to the provider account id", async () => {
    const repository = new FakeAuthRepository();
    repository.users.push(
      makeAuthUser({
        email: "user@example.com",
        displayName: "User",
      })
    );
    repository.oauthAccounts.push({
      id: "oauth-1",
      userId: "user-1",
      provider: "google",
      providerUserId: "supabase-auth-user-1",
    });
    const useCase = createUseCase(
      repository,
      {
        email: "user@example.com",
        name: "User",
      },
      {
        authUserId: "supabase-auth-user-1",
        providerAccountId: "google-provider-user-1",
      }
    );

    await useCase.execute(makeExchangeCommand());

    expect(repository.users).toHaveLength(1);
    expect(repository.oauthAccounts).toHaveLength(1);
    expect(repository.oauthAccounts[0]?.providerUserId).toBe(
      "google-provider-user-1"
    );
  });
});

// 기능 : ExchangeExternalAuthTokenUseCase 테스트 인스턴스를 생성합니다.
function createUseCase(
  repository: FakeAuthRepository,
  user: { readonly email: string; readonly name: string | null },
  externalIds: {
    readonly authUserId?: string;
    readonly providerAccountId?: string;
  } = {}
): ExchangeExternalAuthTokenUseCase {
  return new ExchangeExternalAuthTokenUseCase(
    new FakeExternalAuthVerifier({
      provider: "google",
      providerAccountId: externalIds.providerAccountId ?? "external-user-1",
      authUserId: externalIds.authUserId ?? "external-user-1",
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
