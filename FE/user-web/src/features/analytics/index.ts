// 기능 : analytics feature의 public import 경계를 제공합니다.
export { trackAnalyticsEvent } from "./api/analytics-api";
export { useAppRouteAnalytics } from "./hooks/use-app-route-analytics";
export {
  type BusinessCardCaptureAnalyticsEventInput,
  PRODUCT_ANALYTICS_APP_ROUTE_KEYS,
  PRODUCT_ANALYTICS_EVENT_VERSION,
  type CollectProductAnalyticsEventResponse,
  type LocalDraftAnalyticsEventInput,
  type MeetingNoteRecordingAnalyticsEventInput,
  type MobileFieldAnalyticsClientEventName,
  type MobileFieldAnalyticsEventInput,
  type MobilePushPermissionAnalyticsEventInput,
  type ProductAnalyticsAppRouteKey,
  type ProductAnalyticsClientEventName,
  type ProductAnalyticsClientEventContext,
  type ProductAnalyticsClientTargetType,
  type TrackAnalyticsEvent,
  type TrackAnalyticsEventInput,
} from "./types/analytics";
export { resolveProductAnalyticsRouteKey } from "./utils/analytics-route-key";
export { trackMobileFieldAnalyticsEvent } from "./utils/mobile-field-analytics";
