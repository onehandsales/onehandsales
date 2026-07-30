import { apiClient } from "@/lib/api-client";
import type {
  CollectProductAnalyticsEventResponse,
  TrackAnalyticsEvent,
  TrackAnalyticsEventInput,
} from "@/features/analytics/types/analytics";

// 기능 : 제품 분석 이벤트를 Backend collector API로 전송합니다.
export const trackAnalyticsEvent: TrackAnalyticsEvent = (
  input: TrackAnalyticsEventInput
) => {
  return apiClient<CollectProductAnalyticsEventResponse>(
    "/api/analytics/events",
    {
      body: input,
      method: "POST",
    }
  );
};
