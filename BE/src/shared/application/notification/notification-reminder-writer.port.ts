export type NotificationType =
  | "SCHEDULE_START_REMINDER"
  | "DEAL_DUE_REMINDER";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "CANCELED";
export type NotificationSourceType = "SCHEDULE" | "DEAL";

// 역할 : NotificationSettingsRecord reminder 생성에 필요한 사용자 알림 설정 record를 정의합니다.
export interface NotificationSettingsRecord {
  readonly id: string;
  readonly userId: string;
  readonly scheduleReminderEnabled: boolean;
  readonly dealDueReminderEnabled: boolean;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
  readonly scheduleReminderMinutes: number;
  readonly dealDueReminderDaysBefore: number;
  readonly dealDueReminderLocalTime: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : NotificationRecord reminder writer가 생성하거나 갱신한 알림 record를 정의합니다.
export interface NotificationRecord {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly sourceType: NotificationSourceType;
  readonly sourceId: string;
  readonly dedupeKey: string;
  readonly targetPath: string;
  readonly title: string;
  readonly body: string | null;
  readonly targetLabel: string | null;
  readonly status: NotificationStatus;
  readonly scheduledAt: Date;
  readonly sentAt: Date | null;
  readonly readAt: Date | null;
  readonly canceledAt: Date | null;
  readonly cancelReason: string | null;
  readonly metadataJson: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : CreateNotificationInput 앱 안 알림 생성 값을 정의합니다.
export interface CreateNotificationInput {
  readonly id?: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly sourceType: NotificationSourceType;
  readonly sourceId: string;
  readonly dedupeKey: string;
  readonly targetPath: string;
  readonly title: string;
  readonly body?: string | null;
  readonly targetLabel?: string | null;
  readonly scheduledAt: Date;
  readonly metadataJson?: Record<string, unknown>;
}

// 역할 : UpsertReminderNotificationInput reminder 알림 upsert 값을 정의합니다.
export interface UpsertReminderNotificationInput extends CreateNotificationInput {
  readonly now: Date;
}

// 역할 : CancelPendingNotificationsBySourceInput 원본 일정/딜 기준 pending 알림 취소 조건을 정의합니다.
export interface CancelPendingNotificationsBySourceInput {
  readonly userId: string;
  readonly sourceType: NotificationSourceType;
  readonly sourceId: string;
  readonly excludeDedupeKey?: string;
  readonly cancelReason: string;
  readonly canceledAt: Date;
}

// 역할 : NotificationReminderWriteRepository 원본 module transaction 안에서 reminder 쓰기를 수행하는 최소 계약을 정의합니다.
export interface NotificationReminderWriteRepository {
  // 기능 : reminder 생성에 필요한 현재 사용자 알림 설정을 조회합니다.
  findSettingsForUser(
    userId: string
  ): Promise<NotificationSettingsRecord | null>;
  // 기능 : 원본 일정/딜 기준으로 아직 발송되지 않은 reminder를 취소합니다.
  cancelPendingNotificationsBySource(
    input: CancelPendingNotificationsBySourceInput
  ): Promise<number>;
  // 기능 : dedupe key 기준으로 reminder 알림을 생성하거나 pending 상태로 갱신합니다.
  upsertReminderNotification(
    input: UpsertReminderNotificationInput
  ): Promise<NotificationRecord>;
}
