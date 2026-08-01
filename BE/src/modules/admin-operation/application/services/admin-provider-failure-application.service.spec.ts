import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@prisma/client";
import {
  AdminProviderFailureFeatureArea,
  AdminProviderFailureType,
  type AdminProviderFailureDetailRecord,
  type AdminProviderFailureRepository,
} from "@/modules/admin-operation/application/ports/admin-provider-failure.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminProviderFailureApplicationService } from "./admin-provider-failure-application.service";

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
const sourceId = "00000000-0000-4000-8000-000000000020";
const requestMetadata = { requestId: "req-provider-1" };

// 기능 : AdminProviderFailureApplicationService의 masking과 감사 로그 정책을 테스트합니다.
describe("AdminProviderFailureApplicationService", () => {
  // 기능 : 목록 응답에서 사용자 email을 masking하고 audit에는 검색 원문 없이 filter 요약만 남기는지 검증합니다.
  it("masks list response and stores safe list audit metadata", async () => {
    const repository = createRepositoryMock();
    repository.listProviderFailures.mockResolvedValue({
      items: [createProviderFailureDetail()],
      nextCursor: null,
    });
    const service = new AdminProviderFailureApplicationService(repository);

    const response = await service.listProviderFailures(
      adminUser,
      {
        providerType: "AI",
        featureArea: "MEETING_NOTE",
        status: "FAILED",
        retryable: "true",
        userId: targetUserId,
      },
      requestMetadata
    );

    expect(response.items[0]?.userEmailMasked).toBe("lo***@example.com");
    expect(JSON.stringify(response)).not.toContain("local.user@example.com");
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: adminUser.id,
        targetUserId,
        targetType: AdminTargetType.PROVIDER_FAILURE,
        targetId: null,
        action: AdminAuditAction.ADMIN_PROVIDER_FAILURE_VIEW,
        result: AdminAuditResult.SUCCESS,
        requestId: requestMetadata.requestId,
        metadataJson: expect.objectContaining({
          endpoint: "providerFailureList",
          providerType: "AI",
          featureArea: "MEETING_NOTE",
          status: "FAILED",
          retryable: true,
          userFiltered: true,
        }),
      })
    );
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "local.user@example.com"
    );
  });

  // 기능 : 상세 조회 audit가 opaque failure ID 대신 source UUID와 safe metadata만 저장하는지 검증합니다.
  it("stores detail audit with source UUID and safe metadata", async () => {
    const repository = createRepositoryMock();
    repository.getProviderFailureDetail.mockResolvedValue(
      createProviderFailureDetail()
    );
    const service = new AdminProviderFailureApplicationService(repository);

    const response = await service.getProviderFailureDetail(
      adminUser,
      `AI:${sourceId}`,
      requestMetadata
    );

    expect(response.userEmailMasked).toBe("lo***@example.com");
    expect(response.safeContext.provider).toBe("OPENAI");
    expect(repository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        targetUserId,
        targetType: AdminTargetType.PROVIDER_FAILURE,
        targetId: sourceId,
        action: AdminAuditAction.ADMIN_PROVIDER_FAILURE_VIEW,
        metadataJson: expect.objectContaining({
          endpoint: "providerFailureDetail",
          failureIdPrefix: "AI",
          providerType: "AI",
          sourceModel: "AiProviderCallLog",
          safeErrorCode: "AI_PROVIDER_TIMEOUT",
        }),
      })
    );
    expect(JSON.stringify(repository.createAuditLog.mock.calls)).not.toContain(
      "AI 응답 시간이 초과됐어요"
    );
  });

  // 기능 : 목록 조회 audit 기록에 실패하면 provider 실패 응답을 반환하지 않는지 검증합니다.
  it("does not return provider failure list when audit creation fails", async () => {
    const repository = createRepositoryMock();
    repository.listProviderFailures.mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    repository.createAuditLog.mockRejectedValue(new Error("audit failed"));
    const service = new AdminProviderFailureApplicationService(repository);

    await expect(
      service.listProviderFailures(adminUser, {}, requestMetadata)
    ).rejects.toThrow("audit failed");
  });
});

// 기능 : 테스트용 AdminProviderFailureRepository mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<AdminProviderFailureRepository> {
  const repository = {
    listProviderFailures: jest.fn(),
    getProviderFailureDetail: jest.fn(),
    createAuditLog: jest.fn(),
    runInTransaction: jest.fn(),
  } as unknown as jest.Mocked<AdminProviderFailureRepository>;

  repository.runInTransaction.mockImplementation(
    async (
      work: (repository: AdminProviderFailureRepository) => Promise<unknown>
    ) => work(repository)
  );

  return repository;
}

// 기능 : 테스트용 provider failure 상세 record를 생성합니다.
function createProviderFailureDetail(): AdminProviderFailureDetailRecord {
  return {
    id: `AI:${sourceId}`,
    sourceId,
    providerType: AdminProviderFailureType.AI,
    sourceModel: "AiProviderCallLog",
    userId: targetUserId,
    userEmail: "local.user@example.com",
    featureArea: AdminProviderFailureFeatureArea.MEETING_NOTE,
    operation: "MEETING_NOTE_STT_DRAFT",
    targetType: "MEETING_NOTE_DRAFT",
    targetId: null,
    status: "FAILED",
    safeErrorCode: "AI_PROVIDER_TIMEOUT",
    safeErrorMessage: "AI 응답 시간이 초과됐어요",
    retryable: true,
    latencyMs: 12000,
    requestId: "provider-request-id",
    occurredAt: new Date("2026-08-01T00:00:00.000Z"),
    safeContext: {
      provider: "OPENAI",
      model: "gpt-test",
      startedAt: "2026-08-01T00:00:00.000Z",
      completedAt: null,
      failedAt: "2026-08-01T00:00:10.000Z",
    },
  };
}
