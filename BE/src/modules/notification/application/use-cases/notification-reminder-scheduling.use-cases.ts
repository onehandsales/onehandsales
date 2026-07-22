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

interface ReminderSchedulingResult {
  readonly scheduled: boolean;
  readonly notification: NotificationRecord | null;
  readonly canceledCount: number;
}

export interface ScheduleNotificationReminderCommand {
  readonly userId: string;
  readonly scheduleId: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly now?: Date;
}

export interface CancelScheduleNotificationReminderCommand {
  readonly userId: string;
  readonly scheduleId: string;
  readonly cancelReason?: string;
  readonly now?: Date;
}

export interface ScheduleDealDueReminderCommand {
  readonly userId: string;
  readonly dealId: string;
  readonly dealName: string;
  readonly expectedEndDate: Date;
  readonly userTimeZone: string;
  readonly now?: Date;
}

export interface CancelDealDueReminderCommand {
  readonly userId: string;
  readonly dealId: string;
  readonly cancelReason?: string;
  readonly now?: Date;
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

@Injectable()
export class ScheduleNotificationReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: ScheduleNotificationReminderCommand
  ): Promise<ReminderSchedulingResult> {
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: ScheduleNotificationReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<ReminderSchedulingResult> {
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
export class CancelScheduleNotificationReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: CancelScheduleNotificationReminderCommand
  ): Promise<number> {
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: CancelScheduleNotificationReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<number> {
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
export class ScheduleDealDueReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: ScheduleDealDueReminderCommand
  ): Promise<ReminderSchedulingResult> {
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: ScheduleDealDueReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<ReminderSchedulingResult> {
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
export class CancelDealDueReminderUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(input: CancelDealDueReminderCommand): Promise<number> {
    return this.notificationRepository.runInTransaction((repository) =>
      this.executeWithRepository(input, repository)
    );
  }

  async executeWithRepository(
    input: CancelDealDueReminderCommand,
    repository: NotificationReminderWriteRepository
  ): Promise<number> {
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

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number
): number {
  return Number.isInteger(value) && value !== undefined && value > 0
    ? value
    : fallback;
}

function normalizeNonNegativeInteger(
  value: number | undefined,
  fallback: number
): number {
  return Number.isInteger(value) && value !== undefined && value >= 0
    ? value
    : fallback;
}

function normalizeLocalTime(value: string | undefined, fallback: string): string {
  return value && LOCAL_TIME_PATTERN.test(value) ? value : fallback;
}

function normalizeTimeZone(timeZone: string): string {
  return isValidIanaTimeZone(timeZone) ? timeZone : DEFAULT_USER_TIME_ZONE;
}

function getDateOnlyParts(value: Date): CalendarDate {
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

function getLocalDate(value: Date, timeZone: string): CalendarDate {
  const parts = getTimeZoneParts(value, timeZone);

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };
}

function compareCalendarDate(left: CalendarDate, right: CalendarDate): number {
  const leftTime = Date.UTC(left.year, left.month - 1, left.day);
  const rightTime = Date.UTC(right.year, right.month - 1, right.day);

  return leftTime - rightTime;
}

function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
  utcDate.setUTCDate(utcDate.getUTCDate() + days);

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  };
}

function formatDateOnly(date: CalendarDate): string {
  return [
    date.year.toString().padStart(4, "0"),
    date.month.toString().padStart(2, "0"),
    date.day.toString().padStart(2, "0"),
  ].join("-");
}

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
