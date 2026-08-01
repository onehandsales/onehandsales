import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminAccountRequestRepository } from "./prisma-admin-account-request.repository";

const requestDate = new Date("2026-08-01T00:00:00.000Z");
const userId = "00000000-0000-4000-8000-000000000010";

// 기능 : PrismaAdminAccountRequestRepository의 Admin queue safe select 정책을 테스트합니다.
describe("PrismaAdminAccountRequestRepository", () => {
  // 기능 : 계정 삭제 queue 조회에서 reasonMessage 원문을 select하지 않는지 검증합니다.
  it("does not select account deletion reason message in admin queue", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminAccountRequestRepository(
      client as unknown as PrismaService
    );

    const response = await repository.listAccountDeletionRequests({
      status: "REQUESTED",
      limit: 30,
    });
    const query = client.accountDeletionRequest.findMany.mock.calls[0]?.[0];

    expect(response.items[0]?.userEmailMasked).toBe("us***@example.com");
    expect(query?.select).toEqual({
      id: true,
      userId: true,
      status: true,
      reasonCode: true,
      requestedAt: true,
      scheduledDeletionAt: true,
      user: {
        select: {
          email: true,
        },
      },
    });
    expect(JSON.stringify(query)).not.toContain("reasonMessage");
  });

  // 기능 : 데이터 export queue 조회에서 내부 artifact storage 정보를 select하지 않는지 검증합니다.
  it("does not select data export artifact path in admin queue", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminAccountRequestRepository(
      client as unknown as PrismaService
    );

    const response = await repository.listDataExportRequests({
      status: "READY",
      limit: 30,
    });
    const query = client.userDataExportRequest.findMany.mock.calls[0]?.[0];

    expect(response.items[0]?.userEmailMasked).toBe("us***@example.com");
    expect(query?.select).toEqual({
      id: true,
      userId: true,
      status: true,
      includeSensitive: true,
      format: true,
      requestedAt: true,
      expiresAt: true,
      user: {
        select: {
          email: true,
        },
      },
    });
    expect(JSON.stringify(query)).not.toContain("artifactPath");
  });

  // 기능 : 계정 데이터 요청 queue 감사 로그를 append-only로 저장하는지 검증합니다.
  it("creates append-only account request audit log", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminAccountRequestRepository(
      client as unknown as PrismaService
    );

    await repository.createAuditLog({
      adminUserId: "00000000-0000-4000-8000-000000000001",
      targetUserId: null,
      targetType: "DATA_EXPORT_REQUEST",
      targetId: null,
      action: "ADMIN_DATA_EXPORT_VIEW",
      result: "SUCCESS",
      requestId: "req-account-request-1",
      metadataJson: { endpoint: "dataExportRequests" },
    });

    expect(client.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        adminUserId: "00000000-0000-4000-8000-000000000001",
        targetUserId: null,
        targetType: "DATA_EXPORT_REQUEST",
        targetId: null,
        action: "ADMIN_DATA_EXPORT_VIEW",
        result: "SUCCESS",
        requestId: "req-account-request-1",
        metadataJson: { endpoint: "dataExportRequests" },
      },
      select: { id: true },
    });
  });
});

// 기능 : 테스트용 Admin 계정 데이터 요청 Prisma client mock을 생성합니다.
function createClientMock() {
  return {
    accountDeletionRequest: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "00000000-0000-4000-8000-000000000020",
          userId,
          status: "REQUESTED",
          reasonCode: "NO_LONGER_NEEDED",
          requestedAt: requestDate,
          scheduledDeletionAt: new Date("2026-08-31T00:00:00.000Z"),
          user: {
            email: "user@example.com",
          },
        },
      ]),
    },
    userDataExportRequest: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "00000000-0000-4000-8000-000000000030",
          userId,
          status: "READY",
          includeSensitive: false,
          format: "ZIP_JSON_XLSX",
          requestedAt: requestDate,
          expiresAt: new Date("2026-08-09T00:00:00.000Z"),
          user: {
            email: "user@example.com",
          },
        },
      ]),
    },
    adminAuditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-id" }),
    },
  };
}
