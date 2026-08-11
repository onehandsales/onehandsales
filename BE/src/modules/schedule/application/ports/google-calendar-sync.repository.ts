import type { NotificationReminderWriteRepository } from "@/shared/application/notification/notification-reminder-writer.port";

export const GOOGLE_CALENDAR_SYNC_REPOSITORY = Symbol(
  "GOOGLE_CALENDAR_SYNC_REPOSITORY"
);

export type GoogleCalendarSourceStatus = "SELECTED" | "UNSELECTED";
export type GoogleCalendarSyncTrigger = "AUTO" | "MANUAL";

// 역할 : GoogleCalendarSyncConnectionRecord Google Calendar 동기화용 연결 projection 구조를 정의합니다.
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

// 역할 : GoogleCalendarSourceRecord 동기화 대상 Google Calendar source 구조를 정의합니다.
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

// 역할 : UpsertGoogleCalendarSourceInput provider calendar 목록 upsert 값을 정의합니다.
export interface UpsertGoogleCalendarSourceInput {
  readonly calendarId: string;
  readonly calendarName: string;
  readonly calendarTimeZone: string | null;
  readonly isPrimary: boolean;
  readonly isSystemCalendar: boolean;
}

// 역할 : UpdateGoogleCalendarSelectionResult 캘린더 선택 변경과 숨김 일정 결과를 정의합니다.
export interface UpdateGoogleCalendarSelectionResult {
  readonly sources: readonly GoogleCalendarSourceRecord[];
  readonly hiddenScheduleIds: readonly string[];
}

// 역할 : GoogleCalendarSyncedEventFields Google event에서 일정 필드로 반영할 값을 정의합니다.
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

// 역할 : GoogleCalendarSyncedEventInput provider event 동기화 입력 구조를 정의합니다.
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

// 역할 : ScheduleReminderRequest 동기화 후 일정 알림 예약에 필요한 값을 정의합니다.
export interface ScheduleReminderRequest {
  readonly scheduleId: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
}

// 역할 : ApplyGoogleCalendarEventsResult provider event 반영 결과와 알림 후속 작업을 정의합니다.
export interface ApplyGoogleCalendarEventsResult {
  readonly importedCount: number;
  readonly updatedCount: number;
  readonly localModifiedSkippedCount: number;
  readonly googleDeletedCount: number;
  readonly trashedCount: number;
  readonly reminderScheduleRequests: readonly ScheduleReminderRequest[];
  readonly reminderCancelScheduleIds: readonly string[];
}

// 역할 : GoogleCalendarSyncRepository Google Calendar source와 event 동기화 영속성 계약을 정의합니다.
export interface GoogleCalendarSyncRepository
  extends NotificationReminderWriteRepository {
  // 기능 : Google Calendar 동기화 작업을 하나의 DB transaction으로 실행합니다.
  runInTransaction<T>(
    work: (repository: GoogleCalendarSyncRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 현재 사용자의 동기화 가능한 Google Calendar 연결을 조회합니다.
  findConnectionForUser(
    userId: string
  ): Promise<GoogleCalendarSyncConnectionRecord | null>;
  // 기능 : refresh 결과로 갱신된 access token과 scope를 연결 record에 저장합니다.
  updateConnectionAccessToken(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly encryptedAccessToken: string;
    readonly tokenExpiresAt: Date | null;
    readonly grantedScopes: readonly string[];
  }): Promise<void>;
  // 기능 : provider 인증 실패로 연결 재인증 필요 상태와 오류 코드를 저장합니다.
  markConnectionReconnectRequired(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly now: Date;
    readonly errorCode: string;
  }): Promise<void>;
  // 기능 : 동기화 시작 시각과 lock 만료 시각을 저장하고 lock 획득 여부를 반환합니다.
  markConnectionSyncStarted(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly startedAt: Date;
    readonly lockExpiresAt: Date;
  }): Promise<boolean>;
  // 기능 : 동기화 성공 시각을 연결 record에 반영합니다.
  markConnectionSyncSucceeded(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly finishedAt: Date;
  }): Promise<void>;
  // 기능 : 동기화 실패 시각과 안전한 오류 코드를 연결 record에 반영합니다.
  markConnectionSyncFailed(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly failedAt: Date;
    readonly errorCode: string;
  }): Promise<void>;
  // 기능 : provider calendar 목록을 현재 사용자 연결 source로 생성하거나 갱신합니다.
  upsertCalendarSources(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly sources: readonly UpsertGoogleCalendarSourceInput[];
  }): Promise<readonly GoogleCalendarSourceRecord[]>;
  // 기능 : 현재 사용자 연결의 전체 calendar source 목록을 조회합니다.
  listCalendarSources(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<readonly GoogleCalendarSourceRecord[]>;
  // 기능 : 사용자가 선택한 calendar source 상태를 갱신하고 숨김 처리된 일정을 반환합니다.
  updateCalendarSelection(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly selectedCalendarIds: readonly string[];
  }): Promise<UpdateGoogleCalendarSelectionResult | null>;
  // 기능 : 현재 사용자 연결에서 동기화 대상으로 선택된 source 목록을 조회합니다.
  listSelectedSources(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<readonly GoogleCalendarSourceRecord[]>;
  // 기능 : 특정 source의 incremental sync token을 초기화합니다.
  clearSourceSyncToken(input: {
    readonly userId: string;
    readonly sourceId: string;
  }): Promise<void>;
  // 기능 : source 단위 동기화 실패 시각과 안전한 오류 코드를 저장합니다.
  markSourceSyncFailed(input: {
    readonly userId: string;
    readonly sourceId: string;
    readonly failedAt: Date;
    readonly errorCode: string;
  }): Promise<void>;
  // 기능 : provider event 목록을 로컬 일정에 반영하고 알림 예약 후속 작업을 반환합니다.
  applySyncedEvents(input: {
    readonly userId: string;
    readonly source: GoogleCalendarSourceRecord;
    readonly events: readonly GoogleCalendarSyncedEventInput[];
    readonly nextSyncToken: string | null;
    readonly syncedAt: Date;
  }): Promise<ApplyGoogleCalendarEventsResult>;
}
