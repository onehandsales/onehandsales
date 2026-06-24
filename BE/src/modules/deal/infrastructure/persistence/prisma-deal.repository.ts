import { Prisma } from "@prisma/client";
import {
  DealListSort,
  type CountDealsByStatusInput,
  type CreateDealCompaniesInput,
  type CreateDealContactsInput,
  type CreateDealProductsInput,
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
import {
  type DealStatusCode,
  isDealStatusCode,
} from "@/modules/deal/domain/deal-status";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type DealPrismaClient = PrismaService | Prisma.TransactionClient;

type DealCompanyRow = {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: {
    readonly id: string;
    readonly field: string;
  };
  readonly companyRegion: {
    readonly id: string;
    readonly region: string;
  };
};

type DealContactRow = {
  readonly id: string;
  readonly username: string;
  readonly companyId: string;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
  };
  readonly mobile: string;
  readonly email: string;
  readonly contactJobGrade: {
    readonly id: string;
    readonly jobGradeName: string;
  };
  readonly contactDepartment: {
    readonly id: string;
    readonly departmentName: string;
  };
};

type DealProductRow = {
  readonly id: string;
  readonly productName: string;
};

type DealFollowingActionLogRow = {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type DealListRow = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly expectedEndDate: Date;
  readonly dealCompanies: Array<{
    readonly company: DealCompanyRow;
  }>;
  readonly dealContacts: Array<{
    readonly contact: DealContactRow;
  }>;
  readonly followingActionLogs: DealFollowingActionLogRow[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type DealDetailRow = DealListRow & {
  readonly dealProducts: Array<{
    readonly product: DealProductRow;
  }>;
};

// 역할 : PrismaDealRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaDealRepository implements DealRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: DealPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 딜 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: DealRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 딜 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaDealRepository(transaction, null));
    });
  }

  // 기능 : 현재 사용자의 딜 단계별 개수를 조회합니다.
  async countDealsByStatus(
    input: CountDealsByStatusInput
  ): Promise<ReadonlyMap<DealStatusCode, number>> {
    const counts = await this.client.deal.groupBy({
      by: ["dealStatus"],
      where: this.createDealWhere(input),
      _count: {
        _all: true,
      },
    });

    const result = new Map<DealStatusCode, number>();

    for (const item of counts) {
      if (isDealStatusCode(item.dealStatus)) {
        result.set(item.dealStatus, item._count._all);
      }
    }

    return result;
  }

  // 기능 : 현재 사용자의 딜 목록과 전체 개수를 조회합니다.
  async listDeals(input: ListDealsInput): Promise<DealPageRecord> {
    const where = this.createDealWhere(input);

    const [items, totalCount] = await Promise.all([
      this.client.deal.findMany({
        where,
        include: this.createDealListInclude(),
        orderBy: this.createDealOrderBy(input.sort),
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.client.deal.count({ where }),
    ]);

    return {
      items: items.map((deal) => this.mapDealListRecord(deal)),
      totalCount,
    };
  }

  // 기능 : 현재 사용자의 딜 export 대상 전체 목록을 조회합니다.
  async listDealsForExport(input: ExportDealsInput): Promise<DealListRecord[]> {
    const items = await this.client.deal.findMany({
      where: this.createDealWhere(input),
      include: this.createDealListInclude(),
      orderBy: this.createDealOrderBy(input.sort),
    });

    return items.map((deal) => this.mapDealListRecord(deal));
  }

  // 기능 : 현재 사용자의 딜 단건을 relation과 함께 조회합니다.
  async findDeal(
    userId: string,
    dealId: string
  ): Promise<DealDetailRecord | null> {
    const deal = await this.client.deal.findFirst({
      where: {
        id: dealId,
        userId,
      },
      include: {
        ...this.createDealListInclude(),
        dealProducts: {
          select: {
            product: {
              select: {
                id: true,
                productName: true,
              },
            },
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });

    return deal ? this.mapDealDetailRecord(deal) : null;
  }

  // 기능 : 현재 사용자의 딜 존재 여부만 조회합니다.
  async existsDeal(userId: string, dealId: string): Promise<boolean> {
    const deal = await this.client.deal.findFirst({
      where: {
        id: dealId,
        userId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(deal);
  }

  // 기능 : 현재 사용자의 딜 단건을 생성합니다.
  async createDeal(input: CreateDealInput): Promise<{ readonly id: string }> {
    return this.client.deal.create({
      data: {
        userId: input.userId,
        dealName: input.dealName,
        dealCost: input.dealCost,
        dealStatus: input.dealStatus,
        expectedEndDate: input.expectedEndDate,
      },
      select: {
        id: true,
      },
    });
  }

  // 기능 : 딜에 연결할 제품 매핑을 생성합니다.
  async createDealCompanies(input: CreateDealCompaniesInput): Promise<void> {
    await Promise.all(
      input.companyIds.map((companyId) =>
        this.client.dealCompany.create({
          data: {
            userId: input.userId,
            dealId: input.dealId,
            companyId,
          },
          select: {
            id: true,
          },
        })
      )
    );
  }

  async replaceDealCompanies(input: CreateDealCompaniesInput): Promise<void> {
    await this.client.dealCompany.deleteMany({
      where: {
        userId: input.userId,
        dealId: input.dealId,
      },
    });

    await this.createDealCompanies(input);
  }

  async createDealContacts(input: CreateDealContactsInput): Promise<void> {
    await Promise.all(
      input.contactIds.map((contactId) =>
        this.client.dealContact.create({
          data: {
            userId: input.userId,
            dealId: input.dealId,
            contactId,
          },
          select: {
            id: true,
          },
        })
      )
    );
  }

  async replaceDealContacts(input: CreateDealContactsInput): Promise<void> {
    await this.client.dealContact.deleteMany({
      where: {
        userId: input.userId,
        dealId: input.dealId,
      },
    });

    await this.createDealContacts(input);
  }

  async createDealProducts(input: CreateDealProductsInput): Promise<void> {
    await Promise.all(
      input.productIds.map((productId) =>
        this.client.dealProduct.create({
          data: {
            userId: input.userId,
            dealId: input.dealId,
            productId,
          },
          select: {
            id: true,
          },
        })
      )
    );
  }

  // 기능 : 딜에 연결된 제품 매핑을 새 목록으로 교체합니다.
  async replaceDealProducts(input: CreateDealProductsInput): Promise<void> {
    await this.client.dealProduct.deleteMany({
      where: {
        userId: input.userId,
        dealId: input.dealId,
      },
    });

    await this.createDealProducts(input);
  }

  // 기능 : 현재 사용자의 딜 기본 정보를 수정합니다.
  async updateDeal(
    userId: string,
    dealId: string,
    input: UpdateDealInput
  ): Promise<boolean> {
    const result = await this.client.deal.updateMany({
      where: {
        id: dealId,
        userId,
      },
      data: {
        ...(input.dealName !== undefined ? { dealName: input.dealName } : {}),
        ...(input.dealCost !== undefined ? { dealCost: input.dealCost } : {}),
        ...(input.expectedEndDate !== undefined
          ? { expectedEndDate: input.expectedEndDate }
          : {}),
        ...(input.dealStatus !== undefined
          ? { dealStatus: input.dealStatus }
          : {}),
      },
    });

    return result.count > 0;
  }

  // 기능 : 현재 사용자의 회사 단건을 조회합니다.
  async findCompanies(
    userId: string,
    companyIds: readonly string[]
  ): Promise<DealCompanyRecord[]> {
    return this.client.company.findMany({
      where: {
        id: {
          in: [...companyIds],
        },
        userId,
      },
      select: this.createCompanySelect(),
    });
  }

  // 기능 : 현재 사용자의 담당자 단건을 조회합니다.
  async findContacts(
    userId: string,
    contactIds: readonly string[]
  ): Promise<DealContactRecord[]> {
    const contacts = await this.client.contact.findMany({
      where: {
        id: {
          in: [...contactIds],
        },
        userId,
      },
      select: this.createContactSelect(),
    });

    return contacts.map((contact) => this.mapContact(contact));
  }

  // 기능 : 현재 사용자의 제품 목록을 조회합니다.
  async findProducts(
    userId: string,
    productIds: readonly string[]
  ): Promise<DealProductRecord[]> {
    return this.client.product.findMany({
      where: {
        id: {
          in: [...productIds],
        },
        userId,
      },
      select: {
        id: true,
        productName: true,
      },
    });
  }

  // 기능 : 현재 사용자의 회사 옵션 전체 목록을 조회합니다.
  async listCompanyOptions(userId: string): Promise<DealCompanyRecord[]> {
    return this.client.company.findMany({
      where: { userId },
      select: this.createCompanySelect(),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  // 기능 : 현재 사용자의 담당자 옵션 전체 목록을 조회합니다.
  async listContactOptions(userId: string): Promise<DealContactRecord[]> {
    const contacts = await this.client.contact.findMany({
      where: { userId },
      select: this.createContactSelect(),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return contacts.map((contact) => this.mapContact(contact));
  }

  // 기능 : 현재 사용자의 제품 옵션 전체 목록을 조회합니다.
  async listProductOptions(userId: string): Promise<DealProductRecord[]> {
    return this.client.product.findMany({
      where: { userId },
      select: {
        id: true,
        productName: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  // 기능 : 딜 다음 행동 로그를 생성합니다.
  async createFollowingActionLog(
    input: CreateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord> {
    return this.client.dealFollowingActionLog.create({
      data: {
        userId: input.userId,
        dealId: input.dealId,
        followingAction: input.followingAction,
      },
      select: this.createFollowingActionLogSelect(),
    });
  }

  // 기능 : 딜 다음 행동 로그 목록을 cursor 조건으로 조회합니다.
  async listFollowingActionLogs(input: {
    readonly userId: string;
    readonly dealId: string;
    readonly cursor: DealLogCursor | null;
    readonly take: number;
  }): Promise<DealFollowingActionLogRecord[]> {
    return this.client.dealFollowingActionLog.findMany({
      where: {
        userId: input.userId,
        dealId: input.dealId,
        ...this.createFollowingActionLogCursorWhere(input.cursor),
      },
      select: this.createFollowingActionLogSelect(),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 딜 다음 행동 로그를 수정합니다.
  async updateFollowingActionLog(
    input: UpdateDealFollowingActionLogInput
  ): Promise<DealFollowingActionLogRecord | null> {
    const result = await this.client.dealFollowingActionLog.updateMany({
      where: {
        id: input.followingActionLogId,
        userId: input.userId,
        dealId: input.dealId,
      },
      data: {
        ...(input.followingAction !== undefined
          ? { followingAction: input.followingAction }
          : {}),
        ...(input.checkComplete !== undefined
          ? { checkComplete: input.checkComplete }
          : {}),
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.client.dealFollowingActionLog.findFirst({
      where: {
        id: input.followingActionLogId,
        userId: input.userId,
        dealId: input.dealId,
      },
      select: this.createFollowingActionLogSelect(),
    });
  }

  // 기능 : 딜 메모 로그를 생성합니다.
  async createMemoLog(input: CreateDealMemoLogInput): Promise<DealMemoLogRecord> {
    return this.client.dealMemoLog.create({
      data: {
        userId: input.userId,
        dealId: input.dealId,
        memoType: input.memoType,
        memo: input.memo,
      },
      select: this.createMemoLogSelect(),
    });
  }

  // 기능 : 딜 메모 로그 목록을 cursor 조건으로 조회합니다.
  async listMemoLogs(input: {
    readonly userId: string;
    readonly dealId: string;
    readonly cursor: DealLogCursor | null;
    readonly take: number;
  }): Promise<DealMemoLogRecord[]> {
    return this.client.dealMemoLog.findMany({
      where: {
        userId: input.userId,
        dealId: input.dealId,
        ...this.createMemoLogCursorWhere(input.cursor),
      },
      select: this.createMemoLogSelect(),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 딜 메모 로그를 수정합니다.
  async updateMemoLog(
    input: UpdateDealMemoLogInput
  ): Promise<DealMemoLogRecord | null> {
    const result = await this.client.dealMemoLog.updateMany({
      where: {
        id: input.memoLogId,
        userId: input.userId,
        dealId: input.dealId,
      },
      data: {
        ...(input.memoType !== undefined ? { memoType: input.memoType } : {}),
        ...(input.memo !== undefined ? { memo: input.memo } : {}),
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.client.dealMemoLog.findFirst({
      where: {
        id: input.memoLogId,
        userId: input.userId,
        dealId: input.dealId,
      },
      select: this.createMemoLogSelect(),
    });
  }

  // 기능 : 딜 목록과 export에 공통으로 쓰는 Prisma 조회 조건을 생성합니다.
  private createDealWhere(
    input: Pick<
      ExportDealsInput,
      "userId" | "search" | "companyIds" | "contactIds" | "dealStatus"
    >
  ): Prisma.DealWhereInput {
    return {
      userId: input.userId,
      ...(input.search
        ? {
            dealName: {
              contains: input.search,
            },
          }
        : {}),
      ...(input.companyIds?.length
        ? {
            dealCompanies: {
              some: {
                companyId: {
                  in: [...input.companyIds],
                },
              },
            },
          }
        : {}),
      ...(input.contactIds?.length
        ? {
            dealContacts: {
              some: {
                contactId: {
                  in: [...input.contactIds],
                },
              },
            },
          }
        : {}),
      ...(input.dealStatus ? { dealStatus: input.dealStatus } : {}),
    };
  }

  // 기능 : 딜 목록과 export에 공통으로 쓰는 Prisma 정렬 조건을 생성합니다.
  private createDealOrderBy(
    sort: DealListSort
  ): Prisma.DealOrderByWithRelationInput[] {
    switch (sort) {
      case DealListSort.DEAL_COST_DESC:
        return [{ dealCost: "desc" }, { createdAt: "desc" }, { id: "desc" }];
      case DealListSort.DEAL_COST_ASC:
        return [{ dealCost: "asc" }, { createdAt: "desc" }, { id: "desc" }];
      case DealListSort.EXPECTED_END_DATE_ASC:
        return [{ expectedEndDate: "asc" }, { createdAt: "desc" }, { id: "desc" }];
      case DealListSort.CREATED_AT_DESC:
      default:
        return [{ createdAt: "desc" }, { id: "desc" }];
    }
  }

  // 기능 : 딜 목록 조회에 필요한 relation include 조건을 생성합니다.
  private createDealListInclude() {
    return {
      dealCompanies: {
        select: {
          company: {
            select: this.createCompanySelect(),
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      dealContacts: {
        select: {
          contact: {
            select: this.createContactSelect(),
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      followingActionLogs: {
        select: this.createFollowingActionLogSelect(),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 1,
      },
    } satisfies Prisma.DealInclude;
  }

  // 기능 : 회사 조회에 필요한 select 조건을 생성합니다.
  private createCompanySelect() {
    return {
      id: true,
      companyName: true,
      companyField: {
        select: {
          id: true,
          field: true,
        },
      },
      companyRegion: {
        select: {
          id: true,
          region: true,
        },
      },
    } satisfies Prisma.CompanySelect;
  }

  // 기능 : 담당자 조회에 필요한 select 조건을 생성합니다.
  private createContactSelect() {
    return {
      id: true,
      username: true,
      companyId: true,
      company: {
        select: {
          id: true,
          companyName: true,
        },
      },
      mobile: true,
      email: true,
      contactJobGrade: {
        select: {
          id: true,
          jobGradeName: true,
        },
      },
      contactDepartment: {
        select: {
          id: true,
          departmentName: true,
        },
      },
    } satisfies Prisma.ContactSelect;
  }

  // 기능 : 다음 행동 로그 조회에 필요한 select 조건을 생성합니다.
  private createFollowingActionLogSelect() {
    return {
      id: true,
      followingAction: true,
      checkComplete: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.DealFollowingActionLogSelect;
  }

  // 기능 : 메모 로그 조회에 필요한 select 조건을 생성합니다.
  private createMemoLogSelect() {
    return {
      id: true,
      memoType: true,
      memo: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.DealMemoLogSelect;
  }

  // 기능 : 다음 행동 로그 cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createFollowingActionLogCursorWhere(
    cursor: DealLogCursor | null
  ): Prisma.DealFollowingActionLogWhereInput {
    if (!cursor) {
      return {};
    }

    return {
      OR: [
        {
          createdAt: {
            lt: cursor.createdAt,
          },
        },
        {
          createdAt: cursor.createdAt,
          id: {
            lt: cursor.id,
          },
        },
      ],
    };
  }

  // 기능 : 메모 로그 cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createMemoLogCursorWhere(
    cursor: DealLogCursor | null
  ): Prisma.DealMemoLogWhereInput {
    if (!cursor) {
      return {};
    }

    return {
      OR: [
        {
          createdAt: {
            lt: cursor.createdAt,
          },
        },
        {
          createdAt: cursor.createdAt,
          id: {
            lt: cursor.id,
          },
        },
      ],
    };
  }

  // 기능 : Prisma 딜 목록 행을 application 레코드로 변환합니다.
  private mapDealListRecord(deal: DealListRow): DealListRecord {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealCost: deal.dealCost,
      dealStatus: this.mapDealStatus(deal.dealStatus),
      expectedEndDate: deal.expectedEndDate,
      companies: deal.dealCompanies.map((dealCompany) =>
        this.mapCompany(dealCompany.company)
      ),
      contacts: deal.dealContacts.map((dealContact) =>
        this.mapContact(dealContact.contact)
      ),
      latestFollowingAction: deal.followingActionLogs[0] ?? null,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    };
  }

  // 기능 : Prisma 딜 상세 행을 application 레코드로 변환합니다.
  private mapDealDetailRecord(deal: DealDetailRow): DealDetailRecord {
    return {
      ...this.mapDealListRecord(deal),
      products: deal.dealProducts.map((dealProduct) => ({
        id: dealProduct.product.id,
        productName: dealProduct.product.productName,
      })),
    };
  }

  // 기능 : Prisma 회사 행을 application 레코드로 변환합니다.
  private mapCompany(company: DealCompanyRow): DealCompanyRecord {
    return {
      id: company.id,
      companyName: company.companyName,
      companyField: {
        id: company.companyField.id,
        field: company.companyField.field,
      },
      companyRegion: {
        id: company.companyRegion.id,
        region: company.companyRegion.region,
      },
    };
  }

  // 기능 : Prisma 담당자 행을 application 레코드로 변환합니다.
  private mapContact(contact: DealContactRow): DealContactRecord {
    return {
      id: contact.id,
      username: contact.username,
      companyId: contact.companyId,
      company: {
        id: contact.company.id,
        companyName: contact.company.companyName,
      },
      mobile: contact.mobile,
      email: contact.email,
      contactJobGrade: {
        id: contact.contactJobGrade.id,
        jobGradeName: contact.contactJobGrade.jobGradeName,
      },
      contactDepartment: {
        id: contact.contactDepartment.id,
        departmentName: contact.contactDepartment.departmentName,
      },
    };
  }

  // 기능 : DB 문자열 상태를 코드 단 DealStatusCode로 변환합니다.
  private mapDealStatus(status: string): DealStatusCode {
    if (!isDealStatusCode(status)) {
      throw new Error(`Invalid deal status in database: ${status}`);
    }

    return status;
  }
}
