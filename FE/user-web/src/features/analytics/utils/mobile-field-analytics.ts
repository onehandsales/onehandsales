import { trackAnalyticsEvent } from "@/features/analytics/api/analytics-api";
import type {
  MobileFieldAnalyticsEventInput,
  TrackAnalyticsEvent,
} from "@/features/analytics/types/analytics";
import { env } from "@/lib/env";

type TrackMobileFieldAnalyticsEventOptions = {
  readonly enabled?: boolean;
  readonly trackEvent?: TrackAnalyticsEvent;
};

// 기능 : 모바일 현장 이벤트를 09 Product Analytics collector로 fire-and-forget 전송합니다.
export function trackMobileFieldAnalyticsEvent(
  event: MobileFieldAnalyticsEventInput,
  options: TrackMobileFieldAnalyticsEventOptions = {}
) {
  const enabled = options.enabled ?? env.productAnalyticsEnabled;

  if (!enabled) {
    return;
  }

  const trackEvent = options.trackEvent ?? trackAnalyticsEvent;

  void trackEvent(event).catch(() => {
    // 기능 : 분석 전송 실패는 촬영, 녹음, draft, 권한 UX를 막지 않습니다.
  });
}
