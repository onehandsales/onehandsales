import {
  isProductAnalyticsAppRouteKey,
  isProductAnalyticsReservedBillingEventName,
  isProductAnalyticsRouteViewSurface,
  isProductAnalyticsRuntimeEventName,
  isProductAnalyticsServerEventName,
  PRODUCT_ANALYTICS_ACTIVE_RETENTION_EVENT_NAMES,
  PRODUCT_ANALYTICS_APP_ROUTE_KEYS,
  PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES,
  PRODUCT_ANALYTICS_ROUTE_VIEW_SURFACES,
  PRODUCT_ANALYTICS_RUNTIME_EVENT_NAMES,
  PRODUCT_ANALYTICS_SERVER_EVENT_NAMES,
  requiresProductAnalyticsIdempotencyKey,
} from "./product-analytics-event-taxonomy";

// 기능 : 09 문서에 확정된 runtime 이벤트 이름을 테스트 기준으로 고정합니다.
const EXPECTED_RUNTIME_EVENT_NAMES = [
  "app_route_viewed",
  "auth_signup_completed",
  "deal_created",
  "deal_next_action_created",
  "schedule_created",
  "schedule_deal_linked",
  "meeting_note_created",
  "meeting_note_deal_linked",
  "business_card_scan_confirmed",
  "business_card_ocr_failed",
  "import_confirmed",
  "export_downloaded",
] as const;

// 기능 : 12 Billing으로 넘긴 reserved 이벤트 이름을 테스트 기준으로 고정합니다.
const EXPECTED_RESERVED_BILLING_EVENT_NAMES = [
  "paywall_viewed",
  "upgrade_clicked",
  "trial_started",
  "coupon_applied",
  "referral_invited",
  "subscription_started",
  "subscription_canceled",
  "churn_survey_submitted",
] as const;

// 기능 : User Web core /app route view allowlist를 테스트 기준으로 고정합니다.
const EXPECTED_APP_ROUTE_KEYS = [
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

describe("product analytics event taxonomy", () => {
  it("keeps the 09 runtime event allowlist fixed", () => {
    expect(PRODUCT_ANALYTICS_RUNTIME_EVENT_NAMES).toEqual(
      EXPECTED_RUNTIME_EVENT_NAMES
    );
    expect(PRODUCT_ANALYTICS_SERVER_EVENT_NAMES).toEqual(
      EXPECTED_RUNTIME_EVENT_NAMES.filter(
        (eventName) => eventName !== "app_route_viewed"
      )
    );
  });

  it("keeps billing events reserved outside the runtime allowlist", () => {
    expect(PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES).toEqual(
      EXPECTED_RESERVED_BILLING_EVENT_NAMES
    );

    for (const eventName of PRODUCT_ANALYTICS_RESERVED_BILLING_EVENT_NAMES) {
      expect(isProductAnalyticsReservedBillingEventName(eventName)).toBe(true);
      expect(isProductAnalyticsRuntimeEventName(eventName)).toBe(false);
    }
  });

  it("identifies runtime server events and idempotency requirements", () => {
    expect(isProductAnalyticsRuntimeEventName("deal_created")).toBe(true);
    expect(isProductAnalyticsServerEventName("deal_created")).toBe(true);
    expect(requiresProductAnalyticsIdempotencyKey("SERVER")).toBe(true);
    expect(requiresProductAnalyticsIdempotencyKey("CLIENT")).toBe(false);
  });

  it("keeps retention active events inside the 09 runtime allowlist", () => {
    expect(PRODUCT_ANALYTICS_ACTIVE_RETENTION_EVENT_NAMES).toEqual([
      "app_route_viewed",
      "deal_created",
      "deal_next_action_created",
      "schedule_created",
      "schedule_deal_linked",
      "meeting_note_created",
      "meeting_note_deal_linked",
      "business_card_scan_confirmed",
      "import_confirmed",
      "export_downloaded",
    ]);

    for (const eventName of PRODUCT_ANALYTICS_ACTIVE_RETENTION_EVENT_NAMES) {
      expect(isProductAnalyticsRuntimeEventName(eventName)).toBe(true);
    }
  });

  it("keeps route view routeKey and surface allowlists fixed", () => {
    expect(PRODUCT_ANALYTICS_APP_ROUTE_KEYS).toEqual(EXPECTED_APP_ROUTE_KEYS);
    expect(PRODUCT_ANALYTICS_ROUTE_VIEW_SURFACES).toEqual([
      "sidebar",
      "bottom_nav",
      "direct",
      "redirect",
      "unknown",
    ]);
    expect(isProductAnalyticsAppRouteKey("deals")).toBe(true);
    expect(isProductAnalyticsAppRouteKey("/app/deals")).toBe(false);
    expect(isProductAnalyticsRouteViewSurface("sidebar")).toBe(true);
    expect(isProductAnalyticsRouteViewSurface("header")).toBe(false);
  });
});
