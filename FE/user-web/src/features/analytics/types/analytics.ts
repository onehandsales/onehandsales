export const PRODUCT_ANALYTICS_EVENT_VERSION = 1;

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
  "trash",
  "more",
] as const;

export type ProductAnalyticsAppRouteKey =
  (typeof PRODUCT_ANALYTICS_APP_ROUTE_KEYS)[number];

export type ProductAnalyticsClientEventName = "app_route_viewed";

export type ProductAnalyticsClientEventContext = {
  readonly occurredAt?: string;
};

export type AppRouteViewedAnalyticsPayload = {
  readonly routeKey: ProductAnalyticsAppRouteKey;
};

export type AppRouteViewedAnalyticsEventInput = {
  readonly eventName: "app_route_viewed";
  readonly eventVersion: typeof PRODUCT_ANALYTICS_EVENT_VERSION;
  readonly payload: AppRouteViewedAnalyticsPayload;
};

export type TrackAnalyticsEventInput = ProductAnalyticsClientEventContext &
  AppRouteViewedAnalyticsEventInput;

export type CollectProductAnalyticsEventResponse = {
  readonly accepted: true;
};

export type TrackAnalyticsEvent = (
  input: TrackAnalyticsEventInput
) => Promise<CollectProductAnalyticsEventResponse>;
