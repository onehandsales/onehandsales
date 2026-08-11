import {
  AccountDeletionRequestStatus,
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  UserDataExportRequestStatus,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import type {
  AdminAccountRequestRepository,
  AdminDataExportRequestsPageRecord,
} from "@/modules/admin-operation/application/ports/admin-account-request.repository";
import { AdminForbiddenError } from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminAccountRequestApplicationService } from "./admin-account-request-application.service";

const adminUser = {
  id: "00000000-0000-4000-8000-000000000001",
  sessionId: "session-1",
  email: "admin@example.com",
  displayName: "관리자",
  role: "ADMIN",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
} satisfies CurrentUserContext;
const normalUser = {
  ...adminUser,
  id: "00000000-0000-4000-8000-000000000002",
  role: "USER",
} satisfies CurrentUserContext;
const requestMetadata = { requestId: "req-account-request-1" };

// 기능 : AdminAccountRequestApplicationService의 queue 응답과 감사 로그 정책을 테스트합니다.
describe("AdminAccountRequestApplicationService", () => {
  it("lists account deletion requests with masked email and no reason message", async () => {
    const repository = createRepositoryMock();
    repository.listAccountDeletionRequests.mockResolvedValue({
      items: [
        {
          id: "00000000-0000-4000-8000-000000000010",
          userId: "00000000-0000-4000-8000-000000000020",
          userEmailMasked: "u***@example.com",
          status: AccountDeletionRequestStatus.REQUESTED,
          requestedAt: new Date("2026-08-01T00:00:00.000Z"),
          scheduledDeletionAt: new Date("2026-08-31T00:00:00.000Z"),
          reasonCode: "NO_LONGER_NEEDED",
        },
      ],
      nextCursor: null,
    });
    const service = new AdminAccountRequestApplicationService(repository);

    const page = await service.listAccountDeletionRequests(
      adminUser,
      { status: "requested", limit: 10 },
      requestMetadata
    );

    expect(page.items[0]).toEqual({
      id: "00000000-0000-4000-8000-000000000010",
      userId: "00000000-0000-4000-8000-000000000020",
      userEmailMasked: "u***@example.com",
      status: "REQUESTED",
      requestedAt: new Date("2026-08-01T00:00:00.000Z"),
      scheduledDeletionAt: new Date("2026-08-31T00:00:00.000Z"),
      reasonCode: "NO_LONGER_NEEDED",
    });
    expect(JSON.stringify(page)).not.toContain("reasonMessage");
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId: null,
        targetType: AdminTargetType.ACCOUNT_DELETION_REQUEST,
        targetId: null,
        action: AdminAuditAction.ADMIN_ACCOUNT_DELETION_VIEW,
        result: AdminAuditResult.SUCCESS,
        requestId: requestMetadata.requestId,
        metadataJson: expect.objectContaining({
          endpoint: "accountDeletionRequests",
          status: AccountDeletionRequestStatus.REQUESTED,
          limit: 10,
          hasCursor: false,
        }),
      })
    );
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "NO_LONGER_NEEDED 상세"
    );
  });

  it("lists data export requests without artifact storage information", async () => {
    const repository = createRepositoryMock();
    const page = {
      items: [
        {
          id: "00000000-0000-4000-8000-000000000030",
          userId: "00000000-0000-4000-8000-000000000020",
          userEmailMasked: "u***@example.com",
          status: UserDataExportRequestStatus.READY,
          includeSensitive: false,
          format: "ZIP_JSON_XLSX",
          requestedAt: new Date("2026-08-02T00:00:00.000Z"),
          expiresAt: new Date("2026-08-09T00:00:00.000Z"),
        },
      ],
      nextCursor: null,
    } satisfies AdminDataExportRequestsPageRecord;
    repository.listDataExportRequests.mockResolvedValue(page);
    const service = new AdminAccountRequestApplicationService(repository);

    const response = await service.listDataExportRequests(
      adminUser,
      { status: "ready" },
      requestMetadata
    );

    expect(response.items[0]?.userEmailMasked).toBe("u***@example.com");
    expect(response.items[0]?.status).toBe("READY");
    expect(JSON.stringify(response)).not.toContain("artifactPath");
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: AdminTargetType.DATA_EXPORT_REQUEST,
        action: AdminAuditAction.ADMIN_DATA_EXPORT_VIEW,
        metadataJson: expect.objectContaining({
          endpoint: "dataExportRequests",
          status: UserDataExportRequestStatus.READY,
        }),
      })
    );
  });

  it("rejects non-admin calls before queue read", async () => {
    const repository = createRepositoryMock();
    const service = new AdminAccountRequestApplicationService(repository);

    await expect(
      service.listDataExportRequests(normalUser, {}, requestMetadata)
    ).rejects.toBeInstanceOf(AdminForbiddenError);
    expect(repository.listDataExportRequests).not.toHaveBeenCalled();
  });

  it("propagates audit failures so the transaction can roll back", async () => {
    const repository = createRepositoryMock();
    repository.listDataExportRequests.mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    repository.createAuditLog.mockRejectedValue(new Error("audit failed"));
    const service = new AdminAccountRequestApplicationService(repository);

    await expect(
      service.listDataExportRequests(adminUser, {}, requestMetadata)
    ).rejects.toThrow("audit failed");
  });
});

// 기능 : 테스트용 AdminAccountRequestRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AdminAccountRequestRepository> {
  const repository = {
    listAccountDeletionRequests: jest.fn(),
    listDataExportRequests: jest.fn(),
    createAuditLog: jest.fn(),
    runInTransaction: jest.fn(),
  } as unknown as jest.Mocked<AdminAccountRequestRepository>;

  repository.runInTransaction.mockImplementation(
    async (work: (repository: AdminAccountRequestRepository) => Promise<unknown>) =>
      work(repository)
  );

  return repository;
}
