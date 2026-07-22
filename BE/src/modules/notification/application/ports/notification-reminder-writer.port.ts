import type {
  CancelPendingNotificationsBySourceInput,
  NotificationRecord,
  NotificationSettingsRecord,
  UpsertReminderNotificationInput,
} from "@/modules/notification/application/ports/notification.repository";

export interface NotificationReminderWriteRepository {
  findSettingsForUser(
    userId: string
  ): Promise<NotificationSettingsRecord | null>;
  cancelPendingNotificationsBySource(
    input: CancelPendingNotificationsBySourceInput
  ): Promise<number>;
  upsertReminderNotification(
    input: UpsertReminderNotificationInput
  ): Promise<NotificationRecord>;
}
