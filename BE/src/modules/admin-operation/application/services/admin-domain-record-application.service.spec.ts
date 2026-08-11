import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import {
  AdminDomainRecordDomain,
  AdminDomainRecordSort,
  type AdminDomainRecordRepository,
} from "@/modules/admin-operation/application/ports/admin-domain-record.repository";
import { AdminDomainUnsupportedError } from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminDomainRecordApplicationService } from "./admin-domain-record-application.service";

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
const requestMetadata = { requestId: "req-domain-1" };

// 기능 : AdminDomainRecordApplicationService의 domain allowlist와 감사 로그 정책을 테스트합니다.
describe("AdminDomainRecordApplicationService", () => {
  // 기능 : 도메인 목록 조회가 검색어 원문 없이 audit를 남기는지 검증합니다.
  it("stores domain records audit metadata without raw search text", async () => {
    const repository = createRepositoryMock();
    repository.targetUserExists.mockResolvedValue(true);
    repository.listDomainRecords.mockResolvedValue({
      domain: AdminDomainRecordDomain.DEAL,
      items: [
        {
          id: "00000000-0000-4000-8000-000000000020",
          displayTitle: "갱신 딜",
          status: "ACTIVE",
          summary: { dealStatus: "NEGOTIATION", dealCost: 12000000 },
          sensitiveFlags: { hasMemo: true, privateMemoIncluded: false },
          createdAt: new Date("2026-08-01T00:00:00.000Z"),
          updatedAt: new Date("2026-08-02T00:00:00.000Z"),
          deletedAt: null,
          trashExpiresAt: null,
        },
      ],
      nextCursor: null,
    });
    const service = new AdminDomainRecordApplicationService(repository);

    const response = await service.listDomainRecords(
      adminUser,
      targetUserId,
      {
        domain: "DEAL",
        q: "sensitive search text",
        includeDeleted: true,
        sort: AdminDomainRecordSort.CREATED_AT_DESC,
      },
      requestMetadata
    );

    expect(response.domain).toBe("DEAL");
    expect(repository.listDomainRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: targetUserId,
        domain: AdminDomainRecordDomain.DEAL,
        q: "sensitive search text",
        includeDeleted: true,
      })
    );
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId,
        targetType: AdminTargetType.USER,
        targetId: targetUserId,
        action: AdminAuditAction.ADMIN_DOMAIN_RECORDS_VIEW,
        result: AdminAuditResult.SUCCESS,
        requestId: requestMetadata.requestId,
        metadataJson: expect.objectContaining({
          domain: AdminDomainRecordDomain.DEAL,
          qLength: "sensitive search text".length,
          includeDeleted: true,
        }),
      })
    );
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "sensitive search text"
    );
  });

  // 기능 : domain allowlist 밖의 요청을 저장소 조회 전에 거부하는지 검증합니다.
  it("rejects unsupported domain before repository read", async () => {
    const repository = createRepositoryMock();
    const service = new AdminDomainRecordApplicationService(repository);

    await expect(
      service.listDomainRecords(
        adminUser,
        targetUserId,
        { domain: "PAYMENT" },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminDomainUnsupportedError);
    expect(repository.listDomainRecords).not.toHaveBeenCalled();
  });

  // 기능 : 도메인 목록 조회 audit 기록에 실패하면 응답을 반환하지 않는지 검증합니다.
  it("does not return domain records when audit creation fails", async () => {
    const repository = createRepositoryMock();
    repository.targetUserExists.mockResolvedValue(true);
    repository.listDomainRecords.mockResolvedValue({
      domain: AdminDomainRecordDomain.COMPANY,
      items: [],
      nextCursor: null,
    });
    repository.createAuditLog.mockRejectedValue(new Error("audit failed"));
    const service = new AdminDomainRecordApplicationService(repository);

    await expect(
      service.listDomainRecords(
        adminUser,
        targetUserId,
        { domain: "COMPANY" },
        requestMetadata
      )
    ).rejects.toThrow("audit failed");
  });
});

// 기능 : 테스트용 AdminDomainRecordRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AdminDomainRecordRepository> {
  const repository = {
    targetUserExists: jest.fn(),
    listDomainRecords: jest.fn(),
    createAuditLog: jest.fn(),
    runInTransaction: jest.fn(),
  } as unknown as jest.Mocked<AdminDomainRecordRepository>;

  (repository.runInTransaction as unknown as jest.Mock).mockImplementation(
    async (work: (repository: AdminDomainRecordRepository) => Promise<unknown>) =>
      work(repository)
  );

  return repository;
}
