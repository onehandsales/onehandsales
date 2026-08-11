import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  NotificationDeliveryStatus,
  UserActivationStatus,
  UserRole,
  UserStatus,
} from "./admin-operation.types";

export const ADMIN_USER_REPOSITORY = Symbol("ADMIN_USER_REPOSITORY");

// 역할 : AdminUserListSort Admin 사용자 목록 정렬 값을 정의합니다.
export enum AdminUserListSort {
  CREATED_AT_DESC = "createdAt.desc",
  LAST_LOGIN_AT_DESC = "lastLoginAt.desc",
}

// 역할 : ListAdminUsersInput Admin 사용자 목록 조회 조건을 정의합니다.
export interface ListAdminUsersInput {
  readonly q?: string;
  readonly status?: UserStatus;
  readonly countryCode?: string;
  readonly preferredLocale?: string;
  readonly cursor?: string;
  readonly limit: number;
  readonly sort: AdminUserListSort;
}

// 역할 : AdminUserProfileRecord Admin 사용자 profile 원본 record를 정의합니다.
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

// 역할 : AdminUserListDomainCountsRecord Admin 사용자 목록 domain count 구조를 정의합니다.
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

// 역할 : AdminUserListItemRecord Admin 사용자 목록 item record를 정의합니다.
export interface AdminUserListItemRecord extends AdminUserProfileRecord {
  readonly domainCounts: AdminUserListDomainCountsRecord;
}

// 역할 : AdminUserListPageRecord Admin 사용자 cursor 목록 결과를 정의합니다.
export interface AdminUserListPageRecord {
  readonly items: AdminUserListItemRecord[];
  readonly nextCursor: string | null;
}

// 역할 : AdminUserOverviewDomainCountsRecord Admin 사용자 상세 domain count 구조를 정의합니다.
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

// 역할 : AdminUserTrashSummaryRecord Admin 사용자 Trash count 구조를 정의합니다.
export interface AdminUserTrashSummaryRecord {
  readonly active: number;
  readonly expired: number;
  readonly recoveryRequests: number;
}

// 역할 : AdminUserAnalyticsSummaryRecord Admin 사용자 activation과 AI 사용 summary를 정의합니다.
export interface AdminUserAnalyticsSummaryRecord {
  readonly activationStatus: UserActivationStatus | null;
  readonly activatedAt: Date | null;
  readonly lastActiveEventAt: Date | null;
  readonly aiRequestCount30d: number;
  readonly aiEstimatedCost30d: string;
}

// 역할 : AdminUserNotificationSummaryRecord Admin 사용자 알림 안전 summary를 정의합니다.
export interface AdminUserNotificationSummaryRecord {
  readonly browserPushEnabled: boolean;
  readonly activeBrowserPushSubscriptions: number;
  readonly revokedBrowserPushSubscriptions: number;
  readonly lastBrowserPushDeliveryStatus: NotificationDeliveryStatus | null;
  readonly lastDeliveryFailureSafeErrorCode: string | null;
}

// 역할 : AdminUserOverviewRecord Admin 사용자 상세 overview record를 정의합니다.
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

// 역할 : AdminUserActivityTimelineRecord Admin 사용자 활동 timeline item record를 정의합니다.
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

// 역할 : ListAdminUserActivityTimelineInput Admin 사용자 활동 timeline 조회 조건을 정의합니다.
export interface ListAdminUserActivityTimelineInput {
  readonly userId: string;
  readonly cursor?: string;
  readonly limit: number;
  readonly from?: Date;
  readonly to?: Date;
  readonly eventType?: string;
}

// 역할 : AdminUserActivityTimelinePageRecord Admin 사용자 활동 timeline cursor 결과를 정의합니다.
export interface AdminUserActivityTimelinePageRecord {
  readonly items: AdminUserActivityTimelineRecord[];
  readonly nextCursor: string | null;
}

// 역할 : CreateAdminAuditLogInput Admin 운영 조회 감사 로그 생성 값을 정의합니다.
export interface CreateAdminAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminUserRepository Admin 사용자 overview read model 영속성 계약을 정의합니다.
export interface AdminUserRepository {
  // 기능 : Admin 사용자 목록을 cursor 기반으로 조회합니다.
  listUsers(input: ListAdminUsersInput, now: Date): Promise<AdminUserListPageRecord>;

  // 기능 : Admin 사용자 상세 overview를 조회합니다.
  getUserOverview(
    userId: string,
    now: Date
  ): Promise<AdminUserOverviewRecord | null>;

  // 기능 : Admin 사용자 활동 timeline을 cursor 기반으로 조회합니다.
  listActivityTimeline(
    input: ListAdminUserActivityTimelineInput
  ): Promise<AdminUserActivityTimelinePageRecord>;

  // 기능 : Admin 운영 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminAuditLogInput): Promise<void>;

  // 기능 : Admin 사용자 저장소 작업을 하나의 Prisma transaction에서 실행합니다.
  runInTransaction<T>(
    work: (repository: AdminUserRepository) => Promise<T>
  ): Promise<T>;
}
