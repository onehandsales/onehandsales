import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminAnalyticsOverviewParams,
  AdminAnalyticsOverviewResponse,
} from "../types/admin-analytics-overview";

// 기능 : Admin analytics overview API를 호출합니다.
export function getAdminAnalyticsOverview(
  params: AdminAnalyticsOverviewParams
): Promise<AdminAnalyticsOverviewResponse> {
  const queryString = toQueryString(params);

  return adminApiClient<AdminAnalyticsOverviewResponse>(
    `/analytics/overview?${queryString}`
  );
}

// 기능 : analytics overview params를 query string으로 변환합니다.
function toQueryString(params: AdminAnalyticsOverviewParams): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== "") {
      searchParams.set(key, value);
    }
  }

  return searchParams.toString();
}
