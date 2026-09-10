import { Prisma } from "@prisma/client";
import type {
  GetTrashDetailInput,
  ListTrashInput,
  RestoreTrashItemInput,
  TrashDetail,
  TrashItem,
  TrashListResult,
  TrashRepository,
  TrashRestoreRepositoryResult,
} from "@/modules/trash/application/ports/trash.repository";
import type {
  TrashDomainFilter,
  TrashItemKindFilter,
  TrashLogTypeFilter,
  TrashTargetType,
} from "@/modules/trash/application/ports/trash.types";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type TrashPrismaClient = PrismaService | Prisma.TransactionClient;
type TrashDomain = Exclude<TrashDomainFilter, "ALL">;
type TrashItemKind = Exclude<TrashItemKindFilter, "ALL">;
type TrashLogType = Exclude<TrashLogTypeFilter, "ALL">;

type TargetMetadata = {
  readonly targetType: TrashTargetType;
  readonly domain: TrashDomain;
  readonly itemKind: TrashItemKind;
  readonly logType: TrashLogType | null;
  readonly label: string;
  readonly parentType?: TrashDomain;
};

type DeletedItemInput = {
  readonly metadata: TargetMetadata;
  readonly targetId: string;
  readonly title: string;
  readonly parentId?: string | null;
  readonly parentTitle?: string | null;
  readonly deletedAt: Date | null;
  readonly trashExpiresAt: Date | null;
  readonly now: Date;
  readonly canRestore?: boolean;
  readonly hasPrivateMemo?: boolean;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 100;
const MEMO_TITLE_MAX_LENGTH = 40;

const TARGET_METADATA: readonly TargetMetadata[] = [
  {
    targetType: "COMPANY",
    domain: "COMPANY",
    itemKind: "ENTITY",
    logType: null,
    label: "회사",
  },
  {
    targetType: "COMPANY_MEMO_LOG",
    domain: "COMPANY",
    itemKind: "LOG",
    logType: "MEMO",
    label: "회사 메모",
    parentType: "COMPANY",
  },
  {
    targetType: "COMPANY_PRIVATE_MEMO_LOG",
    domain: "COMPANY",
    itemKind: "LOG",
    logType: "PRIVATE_MEMO",
    label: "회사 개인 메모",
    parentType: "COMPANY",
  },
];

const TARGET_METADATA_BY_TYPE = new Map<TrashTargetType, TargetMetadata>(
  TARGET_METADATA.map((metadata) => [metadata.targetType, metadata])
);

function isTrashItem(item: TrashItem | null): item is TrashItem {
  return item !== null;
}

export class PrismaTrashRepository implements TrashRepository {
  constructor(
    private readonly client: TrashPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repository: TrashRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction((transaction) =>
      work(new PrismaTrashRepository(transaction, null))
    );
  }

  async listTrash(input: ListTrashInput): Promise<TrashListResult> {
    const page = this.normalizePage(input.page);
    const pageSize = this.normalizePageSize(input.pageSize);
    const collected = await this.collectTrashItems(input);
    const filtered = this.filterByQuery(collected, input.query);
    const sorted = this.sortTrashItems(filtered, input.sort);
    const totalCount = sorted.length;
    const offset = (page - 1) * pageSize;

    return {
      items: sorted.slice(offset, offset + pageSize),
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async getTrashDetail(input: GetTrashDetailInput): Promise<TrashDetail | null> {
    switch (input.targetType) {
      case "COMPANY":
        return this.getCompanyDetail(input);
      case "COMPANY_MEMO_LOG":
        return this.getCompanyMemoLogDetail(input);
      case "COMPANY_PRIVATE_MEMO_LOG":
        return this.getCompanyPrivateMemoLogDetail(input);
    }
  }

  async restoreTrashItem(
    input: RestoreTrashItemInput
  ): Promise<TrashRestoreRepositoryResult | null> {
    if (!TARGET_METADATA_BY_TYPE.has(input.targetType)) {
      return null;
    }

    if (await this.hasDeletedParent(input)) {
      return { blockedReason: "PARENT_DELETED" };
    }

    const restored = await this.restoreByTargetType(input);

    if (!restored) {
      return null;
    }

    return {
      targetId: input.targetId,
      targetType: input.targetType,
      restoredAt: input.now,
    };
  }

  private async collectTrashItems(input: ListTrashInput): Promise<TrashItem[]> {
    const candidates = await Promise.all([
      this.listDeletedCompanies(input),
      this.listDeletedCompanyMemoLogs(input),
      this.listDeletedCompanyPrivateMemoLogs(input),
    ]);

    return candidates.flat().filter(isTrashItem);
  }

  private async getCompanyDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const metadata = TARGET_METADATA_BY_TYPE.get("COMPANY");

    if (!metadata) {
      return null;
    }

    const company = await this.client.company.findFirst({
      where: this.createEntityWhere(input),
      select: {
        id: true,
        companyName: true,
        address: true,
        deletedAt: true,
        trashExpiresAt: true,
        companyField: { select: { field: true } },
        companyRegion: {
          select: {
            region: true,
            countryCode: true,
            regionCode: true,
          },
        },
        _count: {
          select: {
            privateMemoLogs: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!company) {
      return null;
    }

    return this.createTrashDetail({
      metadata,
      targetId: company.id,
      title: company.companyName,
      deletedAt: company.deletedAt,
      trashExpiresAt: company.trashExpiresAt,
      now: input.now,
      hasPrivateMemo: company._count.privateMemoLogs > 0,
      summary: company.companyName,
      fields: [
        this.createField("회사명", company.companyName),
        this.createField("분야", company.companyField.field),
        this.createField("지역", company.companyRegion.region),
        this.createField("지역 국가", company.companyRegion.countryCode),
        this.createField("지역 코드", company.companyRegion.regionCode),
        this.createField("주소", company.address),
      ],
    });
  }

  private async getCompanyMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const metadata = TARGET_METADATA_BY_TYPE.get("COMPANY_MEMO_LOG");

    if (!metadata) {
      return null;
    }

    const memoLog = await this.client.companyMemoLog.findFirst({
      where: this.createCompanyLogWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        createdAt: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!memoLog) {
      return null;
    }

    return this.createTrashDetail({
      metadata,
      targetId: memoLog.id,
      title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
      parentId: memoLog.company.id,
      parentTitle: memoLog.company.companyName,
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      now: input.now,
      canRestore: memoLog.company.deletedAt === null,
      summary: memoLog.memoType,
      content: memoLog.memo,
      fields: [
        this.createField("메모 유형", memoLog.memoType),
        this.createField("소속 회사", memoLog.company.companyName),
        this.createField("작성일", this.formatDateOnly(memoLog.createdAt)),
      ],
    });
  }

  private async getCompanyPrivateMemoLogDetail(
    input: GetTrashDetailInput
  ): Promise<TrashDetail | null> {
    const metadata = TARGET_METADATA_BY_TYPE.get("COMPANY_PRIVATE_MEMO_LOG");

    if (!metadata) {
      return null;
    }

    const memoLog = await this.client.companyUserPrivateMemoLog.findFirst({
      where: this.createCompanyPrivateLogWhere(input),
      select: {
        id: true,
        createdAt: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!memoLog) {
      return null;
    }

    return this.createTrashDetail({
      metadata,
      targetId: memoLog.id,
      title: `개인 메모 ${this.formatDateOnly(memoLog.createdAt)}`,
      parentId: memoLog.company.id,
      parentTitle: memoLog.company.companyName,
      deletedAt: memoLog.deletedAt,
      trashExpiresAt: memoLog.trashExpiresAt,
      now: input.now,
      canRestore: memoLog.company.deletedAt === null,
      hasPrivateMemo: true,
      summary: "개인 메모",
      fields: [
        this.createField("소속 회사", memoLog.company.companyName),
        this.createField("작성일", this.formatDateOnly(memoLog.createdAt)),
      ],
    });
  }

  private async listDeletedCompanies(input: ListTrashInput) {
    const metadata = TARGET_METADATA_BY_TYPE.get("COMPANY");

    if (!metadata || !this.shouldIncludeTarget(input, metadata)) {
      return [];
    }

    const companies = await this.client.company.findMany({
      where: this.createDeletedEntityWhere(input),
      select: {
        id: true,
        companyName: true,
        deletedAt: true,
        trashExpiresAt: true,
        _count: {
          select: {
            privateMemoLogs: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return companies.map((company) =>
      this.createTrashItem({
        metadata,
        targetId: company.id,
        title: company.companyName,
        deletedAt: company.deletedAt,
        trashExpiresAt: company.trashExpiresAt,
        now: input.now,
        hasPrivateMemo: company._count.privateMemoLogs > 0,
      })
    );
  }

  private async listDeletedCompanyMemoLogs(input: ListTrashInput) {
    const metadata = TARGET_METADATA_BY_TYPE.get("COMPANY_MEMO_LOG");

    if (!metadata || !this.shouldIncludeTarget(input, metadata)) {
      return [];
    }

    const memoLogs = await this.client.companyMemoLog.findMany({
      where: this.createDeletedCompanyLogWhere(input),
      select: {
        id: true,
        memoType: true,
        memo: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
            deletedAt: true,
          },
        },
      },
    });

    return memoLogs.map((memoLog) =>
      this.createTrashItem({
        metadata,
        targetId: memoLog.id,
        title: this.createMemoTitle(memoLog.memoType, memoLog.memo),
        parentId: memoLog.company.id,
        parentTitle: memoLog.company.companyName,
        deletedAt: memoLog.deletedAt,
        trashExpiresAt: memoLog.trashExpiresAt,
        now: input.now,
        canRestore: memoLog.company.deletedAt === null,
      })
    );
  }

  private async listDeletedCompanyPrivateMemoLogs(input: ListTrashInput) {
    const metadata = TARGET_METADATA_BY_TYPE.get("COMPANY_PRIVATE_MEMO_LOG");

    if (!metadata || !this.shouldIncludeTarget(input, metadata)) {
      return [];
    }

    const memoLogs = await this.client.companyUserPrivateMemoLog.findMany({
      where: this.createDeletedCompanyPrivateLogWhere(input),
      select: {
        id: true,
        createdAt: true,
        deletedAt: true,
        trashExpiresAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
            deletedAt: true,
          },
        },
      },
    });

    return memoLogs.map((memoLog) =>
      this.createTrashItem({
        metadata,
        targetId: memoLog.id,
        title: `개인 메모 ${this.formatDateOnly(memoLog.createdAt)}`,
        parentId: memoLog.company.id,
        parentTitle: memoLog.company.companyName,
        deletedAt: memoLog.deletedAt,
        trashExpiresAt: memoLog.trashExpiresAt,
        now: input.now,
        canRestore: memoLog.company.deletedAt === null,
        hasPrivateMemo: true,
      })
    );
  }

  private createTrashDetail(
    input: DeletedItemInput & {
      readonly summary: string;
      readonly fields: TrashDetail["fields"];
      readonly content?: string | null;
    }
  ): TrashDetail | null {
    const item = this.createTrashItem(input);

    if (!item) {
      return null;
    }

    return {
      ...item,
      summary: input.summary,
      fields: input.fields,
      ...(input.content !== undefined ? { content: input.content } : {}),
    };
  }

  private createTrashItem(input: DeletedItemInput): TrashItem | null {
    if (!input.deletedAt || !input.trashExpiresAt) {
      return null;
    }

    const restoreWindow = this.getRestoreWindow(input.trashExpiresAt, input.now);
    const canRestore =
      restoreWindow === "ACTIVE" && (input.canRestore ?? true);

    return {
      targetType: input.metadata.targetType,
      targetId: input.targetId,
      title: input.title,
      ...(input.metadata.parentType
        ? { parentType: input.metadata.parentType }
        : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      ...(input.parentTitle !== undefined
        ? { parentTitle: input.parentTitle }
        : {}),
      deletedAt: input.deletedAt,
      trashExpiresAt: input.trashExpiresAt,
      restoreWindow,
      canRestore,
      hasPrivateMemo: input.hasPrivateMemo ?? false,
      privateMemoIncluded: false,
    };
  }

  private createEntityWhere(
    input: GetTrashDetailInput
  ): Prisma.CompanyWhereInput {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
    };
  }

  private createCompanyLogWhere(
    input: GetTrashDetailInput
  ): Prisma.CompanyMemoLogWhereInput {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
    };
  }

  private createCompanyPrivateLogWhere(
    input: GetTrashDetailInput
  ): Prisma.CompanyUserPrivateMemoLogWhereInput {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
    };
  }

  private createDeletedEntityWhere(input: ListTrashInput): Prisma.CompanyWhereInput {
    return {
      userId: input.userId,
      deletedAt: {
        not: null,
      },
    };
  }

  private createDeletedCompanyLogWhere(
    input: ListTrashInput
  ): Prisma.CompanyMemoLogWhereInput {
    return {
      userId: input.userId,
      deletedAt: {
        not: null,
      },
    };
  }

  private createDeletedCompanyPrivateLogWhere(
    input: ListTrashInput
  ): Prisma.CompanyUserPrivateMemoLogWhereInput {
    return {
      userId: input.userId,
      deletedAt: {
        not: null,
      },
    };
  }

  private createField(label: string, value: string | number | null) {
    return {
      label,
      value: value === null ? null : String(value),
    };
  }

  private shouldIncludeTarget(
    input: ListTrashInput,
    metadata: TargetMetadata
  ): boolean {
    if (
      input.targetType &&
      input.targetType !== "ALL" &&
      input.targetType !== metadata.targetType
    ) {
      return false;
    }

    if (
      input.itemKind &&
      input.itemKind !== "ALL" &&
      input.itemKind !== metadata.itemKind
    ) {
      return false;
    }

    if (
      input.domain &&
      input.domain !== "ALL" &&
      input.domain !== metadata.domain
    ) {
      return false;
    }

    return !(
      input.logType &&
      input.logType !== "ALL" &&
      input.logType !== metadata.logType
    );
  }

  private filterByQuery(
    items: readonly TrashItem[],
    query: string | undefined
  ): TrashItem[] {
    const normalizedQuery = query?.trim().toLowerCase();

    if (!normalizedQuery) {
      return [...items];
    }

    return items.filter((item) =>
      [
        item.title,
        item.parentTitle,
        item.targetType,
        item.parentType,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery))
    );
  }

  private sortTrashItems(
    items: readonly TrashItem[],
    sort: ListTrashInput["sort"]
  ): TrashItem[] {
    const sorted = [...items];

    sorted.sort((left, right) => {
      const leftDate =
        sort === "EXPIRES_SOON" ? left.trashExpiresAt : left.deletedAt;
      const rightDate =
        sort === "EXPIRES_SOON" ? right.trashExpiresAt : right.deletedAt;
      const direction = sort === "EXPIRES_SOON" ? 1 : -1;
      const dateDiff = leftDate.getTime() - rightDate.getTime();

      if (dateDiff !== 0) {
        return dateDiff * direction;
      }

      return left.targetId.localeCompare(right.targetId);
    });

    return sorted;
  }

  private async restoreByTargetType(
    input: RestoreTrashItemInput
  ): Promise<boolean> {
    const data = this.createRestoreData();

    switch (input.targetType) {
      case "COMPANY": {
        const result = await this.client.company.updateMany({
          where: this.createCompanyRestoreWhere(input),
          data,
        });
        return result.count > 0;
      }

      case "COMPANY_MEMO_LOG": {
        const result = await this.client.companyMemoLog.updateMany({
          where: this.createCompanyLogRestoreWhere(input),
          data,
        });
        return result.count > 0;
      }

      case "COMPANY_PRIVATE_MEMO_LOG": {
        const result =
          await this.client.companyUserPrivateMemoLog.updateMany({
            where: this.createCompanyPrivateLogRestoreWhere(input),
            data,
          });
        return result.count > 0;
      }
    }
  }

  private async hasDeletedParent(input: RestoreTrashItemInput): Promise<boolean> {
    if (input.targetType === "COMPANY_MEMO_LOG") {
      const row = await this.client.companyMemoLog.findFirst({
        where: {
          id: input.targetId,
          userId: input.userId,
          deletedAt: {
            not: null,
          },
          company: {
            deletedAt: {
              not: null,
            },
          },
        },
        select: { id: true },
      });

      return Boolean(row);
    }

    if (input.targetType === "COMPANY_PRIVATE_MEMO_LOG") {
      const row = await this.client.companyUserPrivateMemoLog.findFirst({
        where: {
          id: input.targetId,
          userId: input.userId,
          deletedAt: {
            not: null,
          },
          company: {
            deletedAt: {
              not: null,
            },
          },
        },
        select: { id: true },
      });

      return Boolean(row);
    }

    return false;
  }

  private createCompanyRestoreWhere(
    input: RestoreTrashItemInput
  ): Prisma.CompanyWhereInput {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
      trashExpiresAt: {
        gte: input.now,
      },
    };
  }

  private createCompanyLogRestoreWhere(
    input: RestoreTrashItemInput
  ): Prisma.CompanyMemoLogWhereInput {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
      trashExpiresAt: {
        gte: input.now,
      },
      company: {
        deletedAt: null,
      },
    };
  }

  private createCompanyPrivateLogRestoreWhere(
    input: RestoreTrashItemInput
  ): Prisma.CompanyUserPrivateMemoLogWhereInput {
    return {
      id: input.targetId,
      userId: input.userId,
      deletedAt: {
        not: null,
      },
      trashExpiresAt: {
        gte: input.now,
      },
      company: {
        deletedAt: null,
      },
    };
  }

  private createRestoreData() {
    return {
      deletedAt: null,
      deletedByUserId: null,
      trashExpiresAt: null,
    };
  }

  private createMemoTitle(memoType: string, memo: string): string {
    const normalizedMemoType = memoType.trim();
    const normalizedMemo = memo.trim();
    const baseTitle =
      normalizedMemo.length > 0 ? normalizedMemo : normalizedMemoType;
    const shortened =
      baseTitle.length > MEMO_TITLE_MAX_LENGTH
        ? `${baseTitle.slice(0, MEMO_TITLE_MAX_LENGTH)}...`
        : baseTitle;

    return normalizedMemoType ? `${normalizedMemoType}: ${shortened}` : shortened;
  }

  private getRestoreWindow(trashExpiresAt: Date, now: Date) {
    return trashExpiresAt.getTime() >= now.getTime() ? "ACTIVE" : "EXPIRED";
  }

  private formatDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private normalizePage(page: number | undefined): number {
    return Number.isInteger(page) && page && page > 0 ? page : DEFAULT_PAGE;
  }

  private normalizePageSize(pageSize: number | undefined): number {
    if (!Number.isInteger(pageSize) || !pageSize || pageSize < 1) {
      return DEFAULT_PAGE_SIZE;
    }

    return Math.min(pageSize, MAX_PAGE_SIZE);
  }
}
