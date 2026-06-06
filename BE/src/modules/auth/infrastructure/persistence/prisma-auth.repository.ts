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
  readonly deletedAt: Date | null;
};

export class PrismaAuthRepository implements AuthRepository {
  constructor(
    private readonly client: AuthPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repository: AuthRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAuthRepository(transaction, null));
    });
  }

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
        lastLoginAt: now,
        oauthAccounts: {
          create: {
            provider: this.toPrismaProvider(input.provider),
            providerUserId: input.providerUserId,
            providerEmail: input.providerEmail,
          },
        },
        setting: {
          create: {},
        },
      },
    });

    return this.mapUser(user);
  }

  async updateUserAfterLogin(
    input: UpdateUserLoginInput,
    now: Date
  ): Promise<AuthUserRecord> {
    const data: Prisma.UserUpdateInput = {
      email: input.email,
      displayName: input.displayName,
      lastLoginAt: now,
    };

    if (input.role) {
      data.role = input.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
    }

    const user = await this.client.user.update({
      where: { id: input.userId },
      data,
    });

    await this.client.userSetting.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    return this.mapUser(user);
  }

  async getMe(userId: string): Promise<AuthMeRecord | null> {
    const user = await this.client.user.findUnique({
      where: { id: userId },
      include: {
        setting: true,
        oauthAccounts: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    const setting =
      user.setting ??
      (await this.client.userSetting.create({
        data: { userId: user.id },
      }));
    const firstOauthAccount = user.oauthAccounts[0];

    return {
      ...this.mapUser(user),
      supabaseUserId: firstOauthAccount?.providerUserId ?? null,
      settings: {
        sensitiveWarningEnabled: setting.sensitiveSaveWarningEnabled,
        defaultReminderMinutes: setting.defaultScheduleReminderMinutes,
        emailNotificationEnabled: setting.emailNotificationEnabled,
        browserPushEnabled: setting.browserPushEnabled,
      },
    };
  }

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

  async replaceAuthDevice(authDeviceId: string, now: Date): Promise<void> {
    await this.client.authDevice.update({
      where: { id: authDeviceId },
      data: {
        status: AuthDeviceStatus.REPLACED,
        replacedAt: now,
      },
    });
  }

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

  async revokeSession(sessionId: string, now: Date): Promise<void> {
    await this.client.authSession.update({
      where: { id: sessionId },
      data: {
        status: AuthSessionStatus.REVOKED,
        revokedAt: now,
      },
    });
  }

  private mapUser(user: UserRow): AuthUserRecord {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: this.fromPrismaUserRole(user.role),
      status: this.fromPrismaUserStatus(user.status),
      deletedAt: user.deletedAt,
    };
  }

  private mapCurrentUser(user: UserRow, sessionId: string): CurrentUserContext {
    return {
      id: user.id,
      sessionId,
      email: user.email,
      displayName: user.displayName,
      role: this.fromPrismaUserRole(user.role),
      status: this.fromPrismaUserStatus(user.status),
    };
  }

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

  private mapSession(session: {
    readonly id: string;
    readonly userId: string;
    readonly status: AuthSessionStatus;
    readonly refreshTokenHash: string | null;
    readonly expiresAt: Date;
    readonly revokedAt: Date | null;
  }): AuthSessionRecord {
    return {
      id: session.id,
      userId: session.userId,
      status: session.status,
      refreshTokenHash: session.refreshTokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };
  }

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

  private fromPrismaUserRole(role: UserRole): AuthUserRole {
    switch (role) {
      case UserRole.USER:
        return "USER";
      case UserRole.ADMIN:
        return "ADMIN";
    }
  }

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
