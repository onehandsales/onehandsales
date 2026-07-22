import type {
  CancelPendingNotificationsBySourceInput,
  NotificationRecord,
  NotificationSettingsRecord,
  UpsertReminderNotificationInput,
} from "@/modules/notification/application/ports/notification.repository";

// 역할 : 원본 일정/딜 저장소 transaction 안에서 reminder 쓰기를 수행하기 위한 최소 계약입니다.
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
