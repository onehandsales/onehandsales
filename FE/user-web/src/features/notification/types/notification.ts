export type NotificationType =
  | "SCHEDULE_START_REMINDER"
  | "DEAL_DUE_REMINDER";

export type NotificationStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "CANCELED";

export type NotificationSourceType = "SCHEDULE" | "DEAL";

export type NotificationReadFilter = "ALL" | "READ" | "UNREAD";

export type BrowserPushSubscriptionStatus = "ACTIVE" | "REVOKED";

export type NotificationItem = {
  readonly id: string;
  readonly type: NotificationType;
  readonly status: NotificationStatus;
  readonly sourceType: NotificationSourceType;
  readonly sourceId: string;
  readonly targetPath: string;
  readonly title: string;
  readonly body: string | null;
  readonly targetLabel: string | null;
  readonly scheduledAt: string;
  readonly sentAt: string | null;
  readonly readAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationListResponse = {
  readonly items: NotificationItem[];
  readonly unreadCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
};

export type NotificationUnreadCountResponse = {
  readonly unreadCount: number;
};

export type UserNotificationSetting = {
  readonly scheduleReminderEnabled: boolean;
  readonly dealDueReminderEnabled: boolean;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
  readonly scheduleReminderMinutes: number;
  readonly dealDueReminderDaysBefore: number;
  readonly dealDueReminderLocalTime: string;
};

export type UpdateNotificationSettingsInput = {
  readonly scheduleReminderEnabled?: boolean;
  readonly dealDueReminderEnabled?: boolean;
  readonly emailNotificationEnabled?: boolean;
  readonly browserPushEnabled?: boolean;
};

export type BrowserPushPublicKeyResponse = {
  readonly publicKey: string;
};

export type BrowserPushSubscriptionResponse = {
  readonly id: string;
  readonly status: BrowserPushSubscriptionStatus;
  readonly deviceLabel: string | null;
  readonly createdAt: string;
  readonly revokedAt: string | null;
};

export type CreateBrowserPushSubscriptionInput = {
  readonly endpoint: string;
  readonly keys: {
    readonly p256dh: string;
    readonly auth: string;
  };
  readonly userAgent?: string;
  readonly deviceLabel?: string;
};

export type ListNotificationsInput = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly read?: NotificationReadFilter;
  readonly includeUpcoming?: boolean;
};
