import type { NotificationReminderWriteRepository } from "@/shared/application/notification/notification-reminder-writer.port";

export const GOOGLE_CALENDAR_CONNECTION_REPOSITORY = Symbol(
  "GOOGLE_CALENDAR_CONNECTION_REPOSITORY"
);

export type GoogleCalendarConnectionStatus =
  | "CONNECTED"
  | "RECONNECT_REQUIRED"
  | "DISCONNECTED";
export type GoogleCalendarDisconnectScheduleAction = "KEEP" | "HIDE" | "TRASH";

// 역할 : GoogleCalendarConnectionRecord Google Calendar 연결 상태 projection 구조를 정의합니다.
export interface GoogleCalendarConnectionRecord {
  readonly id: string;
  readonly status: GoogleCalendarConnectionStatus;
  readonly providerAccountId: string | null;
  readonly providerAccountEmail: string | null;
  readonly connectedAt: Date | null;
  readonly reconnectRequiredAt: Date | null;
  readonly disconnectedAt: Date | null;
  readonly lastSyncedAt: Date | null;
  readonly lastSyncStartedAt: Date | null;
  readonly lastSyncFailedAt: Date | null;
  readonly lastSyncErrorCode: string | null;
  readonly syncLockExpiresAt: Date | null;
  readonly hasRefreshToken: boolean;
}

// 역할 : GoogleCalendarConnectionStatusAggregate 연결 상태 화면에 필요한 집계 구조를 정의합니다.
export interface GoogleCalendarConnectionStatusAggregate {
  readonly connection: GoogleCalendarConnectionRecord | null;
  readonly selectedCalendarCount: number;
  readonly availableCalendarCount: number;
}

// 역할 : UpsertConnectedGoogleCalendarConnectionInput OAuth 성공 후 연결 저장 값을 정의합니다.
export interface UpsertConnectedGoogleCalendarConnectionInput {
  readonly userId: string;
  readonly providerAccountId: string;
  readonly providerAccountEmail: string;
  readonly encryptedAccessToken: string;
  readonly encryptedRefreshToken?: string;
  readonly tokenExpiresAt: Date | null;
  readonly grantedScopes: readonly string[];
  readonly connectedAt: Date;
}

// 역할 : DisconnectGoogleCalendarConnectionInput Google Calendar 연결 해제 처리 값을 정의합니다.
export interface DisconnectGoogleCalendarConnectionInput {
  readonly userId: string;
  readonly scheduleAction: GoogleCalendarDisconnectScheduleAction;
  readonly disconnectedAt: Date;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
}

// 역할 : DisconnectGoogleCalendarConnectionResult 연결 해제 후 일정 처리 결과를 정의합니다.
export interface DisconnectGoogleCalendarConnectionResult {
  readonly connectionStatus: "DISCONNECTED";
  readonly scheduleAction: GoogleCalendarDisconnectScheduleAction;
  readonly affectedScheduleCount: number;
  readonly trashedScheduleCount: number;
  readonly hiddenScheduleCount: number;
  readonly keptScheduleCount: number;
  readonly disconnectedAt: Date;
  readonly trashedScheduleIds: string[];
}

// 역할 : GoogleCalendarConnectionRepository Google Calendar 연결 영속성 계약을 정의합니다.
export interface GoogleCalendarConnectionRepository
  extends NotificationReminderWriteRepository {
  // 기능 : Google Calendar 연결 작업을 하나의 DB transaction으로 실행합니다.
  runInTransaction<T>(
    work: (repository: GoogleCalendarConnectionRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 현재 사용자의 Google Calendar 연결 record를 조회합니다.
  findConnection(
    userId: string
  ): Promise<GoogleCalendarConnectionRecord | null>;
  // 기능 : 연결 상태 화면에 필요한 연결 정보와 캘린더 수를 함께 조회합니다.
  getStatusAggregate(
    userId: string
  ): Promise<GoogleCalendarConnectionStatusAggregate>;
  // 기능 : OAuth 성공 결과로 현재 사용자의 Google Calendar 연결을 생성하거나 갱신합니다.
  upsertConnectedConnection(
    input: UpsertConnectedGoogleCalendarConnectionInput
  ): Promise<GoogleCalendarConnectionRecord>;
  // 기능 : 연결 해제 정책에 따라 Google 일정 처리와 연결 상태 변경을 수행합니다.
  disconnectConnection(
    input: DisconnectGoogleCalendarConnectionInput
  ): Promise<DisconnectGoogleCalendarConnectionResult | null>;
}
