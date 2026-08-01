import type {
  AdminUserActivityTimelinePageRecord,
  AdminUserActivityTimelineRecord,
  AdminUserAnalyticsSummaryRecord,
  AdminUserListDomainCountsRecord,
  AdminUserListItemRecord,
  AdminUserListPageRecord,
  AdminUserNotificationSummaryRecord,
  AdminUserOverviewDomainCountsRecord,
  AdminUserOverviewRecord,
  AdminUserProfileRecord,
  AdminUserTrashSummaryRecord,
} from "@/modules/admin-operation/application/ports/admin-user.repository";
import { maskDisplayName, maskEmail } from "./admin-redaction.mapper";

// 역할 : AdminUserProfileResponse Admin 사용자 profile 응답을 정의합니다.
export interface AdminUserProfileResponse {
  readonly emailMasked: string | null;
  readonly displayNameMasked: string | null;
  readonly role: string;
  readonly status: string;
  readonly preferredLocale: string;
  readonly timeZone: string;
  readonly countryCode: string;
  readonly defaultCurrencyCode: string;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
}

// 역할 : AdminUserListResponse Admin 사용자 목록 API 응답을 정의합니다.
export interface AdminUserListResponse {
  readonly items: AdminUserListItemResponse[];
  readonly nextCursor: string | null;
}

// 역할 : AdminUserListItemResponse Admin 사용자 목록 item 응답을 정의합니다.
export interface AdminUserListItemResponse extends AdminUserProfileResponse {
  readonly id: string;
  readonly domainCounts: AdminUserListDomainCountsRecord;
}

// 역할 : AdminUserOverviewResponse Admin 사용자 상세 overview API 응답을 정의합니다.
export interface AdminUserOverviewResponse {
  readonly id: string;
  readonly profile: AdminUserProfileResponse;
  readonly domainCounts: AdminUserOverviewDomainCountsRecord;
  readonly trashSummary: AdminUserTrashSummaryRecord;
  readonly analyticsSummary: AdminUserAnalyticsSummaryResponse;
  readonly notificationSummary: AdminUserNotificationSummaryResponse;
}

// 역할 : AdminUserAnalyticsSummaryResponse Admin 사용자 analytics summary 응답을 정의합니다.
export interface AdminUserAnalyticsSummaryResponse {
  readonly activationStatus: string | null;
  readonly activatedAt: string | null;
  readonly lastActiveEventAt: string | null;
  readonly aiRequestCount30d: number;
  readonly aiEstimatedCost30d: string;
}

// 역할 : AdminUserNotificationSummaryResponse Admin 사용자 notification summary 응답을 정의합니다.
export interface AdminUserNotificationSummaryResponse {
  readonly browserPushEnabled: boolean;
  readonly activeBrowserPushSubscriptions: number;
  readonly revokedBrowserPushSubscriptions: number;
  readonly lastBrowserPushDeliveryStatus: string | null;
  readonly lastDeliveryFailureSafeErrorCode: string | null;
}

// 역할 : AdminUserActivityTimelineResponse Admin 사용자 활동 timeline API 응답을 정의합니다.
export interface AdminUserActivityTimelineResponse {
  readonly items: AdminUserActivityTimelineItemResponse[];
  readonly nextCursor: string | null;
}

// 역할 : AdminUserActivityTimelineItemResponse Admin 사용자 활동 timeline item 응답을 정의합니다.
export interface AdminUserActivityTimelineItemResponse {
  readonly id: string;
  readonly eventType: string;
  readonly source: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly title: string;
  readonly summary: string;
  readonly occurredAt: string;
}

// 기능 : Admin 사용자 목록 page record를 API 응답으로 변환합니다.
export function toAdminUserListResponse(
  page: AdminUserListPageRecord
): AdminUserListResponse {
  return {
    items: page.items.map((item) => toAdminUserListItemResponse(item)),
    nextCursor: page.nextCursor,
  };
}

// 기능 : Admin 사용자 상세 overview record를 API 응답으로 변환합니다.
export function toAdminUserOverviewResponse(
  overview: AdminUserOverviewRecord
): AdminUserOverviewResponse {
  return {
    id: overview.id,
    profile: toAdminUserProfileResponse(overview.profile),
    domainCounts: overview.domainCounts,
    trashSummary: overview.trashSummary,
    analyticsSummary: toAnalyticsSummaryResponse(overview.analyticsSummary),
    notificationSummary: toNotificationSummaryResponse(
      overview.notificationSummary
    ),
  };
}

// 기능 : Admin 사용자 활동 timeline page record를 API 응답으로 변환합니다.
export function toAdminUserActivityTimelineResponse(
  page: AdminUserActivityTimelinePageRecord
): AdminUserActivityTimelineResponse {
  return {
    items: page.items.map((item) => toTimelineItemResponse(item)),
    nextCursor: page.nextCursor,
  };
}

// 기능 : 사용자 목록 item record를 masking 응답으로 변환합니다.
function toAdminUserListItemResponse(
  item: AdminUserListItemRecord
): AdminUserListItemResponse {
  return {
    id: item.id,
    ...toAdminUserProfileResponse(item),
    domainCounts: item.domainCounts,
  };
}

// 기능 : 사용자 profile record에서 email/displayName 원문을 제거한 응답을 만듭니다.
function toAdminUserProfileResponse(
  profile: AdminUserProfileRecord
): AdminUserProfileResponse {
  return {
    emailMasked: maskEmail(profile.email),
    displayNameMasked: maskDisplayName(profile.displayName),
    role: profile.role,
    status: profile.status,
    preferredLocale: profile.preferredLocale,
    timeZone: profile.timeZone,
    countryCode: profile.countryCode,
    defaultCurrencyCode: profile.defaultCurrencyCode,
    createdAt: profile.createdAt.toISOString(),
    lastLoginAt: profile.lastLoginAt?.toISOString() ?? null,
  };
}

// 기능 : analytics summary record를 ISO 문자열 응답으로 변환합니다.
function toAnalyticsSummaryResponse(
  summary: AdminUserAnalyticsSummaryRecord
): AdminUserAnalyticsSummaryResponse {
  return {
    activationStatus: summary.activationStatus,
    activatedAt: summary.activatedAt?.toISOString() ?? null,
    lastActiveEventAt: summary.lastActiveEventAt?.toISOString() ?? null,
    aiRequestCount30d: summary.aiRequestCount30d,
    aiEstimatedCost30d: summary.aiEstimatedCost30d,
  };
}

// 기능 : notification summary record를 안전한 응답 형태로 변환합니다.
function toNotificationSummaryResponse(
  summary: AdminUserNotificationSummaryRecord
): AdminUserNotificationSummaryResponse {
  return {
    browserPushEnabled: summary.browserPushEnabled,
    activeBrowserPushSubscriptions: summary.activeBrowserPushSubscriptions,
    revokedBrowserPushSubscriptions: summary.revokedBrowserPushSubscriptions,
    lastBrowserPushDeliveryStatus: summary.lastBrowserPushDeliveryStatus,
    lastDeliveryFailureSafeErrorCode: summary.lastDeliveryFailureSafeErrorCode,
  };
}

// 기능 : timeline record를 ISO 문자열 응답으로 변환합니다.
function toTimelineItemResponse(
  item: AdminUserActivityTimelineRecord
): AdminUserActivityTimelineItemResponse {
  return {
    id: item.id,
    eventType: item.eventType,
    source: item.source,
    targetType: item.targetType,
    targetId: item.targetId,
    title: item.title,
    summary: item.summary,
    occurredAt: item.occurredAt.toISOString(),
  };
}
