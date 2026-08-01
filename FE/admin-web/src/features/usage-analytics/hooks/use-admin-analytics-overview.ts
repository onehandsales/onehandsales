import { useQuery } from "@tanstack/react-query";
import { getAdminAnalyticsOverview } from "../api/admin-analytics-overview-api";
import { adminAnalyticsOverviewKeys } from "../api/admin-analytics-overview-keys";
import type { AdminAnalyticsOverviewParams } from "../types/admin-analytics-overview";

// 기능 : Admin analytics overview query를 실행합니다.
export function useAdminAnalyticsOverview(
  params: AdminAnalyticsOverviewParams
) {
  return useQuery({
    queryKey: adminAnalyticsOverviewKeys.overview(params),
    queryFn: () => getAdminAnalyticsOverview(params),
  });
}
