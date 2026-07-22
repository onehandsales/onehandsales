import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRecord,
  type NotificationRepository,
} from "@/modules/notification/application/ports/notification.repository";
import type { NotificationReminderWriteRepository } from "@/modules/notification/application/ports/notification-reminder-writer.port";
import {
  DEFAULT_USER_TIME_ZONE,
  isValidIanaTimeZone,
} from "@/shared/application/time-zone/time-zone";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_SCHEDULE_REMINDER_ENABLED = true;
const DEFAULT_DEAL_DUE_REMINDER_ENABLED = true;
const DEFAULT_SCHEDULE_REMINDER_MINUTES = 30;
const DEFAULT_DEAL_DUE_REMINDER_DAYS_BEFORE = 1;
const DEFAULT_DEAL_DUE_REMINDER_LOCAL_TIME = "09:00";
const MINUTE_IN_MS = 60_000;
const LOCAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

// 역할 : reminder 예약/취소 use case의 처리 결과를 정의합니다.
interface ReminderSchedulingResult {
  readonly scheduled: boolean;
  readonly notification: NotificationRecord | null;
  readonly canceledCount: number;
}

// 역할 : 일정 시작 reminder 예약 command를 정의합니다.
export interface ScheduleNotificationReminderCommand {
  readonly userId: string;
  readonly scheduleId: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly now?: Date;
}

// 역할 : 일정 시작 reminder 취소 command를 정의합니다.
export interface CancelScheduleNotificationReminderCommand {
  readonly userId: string;
  readonly scheduleId: string;
  readonly cancelReason?: string;
  readonly now?: Date;
}

// 역할 : 딜 마감 reminder 예약 command를 정의합니다.
export interface ScheduleDealDueReminderCommand {
  readonly userId: string;
  readonly dealId: string;
  readonly dealName: string;
  readonly expectedEndDate: Date;
  readonly userTimeZone: string;
  readonly now?: Date;
}

// 역할 : 딜 마감 reminder 취소 command를 정의합니다.
export interface CancelDealDueReminderCommand {
  readonly userId: string;
  readonly dealId: string;
  readonly cancelReason?: string;
  readonly now?: Date;
}

// 역할 : timezone 계산에서 날짜만 비교할 때 쓰는 calendar date 구조입니다.
type CalendarDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

// 역할 : timezone 변환에 필요한 날짜와 시각 구성 요소를 함께 표현합니다.
type DateTimeParts = CalendarDate & {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
};

@Injectable()
// 역할 : 일정 시작 30분 전 기본 reminder를 생성하거나 최신 상태로 갱신합니다.
export class ScheduleNotificationReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: ScheduleNotificationReminderCommand
  ): Promise<ReminderSchedulingResult> {
    // 기능 : 단독 실행 시 알림 저장소 자체 transaction 안에서 reminder 쓰기를 처리합니다.
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: ScheduleNotificationReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<ReminderSchedulingResult> {
    // 기능 : 일정 저장소 transaction 안에서도 같은 reminder 쓰기 로직을 재사용합니다.
    const now = input.now ?? new Date();
    const settings = await repository.findSettingsForUser(input.userId);
    const enabled =
      settings?.scheduleReminderEnabled ?? DEFAULT_SCHEDULE_REMINDER_ENABLED;

    if (!enabled || input.startAt.getTime() <= now.getTime()) {
      const canceledCount = await this.cancelPending(
        repository,
        input.userId,
        input.scheduleId,
        "SOURCE_NOT_REMINDABLE",
        now
      );

      this.logEvent("notification.reminder.schedule.skipped", {
        userId: input.userId,
        scheduleId: input.scheduleId,
        reason: enabled ? "SOURCE_PAST" : "SETTING_DISABLED",
        canceledCount,
      });

      return { scheduled: false, notification: null, canceledCount };
    }

    // 기능 : reminder 예정 시각이 이미 지났지만 일정은 미래이면 즉시 처리 가능하도록 현재 시각에 예약합니다.
    const reminderMinutes = normalizePositiveInteger(
      settings?.scheduleReminderMinutes,
      DEFAULT_SCHEDULE_REMINDER_MINUTES
    );
    const calculatedAt = new Date(
      input.startAt.getTime() - reminderMinutes * MINUTE_IN_MS
    );
    const scheduledAt =
      calculatedAt.getTime() <= now.getTime() ? now : calculatedAt;
    const dedupeKey = [
      "schedule",
      input.scheduleId,
      "start",
      input.startAt.toISOString(),
      `m${reminderMinutes}`,
    ].join(":");

    // 기능 : 같은 일정의 이전 pending reminder를 취소하고 현재 dedupe key만 유지합니다.
    const canceledCount = await repository.cancelPendingNotificationsBySource({
      userId: input.userId,
      sourceType: "SCHEDULE",
      sourceId: input.scheduleId,
      excludeDedupeKey: dedupeKey,
      cancelReason: "SOURCE_UPDATED",
      canceledAt: now,
    });
    const notification = await repository.upsertReminderNotification({
      userId: input.userId,
      type: "SCHEDULE_START_REMINDER",
      sourceType: "SCHEDULE",
      sourceId: input.scheduleId,
      dedupeKey,
      targetPath: `/app/schedules/${input.scheduleId}`,
      title: "Schedule reminder",
      body: `${input.scheduleTitle} starts soon.`,
      targetLabel: input.scheduleTitle,
      scheduledAt,
      metadataJson: {
        reminderMinutes,
        sourceStartAt: input.startAt.toISOString(),
      },
      now,
    });
    const result = { scheduled: true, notification, canceledCount };

    this.logEvent("notification.reminder.schedule.scheduled", {
      userId: input.userId,
      scheduleId: input.scheduleId,
      notificationId: result.notification.id,
      scheduledAt: result.notification.scheduledAt.toISOString(),
      canceledCount: result.canceledCount,
    });

    return result;
  }

  private async cancelPending(
    repository: NotificationReminderWriteRepository,
    userId: string,
    scheduleId: string,
    cancelReason: string,
    canceledAt: Date
  ): Promise<number> {
    return repository.cancelPendingNotificationsBySource({
      userId,
      sourceType: "SCHEDULE",
      sourceId: scheduleId,
      cancelReason,
      canceledAt,
    });
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(JSON.stringify({ event, ...fields }), this.constructor.name);
  }
}

@Injectable()
// 역할 : 일정 삭제 또는 reminder 비활성화 시 pending 일정 reminder를 취소합니다.
export class CancelScheduleNotificationReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: CancelScheduleNotificationReminderCommand
  ): Promise<number> {
    // 기능 : 단독 취소 요청을 알림 저장소 transaction 안에서 처리합니다.
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: CancelScheduleNotificationReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<number> {
    // 기능 : 원본 일정 변경 transaction 안에서도 pending reminder 취소를 재사용합니다.
    const canceledAt = input.now ?? new Date();
    const count = await repository.cancelPendingNotificationsBySource({
      userId: input.userId,
      sourceType: "SCHEDULE",
      sourceId: input.scheduleId,
      cancelReason: input.cancelReason ?? "SOURCE_DELETED",
      canceledAt,
    });

    this.logger.log(
      JSON.stringify({
        event: "notification.reminder.schedule.canceled",
        userId: input.userId,
        scheduleId: input.scheduleId,
        count,
      }),
      this.constructor.name
    );

    return count;
  }
}

@Injectable()
// 역할 : 딜 expectedEndDate 기준 사용자 timezone의 마감 reminder를 생성하거나 갱신합니다.
export class ScheduleDealDueReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: ScheduleDealDueReminderCommand
  ): Promise<ReminderSchedulingResult> {
    // 기능 : 단독 실행 시 알림 저장소 자체 transaction 안에서 reminder 쓰기를 처리합니다.
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: ScheduleDealDueReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<ReminderSchedulingResult> {
    // 기능 : 딜 저장소 transaction 안에서도 같은 reminder 쓰기 로직을 재사용합니다.
    const now = input.now ?? new Date();
    const settings = await repository.findSettingsForUser(input.userId);
    const enabled =
      settings?.dealDueReminderEnabled ?? DEFAULT_DEAL_DUE_REMINDER_ENABLED;
    const timeZone = normalizeTimeZone(input.userTimeZone);
    const expectedDate = getDateOnlyParts(input.expectedEndDate);

    if (!enabled || compareCalendarDate(expectedDate, getLocalDate(now, timeZone)) < 0) {
      const canceledCount = await this.cancelPending(
        repository,
        input.userId,
        input.dealId,
        "SOURCE_NOT_REMINDABLE",
        now
      );

      this.logEvent("notification.reminder.deal.skipped", {
        userId: input.userId,
        dealId: input.dealId,
        reason: enabled ? "SOURCE_PAST" : "SETTING_DISABLED",
        canceledCount,
      });

      return { scheduled: false, notification: null, canceledCount };
    }

    // 기능 : 사용자 timezone의 날짜/시각 설정을 UTC scheduledAt으로 변환합니다.
    const daysBefore = normalizeNonNegativeInteger(
      settings?.dealDueReminderDaysBefore,
      DEFAULT_DEAL_DUE_REMINDER_DAYS_BEFORE
    );
    const localTime = normalizeLocalTime(
      settings?.dealDueReminderLocalTime,
      DEFAULT_DEAL_DUE_REMINDER_LOCAL_TIME
    );
    const [hourText, minuteText] = localTime.split(":");
    const reminderLocalDate = addCalendarDays(expectedDate, -daysBefore);
    const calculatedAt = zonedTimeToUtc(
      {
        ...reminderLocalDate,
        hour: Number(hourText),
        minute: Number(minuteText),
        second: 0,
        millisecond: 0,
      },
      timeZone
    );
    const scheduledAt =
      calculatedAt.getTime() <= now.getTime() ? now : calculatedAt;
    const expectedEndDateText = formatDateOnly(expectedDate);
    const dedupeKey = [
      "deal",
      input.dealId,
      "due",
      expectedEndDateText,
      `d${daysBefore}`,
      localTime,
      timeZone,
    ].join(":");

    // 기능 : 같은 딜의 이전 pending reminder를 취소하고 현재 dedupe key만 유지합니다.
    const canceledCount = await repository.cancelPendingNotificationsBySource({
      userId: input.userId,
      sourceType: "DEAL",
      sourceId: input.dealId,
      excludeDedupeKey: dedupeKey,
      cancelReason: "SOURCE_UPDATED",
      canceledAt: now,
    });
    const notification = await repository.upsertReminderNotification({
      userId: input.userId,
      type: "DEAL_DUE_REMINDER",
      sourceType: "DEAL",
      sourceId: input.dealId,
      dedupeKey,
      targetPath: `/app/deals/${input.dealId}`,
      title: "Deal due reminder",
      body: `${input.dealName} is due on ${expectedEndDateText}.`,
      targetLabel: input.dealName,
      scheduledAt,
      metadataJson: {
        daysBefore,
        localTime,
        timeZone,
        expectedEndDate: expectedEndDateText,
      },
      now,
    });
    const result = { scheduled: true, notification, canceledCount };

    this.logEvent("notification.reminder.deal.scheduled", {
      userId: input.userId,
      dealId: input.dealId,
      notificationId: result.notification.id,
      scheduledAt: result.notification.scheduledAt.toISOString(),
      canceledCount: result.canceledCount,
    });

    return result;
  }

  private async cancelPending(
    repository: NotificationReminderWriteRepository,
    userId: string,
    dealId: string,
    cancelReason: string,
    canceledAt: Date
  ): Promise<number> {
    return repository.cancelPendingNotificationsBySource({
      userId,
      sourceType: "DEAL",
      sourceId: dealId,
      cancelReason,
      canceledAt,
    });
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(JSON.stringify({ event, ...fields }), this.constructor.name);
  }
}

@Injectable()
// 역할 : 딜 삭제 또는 reminder 비활성화 시 pending 딜 마감 reminder를 취소합니다.
export class CancelDealDueReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(input: CancelDealDueReminderCommand): Promise<number> {
    // 기능 : 단독 취소 요청을 알림 저장소 transaction 안에서 처리합니다.
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: CancelDealDueReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<number> {
    // 기능 : 원본 딜 변경 transaction 안에서도 pending reminder 취소를 재사용합니다.
    const canceledAt = input.now ?? new Date();
    const count = await repository.cancelPendingNotificationsBySource({
      userId: input.userId,
      sourceType: "DEAL",
      sourceId: input.dealId,
      cancelReason: input.cancelReason ?? "SOURCE_DELETED",
      canceledAt,
    });

    this.logger.log(
      JSON.stringify({
        event: "notification.reminder.deal.canceled",
        userId: input.userId,
        dealId: input.dealId,
        count,
      }),
      this.constructor.name
    );

    return count;
  }
}

// 기능 : 양수 정수 설정만 사용하고 잘못된 값은 기본값으로 대체합니다.
function normalizePositiveInteger(
  value: number | undefined,
  fallback: number
): number {
  return Number.isInteger(value) && value !== undefined && value > 0
    ? value
    : fallback;
}

// 기능 : 0 이상 정수 설정만 사용하고 잘못된 값은 기본값으로 대체합니다.
function normalizeNonNegativeInteger(
  value: number | undefined,
  fallback: number
): number {
  return Number.isInteger(value) && value !== undefined && value >= 0
    ? value
    : fallback;
}

// 기능 : HH:mm 형식의 local time만 사용하고 잘못된 값은 기본값으로 대체합니다.
function normalizeLocalTime(value: string | undefined, fallback: string): string {
  return value && LOCAL_TIME_PATTERN.test(value) ? value : fallback;
}

// 기능 : 유효한 IANA timezone만 사용하고 잘못된 값은 기본 timezone으로 대체합니다.
function normalizeTimeZone(timeZone: string): string {
  return isValidIanaTimeZone(timeZone) ? timeZone : DEFAULT_USER_TIME_ZONE;
}

// 기능 : date-only DB 값을 UTC calendar date로 변환합니다.
function getDateOnlyParts(value: Date): CalendarDate {
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

// 기능 : 특정 timezone 기준 현재 local calendar date를 계산합니다.
function getLocalDate(value: Date, timeZone: string): CalendarDate {
  const parts = getTimeZoneParts(value, timeZone);

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };
}

// 기능 : calendar date 두 값을 날짜 단위로 비교합니다.
function compareCalendarDate(left: CalendarDate, right: CalendarDate): number {
  const leftTime = Date.UTC(left.year, left.month - 1, left.day);
  const rightTime = Date.UTC(right.year, right.month - 1, right.day);

  return leftTime - rightTime;
}

// 기능 : calendar date에 일 단위 offset을 적용합니다.
function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
  utcDate.setUTCDate(utcDate.getUTCDate() + days);

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  };
}

// 기능 : calendar date를 API/metadata에 저장할 YYYY-MM-DD 문자열로 변환합니다.
function formatDateOnly(date: CalendarDate): string {
  return [
    date.year.toString().padStart(4, "0"),
    date.month.toString().padStart(2, "0"),
    date.day.toString().padStart(2, "0"),
  ].join("-");
}

// 기능 : timezone local date-time을 UTC Date로 변환합니다.
function zonedTimeToUtc(parts: DateTimeParts, timeZone: string): Date {
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
  const timeZoneParts = getTimeZoneParts(utcGuess, timeZone);
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

// 기능 : Intl formatter로 특정 timezone의 date-time 구성 요소를 추출합니다.
function getTimeZoneParts(date: Date, timeZone: string): DateTimeParts {
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
