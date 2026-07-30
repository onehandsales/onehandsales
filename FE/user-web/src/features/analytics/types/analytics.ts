// 기능 : User Web client 분석 이벤트 payload schema 버전을 고정합니다.
export const PRODUCT_ANALYTICS_EVENT_VERSION = 1;

// 기능 : Backend 제품 분석 routeKey allowlist와 같은 값을 Frontend에 고정합니다.
export const PRODUCT_ANALYTICS_APP_ROUTE_KEYS = [
  "home",
  "companies",
  "company_create",
  "company_detail",
  "contacts",
  "contact_create",
  "contact_detail",
  "products",
  "product_create",
  "product_detail",
  "deals",
  "deal_create",
  "deal_detail",
  "schedules",
  "schedule_week",
  "schedule_detail",
  "meeting_notes",
  "meeting_note_create",
  "meeting_note_detail",
  "business_cards",
  "notifications",
  "import",
  "import_review",
  "import_detail",
  "trash",
  "settings",
  "more",
] as const;

export type ProductAnalyticsAppRouteKey =
  (typeof PRODUCT_ANALYTICS_APP_ROUTE_KEYS)[number];

export type ProductAnalyticsClientEventName = "app_route_viewed";

export type AppRouteViewedAnalyticsPayload = {
  readonly routeKey: ProductAnalyticsAppRouteKey;
};

export type TrackAnalyticsEventInput = {
  readonly eventName: ProductAnalyticsClientEventName;
  readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
  readonly payload: AppRouteViewedAnalyticsPayload;
};

export type CollectProductAnalyticsEventResponse = {
  readonly accepted: true;
};

export type TrackAnalyticsEvent = (
  input: TrackAnalyticsEventInput
) => Promise<CollectProductAnalyticsEventResponse>;
