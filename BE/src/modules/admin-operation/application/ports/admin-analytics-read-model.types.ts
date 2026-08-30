// 역할 : AdminAnalyticsRangeRecord Admin analytics 조회 범위 application read model을 정의합니다.
export interface AdminAnalyticsRangeRecord {
  readonly from: string;
  readonly to: string;
  readonly timeZone: string;
}

// 역할 : AdminAnalyticsActivationRecord activation 상태 집계 application read model을 정의합니다.
export interface AdminAnalyticsActivationRecord {
  readonly activatedUsers: number;
  readonly notActivatedUsers: number;
  readonly activationRate: number;
}

// 역할 : AdminAnalyticsRetentionRecord retention cohort 집계 application read model을 정의합니다.
export interface AdminAnalyticsRetentionRecord {
  readonly cohortDate: string;
  readonly dayOffset: number;
  readonly cohortUserCount: number;
  readonly retainedUserCount: number;
  readonly retentionRate: number;
}

// 역할 : AdminAnalyticsEventCountRecord 제품 분석 event count application read model을 정의합니다.
export interface AdminAnalyticsEventCountRecord {
  readonly eventName: string;
  readonly count: number;
}

// 역할 : AdminAnalyticsRouteViewRecord route view count application read model을 정의합니다.
export interface AdminAnalyticsRouteViewRecord {
  readonly routeKey: string;
  readonly viewCount: number;
}

// 역할 : AdminAnalyticsAiUsageRecord AI 사용량과 비용 집계 application read model을 정의합니다.
export interface AdminAnalyticsAiUsageRecord {
  readonly requestCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly estimatedCost: string;
}

// 역할 : AdminAnalyticsMobilePushPermissionResultRecord push permission allowlist bucket application read model을 정의합니다.
export interface AdminAnalyticsMobilePushPermissionResultRecord {
  readonly granted: number;
  readonly denied: number;
  readonly default: number;
  readonly unsupported: number;
  readonly browserPushEnabledTrue: number;
  readonly browserPushEnabledFalse: number;
}

// 역할 : AdminAnalyticsMobileFieldUseRecord 10 mobile field-use event 집계 application read model을 정의합니다.
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

// 역할 : AdminAnalyticsOverviewRecord Admin analytics overview 전체 application read model을 정의합니다.
export interface AdminAnalyticsOverviewRecord {
  readonly range: AdminAnalyticsRangeRecord;
  readonly activation: AdminAnalyticsActivationRecord;
  readonly retention: AdminAnalyticsRetentionRecord[];
  readonly events: AdminAnalyticsEventCountRecord[];
  readonly routes: AdminAnalyticsRouteViewRecord[];
  readonly aiUsage: AdminAnalyticsAiUsageRecord;
  readonly mobileFieldUse: AdminAnalyticsMobileFieldUseRecord;
}
