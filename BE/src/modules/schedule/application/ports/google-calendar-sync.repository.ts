import type { NotificationReminderWriteRepository } from "@/modules/notification/application/ports/notification-reminder-writer.port";

export const GOOGLE_CALENDAR_SYNC_REPOSITORY = Symbol(
  "GOOGLE_CALENDAR_SYNC_REPOSITORY"
);

export type GoogleCalendarSourceStatus = "SELECTED" | "UNSELECTED";
export type GoogleCalendarSyncTrigger = "AUTO" | "MANUAL";

export interface GoogleCalendarSyncConnectionRecord {
  readonly id: string;
  readonly status: "CONNECTED" | "RECONNECT_REQUIRED" | "DISCONNECTED";
  readonly providerAccountEmail: string | null;
  readonly encryptedAccessToken: string | null;
  readonly encryptedRefreshToken: string | null;
  readonly tokenExpiresAt: Date | null;
  readonly connectedAt: Date | null;
  readonly reconnectRequiredAt: Date | null;
  readonly disconnectedAt: Date | null;
  readonly lastSyncedAt: Date | null;
  readonly lastSyncStartedAt: Date | null;
  readonly lastSyncFailedAt: Date | null;
  readonly lastSyncErrorCode: string | null;
  readonly syncLockExpiresAt: Date | null;
}

export interface GoogleCalendarSourceRecord {
  readonly id: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly calendarTimeZone: string | null;
  readonly isPrimary: boolean;
  readonly isSystemCalendar: boolean;
  readonly status: GoogleCalendarSourceStatus;
  readonly syncToken: string | null;
  readonly lastSyncedAt: Date | null;
  readonly lastSyncFailedAt: Date | null;
  readonly lastSyncErrorCode: string | null;
}

export interface UpsertGoogleCalendarSourceInput {
  readonly calendarId: string;
  readonly calendarName: string;
  readonly calendarTimeZone: string | null;
  readonly isPrimary: boolean;
  readonly isSystemCalendar: boolean;
}

export interface UpdateGoogleCalendarSelectionResult {
  readonly sources: readonly GoogleCalendarSourceRecord[];
  readonly hiddenScheduleIds: readonly string[];
}

export interface GoogleCalendarSyncedEventFields {
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly timeZone: string;
  readonly location: string | null;
  readonly meetingUrl: string | null;
  readonly memo: string | null;
  readonly isAllDay: boolean;
}

export interface GoogleCalendarSyncedEventInput {
  readonly externalEventId: string;
  readonly externalEventICalUid: string | null;
  readonly externalEventEtag: string | null;
  readonly externalHtmlLink: string | null;
  readonly externalUpdatedAt: Date | null;
  readonly isWithinSyncRange: boolean;
  readonly isCancelled: boolean;
  readonly fields: GoogleCalendarSyncedEventFields | null;
}

export interface ScheduleReminderRequest {
  readonly scheduleId: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
}

export interface ApplyGoogleCalendarEventsResult {
  readonly importedCount: number;
  readonly updatedCount: number;
  readonly localModifiedSkippedCount: number;
  readonly googleDeletedCount: number;
  readonly trashedCount: number;
  readonly reminderScheduleRequests: readonly ScheduleReminderRequest[];
  readonly reminderCancelScheduleIds: readonly string[];
}

export interface GoogleCalendarSyncRepository
  extends NotificationReminderWriteRepository {
  runInTransaction<T>(
    work: (repository: GoogleCalendarSyncRepository) => Promise<T>
  ): Promise<T>;
  findConnectionForUser(
    userId: string
  ): Promise<GoogleCalendarSyncConnectionRecord | null>;
  updateConnectionAccessToken(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly encryptedAccessToken: string;
    readonly tokenExpiresAt: Date | null;
    readonly grantedScopes: readonly string[];
  }): Promise<void>;
  markConnectionReconnectRequired(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly now: Date;
    readonly errorCode: string;
  }): Promise<void>;
  markConnectionSyncStarted(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly startedAt: Date;
    readonly lockExpiresAt: Date;
  }): Promise<boolean>;
  markConnectionSyncSucceeded(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly finishedAt: Date;
  }): Promise<void>;
  markConnectionSyncFailed(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly failedAt: Date;
    readonly errorCode: string;
  }): Promise<void>;
  upsertCalendarSources(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly sources: readonly UpsertGoogleCalendarSourceInput[];
  }): Promise<readonly GoogleCalendarSourceRecord[]>;
  listCalendarSources(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<readonly GoogleCalendarSourceRecord[]>;
  updateCalendarSelection(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly selectedCalendarIds: readonly string[];
  }): Promise<UpdateGoogleCalendarSelectionResult | null>;
  listSelectedSources(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<readonly GoogleCalendarSourceRecord[]>;
  clearSourceSyncToken(input: {
    readonly userId: string;
    readonly sourceId: string;
  }): Promise<void>;
  markSourceSyncFailed(input: {
    readonly userId: string;
    readonly sourceId: string;
    readonly failedAt: Date;
    readonly errorCode: string;
  }): Promise<void>;
  applySyncedEvents(input: {
    readonly userId: string;
    readonly source: GoogleCalendarSourceRecord;
    readonly events: readonly GoogleCalendarSyncedEventInput[];
    readonly nextSyncToken: string | null;
    readonly syncedAt: Date;
  }): Promise<ApplyGoogleCalendarEventsResult>;
}
