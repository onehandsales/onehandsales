export type AdminAnalyticsOverviewParams = {
  readonly from: string;
  readonly to: string;
  readonly timeZone: string;
};

export type AdminAnalyticsActivationSummary = {
  readonly activatedUsers: number;
  readonly notActivatedUsers: number;
  readonly activationRate: number;
};

export type AdminAnalyticsRetentionRow = {
  readonly cohortDate: string;
  readonly dayOffset: number;
  readonly cohortUserCount: number;
  readonly retainedUserCount: number;
  readonly retentionRate: number;
};

export type AdminAnalyticsEventCount = {
  readonly eventName: string;
  readonly count: number;
};

export type AdminAnalyticsRouteView = {
  readonly routeKey: string;
  readonly viewCount: number;
};

export type AdminAnalyticsAiUsageSummary = {
  readonly requestCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly estimatedCost: string;
};

export type AdminAnalyticsMobilePushPermissionResult = {
  readonly granted: number;
  readonly denied: number;
  readonly default: number;
  readonly unsupported: number;
  readonly browserPushEnabledTrue: number;
  readonly browserPushEnabledFalse: number;
};

export type AdminAnalyticsMobileFieldUseSummary = {
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
  readonly mobilePushPermissionResult: AdminAnalyticsMobilePushPermissionResult;
};

export type AdminAnalyticsOverviewResponse = {
  readonly range: {
    readonly from: string;
    readonly to: string;
    readonly timeZone: string;
  };
  readonly activation: AdminAnalyticsActivationSummary;
  readonly retention: AdminAnalyticsRetentionRow[];
  readonly events: AdminAnalyticsEventCount[];
  readonly routes: AdminAnalyticsRouteView[];
  readonly aiUsage: AdminAnalyticsAiUsageSummary;
  readonly mobileFieldUse: AdminAnalyticsMobileFieldUseSummary;
};
