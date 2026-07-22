import {
  ScheduleViewMode,
  type CreateScheduleDealsInput,
  type CreateScheduleInput,
  type DeleteScheduleDealsInput,
  type ListSchedulesForWeeklyReportInput,
  type ListSchedulesInput,
  type ScheduleDealOptionRecord,
  type ScheduleDealRecord,
  type ScheduleRecord,
  type ScheduleRepository,
  type UpdateScheduleInput,
  type WeeklyReportScheduleRecord,
} from "@/modules/schedule/application/ports/schedule.repository";
import { DealStatusCode } from "@/modules/deal/domain/deal-status";
import {
  RelatedDealNotFoundError,
  ScheduleWeekReportExportFailedError,
} from "@/modules/schedule/domain/schedule.errors";
import {
  CancelScheduleNotificationReminderUseCase,
  ScheduleNotificationReminderUseCase,
} from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import type {
  CancelPendingNotificationsBySourceInput,
  NotificationRecord,
  NotificationSettingsRecord,
  UpsertReminderNotificationInput,
} from "@/modules/notification/application/ports/notification.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { XLSX_CONTENT_TYPE } from "@/shared/application/export/xlsx-export-file";
import type { XlsxWorkbookWriter } from "@/shared/application/ports/xlsx-workbook.writer";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { ScheduleApplicationService } from "./schedule-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const BASE_DATE = new Date("2026-06-14T00:00:00.000Z");

// 역할 : FakeScheduleRepository 테스트용 일정 저장소를 메모리에서 구현합니다.
class FakeScheduleRepository implements ScheduleRepository {
  deals: ScheduleDealOptionRecord[] = [
    {
      id: "deal-1",
      dealName: "A 딜",
      createdAt: new Date("2026-06-12T00:00:00.000Z"),
    },
    {
      id: "deal-2",
      dealName: "B 딜",
      createdAt: new Date("2026-06-11T00:00:00.000Z"),
    },
  ];

  schedules: ScheduleRecord[] = [];
  weeklySchedules: WeeklyReportScheduleRecord[] = [];
  scheduleDealIds = new Map<string, string[]>();
  transactionCount = 0;
  lastListInput: ListSchedulesInput | null = null;
  lastWeeklyReportInput: ListSchedulesForWeeklyReportInput | null = null;

  // 기능 : fake transaction을 현재 저장소에서 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: ScheduleRepository) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this);
  }

  // 기능 : fake 딜 옵션 전체 목록을 반환합니다.
  async findSettingsForUser(): Promise<NotificationSettingsRecord | null> {
    return null;
  }

  async cancelPendingNotificationsBySource(
    _input: CancelPendingNotificationsBySourceInput
  ): Promise<number> {
    void _input;
    return 0;
  }

  async upsertReminderNotification(
    input: UpsertReminderNotificationInput
  ): Promise<NotificationRecord> {
    return {
      id: `notification-${this.schedules.length + 1}`,
      userId: input.userId,
      type: input.type,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      dedupeKey: input.dedupeKey,
      targetPath: input.targetPath,
      title: input.title,
      body: input.body ?? null,
      targetLabel: input.targetLabel ?? null,
      status: "PENDING",
      scheduledAt: input.scheduledAt,
      sentAt: null,
      readAt: null,
      canceledAt: null,
      cancelReason: null,
      metadataJson: input.metadataJson ?? {},
      createdAt: BASE_DATE,
      updatedAt: input.now,
    };
  }

  async listDealOptions(): Promise<ScheduleDealOptionRecord[]> {
    return this.deals;
  }

  // 기능 : fake 딜 ID 목록을 반환합니다.
  async findDealsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<ScheduleDealRecord[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return this.deals
      .filter((deal) => dealIds.includes(deal.id))
      .map((deal) => ({
        id: deal.id,
        dealName: deal.dealName,
      }));
  }

  // 기능 : fake 일정 목록을 반환하고 조회 조건을 저장합니다.
  async listSchedules(input: ListSchedulesInput): Promise<ScheduleRecord[]> {
    this.lastListInput = input;

    return this.schedules.filter(
      (schedule) =>
        schedule.startAt < input.rangeEnd && schedule.endAt > input.rangeStart
    );
  }

  // 기능 : fake 주간 리포트 projection 목록을 기간 overlap 기준으로 반환합니다.
  async listSchedulesForWeeklyReport(
    input: ListSchedulesForWeeklyReportInput
  ): Promise<WeeklyReportScheduleRecord[]> {
    this.lastWeeklyReportInput = input;

    if (input.userId !== CURRENT_USER.id) {
      return [];
    }

    return this.weeklySchedules.filter(
      (schedule) =>
        schedule.startAt < input.rangeEndAt &&
        schedule.endAt > input.rangeStartAt
    );
  }

  // 기능 : fake 일정 단건을 반환합니다.
  async findSchedule(
    userId: string,
    scheduleId: string
  ): Promise<ScheduleRecord | null> {
    const schedule = this.schedules.find(
      (item) => item.id === scheduleId && userId === CURRENT_USER.id
    );

    return schedule ? this.attachDeals(schedule) : null;
  }

  // 기능 : fake 일정을 생성합니다.
  async createSchedule(input: CreateScheduleInput): Promise<{ readonly id: string }> {
    const id = `schedule-${this.schedules.length + 1}`;
    this.schedules.push({
      id,
      scheduleTitle: input.scheduleTitle,
      startAt: input.startAt,
      endAt: input.endAt,
      timeZone: input.timeZone,
      location: input.location,
      memo: input.memo,
      deals: [],
      createdAt: BASE_DATE,
      updatedAt: BASE_DATE,
    });

    return { id };
  }

  // 기능 : fake 일정 기본 정보를 수정합니다.
  async updateSchedule(
    userId: string,
    scheduleId: string,
    input: UpdateScheduleInput
  ): Promise<boolean> {
    const schedule = this.schedules.find(
      (item) => item.id === scheduleId && userId === CURRENT_USER.id
    );

    if (!schedule) {
      return false;
    }

    const updated: ScheduleRecord = {
      ...schedule,
      ...(input.scheduleTitle !== undefined
        ? { scheduleTitle: input.scheduleTitle }
        : {}),
      ...(input.startAt !== undefined ? { startAt: input.startAt } : {}),
      ...(input.endAt !== undefined ? { endAt: input.endAt } : {}),
      ...(input.timeZone !== undefined ? { timeZone: input.timeZone } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.memo !== undefined ? { memo: input.memo } : {}),
      updatedAt: new Date("2026-06-14T01:00:00.000Z"),
    };

    this.schedules = this.schedules.map((item) =>
      item.id === scheduleId ? updated : item
    );
    return true;
  }

  // 기능 : fake 일정 연결 딜 ID 목록을 반환합니다.
  async listScheduleDealIds(
    userId: string,
    scheduleId: string
  ): Promise<string[]> {
    if (userId !== CURRENT_USER.id) {
      return [];
    }

    return [...(this.scheduleDealIds.get(scheduleId) ?? [])];
  }

  // 기능 : fake 일정-딜 매핑을 생성합니다.
  async createScheduleDeals(input: CreateScheduleDealsInput): Promise<void> {
    const existing = this.scheduleDealIds.get(input.scheduleId) ?? [];
    this.scheduleDealIds.set(input.scheduleId, [...existing, ...input.dealIds]);
  }

  // 기능 : fake 일정-딜 매핑을 삭제합니다.
  async deleteScheduleDeals(input: DeleteScheduleDealsInput): Promise<void> {
    const existing = this.scheduleDealIds.get(input.scheduleId) ?? [];
    const removeIds = new Set(input.dealIds);
    this.scheduleDealIds.set(
      input.scheduleId,
      existing.filter((dealId) => !removeIds.has(dealId))
    );
  }

  // 기능 : fake 일정과 연결 매핑을 실제 삭제합니다.
  async deleteScheduleHard(userId: string, scheduleId: string): Promise<boolean> {
    if (userId !== CURRENT_USER.id) {
      return false;
    }

    const beforeCount = this.schedules.length;
    this.schedules = this.schedules.filter((schedule) => schedule.id !== scheduleId);
    this.scheduleDealIds.delete(scheduleId);

    return this.schedules.length < beforeCount;
  }

  // 기능 : 저장된 연결 딜 ID를 일정 record의 딜 요약으로 변환합니다.
  private attachDeals(schedule: ScheduleRecord): ScheduleRecord {
    const dealIds = this.scheduleDealIds.get(schedule.id) ?? [];
    const deals = this.deals.filter((deal) => dealIds.includes(deal.id));

    return {
      ...schedule,
      deals: deals.map((deal) => ({
        id: deal.id,
        dealName: deal.dealName,
      })),
    };
  }
}

function createService() {
  const repository = new FakeScheduleRepository();
  const logger = {
    log: jest.fn(),
  } as unknown as AppLogger;
  const scheduleNotificationReminder = {
    execute: jest.fn().mockResolvedValue({
      scheduled: true,
      notification: null,
      canceledCount: 0,
    }),
    executeWithRepository: jest.fn().mockResolvedValue({
      scheduled: true,
      notification: null,
      canceledCount: 0,
    }),
  } as unknown as ScheduleNotificationReminderUseCase;
  const cancelScheduleNotificationReminder = {
    execute: jest.fn().mockResolvedValue(0),
    executeWithRepository: jest.fn().mockResolvedValue(0),
  } as unknown as CancelScheduleNotificationReminderUseCase;
  const xlsxWriter = {
    writeWorksheet: jest.fn().mockResolvedValue(Buffer.from("xlsx-content")),
  } as unknown as XlsxWorkbookWriter;
  const service = new ScheduleApplicationService(
    repository,
    scheduleNotificationReminder,
    cancelScheduleNotificationReminder,
    xlsxWriter,
    logger
  );

  return {
    repository,
    service,
    logger,
    xlsxWriter,
    scheduleNotificationReminder,
    cancelScheduleNotificationReminder,
  };
}

function createWeeklySchedule(
  overrides: Partial<WeeklyReportScheduleRecord> = {}
): WeeklyReportScheduleRecord {
  return {
    id: "weekly-schedule-1",
    scheduleTitle: "Weekly sync",
    startAt: new Date("2026-06-15T00:30:00.000Z"),
    endAt: new Date("2026-06-15T01:30:00.000Z"),
    timeZone: "Asia/Seoul",
    location: "Seoul",
    memo: "internal memo body",
    deals: [
      {
        id: "weekly-deal-1",
        dealName: "Expansion",
        dealCost: 120000,
        dealStatus: DealStatusCode.NEGOTIATION,
        expectedEndDate: new Date("2026-06-30T00:00:00.000Z"),
        companies: [
          {
            id: "company-1",
            companyName: "Acme",
          },
        ],
        contacts: [
          {
            id: "contact-1",
            username: "Kim",
            companyId: "company-1",
            companyName: "Acme",
          },
        ],
        nextFollowingAction: {
          id: "action-1",
          followingAction: "Send proposal",
          checkComplete: false,
          createdAt: new Date("2026-06-10T00:00:00.000Z"),
          remainingCount: 2,
        },
      },
    ],
    ...overrides,
  };
}

describe("ScheduleApplicationService", () => {
  it("일정 생성 시 동일한 dealId가 중복되면 차단한다", async () => {
    const { service } = createService();

    await expect(
      service.createSchedule(CURRENT_USER, {
        scheduleTitle: "방문 미팅",
        startAt: "2026-06-14T09:00",
        endAt: "2026-06-14T10:00",
        timeZone: "Asia/Seoul",
        dealIds: ["deal-1", "deal-1"],
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("일정 생성 시 현재 사용자 소유가 아닌 딜 연결은 차단한다", async () => {
    const { service } = createService();

    await expect(
      service.createSchedule(CURRENT_USER, {
        scheduleTitle: "방문 미팅",
        startAt: "2026-06-14T09:00",
        endAt: "2026-06-14T10:00",
        timeZone: "Asia/Seoul",
        dealIds: ["deal-404"],
      })
    ).rejects.toBeInstanceOf(RelatedDealNotFoundError);
  });

  it("일정 생성 시 시작 30분 전 reminder 예약을 같은 transaction에서 요청한다", async () => {
    const { repository, service, scheduleNotificationReminder } = createService();

    const created = await service.createSchedule(CURRENT_USER, {
      scheduleTitle: " 방문 미팅 ",
      startAt: "2026-06-14T09:00",
      endAt: "2026-06-14T10:00",
      timeZone: "Asia/Seoul",
      dealIds: ["deal-1"],
    });

    expect(created.scheduleTitle).toBe("방문 미팅");
    expect(repository.transactionCount).toBe(1);
    expect(
      scheduleNotificationReminder.executeWithRepository
    ).toHaveBeenCalledWith(
      {
        userId: CURRENT_USER.id,
        scheduleId: created.id,
        scheduleTitle: "방문 미팅",
        startAt: new Date("2026-06-14T00:00:00.000Z"),
      },
      repository
    );
  });

  it("일정 수정 시 요청한 최종 dealIds 기준으로 ScheduleDeal을 추가하고 삭제한다", async () => {
    const { repository, service } = createService();
    const created = await service.createSchedule(CURRENT_USER, {
      scheduleTitle: "방문 미팅",
      startAt: "2026-06-14T09:00",
      endAt: "2026-06-14T10:00",
      timeZone: "Asia/Seoul",
      dealIds: ["deal-1"],
    });

    const updated = await service.updateSchedule(CURRENT_USER, created.id, {
      scheduleTitle: "수정 미팅",
      dealIds: ["deal-2"],
    });

    expect(updated.scheduleTitle).toBe("수정 미팅");
    expect(updated.deals).toEqual([{ id: "deal-2", dealName: "B 딜" }]);
    expect(repository.scheduleDealIds.get(created.id)).toEqual(["deal-2"]);
    expect(repository.transactionCount).toBe(2);
  });

  it("일정 시간 수정 시 새 시작 시각 기준으로 reminder 재예약을 요청한다", async () => {
    const { repository, service, scheduleNotificationReminder } = createService();
    const created = await service.createSchedule(CURRENT_USER, {
      scheduleTitle: "방문 미팅",
      startAt: "2026-06-14T09:00",
      endAt: "2026-06-14T10:00",
      timeZone: "Asia/Seoul",
      dealIds: ["deal-1"],
    });
    jest.clearAllMocks();

    await service.updateSchedule(CURRENT_USER, created.id, {
      startAt: "2026-06-14T11:00",
      endAt: "2026-06-14T12:00",
    });

    expect(
      scheduleNotificationReminder.executeWithRepository
    ).toHaveBeenCalledWith(
      {
        userId: CURRENT_USER.id,
        scheduleId: created.id,
        scheduleTitle: "방문 미팅",
        startAt: new Date("2026-06-14T02:00:00.000Z"),
      },
      repository
    );
  });

  it("일정 삭제 시 pending reminder 취소를 같은 transaction에서 요청한다", async () => {
    const { repository, service, cancelScheduleNotificationReminder } =
      createService();
    const created = await service.createSchedule(CURRENT_USER, {
      scheduleTitle: "방문 미팅",
      startAt: "2026-06-14T09:00",
      endAt: "2026-06-14T10:00",
      timeZone: "Asia/Seoul",
      dealIds: ["deal-1"],
    });
    jest.clearAllMocks();

    await service.deleteSchedule(CURRENT_USER, created.id);

    expect(
      cancelScheduleNotificationReminder.executeWithRepository
    ).toHaveBeenCalledWith(
      {
        userId: CURRENT_USER.id,
        scheduleId: created.id,
        cancelReason: "SOURCE_DELETED",
      },
      repository
    );
    expect(repository.schedules).toHaveLength(0);
  });

  it("일정 수정 요청에 수정 가능한 필드가 없으면 ownership 조회 전에 차단한다", async () => {
    const { repository, service } = createService();

    await expect(
      service.updateSchedule(CURRENT_USER, "missing-schedule", {})
    ).rejects.toBeInstanceOf(ValidationDomainError);
    expect(repository.transactionCount).toBe(0);
  });

  it("월간 일정 목록 조회 범위를 요청 timezone의 월 시작과 다음 월 시작으로 계산한다", async () => {
    const { repository, service } = createService();

    await service.listSchedules(CURRENT_USER, {
      view: ScheduleViewMode.MONTH,
      baseDate: "2026-06-14",
      timeZone: "Asia/Seoul",
    });

    expect(repository.lastListInput?.rangeStart.toISOString()).toBe(
      "2026-05-31T15:00:00.000Z"
    );
    expect(repository.lastListInput?.rangeEnd.toISOString()).toBe(
      "2026-06-30T15:00:00.000Z"
    );
  });

  it("weekly report query must use Monday weekStart", async () => {
    const { service } = createService();

    await expect(
      service.getWeeklyScheduleReport(CURRENT_USER, {
        weekStart: "2026-06-16",
        timeZone: "Asia/Seoul",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("weekly report query rejects invalid IANA timezone", async () => {
    const { service } = createService();

    await expect(
      service.getWeeklyScheduleReport(CURRENT_USER, {
        weekStart: "2026-06-15",
        timeZone: "Not/AZone",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("weekly report returns seven days even when no schedules exist", async () => {
    const { repository, service } = createService();

    const report = await service.getWeeklyScheduleReport(CURRENT_USER, {
      weekStart: "2026-06-15",
      timeZone: "Asia/Seoul",
    });

    expect(repository.lastWeeklyReportInput?.rangeStartAt.toISOString()).toBe(
      "2026-06-14T15:00:00.000Z"
    );
    expect(repository.lastWeeklyReportInput?.rangeEndAt.toISOString()).toBe(
      "2026-06-21T15:00:00.000Z"
    );
    expect(report.weekStart).toBe("2026-06-15");
    expect(report.weekEnd).toBe("2026-06-21");
    expect(report.rangeStartAt).toBe("2026-06-14T15:00:00.000Z");
    expect(report.rangeEndAt).toBe("2026-06-21T15:00:00.000Z");
    expect(report.days).toHaveLength(7);
    expect(report.summary.totalScheduleCount).toBe(0);
    expect(report.summary.totalScheduleEntryCount).toBe(0);
  });

  it("weekly report buckets multi-day schedules and omits memo body", async () => {
    const { logger, repository, service } = createService();
    repository.weeklySchedules = [
      createWeeklySchedule({
        id: "multi-day-schedule",
        scheduleTitle: "Overnight",
        startAt: new Date("2026-06-15T14:00:00.000Z"),
        endAt: new Date("2026-06-16T02:00:00.000Z"),
      }),
      createWeeklySchedule({
        id: "unlinked-schedule",
        scheduleTitle: "Focus block",
        startAt: new Date("2026-06-17T00:00:00.000Z"),
        endAt: new Date("2026-06-17T01:00:00.000Z"),
        memo: "   ",
        deals: [],
      }),
    ];

    const report = await service.getWeeklyScheduleReport(CURRENT_USER, {
      weekStart: "2026-06-15",
      timeZone: "Asia/Seoul",
    });

    expect(report.days[0]?.schedules.map((schedule) => schedule.id)).toEqual([
      "multi-day-schedule",
    ]);
    expect(report.days[1]?.schedules.map((schedule) => schedule.id)).toEqual([
      "multi-day-schedule",
    ]);
    expect(report.days[2]?.schedules.map((schedule) => schedule.id)).toEqual([
      "unlinked-schedule",
    ]);
    expect(report.days[0]?.schedules[0]).not.toHaveProperty("memo");
    expect(report.days[0]?.schedules[0]?.hasMemo).toBe(true);
    expect(report.days[2]?.schedules[0]?.hasMemo).toBe(false);
    expect(report.summary).toMatchObject({
      totalScheduleCount: 2,
      totalScheduleEntryCount: 3,
      scheduledDayCount: 3,
      unlinkedScheduleCount: 1,
      scheduleDealLinkCount: 1,
      distinctLinkedDealCount: 1,
      totalDealCost: 120000,
    });
    expect(report.summary.dealStatusCounts).toEqual([
      {
        dealStatus: DealStatusCode.NEGOTIATION,
        dealStatusLabel: expect.any(String),
        count: 1,
      },
    ]);
    expect(
      report.days[0]?.schedules[0]?.deals[0]?.nextFollowingAction
    ).toMatchObject({
      id: "action-1",
      followingAction: "Send proposal",
      checkComplete: false,
      createdAt: "2026-06-10T00:00:00.000Z",
      remainingCount: 2,
    });
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('"event":"schedule.week_report.viewed"'),
      "ScheduleApplicationService"
    );
    expect(logger.log).not.toHaveBeenCalledWith(
      expect.stringContaining("internal memo body"),
      expect.any(String)
    );
  });

  it("weekly report export creates xlsx rows without ids or memo body", async () => {
    const { logger, repository, service, xlsxWriter } = createService();
    const weeklySchedule = createWeeklySchedule();
    repository.weeklySchedules = [
      {
        ...weeklySchedule,
        deals: [
          ...weeklySchedule.deals,
          {
            id: "weekly-deal-2",
            dealName: "Renewal",
            dealCost: 80000,
            dealStatus: DealStatusCode.PROPOSAL_QUOTE,
            expectedEndDate: new Date("2026-07-05T00:00:00.000Z"),
            companies: [],
            contacts: [],
            nextFollowingAction: null,
          },
        ],
      },
    ];

    const file = await service.exportWeeklyScheduleReportXlsx(CURRENT_USER, {
      weekStart: "2026-06-15",
      timeZone: "Asia/Seoul",
    });

    const writeWorksheet = xlsxWriter.writeWorksheet as jest.Mock;
    const worksheetInput = writeWorksheet.mock.calls[0]?.[0];

    expect(file.fileName).toMatch(
      /^weekly_schedules_\d{8}_\d{6}\.xlsx$/
    );
    expect(file.contentType).toBe(XLSX_CONTENT_TYPE);
    expect(file.content).toEqual(Buffer.from("xlsx-content"));
    expect(writeWorksheet).toHaveBeenCalledTimes(1);
    expect(worksheetInput.sheetName).toBe("Weekly Schedules");
    expect(
      worksheetInput.columns.map(
        (column: { header: string }) => column.header
      )
    ).toEqual([
      "날짜",
      "요일",
      "시간",
      "일정",
      "장소",
      "딜",
      "딜단계",
      "딜금액합계",
      "딜마감일",
      "다음행동",
    ]);
    expect(worksheetInput.rows).toHaveLength(7);
    expect(worksheetInput.rows[0]).toMatchObject({
      date: "2026-06-15",
      weekdayLabel: "월",
      timeRange: "09:30 - 10:30",
      scheduleTitle: "Weekly sync",
      location: "Seoul",
      dealNames: "Expansion, Renewal",
      dealStatusLabels: "협상, 제안/견적",
      dealCostTotal: 200000,
      expectedEndDates: "2026-06-30, 2026-07-05",
      nextFollowingActions: "Send proposal",
    });
    expect(worksheetInput.rows[0]).not.toHaveProperty("id");
    expect(worksheetInput.rows[0]).not.toHaveProperty("memo");
    expect(worksheetInput.rows[0]).not.toHaveProperty("hasMemo");
    expect(worksheetInput.rows[1]).toMatchObject({
      date: "2026-06-16",
      scheduleTitle: "일정 없음",
      timeRange: "",
    });
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('"event":"schedule.week_report.exported"'),
      "ScheduleApplicationService"
    );
    expect(logger.log).not.toHaveBeenCalledWith(
      expect.stringContaining("Weekly sync"),
      expect.any(String)
    );
    expect(logger.log).not.toHaveBeenCalledWith(
      expect.stringContaining("Send proposal"),
      expect.any(String)
    );
  });

  it("weekly report export creates seven empty rows when week has no schedules", async () => {
    const { service, xlsxWriter } = createService();

    await service.exportWeeklyScheduleReportXlsx(CURRENT_USER, {
      weekStart: "2026-06-15",
      timeZone: "Asia/Seoul",
    });

    const writeWorksheet = xlsxWriter.writeWorksheet as jest.Mock;
    const worksheetInput = writeWorksheet.mock.calls[0]?.[0];

    expect(worksheetInput.rows).toHaveLength(7);
    expect(
      worksheetInput.rows.map((row: { date: string }) => row.date)
    ).toEqual([
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
      "2026-06-19",
      "2026-06-20",
      "2026-06-21",
    ]);
    expect(
      worksheetInput.rows.every(
        (row: { scheduleTitle: string }) =>
          row.scheduleTitle === "일정 없음"
      )
    ).toBe(true);
    expect(
      worksheetInput.rows.every(
        (row: { dealCostTotal: number }) => row.dealCostTotal === 0
      )
    ).toBe(true);
  });

  it("weekly report export does not create xlsx when validation fails", async () => {
    const { service, xlsxWriter } = createService();

    await expect(
      service.exportWeeklyScheduleReportXlsx(CURRENT_USER, {
        weekStart: "2026-06-16",
        timeZone: "Asia/Seoul",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
    expect(xlsxWriter.writeWorksheet).not.toHaveBeenCalled();
  });

  it("weekly report export converts writer failures", async () => {
    const { repository, service, xlsxWriter } = createService();
    repository.weeklySchedules = [createWeeklySchedule()];
    (xlsxWriter.writeWorksheet as jest.Mock).mockRejectedValueOnce(
      new Error("writer failed")
    );

    await expect(
      service.exportWeeklyScheduleReportXlsx(CURRENT_USER, {
        weekStart: "2026-06-15",
        timeZone: "Asia/Seoul",
      })
    ).rejects.toBeInstanceOf(ScheduleWeekReportExportFailedError);
  });
});
