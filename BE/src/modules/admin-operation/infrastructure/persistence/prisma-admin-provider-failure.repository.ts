import {
  AiProviderCallStatus,
  AiProviderOperation,
  BusinessCardScanStatus,
  ExternalCalendarConnectionStatus,
  FollowUpDeliveryAttemptStatus,
  NotificationDeliveryChannel,
  NotificationDeliveryStatus,
  Prisma,
} from "@prisma/client";
import {
  AdminProviderFailureFeatureArea,
  AdminProviderFailureType,
  type AdminProviderFailureDetailRecord,
  type AdminProviderFailureListPageRecord,
  type AdminProviderFailureRecord,
  type AdminProviderFailureRepository,
  type AdminProviderFailureStatus,
  type AdminProviderFailureStatusFilter,
  type CreateAdminProviderFailureAuditLogInput,
  type ListAdminProviderFailuresInput,
} from "@/modules/admin-operation/application/ports/admin-provider-failure.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { maskDisplayName } from "../../presentation/http/admin-redaction.mapper";

type AdminProviderFailurePrismaClient =
  | PrismaService
  | Prisma.TransactionClient;

type ProviderFailureCursor = {
  readonly id: string;
  readonly occurredAt: Date;
};

// 역할 : ProviderFailureSourcePage source별 provider 실패 조회 batch 범위를 정의합니다.
type ProviderFailureSourcePage = {
  readonly skip: number;
  readonly take: number;
};

type ProviderFailureSourcePrefix =
  | "AI"
  | "STT"
  | "OCR"
  | "PUSH"
  | "EMAIL"
  | "SMS"
  | "CALENDAR_CONNECTION"
  | "CALENDAR_SOURCE";

const aiProviderFailureSelect = {
  id: true,
  userId: true,
  operation: true,
  status: true,
  reportId: true,
  jobId: true,
  targetType: true,
  targetId: true,
  provider: true,
  model: true,
  requestId: true,
  latencyMs: true,
  safeErrorCode: true,
  safeErrorMessage: true,
  retryable: true,
  startedAt: true,
  completedAt: true,
  failedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { email: true } },
} satisfies Prisma.AiProviderCallLogSelect;

const businessCardFailureSelect = {
  id: true,
  userId: true,
  status: true,
  companyName: true,
  contactName: true,
  companyId: true,
  contactId: true,
  pendingTimeMs: true,
  safeErrorCode: true,
  safeErrorMessage: true,
  retryable: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { email: true } },
} satisfies Prisma.BusinessCardScanLogSelect;

const notificationDeliveryFailureSelect = {
  id: true,
  notificationId: true,
  userId: true,
  channel: true,
  status: true,
  attemptNumber: true,
  provider: true,
  providerMessageId: true,
  providerStatusCode: true,
  safeErrorCode: true,
  safeErrorMessage: true,
  retryable: true,
  nextRetryAt: true,
  sentAt: true,
  failedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { email: true } },
} satisfies Prisma.NotificationDeliveryAttemptSelect;

const followUpDeliveryFailureSelect = {
  id: true,
  messageId: true,
  userId: true,
  channel: true,
  status: true,
  attemptNumber: true,
  provider: true,
  providerMessageId: true,
  providerStatusCode: true,
  safeErrorCode: true,
  safeErrorMessage: true,
  retryable: true,
  nextRetryAt: true,
  latencyMs: true,
  sentAt: true,
  failedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { email: true } },
} satisfies Prisma.FollowUpDeliveryAttemptSelect;

const calendarConnectionFailureSelect = {
  id: true,
  userId: true,
  provider: true,
  status: true,
  lastSyncedAt: true,
  lastSyncStartedAt: true,
  lastSyncFailedAt: true,
  lastSyncErrorCode: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { email: true } },
} satisfies Prisma.ExternalCalendarConnectionSelect;

const calendarSourceFailureSelect = {
  id: true,
  userId: true,
  connectionId: true,
  provider: true,
  calendarTimeZone: true,
  isPrimary: true,
  isSystemCalendar: true,
  status: true,
  lastSyncedAt: true,
  lastSyncFailedAt: true,
  lastSyncErrorCode: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { email: true } },
} satisfies Prisma.ExternalCalendarSourceSelect;

type AiProviderFailureRow = Prisma.AiProviderCallLogGetPayload<{
  select: typeof aiProviderFailureSelect;
}>;
type BusinessCardFailureRow = Prisma.BusinessCardScanLogGetPayload<{
  select: typeof businessCardFailureSelect;
}>;
type NotificationDeliveryFailureRow =
  Prisma.NotificationDeliveryAttemptGetPayload<{
    select: typeof notificationDeliveryFailureSelect;
  }>;
type FollowUpDeliveryFailureRow = Prisma.FollowUpDeliveryAttemptGetPayload<{
  select: typeof followUpDeliveryFailureSelect;
}>;
type CalendarConnectionFailureRow =
  Prisma.ExternalCalendarConnectionGetPayload<{
    select: typeof calendarConnectionFailureSelect;
  }>;
type CalendarSourceFailureRow = Prisma.ExternalCalendarSourceGetPayload<{
  select: typeof calendarSourceFailureSelect;
}>;

const AI_FAILURE_STATUSES = [
  AiProviderCallStatus.PENDING,
  AiProviderCallStatus.FAILED,
  AiProviderCallStatus.CANCELED,
];
const DELIVERY_FAILURE_STATUSES = [
  NotificationDeliveryStatus.PENDING,
  NotificationDeliveryStatus.FAILED,
  NotificationDeliveryStatus.CANCELED,
];
const FOLLOW_UP_DELIVERY_FAILURE_STATUSES = [
  FollowUpDeliveryAttemptStatus.PENDING,
  FollowUpDeliveryAttemptStatus.FAILED,
  FollowUpDeliveryAttemptStatus.CANCELED,
];
// 기능 : source별 실패 로그를 안전하게 끝까지 읽기 위한 기본 batch 크기입니다.
const SOURCE_FETCH_BATCH_SIZE = 300;

// 역할 : PrismaAdminProviderFailureRepository Admin provider 실패 safe read model을 Prisma 조회로 구현합니다.
export class PrismaAdminProviderFailureRepository
  implements AdminProviderFailureRepository
{
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AdminProviderFailurePrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : Admin provider 실패 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AdminProviderFailureRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAdminProviderFailureRepository(transaction, null));
    });
  }

  // 기능 : source별 provider 실패 로그를 Admin 공통 failure row로 변환합니다.
  async listProviderFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureListPageRecord> {
    const cursor = this.parseCursor(input.cursor);
    // 1. source별 고정 fetch window가 다음 페이지를 끊지 않도록 각 source를 batch 단위로 모두 읽습니다.
    const sourceGroups = await Promise.all([
      this.shouldReadAiProviderFailures(input)
        ? this.listAiProviderFailures(input)
        : Promise.resolve([]),
      this.shouldReadOcrProviderFailures(input)
        ? this.listOcrProviderFailures(input)
        : Promise.resolve([]),
      this.shouldReadPushProviderFailures(input)
        ? this.listPushProviderFailures(input)
        : Promise.resolve([]),
      this.shouldReadFollowUpProviderFailures(input)
        ? this.listFollowUpProviderFailures(input)
        : Promise.resolve([]),
      this.shouldReadCalendarProviderFailures(input)
        ? this.listCalendarConnectionFailures(input)
        : Promise.resolve([]),
      this.shouldReadCalendarProviderFailures(input)
        ? this.listCalendarSourceFailures(input)
        : Promise.resolve([]),
    ]);
    // 2. source별 row를 공통 filter와 global cursor 기준으로 다시 정렬해 Admin 목록 계약을 유지합니다.
    const sortedRecords = sourceGroups
      .flat()
      .filter((record) => this.matchesCommonFilters(record, input))
      .sort((left, right) => this.compareProviderFailures(left, right));
    const cursorFilteredRecords = cursor
      ? sortedRecords.filter(
          (record) => this.compareRecordToCursor(record, cursor) > 0
        )
      : sortedRecords;
    // 3. limit보다 많은 후보가 있을 때만 다음 cursor를 반환합니다.
    const pageItems = cursorFilteredRecords.slice(0, input.limit);
    const lastItem = pageItems[pageItems.length - 1] ?? null;

    return {
      items: pageItems,
      nextCursor:
        cursorFilteredRecords.length > input.limit && lastItem
          ? this.createCursor(lastItem)
          : null,
    };
  }

  // 기능 : provider raw response 없이 safe error context만 조회합니다.
  async getProviderFailureDetail(
    failureId: string
  ): Promise<AdminProviderFailureDetailRecord | null> {
    const parsedFailureId = this.parseFailureId(failureId);

    if (!parsedFailureId) {
      return null;
    }

    switch (parsedFailureId.prefix) {
      case "AI":
      case "STT":
        return this.getAiProviderFailureDetail(failureId, parsedFailureId.sourceId);
      case "OCR":
        return this.getOcrProviderFailureDetail(parsedFailureId.sourceId);
      case "PUSH":
        return this.getPushProviderFailureDetail(parsedFailureId.sourceId);
      case "EMAIL":
      case "SMS":
        return this.getFollowUpProviderFailureDetail(
          failureId,
          parsedFailureId.sourceId
        );
      case "CALENDAR_CONNECTION":
        return this.getCalendarConnectionFailureDetail(parsedFailureId.sourceId);
      case "CALENDAR_SOURCE":
        return this.getCalendarSourceFailureDetail(parsedFailureId.sourceId);
    }
  }

  // 기능 : Admin provider 실패 운영 조회 감사 로그를 append-only로 생성합니다.
  async createAuditLog(
    input: CreateAdminProviderFailureAuditLogInput
  ): Promise<void> {
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

  // 기능 : AiProviderCallLog 실패/취소/대기 row를 안전 필드만 select해 조회합니다.
  private async listAiProviderFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureDetailRecord[]> {
    return this.collectSourceFailures(
      (page) =>
        this.client.aiProviderCallLog.findMany({
          where: {
            ...this.createUserWhere(input),
            ...this.createCreatedAtWhere(input),
            ...this.createAiProviderStatusWhere(input),
          },
          select: aiProviderFailureSelect,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: page.skip,
          take: page.take,
        }),
      (row) => this.toAiProviderFailureRecord(row)
    );
  }

  // 기능 : BusinessCardScanLog OCR 실패 row를 safe error 필드만 select해 조회합니다.
  private async listOcrProviderFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureDetailRecord[]> {
    return this.collectSourceFailures(
      (page) =>
        this.client.businessCardScanLog.findMany({
          where: {
            ...this.createUserWhere(input),
            ...this.createCreatedAtWhere(input),
            ...this.createRetryableWhere(input),
            OR: [
              { status: BusinessCardScanStatus.OCR_FAILED },
              { safeErrorCode: { not: null } },
            ],
          },
          select: businessCardFailureSelect,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: page.skip,
          take: page.take,
        }),
      (row) => this.toBusinessCardFailureRecord(row)
    );
  }

  // 기능 : NotificationDeliveryAttempt browser push 실패를 secret 없는 select로 조회합니다.
  private async listPushProviderFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureDetailRecord[]> {
    return this.collectSourceFailures(
      (page) =>
        this.client.notificationDeliveryAttempt.findMany({
          where: {
            ...this.createUserWhere(input),
            ...this.createCreatedAtWhere(input),
            ...this.createNotificationDeliveryStatusWhere(input),
            ...this.createRetryableWhere(input),
            channel: NotificationDeliveryChannel.BROWSER_PUSH,
          },
          select: notificationDeliveryFailureSelect,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: page.skip,
          take: page.take,
        }),
      (row) => this.toNotificationDeliveryFailureRecord(row)
    );
  }

  // 기능 : FollowUpDeliveryAttempt email/SMS 실패를 safe delivery 필드만 select해 조회합니다.
  private async listFollowUpProviderFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureDetailRecord[]> {
    return this.collectSourceFailures(
      (page) =>
        this.client.followUpDeliveryAttempt.findMany({
          where: {
            ...this.createUserWhere(input),
            ...this.createCreatedAtWhere(input),
            ...this.createFollowUpDeliveryStatusWhere(input),
            ...this.createRetryableWhere(input),
          },
          select: followUpDeliveryFailureSelect,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: page.skip,
          take: page.take,
        }),
      (row) => this.toFollowUpDeliveryFailureRecord(row)
    );
  }

  // 기능 : ExternalCalendarConnection 연결 실패를 token 없는 select로 조회합니다.
  private async listCalendarConnectionFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureDetailRecord[]> {
    if (input.status === "RETRYABLE" || input.retryable === true) {
      return [];
    }

    return this.collectSourceFailures(
      (page) =>
        this.client.externalCalendarConnection.findMany({
          where: {
            ...this.createUserWhere(input),
            ...this.createUpdatedAtWhere(input),
            OR: [
              { lastSyncErrorCode: { not: null } },
              { status: ExternalCalendarConnectionStatus.RECONNECT_REQUIRED },
            ],
          },
          select: calendarConnectionFailureSelect,
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          skip: page.skip,
          take: page.take,
        }),
      (row) => this.toCalendarConnectionFailureRecord(row)
    );
  }

  // 기능 : ExternalCalendarSource 동기화 실패를 calendarId/syncToken 없는 select로 조회합니다.
  private async listCalendarSourceFailures(
    input: ListAdminProviderFailuresInput
  ): Promise<AdminProviderFailureDetailRecord[]> {
    if (input.status === "RETRYABLE" || input.retryable === true) {
      return [];
    }

    return this.collectSourceFailures(
      (page) =>
        this.client.externalCalendarSource.findMany({
          where: {
            ...this.createUserWhere(input),
            ...this.createUpdatedAtWhere(input),
            lastSyncErrorCode: { not: null },
          },
          select: calendarSourceFailureSelect,
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
          skip: page.skip,
          take: page.take,
        }),
      (row) => this.toCalendarSourceFailureRecord(row)
    );
  }

  // 기능 : source별 provider 실패 row를 batch로 모두 읽어 pagination 후보 누락을 막습니다.
  private async collectSourceFailures<TRow>(
    fetchRows: (page: ProviderFailureSourcePage) => Promise<readonly TRow[]>,
    mapRow: (row: TRow) => AdminProviderFailureDetailRecord
  ): Promise<AdminProviderFailureDetailRecord[]> {
    const records: AdminProviderFailureDetailRecord[] = [];
    let skip = 0;

    for (;;) {
      // 1. Prisma source별 정렬 순서에 맞춰 다음 batch를 읽습니다.
      const rows = await fetchRows({
        skip,
        take: SOURCE_FETCH_BATCH_SIZE,
      });

      // 2. 안전 필드만 가진 row를 Admin 공통 failure record로 변환합니다.
      records.push(...rows.map((row) => mapRow(row)));

      if (rows.length < SOURCE_FETCH_BATCH_SIZE) {
        return records;
      }

      skip += SOURCE_FETCH_BATCH_SIZE;
    }
  }

  // 기능 : AiProviderCallLog 상세를 safe select로 조회하고 opaque ID와 일치하는지 확인합니다.
  private async getAiProviderFailureDetail(
    failureId: string,
    sourceId: string
  ): Promise<AdminProviderFailureDetailRecord | null> {
    const row = await this.client.aiProviderCallLog.findUnique({
      where: { id: sourceId },
      select: aiProviderFailureSelect,
    });

    if (!row || row.status === AiProviderCallStatus.SUCCEEDED) {
      return null;
    }

    const record = this.toAiProviderFailureRecord(row);

    return record.id === failureId ? record : null;
  }

  // 기능 : BusinessCardScanLog 상세를 prompt/token 없는 safe select로 조회합니다.
  private async getOcrProviderFailureDetail(
    sourceId: string
  ): Promise<AdminProviderFailureDetailRecord | null> {
    const row = await this.client.businessCardScanLog.findUnique({
      where: { id: sourceId },
      select: businessCardFailureSelect,
    });

    if (
      !row ||
      (row.status !== BusinessCardScanStatus.OCR_FAILED && !row.safeErrorCode)
    ) {
      return null;
    }

    return this.toBusinessCardFailureRecord(row);
  }

  // 기능 : NotificationDeliveryAttempt 상세를 browser push secret 조회 없이 가져옵니다.
  private async getPushProviderFailureDetail(
    sourceId: string
  ): Promise<AdminProviderFailureDetailRecord | null> {
    const row = await this.client.notificationDeliveryAttempt.findUnique({
      where: { id: sourceId },
      select: notificationDeliveryFailureSelect,
    });

    if (
      !row ||
      row.channel !== NotificationDeliveryChannel.BROWSER_PUSH ||
      !DELIVERY_FAILURE_STATUSES.some((status) => status === row.status)
    ) {
      return null;
    }

    return this.toNotificationDeliveryFailureRecord(row);
  }

  // 기능 : FollowUpDeliveryAttempt 상세를 provider raw detailJson 없이 조회합니다.
  private async getFollowUpProviderFailureDetail(
    failureId: string,
    sourceId: string
  ): Promise<AdminProviderFailureDetailRecord | null> {
    const row = await this.client.followUpDeliveryAttempt.findUnique({
      where: { id: sourceId },
      select: followUpDeliveryFailureSelect,
    });

    if (
      !row ||
      !FOLLOW_UP_DELIVERY_FAILURE_STATUSES.some(
        (status) => status === row.status
      )
    ) {
      return null;
    }

    const record = this.toFollowUpDeliveryFailureRecord(row);

    return record.id === failureId ? record : null;
  }

  // 기능 : ExternalCalendarConnection 상세를 account/token 필드 없이 조회합니다.
  private async getCalendarConnectionFailureDetail(
    sourceId: string
  ): Promise<AdminProviderFailureDetailRecord | null> {
    const row = await this.client.externalCalendarConnection.findUnique({
      where: { id: sourceId },
      select: calendarConnectionFailureSelect,
    });

    if (
      !row ||
      (!row.lastSyncErrorCode &&
        row.status !== ExternalCalendarConnectionStatus.RECONNECT_REQUIRED)
    ) {
      return null;
    }

    return this.toCalendarConnectionFailureRecord(row);
  }

  // 기능 : ExternalCalendarSource 상세를 calendarId/syncToken 없이 조회합니다.
  private async getCalendarSourceFailureDetail(
    sourceId: string
  ): Promise<AdminProviderFailureDetailRecord | null> {
    const row = await this.client.externalCalendarSource.findUnique({
      where: { id: sourceId },
      select: calendarSourceFailureSelect,
    });

    if (!row?.lastSyncErrorCode) {
      return null;
    }

    return this.toCalendarSourceFailureRecord(row);
  }

  // 기능 : AiProviderCallLog row를 Admin provider failure 공통 record로 변환합니다.
  private toAiProviderFailureRecord(
    row: AiProviderFailureRow
  ): AdminProviderFailureDetailRecord {
    const providerType = this.getAiProviderType(row.operation);

    return {
      id: `${providerType}:${row.id}`,
      sourceId: row.id,
      providerType,
      sourceModel: "AiProviderCallLog",
      userId: row.userId,
      userEmail: row.user.email,
      featureArea: this.getAiFeatureArea(row.operation),
      operation: row.operation,
      targetType: row.targetType ?? this.getAiFallbackTargetType(row.operation),
      targetId: row.targetId ?? row.reportId ?? row.jobId ?? null,
      status: this.toCommonProviderStatus(row.status),
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      latencyMs: row.latencyMs,
      requestId: row.requestId,
      occurredAt: row.failedAt ?? row.completedAt ?? row.startedAt ?? row.createdAt,
      safeContext: {
        provider: row.provider,
        model: row.model,
        startedAt: row.startedAt.toISOString(),
        completedAt: row.completedAt?.toISOString() ?? null,
        failedAt: row.failedAt?.toISOString() ?? null,
        targetLinked: row.targetId !== null,
        reportLinked: row.reportId !== null,
        jobLinked: row.jobId !== null,
      },
    };
  }

  // 기능 : BusinessCardScanLog row를 OCR provider failure record로 변환합니다.
  private toBusinessCardFailureRecord(
    row: BusinessCardFailureRow
  ): AdminProviderFailureDetailRecord {
    return {
      id: `OCR:${row.id}`,
      sourceId: row.id,
      providerType: AdminProviderFailureType.OCR,
      sourceModel: "BusinessCardScanLog",
      userId: row.userId,
      userEmail: row.user.email,
      featureArea: AdminProviderFailureFeatureArea.BUSINESS_CARD_SCAN,
      operation: "OCR_SCAN",
      targetType: "BUSINESS_CARD_SCAN",
      targetId: row.id,
      status: "FAILED",
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      latencyMs:
        row.pendingTimeMs === null ? null : Math.round(row.pendingTimeMs),
      requestId: null,
      occurredAt: row.updatedAt ?? row.createdAt,
      safeContext: {
        candidateCompanyName: row.companyName,
        candidateContactName: maskDisplayName(row.contactName),
        imageStored: false,
        linkedCompany: row.companyId !== null,
        linkedContact: row.contactId !== null,
      },
    };
  }

  // 기능 : NotificationDeliveryAttempt row를 browser push provider failure record로 변환합니다.
  private toNotificationDeliveryFailureRecord(
    row: NotificationDeliveryFailureRow
  ): AdminProviderFailureDetailRecord {
    return {
      id: `PUSH:${row.id}`,
      sourceId: row.id,
      providerType: AdminProviderFailureType.PUSH,
      sourceModel: "NotificationDeliveryAttempt",
      userId: row.userId,
      userEmail: row.user.email,
      featureArea: AdminProviderFailureFeatureArea.NOTIFICATION,
      operation: `${row.channel}_DELIVERY`,
      targetType: "NOTIFICATION",
      targetId: row.notificationId,
      status: this.toDeliveryProviderStatus(row.status),
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      latencyMs: null,
      requestId: row.providerMessageId,
      occurredAt: row.failedAt ?? row.sentAt ?? row.createdAt,
      safeContext: {
        channel: row.channel,
        attemptNumber: row.attemptNumber,
        provider: row.provider,
        providerStatusCode: row.providerStatusCode,
        nextRetryAt: row.nextRetryAt?.toISOString() ?? null,
        sentAt: row.sentAt?.toISOString() ?? null,
        failedAt: row.failedAt?.toISOString() ?? null,
      },
    };
  }

  // 기능 : FollowUpDeliveryAttempt row를 email/SMS provider failure record로 변환합니다.
  private toFollowUpDeliveryFailureRecord(
    row: FollowUpDeliveryFailureRow
  ): AdminProviderFailureDetailRecord {
    const providerType =
      row.channel === "EMAIL"
        ? AdminProviderFailureType.EMAIL
        : AdminProviderFailureType.SMS;

    return {
      id: `${providerType}:${row.id}`,
      sourceId: row.id,
      providerType,
      sourceModel: "FollowUpDeliveryAttempt",
      userId: row.userId,
      userEmail: row.user.email,
      featureArea: AdminProviderFailureFeatureArea.FOLLOW_UP,
      operation: `${row.channel}_DELIVERY`,
      targetType: "FOLLOW_UP_MESSAGE",
      targetId: row.messageId,
      status: this.toFollowUpDeliveryProviderStatus(row.status),
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      latencyMs: row.latencyMs,
      requestId: row.providerMessageId,
      occurredAt: row.failedAt ?? row.sentAt ?? row.createdAt,
      safeContext: {
        channel: row.channel,
        attemptNumber: row.attemptNumber,
        provider: row.provider,
        providerStatusCode: row.providerStatusCode,
        nextRetryAt: row.nextRetryAt?.toISOString() ?? null,
        sentAt: row.sentAt?.toISOString() ?? null,
        failedAt: row.failedAt?.toISOString() ?? null,
      },
    };
  }

  // 기능 : ExternalCalendarConnection row를 calendar provider failure record로 변환합니다.
  private toCalendarConnectionFailureRecord(
    row: CalendarConnectionFailureRow
  ): AdminProviderFailureDetailRecord {
    return {
      id: `CALENDAR_CONNECTION:${row.id}`,
      sourceId: row.id,
      providerType: AdminProviderFailureType.CALENDAR,
      sourceModel: "ExternalCalendarConnection",
      userId: row.userId,
      userEmail: row.user.email,
      featureArea: AdminProviderFailureFeatureArea.CALENDAR_SYNC,
      operation: `${row.provider}_CALENDAR_CONNECTION`,
      targetType: "EXTERNAL_CALENDAR_CONNECTION",
      targetId: row.id,
      status: "FAILED",
      safeErrorCode:
        row.lastSyncErrorCode ?? `CALENDAR_${row.status}_STATE`,
      safeErrorMessage: this.toCalendarSafeErrorMessage(row.lastSyncErrorCode),
      retryable: false,
      latencyMs: null,
      requestId: null,
      occurredAt: row.lastSyncFailedAt ?? row.updatedAt ?? row.createdAt,
      safeContext: {
        provider: row.provider,
        connectionStatus: row.status,
        lastSyncStartedAt: row.lastSyncStartedAt?.toISOString() ?? null,
        lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
        lastSyncFailedAt: row.lastSyncFailedAt?.toISOString() ?? null,
      },
    };
  }

  // 기능 : ExternalCalendarSource row를 calendar source provider failure record로 변환합니다.
  private toCalendarSourceFailureRecord(
    row: CalendarSourceFailureRow
  ): AdminProviderFailureDetailRecord {
    return {
      id: `CALENDAR_SOURCE:${row.id}`,
      sourceId: row.id,
      providerType: AdminProviderFailureType.CALENDAR,
      sourceModel: "ExternalCalendarSource",
      userId: row.userId,
      userEmail: row.user.email,
      featureArea: AdminProviderFailureFeatureArea.CALENDAR_SYNC,
      operation: `${row.provider}_CALENDAR_SOURCE_SYNC`,
      targetType: "EXTERNAL_CALENDAR_SOURCE",
      targetId: row.id,
      status: "FAILED",
      safeErrorCode: row.lastSyncErrorCode,
      safeErrorMessage: this.toCalendarSafeErrorMessage(row.lastSyncErrorCode),
      retryable: false,
      latencyMs: null,
      requestId: null,
      occurredAt: row.lastSyncFailedAt ?? row.updatedAt ?? row.createdAt,
      safeContext: {
        provider: row.provider,
        sourceStatus: row.status,
        connectionId: row.connectionId,
        calendarTimeZone: row.calendarTimeZone,
        isPrimary: row.isPrimary,
        isSystemCalendar: row.isSystemCalendar,
        lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
        lastSyncFailedAt: row.lastSyncFailedAt?.toISOString() ?? null,
      },
    };
  }

  // 기능 : providerType filter 기준으로 AiProviderCallLog 조회 필요 여부를 판단합니다.
  private shouldReadAiProviderFailures(
    input: ListAdminProviderFailuresInput
  ): boolean {
    return (
      !input.providerType ||
      input.providerType === AdminProviderFailureType.AI ||
      input.providerType === AdminProviderFailureType.STT
    );
  }

  // 기능 : providerType filter 기준으로 OCR source 조회 필요 여부를 판단합니다.
  private shouldReadOcrProviderFailures(
    input: ListAdminProviderFailuresInput
  ): boolean {
    return (
      !input.providerType ||
      input.providerType === AdminProviderFailureType.OCR
    );
  }

  // 기능 : providerType filter 기준으로 browser push source 조회 필요 여부를 판단합니다.
  private shouldReadPushProviderFailures(
    input: ListAdminProviderFailuresInput
  ): boolean {
    return (
      !input.providerType ||
      input.providerType === AdminProviderFailureType.PUSH
    );
  }

  // 기능 : providerType filter 기준으로 follow-up delivery source 조회 필요 여부를 판단합니다.
  private shouldReadFollowUpProviderFailures(
    input: ListAdminProviderFailuresInput
  ): boolean {
    return (
      !input.providerType ||
      input.providerType === AdminProviderFailureType.EMAIL ||
      input.providerType === AdminProviderFailureType.SMS
    );
  }

  // 기능 : providerType filter 기준으로 calendar source 조회 필요 여부를 판단합니다.
  private shouldReadCalendarProviderFailures(
    input: ListAdminProviderFailuresInput
  ): boolean {
    return (
      !input.providerType ||
      input.providerType === AdminProviderFailureType.CALENDAR
    );
  }

  // 기능 : 공통 provider/feature/status/retryable filter를 record에 적용합니다.
  private matchesCommonFilters(
    record: AdminProviderFailureRecord,
    input: ListAdminProviderFailuresInput
  ): boolean {
    if (input.providerType && record.providerType !== input.providerType) {
      return false;
    }

    if (input.featureArea && record.featureArea !== input.featureArea) {
      return false;
    }

    if (!this.matchesStatusFilter(record, input.status)) {
      return false;
    }

    if (input.retryable !== undefined && record.retryable !== input.retryable) {
      return false;
    }

    return true;
  }

  // 기능 : status filter가 record 상태와 retry 가능 여부에 맞는지 판단합니다.
  private matchesStatusFilter(
    record: AdminProviderFailureRecord,
    status: AdminProviderFailureStatusFilter
  ): boolean {
    if (status === "ALL") {
      return true;
    }

    if (status === "RETRYABLE") {
      return record.retryable;
    }

    return record.status === "FAILED";
  }

  // 기능 : 사용자 ID filter를 Prisma where 조각으로 변환합니다.
  private createUserWhere(
    input: ListAdminProviderFailuresInput
  ): { readonly userId?: string } {
    return input.userId ? { userId: input.userId } : {};
  }

  // 기능 : createdAt 기간 filter를 Prisma where 조각으로 변환합니다.
  private createCreatedAtWhere(input: ListAdminProviderFailuresInput): {
    readonly createdAt?: Prisma.DateTimeFilter;
  } {
    const dateFilter = this.createDateFilter(input);

    return dateFilter ? { createdAt: dateFilter } : {};
  }

  // 기능 : updatedAt 기간 filter를 Prisma where 조각으로 변환합니다.
  private createUpdatedAtWhere(input: ListAdminProviderFailuresInput): {
    readonly updatedAt?: Prisma.DateTimeFilter;
  } {
    const dateFilter = this.createDateFilter(input);

    return dateFilter ? { updatedAt: dateFilter } : {};
  }

  // 기능 : 기간 query를 Prisma DateTimeFilter로 변환합니다.
  private createDateFilter(
    input: ListAdminProviderFailuresInput
  ): Prisma.DateTimeFilter | null {
    const filter: Prisma.DateTimeFilter = {};

    if (input.from) {
      filter.gte = input.from;
    }

    if (input.to) {
      filter.lte = input.to;
    }

    return Object.keys(filter).length > 0 ? filter : null;
  }

  // 기능 : retryable filter를 retry 가능 source where 조각으로 변환합니다.
  private createRetryableWhere(input: ListAdminProviderFailuresInput): {
    readonly retryable?: boolean;
  } {
    if (input.status === "RETRYABLE") {
      return { retryable: true };
    }

    return input.retryable !== undefined ? { retryable: input.retryable } : {};
  }

  // 기능 : AiProviderCallLog status filter를 Prisma where 조각으로 변환합니다.
  private createAiProviderStatusWhere(
    input: ListAdminProviderFailuresInput
  ): Prisma.AiProviderCallLogWhereInput {
    const statuses =
      input.status === "FAILED"
        ? [AiProviderCallStatus.FAILED]
        : AI_FAILURE_STATUSES;

    return {
      status: { in: statuses },
      ...this.createRetryableWhere(input),
    };
  }

  // 기능 : NotificationDeliveryAttempt status filter를 Prisma where 조각으로 변환합니다.
  private createNotificationDeliveryStatusWhere(
    input: ListAdminProviderFailuresInput
  ): Prisma.NotificationDeliveryAttemptWhereInput {
    const statuses =
      input.status === "FAILED"
        ? [NotificationDeliveryStatus.FAILED]
        : DELIVERY_FAILURE_STATUSES;

    return {
      status: { in: statuses },
    };
  }

  // 기능 : FollowUpDeliveryAttempt status filter를 Prisma where 조각으로 변환합니다.
  private createFollowUpDeliveryStatusWhere(
    input: ListAdminProviderFailuresInput
  ): Prisma.FollowUpDeliveryAttemptWhereInput {
    const statuses =
      input.status === "FAILED"
        ? [FollowUpDeliveryAttemptStatus.FAILED]
        : FOLLOW_UP_DELIVERY_FAILURE_STATUSES;

    return {
      status: { in: statuses },
    };
  }

  // 기능 : provider failure 목록 정렬 순서를 비교합니다.
  private compareProviderFailures(
    left: AdminProviderFailureRecord,
    right: AdminProviderFailureRecord
  ): number {
    const timeDiff = right.occurredAt.getTime() - left.occurredAt.getTime();

    if (timeDiff !== 0) {
      return timeDiff;
    }

    return right.id.localeCompare(left.id);
  }

  // 기능 : cursor 기준으로 record가 다음 페이지에 속하는지 비교합니다.
  private compareRecordToCursor(
    record: AdminProviderFailureRecord,
    cursor: ProviderFailureCursor
  ): number {
    return this.compareProviderFailures(record, {
      ...record,
      id: cursor.id,
      occurredAt: cursor.occurredAt,
    });
  }

  // 기능 : provider failure cursor를 opaque 문자열로 생성합니다.
  private createCursor(record: AdminProviderFailureRecord): string {
    return Buffer.from(
      JSON.stringify({
        id: record.id,
        occurredAt: record.occurredAt.toISOString(),
      }),
      "utf8"
    ).toString("base64url");
  }

  // 기능 : opaque cursor 문자열을 안전하게 해석합니다.
  private parseCursor(
    cursor: string | undefined
  ): ProviderFailureCursor | null {
    if (!cursor) {
      return null;
    }

    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8")
      ) as Partial<{ readonly id: unknown; readonly occurredAt: unknown }>;
      const id = typeof parsed.id === "string" ? parsed.id : null;
      const occurredAt =
        typeof parsed.occurredAt === "string"
          ? new Date(parsed.occurredAt)
          : null;

      if (!id || !occurredAt || Number.isNaN(occurredAt.getTime())) {
        return null;
      }

      return { id, occurredAt };
    } catch {
      return null;
    }
  }

  // 기능 : opaque failure ID를 source prefix와 source UUID로 분리합니다.
  private parseFailureId(
    failureId: string
  ): { readonly prefix: ProviderFailureSourcePrefix; readonly sourceId: string } | null {
    const separatorIndex = failureId.indexOf(":");

    if (separatorIndex <= 0) {
      return null;
    }

    const prefix = failureId.slice(0, separatorIndex);
    const sourceId = failureId.slice(separatorIndex + 1);
    const allowedPrefixes: readonly ProviderFailureSourcePrefix[] = [
      "AI",
      "STT",
      "OCR",
      "PUSH",
      "EMAIL",
      "SMS",
      "CALENDAR_CONNECTION",
      "CALENDAR_SOURCE",
    ];

    if (
      !sourceId ||
      !allowedPrefixes.some((allowedPrefix) => allowedPrefix === prefix)
    ) {
      return null;
    }

    return { prefix: prefix as ProviderFailureSourcePrefix, sourceId };
  }

  // 기능 : AI operation을 Admin provider type으로 분류합니다.
  private getAiProviderType(
    operation: AiProviderOperation
  ): AdminProviderFailureType {
    if (operation === AiProviderOperation.MEETING_NOTE_STT_TRANSCRIPTION) {
      return AdminProviderFailureType.STT;
    }

    return AdminProviderFailureType.AI;
  }

  // 기능 : AI operation을 Admin 기능 영역으로 분류합니다.
  private getAiFeatureArea(
    operation: AiProviderOperation
  ): AdminProviderFailureFeatureArea {
    if (operation === AiProviderOperation.WEEKLY_SALES_REPORT) {
      return AdminProviderFailureFeatureArea.AI_WEEKLY_REPORT;
    }

    if (
      operation === AiProviderOperation.FOLLOW_UP_EMAIL_DRAFT ||
      operation === AiProviderOperation.FOLLOW_UP_SMS_DRAFT
    ) {
      return AdminProviderFailureFeatureArea.FOLLOW_UP;
    }

    return AdminProviderFailureFeatureArea.MEETING_NOTE;
  }

  // 기능 : AI provider targetType이 비어 있을 때 operation 기준 fallback을 반환합니다.
  private getAiFallbackTargetType(operation: AiProviderOperation): string {
    if (operation === AiProviderOperation.WEEKLY_SALES_REPORT) {
      return "AI_WEEKLY_SALES_REPORT";
    }

    if (
      operation === AiProviderOperation.FOLLOW_UP_EMAIL_DRAFT ||
      operation === AiProviderOperation.FOLLOW_UP_SMS_DRAFT
    ) {
      return "FOLLOW_UP_DRAFT";
    }

    return "MEETING_NOTE_DRAFT";
  }

  // 기능 : AiProviderCallStatus를 Admin provider 실패 공통 상태로 변환합니다.
  private toCommonProviderStatus(
    status: AiProviderCallStatus
  ): AdminProviderFailureStatus {
    if (status === AiProviderCallStatus.PENDING) {
      return "PENDING";
    }

    if (status === AiProviderCallStatus.CANCELED) {
      return "CANCELED";
    }

    return "FAILED";
  }

  // 기능 : NotificationDeliveryStatus를 Admin provider 실패 공통 상태로 변환합니다.
  private toDeliveryProviderStatus(
    status: NotificationDeliveryStatus
  ): AdminProviderFailureStatus {
    if (status === NotificationDeliveryStatus.PENDING) {
      return "PENDING";
    }

    if (status === NotificationDeliveryStatus.CANCELED) {
      return "CANCELED";
    }

    return "FAILED";
  }

  // 기능 : FollowUpDeliveryAttemptStatus를 Admin provider 실패 공통 상태로 변환합니다.
  private toFollowUpDeliveryProviderStatus(
    status: FollowUpDeliveryAttemptStatus
  ): AdminProviderFailureStatus {
    if (status === FollowUpDeliveryAttemptStatus.PENDING) {
      return "PENDING";
    }

    if (status === FollowUpDeliveryAttemptStatus.CANCELED) {
      return "CANCELED";
    }

    return "FAILED";
  }

  // 기능 : calendar safe error code를 운영자가 볼 수 있는 안내 문구로 변환합니다.
  private toCalendarSafeErrorMessage(errorCode: string | null): string {
    return errorCode
      ? "캘린더 동기화 상태를 확인해 주세요"
      : "캘린더 연결 확인이 필요해요";
  }
}
