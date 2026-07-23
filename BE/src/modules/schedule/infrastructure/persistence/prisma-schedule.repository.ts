import { Prisma } from "@prisma/client";
import {
  type CancelPendingNotificationsBySourceInput,
  type NotificationRecord,
  type NotificationSettingsRecord,
  type UpsertReminderNotificationInput,
} from "@/modules/notification/application/ports/notification.repository";
import { PrismaNotificationRepository } from "@/modules/notification/infrastructure/persistence/prisma-notification.repository";
import {
  type CreateScheduleDealsInput,
  type CreateScheduleInput,
  type DeleteScheduleDealsInput,
  type ListSchedulesForWeeklyReportInput,
  type ListSchedulesInput,
  type ScheduleExternalSyncStatus,
  type ScheduleDealOptionRecord,
  type ScheduleDealRecord,
  type ScheduleRecord,
  type ScheduleRepository,
  type ScheduleSourceType,
  type SoftDeleteScheduleInput,
  type UpdateScheduleInput,
  type WeeklyReportDealRecord,
  type WeeklyReportScheduleRecord,
} from "@/modules/schedule/application/ports/schedule.repository";
import {
  type DealStatusCode,
  isDealStatusCode,
} from "@/modules/deal/domain/deal-status";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type SchedulePrismaClient = PrismaService | Prisma.TransactionClient;

type ScheduleDealRow = {
  readonly deal: {
    readonly id: string;
    readonly dealName: string;
  };
};

type ExternalCalendarSourceRow = {
  readonly id: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly status: string;
  readonly connection: {
    readonly status: string;
  };
};

type ScheduleRow = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly memo: string | null;
  readonly isAllDay: boolean;
  readonly sourceType: string;
  readonly externalHtmlLink: string | null;
  readonly lastExternalSyncedAt: Date | null;
  readonly externalDeletedAt: Date | null;
  readonly externalSyncStatus: string | null;
  readonly deletedAt: Date | null;
  readonly trashExpiresAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly externalCalendarSource: ExternalCalendarSourceRow | null;
  readonly scheduleDeals: ScheduleDealRow[];
};

type WeeklyReportFollowingActionLogRow = {
  readonly id: string;
  readonly followingAction: string;
  readonly checkComplete: boolean;
  readonly createdAt: Date;
};

type WeeklyReportDealRow = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly expectedEndDate: Date;
  readonly dealCompanies: {
    readonly company: {
      readonly id: string;
      readonly companyName: string;
    };
  }[];
  readonly dealContacts: {
    readonly contact: {
      readonly id: string;
      readonly username: string;
      readonly companyId: string;
      readonly company: {
        readonly id: string;
        readonly companyName: string;
      };
    };
  }[];
  readonly followingActionLogs: WeeklyReportFollowingActionLogRow[];
  readonly _count: {
    readonly followingActionLogs: number;
  };
};

type WeeklyReportScheduleDealRow = {
  readonly deal: WeeklyReportDealRow;
};

type WeeklyReportScheduleRow = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly memo: string | null;
  readonly isAllDay: boolean;
  readonly sourceType: string;
  readonly externalHtmlLink: string | null;
  readonly lastExternalSyncedAt: Date | null;
  readonly externalDeletedAt: Date | null;
  readonly externalSyncStatus: string | null;
  readonly externalCalendarSource: ExternalCalendarSourceRow | null;
  readonly scheduleDeals: WeeklyReportScheduleDealRow[];
};

// 역할 : PrismaScheduleRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaScheduleRepository implements ScheduleRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: SchedulePrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 일정 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: ScheduleRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 일정 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaScheduleRepository(transaction, null));
    });
  }

  // 기능 : 현재 사용자의 일정 연결용 딜 옵션 전체 목록을 조회합니다.
  async findSettingsForUser(
    userId: string
  ): Promise<NotificationSettingsRecord | null> {
    return this.createNotificationRepository().findSettingsForUser(userId);
  }

  async cancelPendingNotificationsBySource(
    input: CancelPendingNotificationsBySourceInput
  ): Promise<number> {
    return this.createNotificationRepository().cancelPendingNotificationsBySource(
      input
    );
  }

  async upsertReminderNotification(
    input: UpsertReminderNotificationInput
  ): Promise<NotificationRecord> {
    return this.createNotificationRepository().upsertReminderNotification(input);
  }

  async listDealOptions(userId: string): Promise<ScheduleDealOptionRecord[]> {
    const deals = await this.client.deal.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        dealName: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return deals.map((deal) => ({
      id: deal.id,
      dealName: deal.dealName,
      createdAt: deal.createdAt,
    }));
  }

  // 기능 : 현재 사용자의 딜 ID 목록을 조회합니다.
  async findDealsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<ScheduleDealRecord[]> {
    if (dealIds.length === 0) {
      return [];
    }

    const deals = await this.client.deal.findMany({
      where: {
        id: { in: [...dealIds] },
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        dealName: true,
      },
    });

    return deals.map((deal) => ({
      id: deal.id,
      dealName: deal.dealName,
    }));
  }

  // 기능 : 현재 사용자의 일정 목록을 조회합니다.
  async listSchedules(input: ListSchedulesInput): Promise<ScheduleRecord[]> {
    const schedules = await this.client.schedule.findMany({
      where: {
        userId: input.userId,
        startAt: { lt: input.rangeEnd },
        endAt: { gt: input.rangeStart },
        ...this.createActiveScheduleVisibilityWhere(),
      },
      include: this.createScheduleInclude(),
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
    });

    return schedules.map((schedule) => this.mapScheduleRecord(schedule));
  }

  // 기능 : 주간 리포트용 일정 projection을 조회합니다.
  // DB : Schedule 기간 overlap, 사용자 소유권, 삭제되지 않은 연결 Deal, 미완료/미삭제 후속 액션을 함께 조회합니다.
  async listSchedulesForWeeklyReport(
    input: ListSchedulesForWeeklyReportInput
  ): Promise<WeeklyReportScheduleRecord[]> {
    const schedules = await this.client.schedule.findMany({
      where: {
        userId: input.userId,
        startAt: { lt: input.rangeEndAt },
        endAt: { gt: input.rangeStartAt },
        ...this.createActiveScheduleVisibilityWhere(),
      },
      select: this.createWeeklyReportScheduleSelect(input.userId),
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
    });

    return schedules.map((schedule) =>
      this.mapWeeklyReportScheduleRecord(schedule)
    );
  }

  // 기능 : 현재 사용자의 일정 단건 상세를 조회합니다.
  async findSchedule(
    userId: string,
    scheduleId: string
  ): Promise<ScheduleRecord | null> {
    const schedule = await this.client.schedule.findFirst({
      where: {
        id: scheduleId,
        userId,
        deletedAt: null,
      },
      include: this.createScheduleInclude(),
    });

    return schedule ? this.mapScheduleRecord(schedule) : null;
  }

  // 기능 : 현재 사용자의 일정을 생성합니다.
  async createSchedule(input: CreateScheduleInput): Promise<{ readonly id: string }> {
    return this.client.schedule.create({
      data: {
        userId: input.userId,
        scheduleTitle: input.scheduleTitle,
        startAt: input.startAt,
        endAt: input.endAt,
        timeZone: input.timeZone,
        location: input.location,
        meetingUrl: input.meetingUrl,
        memo: input.memo,
      },
      select: {
        id: true,
      },
    });
  }

  // 기능 : 현재 사용자의 일정 기본 정보를 수정합니다.
  async updateSchedule(
    userId: string,
    scheduleId: string,
    input: UpdateScheduleInput
  ): Promise<boolean> {
    const updated = await this.client.schedule.updateMany({
      where: {
        id: scheduleId,
        userId,
        deletedAt: null,
      },
      data: input,
    });

    return updated.count > 0;
  }

  // 기능 : 현재 사용자의 일정에 연결된 딜 ID 목록을 조회합니다.
  async listScheduleDealIds(
    userId: string,
    scheduleId: string
  ): Promise<string[]> {
    const scheduleDeals = await this.client.scheduleDeal.findMany({
      where: {
        userId,
        scheduleId,
      },
      select: {
        dealId: true,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return scheduleDeals.map((scheduleDeal) => scheduleDeal.dealId);
  }

  // 기능 : 일정에 딜 목록을 연결합니다.
  async createScheduleDeals(input: CreateScheduleDealsInput): Promise<void> {
    await Promise.all(
      input.dealIds.map((dealId) =>
        this.client.scheduleDeal.create({
          data: {
            userId: input.userId,
            scheduleId: input.scheduleId,
            dealId,
          },
        })
      )
    );
  }

  // 기능 : 일정에서 딜 연결 목록을 삭제합니다.
  async deleteScheduleDeals(input: DeleteScheduleDealsInput): Promise<void> {
    if (input.dealIds.length === 0) {
      return;
    }

    await this.client.scheduleDeal.deleteMany({
      where: {
        userId: input.userId,
        scheduleId: input.scheduleId,
        dealId: { in: [...input.dealIds] },
      },
    });
  }

  // 기능 : 현재 사용자의 일정과 연결 정보를 실제 삭제합니다.
  async softDeleteSchedule(input: SoftDeleteScheduleInput): Promise<boolean> {
    const deleted = await this.client.schedule.updateMany({
      where: {
        id: input.scheduleId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
        ...(input.externalSyncStatus
          ? { externalSyncStatus: input.externalSyncStatus }
          : {}),
      },
    });

    return deleted.count > 0;
  }

  // 기능 : 일정 조회에 필요한 연결 딜 include 조건을 생성합니다.
  private createScheduleInclude() {
    return {
      externalCalendarSource: {
        select: {
          id: true,
          calendarId: true,
          calendarName: true,
          status: true,
          connection: {
            select: {
              status: true,
            },
          },
        },
      },
      scheduleDeals: {
        select: {
          deal: {
            select: {
              id: true,
              dealName: true,
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    } satisfies Prisma.ScheduleInclude;
  }

  // 기능 : 주간 리포트 DB projection select 조건을 생성합니다.
  private createWeeklyReportScheduleSelect(userId: string) {
    return {
      id: true,
      scheduleTitle: true,
      startAt: true,
      endAt: true,
      timeZone: true,
      location: true,
      meetingUrl: true,
      memo: true,
      isAllDay: true,
      sourceType: true,
      externalHtmlLink: true,
      lastExternalSyncedAt: true,
      externalDeletedAt: true,
      externalSyncStatus: true,
      externalCalendarSource: {
        select: {
          id: true,
          calendarId: true,
          calendarName: true,
          status: true,
          connection: {
            select: {
              status: true,
            },
          },
        },
      },
      scheduleDeals: {
        where: {
          userId,
          deal: {
            userId,
            deletedAt: null,
          },
        },
        select: {
          deal: {
            select: {
              id: true,
              dealName: true,
              dealCost: true,
              dealStatus: true,
              expectedEndDate: true,
              dealCompanies: {
                where: {
                  userId,
                },
                select: {
                  company: {
                    select: {
                      id: true,
                      companyName: true,
                    },
                  },
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              },
              dealContacts: {
                where: {
                  userId,
                },
                select: {
                  contact: {
                    select: {
                      id: true,
                      username: true,
                      companyId: true,
                      company: {
                        select: {
                          id: true,
                          companyName: true,
                        },
                      },
                    },
                  },
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
              },
              followingActionLogs: {
                where: {
                  userId,
                  checkComplete: false,
                  deletedAt: null,
                },
                select: {
                  id: true,
                  followingAction: true,
                  checkComplete: true,
                  createdAt: true,
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
                take: 1,
              },
              _count: {
                select: {
                  followingActionLogs: {
                    where: {
                      userId,
                      checkComplete: false,
                      deletedAt: null,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    } satisfies Prisma.ScheduleSelect;
  }

  private createActiveScheduleVisibilityWhere(): Prisma.ScheduleWhereInput {
    return {
      deletedAt: null,
      OR: [
        { sourceType: "INTERNAL" },
        {
          sourceType: "GOOGLE",
          AND: [
            {
              OR: [
                { externalSyncStatus: null },
                {
                  externalSyncStatus: {
                    notIn: ["GOOGLE_DELETED", "LOCAL_DELETED"],
                  },
                },
              ],
            },
            {
              OR: [
                { externalCalendarSource: { is: null } },
                { externalCalendarSource: { is: { status: "SELECTED" } } },
              ],
            },
          ],
        },
      ],
    };
  }

  private createNotificationRepository(): PrismaNotificationRepository {
    return new PrismaNotificationRepository(this.client, null);
  }

  // 기능 : Prisma 일정 row를 application record로 변환합니다.
  private mapScheduleSourceType(sourceType: string): ScheduleSourceType {
    if (sourceType === "INTERNAL" || sourceType === "GOOGLE") {
      return sourceType;
    }

    throw new Error(`Invalid schedule source type in database: ${sourceType}`);
  }

  private mapScheduleExternalSyncStatus(
    syncStatus: string | null
  ): ScheduleExternalSyncStatus | null {
    if (
      syncStatus === null ||
      syncStatus === "SYNCED" ||
      syncStatus === "LOCAL_MODIFIED" ||
      syncStatus === "GOOGLE_DELETED" ||
      syncStatus === "LOCAL_DELETED"
    ) {
      return syncStatus;
    }

    throw new Error(
      `Invalid schedule external sync status in database: ${syncStatus}`
    );
  }

  private mapGoogleCalendarRecord(schedule: {
    readonly sourceType: string;
    readonly externalSyncStatus: string | null;
    readonly externalHtmlLink: string | null;
    readonly lastExternalSyncedAt: Date | null;
    readonly externalDeletedAt: Date | null;
    readonly externalCalendarSource: ExternalCalendarSourceRow | null;
  }) {
    if (schedule.sourceType !== "GOOGLE" || !schedule.externalCalendarSource) {
      return null;
    }

    const syncStatus = this.mapScheduleExternalSyncStatus(
      schedule.externalSyncStatus
    );
    const source = schedule.externalCalendarSource;

    return {
      sourceId: source.id,
      calendarId: source.calendarId,
      calendarName: source.calendarName,
      syncStatus,
      badgeLabel: this.createGoogleBadgeLabel(
        source.connection.status,
        syncStatus
      ),
      externalHtmlLink: schedule.externalHtmlLink,
      lastExternalSyncedAt: schedule.lastExternalSyncedAt,
      externalDeletedAt: schedule.externalDeletedAt,
      isHidden:
        source.status === "UNSELECTED" || syncStatus === "GOOGLE_DELETED",
      canEditLocalFields: true,
    };
  }

  private createGoogleBadgeLabel(
    connectionStatus: string,
    syncStatus: ScheduleExternalSyncStatus | null
  ): string {
    if (syncStatus === "LOCAL_DELETED") {
      return "Google - local deleted";
    }

    if (syncStatus === "LOCAL_MODIFIED") {
      return "Google - local modified";
    }

    if (connectionStatus !== "CONNECTED") {
      return "Google - disconnected";
    }

    return "Google";
  }

  private mapScheduleRecord(schedule: ScheduleRow): ScheduleRecord {
    return {
      id: schedule.id,
      scheduleTitle: schedule.scheduleTitle,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      timeZone: schedule.timeZone,
      location: schedule.location,
      meetingUrl: schedule.meetingUrl,
      memo: schedule.memo,
      isAllDay: schedule.isAllDay,
      sourceType: this.mapScheduleSourceType(schedule.sourceType),
      googleCalendar: this.mapGoogleCalendarRecord(schedule),
      deletedAt: schedule.deletedAt,
      trashExpiresAt: schedule.trashExpiresAt,
      deals: schedule.scheduleDeals.map((scheduleDeal) => ({
        id: scheduleDeal.deal.id,
        dealName: scheduleDeal.deal.dealName,
      })),
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  // 기능 : Prisma 주간 리포트 일정 row를 application projection으로 변환합니다.
  private mapWeeklyReportScheduleRecord(
    schedule: WeeklyReportScheduleRow
  ): WeeklyReportScheduleRecord {
    return {
      id: schedule.id,
      scheduleTitle: schedule.scheduleTitle,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      timeZone: schedule.timeZone,
      location: schedule.location,
      meetingUrl: schedule.meetingUrl,
      memo: schedule.memo,
      isAllDay: schedule.isAllDay,
      sourceType: this.mapScheduleSourceType(schedule.sourceType),
      googleCalendar: this.mapGoogleCalendarRecord(schedule),
      deals: schedule.scheduleDeals.map((scheduleDeal) =>
        this.mapWeeklyReportDealRecord(scheduleDeal.deal)
      ),
    };
  }

  // 기능 : Prisma 주간 리포트 딜 row에서 다음 미완료 후속 액션 요약을 계산합니다.
  private mapWeeklyReportDealRecord(
    deal: WeeklyReportDealRow
  ): WeeklyReportDealRecord {
    const nextFollowingAction = deal.followingActionLogs[0] ?? null;

    return {
      id: deal.id,
      dealName: deal.dealName,
      dealCost: deal.dealCost,
      dealStatus: this.mapDealStatus(deal.dealStatus),
      expectedEndDate: deal.expectedEndDate,
      companies: deal.dealCompanies.map((dealCompany) => ({
        id: dealCompany.company.id,
        companyName: dealCompany.company.companyName,
      })),
      contacts: deal.dealContacts.map((dealContact) => ({
        id: dealContact.contact.id,
        username: dealContact.contact.username,
        companyId: dealContact.contact.companyId,
        companyName: dealContact.contact.company.companyName,
      })),
      nextFollowingAction: nextFollowingAction
        ? {
            id: nextFollowingAction.id,
            followingAction: nextFollowingAction.followingAction,
            checkComplete: nextFollowingAction.checkComplete,
            createdAt: nextFollowingAction.createdAt,
            remainingCount: Math.max(deal._count.followingActionLogs - 1, 0),
          }
        : null,
    };
  }

  // 기능 : DB 문자열 상태 값을 DealStatusCode로 검증해 변환합니다.
  private mapDealStatus(status: string): DealStatusCode {
    if (!isDealStatusCode(status)) {
      throw new Error(`Invalid deal status in database: ${status}`);
    }

    return status;
  }
}
