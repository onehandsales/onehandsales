import {
  MeetingNoteSort,
  MeetingNoteSourceTypeValue,
  type CompanySnapshotRecord,
  type ContactSnapshotRecord,
  type CreateMeetingNoteInput,
  type DealSnapshotRecord,
  type LinkMeetingNoteDealsInput,
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
  dealActivityLogs: Array<{
    readonly dealId: string;
    readonly followingAction: string;
  }> = [];
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
      const meetingDateMatched =
        (!input.meetingAtFrom ||
          (meetingNote.meetingAt !== null &&
            meetingNote.meetingAt >= input.meetingAtFrom)) &&
        (!input.meetingAtTo ||
          (meetingNote.meetingAt !== null &&
            meetingNote.meetingAt < input.meetingAtTo));
      const searchMatched =
        !input.search || meetingNote.title.includes(input.search);

      return companyMatched && contactMatched && meetingDateMatched && searchMatched;
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
      title: input.title,
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
      ...(input.title !== undefined ? { title: input.title } : {}),
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

  // 기능 : fake 회의록 딜 연결을 추가하고 활동 로그 생성을 기록합니다.
  async linkMeetingNoteDeals(input: LinkMeetingNoteDealsInput): Promise<void> {
    const index = this.meetingNotes.findIndex(
      (meetingNote) => meetingNote.id === input.meetingNoteId
    );
    const existing = this.meetingNotes[index];

    if (!existing) {
      return;
    }

    const appendedDeals = input.deals.map((deal, relationIndex) => ({
      id: `meeting-note-deal-${existing.deals.length + relationIndex + 1}`,
      ...deal,
      createdAt: BASE_DATE,
    }));

    this.meetingNotes[index] = {
      ...existing,
      deals: [...existing.deals, ...appendedDeals],
      updatedAt: new Date("2026-06-15T01:00:00.000Z"),
    };

    input.deals.forEach((deal) => {
      this.dealActivityLogs.push({
        dealId: deal.dealId,
        followingAction: input.activityLogText,
      });
    });
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
  it("includes companyId in contact filter options", async () => {
    const { repository, service } = createService();
    jest.spyOn(repository, "listFilterContacts").mockResolvedValue([
      {
        id: "contact-1",
        companyId: "company-1",
        contactUsername: "Kim",
        createdAt: BASE_DATE,
      },
    ]);

    const result = await service.listFilterContacts(CURRENT_USER);

    expect(result.items).toEqual([
      {
        id: "contact-1",
        companyId: "company-1",
        contactUsername: "Kim",
        createdAt: BASE_DATE.toISOString(),
      },
    ]);
  });

  it("TEXT_AI sourceType 생성 요청은 원문 저장 없이 출처만 보존한다", async () => {
    const { repository, service } = createService();

    const created = await service.createMeetingNote(CURRENT_USER, {
      sourceType: MeetingNoteSourceTypeValue.TEXT_AI,
      title: "AI 회의록",
      meetingLocalDateTime: "2026-06-15T09:30",
      details: "details",
      companies: ["company-1"],
      contacts: ["contact-1"],
    });

    expect(created.sourceType).toBe(MeetingNoteSourceTypeValue.TEXT_AI);
    expect(repository.meetingNotes[0]?.rawText).toBeNull();
    expect(repository.transactionCount).toBe(1);
  });

  it("회사와 연락처 ID로 원본을 조회해 스냅샷을 저장한다", async () => {
    const { repository, service } = createService();

    const created = await service.createMeetingNote(CURRENT_USER, {
      title: "Acme 미팅",
      meetingLocalDateTime: "2026-06-15T09:30",
      details: "상세 내용",
      nextPlan: "다음 계획",
      requiredAction: "필요 액션",
      companies: ["company-1"],
      contacts: ["contact-1"],
      products: ["product-1"],
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
        title: "존재하지 않는 딜 미팅",
        details: "상세 내용",
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: ["company-1"],
        contacts: ["contact-1"],
        deals: ["missing-deal"],
      })
    ).rejects.toBeInstanceOf(RelatedDealNotFoundError);
    expect(repository.transactionCount).toBe(1);
    expect(repository.meetingNotes).toHaveLength(0);
  });

  it("회의록 수정에서 빈 products와 deals 배열은 기존 관계를 제거한다", async () => {
    const { repository, service } = createService();
    const created = await service.createMeetingNote(CURRENT_USER, {
      title: "수정 대상 회의록",
      details: "상세 내용",
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
      products: ["product-1"],
      deals: ["deal-1"],
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

  it("저장된 회의록에 신규 딜을 연결하고 딜 활동 로그를 생성한다", async () => {
    const { repository, service } = createService();
    repository.deals.push({
      id: "deal-2",
      dealName: "Acme Upsell",
      dealStatus: "PROPOSAL_QUOTE",
      dealCost: 7000,
      expectedEndDate: new Date("2026-07-31T00:00:00.000Z"),
    });
    const created = await service.createMeetingNote(CURRENT_USER, {
      title: "딜 연결 회의록",
      details: "상세 내용",
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
      deals: ["deal-1"],
    });

    const linked = await service.linkMeetingNoteDeals(CURRENT_USER, created.id, {
      deals: ["deal-1", "deal-2"],
    });

    expect(linked.deals.map((deal) => deal.dealId)).toEqual(["deal-1", "deal-2"]);
    expect(repository.dealActivityLogs).toEqual([
      {
        dealId: "deal-2",
        followingAction: expect.stringContaining(`/meeting-notes/${created.id}`),
      },
    ]);
    expect(repository.transactionCount).toBe(2);
  });

  it("이미 연결된 딜만 요청하면 중복 연결과 활동 로그 생성을 건너뛴다", async () => {
    const { repository, service } = createService();
    const created = await service.createMeetingNote(CURRENT_USER, {
      title: "중복 딜 회의록",
      details: "상세 내용",
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
      deals: ["deal-1"],
    });

    const linked = await service.linkMeetingNoteDeals(CURRENT_USER, created.id, {
      deals: ["deal-1"],
    });

    expect(linked.deals).toHaveLength(1);
    expect(repository.dealActivityLogs).toEqual([]);
    expect(repository.transactionCount).toBe(1);
  });

  it("목록 응답은 관계 배열 대신 label과 count summary를 반환한다", async () => {
    const { service } = createService();
    await service.createMeetingNote(CURRENT_USER, {
      title: "목록 회의록",
      details: "상세 내용",
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
      products: [],
      deals: [],
    });

    const result = await service.listMeetingNotes(CURRENT_USER, {
      page: 1,
      sort: MeetingNoteSort.CREATED_AT_DESC,
    });

    expect(result.items[0]?.companies).toEqual({ label: "Acme", count: 1 });
    expect(result.items[0]?.contacts).toEqual({ label: "Kim", count: 1 });
    expect(result.items[0]?.title).toBe("목록 회의록");
  });

  it("목록 검색어는 제목 기준으로 회의록을 필터링한다", async () => {
    const { service } = createService();
    await service.createMeetingNote(CURRENT_USER, {
      title: "분기 전략 회의",
      details: "상세 내용",
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
    });
    await service.createMeetingNote(CURRENT_USER, {
      title: "제품 데모 회의",
      details: "상세 내용",
      meetingLocalDateTime: "2026-06-16T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
    });

    const result = await service.listMeetingNotes(CURRENT_USER, {
      page: 1,
      search: "데모",
      sort: MeetingNoteSort.CREATED_AT_DESC,
    });

    expect(result.items.map((item) => item.title)).toEqual(["제품 데모 회의"]);
  });
});
