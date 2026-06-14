import {
  ScheduleViewMode,
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
import { RelatedDealNotFoundError } from "@/modules/schedule/domain/schedule.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
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
  scheduleDealIds = new Map<string, string[]>();
  transactionCount = 0;
  lastListInput: ListSchedulesInput | null = null;

  // 기능 : fake transaction을 현재 저장소에서 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: ScheduleRepository) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this);
  }

  // 기능 : fake 딜 옵션 전체 목록을 반환합니다.
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
  const service = new ScheduleApplicationService(repository, logger);

  return { repository, service };
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
});
