import {
  MeetingNoteSourceType as PrismaMeetingNoteSourceType,
  Prisma,
} from "@prisma/client";
import {
  MeetingNoteSort,
  MeetingNoteSourceTypeValue,
  type CompanySnapshotRecord,
  type ContactSnapshotRecord,
  type CreateMeetingNoteInput,
  type DealSnapshotRecord,
  type ListMeetingNotesInput,
  type MeetingNoteCompanyRecord,
  type MeetingNoteContactRecord,
  type MeetingNoteDealRecord,
  type MeetingNoteFilterCompanyOptionRecord,
  type MeetingNoteFilterContactOptionRecord,
  type MeetingNoteListRecord,
  type MeetingNoteProductRecord,
  type MeetingNoteRecord,
  type MeetingNoteRepository,
  type ProductSnapshotRecord,
  type ReplaceMeetingNoteRelationsInput,
  type SaveMeetingNoteCompanyInput,
  type SaveMeetingNoteContactInput,
  type SaveMeetingNoteDealInput,
  type SaveMeetingNoteProductInput,
  type UpdateMeetingNoteInput,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type MeetingNotePrismaClient = PrismaService | Prisma.TransactionClient;

const meetingNoteInclude = {
  companies: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  contacts: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  products: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  deals: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.MeetingNoteInclude;

type MeetingNoteRow = Prisma.MeetingNoteGetPayload<{
  include: typeof meetingNoteInclude;
}>;

// 역할 : PrismaMeetingNoteRepository 회의록 저장소 계약을 Prisma 기반 영속성으로 구현합니다.
export class PrismaMeetingNoteRepository implements MeetingNoteRepository {
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: MeetingNotePrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 회의록 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: MeetingNoteRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaMeetingNoteRepository(transaction, null));
    });
  }

  // 기능 : 현재 사용자의 회의록 회사 필터 옵션을 조회합니다.
  async listFilterCompanies(
    userId: string
  ): Promise<MeetingNoteFilterCompanyOptionRecord[]> {
    const rows = await this.client.meetingNoteCompany.findMany({
      where: {
        userId,
        companyId: { not: null },
      },
      select: {
        companyId: true,
        companyNameSnapshot: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const seen = new Set<string>();
    const items: MeetingNoteFilterCompanyOptionRecord[] = [];

    for (const row of rows) {
      if (!row.companyId || seen.has(row.companyId)) {
        continue;
      }

      seen.add(row.companyId);
      items.push({
        id: row.companyId,
        companyName: row.companyNameSnapshot,
        createdAt: row.createdAt,
      });
    }

    return items;
  }

  // 기능 : 현재 사용자의 회의록 연락처 필터 옵션을 조회합니다.
  async listFilterContacts(
    userId: string
  ): Promise<MeetingNoteFilterContactOptionRecord[]> {
    const rows = await this.client.meetingNoteContact.findMany({
      where: {
        userId,
        contactId: { not: null },
      },
      select: {
        contactId: true,
        contactUsernameSnapshot: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const seen = new Set<string>();
    const items: MeetingNoteFilterContactOptionRecord[] = [];

    for (const row of rows) {
      if (!row.contactId || seen.has(row.contactId)) {
        continue;
      }

      seen.add(row.contactId);
      items.push({
        id: row.contactId,
        contactUsername: row.contactUsernameSnapshot,
        createdAt: row.createdAt,
      });
    }

    return items;
  }

  // 기능 : 현재 사용자의 회사 ID 목록을 관계 스냅샷 생성용으로 조회합니다.
  async findCompaniesByIds(
    userId: string,
    companyIds: readonly string[]
  ): Promise<CompanySnapshotRecord[]> {
    if (companyIds.length === 0) {
      return [];
    }

    const companies = await this.client.company.findMany({
      where: {
        id: { in: [...companyIds] },
        userId,
      },
      select: {
        id: true,
        companyName: true,
        companyField: { select: { field: true } },
        companyRegion: { select: { region: true } },
      },
    });

    return companies.map((company) => ({
      id: company.id,
      companyName: company.companyName,
      companyField: company.companyField.field,
      companyRegion: company.companyRegion.region,
    }));
  }

  // 기능 : 현재 사용자의 연락처 ID 목록을 관계 스냅샷 생성용으로 조회합니다.
  async findContactsByIds(
    userId: string,
    contactIds: readonly string[]
  ): Promise<ContactSnapshotRecord[]> {
    if (contactIds.length === 0) {
      return [];
    }

    const contacts = await this.client.contact.findMany({
      where: {
        id: { in: [...contactIds] },
        userId,
      },
      select: {
        id: true,
        companyId: true,
        username: true,
        email: true,
        mobile: true,
        company: { select: { companyName: true } },
        contactDepartment: { select: { departmentName: true } },
        contactJobGrade: { select: { jobGradeName: true } },
      },
    });

    return contacts.map((contact) => ({
      id: contact.id,
      companyId: contact.companyId,
      username: contact.username,
      email: contact.email,
      mobile: contact.mobile,
      companyName: contact.company.companyName,
      departmentName: contact.contactDepartment.departmentName,
      jobGradeName: contact.contactJobGrade.jobGradeName,
    }));
  }

  // 기능 : 현재 사용자의 제품 ID 목록을 관계 스냅샷 생성용으로 조회합니다.
  async findProductsByIds(
    userId: string,
    productIds: readonly string[]
  ): Promise<ProductSnapshotRecord[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.client.product.findMany({
      where: {
        id: { in: [...productIds] },
        userId,
      },
      select: {
        id: true,
        productName: true,
        productPrice: true,
        productCategory: { select: { categoryName: true } },
        productStatus: { select: { statusName: true } },
      },
    });

    return products.map((product) => ({
      id: product.id,
      productName: product.productName,
      productPrice: product.productPrice,
      categoryName: product.productCategory.categoryName,
      statusName: product.productStatus.statusName,
    }));
  }

  // 기능 : 현재 사용자의 딜 ID 목록을 관계 스냅샷 생성용으로 조회합니다.
  async findDealsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<DealSnapshotRecord[]> {
    if (dealIds.length === 0) {
      return [];
    }

    const deals = await this.client.deal.findMany({
      where: {
        id: { in: [...dealIds] },
        userId,
      },
      select: {
        id: true,
        dealName: true,
        dealStatus: true,
        dealCost: true,
        expectedEndDate: true,
      },
    });

    return deals.map((deal) => ({
      id: deal.id,
      dealName: deal.dealName,
      dealStatus: deal.dealStatus,
      dealCost: deal.dealCost,
      expectedEndDate: deal.expectedEndDate,
    }));
  }

  // 기능 : 현재 사용자의 회의록 목록을 필터와 페이지 조건으로 조회합니다.
  async listMeetingNotes(
    input: ListMeetingNotesInput
  ): Promise<MeetingNoteListRecord> {
    const where = this.createListWhere(input);
    const [totalCount, items] = await Promise.all([
      this.client.meetingNote.count({ where }),
      this.client.meetingNote.findMany({
        where,
        include: meetingNoteInclude,
        orderBy: this.createListOrderBy(input.sort),
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
    ]);

    return {
      totalCount,
      items: items.map((item) => this.mapMeetingNoteRecord(item)),
    };
  }

  // 기능 : 현재 사용자의 회의록 단건 상세를 관계 스냅샷과 함께 조회합니다.
  async findMeetingNote(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteRecord | null> {
    const meetingNote = await this.client.meetingNote.findFirst({
      where: {
        id: meetingNoteId,
        userId,
      },
      include: meetingNoteInclude,
    });

    return meetingNote ? this.mapMeetingNoteRecord(meetingNote) : null;
  }

  // 기능 : 현재 사용자의 회의록 기본 row를 생성합니다.
  async createMeetingNote(
    input: CreateMeetingNoteInput
  ): Promise<{ readonly id: string }> {
    return this.client.meetingNote.create({
      data: {
        userId: input.userId,
        sourceType: input.sourceType as PrismaMeetingNoteSourceType,
        meetingAt: input.meetingAt,
        timeZone: input.timeZone,
        details: input.details,
        nextPlan: input.nextPlan,
        requiredAction: input.requiredAction,
        rawText: input.rawText,
      },
      select: {
        id: true,
      },
    });
  }

  // 기능 : 현재 사용자의 회의록 기본 row를 수정합니다.
  async updateMeetingNote(
    userId: string,
    meetingNoteId: string,
    input: UpdateMeetingNoteInput
  ): Promise<boolean> {
    const data: Prisma.MeetingNoteUpdateManyMutationInput = {};

    if (input.sourceType !== undefined) {
      data.sourceType = input.sourceType as PrismaMeetingNoteSourceType;
    }

    if (input.meetingAt !== undefined) {
      data.meetingAt = input.meetingAt;
    }

    if (input.timeZone !== undefined) {
      data.timeZone = input.timeZone;
    }

    if (input.details !== undefined) {
      data.details = input.details;
    }

    if (input.nextPlan !== undefined) {
      data.nextPlan = input.nextPlan;
    }

    if (input.requiredAction !== undefined) {
      data.requiredAction = input.requiredAction;
    }

    if (input.rawText !== undefined) {
      data.rawText = input.rawText;
    }

    const updated = await this.client.meetingNote.updateMany({
      where: {
        id: meetingNoteId,
        userId,
      },
      data,
    });

    return updated.count > 0;
  }

  // 기능 : 요청에 포함된 회의록 관계 스냅샷 목록을 교체합니다.
  async replaceMeetingNoteRelations(
    input: ReplaceMeetingNoteRelationsInput
  ): Promise<void> {
    if (input.companies !== undefined) {
      await this.replaceCompanies(input, input.companies);
    }

    if (input.contacts !== undefined) {
      await this.replaceContacts(input, input.contacts);
    }

    if (input.products !== undefined) {
      await this.replaceProducts(input, input.products);
    }

    if (input.deals !== undefined) {
      await this.replaceDeals(input, input.deals);
    }
  }

  // 기능 : 회의록 목록 조회용 Prisma where 조건을 생성합니다.
  private createListWhere(
    input: ListMeetingNotesInput
  ): Prisma.MeetingNoteWhereInput {
    const where: Prisma.MeetingNoteWhereInput = {
      userId: input.userId,
    };

    if (input.companyIds.length > 0) {
      where.companies = {
        some: {
          userId: input.userId,
          companyId: { in: [...input.companyIds] },
        },
      };
    }

    if (input.contactIds.length > 0) {
      where.contacts = {
        some: {
          userId: input.userId,
          contactId: { in: [...input.contactIds] },
        },
      };
    }

    if (input.meetingAtFrom || input.meetingAtTo) {
      where.meetingAt = {
        ...(input.meetingAtFrom ? { gte: input.meetingAtFrom } : {}),
        ...(input.meetingAtTo ? { lt: input.meetingAtTo } : {}),
      };
    }

    return where;
  }

  // 기능 : 회의록 목록 정렬 값에 맞는 Prisma orderBy 조건을 생성합니다.
  private createListOrderBy(
    sort: MeetingNoteSort
  ): Prisma.MeetingNoteOrderByWithRelationInput[] {
    if (sort === MeetingNoteSort.MEETING_AT_DESC) {
      return [
        { meetingAt: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ];
    }

    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  // 기능 : 회의록 회사 스냅샷 목록을 삭제 후 재생성합니다.
  private async replaceCompanies(
    input: ReplaceMeetingNoteRelationsInput,
    companies: readonly SaveMeetingNoteCompanyInput[]
  ): Promise<void> {
    await this.client.meetingNoteCompany.deleteMany({
      where: {
        userId: input.userId,
        meetingNoteId: input.meetingNoteId,
      },
    });
    await Promise.all(
      companies.map((company) =>
        this.client.meetingNoteCompany.create({
          data: {
            userId: input.userId,
            meetingNoteId: input.meetingNoteId,
            companyId: company.companyId,
            companyNameSnapshot: company.companyNameSnapshot,
            companyFieldSnapshot: company.companyFieldSnapshot,
            companyRegionSnapshot: company.companyRegionSnapshot,
          },
        })
      )
    );
  }

  // 기능 : 회의록 연락처 스냅샷 목록을 삭제 후 재생성합니다.
  private async replaceContacts(
    input: ReplaceMeetingNoteRelationsInput,
    contacts: readonly SaveMeetingNoteContactInput[]
  ): Promise<void> {
    await this.client.meetingNoteContact.deleteMany({
      where: {
        userId: input.userId,
        meetingNoteId: input.meetingNoteId,
      },
    });
    await Promise.all(
      contacts.map((contact) =>
        this.client.meetingNoteContact.create({
          data: {
            userId: input.userId,
            meetingNoteId: input.meetingNoteId,
            contactId: contact.contactId,
            companyId: contact.companyId,
            contactUsernameSnapshot: contact.contactUsernameSnapshot,
            contactEmailSnapshot: contact.contactEmailSnapshot,
            contactMobileSnapshot: contact.contactMobileSnapshot,
            contactCompanyNameSnapshot: contact.contactCompanyNameSnapshot,
            contactDepartmentSnapshot: contact.contactDepartmentSnapshot,
            contactJobGradeSnapshot: contact.contactJobGradeSnapshot,
          },
        })
      )
    );
  }

  // 기능 : 회의록 제품 스냅샷 목록을 삭제 후 재생성합니다.
  private async replaceProducts(
    input: ReplaceMeetingNoteRelationsInput,
    products: readonly SaveMeetingNoteProductInput[]
  ): Promise<void> {
    await this.client.meetingNoteProduct.deleteMany({
      where: {
        userId: input.userId,
        meetingNoteId: input.meetingNoteId,
      },
    });
    await Promise.all(
      products.map((product) =>
        this.client.meetingNoteProduct.create({
          data: {
            userId: input.userId,
            meetingNoteId: input.meetingNoteId,
            productId: product.productId,
            productNameSnapshot: product.productNameSnapshot,
            productPriceSnapshot: product.productPriceSnapshot,
            productCategorySnapshot: product.productCategorySnapshot,
            productStatusSnapshot: product.productStatusSnapshot,
          },
        })
      )
    );
  }

  // 기능 : 회의록 딜 스냅샷 목록을 삭제 후 재생성합니다.
  private async replaceDeals(
    input: ReplaceMeetingNoteRelationsInput,
    deals: readonly SaveMeetingNoteDealInput[]
  ): Promise<void> {
    await this.client.meetingNoteDeal.deleteMany({
      where: {
        userId: input.userId,
        meetingNoteId: input.meetingNoteId,
      },
    });
    await Promise.all(
      deals.map((deal) =>
        this.client.meetingNoteDeal.create({
          data: {
            userId: input.userId,
            meetingNoteId: input.meetingNoteId,
            dealId: deal.dealId,
            dealNameSnapshot: deal.dealNameSnapshot,
            dealStatusSnapshot: deal.dealStatusSnapshot,
            dealCostSnapshot: deal.dealCostSnapshot,
            dealExpectedEndDateSnapshot: deal.dealExpectedEndDateSnapshot,
          },
        })
      )
    );
  }

  // 기능 : Prisma 회의록 row를 application record로 변환합니다.
  private mapMeetingNoteRecord(
    meetingNote: MeetingNoteRow
  ): MeetingNoteRecord {
    return {
      id: meetingNote.id,
      sourceType: meetingNote.sourceType as MeetingNoteSourceTypeValue,
      meetingAt: meetingNote.meetingAt,
      timeZone: meetingNote.timeZone,
      details: meetingNote.details,
      nextPlan: meetingNote.nextPlan,
      requiredAction: meetingNote.requiredAction,
      rawText: meetingNote.rawText,
      companies: meetingNote.companies.map((company) =>
        this.mapCompanyRecord(company)
      ),
      contacts: meetingNote.contacts.map((contact) =>
        this.mapContactRecord(contact)
      ),
      products: meetingNote.products.map((product) =>
        this.mapProductRecord(product)
      ),
      deals: meetingNote.deals.map((deal) => this.mapDealRecord(deal)),
      createdAt: meetingNote.createdAt,
      updatedAt: meetingNote.updatedAt,
    };
  }

  // 기능 : Prisma 회의록 회사 row를 application record로 변환합니다.
  private mapCompanyRecord(
    company: MeetingNoteRow["companies"][number]
  ): MeetingNoteCompanyRecord {
    return {
      id: company.id,
      companyId: company.companyId,
      companyNameSnapshot: company.companyNameSnapshot,
      companyFieldSnapshot: company.companyFieldSnapshot,
      companyRegionSnapshot: company.companyRegionSnapshot,
      createdAt: company.createdAt,
    };
  }

  // 기능 : Prisma 회의록 연락처 row를 application record로 변환합니다.
  private mapContactRecord(
    contact: MeetingNoteRow["contacts"][number]
  ): MeetingNoteContactRecord {
    return {
      id: contact.id,
      contactId: contact.contactId,
      companyId: contact.companyId,
      contactUsernameSnapshot: contact.contactUsernameSnapshot,
      contactEmailSnapshot: contact.contactEmailSnapshot,
      contactMobileSnapshot: contact.contactMobileSnapshot,
      contactCompanyNameSnapshot: contact.contactCompanyNameSnapshot,
      contactDepartmentSnapshot: contact.contactDepartmentSnapshot,
      contactJobGradeSnapshot: contact.contactJobGradeSnapshot,
      createdAt: contact.createdAt,
    };
  }

  // 기능 : Prisma 회의록 제품 row를 application record로 변환합니다.
  private mapProductRecord(
    product: MeetingNoteRow["products"][number]
  ): MeetingNoteProductRecord {
    return {
      id: product.id,
      productId: product.productId,
      productNameSnapshot: product.productNameSnapshot,
      productPriceSnapshot: product.productPriceSnapshot,
      productCategorySnapshot: product.productCategorySnapshot,
      productStatusSnapshot: product.productStatusSnapshot,
      createdAt: product.createdAt,
    };
  }

  // 기능 : Prisma 회의록 딜 row를 application record로 변환합니다.
  private mapDealRecord(
    deal: MeetingNoteRow["deals"][number]
  ): MeetingNoteDealRecord {
    return {
      id: deal.id,
      dealId: deal.dealId,
      dealNameSnapshot: deal.dealNameSnapshot,
      dealStatusSnapshot: deal.dealStatusSnapshot,
      dealCostSnapshot: deal.dealCostSnapshot,
      dealExpectedEndDateSnapshot: deal.dealExpectedEndDateSnapshot,
      createdAt: deal.createdAt,
    };
  }
}
