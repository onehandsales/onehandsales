import {
  DealListSort,
  type CountDealsByStatusInput,
  type CreateDealCompaniesInput,
  type CreateDealContactsInput,
  type CreateDealFollowingActionLogInput,
  type CreateDealInput,
  type CreateDealMemoLogInput,
  type DealCompanyRecord,
  type DealContactRecord,
  type DealDetailRecord,
  type DealFollowingActionLogRecord,
  type DealListRecord,
  type DealLogCursor,
  type DealMemoLogRecord,
  type DealPageRecord,
  type DealProductRecord,
  type DealRepository,
  type ExportDealsInput,
  type ListDealsInput,
  type UpdateDealFollowingActionLogInput,
  type UpdateDealInput,
  type UpdateDealMemoLogInput,
} from "@/modules/deal/application/ports/deal.repository";
import { RelatedResourceNotFoundError } from "@/modules/deal/domain/deal.errors";
import { DealStatusCode } from "@/modules/deal/domain/deal-status";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  XlsxWorkbookWriter,
  XlsxWorksheetInput,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { DealApplicationService } from "./deal-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

interface StoredDeal {
  readonly id: string;
  readonly userId: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly companyIds: string[];
  readonly contactIds: string[];
  readonly dealStatus: DealStatusCode;
  readonly expectedEndDate: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : FakeDealRepository 테스트용 딜 저장소를 메모리에서 구현합니다.
class FakeDealRepository implements DealRepository {
  readonly companies: DealCompanyRecord[] = [
    {
      id: "company-1",
      companyName: "A회사",
      companyField: { id: "field-1", field: "SaaS" },
      companyRegion: { id: "region-1", region: "Seoul" },
    },
    {
      id: "company-2",
      companyName: "B회사",
      companyField: { id: "field-2", field: "Commerce" },
      companyRegion: { id: "region-2", region: "Busan" },
    },
  ];

  readonly contacts: DealContactRecord[] = [
    {
      id: "contact-1",
      username: "송재근",
      companyId: "company-1",
      mobile: "010-1111-2222",
      email: "song@example.com",
      contactDepartment: {
        id: "department-1",
        departmentName: "부장",
      },
    },
    {
      id: "contact-2",
      username: "김영업",
      companyId: "company-2",
      mobile: "010-3333-4444",
      email: "kim@example.com",
      contactDepartment: {
        id: "department-2",
        departmentName: "팀장",
      },
    },
  ];

  readonly products: DealProductRecord[] = [
    { id: "product-1", productName: "프리미엄 상품" },
    { id: "product-2", productName: "추가 상품" },
  ];

  deals: StoredDeal[] = [];
  dealProductIds = new Map<string, string[]>();
  followingActionLogs: DealFollowingActionLogRecord[] = [];
  memoLogs: DealMemoLogRecord[] = [];
  transactionCount = 0;

  // 기능 : fake transaction을 현재 저장소에서 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: DealRepository) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this);
  }

  // 기능 : fake 딜 상태별 개수를 반환합니다.
  async countDealsByStatus(
    input: CountDealsByStatusInput
  ): Promise<ReadonlyMap<DealStatusCode, number>> {
    const result = new Map<DealStatusCode, number>();

    for (const deal of this.filterDeals(input)) {
      result.set(deal.dealStatus, (result.get(deal.dealStatus) ?? 0) + 1);
    }

    return result;
  }

  // 기능 : fake 딜 목록을 반환합니다.
  async listDeals(input: ListDealsInput): Promise<DealPageRecord> {
    const records = this.filterDeals(input).map((deal) =>
      this.toDealListRecord(deal)
    );

    return {
      items: records.slice(0, input.pageSize),
      totalCount: records.length,
    };
  }

  // 기능 : fake 딜 export 목록을 반환합니다.
  async listDealsForExport(input: ExportDealsInput): Promise<DealListRecord[]> {
    return this.filterDeals(input).map((deal) => this.toDealListRecord(deal));
  }

  // 기능 : fake 딜 상세를 반환합니다.
  async findDeal(
    userId: string,
    dealId: string
  ): Promise<DealDetailRecord | null> {
    const deal = this.deals.find(
      (item) => item.id === dealId && item.userId === userId
    );

    return deal ? this.toDealDetailRecord(deal) : null;
  }

  // 기능 : fake 딜 존재 여부를 반환합니다.
  async existsDeal(userId: string, dealId: string): Promise<boolean> {
    return this.deals.some((deal) => deal.id === dealId && deal.userId === userId);
  }

  // 기능 : fake 딜을 생성합니다.
  async createDeal(input: CreateDealInput): Promise<{ readonly id: string }> {
    const id = `deal-${this.deals.length + 1}`;
    const createdAt = new Date("2026-06-12T10:00:00.000Z");
    this.deals.push({
      id,
      userId: input.userId,
      dealName: input.dealName,
      dealCost: input.dealCost,
      companyIds: [],
      contactIds: [],
      dealStatus: input.dealStatus,
      expectedEndDate: input.expectedEndDate,
      createdAt,
      updatedAt: createdAt,
    });

    return { id };
  }

  // 기능 : fake 딜을 수정합니다.
  async updateDeal(
    userId: string,
    dealId: string,
    input: UpdateDealInput
  ): Promise<boolean> {
    const deal = this.deals.find(
      (item) => item.id === dealId && item.userId === userId
    );

    if (!deal) {
      return false;
    }

    const updated: StoredDeal = {
      ...deal,
      ...(input.dealName !== undefined ? { dealName: input.dealName } : {}),
      ...(input.dealCost !== undefined ? { dealCost: input.dealCost } : {}),
      ...(input.expectedEndDate !== undefined
        ? { expectedEndDate: input.expectedEndDate }
        : {}),
      ...(input.dealStatus !== undefined ? { dealStatus: input.dealStatus } : {}),
      updatedAt: new Date("2026-06-12T10:30:00.000Z"),
    };

    this.deals = this.deals.map((item) => (item.id === dealId ? updated : item));
    return true;
  }

  async createDealCompanies(input: CreateDealCompaniesInput): Promise<void> {
    this.replaceStoredDeal(input.dealId, { companyIds: [...input.companyIds] });
  }

  async replaceDealCompanies(input: CreateDealCompaniesInput): Promise<void> {
    this.replaceStoredDeal(input.dealId, { companyIds: [...input.companyIds] });
  }

  async createDealContacts(input: CreateDealContactsInput): Promise<void> {
    this.replaceStoredDeal(input.dealId, { contactIds: [...input.contactIds] });
  }

  async replaceDealContacts(input: CreateDealContactsInput): Promise<void> {
    this.replaceStoredDeal(input.dealId, { contactIds: [...input.contactIds] });
  }

  // 기능 : fake 딜-제품 매핑을 생성합니다.
  async createDealProducts(input: {
    readonly dealId: string;
    readonly productIds: string[];
  }): Promise<void> {
    this.dealProductIds.set(input.dealId, input.productIds);
  }

  // 기능 : fake 딜-제품 매핑을 교체합니다.
  async replaceDealProducts(input: {
    readonly dealId: string;
    readonly productIds: string[];
  }): Promise<void> {
    this.dealProductIds.set(input.dealId, input.productIds);
  }

  // 기능 : fake 회사 단건을 반환합니다.
  async findCompanies(
    userId: string,
    companyIds: readonly string[]
  ): Promise<DealCompanyRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.companies.filter((company) => companyIds.includes(company.id));
  }

  // 기능 : fake 담당자 단건을 반환합니다.
  async findContacts(
    userId: string,
    contactIds: readonly string[]
  ): Promise<DealContactRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.contacts.filter((contact) => contactIds.includes(contact.id));
  }

  // 기능 : fake 제품 목록을 반환합니다.
  async findProducts(
    userId: string,
    productIds: readonly string[]
  ): Promise<DealProductRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.products.filter((product) => productIds.includes(product.id));
  }

  // 기능 : fake 회사 옵션 목록을 반환합니다.
  async listCompanyOptions(): Promise<DealCompanyRecord[]> {
    return this.companies;
  }

  // 기능 : fake 담당자 옵션 목록을 반환합니다.
  async listContactOptions(): Promise<DealContactRecord[]> {
    return this.contacts;
  }

  // 기능 : fake 제품 옵션 목록을 반환합니다.
  async listProductOptions(): Promise<DealProductRecord[]> {
    return this.products;
  }

  // 기능 : fake 다음 행동 로그를 생성합니다.
  async createFollowingActionLog(
    input: CreateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord> {
    const createdAt = new Date("2026-06-12T10:01:00.000Z");
    const log: DealFollowingActionLogRecord = {
      id: `following-${this.followingActionLogs.length + 1}`,
      followingAction: input.followingAction,
      checkComplete: false,
      createdAt,
      updatedAt: createdAt,
    };
    this.followingActionLogs.push(log);

    return log;
  }

  // 기능 : fake 다음 행동 로그 목록을 cursor 조건으로 반환합니다.
  async listFollowingActionLogs(input: {
    readonly cursor: DealLogCursor | null;
    readonly take: number;
  }): Promise<DealFollowingActionLogRecord[]> {
    return this.applyCursor(this.sortLogs(this.followingActionLogs), input.cursor).slice(
      0,
      input.take
    );
  }

  // 기능 : fake 다음 행동 로그를 수정합니다.
  async updateFollowingActionLog(
    input: UpdateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord | null> {
    const log = this.followingActionLogs.find(
      (item) => item.id === input.followingActionLogId
    );

    if (!log) {
      return null;
    }

    const updated: DealFollowingActionLogRecord = {
      ...log,
      ...(input.followingAction !== undefined
        ? { followingAction: input.followingAction }
        : {}),
      ...(input.checkComplete !== undefined
        ? { checkComplete: input.checkComplete }
        : {}),
      updatedAt: new Date("2026-06-12T10:40:00.000Z"),
    };
    this.followingActionLogs = this.followingActionLogs.map((item) =>
      item.id === log.id ? updated : item
    );

    return updated;
  }

  // 기능 : fake 메모 로그를 생성합니다.
  async createMemoLog(input: CreateDealMemoLogInput): Promise<DealMemoLogRecord> {
    const createdAt = new Date("2026-06-12T10:02:00.000Z");
    const log: DealMemoLogRecord = {
      id: `memo-${this.memoLogs.length + 1}`,
      memoType: input.memoType,
      memo: input.memo,
      createdAt,
      updatedAt: createdAt,
    };
    this.memoLogs.push(log);

    return log;
  }

  // 기능 : fake 메모 로그 목록을 cursor 조건으로 반환합니다.
  async listMemoLogs(input: {
    readonly cursor: DealLogCursor | null;
    readonly take: number;
  }): Promise<DealMemoLogRecord[]> {
    return this.applyCursor(this.sortLogs(this.memoLogs), input.cursor).slice(
      0,
      input.take
    );
  }

  // 기능 : fake 메모 로그를 수정합니다.
  async updateMemoLog(
    input: UpdateDealMemoLogInput
  ): Promise<DealMemoLogRecord | null> {
    const log = this.memoLogs.find((item) => item.id === input.memoLogId);

    if (!log) {
      return null;
    }

    const updated: DealMemoLogRecord = {
      ...log,
      ...(input.memoType !== undefined ? { memoType: input.memoType } : {}),
      ...(input.memo !== undefined ? { memo: input.memo } : {}),
      updatedAt: new Date("2026-06-12T10:50:00.000Z"),
    };
    this.memoLogs = this.memoLogs.map((item) =>
      item.id === log.id ? updated : item
    );

    return updated;
  }

  // 기능 : fake 딜을 조회 조건으로 필터링하고 정렬합니다.
  private filterDeals(
    input: {
      readonly userId: string;
      readonly search?: string;
      readonly companyIds?: readonly string[];
      readonly contactIds?: readonly string[];
      readonly dealStatus?: DealStatusCode;
      readonly sort?: DealListSort;
    }
  ): StoredDeal[] {
    const filtered = this.deals.filter((deal) => {
      if (deal.userId !== input.userId) {
        return false;
      }

      if (input.search && !deal.dealName.includes(input.search)) {
        return false;
      }

      if (
        input.companyIds?.length &&
        !deal.companyIds.some((companyId) => input.companyIds?.includes(companyId))
      ) {
        return false;
      }

      if (
        input.contactIds?.length &&
        !deal.contactIds.some((contactId) => input.contactIds?.includes(contactId))
      ) {
        return false;
      }

      if (input.dealStatus && deal.dealStatus !== input.dealStatus) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((left, right) => {
      if (input.sort === DealListSort.DEAL_COST_DESC) {
        return right.dealCost - left.dealCost;
      }

      if (input.sort === DealListSort.DEAL_COST_ASC) {
        return left.dealCost - right.dealCost;
      }

      if (input.sort === DealListSort.EXPECTED_END_DATE_ASC) {
        return left.expectedEndDate.getTime() - right.expectedEndDate.getTime();
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    });
  }

  // 기능 : fake 저장 딜을 목록 레코드로 변환합니다.
  private toDealListRecord(deal: StoredDeal): DealListRecord {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealCost: deal.dealCost,
      dealStatus: deal.dealStatus,
      expectedEndDate: deal.expectedEndDate,
      companies: deal.companyIds.map((companyId) => this.getCompany(companyId)),
      contacts: deal.contactIds.map((contactId) => this.getContact(contactId)),
      latestFollowingAction: this.sortLogs(this.followingActionLogs)[0] ?? null,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    };
  }

  // 기능 : fake 저장 딜을 상세 레코드로 변환합니다.
  private toDealDetailRecord(deal: StoredDeal): DealDetailRecord {
    return {
      ...this.toDealListRecord(deal),
      products: (this.dealProductIds.get(deal.id) ?? []).map((productId) =>
        this.getProduct(productId)
      ),
    };
  }

  // 기능 : fake 회사 단건을 반환하거나 테스트 오류를 던집니다.
  private getCompany(companyId: string): DealCompanyRecord {
    const company = this.companies.find((item) => item.id === companyId);

    if (!company) {
      throw new Error(`Missing fake company: ${companyId}`);
    }

    return company;
  }

  // 기능 : fake 담당자 단건을 반환하거나 테스트 오류를 던집니다.
  private getContact(contactId: string): DealContactRecord {
    const contact = this.contacts.find((item) => item.id === contactId);

    if (!contact) {
      throw new Error(`Missing fake contact: ${contactId}`);
    }

    return contact;
  }

  // 기능 : fake 제품 단건을 반환하거나 테스트 오류를 던집니다.
  private getProduct(productId: string): DealProductRecord {
    const product = this.products.find((item) => item.id === productId);

    if (!product) {
      throw new Error(`Missing fake product: ${productId}`);
    }

    return product;
  }

  // 기능 : fake 로그를 최신순으로 정렬합니다.
  private replaceStoredDeal(
    dealId: string,
    fields: Pick<StoredDeal, "companyIds"> | Pick<StoredDeal, "contactIds">
  ): void {
    this.deals = this.deals.map((deal) =>
      deal.id === dealId ? { ...deal, ...fields } : deal
    );
  }

  private sortLogs<T extends { readonly createdAt: Date; readonly id: string }>(
    records: T[]
  ): T[] {
    return [...records].sort((left, right) => {
      const timeDiff = right.createdAt.getTime() - left.createdAt.getTime();
      return timeDiff !== 0 ? timeDiff : right.id.localeCompare(left.id);
    });
  }

  // 기능 : fake 로그 목록에 cursor 이후 조건을 적용합니다.
  private applyCursor<T extends { readonly createdAt: Date; readonly id: string }>(
    records: T[],
    cursor: DealLogCursor | null
  ): T[] {
    if (!cursor) {
      return records;
    }

    return records.filter((record) => {
      if (record.createdAt.getTime() < cursor.createdAt.getTime()) {
        return true;
      }

      return (
        record.createdAt.getTime() === cursor.createdAt.getTime() &&
        record.id < cursor.id
      );
    });
  }
}

// 역할 : FakeXlsxWorkbookWriter 테스트용 xlsx writer를 구현합니다.
class FakeXlsxWorkbookWriter implements XlsxWorkbookWriter {
  lastInput: XlsxWorksheetInput | null = null;

  // 기능 : 마지막 worksheet 입력을 저장하고 fake Buffer를 반환합니다.
  async writeWorksheet(input: XlsxWorksheetInput): Promise<Buffer> {
    this.lastInput = input;
    return Buffer.from("fake-xlsx");
  }
}

// 역할 : FakeAppLogger 테스트 로그 출력을 막는 logger입니다.
class FakeAppLogger extends AppLogger {
  // 기능 : 테스트에서 정보 로그를 무시합니다.
  override log(): void {}
}

// 기능 : DealApplicationService 테스트 인스턴스를 생성합니다.
function createService(
  repository: FakeDealRepository,
  writer: XlsxWorkbookWriter = new FakeXlsxWorkbookWriter()
): DealApplicationService {
  return new DealApplicationService(repository, writer, new FakeAppLogger());
}

// 기능 : 기본 딜 생성 command를 반환합니다.
function createDealCommand(): {
  readonly dealName: string;
  readonly dealCost: number;
  readonly companyIds: string[];
  readonly contactIds: string[];
  readonly productIds: string[];
  readonly dealStatus: DealStatusCode;
  readonly followingAction: string;
  readonly expectedEndDate: string;
} {
  return {
    dealName: " A회사 신규 도입 ",
    dealCost: 3000000,
    companyIds: ["company-1"],
    contactIds: ["contact-1"],
    productIds: ["product-1", "product-2"],
    dealStatus: DealStatusCode.INITIAL_CONTACT,
    followingAction: " 제안서 발송 ",
    expectedEndDate: "2026-01-05",
  };
}

// 기능 : DealApplicationService 핵심 계약을 검증합니다.
describe("DealApplicationService", () => {
  // 기능 : 딜 생성과 최초 다음 행동 로그 생성이 transaction으로 묶이는지 검증합니다.
  it("creates a deal and initial following action log in one transaction", async () => {
    const repository = new FakeDealRepository();
    const service = createService(repository);

    const result = await service.createDeal(CURRENT_USER, createDealCommand());

    expect(repository.transactionCount).toBe(1);
    expect(repository.deals).toHaveLength(1);
    expect(repository.followingActionLogs).toHaveLength(1);
    expect(repository.deals[0]?.expectedEndDate.toISOString()).toBe(
      "2026-01-05T00:00:00.000Z"
    );

    const followingAction = repository.followingActionLogs[0];

    if (!followingAction) {
      throw new Error("Missing created following action log");
    }

    expect(followingAction.followingAction).toBe("제안서 발송");
    expect(followingAction.checkComplete).toBe(false);
    expect(result.dealName).toBe("A회사 신규 도입");
    expect(result.expectedEndDate).toBe("2026-01-05");
    expect(result.companies).toEqual([{
      id: "company-1",
      companyName: "A회사",
      companyField: { id: "field-1", field: "SaaS" },
      companyRegion: { id: "region-1", region: "Seoul" },
    }]);
    expect(result.contacts[0]?.email).toBe("song@example.com");
    expect(result.contacts[0]?.mobile).toBe("010-1111-2222");
    expect(result.contacts[0]?.contactDepartment.departmentName).toBe("부장");
    expect(result.products.map((product) => product.productName)).toEqual([
      "프리미엄 상품",
      "추가 상품",
    ]);
    expect(result.latestFollowingAction?.followingAction).toBe("제안서 발송");
  });

  // 기능 : 실제 달력에 없는 expectedEndDate를 거부하는지 검증합니다.
  it("rejects an invalid date-only expected end date", async () => {
    const repository = new FakeDealRepository();
    const service = createService(repository);

    await expect(
      service.createDeal(CURRENT_USER, {
        ...createDealCommand(),
        expectedEndDate: "2026-02-30",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);

    expect(repository.deals).toHaveLength(0);
    expect(repository.followingActionLogs).toHaveLength(0);
  });

  // 기능 : 같은 딜에 같은 제품이 중복 연결되지 않도록 검증합니다.
  it("rejects duplicate product ids", async () => {
    const repository = new FakeDealRepository();
    const service = createService(repository);

    await expect(
      service.createDeal(CURRENT_USER, {
        ...createDealCommand(),
        productIds: ["product-1", "product-1"],
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);

    expect(repository.deals).toHaveLength(0);
    expect(repository.dealProductIds.size).toBe(0);
  });

  // 기능 : 선택한 담당자가 선택한 회사에 속하지 않으면 딜 생성을 거부합니다.
  it("rejects a contact that does not belong to the selected company", async () => {
    const repository = new FakeDealRepository();
    const service = createService(repository);

    await expect(
      service.createDeal(CURRENT_USER, {
        ...createDealCommand(),
        companyIds: ["company-1"],
        contactIds: ["contact-2"],
      })
    ).rejects.toBeInstanceOf(RelatedResourceNotFoundError);

    expect(repository.deals).toHaveLength(0);
    expect(repository.followingActionLogs).toHaveLength(0);
  });

  // 기능 : 딜 export가 ID, 제품, 최근수정일 없이 목록 계약 컬럼만 쓰는지 검증합니다.
  it("exports deal rows without id, product, or updatedAt columns", async () => {
    const repository = new FakeDealRepository();
    const writer = new FakeXlsxWorkbookWriter();
    const service = createService(repository, writer);
    await service.createDeal(CURRENT_USER, createDealCommand());

    const file = await service.exportDealsXlsx(CURRENT_USER, {
      sort: DealListSort.CREATED_AT_DESC,
    });

    expect(file.fileName).toMatch(/^deals_\d{8}_\d{6}\.xlsx$/);
    expect(writer.lastInput?.columns.map((column) => column.key)).toEqual([
      "dealName",
      "companyName",
      "contactLabel",
      "dealStatusLabel",
      "dealCost",
      "expectedEndDate",
      "followingAction",
      "createdAt",
    ]);

    const row = writer.lastInput?.rows[0];

    if (!row) {
      throw new Error("Missing exported row");
    }

    expect(row).toEqual(
      expect.objectContaining({
        dealName: "A회사 신규 도입",
        companyName: "A회사",
        contactLabel: "송재근 부장",
        dealStatusLabel: "초기 접촉",
        dealCost: 3000000,
        expectedEndDate: "2026-01-05",
        followingAction: "제안서 발송",
      })
    );
    expect(row).not.toHaveProperty("id");
    expect(row).not.toHaveProperty("product");
    expect(row).not.toHaveProperty("updatedAt");
  });

  // 기능 : 딜 다음 행동 로그 조회가 cursor connection으로 동작하는지 검증합니다.
  it("lists following action logs with cursor connection", async () => {
    const repository = new FakeDealRepository();
    const service = createService(repository);
    await service.createDeal(CURRENT_USER, createDealCommand());

    repository.followingActionLogs = Array.from({ length: 11 }, (_, index) => {
      const order = index + 1;
      const createdAt = new Date(
        `2026-06-12T10:${order.toString().padStart(2, "0")}:00.000Z`
      );

      return {
        id: `following-${order.toString().padStart(2, "0")}`,
        followingAction: `다음 행동 ${order}`,
        checkComplete: false,
        createdAt,
        updatedAt: createdAt,
      };
    });

    const firstPage = await service.listFollowingActionLogs(
      CURRENT_USER,
      "deal-1",
      {}
    );

    expect(firstPage.items).toHaveLength(10);
    expect(firstPage.items[0]?.followingAction).toBe("다음 행동 11");
    expect(firstPage.hasNext).toBe(true);
    expect(firstPage.nextCursor).toEqual(expect.any(String));

    if (!firstPage.nextCursor) {
      throw new Error("Missing following action next cursor");
    }

    const secondPage = await service.listFollowingActionLogs(CURRENT_USER, "deal-1", {
      cursor: firstPage.nextCursor,
    });

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.items[0]?.followingAction).toBe("다음 행동 1");
    expect(secondPage.hasNext).toBe(false);
    expect(secondPage.nextCursor).toBeNull();
  });

  // 기능 : 딜 메모 로그 조회가 cursor connection으로 동작하는지 검증합니다.
  it("lists memo logs with cursor connection", async () => {
    const repository = new FakeDealRepository();
    const service = createService(repository);
    await service.createDeal(CURRENT_USER, createDealCommand());

    repository.memoLogs = Array.from({ length: 11 }, (_, index) => {
      const order = index + 1;
      const createdAt = new Date(
        `2026-06-12T11:${order.toString().padStart(2, "0")}:00.000Z`
      );

      return {
        id: `memo-${order.toString().padStart(2, "0")}`,
        memoType: `메모 ${order}`,
        memo: `내용 ${order}`,
        createdAt,
        updatedAt: createdAt,
      };
    });

    const firstPage = await service.listMemoLogs(CURRENT_USER, "deal-1", {});

    expect(firstPage.items).toHaveLength(10);
    expect(firstPage.items[0]?.memoType).toBe("메모 11");
    expect(firstPage.hasNext).toBe(true);
    expect(firstPage.nextCursor).toEqual(expect.any(String));

    if (!firstPage.nextCursor) {
      throw new Error("Missing memo log next cursor");
    }

    const secondPage = await service.listMemoLogs(CURRENT_USER, "deal-1", {
      cursor: firstPage.nextCursor,
    });

    expect(secondPage.items).toHaveLength(1);
    expect(secondPage.items[0]?.memoType).toBe("메모 1");
    expect(secondPage.hasNext).toBe(false);
    expect(secondPage.nextCursor).toBeNull();
  });
});
