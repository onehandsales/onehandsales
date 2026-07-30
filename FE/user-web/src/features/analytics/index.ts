// 기능 : analytics feature의 public import 경계를 제공합니다.
export { trackAnalyticsEvent } from "./api/analytics-api";
export { useAppRouteAnalytics } from "./hooks/use-app-route-analytics";
export {
  PRODUCT_ANALYTICS_APP_ROUTE_KEYS,
  PRODUCT_ANALYTICS_EVENT_VERSION,
  type CollectProductAnalyticsEventResponse,
  type ProductAnalyticsAppRouteKey,
  type TrackAnalyticsEvent,
  type TrackAnalyticsEventInput,
} from "./types/analytics";
export { resolveProductAnalyticsRouteKey } from "./utils/analytics-route-key";
