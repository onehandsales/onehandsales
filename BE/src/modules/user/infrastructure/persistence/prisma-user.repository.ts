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

// 역할 : PrismaUserRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaUserRepository implements UserRepository {
  // 기능 : 사용자 DB 작업에 사용할 Prisma 서비스를 주입받습니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 사용자 ID로 개인 정보와 연결된 OAuth 계정 목록을 조회합니다.
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

  // 기능 : 사용자 프로필 수정 값을 저장하고 갱신된 프로필을 조회합니다.
  async updateProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord | null> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { displayName: input.name } : {}),
        ...(input.timeZone !== undefined ? { timeZone: input.timeZone } : {}),
        ...(input.preferredLocale !== undefined
          ? { preferredLocale: input.preferredLocale }
          : {}),
      },
    });

    return this.getProfile(userId);
  }

  // 기능 : 현재 사용자의 활성 등록 기기 목록과 현재 세션 포함 여부를 조회합니다.
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

    // 기능 : Prisma 기기 목록을 사용자 등록 기기 응답 목록으로 변환합니다.
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
        // 기능 : 기기 세션 중 현재 요청 세션과 일치하는 항목을 찾습니다.
        (session) => session.id === currentSessionId
      ),
    }));
  }

  // 기능 : Prisma 사용자 행을 사용자 프로필 응답 레코드로 변환합니다.
  private mapProfile(user: {
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
      timeZone: user.timeZone,
      preferredLocale: user.preferredLocale,
      signupLocale: user.signupLocale,
      signupCountryCode: user.signupCountryCode,
      signupTimeZone: user.signupTimeZone,
      lastLoginLocale: user.lastLoginLocale,
      lastLoginCountryCode: user.lastLoginCountryCode,
      lastLoginTimeZone: user.lastLoginTimeZone,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      oauthAccounts: user.oauthAccounts.map(
        // 기능 : OAuth 계정 행을 프로필 응답 요약으로 변환합니다.
        (account) => this.mapOAuthAccount(account)
      ),
    };
  }

  // 기능 : Prisma OAuth 계정 행을 사용자 프로필의 OAuth 요약으로 변환합니다.
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

  // 기능 : Prisma OAuth 제공자 enum을 사용자 응답 제공자 값으로 변환합니다.
  private fromPrismaProvider(
    provider: OAuthProvider
  ): UserOAuthAccountSummary["provider"] {
    switch (provider) {
      case OAuthProvider.GOOGLE:
        return "google";
      case OAuthProvider.KAKAO:
      case OAuthProvider.APPLE:
        return "legacy_oauth";
    }
  }

  // 기능 : Prisma 기기 슬롯 enum을 사용자 응답 기기 슬롯 값으로 변환합니다.
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

  // 기능 : Prisma 기기 상태 enum을 사용자 응답 기기 상태 값으로 변환합니다.
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

  // 기능 : Prisma 사용자 역할 enum을 사용자 프로필 역할 값으로 변환합니다.
  private fromPrismaUserRole(role: UserRole): UserProfileRole {
    switch (role) {
      case UserRole.USER:
        return "USER";
      case UserRole.ADMIN:
        return "ADMIN";
    }
  }

  // 기능 : Prisma 사용자 상태 enum을 사용자 프로필 상태 값으로 변환합니다.
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
