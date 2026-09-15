import {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  OAuthProvider,
  PlatformRole,
  Prisma,
  UserStatus,
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import {
  type UpdateUserProfileInput,
  type UserDeviceRecord,
  type UserDeviceSlot,
  type UserDeviceStatus,
  type UserJobSelectionOnboardingRecord,
  type UserOAuthAccountSummary,
  type UserProfileRecord,
  type UserProfilePlatformRole,
  type UserProfileStatus,
  type UserRepository,
  type WorkspaceKind,
  type WorkspaceMemberRole,
} from "@/modules/user/application/ports/user.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type UserPrismaClient = PrismaService | Prisma.TransactionClient;

type WorkspaceMemberWithWorkspaceRow = {
  readonly id: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: PrismaWorkspaceMemberRole;
  readonly joinedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly workspace: {
    readonly id: string;
    readonly name: string;
    readonly kind: PrismaWorkspaceKind;
    readonly organizationName: string | null;
    readonly organizationDomain: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
};

// 역할 : PrismaUserRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaUserRepository implements UserRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: UserPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 사용자 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: UserRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 사용자 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaUserRepository(transaction, null));
    });
  }

  // 기능 : 사용자 ID로 개인 정보와 연결된 OAuth 계정 목록을 조회합니다.
  async getProfile(userId: string): Promise<UserProfileRecord | null> {
    const user = await this.client.user.findUnique({
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
    await this.client.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { displayName: input.name } : {}),
        ...(input.timeZone !== undefined ? { timeZone: input.timeZone } : {}),
        ...(input.preferredLocale !== undefined
          ? { preferredLocale: input.preferredLocale }
          : {}),
        ...(input.countryCode !== undefined ? { countryCode: input.countryCode } : {}),
        ...(input.defaultCurrencyCode !== undefined
          ? { defaultCurrencyCode: input.defaultCurrencyCode }
          : {}),
      },
    });

    return this.getProfile(userId);
  }

  // 기능 : 현재 사용자의 직업 선택 완료 시각과 OWNER 워크스페이스 멤버십을 보장합니다.
  async completeJobSelectionOnboarding(
    userId: string,
    now: Date
  ): Promise<UserJobSelectionOnboardingRecord | null> {
    // 1. 사용자 활성 상태, 표시 이름, 기존 완료 시각을 조회한다.
    const user = await this.client.user.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
        status: true,
        jobSelectOnboardingCompletedAt: true,
      },
    });

    // 2. 존재하지 않거나 활성 사용자가 아니면 처리할 수 없음을 반환한다.
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    // 3. 현재 사용자가 OWNER로 가진 WorkspaceMember만 조회한다.
    const ownerWorkspaceMember = await this.findOwnerWorkspaceMember(userId);

    // 4. OWNER 멤버십이 없으면 개인 Workspace와 OWNER WorkspaceMember를 생성한다.
    const workspaceMember =
      ownerWorkspaceMember ??
      (await this.createOwnerWorkspaceMember(userId, user.displayName, now));

    // 5. 완료 시각이 없으면 현재 UTC instant를 저장하고, 있으면 기존 값을 유지한다.
    const jobSelectOnboardingCompletedAt =
      user.jobSelectOnboardingCompletedAt ??
      (await this.completeJobSelectionForUser(userId, now));

    // 6. 완료 시각과 OWNER 워크스페이스 정보를 응답 레코드로 반환한다.
    return this.mapJobSelectionOnboardingRecord(
      jobSelectOnboardingCompletedAt,
      workspaceMember
    );
  }

  // 기능 : 사용자가 OWNER로 참여한 첫 WorkspaceMember를 조회합니다.
  private async findOwnerWorkspaceMember(
    userId: string
  ): Promise<WorkspaceMemberWithWorkspaceRow | null> {
    return this.client.workspaceMember.findFirst({
      where: {
        userId,
        role: PrismaWorkspaceMemberRole.OWNER,
      },
      include: {
        workspace: true,
      },
      orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 신규 개인 Workspace와 현재 사용자의 OWNER 멤버십을 생성합니다.
  private async createOwnerWorkspaceMember(
    userId: string,
    displayName: string | null,
    now: Date
  ): Promise<WorkspaceMemberWithWorkspaceRow> {
    const workspace = await this.client.workspace.create({
      data: {
        name: this.buildDefaultWorkspaceName(displayName),
        kind: PrismaWorkspaceKind.PERSONAL,
      },
    });

    return this.client.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: PrismaWorkspaceMemberRole.OWNER,
        joinedAt: now,
      },
      include: {
        workspace: true,
      },
    });
  }

  // 기능 : 사용자 직업 선택 온보딩 완료 시각을 저장하고 저장된 값을 반환합니다.
  private async completeJobSelectionForUser(
    userId: string,
    now: Date
  ): Promise<Date> {
    const updatedUser = await this.client.user.update({
      where: { id: userId },
      data: {
        jobSelectOnboardingCompletedAt: now,
      },
      select: {
        jobSelectOnboardingCompletedAt: true,
      },
    });

    return updatedUser.jobSelectOnboardingCompletedAt ?? now;
  }

  // 기능 : 사용자 이름 기반 기본 Workspace 표시 이름을 만듭니다.
  private buildDefaultWorkspaceName(displayName: string | null): string {
    const normalizedDisplayName = displayName?.trim();

    if (normalizedDisplayName) {
      return `${normalizedDisplayName} Workspace`;
    }

    return "My Workspace";
  }

  // 기능 : 현재 사용자의 활성 등록 기기 목록과 현재 세션 포함 여부를 조회합니다.
  async listActiveDevices(
    userId: string,
    currentSessionId: string,
    now: Date
  ): Promise<UserDeviceRecord[]> {
    const devices = await this.client.authDevice.findMany({
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

  // 기능 : Prisma WorkspaceMember row를 직업 선택 온보딩 응답 레코드로 변환합니다.
  private mapJobSelectionOnboardingRecord(
    jobSelectOnboardingCompletedAt: Date,
    workspaceMember: WorkspaceMemberWithWorkspaceRow
  ): UserJobSelectionOnboardingRecord {
    return {
      jobSelectOnboardingCompletedAt,
      workspace: {
        id: workspaceMember.workspace.id,
        name: workspaceMember.workspace.name,
        kind: this.fromPrismaWorkspaceKind(workspaceMember.workspace.kind),
        organizationName: workspaceMember.workspace.organizationName,
        organizationDomain: workspaceMember.workspace.organizationDomain,
        createdAt: workspaceMember.workspace.createdAt,
        updatedAt: workspaceMember.workspace.updatedAt,
      },
      workspaceMember: {
        id: workspaceMember.id,
        workspaceId: workspaceMember.workspaceId,
        userId: workspaceMember.userId,
        role: this.fromPrismaWorkspaceMemberRole(workspaceMember.role),
        joinedAt: workspaceMember.joinedAt,
        createdAt: workspaceMember.createdAt,
        updatedAt: workspaceMember.updatedAt,
      },
    };
  }

  // 기능 : Prisma 사용자 행을 사용자 프로필 응답 레코드로 변환합니다.
  private mapProfile(user: {
    readonly id: string;
    readonly email: string | null;
    readonly displayName: string | null;
    readonly platformRole: PlatformRole;
    readonly status: UserStatus;
    readonly timeZone: string;
    readonly preferredLocale: string;
    readonly countryCode: string;
    readonly defaultCurrencyCode: string;
    readonly signupLocale: string | null;
    readonly signupCountryCode: string | null;
    readonly signupTimeZone: string | null;
    readonly lastLoginLocale: string | null;
    readonly lastLoginCountryCode: string | null;
    readonly lastLoginTimeZone: string | null;
    readonly lastLoginAt: Date | null;
    readonly jobSelectOnboardingCompletedAt: Date | null;
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
      platformRole: this.fromPrismaPlatformRole(user.platformRole),
      status: this.fromPrismaUserStatus(user.status),
      timeZone: user.timeZone,
      preferredLocale: this.toSupportedPreferredLocale(user.preferredLocale),
      countryCode: user.countryCode || "KR",
      defaultCurrencyCode: user.defaultCurrencyCode || "KRW",
      signupLocale: user.signupLocale,
      signupCountryCode: user.signupCountryCode,
      signupTimeZone: user.signupTimeZone,
      lastLoginLocale: user.lastLoginLocale,
      lastLoginCountryCode: user.lastLoginCountryCode,
      lastLoginTimeZone: user.lastLoginTimeZone,
      lastLoginAt: user.lastLoginAt,
      jobSelectOnboardingCompletedAt: user.jobSelectOnboardingCompletedAt,
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
      case OAuthProvider.LINE:
        return "line";
      case OAuthProvider.APPLE:
        return "apple";
      case OAuthProvider.KAKAO:
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

  // 기능 : Prisma 플랫폼 역할 enum을 사용자 프로필 플랫폼 역할 값으로 변환합니다.
  private fromPrismaPlatformRole(role: PlatformRole): UserProfilePlatformRole {
    switch (role) {
      case PlatformRole.USER:
        return "USER";
      case PlatformRole.ADMIN:
        return "ADMIN";
    }
  }

  // 기능 : Prisma WorkspaceKind enum을 사용자 응답 Workspace 종류 값으로 변환합니다.
  private fromPrismaWorkspaceKind(kind: PrismaWorkspaceKind): WorkspaceKind {
    switch (kind) {
      case PrismaWorkspaceKind.PERSONAL:
        return "PERSONAL";
      case PrismaWorkspaceKind.ORGANIZATION:
        return "ORGANIZATION";
    }
  }

  // 기능 : Prisma WorkspaceMemberRole enum을 사용자 응답 Workspace 멤버 역할 값으로 변환합니다.
  private fromPrismaWorkspaceMemberRole(
    role: PrismaWorkspaceMemberRole
  ): WorkspaceMemberRole {
    switch (role) {
      case PrismaWorkspaceMemberRole.OWNER:
        return "OWNER";
      case PrismaWorkspaceMemberRole.ADMIN:
        return "ADMIN";
      case PrismaWorkspaceMemberRole.MEMBER:
        return "MEMBER";
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

  // 기능 : 이전 locale 데이터를 현재 지원 locale 응답값으로 정규화합니다.
  private toSupportedPreferredLocale(preferredLocale: string): string {
    // 1. 이후 단계에서 사용할 normalized 값을 준비한다.
    const normalized = preferredLocale.trim().replace("_", "-").toLowerCase();

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (normalized === "ko" || normalized === "ko-kr") {
      return "ko-KR";
    }

    // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (normalized === "en" || normalized.startsWith("en-")) {
      return "en";
    }

    // 4. 계산된 결과를 호출자에게 반환한다.
    return "ko-KR";
  }
}
