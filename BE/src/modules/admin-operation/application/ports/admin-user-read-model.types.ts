import type {
  NotificationDeliveryStatus,
  UserActivationStatus,
  UserRole,
  UserStatus,
} from "./admin-operation.types";

// 역할 : AdminUserProfileRecord Admin 사용자 profile application read model을 정의합니다.
export interface AdminUserProfileRecord {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly preferredLocale: string;
  readonly timeZone: string;
  readonly countryCode: string;
  readonly defaultCurrencyCode: string;
  readonly createdAt: Date;
  readonly lastLoginAt: Date | null;
}

// 역할 : AdminUserListDomainCountsRecord Admin 사용자 목록 domain count application read model을 정의합니다.
export interface AdminUserListDomainCountsRecord {
  readonly companies: number;
  readonly contacts: number;
  readonly products: number;
  readonly deals: number;
  readonly schedules: number;
  readonly meetingNotes: number;
  readonly trashActive: number;
  readonly trashExpired: number;
}

// 역할 : AdminUserListItemRecord Admin 사용자 목록 item application read model을 정의합니다.
export interface AdminUserListItemRecord extends AdminUserProfileRecord {
  readonly domainCounts: AdminUserListDomainCountsRecord;
}

// 역할 : AdminUserListPageRecord Admin 사용자 cursor 목록 application page를 정의합니다.
export interface AdminUserListPageRecord {
  readonly items: AdminUserListItemRecord[];
  readonly nextCursor: string | null;
}

// 역할 : AdminUserOverviewDomainCountsRecord Admin 사용자 상세 domain count application read model을 정의합니다.
export interface AdminUserOverviewDomainCountsRecord {
  readonly companies: number;
  readonly contacts: number;
  readonly products: number;
  readonly deals: number;
  readonly schedules: number;
  readonly meetingNotes: number;
  readonly businessCardScans: number;
  readonly imports: number;
  readonly exports: number;
}

// 역할 : AdminUserTrashSummaryRecord Admin 사용자 Trash count application read model을 정의합니다.
export interface AdminUserTrashSummaryRecord {
  readonly active: number;
  readonly expired: number;
  readonly recoveryRequests: number;
}

// 역할 : AdminUserAnalyticsSummaryRecord Admin 사용자 activation과 AI 사용 application summary를 정의합니다.
export interface AdminUserAnalyticsSummaryRecord {
  readonly activationStatus: UserActivationStatus | null;
  readonly activatedAt: Date | null;
  readonly lastActiveEventAt: Date | null;
  readonly aiRequestCount30d: number;
  readonly aiEstimatedCost30d: string;
}

// 역할 : AdminUserNotificationSummaryRecord Admin 사용자 알림 안전 application summary를 정의합니다.
export interface AdminUserNotificationSummaryRecord {
  readonly browserPushEnabled: boolean;
  readonly activeBrowserPushSubscriptions: number;
  readonly revokedBrowserPushSubscriptions: number;
  readonly lastBrowserPushDeliveryStatus: NotificationDeliveryStatus | null;
  readonly lastDeliveryFailureSafeErrorCode: string | null;
}

// 역할 : AdminUserOverviewRecord Admin 사용자 상세 overview application read model을 정의합니다.
export interface AdminUserOverviewRecord {
  readonly id: string;
  readonly profile: AdminUserProfileRecord;
  readonly domainCounts: AdminUserOverviewDomainCountsRecord;
  readonly trashSummary: AdminUserTrashSummaryRecord;
  readonly analyticsSummary: AdminUserAnalyticsSummaryRecord;
  readonly notificationSummary: AdminUserNotificationSummaryRecord;
}

// 역할 : AdminUserActivityTimelineSource Admin 사용자 활동 timeline 출처를 정의합니다.
export type AdminUserActivityTimelineSource =
  | "PRODUCT_ANALYTICS_EVENT"
  | "DOMAIN_RECORD";

// 역할 : AdminUserActivityTimelineRecord Admin 사용자 활동 timeline item application read model을 정의합니다.
export interface AdminUserActivityTimelineRecord {
  readonly id: string;
  readonly eventType: string;
  readonly source: AdminUserActivityTimelineSource;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly summary: string;
  readonly occurredAt: Date;
}

// 역할 : AdminUserActivityTimelinePageRecord Admin 사용자 활동 timeline cursor application page를 정의합니다.
export interface AdminUserActivityTimelinePageRecord {
  readonly items: AdminUserActivityTimelineRecord[];
  readonly nextCursor: string | null;
}
