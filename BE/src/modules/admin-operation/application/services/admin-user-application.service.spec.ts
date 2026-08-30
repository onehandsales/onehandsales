import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  UserStatus,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import { AdminUserListSort } from "@/modules/admin-operation/application/ports/admin-user-query.types";
import type { AdminUserRepository } from "@/modules/admin-operation/application/ports/admin-user.repository";
import type { AdminUserOverviewRecord } from "@/modules/admin-operation/application/ports/admin-user-read-model.types";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminUserApplicationService } from "./admin-user-application.service";

const adminUser = {
  id: "00000000-0000-4000-8000-000000000001",
  sessionId: "session-1",
  email: "admin@example.com",
  displayName: "관리자",
  role: "ADMIN",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
} satisfies CurrentUserContext;

const targetUserId = "00000000-0000-4000-8000-000000000010";
const requestMetadata = { requestId: "req-user-1" };

// 기능 : AdminUserApplicationService의 마스킹과 감사 로그 정책을 테스트합니다.
describe("AdminUserApplicationService", () => {
  // 기능 : 사용자 목록 응답이 email/displayName 원문을 제거하고 검색어 원문 없이 audit를 남기는지 검증합니다.
  it("returns list page records and stores audit metadata without raw search text", async () => {
    const repository = createRepositoryMock();
    repository.listUsers.mockResolvedValue({
      items: [
        {
          id: targetUserId,
          email: "local.user@example.com",
          displayName: "로컬 사용자",
          role: "USER",
          status: "ACTIVE",
          preferredLocale: "ko-KR",
          timeZone: "Asia/Seoul",
          countryCode: "KR",
          defaultCurrencyCode: "KRW",
          createdAt: new Date("2026-08-01T00:00:00.000Z"),
          lastLoginAt: null,
          domainCounts: {
            companies: 1,
            contacts: 2,
            products: 3,
            deals: 4,
            schedules: 5,
            meetingNotes: 6,
            trashActive: 1,
            trashExpired: 0,
          },
        },
      ],
      nextCursor: null,
    });
    const service = new AdminUserApplicationService(repository);

    const page = await service.listUsers(
      adminUser,
      {
        q: "local.user@example.com",
        status: UserStatus.ACTIVE,
        sort: AdminUserListSort.CREATED_AT_DESC,
      },
      requestMetadata
    );

    expect(page.items[0]?.email).toBe("local.user@example.com");
    expect(page.items[0]?.displayName).toBe("로컬 사용자");
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId: null,
        targetType: AdminTargetType.USER,
        targetId: null,
        action: AdminAuditAction.ADMIN_USER_LIST_VIEW,
        result: AdminAuditResult.SUCCESS,
        requestId: requestMetadata.requestId,
        metadataJson: expect.objectContaining({
          filterKeys: expect.arrayContaining(["q", "status"]),
          qLength: "local.user@example.com".length,
        }),
      })
    );
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "local.user@example.com"
    );
  });

  // 기능 : 사용자 목록 조회 audit 기록에 실패하면 응답을 반환하지 않는지 검증합니다.
  it("does not return user list when list audit creation fails", async () => {
    const repository = createRepositoryMock();
    repository.listUsers.mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    repository.createAuditLog.mockRejectedValue(new Error("audit failed"));
    const service = new AdminUserApplicationService(repository);

    await expect(
      service.listUsers(adminUser, {}, requestMetadata)
    ).rejects.toThrow("audit failed");
  });

  // 기능 : 사용자 상세 조회가 대상 사용자 audit를 남기고 profile 원문을 masking하는지 검증합니다.
  it("creates detail audit log and returns overview records", async () => {
    const repository = createRepositoryMock();
    repository.getUserOverview.mockResolvedValue(createOverviewRecord());
    const service = new AdminUserApplicationService(repository);

    const overview = await service.getUserOverview(
      adminUser,
      targetUserId,
      requestMetadata
    );

    expect(overview.profile.email).toBe("local.user@example.com");
    expect(overview.profile.displayName).toBe("로컬 사용자");
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId,
        targetType: AdminTargetType.USER,
        targetId: targetUserId,
        action: AdminAuditAction.ADMIN_USER_DETAIL_VIEW,
        result: AdminAuditResult.SUCCESS,
      })
    );
  });
});

// 기능 : 테스트용 AdminUserRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AdminUserRepository> {
  const repository = {
    listUsers: jest.fn(),
    getUserOverview: jest.fn(),
    listActivityTimeline: jest.fn(),
    createAuditLog: jest.fn(),
    runInTransaction: jest.fn(),
  } as unknown as jest.Mocked<AdminUserRepository>;

  (repository.runInTransaction as unknown as jest.Mock).mockImplementation(
    async (work: (repository: AdminUserRepository) => Promise<unknown>) =>
      work(repository)
  );

  return repository;
}

// 기능 : 테스트용 사용자 상세 overview record를 생성합니다.
function createOverviewRecord(): AdminUserOverviewRecord {
  return {
    id: targetUserId,
    profile: {
      id: targetUserId,
      email: "local.user@example.com",
      displayName: "로컬 사용자",
      role: "USER",
      status: "ACTIVE",
      preferredLocale: "ko-KR",
      timeZone: "Asia/Seoul",
      countryCode: "KR",
      defaultCurrencyCode: "KRW",
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      lastLoginAt: null,
    },
    domainCounts: {
      companies: 1,
      contacts: 2,
      products: 3,
      deals: 4,
      schedules: 5,
      meetingNotes: 6,
      businessCardScans: 7,
      imports: 8,
      exports: 9,
    },
    trashSummary: {
      active: 1,
      expired: 0,
      recoveryRequests: 0,
    },
    analyticsSummary: {
      activationStatus: "ACTIVATED",
      activatedAt: new Date("2026-08-01T00:00:00.000Z"),
      lastActiveEventAt: new Date("2026-08-02T00:00:00.000Z"),
      aiRequestCount30d: 3,
      aiEstimatedCost30d: "0.42",
    },
    notificationSummary: {
      browserPushEnabled: true,
      activeBrowserPushSubscriptions: 1,
      revokedBrowserPushSubscriptions: 0,
      lastBrowserPushDeliveryStatus: "SENT",
      lastDeliveryFailureSafeErrorCode: null,
    },
  };
}
