import {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  OAuthProvider,
  UserRole,
  UserStatus,
} from "@prisma/client";
import {
  type UpdateUserProfileInput,
  type UserDeviceRecord,
  type UserDeviceSlot,
  type UserDeviceStatus,
  type UserOAuthAccountSummary,
  type UserProfileRecord,
  type UserProfileRole,
  type UserProfileStatus,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileRecord | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return user ? this.mapProfile(user) : null;
  }

  async updateProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord | null> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { displayName: input.name } : {}),
      },
    });

    return this.getProfile(userId);
  }

  async listActiveDevices(
    userId: string,
    currentSessionId: string,
    now: Date
  ): Promise<UserDeviceRecord[]> {
    const devices = await this.prismaService.authDevice.findMany({
      where: {
        userId,
        status: AuthDeviceStatus.ACTIVE,
      },
      include: {
        sessions: {
          where: {
            status: AuthSessionStatus.ACTIVE,
            revokedAt: null,
            expiresAt: {
              gt: now,
            },
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ deviceSlot: "asc" }, { createdAt: "asc" }],
    });

    return devices.map((device) => ({
      id: device.id,
      slot: this.fromPrismaDeviceSlot(device.deviceSlot),
      label: device.label,
      status: this.fromPrismaDeviceStatus(device.status),
      lastSeenAt: device.lastSeenAt,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
      activeSessionCount: device.sessions.length,
      isCurrentDevice: device.sessions.some(
        (session) => session.id === currentSessionId
      ),
    }));
  }

  private mapProfile(user: {
    readonly id: string;
    readonly email: string | null;
    readonly displayName: string | null;
    readonly role: UserRole;
    readonly status: UserStatus;
    readonly lastLoginAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly oauthAccounts: Array<{
      readonly id: string;
      readonly provider: OAuthProvider;
      readonly providerEmail: string | null;
      readonly createdAt: Date;
    }>;
  }): UserProfileRecord {
    return {
      id: user.id,
      email: user.email,
      name: user.displayName,
      role: this.fromPrismaUserRole(user.role),
      status: this.fromPrismaUserStatus(user.status),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      oauthAccounts: user.oauthAccounts.map((account) =>
        this.mapOAuthAccount(account)
      ),
    };
  }

  private mapOAuthAccount(account: {
    readonly id: string;
    readonly provider: OAuthProvider;
    readonly providerEmail: string | null;
    readonly createdAt: Date;
  }): UserOAuthAccountSummary {
    return {
      id: account.id,
      provider: this.fromPrismaProvider(account.provider),
      providerEmail: account.providerEmail,
      createdAt: account.createdAt,
    };
  }

  private fromPrismaProvider(
    provider: OAuthProvider
  ): UserOAuthAccountSummary["provider"] {
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

  private fromPrismaDeviceSlot(slot: AuthDeviceSlot): UserDeviceSlot {
    switch (slot) {
      case AuthDeviceSlot.MOBILE:
        return "mobile";
      case AuthDeviceSlot.PERSONAL_LAPTOP:
        return "personal_laptop";
      case AuthDeviceSlot.WORK_LAPTOP:
        return "work_laptop";
    }
  }

  private fromPrismaDeviceStatus(status: AuthDeviceStatus): UserDeviceStatus {
    switch (status) {
      case AuthDeviceStatus.ACTIVE:
        return "ACTIVE";
      case AuthDeviceStatus.REPLACED:
        return "REPLACED";
      case AuthDeviceStatus.REVOKED:
        return "REVOKED";
    }
  }

  private fromPrismaUserRole(role: UserRole): UserProfileRole {
    switch (role) {
      case UserRole.USER:
        return "USER";
      case UserRole.ADMIN:
        return "ADMIN";
    }
  }

  private fromPrismaUserStatus(status: UserStatus): UserProfileStatus {
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
