import type { AdminAnalyticsOverviewRecord } from "@/modules/admin-operation/application/ports/admin-analytics-read-model.types";

// 역할 : AdminAnalyticsRangeResponse Admin analytics 조회 범위 응답을 정의합니다.
export interface AdminAnalyticsRangeResponse {
  readonly from: string;
  readonly to: string;
  readonly timeZone: string;
}

// 역할 : AdminAnalyticsActivationResponse activation 상태 집계 응답을 정의합니다.
export interface AdminAnalyticsActivationResponse {
  readonly activatedUsers: number;
  readonly notActivatedUsers: number;
  readonly activationRate: number;
}

// 역할 : AdminAnalyticsRetentionResponse retention cohort 집계 응답을 정의합니다.
export interface AdminAnalyticsRetentionResponse {
  readonly cohortDate: string;
  readonly dayOffset: number;
  readonly cohortUserCount: number;
  readonly retainedUserCount: number;
  readonly retentionRate: number;
}

// 역할 : AdminAnalyticsEventCountResponse 제품 분석 event count 응답을 정의합니다.
export interface AdminAnalyticsEventCountResponse {
  readonly eventName: string;
  readonly count: number;
}

// 역할 : AdminAnalyticsRouteViewResponse route view count 응답을 정의합니다.
export interface AdminAnalyticsRouteViewResponse {
  readonly routeKey: string;
  readonly viewCount: number;
}

// 역할 : AdminAnalyticsAiUsageResponse AI 사용량과 비용 집계 응답을 정의합니다.
export interface AdminAnalyticsAiUsageResponse {
  readonly requestCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly estimatedCost: string;
}

// 역할 : AdminAnalyticsMobileFieldUseResponse 10 mobile field-use event 집계 응답을 정의합니다.
export interface AdminAnalyticsMobileFieldUseResponse {
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
  readonly mobilePushPermissionResult: {
    readonly granted: number;
    readonly denied: number;
    readonly default: number;
    readonly unsupported: number;
    readonly browserPushEnabledTrue: number;
    readonly browserPushEnabledFalse: number;
  };
}

// 역할 : AdminAnalyticsOverviewResponse Admin analytics overview API 응답을 정의합니다.
export interface AdminAnalyticsOverviewResponse {
  readonly range: AdminAnalyticsRangeResponse;
  readonly activation: AdminAnalyticsActivationResponse;
  readonly retention: AdminAnalyticsRetentionResponse[];
  readonly events: AdminAnalyticsEventCountResponse[];
  readonly routes: AdminAnalyticsRouteViewResponse[];
  readonly aiUsage: AdminAnalyticsAiUsageResponse;
  readonly mobileFieldUse: AdminAnalyticsMobileFieldUseResponse;
}

// 기능 : Admin analytics overview record를 raw payload 없는 API 응답으로 변환합니다.
export function toAdminAnalyticsOverviewResponse(
  overview: AdminAnalyticsOverviewRecord
): AdminAnalyticsOverviewResponse {
  return {
    range: overview.range,
    activation: overview.activation,
    retention: overview.retention,
    events: overview.events,
    routes: overview.routes,
    aiUsage: overview.aiUsage,
    mobileFieldUse: overview.mobileFieldUse,
  };
}
