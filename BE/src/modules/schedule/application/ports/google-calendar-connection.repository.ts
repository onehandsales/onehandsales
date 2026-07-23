import type { NotificationReminderWriteRepository } from "@/modules/notification/application/ports/notification-reminder-writer.port";

export const GOOGLE_CALENDAR_CONNECTION_REPOSITORY = Symbol(
  "GOOGLE_CALENDAR_CONNECTION_REPOSITORY"
);

export type GoogleCalendarConnectionStatus =
  | "CONNECTED"
  | "RECONNECT_REQUIRED"
  | "DISCONNECTED";
export type GoogleCalendarDisconnectScheduleAction = "KEEP" | "HIDE" | "TRASH";

export interface GoogleCalendarConnectionRecord {
  readonly id: string;
  readonly status: GoogleCalendarConnectionStatus;
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

export interface GoogleCalendarConnectionStatusAggregate {
  readonly connection: GoogleCalendarConnectionRecord | null;
  readonly selectedCalendarCount: number;
  readonly availableCalendarCount: number;
}

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

export interface DisconnectGoogleCalendarConnectionInput {
  readonly userId: string;
  readonly scheduleAction: GoogleCalendarDisconnectScheduleAction;
  readonly disconnectedAt: Date;
  readonly deletedAt: Date;
  readonly trashExpiresAt: Date;
}

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

export interface GoogleCalendarConnectionRepository
  extends NotificationReminderWriteRepository {
  runInTransaction<T>(
    work: (repository: GoogleCalendarConnectionRepository) => Promise<T>
  ): Promise<T>;
  findConnection(
    userId: string
  ): Promise<GoogleCalendarConnectionRecord | null>;
  getStatusAggregate(
    userId: string
  ): Promise<GoogleCalendarConnectionStatusAggregate>;
  upsertConnectedConnection(
    input: UpsertConnectedGoogleCalendarConnectionInput
  ): Promise<GoogleCalendarConnectionRecord>;
  disconnectConnection(
    input: DisconnectGoogleCalendarConnectionInput
  ): Promise<DisconnectGoogleCalendarConnectionResult | null>;
}
