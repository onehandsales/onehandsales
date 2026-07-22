import { Inject, Injectable } from "@nestjs/common";
import {
  SCHEDULE_REPOSITORY,
  ScheduleViewMode,
  type ScheduleDealOptionRecord,
  type ScheduleDealRecord,
  type ScheduleRecord,
  type ScheduleRepository,
  type UpdateScheduleInput,
} from "@/modules/schedule/application/ports/schedule.repository";
import {
  CancelScheduleNotificationReminderUseCase,
  ScheduleNotificationReminderUseCase,
} from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import {
  RelatedDealNotFoundError,
  ScheduleNotFoundError,
} from "@/modules/schedule/domain/schedule.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DEFAULT_USER_TIME_ZONE,
  isValidIanaTimeZone,
  normalizeOptionalIanaTimeZone,
} from "@/shared/application/time-zone/time-zone";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const OFFSET_DATE_TIME_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;

// 역할 : ListSchedulesQueryInput 일정 목록 조회 요청 값을 정의합니다.
export interface ListSchedulesQueryInput {
  readonly view?: ScheduleViewMode;
  readonly baseDate: string;
  readonly timeZone?: string;
}

// 역할 : CreateScheduleCommand 일정 생성 요청 값을 정의합니다.
export interface CreateScheduleCommand {
  readonly scheduleTitle: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly location?: string | null;
  readonly memo?: string | null;
  readonly dealIds?: string[];
}

// 역할 : UpdateScheduleCommand 일정 수정 요청 값을 정의합니다.
export interface UpdateScheduleCommand {
  readonly scheduleTitle?: string;
  readonly startAt?: string;
  readonly endAt?: string;
  readonly timeZone?: string;
  readonly location?: string | null;
  readonly memo?: string | null;
  readonly dealIds?: string[];
}

// 역할 : ScheduleDealOptionListResponse 일정 연결 딜 옵션 목록 응답을 정의합니다.
export interface ScheduleDealOptionListResponse {
  readonly items: ScheduleDealOptionResponse[];
}

// 역할 : ScheduleDealOptionResponse 일정 연결 딜 옵션 응답 항목을 정의합니다.
export interface ScheduleDealOptionResponse {
  readonly id: string;
  readonly dealName: string;
  readonly createdAt: string;
}

// 역할 : ScheduleListResponse 일정 목록 응답을 정의합니다.
export interface ScheduleListResponse {
  readonly items: ScheduleResponse[];
}

// 역할 : ScheduleResponse 일정 단건 응답을 정의합니다.
export interface ScheduleResponse {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly timeZone: string;
  readonly location: string | null;
  readonly memo: string | null;
  readonly deals: ScheduleDealResponse[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : ScheduleDealResponse 일정 응답의 연결 딜 요약을 정의합니다.
export interface ScheduleDealResponse {
  readonly id: string;
  readonly dealName: string;
}

type CalendarDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

type DateTimeParts = CalendarDate & {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
};

// 역할 : ScheduleApplicationService 일정 도메인 application 유스케이스를 제공합니다.
@Injectable()
export class ScheduleApplicationService {
  // 기능 : 일정 저장소와 로그 서비스를 주입받습니다.
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: ScheduleRepository,
    private readonly scheduleNotificationReminder: ScheduleNotificationReminderUseCase,
    private readonly cancelScheduleNotificationReminder: CancelScheduleNotificationReminderUseCase,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 현재 사용자의 일정 연결용 딜 옵션 전체 목록을 조회합니다.
  async listDealOptions(
    currentUser: CurrentUserContext
  ): Promise<ScheduleDealOptionListResponse> {
    // 1. 현재 사용자 소유 딜 옵션 전체 목록을 조회한다.
    const items = await this.scheduleRepository.listDealOptions(currentUser.id);

    // 2. 일정 딜 옵션 조회 결과를 구조화 로그로 남긴다.
    this.logEvent("schedule.deal_options.listed", {
      userId: currentUser.id,
      count: items.length,
    });

    // 3. API 응답 형식으로 변환한다.
    return {
      items: items.map((item) => this.toDealOptionResponse(item)),
    };
  }

  // 기능 : 현재 사용자의 월간 또는 주간 일정 목록을 조회합니다.
  async listSchedules(
    currentUser: CurrentUserContext,
    query: ListSchedulesQueryInput
  ): Promise<ScheduleListResponse> {
    // 1. 조회 view와 timezone을 API 계약 기준으로 정규화한다.
    const view = query.view ?? ScheduleViewMode.MONTH;
    const timeZone = this.normalizeQueryTimeZone(
      query.timeZone,
      currentUser.timeZone
    );

    // 2. baseDate와 timezone 기준으로 UTC 조회 범위를 계산한다.
    const range = this.createRange(query.baseDate, view, timeZone);

    // 3. 현재 사용자 소유 일정만 범위 조건으로 조회한다.
    const schedules = await this.scheduleRepository.listSchedules({
      userId: currentUser.id,
      rangeStart: range.start,
      rangeEnd: range.end,
    });

    // 4. 일정 목록 조회 결과를 구조화 로그로 남긴다.
    this.logEvent("schedule.listed", {
      userId: currentUser.id,
      view,
      timeZone,
      baseDate: query.baseDate,
      count: schedules.length,
    });

    // 5. 연결 딜 요약을 포함한 API 응답 형식으로 변환한다.
    return {
      items: schedules.map((schedule) => this.toScheduleResponse(schedule)),
    };
  }

  // 기능 : 현재 사용자의 일정 단건 상세를 조회합니다.
  async getSchedule(
    currentUser: CurrentUserContext,
    scheduleId: string
  ): Promise<ScheduleResponse> {
    // 1. 현재 사용자 소유 일정 단건을 연결 딜과 함께 조회한다.
    const schedule = await this.scheduleRepository.findSchedule(
      currentUser.id,
      scheduleId
    );

    // 2. 일정이 없거나 소유자가 다르면 NotFound로 차단한다.
    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    // 3. 일정 상세 조회 결과를 구조화 로그로 남긴다.
    this.logEvent("schedule.viewed", {
      userId: currentUser.id,
      scheduleId,
    });

    // 4. API 응답 형식으로 변환한다.
    return this.toScheduleResponse(schedule);
  }

  // 기능 : 현재 사용자의 일정을 생성하고 선택 딜을 같은 transaction에서 연결합니다.
  async createSchedule(
    currentUser: CurrentUserContext,
    input: CreateScheduleCommand
  ): Promise<ScheduleResponse> {
    // 1. 일정 생성 요청 값을 검증하고 저장 가능한 값으로 정규화한다.
    const normalized = this.normalizeCreateInput(currentUser.id, input);
    let createdScheduleId: string | null = null;

    // 2. 일정 생성과 ScheduleDeal 생성을 같은 transaction에서 처리한다.
    await this.scheduleRepository.runInTransaction(async (repository) => {
      await this.assertDealsExist(
        currentUser.id,
        normalized.dealIds,
        repository
      );

      const schedule = await repository.createSchedule({
        userId: currentUser.id,
        scheduleTitle: normalized.scheduleTitle,
        startAt: normalized.startAt,
        endAt: normalized.endAt,
        timeZone: normalized.timeZone,
        location: normalized.location,
        memo: normalized.memo,
      });
      createdScheduleId = schedule.id;

      if (normalized.dealIds.length > 0) {
        await repository.createScheduleDeals({
          userId: currentUser.id,
          scheduleId: schedule.id,
          dealIds: normalized.dealIds,
        });
      }

      await this.scheduleNotificationReminder.executeWithRepository(
        {
          userId: currentUser.id,
          scheduleId: schedule.id,
          scheduleTitle: normalized.scheduleTitle,
          startAt: normalized.startAt,
        },
        repository
      );
    });

    // 3. 생성 결과 ID가 없으면 예외 상태로 처리한다.
    if (!createdScheduleId) {
      throw new ScheduleNotFoundError();
    }

    // 4. 생성된 일정을 연결 딜과 함께 다시 조회한다.
    const schedule = await this.scheduleRepository.findSchedule(
      currentUser.id,
      createdScheduleId
    );

    // 5. 생성 직후 조회가 실패하면 NotFound로 처리한다.
    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    // 6. 일정 생성 결과를 구조화 로그로 남긴다.
    this.logEvent("schedule.created", {
      userId: currentUser.id,
      scheduleId: createdScheduleId,
      dealCount: normalized.dealIds.length,
    });

    // 7. 생성된 일정 상세를 API 응답 형식으로 변환한다.
    return this.toScheduleResponse(schedule);
  }

  // 기능 : 현재 사용자의 일정 기본 정보와 연결 딜 최종 목록을 수정합니다.
  async updateSchedule(
    currentUser: CurrentUserContext,
    scheduleId: string,
    input: UpdateScheduleCommand
  ): Promise<ScheduleResponse> {
    // 1. 수정 가능한 필드가 최소 1개 있는지 먼저 검증한다.
    if (!this.hasUpdateFields(input)) {
      throw new ValidationDomainError("At least one schedule field is required");
    }

    // 2. 현재 사용자 소유 일정 단건을 조회한다.
    const existing = await this.scheduleRepository.findSchedule(
      currentUser.id,
      scheduleId
    );

    // 3. 일정이 없거나 소유자가 다르면 NotFound로 차단한다.
    if (!existing) {
      throw new ScheduleNotFoundError();
    }

    // 4. 수정 요청 값을 기존 일정 기준으로 검증하고 정규화한다.
    const normalized = this.normalizeUpdateInput(input, existing);
    const nextScheduleTitle =
      normalized.scheduleFields.scheduleTitle ?? existing.scheduleTitle;
    const nextStartAt = normalized.scheduleFields.startAt ?? existing.startAt;

    // 5. 일정 기본 정보 수정과 ScheduleDeal diff 반영을 같은 transaction에서 처리한다.
    await this.scheduleRepository.runInTransaction(async (repository) => {
      if (normalized.dealIds !== undefined) {
        await this.assertDealsExist(
          currentUser.id,
          normalized.dealIds,
          repository
        );
      }

      if (Object.keys(normalized.scheduleFields).length > 0) {
        const updated = await repository.updateSchedule(
          currentUser.id,
          scheduleId,
          normalized.scheduleFields
        );

        if (!updated) {
          throw new ScheduleNotFoundError();
        }
      }

      if (normalized.dealIds !== undefined) {
        const existingDealIds = await repository.listScheduleDealIds(
          currentUser.id,
          scheduleId
        );
        const existingDealSet = new Set(existingDealIds);
        const requestedDealSet = new Set(normalized.dealIds);
        const dealIdsToAdd = normalized.dealIds.filter(
          (dealId) => !existingDealSet.has(dealId)
        );
        const dealIdsToRemove = existingDealIds.filter(
          (dealId) => !requestedDealSet.has(dealId)
        );

        if (dealIdsToAdd.length > 0) {
          await repository.createScheduleDeals({
            userId: currentUser.id,
            scheduleId,
            dealIds: dealIdsToAdd,
          });
        }

        if (dealIdsToRemove.length > 0) {
          await repository.deleteScheduleDeals({
            userId: currentUser.id,
            scheduleId,
            dealIds: dealIdsToRemove,
          });
        }
      }

      await this.scheduleNotificationReminder.executeWithRepository(
        {
          userId: currentUser.id,
          scheduleId,
          scheduleTitle: nextScheduleTitle,
          startAt: nextStartAt,
        },
        repository
      );
    });

    // 6. 수정된 일정을 연결 딜과 함께 다시 조회한다.
    const schedule = await this.scheduleRepository.findSchedule(
      currentUser.id,
      scheduleId
    );

    // 7. 수정 직후 조회가 실패하면 NotFound로 처리한다.
    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    // 8. 일정 수정 결과를 구조화 로그로 남긴다.
    this.logEvent("schedule.updated", {
      userId: currentUser.id,
      scheduleId,
      dealIds: normalized.dealIds ?? null,
    });

    // 9. 수정된 일정 상세를 API 응답 형식으로 변환한다.
    return this.toScheduleResponse(schedule);
  }

  // 기능 : 현재 사용자의 일정을 연결 row와 함께 실제 삭제합니다.
  async deleteSchedule(
    currentUser: CurrentUserContext,
    scheduleId: string
  ): Promise<void> {
    // 1. ScheduleDeal 삭제와 Schedule hard delete를 같은 transaction에서 처리한다.
    await this.scheduleRepository.runInTransaction(async (repository) => {
      const existing = await repository.findSchedule(currentUser.id, scheduleId);

      // 2. 일정이 없거나 소유자가 다르면 NotFound로 차단한다.
      if (!existing) {
        throw new ScheduleNotFoundError();
      }

      // 3. 현재 사용자 소유 일정과 연결 row를 실제 삭제한다.
      const deleted = await repository.deleteScheduleHard(
        currentUser.id,
        scheduleId
      );

      // 4. 삭제 대상 row가 없으면 NotFound로 처리한다.
      if (!deleted) {
        throw new ScheduleNotFoundError();
      }

      await this.cancelScheduleNotificationReminder.executeWithRepository(
        {
          userId: currentUser.id,
          scheduleId,
          cancelReason: "SOURCE_DELETED",
        },
        repository
      );
    });

    // 5. 일정 삭제 결과를 구조화 로그로 남긴다.
    this.logEvent("schedule.deleted", {
      userId: currentUser.id,
      scheduleId,
    });
  }

  // 기능 : 일정 수정 요청에 수정 가능한 필드가 최소 1개 포함됐는지 확인합니다.
  private hasUpdateFields(input: UpdateScheduleCommand): boolean {
    return (
      input.scheduleTitle !== undefined ||
      input.startAt !== undefined ||
      input.endAt !== undefined ||
      input.timeZone !== undefined ||
      input.location !== undefined ||
      input.memo !== undefined ||
      input.dealIds !== undefined
    );
  }

  // 기능 : 일정 생성 요청을 저장 가능한 값으로 정규화합니다.
  private normalizeCreateInput(
    userId: string,
    input: CreateScheduleCommand
  ): {
    readonly userId: string;
    readonly scheduleTitle: string;
    readonly startAt: Date;
    readonly endAt: Date;
    readonly timeZone: string;
    readonly location: string | null;
    readonly memo: string | null;
    readonly dealIds: string[];
  } {
    const timeZone = this.normalizeRequiredTimeZone(input.timeZone);
    const startAt = this.parseScheduleDateTime(
      input.startAt,
      timeZone,
      "startAt"
    );
    const endAt = this.parseScheduleDateTime(input.endAt, timeZone, "endAt");

    this.assertValidTimeRange(startAt, endAt);

    return {
      userId,
      scheduleTitle: this.normalizeRequiredText(
        input.scheduleTitle,
        100,
        "scheduleTitle is required"
      ),
      startAt,
      endAt,
      timeZone,
      location: this.normalizeNullableText(input.location, 200, "location"),
      memo: this.normalizeNullableText(input.memo, 2000, "memo"),
      dealIds: this.normalizeDealIds(input.dealIds ?? []),
    };
  }

  // 기능 : 일정 수정 요청을 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeUpdateInput(
    input: UpdateScheduleCommand,
    existing: ScheduleRecord
  ): {
    readonly scheduleFields: UpdateScheduleInput;
    readonly dealIds?: string[];
  } {
    const timeZone =
      input.timeZone !== undefined
        ? this.normalizeRequiredTimeZone(input.timeZone)
        : existing.timeZone;
    const startAt =
      input.startAt !== undefined
        ? this.parseScheduleDateTime(input.startAt, timeZone, "startAt")
        : existing.startAt;
    const endAt =
      input.endAt !== undefined
        ? this.parseScheduleDateTime(input.endAt, timeZone, "endAt")
        : existing.endAt;

    this.assertValidTimeRange(startAt, endAt);

    const scheduleFields: UpdateScheduleInput = {
      ...(input.scheduleTitle !== undefined
        ? {
            scheduleTitle: this.normalizeRequiredText(
              input.scheduleTitle,
              100,
              "scheduleTitle is required"
            ),
          }
        : {}),
      ...(input.startAt !== undefined ? { startAt } : {}),
      ...(input.endAt !== undefined ? { endAt } : {}),
      ...(input.timeZone !== undefined ? { timeZone } : {}),
      ...(input.location !== undefined
        ? {
            location: this.normalizeNullableText(
              input.location,
              200,
              "location"
            ),
          }
        : {}),
      ...(input.memo !== undefined
        ? { memo: this.normalizeNullableText(input.memo, 2000, "memo") }
        : {}),
    };

    return {
      scheduleFields,
      ...(input.dealIds !== undefined
        ? { dealIds: this.normalizeDealIds(input.dealIds) }
        : {}),
    };
  }

  // 기능 : 연결 딜 ID 배열의 UUID 중복을 검증하고 복사본을 반환합니다.
  private normalizeDealIds(value: readonly string[]): string[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError("dealIds must be an array");
    }

    const uniqueDealIds = new Set(value);

    if (uniqueDealIds.size !== value.length) {
      throw new ValidationDomainError("dealIds must not contain duplicates");
    }

    return [...value];
  }

  // 기능 : 연결 요청 딜이 모두 현재 사용자의 소유인지 확인합니다.
  private async assertDealsExist(
    userId: string,
    dealIds: readonly string[],
    repository: ScheduleRepository = this.scheduleRepository
  ): Promise<void> {
    if (dealIds.length === 0) {
      return;
    }

    const deals = await repository.findDealsByIds(userId, dealIds);

    if (deals.length !== dealIds.length) {
      throw new RelatedDealNotFoundError();
    }
  }

  // 기능 : 필수 텍스트를 trim하고 길이와 공백 여부를 검증합니다.
  private normalizeRequiredText(
    value: string,
    maxLength: number,
    message: string
  ): string {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(message);
    }

    if (normalized.length > maxLength) {
      throw new ValidationDomainError(`${message.split(" ")[0]} is too long`);
    }

    return normalized;
  }

  // 기능 : 선택 텍스트를 trim하고 빈 값은 null로 정규화합니다.
  private normalizeNullableText(
    value: string | null | undefined,
    maxLength: number,
    fieldName: string
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return null;
    }

    if (normalized.length > maxLength) {
      throw new ValidationDomainError(`${fieldName} is too long`);
    }

    return normalized;
  }

  // 기능 : 필수 timezone을 저장 가능한 IANA timezone ID로 검증합니다.
  private normalizeRequiredTimeZone(timeZone: string): string {
    const normalized = normalizeOptionalIanaTimeZone(timeZone);

    if (!normalized) {
      throw new ValidationDomainError("timeZone must be a valid IANA timezone ID");
    }

    return normalized;
  }

  // 기능 : 목록 조회 timezone 입력과 사용자 기본 timezone을 정규화합니다.
  private normalizeQueryTimeZone(
    requestedTimeZone: string | undefined,
    userTimeZone: string
  ): string {
    const normalizedRequest = normalizeOptionalIanaTimeZone(requestedTimeZone);

    if (normalizedRequest) {
      return normalizedRequest;
    }

    return isValidIanaTimeZone(userTimeZone)
      ? userTimeZone
      : DEFAULT_USER_TIME_ZONE;
  }

  // 기능 : 일정 시작/종료 일시 문자열을 UTC instant Date로 변환합니다.
  private parseScheduleDateTime(
    value: string,
    timeZone: string,
    fieldName: string
  ): Date {
    if (OFFSET_DATE_TIME_PATTERN.test(value)) {
      const instant = new Date(value);

      if (Number.isNaN(instant.getTime())) {
        throw new ValidationDomainError(`${fieldName} must be a valid date-time`);
      }

      return instant;
    }

    const match = LOCAL_DATE_TIME_PATTERN.exec(value);

    if (!match) {
      throw new ValidationDomainError(`${fieldName} must be a valid date-time`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] ? Number(match[6]) : 0;
    const millisecond = match[7] ? Number(match[7].padEnd(3, "0")) : 0;

    if (
      !this.isValidDateTimeParts({
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
      })
    ) {
      throw new ValidationDomainError(`${fieldName} must be a valid date-time`);
    }

    return this.zonedTimeToUtc(
      { year, month, day, hour, minute, second, millisecond },
      timeZone
    );
  }

  // 기능 : 시작 시각이 종료 시각보다 앞서는지 검증합니다.
  private assertValidTimeRange(startAt: Date, endAt: Date): void {
    if (endAt.getTime() <= startAt.getTime()) {
      throw new ValidationDomainError("endAt must be after startAt");
    }
  }

  // 기능 : baseDate와 view 기준으로 조회 범위 UTC instant를 계산합니다.
  private createRange(
    baseDate: string,
    view: ScheduleViewMode,
    timeZone: string
  ): { readonly start: Date; readonly end: Date } {
    const date = this.parseDateOnly(baseDate);

    if (view === ScheduleViewMode.WEEK) {
      const start = this.getWeekStartDate(date);
      const end = this.addCalendarDays(start, 7);

      return {
        start: this.zonedTimeToUtc(
          { ...start, hour: 0, minute: 0, second: 0, millisecond: 0 },
          timeZone
        ),
        end: this.zonedTimeToUtc(
          { ...end, hour: 0, minute: 0, second: 0, millisecond: 0 },
          timeZone
        ),
      };
    }

    const start = { year: date.year, month: date.month, day: 1 };
    const end =
      date.month === 12
        ? { year: date.year + 1, month: 1, day: 1 }
        : { year: date.year, month: date.month + 1, day: 1 };

    return {
      start: this.zonedTimeToUtc(
        { ...start, hour: 0, minute: 0, second: 0, millisecond: 0 },
        timeZone
      ),
      end: this.zonedTimeToUtc(
        { ...end, hour: 0, minute: 0, second: 0, millisecond: 0 },
        timeZone
      ),
    };
  }

  // 기능 : YYYY-MM-DD 문자열을 calendar date로 변환합니다.
  private parseDateOnly(value: string): CalendarDate {
    if (!DATE_ONLY_PATTERN.test(value)) {
      throw new ValidationDomainError("baseDate must be YYYY-MM-DD");
    }

    const [yearText, monthText, dayText] = value.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new ValidationDomainError("baseDate must be a valid date");
    }

    return { year, month, day };
  }

  // 기능 : 주어진 calendar date가 속한 월요일 시작일을 계산합니다.
  private getWeekStartDate(date: CalendarDate): CalendarDate {
    const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    const day = utcDate.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    utcDate.setUTCDate(utcDate.getUTCDate() + diff);

    return {
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth() + 1,
      day: utcDate.getUTCDate(),
    };
  }

  // 기능 : calendar date에 날짜 수를 더합니다.
  private addCalendarDays(date: CalendarDate, days: number): CalendarDate {
    const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    utcDate.setUTCDate(utcDate.getUTCDate() + days);

    return {
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth() + 1,
      day: utcDate.getUTCDate(),
    };
  }

  // 기능 : timezone 기준 local date-time을 UTC instant로 변환합니다.
  private zonedTimeToUtc(parts: DateTimeParts, timeZone: string): Date {
    const utcGuess = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
      )
    );
    const timeZoneParts = this.getTimeZoneParts(utcGuess, timeZone);
    const asUtc = Date.UTC(
      timeZoneParts.year,
      timeZoneParts.month - 1,
      timeZoneParts.day,
      timeZoneParts.hour,
      timeZoneParts.minute,
      timeZoneParts.second,
      timeZoneParts.millisecond
    );
    const offset = asUtc - utcGuess.getTime();

    return new Date(utcGuess.getTime() - offset);
  }

  // 기능 : UTC instant를 특정 timezone의 local date-time 구성요소로 변환합니다.
  private getTimeZoneParts(date: Date, timeZone: string): DateTimeParts {
    const formatter = new Intl.DateTimeFormat("en-US", {
      calendar: "iso8601",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone,
      year: "numeric",
    });
    const values = new Map(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );

    return {
      year: values.get("year") ?? 0,
      month: values.get("month") ?? 0,
      day: values.get("day") ?? 0,
      hour: values.get("hour") ?? 0,
      minute: values.get("minute") ?? 0,
      second: values.get("second") ?? 0,
      millisecond: 0,
    };
  }

  // 기능 : local date-time 구성요소가 실제 calendar 값인지 검증합니다.
  private isValidDateTimeParts(parts: DateTimeParts): boolean {
    const date = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
      )
    );

    return (
      date.getUTCFullYear() === parts.year &&
      date.getUTCMonth() === parts.month - 1 &&
      date.getUTCDate() === parts.day &&
      date.getUTCHours() === parts.hour &&
      date.getUTCMinutes() === parts.minute &&
      date.getUTCSeconds() === parts.second
    );
  }

  // 기능 : 딜 옵션 레코드를 API 응답으로 변환합니다.
  private toDealOptionResponse(
    deal: ScheduleDealOptionRecord
  ): ScheduleDealOptionResponse {
    return {
      id: deal.id,
      dealName: deal.dealName,
      createdAt: deal.createdAt.toISOString(),
    };
  }

  // 기능 : 일정 레코드를 API 응답으로 변환합니다.
  private toScheduleResponse(schedule: ScheduleRecord): ScheduleResponse {
    return {
      id: schedule.id,
      scheduleTitle: schedule.scheduleTitle,
      startAt: schedule.startAt.toISOString(),
      endAt: schedule.endAt.toISOString(),
      timeZone: schedule.timeZone,
      location: schedule.location,
      memo: schedule.memo,
      deals: schedule.deals.map((deal) => this.toDealResponse(deal)),
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    };
  }

  // 기능 : 연결 딜 레코드를 API 응답으로 변환합니다.
  private toDealResponse(deal: ScheduleDealRecord): ScheduleDealResponse {
    return {
      id: deal.id,
      dealName: deal.dealName,
    };
  }

  // 기능 : 민감정보를 제외한 구조화 이벤트 로그를 기록합니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "ScheduleApplicationService"
    );
  }
}
