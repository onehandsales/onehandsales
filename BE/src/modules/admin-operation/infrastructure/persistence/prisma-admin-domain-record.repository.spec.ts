import {
  AdminDomainRecordDomain,
  AdminDomainRecordSort,
} from "@/modules/admin-operation/application/ports/admin-domain-record.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminDomainRecordRepository } from "./prisma-admin-domain-record.repository";

const targetUserId = "00000000-0000-4000-8000-000000000010";

// 기능 : PrismaAdminDomainRecordRepository의 Admin 도메인 read-only 안전 select 정책을 테스트합니다.
describe("PrismaAdminDomainRecordRepository", () => {
  // 기능 : 회사 목록 조회가 userId 소유 조건과 deletedAt 필터를 포함하는지 검증합니다.
  it("queries company records with user ownership and deleted filter", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminDomainRecordRepository(
      client as unknown as PrismaService
    );

    const response = await repository.listDomainRecords({
      userId: targetUserId,
      domain: AdminDomainRecordDomain.COMPANY,
      includeDeleted: false,
      limit: 30,
      sort: AdminDomainRecordSort.CREATED_AT_DESC,
    });
    const query = client.company.findMany.mock.calls[0]?.[0];

    expect(response.items[0]?.displayTitle).toBe("삼성전자");
    expect(query?.where).toEqual(
      expect.objectContaining({
        userId: targetUserId,
        deletedAt: null,
      })
    );
    expect(JSON.stringify(query?.select)).not.toContain("memoCiphertext");
    expect(JSON.stringify(query?.select)).not.toContain("memoKeyVersion");
  });

  // 기능 : 회의록 목록 조회가 body/rawText 원문 필드를 select하지 않는지 검증합니다.
  it("does not select meeting note body or rawText in readonly tabs", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminDomainRecordRepository(
      client as unknown as PrismaService
    );

    const response = await repository.listDomainRecords({
      userId: targetUserId,
      domain: AdminDomainRecordDomain.MEETING_NOTE,
      includeDeleted: true,
      limit: 30,
      sort: AdminDomainRecordSort.CREATED_AT_DESC,
    });
    const query = client.meetingNote.findMany.mock.calls[0]?.[0];

    expect(response.items[0]?.summary["bodyPreview"]).toBe("본문 숨김");
    expect(JSON.stringify(query?.select)).not.toContain("details");
    expect(JSON.stringify(query?.select)).not.toContain("rawText");
    expect(JSON.stringify(query?.select)).not.toContain("nextPlan");
    expect(JSON.stringify(query?.select)).not.toContain("requiredAction");
  });

  // 기능 : 명함 스캔 목록 조회가 provider prompt/token/cost 원문 계열을 select하지 않는지 검증합니다.
  it("does not select business card provider prompt token or cost fields", async () => {
    const client = createClientMock();
    const repository = new PrismaAdminDomainRecordRepository(
      client as unknown as PrismaService
    );

    await repository.listDomainRecords({
      userId: targetUserId,
      domain: AdminDomainRecordDomain.BUSINESS_CARD_SCAN,
      includeDeleted: false,
      limit: 30,
      sort: AdminDomainRecordSort.UPDATED_AT_DESC,
    });
    const query = client.businessCardScanLog.findMany.mock.calls[0]?.[0];

    expect(JSON.stringify(query?.select)).not.toContain("promptSnapshot");
    expect(JSON.stringify(query?.select)).not.toContain("requestToken");
    expect(JSON.stringify(query?.select)).not.toContain("totalCost");
  });
});

// 기능 : PrismaAdminDomainRecordRepository 테스트용 Prisma client mock을 생성합니다.
function createClientMock() {
  const now = new Date("2026-08-01T00:00:00.000Z");

  return {
    company: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "00000000-0000-4000-8000-000000000020",
          companyName: "삼성전자",
          address: "주소",
          companyField: { field: "반도체" },
          companyRegion: { region: "경기" },
          _count: {
            contacts: 4,
            dealCompanies: 3,
            memoLogs: 1,
            privateMemoLogs: 1,
          },
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          trashExpiresAt: null,
        },
      ]),
    },
    contact: { findMany: jest.fn().mockResolvedValue([]) },
    product: { findMany: jest.fn().mockResolvedValue([]) },
    deal: { findMany: jest.fn().mockResolvedValue([]) },
    schedule: { findMany: jest.fn().mockResolvedValue([]) },
    meetingNote: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "00000000-0000-4000-8000-000000000021",
          title: "회의록",
          sourceType: "MANUAL",
          meetingAt: now,
          timeZone: "Asia/Seoul",
          _count: {
            companies: 1,
            contacts: 1,
            products: 0,
            deals: 2,
          },
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          trashExpiresAt: null,
        },
      ]),
    },
    businessCardScanLog: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "00000000-0000-4000-8000-000000000022",
          status: "OCR_SUCCESS",
          companyName: "삼성전자",
          contactName: "홍길동",
          contactMobile: "01012345678",
          contactEmail: "local.user@example.com",
          companyResolution: "EXISTING",
          contactResolution: "CREATED",
          companyId: null,
          contactId: null,
          safeErrorCode: null,
          safeErrorMessage: null,
          retryable: false,
          confirmedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ]),
    },
    importJob: { findMany: jest.fn().mockResolvedValue([]) },
    adminAuditLog: { create: jest.fn() },
    user: { findUnique: jest.fn() },
  };
}
