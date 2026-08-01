import type {
  AdminAnalyticsActivationRecord,
  AdminAnalyticsAiUsageRecord,
  AdminAnalyticsEventCountRecord,
  AdminAnalyticsMobileFieldUseRecord,
  AdminAnalyticsOverviewRecord,
  AdminAnalyticsRangeRecord,
  AdminAnalyticsRetentionRecord,
  AdminAnalyticsRouteViewRecord,
} from "@/modules/admin-operation/application/ports/admin-analytics.repository";

// 역할 : AdminAnalyticsRangeResponse Admin analytics 조회 범위 응답을 정의합니다.
export interface AdminAnalyticsRangeResponse extends AdminAnalyticsRangeRecord {}

// 역할 : AdminAnalyticsActivationResponse activation 상태 집계 응답을 정의합니다.
export interface AdminAnalyticsActivationResponse
  extends AdminAnalyticsActivationRecord {}

// 역할 : AdminAnalyticsRetentionResponse retention cohort 집계 응답을 정의합니다.
export interface AdminAnalyticsRetentionResponse
  extends AdminAnalyticsRetentionRecord {}

// 역할 : AdminAnalyticsEventCountResponse 제품 분석 event count 응답을 정의합니다.
export interface AdminAnalyticsEventCountResponse
  extends AdminAnalyticsEventCountRecord {}

// 역할 : AdminAnalyticsRouteViewResponse route view count 응답을 정의합니다.
export interface AdminAnalyticsRouteViewResponse
  extends AdminAnalyticsRouteViewRecord {}

// 역할 : AdminAnalyticsAiUsageResponse AI 사용량과 비용 집계 응답을 정의합니다.
export interface AdminAnalyticsAiUsageResponse
  extends AdminAnalyticsAiUsageRecord {}

// 역할 : AdminAnalyticsMobileFieldUseResponse 10 mobile field-use event 집계 응답을 정의합니다.
export interface AdminAnalyticsMobileFieldUseResponse
  extends AdminAnalyticsMobileFieldUseRecord {}

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
