import {
  AdminAuditAction,
  AdminAuditResult,
  AdminSensitiveFieldSet,
  AdminTargetType,
} from "@prisma/client";
import type {
  AdminAuditRepository,
  AdminSensitiveAccessRecord,
  AdminSensitiveRawDataRecord,
} from "@/modules/admin-operation/application/ports/admin-audit.repository";
import {
  AdminReasonRequiredError,
  AdminSensitiveFieldSetUnsupportedError,
  AdminTargetNotFoundError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { AdminAuditApplicationService } from "./admin-audit-application.service";

const adminUser = {
  id: "00000000-0000-4000-8000-000000000001",
  sessionId: "session-1",
  email: "admin@example.com",
  displayName: "관리자",
  role: "ADMIN",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
} satisfies CurrentUserContext;

const requestMetadata = {
  requestId: "req-1",
  ipAddress: "127.0.0.1",
  userAgent: "jest-agent",
};

// 기능 : AdminAuditApplicationService의 민감 원문 조회 정책을 테스트합니다.
describe("AdminAuditApplicationService", () => {
  // 기능 : 감사 로그 목록 응답에서 관리자 email 원문을 masking하는지 검증합니다.
  it("masks admin email in audit log list responses", async () => {
    const repository = createRepositoryMock({
      listAuditLogs: jest.fn().mockResolvedValue({
        items: [
          {
            id: "00000000-0000-4000-8000-000000000050",
            adminUserId: adminUser.id,
            adminEmail: "local.admin@example.com",
            targetUserId: "00000000-0000-4000-8000-000000000010",
            targetType: AdminTargetType.USER,
            targetId: "00000000-0000-4000-8000-000000000010",
            action: AdminAuditAction.ADMIN_USER_DETAIL_VIEW,
            result: AdminAuditResult.SUCCESS,
            reason: null,
            requestId: "req-1",
            createdAt: new Date("2026-08-01T00:00:00.000Z"),
          },
        ],
        nextCursor: null,
      }),
    });
    const service = createService(repository);

    const response = await service.listAuditLogs(adminUser, {});

    expect(response.items[0]?.adminEmailMasked).toBe("lo***@example.com");
    expect(JSON.stringify(response)).not.toContain("local.admin@example.com");
  });

  // 기능 : 사유가 짧으면 저장소를 호출하지 않고 거부하는지 검증합니다.
  it("rejects sensitive raw access when reason is too short", async () => {
    const repository = createRepositoryMock();
    const service = createService(repository);

    await expect(
      service.accessSensitiveRawData(
        adminUser,
        {
          targetUserId: "00000000-0000-4000-8000-000000000010",
          targetType: AdminTargetType.MEETING_NOTE,
          targetId: "00000000-0000-4000-8000-000000000020",
          fieldSet: AdminSensitiveFieldSet.MEETING_NOTE_BODY,
          reason: "짧아요",
        },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminReasonRequiredError);
    expect(repository.runInTransaction).not.toHaveBeenCalled();
  });

  // 기능 : G02에서 지원하지 않는 fieldSet 조합을 거부하는지 검증합니다.
  it("rejects unsupported sensitive field set combinations", async () => {
    const repository = createRepositoryMock();
    const service = createService(repository);

    await expect(
      service.accessSensitiveRawData(
        adminUser,
        {
          targetUserId: "00000000-0000-4000-8000-000000000010",
          targetType: AdminTargetType.COMPANY,
          targetId: "00000000-0000-4000-8000-000000000020",
          fieldSet: AdminSensitiveFieldSet.DOMAIN_MEMO,
          reason: "고객 문의 대응을 위해 원문 확인이 필요해요",
        },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminSensitiveFieldSetUnsupportedError);
    expect(repository.runInTransaction).not.toHaveBeenCalled();
  });

  // 기능 : 사용자 연락처 원문 조회 대상이 맞지 않으면 대상 없음 오류로 처리하는지 검증합니다.
  it("rejects user contact raw access when target user and target id do not match", async () => {
    const transactionRepository = createRepositoryMock({
      findUserContact: jest.fn().mockResolvedValue(null),
    });
    const repository = createRepositoryMock();
    (repository.runInTransaction as unknown as jest.Mock).mockImplementation(
      async (work: (repository: AdminAuditRepository) => Promise<unknown>) =>
        work(transactionRepository)
    );
    const service = createService(repository);

    await expect(
      service.accessSensitiveRawData(
        adminUser,
        {
          targetUserId: "00000000-0000-4000-8000-000000000010",
          targetType: AdminTargetType.USER,
          targetId: "00000000-0000-4000-8000-000000000011",
          fieldSet: AdminSensitiveFieldSet.USER_CONTACT,
          reason: "사용자 계정 문의 처리를 위해 연락처 확인이 필요해요",
        },
        requestMetadata
      )
    ).rejects.toBeInstanceOf(AdminTargetNotFoundError);
    expect(transactionRepository.createSensitiveAccessLog).not.toHaveBeenCalled();
  });

  // 기능 : 회의록 본문 원문 조회와 민감 로그 생성이 같은 transaction에서 실행되는지 검증합니다.
  it("creates sensitive access log before returning allowed meeting note body fields", async () => {
    const rawData: AdminSensitiveRawDataRecord = {
      data: {
        title: "회의록 제목",
        details: "허용 본문",
        nextPlan: "다음 계획",
        requiredAction: null,
      },
      returnedFieldNames: ["title", "details", "nextPlan", "requiredAction"],
    };
    const accessLog: AdminSensitiveAccessRecord = {
      id: "00000000-0000-4000-8000-000000000030",
      targetUserId: "00000000-0000-4000-8000-000000000010",
      targetType: AdminTargetType.MEETING_NOTE,
      targetId: "00000000-0000-4000-8000-000000000020",
      fieldSet: AdminSensitiveFieldSet.MEETING_NOTE_BODY,
      returnedFieldNames: rawData.returnedFieldNames,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
    };
    const transactionRepository = createRepositoryMock({
      findMeetingNoteBody: jest.fn().mockResolvedValue(rawData),
      createSensitiveAccessLog: jest.fn().mockResolvedValue(accessLog),
    });
    const repository = createRepositoryMock();
    (repository.runInTransaction as unknown as jest.Mock).mockImplementation(
      async (work: (repository: AdminAuditRepository) => Promise<unknown>) =>
        work(transactionRepository)
    );
    const service = createService(repository);

    const response = await service.accessSensitiveRawData(
      adminUser,
      {
        targetUserId: accessLog.targetUserId,
        targetType: AdminTargetType.MEETING_NOTE,
        targetId: accessLog.targetId,
        fieldSet: AdminSensitiveFieldSet.MEETING_NOTE_BODY,
        reason: "사용자 복구 문의 처리 때문에 본문 확인이 필요해요",
      },
      requestMetadata
    );

    expect(transactionRepository.findMeetingNoteBody).toHaveBeenCalledWith({
      targetUserId: accessLog.targetUserId,
      targetId: accessLog.targetId,
    });
    expect(transactionRepository.createSensitiveAccessLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId: accessLog.targetUserId,
        fieldSet: AdminSensitiveFieldSet.MEETING_NOTE_BODY,
        returnedFieldNames: rawData.returnedFieldNames,
        ipHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        userAgentHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
    expect(response.data).toEqual(rawData.data);
    expect(response.accessId).toBe(accessLog.id);
  });
});

// 기능 : 테스트용 AdminAuditApplicationService 인스턴스를 생성합니다.
function createService(repository: AdminAuditRepository): AdminAuditApplicationService {
  const logger = {
    log: jest.fn(),
  } as unknown as AppLogger;

  return new AdminAuditApplicationService(repository, logger);
}

// 기능 : 테스트에서 필요한 AdminAuditRepository mock 기본값을 생성합니다.
function createRepositoryMock(
  overrides: Partial<jest.Mocked<AdminAuditRepository>> = {}
): jest.Mocked<AdminAuditRepository> {
  return {
    listAuditLogs: jest.fn(),
    findUserContact: jest.fn(),
    findMeetingNoteBody: jest.fn(),
    createSensitiveAccessLog: jest.fn(),
    runInTransaction: jest.fn(),
    ...overrides,
  };
}
