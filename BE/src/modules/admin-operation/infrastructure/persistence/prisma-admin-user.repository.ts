import {
  BrowserPushSubscriptionStatus,
  NotificationDeliveryChannel,
  Prisma,
  ProductAnalyticsTargetType,
  TrashRecoveryRequestStatus,
} from "@prisma/client";
import { AdminUserListSort } from "@/modules/admin-operation/application/ports/admin-user-query.types";
import {
  type AdminUserActivityTimelinePageRecord,
  type AdminUserActivityTimelineRecord,
  type AdminUserListDomainCountsRecord,
  type AdminUserListItemRecord,
  type AdminUserListPageRecord,
  type AdminUserOverviewDomainCountsRecord,
  type AdminUserOverviewRecord,
  type AdminUserProfileRecord,
  type AdminUserRepository,
  type AdminUserTrashSummaryRecord,
  type CreateAdminAuditLogInput,
  type ListAdminUserActivityTimelineInput,
  type ListAdminUsersInput,
} from "@/modules/admin-operation/application/ports/admin-user.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type AdminUserPrismaClient = PrismaService | Prisma.TransactionClient;

const adminUserProfileSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  status: true,
  preferredLocale: true,
  timeZone: true,
  countryCode: true,
  defaultCurrencyCode: true,
  createdAt: true,
  lastLoginAt: true,
} satisfies Prisma.UserSelect;

type AdminUserProfileRow = Prisma.UserGetPayload<{
  select: typeof adminUserProfileSelect;
}>;

type UserCountRow = {
  readonly userId: string;
  readonly _count: { readonly _all: number };
};

type DomainCreatedAtRow = {
  readonly id: string;
  readonly createdAt: Date;
};

type TimelineDateFilter = {
  readonly gte?: Date;
  readonly lte?: Date;
  readonly lt?: Date;
};

type DomainTimelineDescriptor = {
  readonly eventType: string;
  readonly targetType: string;
  readonly title: string;
  readonly summary: string;
};

const zeroListDomainCounts: AdminUserListDomainCountsRecord = {
  companies: 0,
  contacts: 0,
  products: 0,
  deals: 0,
  schedules: 0,
  meetingNotes: 0,
  trashActive: 0,
  trashExpired: 0,
};

const zeroTrashSummary: AdminUserTrashSummaryRecord = {
  active: 0,
  expired: 0,
  recoveryRequests: 0,
};
const OPEN_RECOVERY_REQUEST_STATUSES: readonly TrashRecoveryRequestStatus[] = [
  TrashRecoveryRequestStatus.REQUESTED,
  TrashRecoveryRequestStatus.REVIEWING,
  TrashRecoveryRequestStatus.WAITING_RECOVERY_POLICY,
  TrashRecoveryRequestStatus.RECOVERY_AVAILABLE,
];

// 역할 : PrismaAdminUserRepository Admin 사용자 overview read model을 Prisma 조회로 구현합니다.
export class PrismaAdminUserRepository implements AdminUserRepository {
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AdminUserPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : Admin 사용자 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AdminUserRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAdminUserRepository(transaction, null));
    });
  }

  // 기능 : Admin 사용자 목록과 목록용 domain/trash count를 조회합니다.
  async listUsers(
    input: ListAdminUsersInput,
    now: Date
  ): Promise<AdminUserListPageRecord> {
    const rows = await this.client.user.findMany({
      where: this.createUserWhere(input),
      select: adminUserProfileSelect,
      orderBy: this.createUserOrderBy(input.sort),
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });
    const pageRows = rows.slice(0, input.limit);
    const userIds = pageRows.map((row) => row.id);
    const [domainCounts, trashSummaries] = await Promise.all([
      this.getListDomainCountsByUserIds(userIds),
      this.getTrashSummariesByUserIds(userIds, now),
    ]);
    const lastRow = pageRows[pageRows.length - 1] ?? null;

    return {
      items: pageRows.map((row) =>
        this.toUserListItemRecord(row, domainCounts, trashSummaries)
      ),
      nextCursor: rows.length > input.limit && lastRow ? lastRow.id : null,
    };
  }

  // 기능 : Admin 사용자 상세 overview를 안전한 summary record로 조회합니다.
  async getUserOverview(
    userId: string,
    now: Date
  ): Promise<AdminUserOverviewRecord | null> {
    const profile = await this.client.user.findUnique({
      where: { id: userId },
      select: adminUserProfileSelect,
    });

    if (!profile) {
      return null;
    }

    const [
      domainCounts,
      trashSummaryMap,
      analyticsSummary,
      notificationSummary,
    ] = await Promise.all([
      this.getOverviewDomainCounts(userId),
      this.getTrashSummariesByUserIds([userId], now),
      this.getAnalyticsSummary(userId, now),
      this.getNotificationSummary(userId),
    ]);

    return {
      id: profile.id,
      profile: this.toUserProfileRecord(profile),
      domainCounts,
      trashSummary: trashSummaryMap.get(userId) ?? zeroTrashSummary,
      analyticsSummary,
      notificationSummary,
    };
  }

  // 기능 : ProductAnalyticsEvent와 domain 생성 시각 기반 활동 timeline을 조회합니다.
  async listActivityTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelinePageRecord> {
    const timelineGroups = await Promise.all([
      this.listProductAnalyticsTimeline(input),
      this.listCompanyCreatedTimeline(input),
      this.listContactCreatedTimeline(input),
      this.listProductCreatedTimeline(input),
      this.listBusinessCardScanCreatedTimeline(input),
      this.listImportJobCreatedTimeline(input),
    ]);
    const items = timelineGroups
      .flat()
      .sort((left, right) => this.compareTimelineItems(left, right));
    const pageItems = items.slice(0, input.limit);
    const lastItem = pageItems[pageItems.length - 1] ?? null;

    return {
      items: pageItems,
      nextCursor:
        items.length > input.limit && lastItem
          ? lastItem.occurredAt.toISOString()
          : null,
    };
  }

  // 기능 : Admin 운영 조회 감사 로그를 append-only로 생성합니다.
  async createAuditLog(input: CreateAdminAuditLogInput): Promise<void> {
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

  // 기능 : 사용자 목록 query를 Prisma where 조건으로 변환합니다.
  private createUserWhere(input: ListAdminUsersInput): Prisma.UserWhereInput {
    return {
      ...(input.status ? { status: input.status } : {}),
      ...(input.countryCode ? { countryCode: input.countryCode } : {}),
      ...(input.preferredLocale
        ? { preferredLocale: input.preferredLocale }
        : {}),
      ...(input.q
        ? {
            OR: [
              { email: { contains: input.q } },
              { displayName: { contains: input.q } },
            ],
          }
        : {}),
    };
  }

  // 기능 : 사용자 목록 정렬 조건을 Prisma orderBy 조건으로 변환합니다.
  private createUserOrderBy(
    sort: AdminUserListSort
  ): Prisma.UserOrderByWithRelationInput[] {
    if (sort === AdminUserListSort.LAST_LOGIN_AT_DESC) {
      return [{ lastLoginAt: "desc" }, { id: "desc" }];
    }

    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  // 기능 : Prisma User row를 application profile record로 변환합니다.
  private toUserProfileRecord(row: AdminUserProfileRow): AdminUserProfileRecord {
    return {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      role: row.role,
      status: row.status,
      preferredLocale: row.preferredLocale,
      timeZone: row.timeZone,
      countryCode: row.countryCode,
      defaultCurrencyCode: row.defaultCurrencyCode,
      createdAt: row.createdAt,
      lastLoginAt: row.lastLoginAt,
    };
  }

  // 기능 : 목록 row에 domain count와 trash count를 결합합니다.
  private toUserListItemRecord(
    row: AdminUserProfileRow,
    domainCounts: ReadonlyMap<string, AdminUserListDomainCountsRecord>,
    trashSummaries: ReadonlyMap<string, AdminUserTrashSummaryRecord>
  ): AdminUserListItemRecord {
    const trashSummary = trashSummaries.get(row.id) ?? zeroTrashSummary;

    return {
      ...this.toUserProfileRecord(row),
      domainCounts: {
        ...(domainCounts.get(row.id) ?? zeroListDomainCounts),
        trashActive: trashSummary.active,
        trashExpired: trashSummary.expired,
      },
    };
  }

  // 기능 : 목록 사용자 ID별 주요 domain count를 aggregate합니다.
  private async getListDomainCountsByUserIds(
    userIds: readonly string[]
  ): Promise<Map<string, AdminUserListDomainCountsRecord>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const ids = [...userIds];
    const [companies, contacts, products, deals, schedules, meetingNotes] =
      await Promise.all([
        this.client.company.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, deletedAt: null },
          _count: { _all: true },
        }),
        this.client.contact.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, deletedAt: null },
          _count: { _all: true },
        }),
        this.client.product.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, deletedAt: null },
          _count: { _all: true },
        }),
        this.client.deal.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, deletedAt: null },
          _count: { _all: true },
        }),
        this.client.schedule.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, deletedAt: null },
          _count: { _all: true },
        }),
        this.client.meetingNote.groupBy({
          by: ["userId"],
          where: { userId: { in: ids }, deletedAt: null },
          _count: { _all: true },
        }),
      ]);
    const maps = {
      companies: this.toCountMap(companies),
      contacts: this.toCountMap(contacts),
      products: this.toCountMap(products),
      deals: this.toCountMap(deals),
      schedules: this.toCountMap(schedules),
      meetingNotes: this.toCountMap(meetingNotes),
    };

    return new Map(
      userIds.map((userId) => [
        userId,
        {
          companies: maps.companies.get(userId) ?? 0,
          contacts: maps.contacts.get(userId) ?? 0,
          products: maps.products.get(userId) ?? 0,
          deals: maps.deals.get(userId) ?? 0,
          schedules: maps.schedules.get(userId) ?? 0,
          meetingNotes: maps.meetingNotes.get(userId) ?? 0,
          trashActive: 0,
          trashExpired: 0,
        },
      ])
    );
  }

  // 기능 : 사용자 상세 화면의 domain count를 계산합니다.
  private async getOverviewDomainCounts(
    userId: string
  ): Promise<AdminUserOverviewDomainCountsRecord> {
    const [
      companies,
      contacts,
      products,
      deals,
      schedules,
      meetingNotes,
      businessCardScans,
      imports,
      exports,
    ] = await Promise.all([
      this.client.company.count({ where: { userId, deletedAt: null } }),
      this.client.contact.count({ where: { userId, deletedAt: null } }),
      this.client.product.count({ where: { userId, deletedAt: null } }),
      this.client.deal.count({ where: { userId, deletedAt: null } }),
      this.client.schedule.count({ where: { userId, deletedAt: null } }),
      this.client.meetingNote.count({ where: { userId, deletedAt: null } }),
      this.client.businessCardScanLog.count({ where: { userId } }),
      this.client.importJob.count({ where: { userId } }),
      this.client.productAnalyticsEvent.count({
        where: { userId, targetType: ProductAnalyticsTargetType.EXPORT },
      }),
    ]);

    return {
      companies,
      contacts,
      products,
      deals,
      schedules,
      meetingNotes,
      businessCardScans,
      imports,
      exports,
    };
  }

  // 기능 : 사용자 ID별 Trash active/expired count를 aggregate합니다.
  private async getTrashSummariesByUserIds(
    userIds: readonly string[],
    now: Date
  ): Promise<Map<string, AdminUserTrashSummaryRecord>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const [activeRows, expiredRows, recoveryRequestRows] = await Promise.all([
      this.countTrashRowsByUserIds(userIds, now, "active"),
      this.countTrashRowsByUserIds(userIds, now, "expired"),
      this.countOpenRecoveryRequestsByUserIds(userIds),
    ]);
    const activeMap = this.sumCountMaps(activeRows);
    const expiredMap = this.sumCountMaps(expiredRows);
    const recoveryRequestMap = this.toCountMap(recoveryRequestRows);

    return new Map(
      userIds.map((userId) => [
        userId,
        {
          active: activeMap.get(userId) ?? 0,
          expired: expiredMap.get(userId) ?? 0,
          recoveryRequests: recoveryRequestMap.get(userId) ?? 0,
        },
      ])
    );
  }

  // 기능 : 사용자 ID별 열린 Trash 복구 요청 수를 aggregate합니다.
  private async countOpenRecoveryRequestsByUserIds(
    userIds: readonly string[]
  ): Promise<UserCountRow[]> {
    const rows = await this.client.trashRecoveryRequest.groupBy({
      by: ["userId"],
      where: {
        userId: { in: [...userIds] },
        status: { in: [...OPEN_RECOVERY_REQUEST_STATUSES] },
      },
      _count: { _all: true },
    });

    return rows.map((row) => ({
      userId: row.userId,
      _count: { _all: row._count._all },
    }));
  }

  // 기능 : Trash 상태별 soft delete row count map 목록을 생성합니다.
  private async countTrashRowsByUserIds(
    userIds: readonly string[],
    now: Date,
    state: "active" | "expired"
  ): Promise<Array<Map<string, number>>> {
    const ids = [...userIds];
    const where = this.createTrashWhere(ids, now, state);
    const rows = await Promise.all([
      this.client.company.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.contact.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.product.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.deal.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.schedule.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.meetingNote.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.companyMemoLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.companyUserPrivateMemoLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.contactMemoLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.contactUserPrivateMemoLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.productMemoLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.productUserPrivateMemoLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.dealFollowingActionLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
      this.client.dealMemoLog.groupBy({
        by: ["userId"],
        where,
        _count: { _all: true },
      }),
    ]);

    return rows.map((row) => this.toCountMap(row));
  }

  // 기능 : Trash active/expired 상태에 맞는 Prisma where 조건을 생성합니다.
  private createTrashWhere(
    userIds: readonly string[],
    now: Date,
    state: "active" | "expired"
  ) {
    const trashExpiresAt =
      state === "active"
        ? { OR: [{ trashExpiresAt: null }, { trashExpiresAt: { gte: now } }] }
        : { trashExpiresAt: { lt: now } };

    return {
      userId: { in: [...userIds] },
      deletedAt: { not: null },
      ...trashExpiresAt,
    };
  }

  // 기능 : 사용자 activation, 최근 active event, 30일 AI 사용량 summary를 조회합니다.
  private async getAnalyticsSummary(userId: string, now: Date) {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [activation, lastActiveEvent, aiUsage] = await Promise.all([
      this.client.userActivationSnapshot.findUnique({
        where: { userId },
        select: { status: true, activatedAt: true },
      }),
      this.client.productAnalyticsEvent.findFirst({
        where: { userId },
        select: { occurredAt: true },
        orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      }),
      this.client.aiProviderCallLog.aggregate({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        _count: { _all: true },
        _sum: { estimatedCostAmount: true },
      }),
    ]);

    return {
      activationStatus: activation?.status ?? null,
      activatedAt: activation?.activatedAt ?? null,
      lastActiveEventAt: lastActiveEvent?.occurredAt ?? null,
      aiRequestCount30d: aiUsage._count._all,
      aiEstimatedCost30d: aiUsage._sum.estimatedCostAmount?.toString() ?? "0",
    };
  }

  // 기능 : browser push 설정과 구독, 최근 발송 실패 안전 코드를 조회합니다.
  private async getNotificationSummary(userId: string) {
    const [setting, activeSubscriptions, revokedSubscriptions, lastDelivery] =
      await Promise.all([
        this.client.userNotificationSetting.findUnique({
          where: { userId },
          select: { browserPushEnabled: true },
        }),
        this.client.browserPushSubscription.count({
          where: {
            userId,
            status: BrowserPushSubscriptionStatus.ACTIVE,
          },
        }),
        this.client.browserPushSubscription.count({
          where: {
            userId,
            status: BrowserPushSubscriptionStatus.REVOKED,
          },
        }),
        this.client.notificationDeliveryAttempt.findFirst({
          where: { userId, channel: NotificationDeliveryChannel.BROWSER_PUSH },
          select: { status: true, safeErrorCode: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        }),
      ]);

    return {
      browserPushEnabled: setting?.browserPushEnabled ?? false,
      activeBrowserPushSubscriptions: activeSubscriptions,
      revokedBrowserPushSubscriptions: revokedSubscriptions,
      lastBrowserPushDeliveryStatus: lastDelivery?.status ?? null,
      lastDeliveryFailureSafeErrorCode: lastDelivery?.safeErrorCode ?? null,
    };
  }

  // 기능 : 제품 분석 이벤트 timeline을 안전한 summary로 변환합니다.
  private async listProductAnalyticsTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelineRecord[]> {
    const dateFilter = this.createTimelineDateFilter(input);
    const rows = await this.client.productAnalyticsEvent.findMany({
      where: {
        userId: input.userId,
        ...(input.eventType ? { eventName: input.eventType } : {}),
        ...(dateFilter ? { occurredAt: dateFilter } : {}),
      },
      select: {
        id: true,
        eventName: true,
        targetType: true,
        targetId: true,
        occurredAt: true,
      },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
    });

    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventName,
      source: "PRODUCT_ANALYTICS_EVENT",
      targetType: row.targetType,
      targetId: row.targetId,
      title: this.getProductAnalyticsEventTitle(row.eventName),
      summary: this.getProductAnalyticsEventSummary(row.eventName),
      occurredAt: row.occurredAt,
    }));
  }

  // 기능 : 회사 생성 timeline record를 조회합니다.
  private listCompanyCreatedTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelineRecord[]> {
    return this.listDomainCreatedTimeline(input, {
      eventType: "company_created",
      targetType: "COMPANY",
      title: "회사 생성",
      summary: "회사 1건을 만들었어요",
    });
  }

  // 기능 : 담당자 생성 timeline record를 조회합니다.
  private listContactCreatedTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelineRecord[]> {
    return this.listDomainCreatedTimeline(input, {
      eventType: "contact_created",
      targetType: "CONTACT",
      title: "담당자 생성",
      summary: "담당자 1건을 만들었어요",
    });
  }

  // 기능 : 제품 생성 timeline record를 조회합니다.
  private listProductCreatedTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelineRecord[]> {
    return this.listDomainCreatedTimeline(input, {
      eventType: "product_created",
      targetType: "PRODUCT",
      title: "제품 생성",
      summary: "제품 1건을 만들었어요",
    });
  }

  // 기능 : 명함 스캔 생성 timeline record를 조회합니다.
  private listBusinessCardScanCreatedTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelineRecord[]> {
    return this.listDomainCreatedTimeline(input, {
      eventType: "business_card_scan_created",
      targetType: "BUSINESS_CARD_SCAN",
      title: "명함 스캔 기록",
      summary: "명함 스캔 기록 1건이 생겼어요",
    });
  }

  // 기능 : import job 생성 timeline record를 조회합니다.
  private listImportJobCreatedTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelineRecord[]> {
    return this.listDomainCreatedTimeline(input, {
      eventType: "import_job_created",
      targetType: "IMPORT_JOB",
      title: "데이터 가져오기",
      summary: "데이터 가져오기 작업 1건이 생겼어요",
    });
  }

  // 기능 : domain 생성 eventType에 맞는 timeline record를 조회합니다.
  private async listDomainCreatedTimeline(
    input: ListAdminUserActivityTimelineInput,
    descriptor: DomainTimelineDescriptor
  ): Promise<AdminUserActivityTimelineRecord[]> {
    if (input.eventType && input.eventType !== descriptor.eventType) {
      return [];
    }

    const rows = await this.fetchDomainCreatedRows(input, descriptor.eventType);

    return rows.map((row) => ({
      id: `${descriptor.eventType}:${row.id}`,
      eventType: descriptor.eventType,
      source: "DOMAIN_RECORD",
      targetType: descriptor.targetType,
      targetId: row.id,
      title: descriptor.title,
      summary: descriptor.summary,
      occurredAt: row.createdAt,
    }));
  }

  // 기능 : eventType에 맞는 domain 생성 row를 안전한 필드만 select해 조회합니다.
  private fetchDomainCreatedRows(
    input: ListAdminUserActivityTimelineInput,
    eventType: string
  ): Promise<DomainCreatedAtRow[]> {
    const where = this.createDomainTimelineWhere(input);

    switch (eventType) {
      case "company_created":
        return this.client.company.findMany({
          where,
          select: { id: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: input.limit + 1,
        });
      case "contact_created":
        return this.client.contact.findMany({
          where,
          select: { id: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: input.limit + 1,
        });
      case "product_created":
        return this.client.product.findMany({
          where,
          select: { id: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: input.limit + 1,
        });
      case "business_card_scan_created":
        return this.client.businessCardScanLog.findMany({
          where,
          select: { id: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: input.limit + 1,
        });
      case "import_job_created":
        return this.client.importJob.findMany({
          where,
          select: { id: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: input.limit + 1,
        });
      default:
        return Promise.resolve([]);
    }
  }

  // 기능 : domain timeline 조회 날짜 조건을 생성합니다.
  private createDomainTimelineWhere(
    input: ListAdminUserActivityTimelineInput
  ) {
    const dateFilter = this.createTimelineDateFilter(input);

    return {
      userId: input.userId,
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
  }

  // 기능 : timeline 조회의 from/to/cursor 날짜 조건을 생성합니다.
  private createTimelineDateFilter(
    input: ListAdminUserActivityTimelineInput
  ): TimelineDateFilter | undefined {
    const cursorDate = this.parseCursorDate(input.cursor);
    const filter: TimelineDateFilter = {
      ...(input.from ? { gte: input.from } : {}),
      ...(input.to ? { lte: input.to } : {}),
      ...(cursorDate ? { lt: cursorDate } : {}),
    };

    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  // 기능 : opaque cursor로 받은 ISO 날짜 문자열을 Date로 변환합니다.
  private parseCursorDate(cursor: string | undefined): Date | null {
    if (!cursor) {
      return null;
    }

    const parsed = new Date(cursor);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // 기능 : timeline item을 최신순으로 비교합니다.
  private compareTimelineItems(
    left: AdminUserActivityTimelineRecord,
    right: AdminUserActivityTimelineRecord
  ): number {
    const timeDelta = right.occurredAt.getTime() - left.occurredAt.getTime();

    if (timeDelta !== 0) {
      return timeDelta;
    }

    return right.id.localeCompare(left.id);
  }

  // 기능 : count groupBy row 배열을 userId 기준 Map으로 변환합니다.
  private toCountMap(rows: readonly UserCountRow[]): Map<string, number> {
    return new Map(rows.map((row) => [row.userId, row._count._all]));
  }

  // 기능 : 여러 count Map을 사용자별 합산 Map으로 결합합니다.
  private sumCountMaps(maps: readonly ReadonlyMap<string, number>[]) {
    const totals = new Map<string, number>();

    for (const map of maps) {
      for (const [userId, count] of map) {
        totals.set(userId, (totals.get(userId) ?? 0) + count);
      }
    }

    return totals;
  }

  // 기능 : 제품 분석 eventName에 맞는 안전한 timeline 제목을 반환합니다.
  private getProductAnalyticsEventTitle(eventName: string): string {
    switch (eventName) {
      case "deal_created":
        return "딜 생성";
      case "deal_next_action_created":
        return "다음 행동 생성";
      case "schedule_created":
        return "일정 생성";
      case "schedule_deal_linked":
        return "일정과 딜 연결";
      case "meeting_note_created":
        return "회의록 생성";
      case "meeting_note_deal_linked":
        return "회의록과 딜 연결";
      case "business_card_scan_confirmed":
        return "명함 스캔 확정";
      case "business_card_ocr_failed":
        return "명함 OCR 실패";
      case "import_confirmed":
        return "데이터 가져오기 확정";
      case "export_downloaded":
        return "내보내기 다운로드";
      case "auth_signup_completed":
        return "가입 완료";
      default:
        return "제품 활동";
    }
  }

  // 기능 : 제품 분석 eventName에 맞는 안전한 timeline 요약을 반환합니다.
  private getProductAnalyticsEventSummary(eventName: string): string {
    switch (eventName) {
      case "deal_created":
        return "딜 1건을 만들었어요";
      case "schedule_created":
        return "일정 1건을 만들었어요";
      case "meeting_note_created":
        return "회의록 1건을 만들었어요";
      case "export_downloaded":
        return "데이터 내보내기를 다운로드했어요";
      case "business_card_ocr_failed":
        return "명함 OCR이 실패했어요";
      default:
        return "안전한 제품 활동 이벤트가 기록됐어요";
    }
  }
}
