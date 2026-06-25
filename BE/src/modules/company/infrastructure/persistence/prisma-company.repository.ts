import { Prisma } from "@prisma/client";
import {
  type CompanyFieldRecord,
  type CompanyContactRecord,
  type CompanyDealRecord,
  type CompanyLookupRecord,
  type CompanyListRecord,
  type CompanyMemoLogRecord,
  type CompanyPageRecord,
  type CompanyPrivateMemoLogRecord,
  type CompanyRecord,
  type CompanyRegionRecord,
  type CompanyRepository,
  CompanyListSort,
  type CreateCompanyInput,
  type CreateCompanyMemoLogInput,
  type CreateCompanyPrivateMemoLogInput,
  type DeleteCompanyMemoLogInput,
  type DeleteCompanyInput,
  type DeleteCompanyPrivateMemoLogInput,
  type ExportCompaniesInput,
  type ListCompanyContactsInput,
  type ListCompanyDealsInput,
  type ListCompaniesInput,
  type MemoLogCursor,
  type UpdateCompanyInput,
} from "@/modules/company/application/ports/company.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type CompanyPrismaClient = PrismaService | Prisma.TransactionClient;

type CompanyWithRelations = {
  readonly id: string;
  readonly companyName: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly companyField: {
    readonly id: string;
    readonly field: string;
  };
  readonly companyRegion: {
    readonly id: string;
    readonly region: string;
  };
};

type CompanyListWithRelations = CompanyWithRelations & {
  readonly _count: {
    readonly contacts: number;
    readonly dealCompanies: number;
  };
};

// 역할 : PrismaCompanyRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaCompanyRepository implements CompanyRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: CompanyPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 회사 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: CompanyRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 회사 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaCompanyRepository(transaction, null));
    });
  }

  // 기능 : 현재 사용자의 회사 목록과 전체 개수를 조회합니다.
  async listCompanies(input: ListCompaniesInput): Promise<CompanyPageRecord> {
    const where = this.createCompanyWhere(input);

    const [items, totalCount] = await Promise.all([
      this.client.company.findMany({
        where,
        include: this.createCompanyListInclude(input.userId),
        orderBy: this.createCompanyOrderBy(input.sort),
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.client.company.count({ where }),
    ]);

    return {
      items: items.map((company) => this.mapCompanyList(company)),
      totalCount,
    };
  }

  // 기능 : 현재 사용자의 회사 export 대상 전체 목록을 조회합니다.
  async listCompaniesForExport(
    input: ExportCompaniesInput
  ): Promise<CompanyListRecord[]> {
    const items = await this.client.company.findMany({
      where: this.createCompanyWhere(input),
      include: this.createCompanyListInclude(input.userId),
      orderBy: this.createCompanyOrderBy(input.sort),
    });

    return items.map((company) => this.mapCompanyList(company));
  }

  // 기능 : 현재 사용자의 회사에 연결된 담당자 전체 목록을 조회합니다.
  async listCompanyContacts(
    input: ListCompanyContactsInput
  ): Promise<CompanyContactRecord[]> {
    return this.client.contact.findMany({
      where: {
        userId: input.userId,
        companyId: input.companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        mobile: true,
        email: true,
        contactDepartment: {
          select: {
            id: true,
            departmentName: true,
          },
        },
        contactJobGrade: {
          select: {
            id: true,
            jobGradeName: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  // 기능 : 현재 사용자의 회사에 연결된 딜 전체 목록을 조회합니다.
  async listCompanyDeals(
    input: ListCompanyDealsInput
  ): Promise<CompanyDealRecord[]> {
    return this.client.deal.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        dealCompanies: {
          some: {
            userId: input.userId,
            companyId: input.companyId,
          },
        },
      },
      select: {
        id: true,
        dealName: true,
        dealCost: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  // 기능 : 현재 사용자의 회사 단건을 relation과 함께 조회합니다.
  async findCompany(
    userId: string,
    companyId: string
  ): Promise<CompanyRecord | null> {
    const company = await this.client.company.findFirst({
      where: {
        id: companyId,
        userId,
        deletedAt: null,
      },
      include: {
        companyField: true,
        companyRegion: true,
      },
    });

    return company ? this.mapCompany(company) : null;
  }

  // 기능 : 현재 사용자의 회사 존재 여부만 조회합니다.
  async findCompanyLookup(
    userId: string,
    companyId: string
  ): Promise<CompanyLookupRecord | null> {
    const company = await this.client.company.findFirst({
      where: {
        id: companyId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    return company;
  }

  // 기능 : 현재 사용자의 회사 단건을 생성합니다.
  async createCompany(input: CreateCompanyInput): Promise<CompanyLookupRecord> {
    const company = await this.client.company.create({
      data: {
        userId: input.userId,
        companyName: input.companyName,
        companyFieldId: input.companyFieldId,
        companyRegionId: input.companyRegionId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    return company;
  }

  // 기능 : 현재 사용자의 회사 기본 정보를 수정합니다.
  async updateCompany(
    userId: string,
    companyId: string,
    input: UpdateCompanyInput
  ): Promise<boolean> {
    const result = await this.client.company.updateMany({
      where: {
        id: companyId,
        userId,
        deletedAt: null,
      },
      data: {
        ...(input.companyName !== undefined
          ? { companyName: input.companyName }
          : {}),
        ...(input.companyFieldId !== undefined
          ? { companyFieldId: input.companyFieldId }
          : {}),
        ...(input.companyRegionId !== undefined
          ? { companyRegionId: input.companyRegionId }
          : {}),
      },
    });

    return result.count > 0;
  }

  // 기능 : 현재 사용자의 회사 분야 목록을 정렬해 조회합니다.
  async listFields(userId: string): Promise<CompanyFieldRecord[]> {
    return this.client.companyField.findMany({
      where: { userId },
      select: {
        id: true,
        field: true,
      },
      orderBy: [{ field: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 현재 사용자의 회사 분야 단건을 조회합니다.
  async findField(
    userId: string,
    fieldId: string
  ): Promise<CompanyFieldRecord | null> {
    return this.client.companyField.findFirst({
      where: {
        id: fieldId,
        userId,
      },
      select: {
        id: true,
        field: true,
      },
    });
  }

  // 기능 : 현재 사용자 안에서 같은 회사 분야 이름이 있는지 확인합니다.
  async existsFieldByName(userId: string, field: string): Promise<boolean> {
    const existing = await this.client.companyField.findUnique({
      where: {
        userId_field: {
          userId,
          field,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(existing);
  }

  // 기능 : 현재 사용자의 회사 분야를 생성합니다.
  async createField(userId: string, field: string): Promise<void> {
    await this.client.companyField.create({
      data: {
        userId,
        field,
      },
    });
  }

  // 기능 : 현재 사용자의 회사 분야를 사용하는 회사가 있는지 확인합니다.
  async isFieldInUse(userId: string, fieldId: string): Promise<boolean> {
    const company = await this.client.company.findFirst({
      where: {
        userId,
        companyFieldId: fieldId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(company);
  }

  // 기능 : 현재 사용자의 회사 분야를 삭제합니다.
  async deleteField(userId: string, fieldId: string): Promise<void> {
    await this.client.companyField.deleteMany({
      where: {
        id: fieldId,
        userId,
      },
    });
  }

  // 기능 : 현재 사용자의 회사 지역 목록을 정렬해 조회합니다.
  async listRegions(userId: string): Promise<CompanyRegionRecord[]> {
    return this.client.companyRegion.findMany({
      where: { userId },
      select: {
        id: true,
        region: true,
      },
      orderBy: [{ region: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 현재 사용자의 회사 지역 단건을 조회합니다.
  async findRegion(
    userId: string,
    regionId: string
  ): Promise<CompanyRegionRecord | null> {
    return this.client.companyRegion.findFirst({
      where: {
        id: regionId,
        userId,
      },
      select: {
        id: true,
        region: true,
      },
    });
  }

  // 기능 : 현재 사용자 안에서 같은 회사 지역 이름이 있는지 확인합니다.
  async existsRegionByName(userId: string, region: string): Promise<boolean> {
    const existing = await this.client.companyRegion.findUnique({
      where: {
        userId_region: {
          userId,
          region,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(existing);
  }

  // 기능 : 현재 사용자의 회사 지역을 생성합니다.
  async createRegion(userId: string, region: string): Promise<void> {
    await this.client.companyRegion.create({
      data: {
        userId,
        region,
      },
    });
  }

  // 기능 : 현재 사용자의 회사 지역을 사용하는 회사가 있는지 확인합니다.
  async isRegionInUse(userId: string, regionId: string): Promise<boolean> {
    const company = await this.client.company.findFirst({
      where: {
        userId,
        companyRegionId: regionId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(company);
  }

  // 기능 : 현재 사용자의 회사 지역을 삭제합니다.
  async deleteRegion(userId: string, regionId: string): Promise<void> {
    await this.client.companyRegion.deleteMany({
      where: {
        id: regionId,
        userId,
      },
    });
  }

  // 기능 : 회사 일반 메모 로그를 생성합니다.
  async createMemoLog(input: CreateCompanyMemoLogInput): Promise<void> {
    await this.client.companyMemoLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        memoType: input.memoType,
        memo: input.memo,
      },
    });
  }

  // 기능 : 회사 일반 메모 로그를 cursor 조건으로 조회합니다.
  async listMemoLogs(input: {
    readonly companyId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<CompanyMemoLogRecord[]> {
    return this.client.companyMemoLog.findMany({
      where: {
        companyId: input.companyId,
        deletedAt: null,
        ...this.createCursorWhere(input.cursor),
      },
      select: {
        id: true,
        memoType: true,
        memo: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 회사 일반 메모 로그의 memoType과 memo를 수정합니다.
  async updateMemoLog(input: {
    readonly userId: string;
    readonly companyId: string;
    readonly memoLogId: string;
    readonly memoType: string;
    readonly memo: string;
  }): Promise<boolean> {
    const result = await this.client.companyMemoLog.updateMany({
      where: {
        id: input.memoLogId,
        companyId: input.companyId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        memoType: input.memoType,
        memo: input.memo,
      },
    });

    return result.count > 0;
  }

  // 기능 : 현재 사용자의 회사를 휴지통 상태로 전환합니다.
  async deleteCompany(input: DeleteCompanyInput): Promise<boolean> {
    const result = await this.client.company.updateMany({
      where: {
        id: input.companyId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : 회사 일반 메모 로그를 휴지통 상태로 전환합니다.
  async deleteMemoLog(input: DeleteCompanyMemoLogInput): Promise<boolean> {
    const result = await this.client.companyMemoLog.updateMany({
      where: {
        id: input.memoLogId,
        companyId: input.companyId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : 회사 개인 비밀 메모 로그를 생성합니다.
  async createPrivateMemoLog(
    input: CreateCompanyPrivateMemoLogInput
  ): Promise<void> {
    await this.client.companyUserPrivateMemoLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        memoCiphertext: input.memoCiphertext,
        memoKeyVersion: input.memoKeyVersion,
      },
    });
  }

  // 기능 : 작성자 본인의 회사 개인 비밀 메모 로그를 cursor 조건으로 조회합니다.
  async listPrivateMemoLogs(input: {
    readonly userId: string;
    readonly companyId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<CompanyPrivateMemoLogRecord[]> {
    return this.client.companyUserPrivateMemoLog.findMany({
      where: {
        userId: input.userId,
        companyId: input.companyId,
        deletedAt: null,
        ...this.createPrivateMemoCursorWhere(input.cursor),
      },
      select: {
        id: true,
        memoCiphertext: true,
        memoKeyVersion: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 회사 개인 비밀 메모 로그의 암호문과 key version만 수정합니다.
  async updatePrivateMemoLog(input: {
    readonly userId: string;
    readonly companyId: string;
    readonly privateMemoLogId: string;
    readonly memoCiphertext: string;
    readonly memoKeyVersion: string;
  }): Promise<boolean> {
    const result = await this.client.companyUserPrivateMemoLog.updateMany({
      where: {
        id: input.privateMemoLogId,
        userId: input.userId,
        companyId: input.companyId,
        deletedAt: null,
      },
      data: {
        memoCiphertext: input.memoCiphertext,
        memoKeyVersion: input.memoKeyVersion,
      },
    });

    return result.count > 0;
  }

  // 기능 : 회사 개인 비밀 메모 로그를 휴지통 상태로 전환합니다.
  async deletePrivateMemoLog(
    input: DeleteCompanyPrivateMemoLogInput
  ): Promise<boolean> {
    const result = await this.client.companyUserPrivateMemoLog.updateMany({
      where: {
        id: input.privateMemoLogId,
        userId: input.userId,
        companyId: input.companyId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createCursorWhere(
    cursor: MemoLogCursor | null
  ): Prisma.CompanyMemoLogWhereInput {
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

  // 기능 : 개인 비밀 메모 cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createPrivateMemoCursorWhere(
    cursor: MemoLogCursor | null
  ): Prisma.CompanyUserPrivateMemoLogWhereInput {
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

  // 기능 : 회사 목록과 export에 공통으로 쓰는 Prisma 조회 조건을 생성합니다.
  private createCompanyWhere(
    input: ExportCompaniesInput
  ): Prisma.CompanyWhereInput {
    return {
      userId: input.userId,
      deletedAt: null,
      ...(input.companyName
        ? {
            companyName: {
              contains: input.companyName,
            },
          }
        : {}),
      ...(input.companyFieldIds && input.companyFieldIds.length > 0
        ? { companyFieldId: { in: [...input.companyFieldIds] } }
        : {}),
      ...(input.companyRegionIds && input.companyRegionIds.length > 0
        ? { companyRegionId: { in: [...input.companyRegionIds] } }
        : {}),
    };
  }

  // 기능 : 회사 목록과 export에 필요한 relation과 담당자 수 집계를 정의합니다.
  private createCompanyListInclude(userId: string): Prisma.CompanyInclude {
    return {
      companyField: true,
      companyRegion: true,
      _count: {
        select: {
          contacts: {
            where: {
              userId,
              deletedAt: null,
            },
          },
          dealCompanies: {
            where: {
              userId,
              deal: {
                deletedAt: null,
              },
            },
          },
        },
      },
    };
  }

  // 기능 : 회사 목록과 export의 정렬 조건을 생성합니다.
  private createCompanyOrderBy(
    sort: CompanyListSort | undefined
  ): Prisma.CompanyOrderByWithRelationInput[] {
    if (sort === CompanyListSort.CONTACT_COUNT_DESC) {
      return [
        { contacts: { _count: "desc" } },
        { createdAt: "desc" },
        { id: "desc" },
      ];
    }

    if (sort === CompanyListSort.CONTACT_COUNT_ASC) {
      return [
        { contacts: { _count: "asc" } },
        { createdAt: "desc" },
        { id: "desc" },
      ];
    }

    if (sort === CompanyListSort.DEAL_COUNT_DESC) {
      return [
        { dealCompanies: { _count: "desc" } },
        { createdAt: "desc" },
        { id: "desc" },
      ];
    }

    if (sort === CompanyListSort.DEAL_COUNT_ASC) {
      return [
        { dealCompanies: { _count: "asc" } },
        { createdAt: "desc" },
        { id: "desc" },
      ];
    }

    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  // 기능 : Prisma 회사 행을 application 레코드로 변환합니다.
  private mapCompany(company: CompanyWithRelations): CompanyRecord {
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
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  // 기능 : Prisma 회사 목록 행을 contactCount 포함 application 레코드로 변환합니다.
  private mapCompanyList(company: CompanyListWithRelations): CompanyListRecord {
    return {
      ...this.mapCompany(company),
      contactCount: company._count.contacts,
      dealCount: company._count.dealCompanies,
    };
  }
}
