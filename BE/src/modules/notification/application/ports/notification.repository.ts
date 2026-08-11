import type {
  CreateNotificationInput,
  NotificationRecord,
  NotificationReminderWriteRepository,
  NotificationSettingsRecord,
} from "@/shared/application/notification/notification-reminder-writer.port";

export type {
  CancelPendingNotificationsBySourceInput,
  CreateNotificationInput,
  NotificationRecord,
  NotificationSettingsRecord,
  NotificationSourceType,
  NotificationStatus,
  NotificationType,
  UpsertReminderNotificationInput,
} from "@/shared/application/notification/notification-reminder-writer.port";

export const NOTIFICATION_REPOSITORY = Symbol("NOTIFICATION_REPOSITORY");

export type NotificationDeliveryChannel = "EMAIL" | "BROWSER_PUSH";
export type NotificationDeliveryStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "CANCELED";
export type BrowserPushSubscriptionStatus = "ACTIVE" | "REVOKED";
export type NotificationReadFilter = "ALL" | "READ" | "UNREAD";

// 역할 : NotificationDeliveryAttemptRecord 외부 발송 시도 DB record를 전달합니다.
export interface NotificationDeliveryAttemptRecord {
  readonly id: string;
  readonly notificationId: string;
  readonly userId: string;
  readonly channel: NotificationDeliveryChannel;
  readonly status: NotificationDeliveryStatus;
  readonly attemptNumber: number;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly providerStatusCode: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly nextRetryAt: Date | null;
  readonly sentAt: Date | null;
  readonly failedAt: Date | null;
  readonly detailJson: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : BrowserPushSubscriptionRecord 암호화된 브라우저 push 구독 DB record를 전달합니다.
export interface BrowserPushSubscriptionRecord {
  readonly id: string;
  readonly userId: string;
  readonly endpointHash: string;
  readonly endpointCiphertext: string;
  readonly p256dhCiphertext: string;
  readonly authCiphertext: string;
  readonly contentKeyVersion: string;
  readonly status: BrowserPushSubscriptionStatus;
  readonly userAgent: string | null;
  readonly deviceLabel: string | null;
  readonly lastSeenAt: Date | null;
  readonly revokedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : NotificationUserRecord 알림 발송 대상 사용자 projection 구조를 정의합니다.
export interface NotificationUserRecord {
  readonly id: string;
  readonly email: string | null;
  readonly timeZone: string;
}

// 역할 : NotificationDeliveryWorkItemRecord 재시도 발송 작업 단위를 정의합니다.
export interface NotificationDeliveryWorkItemRecord {
  readonly attempt: NotificationDeliveryAttemptRecord;
  readonly notification: NotificationRecord;
  readonly user: NotificationUserRecord;
}

// 역할 : NotificationPageRecord 알림 목록 page 결과를 전달합니다.
export interface NotificationPageRecord {
  readonly items: readonly NotificationRecord[];
  readonly totalCount: number;
}

// 역할 : FindNotificationForUserInput 현재 사용자 소유 알림 조회 조건을 정의합니다.
export interface FindNotificationForUserInput {
  readonly userId: string;
  readonly notificationId: string;
}

// 역할 : ListNotificationsForUserInput 현재 사용자 알림 목록 조건을 정의합니다.
export interface ListNotificationsForUserInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly now: Date;
  readonly read?: NotificationReadFilter;
  readonly includeUpcoming?: boolean;
}

// 역할 : CountUnreadNotificationsForUserInput unread 알림 수 조회 조건을 정의합니다.
export interface CountUnreadNotificationsForUserInput {
  readonly userId: string;
  readonly now: Date;
}

// 역할 : UpsertNotificationSettingsInput 사용자 알림 설정 upsert 값을 정의합니다.
export interface UpsertNotificationSettingsInput {
  readonly userId: string;
  readonly scheduleReminderEnabled?: boolean;
  readonly dealDueReminderEnabled?: boolean;
  readonly emailNotificationEnabled?: boolean;
  readonly browserPushEnabled?: boolean;
  readonly scheduleReminderMinutes?: number;
  readonly dealDueReminderDaysBefore?: number;
  readonly dealDueReminderLocalTime?: string;
}

// 역할 : ListDueNotificationsInput due processor용 알림 조회 조건을 정의합니다.
export interface ListDueNotificationsInput {
  readonly now: Date;
  readonly limit: number;
}

// 역할 : MarkNotificationSentInput due 처리된 알림 상태 변경 값을 정의합니다.
export interface MarkNotificationSentInput {
  readonly notificationId: string;
  readonly sentAt: Date;
}

// 역할 : MarkNotificationReadInput 현재 사용자 알림 읽음 처리 값을 정의합니다.
export interface MarkNotificationReadInput
  extends FindNotificationForUserInput {
  readonly readAt: Date;
}

// 역할 : CreateNotificationDeliveryAttemptInput 외부 발송 시도 생성 값을 정의합니다.
export interface CreateNotificationDeliveryAttemptInput {
  readonly id?: string;
  readonly notificationId: string;
  readonly userId: string;
  readonly channel: NotificationDeliveryChannel;
  readonly status?: NotificationDeliveryStatus;
  readonly attemptNumber?: number;
  readonly provider?: string | null;
  readonly providerMessageId?: string | null;
  readonly providerStatusCode?: string | null;
  readonly safeErrorCode?: string | null;
  readonly safeErrorMessage?: string | null;
  readonly retryable?: boolean;
  readonly nextRetryAt?: Date | null;
  readonly sentAt?: Date | null;
  readonly failedAt?: Date | null;
  readonly detailJson?: Record<string, unknown>;
}

// 역할 : MarkDeliveryAttemptSentInput 외부 발송 성공 처리 값을 정의합니다.
export interface MarkDeliveryAttemptSentInput {
  readonly deliveryAttemptId: string;
  readonly sentAt: Date;
  readonly provider: string;
  readonly providerMessageId?: string | null;
  readonly providerStatusCode?: string | null;
}

// 역할 : MarkDeliveryAttemptFailedInput 외부 발송 실패 처리 값을 정의합니다.
export interface MarkDeliveryAttemptFailedInput {
  readonly deliveryAttemptId: string;
  readonly failedAt: Date;
  readonly provider: string;
  readonly providerStatusCode?: string | null;
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
  readonly nextRetryAt?: Date | null;
}

// 역할 : ListRetryableDeliveryAttemptsInput 재시도 가능한 발송 시도 조회 조건을 정의합니다.
export interface ListRetryableDeliveryAttemptsInput {
  readonly now: Date;
  readonly limit: number;
}

// 역할 : UpsertBrowserPushSubscriptionInput 암호화된 push 구독 upsert 값을 정의합니다.
export interface UpsertBrowserPushSubscriptionInput {
  readonly id?: string;
  readonly userId: string;
  readonly endpointHash: string;
  readonly endpointCiphertext: string;
  readonly p256dhCiphertext: string;
  readonly authCiphertext: string;
  readonly contentKeyVersion: string;
  readonly userAgent?: string | null;
  readonly deviceLabel?: string | null;
  readonly now: Date;
}

// 역할 : FindBrowserPushSubscriptionForUserInput 현재 사용자 push 구독 조회 조건을 정의합니다.
export interface FindBrowserPushSubscriptionForUserInput {
  readonly userId: string;
  readonly browserSubscriptionId: string;
}

// 역할 : RevokeBrowserPushSubscriptionForUserInput 현재 사용자 push 구독 해제 값을 정의합니다.
export interface RevokeBrowserPushSubscriptionForUserInput
  extends FindBrowserPushSubscriptionForUserInput {
  readonly revokedAt: Date;
}

// 역할 : NotificationRepository 알림 DB persistence 계약을 정의합니다.
export interface NotificationRepository extends NotificationReminderWriteRepository {
  // 기능 : 알림 저장소 작업을 하나의 DB transaction으로 실행합니다.
  runInTransaction<T>(
    work: (repository: NotificationRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 현재 사용자의 알림 설정을 생성하거나 갱신합니다.
  upsertSettings(
    input: UpsertNotificationSettingsInput
  ): Promise<NotificationSettingsRecord>;
  // 기능 : 앱 안 알림 정본 row를 생성합니다.
  createNotification(input: CreateNotificationInput): Promise<NotificationRecord>;
  // 기능 : 현재 사용자 소유 알림을 ID 기준으로 조회합니다.
  findNotificationByIdForUser(
    input: FindNotificationForUserInput
  ): Promise<NotificationRecord | null>;
  // 기능 : 현재 사용자 알림 목록을 page 기준으로 조회합니다.
  listNotificationsForUser(
    input: ListNotificationsForUserInput
  ): Promise<NotificationPageRecord>;
  // 기능 : 현재 사용자 unread 알림 수를 조회합니다.
  countUnreadNotificationsForUser(
    input: CountUnreadNotificationsForUserInput
  ): Promise<number>;
  // 기능 : 현재 사용자 알림을 읽음 처리합니다.
  markNotificationReadForUser(
    input: MarkNotificationReadInput
  ): Promise<NotificationRecord | null>;
  // 기능 : due processor가 처리할 pending 알림을 조회합니다.
  listDueNotifications(input: ListDueNotificationsInput): Promise<NotificationRecord[]>;
  // 기능 : due 처리된 알림을 SENT 상태로 변경합니다.
  markNotificationSent(input: MarkNotificationSentInput): Promise<boolean>;
  // 기능 : email/browser push 발송 시도 이력을 생성합니다.
  createDeliveryAttempt(
    input: CreateNotificationDeliveryAttemptInput
  ): Promise<NotificationDeliveryAttemptRecord>;
  // 기능 : 외부 발송 시도를 성공 상태와 provider 응답 정보로 갱신합니다.
  markDeliveryAttemptSent(
    input: MarkDeliveryAttemptSentInput
  ): Promise<NotificationDeliveryAttemptRecord | null>;
  // 기능 : 외부 발송 시도를 실패 상태와 안전한 오류 정보로 갱신합니다.
  markDeliveryAttemptFailed(
    input: MarkDeliveryAttemptFailedInput
  ): Promise<NotificationDeliveryAttemptRecord | null>;
  // 기능 : 재시도 대상으로 가져간 발송 시도의 retry 예약을 소비 처리합니다.
  markDeliveryAttemptRetryConsumed(deliveryAttemptId: string): Promise<boolean>;
  // 기능 : 다음 재시도 시간이 도래한 발송 작업을 조회합니다.
  listRetryableDeliveryAttempts(
    input: ListRetryableDeliveryAttemptsInput
  ): Promise<NotificationDeliveryWorkItemRecord[]>;
  // 기능 : 알림 발송에 필요한 사용자 연락처와 시간대 정보를 조회합니다.
  findUserForNotification(userId: string): Promise<NotificationUserRecord | null>;
  // 기능 : 암호화된 browser push subscription을 생성하거나 갱신합니다.
  upsertBrowserPushSubscription(
    input: UpsertBrowserPushSubscriptionInput
  ): Promise<BrowserPushSubscriptionRecord>;
  // 기능 : 현재 사용자 소유 browser push subscription을 조회합니다.
  findBrowserPushSubscriptionForUser(
    input: FindBrowserPushSubscriptionForUserInput
  ): Promise<BrowserPushSubscriptionRecord | null>;
  // 기능 : endpoint hash 기준 browser push subscription을 조회합니다.
  findBrowserPushSubscriptionByEndpointHash(
    endpointHash: string
  ): Promise<BrowserPushSubscriptionRecord | null>;
  // 기능 : 현재 사용자 active browser push subscription 목록을 조회합니다.
  listActiveBrowserPushSubscriptionsForUser(
    userId: string
  ): Promise<BrowserPushSubscriptionRecord[]>;
  // 기능 : 현재 사용자 browser push subscription을 해제 상태로 변경합니다.
  revokeBrowserPushSubscriptionForUser(
    input: RevokeBrowserPushSubscriptionForUserInput
  ): Promise<BrowserPushSubscriptionRecord | null>;
}
