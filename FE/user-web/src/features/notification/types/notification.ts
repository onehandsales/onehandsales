export type NotificationType =
  | "SCHEDULE_REMINDER"
  | "DEAL_DUE_REMINDER"
  | "NEXT_ACTION_REMINDER"
  | "MEETING_NOTE_GENERATED"
  | "TRASH_PERMANENT_DELETE_WARNING";

export type NotificationChannel = "EMAIL" | "BROWSER_PUSH";

export type NotificationStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "READ"
  | "CANCELED";

export type NotificationReadFilter = "ALL" | "READ" | "UNREAD";

export type BrowserPushSubscriptionStatus = "ACTIVE" | "REVOKED";

export type NotificationItem = {
  readonly id: string;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly content: string | null;
  readonly scheduledAt: string;
  readonly sentAt: string | null;
  readonly readAt: string | null;
  readonly status: NotificationStatus;
  readonly metadata: unknown;
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

export type UserNotificationSetting = {
  readonly defaultReminderMinutes: number;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
};

export type UpdateNotificationSettingsInput = {
  readonly defaultReminderMinutes?: number;
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
  readonly status?: NotificationReadFilter;
};
