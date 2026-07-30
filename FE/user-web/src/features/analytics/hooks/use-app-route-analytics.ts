import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  PRODUCT_ANALYTICS_EVENT_VERSION,
  type ProductAnalyticsAppRouteKey,
  type TrackAnalyticsEvent,
} from "@/features/analytics/types/analytics";
import { trackAnalyticsEvent } from "@/features/analytics/api/analytics-api";
import { resolveProductAnalyticsRouteKey } from "@/features/analytics/utils/analytics-route-key";
import { env } from "@/lib/env";

type UseAppRouteAnalyticsOptions = {
  readonly enabled?: boolean;
  readonly trackEvent?: TrackAnalyticsEvent;
};

// 기능 : 보호된 앱 route 변경을 제품 분석 이벤트로 전송합니다.
export function useAppRouteAnalytics(
  options: UseAppRouteAnalyticsOptions = {}
) {
  const { pathname } = useLocation();
  const previousRouteKeyRef = useRef<ProductAnalyticsAppRouteKey | null>(null);
  const enabled = options.enabled ?? env.productAnalyticsEnabled;
  const trackEvent = options.trackEvent ?? trackAnalyticsEvent;

  useEffect(() => {
    if (!enabled) {
      previousRouteKeyRef.current = null;
      return;
    }

    const routeKey = resolveProductAnalyticsRouteKey(pathname);

    if (routeKey === previousRouteKeyRef.current) {
      return;
    }

    previousRouteKeyRef.current = routeKey;

    if (routeKey === null) {
      return;
    }

    void trackEvent({
      eventName: "app_route_viewed",
      eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
      payload: {
        routeKey,
      },
    }).catch(() => {
      // 기능 : 분석 수집 실패는 사용자 화면과 route 전환을 막지 않습니다.
    });
  }, [enabled, pathname, trackEvent]);
}
