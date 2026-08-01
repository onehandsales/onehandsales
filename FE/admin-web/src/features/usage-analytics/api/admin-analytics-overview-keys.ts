import type { AdminAnalyticsOverviewParams } from "../types/admin-analytics-overview";

// 기능 : Admin analytics overview React Query key를 생성합니다.
export const adminAnalyticsOverviewKeys = {
  all: ["admin", "analytics"] as const,
  overview: (params: AdminAnalyticsOverviewParams) =>
    [...adminAnalyticsOverviewKeys.all, "overview", params] as const,
};
