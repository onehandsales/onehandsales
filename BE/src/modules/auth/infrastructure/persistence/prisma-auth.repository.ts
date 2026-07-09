import {
  AuthDeviceSlot as PrismaAuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  OAuthProvider,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";
import {
  type AuthDeviceRecord,
  type AuthDeviceSlot,
  type AuthMeRecord,
  type AuthOAuthAccountRecord,
  type AuthRepository,
  type AuthSessionRecord,
  type AuthUserRecord,
  type AuthUserRole,
  type AuthUserStatus,
  type CreateAuthDeviceInput,
  type CreateAuthSessionInput,
  type CreateAuthUserInput,
  type UpdateUserLoginInput,
} from "@/modules/auth/application/ports/auth.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { ExternalAuthProvider } from "@/shared/application/ports/external-auth-verifier.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type AuthPrismaClient = PrismaService | Prisma.TransactionClient;

type UserRow = {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly timeZone: string;
  readonly preferredLocale: string;
  readonly signupLocale: string | null;
  readonly signupCountryCode: string | null;
  readonly signupTimeZone: string | null;
  readonly lastLoginLocale: string | null;
  readonly lastLoginCountryCode: string | null;
  readonly lastLoginTimeZone: string | null;
  readonly deletedAt: Date | null;
};

// 역할 : PrismaAuthRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaAuthRepository implements AuthRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: AuthPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 인증 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AuthRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 인증 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAuthRepository(transaction, null));
    });
  }

  // 기능 : OAuth 제공자와 제공자 사용자 ID로 연결된 OAuth 계정을 조회합니다.
  async findOAuthAccount(
    provider: ExternalAuthProvider,
    providerUserId: string
  ): Promise<AuthOAuthAccountRecord | null> {
    const account = await this.client.userOAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: this.toPrismaProvider(provider),
          providerUserId,
        },
      },
    });

    return account
      ? {
          id: account.id,
          userId: account.userId,
          provider: this.fromPrismaProvider(account.provider),
          providerUserId: account.providerUserId,
        }
      : null;
  }

  // 기능 : 기존 OAuth 계정의 provider 사용자 식별자를 갱신합니다.
  async updateOAuthAccountProviderUserId(
    oauthAccountId: string,
    providerUserId: string,
    now: Date
  ): Promise<AuthOAuthAccountRecord> {
    const account = await this.client.userOAuthAccount.update({
      where: { id: oauthAccountId },
      data: {
        providerUserId,
        updatedAt: now,
      },
    });

    return {
      id: account.id,
      userId: account.userId,
      provider: this.fromPrismaProvider(account.provider),
      providerUserId: account.providerUserId,
    };
  }

  // 기능 : 신규 사용자와 OAuth 계정을 하나의 생성 작업으로 저장합니다.
  async createUserWithOAuthAccount(
    input: CreateAuthUserInput,
    now: Date
  ): Promise<AuthUserRecord> {
    const user = await this.client.user.create({
      data: {
        email: input.email,
        displayName: input.displayName,
        role: input.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
        status: UserStatus.ACTIVE,
        timeZone: input.timeZone,
        preferredLocale: input.preferredLocale,
        signupLocale: input.signupLocale,
        signupCountryCode: input.signupCountryCode,
        signupTimeZone: input.signupTimeZone,
        lastLoginLocale: input.lastLoginLocale,
        lastLoginCountryCode: input.lastLoginCountryCode,
        lastLoginTimeZone: input.lastLoginTimeZone,
        lastLoginAt: now,
        oauthAccounts: {
          create: {
            provider: this.toPrismaProvider(input.provider),
            providerUserId: input.providerUserId,
            providerEmail: input.providerEmail,
          },
        },
      },
    });

    return this.mapUser(user);
  }

  // 기능 : 로그인 시 사용자 이메일, 역할, 마지막 로그인 시간을 갱신합니다.
  async updateUserAfterLogin(
    input: UpdateUserLoginInput,
    now: Date
  ): Promise<AuthUserRecord> {
    const data: Prisma.UserUpdateInput = {
      email: input.email,
      lastLoginLocale: input.lastLoginLocale,
      lastLoginCountryCode: input.lastLoginCountryCode,
      lastLoginTimeZone: input.lastLoginTimeZone,
      lastLoginAt: now,
    };

    if (input.role) {
      data.role = input.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
    }

    const user = await this.client.user.update({
      where: { id: input.userId },
      data,
    });

    return this.mapUser(user);
  }

  // 기능 : 사용자 ID로 인증 응답에 필요한 내 정보와 대표 OAuth 계정을 조회합니다.
  async getMe(userId: string): Promise<AuthMeRecord | null> {
    const user = await this.client.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    const firstOauthAccount = user.oauthAccounts[0];

    return {
      ...this.mapUser(user),
      supabaseUserId: firstOauthAccount?.providerUserId ?? null,
    };
  }

  // 기능 : 사용자와 기기 슬롯 기준으로 활성 등록 기기를 조회합니다.
  async findActiveDeviceBySlot(
    userId: string,
    slot: AuthDeviceSlot
  ): Promise<AuthDeviceRecord | null> {
    const device = await this.client.authDevice.findFirst({
      where: {
        userId,
        deviceSlot: this.toPrismaDeviceSlot(slot),
        status: AuthDeviceStatus.ACTIVE,
      },
      orderBy: { createdAt: "desc" },
    });

    return device ? this.mapDevice(device) : null;
  }

  // 기능 : 인증용 등록 기기 레코드를 생성합니다.
  async createAuthDevice(
    input: CreateAuthDeviceInput
  ): Promise<AuthDeviceRecord> {
    const device = await this.client.authDevice.create({
      data: {
        userId: input.userId,
        deviceSlot: this.toPrismaDeviceSlot(input.slot),
        deviceIdHash: input.deviceIdHash,
        label: input.label,
        status: AuthDeviceStatus.ACTIVE,
        lastSeenAt: input.now,
      },
    });

    return this.mapDevice(device);
  }

  // 기능 : 등록 기기의 라벨과 마지막 사용 시각을 갱신합니다.
  async updateAuthDeviceSeen(
    authDeviceId: string,
    label: string | null,
    now: Date
  ): Promise<AuthDeviceRecord> {
    const device = await this.client.authDevice.update({
      where: { id: authDeviceId },
      data: {
        label,
        lastSeenAt: now,
      },
    });

    return this.mapDevice(device);
  }

  // 기능 : 기존 등록 기기를 교체 상태로 변경합니다.
  async replaceAuthDevice(authDeviceId: string, now: Date): Promise<void> {
    await this.client.authDevice.update({
      where: { id: authDeviceId },
      data: {
        status: AuthDeviceStatus.REPLACED,
        replacedAt: now,
      },
    });
  }

  // 기능 : 특정 등록 기기에 연결된 활성 세션을 모두 폐기합니다.
  async revokeActiveSessionsByDevice(
    authDeviceId: string,
    now: Date
  ): Promise<void> {
    await this.client.authSession.updateMany({
      where: {
        authDeviceId,
        status: AuthSessionStatus.ACTIVE,
      },
      data: {
        status: AuthSessionStatus.REVOKED,
        revokedAt: now,
      },
    });
  }

  // 기능 : refresh token 기반 인증 세션을 생성합니다.
  async createAuthSession(
    input: CreateAuthSessionInput
  ): Promise<AuthSessionRecord> {
    const session = await this.client.authSession.create({
      data: {
        userId: input.userId,
        authDeviceId: input.authDeviceId,
        status: AuthSessionStatus.ACTIVE,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent,
        ipAddressHash: input.ipAddressHash,
        lastUsedAt: input.now,
      },
    });

    return this.mapSession(session);
  }

  // 기능 : 기기에 연결된 만료되지 않은 활성 세션을 최신순으로 조회합니다.
  async findActiveSessionByDevice(
    authDeviceId: string,
    now: Date
  ): Promise<AuthSessionRecord | null> {
    const session = await this.client.authSession.findFirst({
      where: {
        authDeviceId,
        status: AuthSessionStatus.ACTIVE,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return session ? this.mapSession(session) : null;
  }

  // 기능 : 세션 ID로 세션과 현재 사용자 컨텍스트를 함께 조회합니다.
  async findSessionByIdWithUser(
    sessionId: string
  ): Promise<{ session: AuthSessionRecord; user: CurrentUserContext } | null> {
    const session = await this.client.authSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    return {
      session: this.mapSession(session),
      user: this.mapCurrentUser(session.user, session.id),
    };
  }

  // 기능 : refresh token 해시로 활성 세션과 현재 사용자 컨텍스트를 조회합니다.
  async findSessionByRefreshTokenHash(
    refreshTokenHash: string
  ): Promise<{ session: AuthSessionRecord; user: CurrentUserContext } | null> {
    const session = await this.client.authSession.findFirst({
      where: {
        refreshTokenHash,
        status: AuthSessionStatus.ACTIVE,
      },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    return {
      session: this.mapSession(session),
      user: this.mapCurrentUser(session.user, session.id),
    };
  }

  // 기능 : 세션의 refresh token 해시, 만료 시각, 마지막 사용 시각을 갱신합니다.
  async rotateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
    now: Date
  ): Promise<void> {
    await this.client.authSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash,
        expiresAt,
        lastUsedAt: now,
      },
    });
  }

  // 기능 : 단일 인증 세션을 폐기 상태로 변경합니다.
  async revokeSession(sessionId: string, now: Date): Promise<void> {
    await this.client.authSession.update({
      where: { id: sessionId },
      data: {
        status: AuthSessionStatus.REVOKED,
        revokedAt: now,
      },
    });
  }

  // 기능 : Prisma 사용자 행을 인증 도메인 사용자 레코드로 변환합니다.
  private mapUser(user: UserRow): AuthUserRecord {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: this.fromPrismaUserRole(user.role),
      status: this.fromPrismaUserStatus(user.status),
      timeZone: user.timeZone,
      preferredLocale: user.preferredLocale,
      signupLocale: user.signupLocale,
      signupCountryCode: user.signupCountryCode,
      signupTimeZone: user.signupTimeZone,
      lastLoginLocale: user.lastLoginLocale,
      lastLoginCountryCode: user.lastLoginCountryCode,
      lastLoginTimeZone: user.lastLoginTimeZone,
      deletedAt: user.deletedAt,
    };
  }

  // 기능 : Prisma 사용자 행과 세션 ID를 현재 사용자 컨텍스트로 변환합니다.
  private mapCurrentUser(user: UserRow, sessionId: string): CurrentUserContext {
    return {
      id: user.id,
      sessionId,
      email: user.email,
      displayName: user.displayName,
      role: this.fromPrismaUserRole(user.role),
      status: this.fromPrismaUserStatus(user.status),
      timeZone: user.timeZone,
    };
  }

  // 기능 : Prisma 기기 행을 인증 도메인 기기 레코드로 변환합니다.
  private mapDevice(device: {
    readonly id: string;
    readonly userId: string;
    readonly deviceSlot: PrismaAuthDeviceSlot;
    readonly deviceIdHash: string;
    readonly label: string | null;
  }): AuthDeviceRecord {
    return {
      id: device.id,
      userId: device.userId,
      slot: this.fromPrismaDeviceSlot(device.deviceSlot),
      deviceIdHash: device.deviceIdHash,
      label: device.label,
    };
  }

  // 기능 : Prisma 세션 행을 인증 도메인 세션 레코드로 변환합니다.
  private mapSession(session: {
    readonly id: string;
    readonly userId: string;
    readonly authDeviceId: string;
    readonly status: AuthSessionStatus;
    readonly refreshTokenHash: string | null;
    readonly expiresAt: Date;
    readonly revokedAt: Date | null;
  }): AuthSessionRecord {
    return {
      id: session.id,
      userId: session.userId,
      authDeviceId: session.authDeviceId,
      status: session.status,
      refreshTokenHash: session.refreshTokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };
  }

  // 기능 : 외부 인증 제공자 값을 Prisma OAuth 제공자 enum으로 변환합니다.
  private toPrismaProvider(provider: ExternalAuthProvider): OAuthProvider {
    switch (provider) {
      case "kakao":
        return OAuthProvider.KAKAO;
      case "naver":
        return OAuthProvider.NAVER;
      case "google":
        return OAuthProvider.GOOGLE;
      case "apple":
        return OAuthProvider.APPLE;
    }
  }

  // 기능 : Prisma OAuth 제공자 enum을 외부 인증 제공자 값으로 변환합니다.
  private fromPrismaProvider(provider: OAuthProvider): ExternalAuthProvider {
    switch (provider) {
      case OAuthProvider.KAKAO:
        return "kakao";
      case OAuthProvider.NAVER:
        return "naver";
      case OAuthProvider.GOOGLE:
        return "google";
      case OAuthProvider.APPLE:
        return "apple";
    }
  }

  // 기능 : 인증 도메인 기기 슬롯 값을 Prisma 기기 슬롯 enum으로 변환합니다.
  private toPrismaDeviceSlot(slot: AuthDeviceSlot): PrismaAuthDeviceSlot {
    switch (slot) {
      case "mobile":
        return PrismaAuthDeviceSlot.MOBILE;
      case "personal_laptop":
        return PrismaAuthDeviceSlot.PERSONAL_LAPTOP;
      case "work_laptop":
        return PrismaAuthDeviceSlot.WORK_LAPTOP;
    }
  }

  // 기능 : Prisma 기기 슬롯 enum을 인증 도메인 기기 슬롯 값으로 변환합니다.
  private fromPrismaDeviceSlot(slot: PrismaAuthDeviceSlot): AuthDeviceSlot {
    switch (slot) {
      case PrismaAuthDeviceSlot.MOBILE:
        return "mobile";
      case PrismaAuthDeviceSlot.PERSONAL_LAPTOP:
        return "personal_laptop";
      case PrismaAuthDeviceSlot.WORK_LAPTOP:
        return "work_laptop";
    }
  }

  // 기능 : Prisma 사용자 역할 enum을 인증 도메인 역할 값으로 변환합니다.
  private fromPrismaUserRole(role: UserRole): AuthUserRole {
    switch (role) {
      case UserRole.USER:
        return "USER";
      case UserRole.ADMIN:
        return "ADMIN";
    }
  }

  // 기능 : Prisma 사용자 상태 enum을 인증 도메인 상태 값으로 변환합니다.
  private fromPrismaUserStatus(status: UserStatus): AuthUserStatus {
    switch (status) {
      case UserStatus.ACTIVE:
        return "ACTIVE";
      case UserStatus.SUSPENDED:
        return "SUSPENDED";
      case UserStatus.DELETED:
        return "DELETED";
    }
  }
}
