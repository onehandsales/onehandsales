// 역할 : AdminUserStatus Admin 사용자 상태 값을 정의합니다.
export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

// 역할 : AdminUserRole Admin 사용자 역할 값을 정의합니다.
export type AdminUserRole = "USER" | "ADMIN";

// 역할 : AdminUserListSort Admin 사용자 목록 정렬 값을 정의합니다.
export type AdminUserListSort = "createdAt.desc" | "lastLoginAt.desc";

// 역할 : AdminUserListParams Admin 사용자 목록 조회 params를 정의합니다.
export type AdminUserListParams = {
  readonly q?: string;
  readonly status?: AdminUserStatus;
  readonly countryCode?: string;
  readonly preferredLocale?: string;
  readonly cursor?: string;
  readonly limit?: number;
  readonly sort?: AdminUserListSort;
};

// 역할 : AdminUserProfile Admin 사용자 profile 응답을 정의합니다.
export type AdminUserProfile = {
  readonly emailMasked: string | null;
  readonly displayNameMasked: string | null;
  readonly role: AdminUserRole;
  readonly status: AdminUserStatus;
  readonly preferredLocale: string;
  readonly timeZone: string;
  readonly countryCode: string;
  readonly defaultCurrencyCode: string;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
};

// 역할 : AdminUserListDomainCounts Admin 사용자 목록 domain count 응답을 정의합니다.
export type AdminUserListDomainCounts = {
  readonly companies: number;
  readonly contacts: number;
  readonly products: number;
  readonly deals: number;
  readonly schedules: number;
  readonly meetingNotes: number;
  readonly trashActive: number;
  readonly trashExpired: number;
};

// 역할 : AdminUserListItem Admin 사용자 목록 item 응답을 정의합니다.
export type AdminUserListItem = AdminUserProfile & {
  readonly id: string;
  readonly domainCounts: AdminUserListDomainCounts;
};

// 역할 : AdminUserListResponse Admin 사용자 목록 응답을 정의합니다.
export type AdminUserListResponse = {
  readonly items: AdminUserListItem[];
  readonly nextCursor: string | null;
};

// 역할 : AdminUserOverviewDomainCounts Admin 사용자 상세 domain count 응답을 정의합니다.
export type AdminUserOverviewDomainCounts = {
  readonly companies: number;
  readonly contacts: number;
  readonly products: number;
  readonly deals: number;
  readonly schedules: number;
  readonly meetingNotes: number;
  readonly businessCardScans: number;
  readonly imports: number;
  readonly exports: number;
};

// 역할 : AdminUserTrashSummary Admin 사용자 Trash summary 응답을 정의합니다.
export type AdminUserTrashSummary = {
  readonly active: number;
  readonly expired: number;
  readonly recoveryRequests: number;
};

// 역할 : AdminUserAnalyticsSummary Admin 사용자 analytics summary 응답을 정의합니다.
export type AdminUserAnalyticsSummary = {
  readonly activationStatus: "NOT_ACTIVATED" | "ACTIVATED" | null;
  readonly activatedAt: string | null;
  readonly lastActiveEventAt: string | null;
  readonly aiRequestCount30d: number;
  readonly aiEstimatedCost30d: string;
};

// 역할 : AdminUserNotificationSummary Admin 사용자 notification summary 응답을 정의합니다.
export type AdminUserNotificationSummary = {
  readonly browserPushEnabled: boolean;
  readonly activeBrowserPushSubscriptions: number;
  readonly revokedBrowserPushSubscriptions: number;
  readonly lastBrowserPushDeliveryStatus:
    | "PENDING"
    | "SENT"
    | "FAILED"
    | "CANCELED"
    | null;
  readonly lastDeliveryFailureSafeErrorCode: string | null;
};

// 역할 : AdminUserOverviewResponse Admin 사용자 상세 overview 응답을 정의합니다.
export type AdminUserOverviewResponse = {
  readonly id: string;
  readonly profile: AdminUserProfile;
  readonly domainCounts: AdminUserOverviewDomainCounts;
  readonly trashSummary: AdminUserTrashSummary;
  readonly analyticsSummary: AdminUserAnalyticsSummary;
  readonly notificationSummary: AdminUserNotificationSummary;
};

// 역할 : AdminUserActivityTimelineParams Admin 사용자 활동 timeline 조회 params를 정의합니다.
export type AdminUserActivityTimelineParams = {
  readonly cursor?: string;
  readonly limit?: number;
  readonly from?: string;
  readonly to?: string;
  readonly eventType?: string;
};

// 역할 : AdminUserActivityTimelineItem Admin 사용자 활동 timeline item 응답을 정의합니다.
export type AdminUserActivityTimelineItem = {
  readonly id: string;
  readonly eventType: string;
  readonly source: "PRODUCT_ANALYTICS_EVENT" | "DOMAIN_RECORD";
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly summary: string;
  readonly occurredAt: string;
};

// 역할 : AdminUserActivityTimelineResponse Admin 사용자 활동 timeline 응답을 정의합니다.
export type AdminUserActivityTimelineResponse = {
  readonly items: AdminUserActivityTimelineItem[];
  readonly nextCursor: string | null;
};

// 역할 : AdminDomainRecordDomain Admin 사용자 도메인 탭 값을 정의합니다.
export type AdminDomainRecordDomain =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "BUSINESS_CARD_SCAN"
  | "IMPORT_JOB";

// 역할 : AdminDomainRecordSort Admin 사용자 도메인 탭 정렬 값을 정의합니다.
export type AdminDomainRecordSort =
  | "createdAt.desc"
  | "updatedAt.desc"
  | "deletedAt.desc";

// 역할 : AdminDomainRecordsParams Admin 사용자 도메인 목록 조회 params를 정의합니다.
export type AdminDomainRecordsParams = {
  readonly domain: AdminDomainRecordDomain;
  readonly q?: string;
  readonly includeDeleted?: boolean;
  readonly cursor?: string;
  readonly limit?: number;
  readonly sort?: AdminDomainRecordSort;
};

// 역할 : AdminDomainRecordSummary Admin 사용자 도메인 row summary 응답을 정의합니다.
export type AdminDomainRecordSummary = Record<
  string,
  string | number | boolean | null
>;

// 역할 : AdminDomainRecordSensitiveFlags Admin 사용자 도메인 민감 필드 flag 응답을 정의합니다.
export type AdminDomainRecordSensitiveFlags = Record<string, boolean>;

// 역할 : AdminDomainRecordItem Admin 사용자 도메인 read-only row 응답을 정의합니다.
export type AdminDomainRecordItem = {
  readonly id: string;
  readonly displayTitle: string;
  readonly status: "ACTIVE" | "DELETED";
  readonly summary: AdminDomainRecordSummary;
  readonly sensitiveFlags: AdminDomainRecordSensitiveFlags;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly trashExpiresAt: string | null;
};

// 역할 : AdminDomainRecordsResponse Admin 사용자 도메인 목록 응답을 정의합니다.
export type AdminDomainRecordsResponse = {
  readonly domain: AdminDomainRecordDomain;
  readonly items: AdminDomainRecordItem[];
  readonly nextCursor: string | null;
};
