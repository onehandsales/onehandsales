import { AdminSensitiveFieldSet, AdminTargetType } from "@prisma/client";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminAuditRepository } from "./prisma-admin-audit.repository";

// 기능 : PrismaAdminAuditRepository의 민감 원문 select와 audit metadata 저장 정책을 테스트합니다.
describe("PrismaAdminAuditRepository", () => {
  // 기능 : 회의록 본문 조회에서 rawText를 select하지 않는지 검증합니다.
  it("does not select meeting note rawText for meeting note body access", async () => {
    const client = {
      meetingNote: {
        findFirst: jest.fn().mockResolvedValue({
          title: "회의록 제목",
          details: "허용 본문",
          nextPlan: null,
          requiredAction: null,
        }),
      },
    };
    const repository = new PrismaAdminAuditRepository(
      client as unknown as PrismaService
    );

    const result = await repository.findMeetingNoteBody({
      targetUserId: "00000000-0000-4000-8000-000000000010",
      targetId: "00000000-0000-4000-8000-000000000020",
    });
    const query = client.meetingNote.findFirst.mock.calls[0]?.[0];

    expect(query?.select).toEqual({
      title: true,
      details: true,
      nextPlan: true,
      requiredAction: true,
    });
    expect(JSON.stringify(query?.select)).not.toContain("rawText");
    expect(result?.returnedFieldNames).toEqual([
      "title",
      "details",
      "nextPlan",
      "requiredAction",
    ]);
  });

  // 기능 : 감사 metadata에는 반환 필드명만 저장하고 원문 data를 저장하지 않는지 검증합니다.
  it("stores returned field names without raw sensitive values in audit metadata", async () => {
    const client = {
      adminAuditLog: {
        create: jest.fn().mockResolvedValue({
          id: "00000000-0000-4000-8000-000000000030",
        }),
      },
      adminSensitiveAccessLog: {
        create: jest.fn().mockResolvedValue({
          id: "00000000-0000-4000-8000-000000000040",
          targetUserId: "00000000-0000-4000-8000-000000000010",
          targetType: AdminTargetType.MEETING_NOTE,
          targetId: "00000000-0000-4000-8000-000000000020",
          fieldSet: AdminSensitiveFieldSet.MEETING_NOTE_BODY,
          returnedFieldNames: ["title", "details"],
          createdAt: new Date("2026-08-01T00:00:00.000Z"),
        }),
      },
    };
    const repository = new PrismaAdminAuditRepository(
      client as unknown as PrismaService
    );

    await repository.createSensitiveAccessLog({
      adminUserId: "00000000-0000-4000-8000-000000000001",
      targetUserId: "00000000-0000-4000-8000-000000000010",
      targetType: AdminTargetType.MEETING_NOTE,
      targetId: "00000000-0000-4000-8000-000000000020",
      fieldSet: AdminSensitiveFieldSet.MEETING_NOTE_BODY,
      reason: "사용자 복구 문의 처리 때문에 본문 확인이 필요해요",
      requestId: "req-1",
      ipHash: "ip-hash",
      userAgentHash: "ua-hash",
      returnedFieldNames: ["title", "details"],
    });
    const auditCreateInput = client.adminAuditLog.create.mock.calls[0]?.[0];

    expect(auditCreateInput?.data.metadataJson).toEqual({
      fieldSet: AdminSensitiveFieldSet.MEETING_NOTE_BODY,
      returnedFieldNames: ["title", "details"],
    });
    expect(JSON.stringify(auditCreateInput?.data.metadataJson)).not.toContain(
      "허용 본문"
    );
    expect(client.adminSensitiveAccessLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          auditLogId: "00000000-0000-4000-8000-000000000030",
        }),
      })
    );
  });
});
