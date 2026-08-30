import { ImportJobStatus, ImportTemplateType, Prisma } from "@prisma/client";
import type {
  AdminDomainRecordRepository,
  CreateAdminDomainAuditLogInput,
  ListAdminDomainRecordsInput,
} from "@/modules/admin-operation/application/ports/admin-domain-record.repository";
import {
  AdminDomainRecordDomain,
  AdminDomainRecordSort,
  type AdminDomainRecordItemRecord,
  type AdminDomainRecordsPageRecord,
} from "@/modules/admin-operation/application/ports/admin-domain-record-read-model.types";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import {
  maskEmail,
  maskPhone,
} from "../../presentation/http/admin-redaction.mapper";

type AdminDomainRecordPrismaClient = PrismaService | Prisma.TransactionClient;

type DeletedFilter = { readonly deletedAt?: null };
type DeletedDomainOrderBy = Array<{
  readonly createdAt?: Prisma.SortOrder;
  readonly updatedAt?: Prisma.SortOrder;
  readonly deletedAt?: Prisma.SortOrder;
  readonly id?: Prisma.SortOrder;
}>;
type ActiveDomainOrderBy = Array<{
  readonly createdAt?: Prisma.SortOrder;
  readonly updatedAt?: Prisma.SortOrder;
  readonly id?: Prisma.SortOrder;
}>;

const companySelect = {
  id: true,
  companyName: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  trashExpiresAt: true,
  companyField: { select: { field: true } },
  companyRegion: { select: { region: true } },
  _count: {
    select: {
      contacts: true,
      dealCompanies: true,
      memoLogs: true,
      privateMemoLogs: true,
    },
  },
} satisfies Prisma.CompanySelect;

const contactSelect = {
  id: true,
  username: true,
  mobile: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  trashExpiresAt: true,
  company: { select: { companyName: true } },
  contactDepartment: { select: { departmentName: true } },
  contactJobGrade: { select: { jobGradeName: true } },
  _count: {
    select: {
      dealContacts: true,
      memoLogs: true,
      privateMemoLogs: true,
    },
  },
} satisfies Prisma.ContactSelect;

const productSelect = {
  id: true,
  productName: true,
  productPrice: true,
  currencyCode: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  trashExpiresAt: true,
  productCategory: { select: { categoryName: true } },
  productStatus: { select: { statusName: true } },
  _count: {
    select: {
      dealProducts: true,
      memoLogs: true,
      privateMemoLogs: true,
    },
  },
} satisfies Prisma.ProductSelect;

const dealSelect = {
  id: true,
  dealName: true,
  dealStatus: true,
  dealCost: true,
  currencyCode: true,
  expectedEndDate: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  trashExpiresAt: true,
  _count: {
    select: {
      dealCompanies: true,
      dealContacts: true,
      dealProducts: true,
      followingActionLogs: true,
      memoLogs: true,
      scheduleDeals: true,
      meetingNoteDeals: true,
    },
  },
} satisfies Prisma.DealSelect;

const scheduleSelect = {
  id: true,
  scheduleTitle: true,
  startAt: true,
  endAt: true,
  timeZone: true,
  isAllDay: true,
  sourceType: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  trashExpiresAt: true,
  _count: { select: { scheduleDeals: true } },
} satisfies Prisma.ScheduleSelect;

const meetingNoteSelect = {
  id: true,
  title: true,
  sourceType: true,
  meetingAt: true,
  timeZone: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  trashExpiresAt: true,
  _count: {
    select: {
      companies: true,
      contacts: true,
      products: true,
      deals: true,
    },
  },
} satisfies Prisma.MeetingNoteSelect;

const businessCardScanSelect = {
  id: true,
  status: true,
  companyName: true,
  contactName: true,
  contactMobile: true,
  contactEmail: true,
  companyResolution: true,
  contactResolution: true,
  companyId: true,
  contactId: true,
  safeErrorCode: true,
  safeErrorMessage: true,
  retryable: true,
  confirmedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BusinessCardScanLogSelect;

const importJobSelect = {
  id: true,
  targetType: true,
  status: true,
  mappingSource: true,
  totalRowCount: true,
  validRowCount: true,
  invalidRowCount: true,
  importedRowCount: true,
  failedRowCount: true,
  fileSizeBytes: true,
  expiresAt: true,
  confirmedAt: true,
  canceledAt: true,
  failedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ImportJobSelect;

const IMPORT_TEMPLATE_TYPE_VALUES = Object.values(ImportTemplateType);
const IMPORT_JOB_STATUS_VALUES = Object.values(ImportJobStatus);

type CompanyRow = Prisma.CompanyGetPayload<{ select: typeof companySelect }>;
type ContactRow = Prisma.ContactGetPayload<{ select: typeof contactSelect }>;
type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
type DealRow = Prisma.DealGetPayload<{ select: typeof dealSelect }>;
type ScheduleRow = Prisma.ScheduleGetPayload<{ select: typeof scheduleSelect }>;
type MeetingNoteRow = Prisma.MeetingNoteGetPayload<{
  select: typeof meetingNoteSelect;
}>;
type BusinessCardScanRow = Prisma.BusinessCardScanLogGetPayload<{
  select: typeof businessCardScanSelect;
}>;
type ImportJobRow = Prisma.ImportJobGetPayload<{ select: typeof importJobSelect }>;

// 역할 : PrismaAdminDomainRecordRepository Admin 도메인 read-only read model을 Prisma 조회로 구현합니다.
export class PrismaAdminDomainRecordRepository
  implements AdminDomainRecordRepository
{
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AdminDomainRecordPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : Admin 도메인 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AdminDomainRecordRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAdminDomainRecordRepository(transaction, null));
    });
  }

  // 기능 : Admin 도메인 탭 대상 사용자가 존재하는지 확인합니다.
  async targetUserExists(userId: string): Promise<boolean> {
    const user = await this.client.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return user !== null;
  }

  // 기능 : domain query에 맞는 사용자 소유 도메인 목록 조회를 실행합니다.
  async listDomainRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    switch (input.domain) {
      case AdminDomainRecordDomain.COMPANY:
        return this.listCompanyRecords(input);
      case AdminDomainRecordDomain.CONTACT:
        return this.listContactRecords(input);
      case AdminDomainRecordDomain.PRODUCT:
        return this.listProductRecords(input);
      case AdminDomainRecordDomain.DEAL:
        return this.listDealRecords(input);
      case AdminDomainRecordDomain.SCHEDULE:
        return this.listScheduleRecords(input);
      case AdminDomainRecordDomain.MEETING_NOTE:
        return this.listMeetingNoteRecords(input);
      case AdminDomainRecordDomain.BUSINESS_CARD_SCAN:
        return this.listBusinessCardScanRecords(input);
      case AdminDomainRecordDomain.IMPORT_JOB:
        return this.listImportJobRecords(input);
    }
  }

  // 기능 : Admin 도메인 조회 감사 로그를 append-only로 생성합니다.
  async createAuditLog(input: CreateAdminDomainAuditLogInput): Promise<void> {
    const metadataJson = input.metadataJson as Prisma.InputJsonObject;

    await this.client.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        targetUserId: input.targetUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        action: input.action,
        result: input.result,
        requestId: input.requestId,
        metadataJson,
      },
      select: { id: true },
    });
  }

  // 기능 : 회사 row를 안전한 summary로 조회합니다.
  private async listCompanyRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.company.findMany({
      where: {
        userId: input.userId,
        ...this.createDeletedFilter(input.includeDeleted),
        ...(input.q
          ? {
              OR: [
                { companyName: { contains: input.q } },
                { address: { contains: input.q } },
                { companyField: { field: { contains: input.q } } },
                { companyRegion: { region: { contains: input.q } } },
              ],
            }
          : {}),
      },
      select: companySelect,
      orderBy: this.createDeletedDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.COMPANY,
      rows.map((row) => this.toCompanyRecord(row)),
      input.limit
    );
  }

  // 기능 : 담당자 row를 원문 연락처 없이 masking summary로 조회합니다.
  private async listContactRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.contact.findMany({
      where: {
        userId: input.userId,
        ...this.createDeletedFilter(input.includeDeleted),
        ...(input.q
          ? {
              OR: [
                { username: { contains: input.q } },
                { mobile: { contains: input.q } },
                { email: { contains: input.q } },
                { company: { companyName: { contains: input.q } } },
                {
                  contactDepartment: {
                    departmentName: { contains: input.q },
                  },
                },
                { contactJobGrade: { jobGradeName: { contains: input.q } } },
              ],
            }
          : {}),
      },
      select: contactSelect,
      orderBy: this.createDeletedDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.CONTACT,
      rows.map((row) => this.toContactRecord(row)),
      input.limit
    );
  }

  // 기능 : 제품 row를 개인 메모 원문 없이 안전한 summary로 조회합니다.
  private async listProductRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.product.findMany({
      where: {
        userId: input.userId,
        ...this.createDeletedFilter(input.includeDeleted),
        ...(input.q
          ? {
              OR: [
                { productName: { contains: input.q } },
                { productCategory: { categoryName: { contains: input.q } } },
                { productStatus: { statusName: { contains: input.q } } },
              ],
            }
          : {}),
      },
      select: productSelect,
      orderBy: this.createDeletedDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.PRODUCT,
      rows.map((row) => this.toProductRecord(row)),
      input.limit
    );
  }

  // 기능 : 딜 row를 연결 수와 금액 summary로 조회합니다.
  private async listDealRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.deal.findMany({
      where: {
        userId: input.userId,
        ...this.createDeletedFilter(input.includeDeleted),
        ...(input.q
          ? {
              OR: [
                { dealName: { contains: input.q } },
                { dealStatus: { contains: input.q } },
              ],
            }
          : {}),
      },
      select: dealSelect,
      orderBy: this.createDeletedDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.DEAL,
      rows.map((row) => this.toDealRecord(row)),
      input.limit
    );
  }

  // 기능 : 일정 row를 memo와 외부 event 원문 없이 안전한 summary로 조회합니다.
  private async listScheduleRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.schedule.findMany({
      where: {
        userId: input.userId,
        ...this.createDeletedFilter(input.includeDeleted),
        ...(input.q
          ? {
              OR: [
                { scheduleTitle: { contains: input.q } },
                { location: { contains: input.q } },
              ],
            }
          : {}),
      },
      select: scheduleSelect,
      orderBy: this.createDeletedDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.SCHEDULE,
      rows.map((row) => this.toScheduleRecord(row)),
      input.limit
    );
  }

  // 기능 : 회의록 row를 body/rawText 없이 숨김 preview summary로 조회합니다.
  private async listMeetingNoteRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.meetingNote.findMany({
      where: {
        userId: input.userId,
        ...this.createDeletedFilter(input.includeDeleted),
        ...(input.q ? { title: { contains: input.q } } : {}),
      },
      select: meetingNoteSelect,
      orderBy: this.createDeletedDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.MEETING_NOTE,
      rows.map((row) => this.toMeetingNoteRecord(row)),
      input.limit
    );
  }

  // 기능 : 명함 스캔 row를 prompt/token/cost 없이 masking summary로 조회합니다.
  private async listBusinessCardScanRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.businessCardScanLog.findMany({
      where: {
        userId: input.userId,
        ...(input.q
          ? {
              OR: [
                { companyName: { contains: input.q } },
                { contactName: { contains: input.q } },
                { contactMobile: { contains: input.q } },
                { contactEmail: { contains: input.q } },
                { safeErrorCode: { contains: input.q } },
              ],
            }
          : {}),
      },
      select: businessCardScanSelect,
      orderBy: this.createActiveDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.BUSINESS_CARD_SCAN,
      rows.map((row) => this.toBusinessCardScanRecord(row)),
      input.limit
    );
  }

  // 기능 : import job row를 원본 파일 내용과 row raw data 없이 조회합니다.
  private async listImportJobRecords(
    input: ListAdminDomainRecordsInput
  ): Promise<AdminDomainRecordsPageRecord> {
    const rows = await this.client.importJob.findMany({
      where: {
        userId: input.userId,
        ...(input.q
          ? {
              OR: this.createImportJobSearchConditions(input.q),
            }
          : {}),
      },
      select: importJobSelect,
      orderBy: this.createActiveDomainOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    return this.toPage(
      AdminDomainRecordDomain.IMPORT_JOB,
      rows.map((row) => this.toImportJobRecord(row)),
      input.limit
    );
  }

  // 기능 : soft delete 모델의 includeDeleted 조건을 Prisma where 조각으로 만듭니다.
  private createDeletedFilter(includeDeleted: boolean): DeletedFilter {
    return includeDeleted ? {} : { deletedAt: null };
  }

  // 기능 : deletedAt이 있는 도메인의 정렬 조건을 생성합니다.
  private createDeletedDomainOrderBy(
    sort: AdminDomainRecordSort
  ): DeletedDomainOrderBy {
    if (sort === AdminDomainRecordSort.UPDATED_AT_DESC) {
      return [{ updatedAt: "desc" }, { id: "desc" }];
    }

    if (sort === AdminDomainRecordSort.DELETED_AT_DESC) {
      return [{ deletedAt: "desc" }, { id: "desc" }];
    }

    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  // 기능 : soft delete가 없는 도메인의 정렬 조건을 생성합니다.
  private createActiveDomainOrderBy(
    sort: AdminDomainRecordSort
  ): ActiveDomainOrderBy {
    if (sort === AdminDomainRecordSort.UPDATED_AT_DESC) {
      return [{ updatedAt: "desc" }, { id: "desc" }];
    }

    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  // 기능 : import job 검색어를 enum allowlist 조건과 텍스트 조건으로 변환합니다.
  private createImportJobSearchConditions(q: string): Prisma.ImportJobWhereInput[] {
    const normalized = q.toUpperCase();

    return [
      ...(this.isImportTemplateType(normalized)
        ? [{ targetType: normalized }]
        : []),
      ...(this.isImportJobStatus(normalized) ? [{ status: normalized }] : []),
      { contextLabel: { contains: q } },
      { originalFileName: { contains: q } },
    ];
  }

  // 기능 : 문자열이 ImportTemplateType enum 값인지 확인합니다.
  private isImportTemplateType(value: string): value is ImportTemplateType {
    return IMPORT_TEMPLATE_TYPE_VALUES.some((item) => item === value);
  }

  // 기능 : 문자열이 ImportJobStatus enum 값인지 확인합니다.
  private isImportJobStatus(value: string): value is ImportJobStatus {
    return IMPORT_JOB_STATUS_VALUES.some((item) => item === value);
  }

  // 기능 : limit보다 1개 더 조회한 row 배열을 cursor page로 변환합니다.
  private toPage(
    domain: AdminDomainRecordDomain,
    items: AdminDomainRecordItemRecord[],
    limit: number
  ): AdminDomainRecordsPageRecord {
    const pageItems = items.slice(0, limit);
    const lastItem = pageItems[pageItems.length - 1] ?? null;

    return {
      domain,
      items: pageItems,
      nextCursor: items.length > limit && lastItem ? lastItem.id : null,
    };
  }

  // 기능 : 삭제 시각으로 Admin row 상태를 계산합니다.
  private getRecordStatus(deletedAt: Date | null): "ACTIVE" | "DELETED" {
    return deletedAt ? "DELETED" : "ACTIVE";
  }

  // 기능 : 회사 row를 Admin 도메인 탭에 노출 가능한 안전한 row summary로 변환합니다.
  private toCompanyRecord(row: CompanyRow): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: row.companyName,
      status: this.getRecordStatus(row.deletedAt),
      summary: {
        field: row.companyField.field,
        region: row.companyRegion.region,
        contacts: row._count.contacts,
        deals: row._count.dealCompanies,
      },
      sensitiveFlags: {
        hasMemo: row._count.memoLogs > 0,
        hasPrivateMemo: row._count.privateMemoLogs > 0,
        privateMemoIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      trashExpiresAt: row.trashExpiresAt,
    };
  }

  // 기능 : 담당자 row를 Admin 도메인 탭에 노출 가능한 masking summary로 변환합니다.
  private toContactRecord(row: ContactRow): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: row.username,
      status: this.getRecordStatus(row.deletedAt),
      summary: {
        companyName: row.company.companyName,
        department: row.contactDepartment.departmentName,
        jobGrade: row.contactJobGrade.jobGradeName,
        emailMasked: maskEmail(row.email),
        mobileMasked: maskPhone(row.mobile),
        deals: row._count.dealContacts,
      },
      sensitiveFlags: {
        hasMemo: row._count.memoLogs > 0,
        hasPrivateMemo: row._count.privateMemoLogs > 0,
        privateMemoIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      trashExpiresAt: row.trashExpiresAt,
    };
  }

  // 기능 : 제품 row를 Admin 도메인 탭에 노출 가능한 안전한 row summary로 변환합니다.
  private toProductRecord(row: ProductRow): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: row.productName,
      status: this.getRecordStatus(row.deletedAt),
      summary: {
        category: row.productCategory.categoryName,
        productStatus: row.productStatus.statusName,
        productPrice: row.productPrice,
        currencyCode: row.currencyCode,
        deals: row._count.dealProducts,
      },
      sensitiveFlags: {
        hasMemo: row._count.memoLogs > 0,
        hasPrivateMemo: row._count.privateMemoLogs > 0,
        privateMemoIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      trashExpiresAt: row.trashExpiresAt,
    };
  }

  // 기능 : 딜 row를 Admin 도메인 탭에 노출 가능한 안전한 row summary로 변환합니다.
  private toDealRecord(row: DealRow): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: row.dealName,
      status: this.getRecordStatus(row.deletedAt),
      summary: {
        dealStatus: row.dealStatus,
        dealCost: row.dealCost,
        currencyCode: row.currencyCode,
        expectedEndDate: this.toDateOnly(row.expectedEndDate),
        companies: row._count.dealCompanies,
        contacts: row._count.dealContacts,
        products: row._count.dealProducts,
        nextActions: row._count.followingActionLogs,
        schedules: row._count.scheduleDeals,
        meetingNotes: row._count.meetingNoteDeals,
      },
      sensitiveFlags: {
        hasMemo: row._count.memoLogs > 0,
        hasPrivateMemo: false,
        privateMemoIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      trashExpiresAt: row.trashExpiresAt,
    };
  }

  // 기능 : 일정 row를 Admin 도메인 탭에 노출 가능한 안전한 row summary로 변환합니다.
  private toScheduleRecord(row: ScheduleRow): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: row.scheduleTitle,
      status: this.getRecordStatus(row.deletedAt),
      summary: {
        startAt: row.startAt.toISOString(),
        endAt: row.endAt.toISOString(),
        timeZone: row.timeZone,
        isAllDay: row.isAllDay,
        sourceType: row.sourceType,
        linkedDeals: row._count.scheduleDeals,
      },
      sensitiveFlags: {
        memoIncluded: false,
        externalRawIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      trashExpiresAt: row.trashExpiresAt,
    };
  }

  // 기능 : 회의록 row를 Admin 도메인 탭에 노출 가능한 숨김 body summary로 변환합니다.
  private toMeetingNoteRecord(row: MeetingNoteRow): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: row.title,
      status: this.getRecordStatus(row.deletedAt),
      summary: {
        meetingAt: row.meetingAt.toISOString(),
        timeZone: row.timeZone,
        sourceType: row.sourceType,
        linkedCompanies: row._count.companies,
        linkedContacts: row._count.contacts,
        linkedProducts: row._count.products,
        linkedDeals: row._count.deals,
        bodyPreview: "본문 숨김",
      },
      sensitiveFlags: {
        hasBody: true,
        rawBodyIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      trashExpiresAt: row.trashExpiresAt,
    };
  }

  // 기능 : 명함 스캔 row를 Admin 도메인 탭에 노출 가능한 masking summary로 변환합니다.
  private toBusinessCardScanRecord(
    row: BusinessCardScanRow
  ): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: row.companyName ?? row.contactName ?? "명함 스캔",
      status: "ACTIVE",
      summary: {
        scanStatus: row.status,
        companyName: row.companyName,
        contactName: row.contactName,
        contactMobileMasked: maskPhone(row.contactMobile),
        contactEmailMasked: maskEmail(row.contactEmail),
        companyResolution: row.companyResolution,
        contactResolution: row.contactResolution,
        linkedCompany: row.companyId !== null,
        linkedContact: row.contactId !== null,
        safeErrorCode: row.safeErrorCode,
        safeErrorMessage: row.safeErrorMessage,
        retryable: row.retryable,
        confirmedAt: row.confirmedAt?.toISOString() ?? null,
      },
      sensitiveFlags: {
        promptIncluded: false,
        providerRawIncluded: false,
        tokenIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: null,
      trashExpiresAt: null,
    };
  }

  // 기능 : import job row를 Admin 도메인 탭에 노출 가능한 집계 summary로 변환합니다.
  private toImportJobRecord(row: ImportJobRow): AdminDomainRecordItemRecord {
    return {
      id: row.id,
      displayTitle: `${row.targetType} import job`,
      status: "ACTIVE",
      summary: {
        targetType: row.targetType,
        importStatus: row.status,
        mappingSource: row.mappingSource,
        totalRows: row.totalRowCount,
        validRows: row.validRowCount,
        invalidRows: row.invalidRowCount,
        importedRows: row.importedRowCount,
        failedRows: row.failedRowCount,
        fileSizeBytes: row.fileSizeBytes,
        expiresAt: row.expiresAt.toISOString(),
        confirmedAt: row.confirmedAt?.toISOString() ?? null,
        canceledAt: row.canceledAt?.toISOString() ?? null,
        failedAt: row.failedAt?.toISOString() ?? null,
      },
      sensitiveFlags: {
        originalFileNameIncluded: false,
        rowRawDataIncluded: false,
        providerRawIncluded: false,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: null,
      trashExpiresAt: null,
    };
  }

  // 기능 : Date 객체를 YYYY-MM-DD 문자열로 변환합니다.
  private toDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
