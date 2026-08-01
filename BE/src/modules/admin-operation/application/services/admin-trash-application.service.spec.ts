import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  TrashRecoveryRequestStatus,
} from "@prisma/client";
import {
  AdminTrashDomain,
  type AdminTrashRepository,
} from "@/modules/admin-operation/application/ports/admin-trash.repository";
import { AdminDomainUnsupportedError } from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminTrashApplicationService } from "./admin-trash-application.service";

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
const requestMetadata = { requestId: "req-trash-1" };

// 기능 : AdminTrashApplicationService의 감사 로그와 filter 정책을 테스트합니다.
describe("AdminTrashApplicationService", () => {
  it("stores trash record view audit metadata without raw row content", async () => {
    const repository = createRepositoryMock();
    repository.targetUserExists.mockResolvedValue(true);
    repository.listUserTrashRecords.mockResolvedValue({
      items: [
        {
          targetType: AdminTrashDomain.COMPANY,
          targetId: "00000000-0000-4000-8000-000000000020",
          titleSnapshot: "삭제 회사",
          deletedAt: new Date("2026-07-20T00:00:00.000Z"),
          trashExpiresAt: new Date("2026-07-27T00:00:00.000Z"),
          restoreWindow: "EXPIRED",
          userCanSelfRestore: false,
          sensitiveFlags: {
            hasMemo: true,
            hasPrivateMemo: true,
            privateMemoIncluded: false,
          },
          recoveryRequest: null,
        },
      ],
      nextCursor: null,
    });
    const service = new AdminTrashApplicationService(repository);

    const response = await service.listUserTrashRecords(
      adminUser,
      targetUserId,
      { domain: "COMPANY", restoreWindow: "EXPIRED" },
      requestMetadata
    );

    expect(response.items[0]?.sensitiveFlags.privateMemoIncluded).toBe(false);
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId,
        targetType: AdminTargetType.USER,
        targetId: targetUserId,
        action: AdminAuditAction.ADMIN_TRASH_VIEW,
        result: AdminAuditResult.SUCCESS,
        requestId: requestMetadata.requestId,
        metadataJson: expect.objectContaining({
          endpoint: "userTrashRecords",
          domain: "COMPANY",
          restoreWindow: "EXPIRED",
        }),
      })
    );
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "삭제 회사"
    );
  });

  it("stores recovery queue audit metadata with masked response fields only", async () => {
    const repository = createRepositoryMock();
    repository.listRecoveryRequests.mockResolvedValue({
      items: [
        {
          id: "00000000-0000-4000-8000-000000000030",
          userId: targetUserId,
          userEmailMasked: "u***@example.com",
          targetType: "DEAL",
          targetId: "00000000-0000-4000-8000-000000000040",
          titleSnapshot: "만료 딜",
          status: TrashRecoveryRequestStatus.REQUESTED,
          deletedAt: new Date("2026-07-20T00:00:00.000Z"),
          trashExpiresAt: new Date("2026-07-27T00:00:00.000Z"),
          createdAt: new Date("2026-08-01T00:00:00.000Z"),
        },
      ],
      nextCursor: null,
    });
    const service = new AdminTrashApplicationService(repository);

    const response = await service.listRecoveryRequests(
      adminUser,
      { status: "REQUESTED" },
      requestMetadata
    );

    expect(response.items[0]?.userEmailMasked).toBe("u***@example.com");
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        targetUserId: null,
        targetType: AdminTargetType.TRASH_RECORD,
        targetId: null,
        action: AdminAuditAction.ADMIN_TRASH_VIEW,
        metadataJson: expect.objectContaining({
          endpoint: "recoveryRequests",
          status: "REQUESTED",
        }),
      })
    );
  });

  it("rejects unsupported trash domain before repository read", async () => {
    const repository = createRepositoryMock();
    const service = new AdminTrashApplicationService(repository);

    await expect(
      service.listUserTrashRecords(
        adminUser,
        targetUserId,
        { domain: "PAYMENT" },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminDomainUnsupportedError);
    expect(repository.listUserTrashRecords).not.toHaveBeenCalled();
  });
});

// 기능 : 테스트용 AdminTrashRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AdminTrashRepository> {
  const repository = {
    targetUserExists: jest.fn(),
    getUserTrashSummary: jest.fn(),
    listUserTrashRecords: jest.fn(),
    listRecoveryRequests: jest.fn(),
    createAuditLog: jest.fn(),
    runInTransaction: jest.fn(),
  } as unknown as jest.Mocked<AdminTrashRepository>;

  repository.runInTransaction.mockImplementation(
    async (work: (repository: AdminTrashRepository) => Promise<unknown>) =>
      work(repository)
  );

  return repository;
}
