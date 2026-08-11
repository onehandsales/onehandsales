import {
  AdminAuditAction,
  AdminAuditResult,
  AdminOperationCheckRunStatus,
  AdminTargetType,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import type {
  AdminOperationCheckRunRecord,
  AdminSystemOperationRepository,
} from "@/modules/admin-operation/application/ports/admin-system-operation.repository";
import {
  AdminForbiddenError,
  AdminSystemCheckStatusInvalidError,
  AdminSystemSecretInNoteBlockedError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminSystemOperationApplicationService } from "./admin-system-operation-application.service";

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
const checkedAt = new Date("2026-08-01T00:00:00.000Z");
const requestMetadata = { requestId: "req-system-1" };

// 기능 : AdminSystemOperationApplicationService의 운영 gate 검증과 audit 정책을 테스트합니다.
describe("AdminSystemOperationApplicationService", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(checkedAt);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates an operation check run and audit log in one transaction", async () => {
    const repository = createRepositoryMock();
    const createdRun = createOperationCheckRunRecord();
    repository.createOperationCheckRun.mockResolvedValue(createdRun);
    const service = new AdminSystemOperationApplicationService(repository);

    const response = await service.createOperationCheckRun(
      adminUser,
      {
        environment: " production ",
        status: "pass",
        items: {
          prismaValidate: "PASS",
          prismaGenerate: "PASS",
          migrationStatus: "PASS",
          seedNotRunOnSharedDb: "PASS",
          backupVerified: "PASS",
          restoreDryRun: "WARN",
          providerSmoke: "WARN",
        },
        notes: " restore dry-run은 staging 기준으로 확인 ",
      },
      requestMetadata
    );

    expect(repository.runInTransaction).toHaveBeenCalledTimes(1);
    expect(repository.createOperationCheckRun).toHaveBeenCalledWith({
      adminUserId: adminUser.id,
      environment: "production",
      status: AdminOperationCheckRunStatus.PASS,
      items: {
        prismaValidate: AdminOperationCheckRunStatus.PASS,
        prismaGenerate: AdminOperationCheckRunStatus.PASS,
        migrationStatus: AdminOperationCheckRunStatus.PASS,
        seedNotRunOnSharedDb: AdminOperationCheckRunStatus.PASS,
        backupVerified: AdminOperationCheckRunStatus.PASS,
        restoreDryRun: AdminOperationCheckRunStatus.WARN,
        providerSmoke: AdminOperationCheckRunStatus.WARN,
      },
      notes: "restore dry-run은 staging 기준으로 확인",
      checkedAt,
    });
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId: null,
        targetType: AdminTargetType.SYSTEM_OPERATION_CHECK,
        targetId: createdRun.id,
        action: AdminAuditAction.ADMIN_SYSTEM_CHECK_RECORDED,
        result: AdminAuditResult.SUCCESS,
        requestId: requestMetadata.requestId,
        metadataJson: expect.objectContaining({
          endpoint: "systemOperationChecks",
          environment: "production",
          status: AdminOperationCheckRunStatus.PASS,
        }),
      })
    );
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "restore dry-run은 staging 기준"
    );
    expect(response.notes).toBe("restore dry-run은 staging 기준으로 확인");
  });

  it("blocks notes that look like a DB URL, token, or secret before repository write", async () => {
    const repository = createRepositoryMock();
    const service = new AdminSystemOperationApplicationService(repository);

    await expect(
      service.createOperationCheckRun(
        adminUser,
        {
          environment: "production",
          status: "PASS",
          items: createValidItemsInput(),
          notes: "DATABASE_URL=postgresql://user:pass@localhost:5432/app",
        },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminSystemSecretInNoteBlockedError);
    expect(repository.createOperationCheckRun).not.toHaveBeenCalled();
  });

  it("rejects invalid item status before repository write", async () => {
    const repository = createRepositoryMock();
    const service = new AdminSystemOperationApplicationService(repository);

    await expect(
      service.createOperationCheckRun(
        adminUser,
        {
          environment: "production",
          status: "PASS",
          items: {
            ...createValidItemsInput(),
            providerSmoke: "RUNNING",
          },
        },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminSystemCheckStatusInvalidError);
    expect(repository.createOperationCheckRun).not.toHaveBeenCalled();
  });

  it("returns the latest operation check run and records view audit", async () => {
    const repository = createRepositoryMock();
    const latestRun = createOperationCheckRunRecord();
    repository.findLatestOperationCheckRun.mockResolvedValue(latestRun);
    const service = new AdminSystemOperationApplicationService(repository);

    const response = await service.getLatestOperationCheckRun(
      adminUser,
      requestMetadata
    );

    expect(response?.id).toBe(latestRun.id);
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: AdminTargetType.SYSTEM_OPERATION_CHECK,
        targetId: latestRun.id,
        action: AdminAuditAction.ADMIN_SYSTEM_CHECK_VIEW,
        metadataJson: {
          endpoint: "systemOperationChecksLatest",
          hasLatest: true,
        },
      })
    );
  });

  it("rejects non-admin calls before latest read", async () => {
    const repository = createRepositoryMock();
    const service = new AdminSystemOperationApplicationService(repository);

    await expect(
      service.getLatestOperationCheckRun(normalUser, requestMetadata)
    ).rejects.toBeInstanceOf(AdminForbiddenError);
    expect(repository.findLatestOperationCheckRun).not.toHaveBeenCalled();
  });
});

// 기능 : 테스트용 AdminSystemOperationRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AdminSystemOperationRepository> {
  const repository = {
    findLatestOperationCheckRun: jest.fn(),
    createOperationCheckRun: jest.fn(),
    createAuditLog: jest.fn(),
    runInTransaction: jest.fn(),
  } as unknown as jest.Mocked<AdminSystemOperationRepository>;

  repository.runInTransaction.mockImplementation(
    async (work: (repository: AdminSystemOperationRepository) => Promise<unknown>) =>
      work(repository)
  );

  return repository;
}

// 기능 : 운영 gate 테스트용 항목 입력을 생성합니다.
function createValidItemsInput() {
  return {
    prismaValidate: "PASS",
    prismaGenerate: "PASS",
    migrationStatus: "PASS",
    seedNotRunOnSharedDb: "PASS",
    backupVerified: "PASS",
    restoreDryRun: "WARN",
    providerSmoke: "WARN",
  };
}

// 기능 : 운영 gate 테스트용 record를 생성합니다.
function createOperationCheckRunRecord(
  overrides: Partial<AdminOperationCheckRunRecord> = {}
): AdminOperationCheckRunRecord {
  return {
    id: "00000000-0000-4000-8000-000000000010",
    environment: "production",
    status: AdminOperationCheckRunStatus.PASS,
    checkedAt,
    checkedByAdminUserId: adminUser.id,
    items: {
      prismaValidate: AdminOperationCheckRunStatus.PASS,
      prismaGenerate: AdminOperationCheckRunStatus.PASS,
      migrationStatus: AdminOperationCheckRunStatus.PASS,
      seedNotRunOnSharedDb: AdminOperationCheckRunStatus.PASS,
      backupVerified: AdminOperationCheckRunStatus.PASS,
      restoreDryRun: AdminOperationCheckRunStatus.WARN,
      providerSmoke: AdminOperationCheckRunStatus.WARN,
    },
    notes: "restore dry-run은 staging 기준으로 확인",
    ...overrides,
  };
}
