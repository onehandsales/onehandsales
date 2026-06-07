import {
  type AdminAuditLogListInput,
  type AdminAuditLogResponse,
  type AdminSensitiveRepository,
  type SensitiveRawDataResponse,
  type ViewSensitiveRawDataInput,
} from "@/modules/admin/application/ports/admin-sensitive.repository";
import { AuditReasonRequiredError } from "@/modules/admin/domain/admin.errors";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AdminSensitiveUseCase } from "./admin-sensitive.use-case";

class FakeAdminSensitiveRepository implements AdminSensitiveRepository {
  rawInput: ViewSensitiveRawDataInput | null = null;
  auditListInput: AdminAuditLogListInput | null = null;

  async viewRawData(
    input: ViewSensitiveRawDataInput
  ): Promise<SensitiveRawDataResponse> {
    this.rawInput = input;

    return {
      targetType: input.targetType,
      targetId: input.targetId,
      fields: input.fields.map((field) => ({ name: field, value: "raw" })),
      auditLogId: "audit-1",
      viewedAt: "2026-06-07T00:00:00.000Z",
    };
  }

  async listAuditLogs(input: AdminAuditLogListInput) {
    this.auditListInput = input;

    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async getAuditLog(): Promise<AdminAuditLogResponse> {
    return {
      id: "audit-1",
      actorUserId: "admin-1",
      actorUserName: "관리자",
      targetUserId: "user-1",
      action: "ADMIN_SENSITIVE_RAW_VIEW",
      targetType: "DEAL",
      targetId: "deal-1",
      reasonSummary: "고객 지원 요청 확인",
      ipAddress: null,
      userAgent: null,
      createdAt: "2026-06-07T00:00:00.000Z",
    };
  }
}

const actorContext = {
  actorUserId: "admin-1",
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
};

describe("AdminSensitiveUseCase", () => {
  it("requires a sufficiently long audit reason", async () => {
    const repository = new FakeAdminSensitiveRepository();
    const useCase = new AdminSensitiveUseCase(repository);

    expect(() =>
      useCase.viewSensitiveRawData(actorContext, {
        targetType: "DEAL",
        targetId: "deal-1",
        fields: ["amount"],
        reason: "짧음",
      })
    ).toThrow(AuditReasonRequiredError);
    expect(repository.rawInput).toBeNull();
  });

  it("normalizes common raw view requests", async () => {
    const repository = new FakeAdminSensitiveRepository();
    const useCase = new AdminSensitiveUseCase(repository);

    await useCase.viewSensitiveRawData(actorContext, {
      targetType: "deal",
      targetId: " deal-1 ",
      fields: [" amount ", "memo", "amount"],
      reason: "  고객 지원 요청으로 금액 확인  ",
    });

    expect(repository.rawInput).toEqual({
      actorUserId: "admin-1",
      targetType: "DEAL",
      targetId: "deal-1",
      fields: ["amount", "memo"],
      reason: "고객 지원 요청으로 금액 확인",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });
  });

  it("normalizes audit log filters", async () => {
    const repository = new FakeAdminSensitiveRepository();
    const useCase = new AdminSensitiveUseCase(repository);

    await useCase.listAuditLogs({
      page: 2,
      pageSize: 10,
      action: "admin_sensitive_raw_view",
      targetType: "deal",
      from: "2026-06-01T00:00:00.000Z",
    });

    expect(repository.auditListInput).toEqual({
      page: 2,
      pageSize: 10,
      actorUserId: null,
      targetUserId: null,
      action: "ADMIN_SENSITIVE_RAW_VIEW",
      targetType: "DEAL",
      from: new Date("2026-06-01T00:00:00.000Z"),
      to: null,
    });
  });

  it("rejects invalid audit filters", () => {
    const repository = new FakeAdminSensitiveRepository();
    const useCase = new AdminSensitiveUseCase(repository);

    expect(() => useCase.listAuditLogs({ action: "UNKNOWN" })).toThrow(
      ValidationDomainError
    );
  });
});
