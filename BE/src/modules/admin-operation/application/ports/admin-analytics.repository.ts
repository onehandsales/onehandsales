import type {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@prisma/client";

export const ADMIN_ANALYTICS_REPOSITORY = Symbol("ADMIN_ANALYTICS_REPOSITORY");

// 역할 : GetAdminAnalyticsOverviewInput Admin analytics overview 조회 조건을 정의합니다.
export interface GetAdminAnalyticsOverviewInput {
  readonly from: Date;
  readonly to: Date;
  readonly timeZone: string;
  readonly countryCode?: string;
  readonly preferredLocale?: string;
}

// 역할 : AdminAnalyticsRangeRecord Admin analytics 조회 범위 응답 record를 정의합니다.
export interface AdminAnalyticsRangeRecord {
  readonly from: string;
  readonly to: string;
  readonly timeZone: string;
}

// 역할 : AdminAnalyticsActivationRecord activation 상태 집계 record를 정의합니다.
export interface AdminAnalyticsActivationRecord {
  readonly activatedUsers: number;
  readonly notActivatedUsers: number;
  readonly activationRate: number;
}

// 역할 : AdminAnalyticsRetentionRecord retention cohort 집계 record를 정의합니다.
export interface AdminAnalyticsRetentionRecord {
  readonly cohortDate: string;
  readonly dayOffset: number;
  readonly cohortUserCount: number;
  readonly retainedUserCount: number;
  readonly retentionRate: number;
}

// 역할 : AdminAnalyticsEventCountRecord 제품 분석 event count record를 정의합니다.
export interface AdminAnalyticsEventCountRecord {
  readonly eventName: string;
  readonly count: number;
}

// 역할 : AdminAnalyticsRouteViewRecord route view count record를 정의합니다.
export interface AdminAnalyticsRouteViewRecord {
  readonly routeKey: string;
  readonly viewCount: number;
}

// 역할 : AdminAnalyticsAiUsageRecord AI 사용량과 비용 집계 record를 정의합니다.
export interface AdminAnalyticsAiUsageRecord {
  readonly requestCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly estimatedCost: string;
}

// 역할 : AdminAnalyticsMobilePushPermissionResultRecord push permission allowlist bucket record를 정의합니다.
export interface AdminAnalyticsMobilePushPermissionResultRecord {
  readonly granted: number;
  readonly denied: number;
  readonly default: number;
  readonly unsupported: number;
  readonly browserPushEnabledTrue: number;
  readonly browserPushEnabledFalse: number;
}

// 역할 : AdminAnalyticsMobileFieldUseRecord 10 mobile field-use event 집계 record를 정의합니다.
export interface AdminAnalyticsMobileFieldUseRecord {
  readonly businessCardCaptureStarted: number;
  readonly businessCardCaptureRetried: number;
  readonly businessCardOcrFailed: number;
  readonly meetingNoteRecordingStarted: number;
  readonly meetingNoteRecordingCompleted: number;
  readonly meetingNoteRecordingFailed: number;
  readonly localDraftSaved: number;
  readonly localDraftRestored: number;
  readonly localDraftDiscarded: number;
  readonly mobilePushPermissionPromptOpened: number;
  readonly mobilePushPermissionResult: AdminAnalyticsMobilePushPermissionResultRecord;
}

// 역할 : AdminAnalyticsOverviewRecord Admin analytics overview 전체 응답 record를 정의합니다.
export interface AdminAnalyticsOverviewRecord {
  readonly range: AdminAnalyticsRangeRecord;
  readonly activation: AdminAnalyticsActivationRecord;
  readonly retention: AdminAnalyticsRetentionRecord[];
  readonly events: AdminAnalyticsEventCountRecord[];
  readonly routes: AdminAnalyticsRouteViewRecord[];
  readonly aiUsage: AdminAnalyticsAiUsageRecord;
  readonly mobileFieldUse: AdminAnalyticsMobileFieldUseRecord;
}

// 역할 : CreateAdminAnalyticsAuditLogInput Admin analytics 조회 감사 로그 입력을 정의합니다.
export interface CreateAdminAnalyticsAuditLogInput {
  readonly adminUserId: string;
  readonly targetUserId: string | null;
  readonly targetType: AdminTargetType;
  readonly targetId: string | null;
  readonly action: AdminAuditAction;
  readonly result: AdminAuditResult;
  readonly requestId: string;
  readonly metadataJson: Record<string, unknown>;
}

// 역할 : AdminAnalyticsRepository Admin analytics read model 영속성 계약을 정의합니다.
export interface AdminAnalyticsRepository {
  // 기능 : 09 ProductAnalyticsEvent를 Admin 운영 요약으로 집계합니다.
  getAnalyticsOverview(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsOverviewRecord>;

  // 기능 : Admin analytics 조회 감사 로그를 append-only로 생성합니다.
  createAuditLog(input: CreateAdminAnalyticsAuditLogInput): Promise<void>;
}
