import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminSystemOperationRepository } from "./prisma-admin-system-operation.repository";

const adminUserId = "00000000-0000-4000-8000-000000000001";
const checkedAt = new Date("2026-08-01T00:00:00.000Z");
const items = {
  prismaValidate: "PASS",
  prismaGenerate: "PASS",
  migrationStatus: "PASS",
  seedNotRunOnSharedDb: "PASS",
  backupVerified: "PASS",
  restoreDryRun: "WARN",
  providerSmoke: "WARN",
} as const;

// 기능 : PrismaAdminSystemOperationRepository의 운영 gate 저장 계약을 테스트합니다.
describe("PrismaAdminSystemOperationRepository", () => {
  // 기능 : 최신 운영 gate 조회가 secret 컬럼 없이 필요한 field만 select하는지 검증합니다.
  it("selects the latest operation check run without secret fields", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminSystemOperationRepository(
      client as unknown as PrismaService
    );

    const response = await repository.findLatestOperationCheckRun();
    const query = client.adminOperationCheckRun.findFirst.mock.calls[0]?.[0];

    expect(response?.environment).toBe("production");
    expect(query).toEqual({
      select: {
        id: true,
        adminUserId: true,
        environment: true,
        status: true,
        itemsJson: true,
        notes: true,
        checkedAt: true,
      },
      orderBy: [{ checkedAt: "desc" }, { id: "desc" }],
    });
    expect(JSON.stringify(query)).not.toContain("DATABASE_URL");
    expect(JSON.stringify(query)).not.toContain("token");
  });

  // 기능 : 운영 gate 점검 기록을 itemsJson과 함께 생성하는지 검증합니다.
  it("creates an operation check run with itemsJson", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminSystemOperationRepository(
      client as unknown as PrismaService
    );

    await repository.createOperationCheckRun({
      adminUserId,
      environment: "production",
      status: "PASS",
      items,
      notes: "safe note",
      checkedAt,
    });

    expect(client.adminOperationCheckRun.create).toHaveBeenCalledWith({
      data: {
        adminUserId,
        environment: "production",
        status: "PASS",
        itemsJson: items,
        notes: "safe note",
        checkedAt,
      },
      select: {
        id: true,
        adminUserId: true,
        environment: true,
        status: true,
        itemsJson: true,
        notes: true,
        checkedAt: true,
      },
    });
  });

  // 기능 : 운영 gate 감사 로그를 append-only로 저장하는지 검증합니다.
  it("creates append-only system operation audit log", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminSystemOperationRepository(
      client as unknown as PrismaService
    );

    await repository.createAuditLog({
      adminUserId,
      targetUserId: null,
      targetType: "SYSTEM_OPERATION_CHECK",
      targetId: "00000000-0000-4000-8000-000000000010",
      action: "ADMIN_SYSTEM_CHECK_RECORDED",
      result: "SUCCESS",
      requestId: "req-system-1",
      metadataJson: { endpoint: "systemOperationChecks" },
    });

    expect(client.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        adminUserId,
        targetUserId: null,
        targetType: "SYSTEM_OPERATION_CHECK",
        targetId: "00000000-0000-4000-8000-000000000010",
        action: "ADMIN_SYSTEM_CHECK_RECORDED",
        result: "SUCCESS",
        requestId: "req-system-1",
        metadataJson: { endpoint: "systemOperationChecks" },
      },
      select: { id: true },
    });
  });
});

// 기능 : 테스트용 Admin 운영 gate Prisma client mock을 생성합니다.
function createClientMock() {
  return {
    adminOperationCheckRun: {
      findFirst: jest.fn().mockResolvedValue({
        id: "00000000-0000-4000-8000-000000000010",
        adminUserId,
        environment: "production",
        status: "PASS",
        itemsJson: items,
        notes: "safe note",
        checkedAt,
      }),
      create: jest.fn().mockResolvedValue({
        id: "00000000-0000-4000-8000-000000000010",
        adminUserId,
        environment: "production",
        status: "PASS",
        itemsJson: items,
        notes: "safe note",
        checkedAt,
      }),
    },
    adminAuditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-id" }),
    },
  };
}
