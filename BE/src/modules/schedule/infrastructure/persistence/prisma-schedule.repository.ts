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
  type ListSchedulesInput,
  type ScheduleDealOptionRecord,
  type ScheduleDealRecord,
  type ScheduleRecord,
  type ScheduleRepository,
  type UpdateScheduleInput,
} from "@/modules/schedule/application/ports/schedule.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type SchedulePrismaClient = PrismaService | Prisma.TransactionClient;

type ScheduleDealRow = {
  readonly deal: {
    readonly id: string;
    readonly dealName: string;
  };
};

type ScheduleRow = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly memo: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly scheduleDeals: ScheduleDealRow[];
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
      },
      include: this.createScheduleInclude(),
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
    });

    return schedules.map((schedule) => this.mapScheduleRecord(schedule));
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
  async deleteScheduleHard(userId: string, scheduleId: string): Promise<boolean> {
    await this.client.scheduleDeal.deleteMany({
      where: {
        userId,
        scheduleId,
      },
    });

    const deleted = await this.client.schedule.deleteMany({
      where: {
        id: scheduleId,
        userId,
      },
    });

    return deleted.count > 0;
  }

  // 기능 : 일정 조회에 필요한 연결 딜 include 조건을 생성합니다.
  private createScheduleInclude() {
    return {
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

  // 기능 : Prisma 일정 row를 application record로 변환합니다.
  private createNotificationRepository(): PrismaNotificationRepository {
    return new PrismaNotificationRepository(this.client, null);
  }

  private mapScheduleRecord(schedule: ScheduleRow): ScheduleRecord {
    return {
      id: schedule.id,
      scheduleTitle: schedule.scheduleTitle,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      timeZone: schedule.timeZone,
      location: schedule.location,
      memo: schedule.memo,
      deals: schedule.scheduleDeals.map((scheduleDeal) => ({
        id: scheduleDeal.deal.id,
        dealName: scheduleDeal.deal.dealName,
      })),
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}
