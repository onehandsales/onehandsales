import { Prisma, TrashRecoveryRequestStatus } from "@prisma/client";
import type {
  AdminTrashRepository,
  CreateAdminTrashAuditLogInput,
  ListAdminTrashRecoveryRequestsInput,
  ListAdminTrashRecordsInput,
} from "@/modules/admin-operation/application/ports/admin-trash.repository";
import {
  AdminTrashDomain,
  type AdminTrashLinkedRecoveryRequestRecord,
  type AdminTrashRecordItemRecord,
  type AdminTrashRecordsPageRecord,
  type AdminTrashRecoveryRequestQueueItemRecord,
  type AdminTrashRecoveryRequestsPageRecord,
  type AdminTrashRestoreWindow,
  type AdminTrashRestoreWindowFilter,
  type AdminTrashSummaryRecord,
} from "@/modules/admin-operation/application/ports/admin-trash-read-model.types";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { maskEmail } from "../../presentation/http/admin-redaction.mapper";

type AdminTrashPrismaClient = PrismaService | Prisma.TransactionClient;

type TrashCountState = Exclude<AdminTrashRestoreWindowFilter, "ALL">;

type TrashRecordDraft = {
  readonly targetType: AdminTrashDomain;
  readonly targetId: string;
  readonly titleSnapshot: string;
  readonly deletedAt: Date | null;
  readonly trashExpiresAt: Date | null;
  readonly hasMemo: boolean;
  readonly hasPrivateMemo: boolean;
};

const ADMIN_TRASH_DOMAINS = Object.values(AdminTrashDomain);
const OPEN_RECOVERY_REQUEST_STATUSES: readonly TrashRecoveryRequestStatus[] = [
  TrashRecoveryRequestStatus.REQUESTED,
  TrashRecoveryRequestStatus.REVIEWING,
  TrashRecoveryRequestStatus.WAITING_RECOVERY_POLICY,
  TrashRecoveryRequestStatus.RECOVERY_AVAILABLE,
];
const REVIEWING_RECOVERY_REQUEST_STATUSES: readonly TrashRecoveryRequestStatus[] = [
  TrashRecoveryRequestStatus.REVIEWING,
  TrashRecoveryRequestStatus.WAITING_RECOVERY_POLICY,
  TrashRecoveryRequestStatus.RECOVERY_AVAILABLE,
];
const CLOSED_RECOVERY_REQUEST_STATUSES: readonly TrashRecoveryRequestStatus[] = [
  TrashRecoveryRequestStatus.REJECTED,
  TrashRecoveryRequestStatus.CLOSED,
];

// 역할 : PrismaAdminTrashRepository Admin Trash 운영 read model을 Prisma 조회로 구현합니다.
export class PrismaAdminTrashRepository implements AdminTrashRepository {
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AdminTrashPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : Admin Trash 저장소 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AdminTrashRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAdminTrashRepository(transaction, null));
    });
  }

  // 기능 : Admin Trash 대상 사용자가 존재하는지 확인합니다.
  async targetUserExists(userId: string): Promise<boolean> {
    const user = await this.client.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return user !== null;
  }

  // 기능 : Admin 사용자 Trash summary count를 조회합니다.
  async getUserTrashSummary(
    userId: string,
    now: Date
  ): Promise<AdminTrashSummaryRecord> {
    const domainEntries = await Promise.all(
      ADMIN_TRASH_DOMAINS.map(async (domain) => {
        const [active, expired] = await Promise.all([
          this.countDomainTrashRows(userId, domain, now, "ACTIVE"),
          this.countDomainTrashRows(userId, domain, now, "EXPIRED"),
        ]);

        return [
          domain,
          {
            total: active + expired,
            active,
            expired,
          },
        ] as const;
      })
    );
    const byDomain = Object.fromEntries(domainEntries) as Record<
      AdminTrashDomain,
      { readonly total: number; readonly active: number; readonly expired: number }
    >;
    const activeRestoreWindow = domainEntries.reduce(
      (sum, [, summary]) => sum + summary.active,
      0
    );
    const expiredRestoreWindow = domainEntries.reduce(
      (sum, [, summary]) => sum + summary.expired,
      0
    );
    const recoveryRequests =
      await this.countRecoveryRequestsByUserId(userId);

    return {
      userId,
      total: activeRestoreWindow + expiredRestoreWindow,
      activeRestoreWindow,
      expiredRestoreWindow,
      byDomain,
      recoveryRequests,
    };
  }

  // 기능 : Admin 사용자 Trash row 목록을 cursor 기반으로 조회합니다.
  async listUserTrashRecords(
    input: ListAdminTrashRecordsInput
  ): Promise<AdminTrashRecordsPageRecord> {
    const domains = input.domain ? [input.domain] : ADMIN_TRASH_DOMAINS;
    const recordGroups = await Promise.all(
      domains.map((domain) => this.listDomainTrashRecords(input, domain))
    );
    const sortedRecords = recordGroups
      .flat()
      .sort((left, right) => this.compareTrashRecords(left, right));
    const cursorStartIndex = input.cursor
      ? sortedRecords.findIndex((record) => this.createCursor(record) === input.cursor)
      : -1;
    const cursorFilteredRecords =
      cursorStartIndex >= 0
        ? sortedRecords.slice(cursorStartIndex + 1)
        : sortedRecords;
    const pageItems = cursorFilteredRecords.slice(0, input.limit);
    const enrichedItems = await this.attachRecoveryRequests(
      input.userId,
      pageItems
    );
    const lastItem = enrichedItems[enrichedItems.length - 1] ?? null;

    return {
      items: enrichedItems,
      nextCursor:
        cursorFilteredRecords.length > input.limit && lastItem
          ? this.createCursor(lastItem)
          : null,
    };
  }

  // 기능 : Admin 복구 요청 queue를 cursor 기반으로 조회합니다.
  async listRecoveryRequests(
    input: ListAdminTrashRecoveryRequestsInput
  ): Promise<AdminTrashRecoveryRequestsPageRecord> {
    const rows = await this.client.trashRecoveryRequest.findMany({
      where: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.targetType ? { targetType: input.targetType } : {}),
      },
      select: {
        id: true,
        userId: true,
        targetType: true,
        targetId: true,
        titleSnapshot: true,
        status: true,
        deletedAt: true,
        trashExpiresAt: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });
    const pageRows = rows.slice(0, input.limit);
    const lastRow = pageRows[pageRows.length - 1] ?? null;

    return {
      items: pageRows.map((row) => this.toRecoveryRequestQueueItem(row)),
      nextCursor: rows.length > input.limit && lastRow ? lastRow.id : null,
    };
  }

  // 기능 : Admin Trash 운영 조회 감사 로그를 append-only로 생성합니다.
  async createAuditLog(input: CreateAdminTrashAuditLogInput): Promise<void> {
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

  // 기능 : 도메인별 Trash row count를 조회합니다.
  private countDomainTrashRows(
    userId: string,
    domain: AdminTrashDomain,
    now: Date,
    state: TrashCountState
  ): Promise<number> {
    const where = this.createTrashWhere(userId, now, state);

    switch (domain) {
      case AdminTrashDomain.COMPANY:
        return this.client.company.count({ where });
      case AdminTrashDomain.CONTACT:
        return this.client.contact.count({ where });
      case AdminTrashDomain.PRODUCT:
        return this.client.product.count({ where });
      case AdminTrashDomain.DEAL:
        return this.client.deal.count({ where });
      case AdminTrashDomain.SCHEDULE:
        return this.client.schedule.count({ where });
      case AdminTrashDomain.MEETING_NOTE:
        return this.client.meetingNote.count({ where });
    }
  }

  // 기능 : 사용자별 복구 요청 summary count를 조회합니다.
  private async countRecoveryRequestsByUserId(userId: string) {
    const [requested, reviewing, closed] = await Promise.all([
      this.client.trashRecoveryRequest.count({
        where: { userId, status: TrashRecoveryRequestStatus.REQUESTED },
      }),
      this.client.trashRecoveryRequest.count({
        where: { userId, status: { in: [...REVIEWING_RECOVERY_REQUEST_STATUSES] } },
      }),
      this.client.trashRecoveryRequest.count({
        where: { userId, status: { in: [...CLOSED_RECOVERY_REQUEST_STATUSES] } },
      }),
    ]);

    return { requested, reviewing, closed };
  }

  // 기능 : 도메인별 안전 Trash row 목록을 조회합니다.
  private async listDomainTrashRecords(
    input: ListAdminTrashRecordsInput,
    domain: AdminTrashDomain
  ): Promise<AdminTrashRecordItemRecord[]> {
    const where = this.createTrashWhere(
      input.userId,
      input.now,
      input.restoreWindow
    );

    switch (domain) {
      case AdminTrashDomain.COMPANY:
        return this.listCompanyTrashRecords(where, input.now);
      case AdminTrashDomain.CONTACT:
        return this.listContactTrashRecords(where, input.now);
      case AdminTrashDomain.PRODUCT:
        return this.listProductTrashRecords(where, input.now);
      case AdminTrashDomain.DEAL:
        return this.listDealTrashRecords(where, input.now);
      case AdminTrashDomain.SCHEDULE:
        return this.listScheduleTrashRecords(where, input.now);
      case AdminTrashDomain.MEETING_NOTE:
        return this.listMeetingNoteTrashRecords(where, input.now);
    }
  }

  // 기능 : 삭제된 회사 Trash row를 안전 summary로 조회합니다.
  private async listCompanyTrashRecords(
    where: Prisma.CompanyWhereInput,
    now: Date
  ) {
    const rows = await this.client.company.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        deletedAt: true,
        trashExpiresAt: true,
        _count: { select: { memoLogs: true, privateMemoLogs: true } },
      },
    });

    return rows
      .map((row) =>
        this.toTrashRecord(
          {
            targetType: AdminTrashDomain.COMPANY,
            targetId: row.id,
            titleSnapshot: row.companyName,
            deletedAt: row.deletedAt,
            trashExpiresAt: row.trashExpiresAt,
            hasMemo: row._count.memoLogs > 0,
            hasPrivateMemo: row._count.privateMemoLogs > 0,
          },
          now
        )
      )
      .filter(this.isTrashRecordItem);
  }

  // 기능 : 삭제된 담당자 Trash row를 안전 summary로 조회합니다.
  private async listContactTrashRecords(
    where: Prisma.ContactWhereInput,
    now: Date
  ) {
    const rows = await this.client.contact.findMany({
      where,
      select: {
        id: true,
        username: true,
        deletedAt: true,
        trashExpiresAt: true,
        _count: { select: { memoLogs: true, privateMemoLogs: true } },
      },
    });

    return rows
      .map((row) =>
        this.toTrashRecord(
          {
            targetType: AdminTrashDomain.CONTACT,
            targetId: row.id,
            titleSnapshot: row.username,
            deletedAt: row.deletedAt,
            trashExpiresAt: row.trashExpiresAt,
            hasMemo: row._count.memoLogs > 0,
            hasPrivateMemo: row._count.privateMemoLogs > 0,
          },
          now
        )
      )
      .filter(this.isTrashRecordItem);
  }

  // 기능 : 삭제된 제품 Trash row를 안전 summary로 조회합니다.
  private async listProductTrashRecords(
    where: Prisma.ProductWhereInput,
    now: Date
  ) {
    const rows = await this.client.product.findMany({
      where,
      select: {
        id: true,
        productName: true,
        deletedAt: true,
        trashExpiresAt: true,
        _count: { select: { memoLogs: true, privateMemoLogs: true } },
      },
    });

    return rows
      .map((row) =>
        this.toTrashRecord(
          {
            targetType: AdminTrashDomain.PRODUCT,
            targetId: row.id,
            titleSnapshot: row.productName,
            deletedAt: row.deletedAt,
            trashExpiresAt: row.trashExpiresAt,
            hasMemo: row._count.memoLogs > 0,
            hasPrivateMemo: row._count.privateMemoLogs > 0,
          },
          now
        )
      )
      .filter(this.isTrashRecordItem);
  }

  // 기능 : 삭제된 딜 Trash row를 안전 summary로 조회합니다.
  private async listDealTrashRecords(where: Prisma.DealWhereInput, now: Date) {
    const rows = await this.client.deal.findMany({
      where,
      select: {
        id: true,
        dealName: true,
        deletedAt: true,
        trashExpiresAt: true,
        _count: { select: { memoLogs: true, followingActionLogs: true } },
      },
    });

    return rows
      .map((row) =>
        this.toTrashRecord(
          {
            targetType: AdminTrashDomain.DEAL,
            targetId: row.id,
            titleSnapshot: row.dealName,
            deletedAt: row.deletedAt,
            trashExpiresAt: row.trashExpiresAt,
            hasMemo:
              row._count.memoLogs > 0 || row._count.followingActionLogs > 0,
            hasPrivateMemo: false,
          },
          now
        )
      )
      .filter(this.isTrashRecordItem);
  }

  // 기능 : 삭제된 일정 Trash row를 안전 summary로 조회합니다.
  private async listScheduleTrashRecords(
    where: Prisma.ScheduleWhereInput,
    now: Date
  ) {
    const rows = await this.client.schedule.findMany({
      where,
      select: {
        id: true,
        scheduleTitle: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return rows
      .map((row) =>
        this.toTrashRecord(
          {
            targetType: AdminTrashDomain.SCHEDULE,
            targetId: row.id,
            titleSnapshot: row.scheduleTitle,
            deletedAt: row.deletedAt,
            trashExpiresAt: row.trashExpiresAt,
            hasMemo: false,
            hasPrivateMemo: false,
          },
          now
        )
      )
      .filter(this.isTrashRecordItem);
  }

  // 기능 : 삭제된 회의록 Trash row를 본문 없이 안전 summary로 조회합니다.
  private async listMeetingNoteTrashRecords(
    where: Prisma.MeetingNoteWhereInput,
    now: Date
  ) {
    const rows = await this.client.meetingNote.findMany({
      where,
      select: {
        id: true,
        title: true,
        deletedAt: true,
        trashExpiresAt: true,
      },
    });

    return rows
      .map((row) =>
        this.toTrashRecord(
          {
            targetType: AdminTrashDomain.MEETING_NOTE,
            targetId: row.id,
            titleSnapshot: row.title,
            deletedAt: row.deletedAt,
            trashExpiresAt: row.trashExpiresAt,
            hasMemo: false,
            hasPrivateMemo: false,
          },
          now
        )
      )
      .filter(this.isTrashRecordItem);
  }

  // 기능 : raw draft를 Admin Trash row 응답 record로 변환합니다.
  private toTrashRecord(
    draft: TrashRecordDraft,
    now: Date
  ): AdminTrashRecordItemRecord | null {
    if (!draft.deletedAt || !draft.trashExpiresAt) {
      return null;
    }

    const restoreWindow = this.getRestoreWindow(draft.trashExpiresAt, now);

    return {
      targetType: draft.targetType,
      targetId: draft.targetId,
      titleSnapshot: draft.titleSnapshot,
      deletedAt: draft.deletedAt,
      trashExpiresAt: draft.trashExpiresAt,
      restoreWindow,
      userCanSelfRestore: restoreWindow === "ACTIVE",
      sensitiveFlags: {
        hasMemo: draft.hasMemo,
        hasPrivateMemo: draft.hasPrivateMemo,
        privateMemoIncluded: false,
      },
      recoveryRequest: null,
    };
  }

  // 기능 : null 제거 후 Admin Trash row 타입을 좁힙니다.
  private isTrashRecordItem(
    item: AdminTrashRecordItemRecord | null
  ): item is AdminTrashRecordItemRecord {
    return item !== null;
  }

  // 기능 : Admin Trash row에 열린 복구 요청 summary를 결합합니다.
  private async attachRecoveryRequests(
    userId: string,
    items: readonly AdminTrashRecordItemRecord[]
  ): Promise<AdminTrashRecordItemRecord[]> {
    if (items.length === 0) {
      return [];
    }

    const requests = await this.client.trashRecoveryRequest.findMany({
      where: {
        userId,
        status: { in: [...OPEN_RECOVERY_REQUEST_STATUSES] },
        OR: items.map((item) => ({
          targetType: item.targetType,
          targetId: item.targetId,
        })),
      },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const requestMap = new Map<string, AdminTrashLinkedRecoveryRequestRecord>();

    for (const request of requests) {
      const key = this.createTargetKey(request.targetType, request.targetId);

      if (!requestMap.has(key)) {
        requestMap.set(key, {
          id: request.id,
          status: request.status,
          createdAt: request.createdAt,
        });
      }
    }

    return items.map((item) => ({
      ...item,
      recoveryRequest:
        requestMap.get(this.createTargetKey(item.targetType, item.targetId)) ??
        null,
    }));
  }

  // 기능 : Admin 복구 요청 queue row를 안전 응답 record로 변환합니다.
  private toRecoveryRequestQueueItem(row: {
    readonly id: string;
    readonly userId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly titleSnapshot: string;
    readonly status: TrashRecoveryRequestStatus;
    readonly deletedAt: Date;
    readonly trashExpiresAt: Date;
    readonly createdAt: Date;
    readonly user: { readonly email: string | null };
  }): AdminTrashRecoveryRequestQueueItemRecord {
    return {
      id: row.id,
      userId: row.userId,
      userEmailMasked: maskEmail(row.user.email),
      targetType: row.targetType,
      targetId: row.targetId,
      titleSnapshot: row.titleSnapshot,
      status: row.status,
      deletedAt: row.deletedAt,
      trashExpiresAt: row.trashExpiresAt,
      createdAt: row.createdAt,
    };
  }

  // 기능 : Admin Trash row 정렬 순서를 deletedAt 최신순으로 계산합니다.
  private compareTrashRecords(
    left: AdminTrashRecordItemRecord,
    right: AdminTrashRecordItemRecord
  ): number {
    return (
      right.deletedAt.getTime() - left.deletedAt.getTime() ||
      left.targetType.localeCompare(right.targetType) ||
      left.targetId.localeCompare(right.targetId)
    );
  }

  // 기능 : Admin Trash cursor를 deletedAt과 대상 tuple 기반 문자열로 생성합니다.
  private createCursor(item: AdminTrashRecordItemRecord): string {
    return `${item.deletedAt.toISOString()}|${item.targetType}|${item.targetId}`;
  }

  // 기능 : Trash 대상 tuple을 열린 복구 요청 조회 key로 변환합니다.
  private createTargetKey(targetType: string, targetId: string): string {
    return `${targetType}:${targetId}`;
  }

  // 기능 : Trash row의 무료 셀프 복구 기간 상태를 계산합니다.
  private getRestoreWindow(
    trashExpiresAt: Date,
    now: Date
  ): AdminTrashRestoreWindow {
    return trashExpiresAt.getTime() >= now.getTime() ? "ACTIVE" : "EXPIRED";
  }

  // 기능 : Trash 조회 상태에 맞는 Prisma where 조건을 생성합니다.
  private createTrashWhere(
    userId: string,
    now: Date,
    restoreWindow: AdminTrashRestoreWindowFilter
  ) {
    return {
      userId,
      deletedAt: { not: null },
      trashExpiresAt: this.createTrashExpiresAtWhere(now, restoreWindow),
    };
  }

  // 기능 : restoreWindow filter를 Prisma trashExpiresAt 조건으로 변환합니다.
  private createTrashExpiresAtWhere(
    now: Date,
    restoreWindow: AdminTrashRestoreWindowFilter
  ) {
    if (restoreWindow === "ACTIVE") {
      return { gte: now };
    }

    if (restoreWindow === "EXPIRED") {
      return { lt: now };
    }

    return { not: null };
  }
}
