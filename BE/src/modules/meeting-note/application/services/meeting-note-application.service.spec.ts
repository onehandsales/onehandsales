import {
  MeetingNoteSort,
  MeetingNoteSourceTypeValue,
  type CompanySnapshotRecord,
  type ContactSnapshotRecord,
  type CreateMeetingNoteInput,
  type DealSnapshotRecord,
  type ListMeetingNotesInput,
  type MeetingNoteFilterCompanyOptionRecord,
  type MeetingNoteFilterContactOptionRecord,
  type MeetingNoteListRecord,
  type MeetingNoteRecord,
  type MeetingNoteRepository,
  type ProductSnapshotRecord,
  type ReplaceMeetingNoteRelationsInput,
  type UpdateMeetingNoteInput,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import { RelatedDealNotFoundError } from "@/modules/meeting-note/domain/meeting-note.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { MeetingNoteApplicationService } from "./meeting-note-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const BASE_DATE = new Date("2026-06-15T00:00:00.000Z");

// 역할 : FakeMeetingNoteRepository 테스트용 회의록 저장소를 메모리에 구현합니다.
class FakeMeetingNoteRepository implements MeetingNoteRepository {
  transactionCount = 0;
  meetingNotes: MeetingNoteRecord[] = [];
  companies: CompanySnapshotRecord[] = [
    {
      id: "company-1",
      companyName: "Acme",
      companyField: "Software",
      companyRegion: "Seoul",
    },
  ];
  contacts: ContactSnapshotRecord[] = [
    {
      id: "contact-1",
      companyId: "company-1",
      username: "Kim",
      email: "kim@example.com",
      mobile: "010-0000-0000",
      companyName: "Acme",
      departmentName: "Sales",
      jobGradeName: "Manager",
    },
  ];
  products: ProductSnapshotRecord[] = [
    {
      id: "product-1",
      productName: "CRM",
      productPrice: 1000,
      categoryName: "SaaS",
      statusName: "Active",
    },
  ];
  deals: DealSnapshotRecord[] = [
    {
      id: "deal-1",
      dealName: "Acme Renewal",
      dealStatus: "NEGOTIATION",
      dealCost: 5000,
      expectedEndDate: new Date("2026-06-30T00:00:00.000Z"),
    },
  ];

  // 기능 : fake transaction 안에서 callback을 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: MeetingNoteRepository) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this);
  }

  // 기능 : fake 회사 필터 옵션을 반환합니다.
  async listFilterCompanies(): Promise<MeetingNoteFilterCompanyOptionRecord[]> {
    return [];
  }

  // 기능 : fake 연락처 필터 옵션을 반환합니다.
  async listFilterContacts(): Promise<MeetingNoteFilterContactOptionRecord[]> {
    return [];
  }

  // 기능 : fake 회사 ID 목록을 조회합니다.
  async findCompaniesByIds(
    userId: string,
    companyIds: readonly string[]
  ): Promise<CompanySnapshotRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.companies.filter((company) => companyIds.includes(company.id));
  }

  // 기능 : fake 연락처 ID 목록을 조회합니다.
  async findContactsByIds(
    userId: string,
    contactIds: readonly string[]
  ): Promise<ContactSnapshotRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.contacts.filter((contact) => contactIds.includes(contact.id));
  }

  // 기능 : fake 제품 ID 목록을 조회합니다.
  async findProductsByIds(
    userId: string,
    productIds: readonly string[]
  ): Promise<ProductSnapshotRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.products.filter((product) => productIds.includes(product.id));
  }

  // 기능 : fake 딜 ID 목록을 조회합니다.
  async findDealsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<DealSnapshotRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.deals.filter((deal) => dealIds.includes(deal.id));
  }

  // 기능 : fake 회의록 목록을 페이지 응답으로 반환합니다.
  async listMeetingNotes(
    input: ListMeetingNotesInput
  ): Promise<MeetingNoteListRecord> {
    const items = this.meetingNotes.filter((meetingNote) => {
      const companyMatched =
        input.companyIds.length === 0 ||
        meetingNote.companies.some((company) =>
          company.companyId ? input.companyIds.includes(company.companyId) : false
        );
      const contactMatched =
        input.contactIds.length === 0 ||
        meetingNote.contacts.some((contact) =>
          contact.contactId ? input.contactIds.includes(contact.contactId) : false
        );

      return companyMatched && contactMatched;
    });

    return { items, totalCount: items.length };
  }

  // 기능 : fake 회의록 단건을 조회합니다.
  async findMeetingNote(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteRecord | null> {
    if (userId !== CURRENT_USER.id) {
      return null;
    }

    return this.meetingNotes.find((item) => item.id === meetingNoteId) ?? null;
  }

  // 기능 : fake 회의록 기본 row를 생성합니다.
  async createMeetingNote(
    input: CreateMeetingNoteInput
  ): Promise<{ readonly id: string }> {
    const id = `meeting-note-${this.meetingNotes.length + 1}`;
    this.meetingNotes.push({
      id,
      sourceType: input.sourceType,
      meetingAt: input.meetingAt,
      timeZone: input.timeZone,
      details: input.details,
      nextPlan: input.nextPlan,
      requiredAction: input.requiredAction,
      rawText: input.rawText,
      companies: [],
      contacts: [],
      products: [],
      deals: [],
      createdAt: BASE_DATE,
      updatedAt: BASE_DATE,
    });

    return { id };
  }

  // 기능 : fake 회의록 기본 row를 수정합니다.
  async updateMeetingNote(
    userId: string,
    meetingNoteId: string,
    input: UpdateMeetingNoteInput
  ): Promise<boolean> {
    const index = this.meetingNotes.findIndex(
      (meetingNote) => meetingNote.id === meetingNoteId && userId === CURRENT_USER.id
    );

    if (index < 0) {
      return false;
    }

    const existing = this.meetingNotes[index];

    if (!existing) {
      return false;
    }

    this.meetingNotes[index] = {
      ...existing,
      ...(input.sourceType !== undefined ? { sourceType: input.sourceType } : {}),
      ...(input.meetingAt !== undefined ? { meetingAt: input.meetingAt } : {}),
      ...(input.timeZone !== undefined ? { timeZone: input.timeZone } : {}),
      ...(input.details !== undefined ? { details: input.details } : {}),
      ...(input.nextPlan !== undefined ? { nextPlan: input.nextPlan } : {}),
      ...(input.requiredAction !== undefined
        ? { requiredAction: input.requiredAction }
        : {}),
      updatedAt: new Date("2026-06-15T01:00:00.000Z"),
    };
    return true;
  }

  // 기능 : fake 회의록 관계 스냅샷을 요청 값으로 교체합니다.
  async replaceMeetingNoteRelations(
    input: ReplaceMeetingNoteRelationsInput
  ): Promise<void> {
    const index = this.meetingNotes.findIndex(
      (meetingNote) => meetingNote.id === input.meetingNoteId
    );
    const existing = this.meetingNotes[index];

    if (!existing) {
      return;
    }

    this.meetingNotes[index] = {
      ...existing,
      ...(input.companies !== undefined
        ? {
            companies: input.companies.map((company, relationIndex) => ({
              id: `meeting-note-company-${relationIndex + 1}`,
              ...company,
              createdAt: BASE_DATE,
            })),
          }
        : {}),
      ...(input.contacts !== undefined
        ? {
            contacts: input.contacts.map((contact, relationIndex) => ({
              id: `meeting-note-contact-${relationIndex + 1}`,
              ...contact,
              createdAt: BASE_DATE,
            })),
          }
        : {}),
      ...(input.products !== undefined
        ? {
            products: input.products.map((product, relationIndex) => ({
              id: `meeting-note-product-${relationIndex + 1}`,
              ...product,
              createdAt: BASE_DATE,
            })),
          }
        : {}),
      ...(input.deals !== undefined
        ? {
            deals: input.deals.map((deal, relationIndex) => ({
              id: `meeting-note-deal-${relationIndex + 1}`,
              ...deal,
              createdAt: BASE_DATE,
            })),
          }
        : {}),
    };
  }
}

// 기능 : 테스트용 MeetingNoteApplicationService와 fake 저장소를 생성합니다.
function createService() {
  const repository = new FakeMeetingNoteRepository();
  const logger = {
    log: jest.fn(),
  } as unknown as AppLogger;
  const service = new MeetingNoteApplicationService(repository, logger);

  return { repository, service };
}

describe("MeetingNoteApplicationService", () => {
  it("수동 1차 범위가 아닌 sourceType 생성을 차단한다", async () => {
    const { repository, service } = createService();

    await expect(
      service.createMeetingNote(CURRENT_USER, {
        sourceType: MeetingNoteSourceTypeValue.TEXT_AI,
        details: "details",
        companies: [{ companyName: "Acme" }],
        contacts: [{ contactUsername: "Kim" }],
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
    expect(repository.transactionCount).toBe(0);
  });

  it("snapshot-only 회사와 연락처로 회의록을 트랜잭션 안에서 생성한다", async () => {
    const { repository, service } = createService();

    const created = await service.createMeetingNote(CURRENT_USER, {
      meetingLocalDateTime: "2026-06-15T09:30",
      details: "상세 내용",
      nextPlan: "다음 계획",
      requiredAction: "필요 액션",
      companies: [{ companyName: "Acme", companyField: "Software" }],
      contacts: [{ contactUsername: "Kim", department: "Sales" }],
      products: [{ productName: "CRM", productPrice: 1000 }],
      deals: [],
    });

    expect(repository.transactionCount).toBe(1);
    expect(created.meetingAt).toBe("2026-06-15T00:30:00.000Z");
    expect(created.meetingLocalDateTime).toBe("2026-06-15T09:30:00");
    expect(created.companies[0]?.companyNameSnapshot).toBe("Acme");
    expect(created.contacts[0]?.contactUsernameSnapshot).toBe("Kim");
    expect(created.products[0]?.productNameSnapshot).toBe("CRM");
    expect(created.deals).toEqual([]);
  });

  it("존재하지 않는 딜 연결은 회의록 row 생성 전에 차단한다", async () => {
    const { repository, service } = createService();

    await expect(
      service.createMeetingNote(CURRENT_USER, {
        details: "상세 내용",
        companies: [{ companyName: "Acme" }],
        contacts: [{ contactUsername: "Kim" }],
        deals: [{ dealId: "missing-deal" }],
      })
    ).rejects.toBeInstanceOf(RelatedDealNotFoundError);
    expect(repository.transactionCount).toBe(1);
    expect(repository.meetingNotes).toHaveLength(0);
  });

  it("회의록 수정에서 빈 products와 deals 배열은 기존 관계를 제거한다", async () => {
    const { repository, service } = createService();
    const created = await service.createMeetingNote(CURRENT_USER, {
      details: "상세 내용",
      companies: [{ companyId: "company-1" }],
      contacts: [{ contactId: "contact-1" }],
      products: [{ productId: "product-1" }],
      deals: [{ dealId: "deal-1" }],
    });

    const updated = await service.updateMeetingNote(CURRENT_USER, created.id, {
      details: "수정 내용",
      products: [],
      deals: [],
    });

    expect(updated.details).toBe("수정 내용");
    expect(updated.products).toEqual([]);
    expect(updated.deals).toEqual([]);
    expect(updated.companies).toHaveLength(1);
    expect(updated.contacts).toHaveLength(1);
    expect(repository.transactionCount).toBe(2);
  });

  it("목록 응답은 관계 배열 대신 label과 count summary를 반환한다", async () => {
    const { service } = createService();
    await service.createMeetingNote(CURRENT_USER, {
      details: "상세 내용",
      companies: [{ companyName: "Acme" }],
      contacts: [{ contactUsername: "Kim" }],
      products: [],
      deals: [],
    });

    const result = await service.listMeetingNotes(CURRENT_USER, {
      page: 1,
      sort: MeetingNoteSort.CREATED_AT_DESC,
    });

    expect(result.items[0]?.companies).toEqual({ label: "Acme", count: 1 });
    expect(result.items[0]?.contacts).toEqual({ label: "Kim", count: 1 });
  });
});
