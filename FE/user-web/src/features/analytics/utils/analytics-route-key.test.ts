import { describe, expect, it } from "vitest";
import {
  PRODUCT_ANALYTICS_APP_ROUTE_KEYS,
  type ProductAnalyticsAppRouteKey,
} from "@/features/analytics/types/analytics";
import { resolveProductAnalyticsRouteKey } from "./analytics-route-key";

const ROUTE_KEY_CASES: ReadonlyArray<{
  readonly pathname: string;
  readonly routeKey: ProductAnalyticsAppRouteKey;
}> = [
  { pathname: "/app", routeKey: "home" },
  { pathname: "/app/companies", routeKey: "companies" },
  { pathname: "/app/companies/new", routeKey: "company_create" },
  { pathname: "/app/companies/new/full", routeKey: "company_create" },
  { pathname: "/app/companies/company-001", routeKey: "company_detail" },
  { pathname: "/app/contacts", routeKey: "contacts" },
  { pathname: "/app/contacts/new", routeKey: "contact_create" },
  { pathname: "/app/contacts/new/full", routeKey: "contact_create" },
  { pathname: "/app/contacts/contact-001", routeKey: "contact_detail" },
  { pathname: "/app/products", routeKey: "products" },
  { pathname: "/app/products/new", routeKey: "product_create" },
  { pathname: "/app/products/new/full", routeKey: "product_create" },
  { pathname: "/app/products/product-001", routeKey: "product_detail" },
  { pathname: "/app/deals", routeKey: "deals" },
  { pathname: "/app/deals/new", routeKey: "deal_create" },
  { pathname: "/app/deals/new/full", routeKey: "deal_create" },
  {
    pathname: "/app/deals/550e8400-e29b-41d4-a716-446655440000",
    routeKey: "deal_detail",
  },
  { pathname: "/app/schedules", routeKey: "schedules" },
  { pathname: "/app/schedules/week", routeKey: "schedule_week" },
  { pathname: "/app/schedules/schedule-001", routeKey: "schedule_detail" },
  { pathname: "/app/meeting-notes", routeKey: "meeting_notes" },
  {
    pathname: "/app/meeting-notes/new/full",
    routeKey: "meeting_note_create",
  },
  {
    pathname: "/app/meeting-notes/meeting-note-001",
    routeKey: "meeting_note_detail",
  },
  { pathname: "/app/business-cards", routeKey: "business_cards" },
  { pathname: "/app/notifications", routeKey: "notifications" },
  { pathname: "/app/import", routeKey: "import" },
  { pathname: "/app/import/review/import-job-001", routeKey: "import_review" },
  { pathname: "/app/import/import-log-001", routeKey: "import_detail" },
  { pathname: "/app/trash", routeKey: "trash" },
  { pathname: "/app/more", routeKey: "more" },
];

describe("resolveProductAnalyticsRouteKey", () => {
  it.each(ROUTE_KEY_CASES)(
    "maps $pathname to $routeKey",
    ({ pathname, routeKey }) => {
      expect(resolveProductAnalyticsRouteKey(pathname)).toBe(routeKey);
    }
  );

  it("keeps static create routes ahead of dynamic detail routes", () => {
    expect(resolveProductAnalyticsRouteKey("/app/deals/new")).toBe(
      "deal_create"
    );
    expect(resolveProductAnalyticsRouteKey("/app/deals/new/full")).toBe(
      "deal_create"
    );
    expect(resolveProductAnalyticsRouteKey("/app/deals/deal-001")).toBe(
      "deal_detail"
    );
  });

  it("excludes public, auth, legacy, and redirect-only routes", () => {
    expect(resolveProductAnalyticsRouteKey("/")).toBeNull();
    expect(resolveProductAnalyticsRouteKey("/en-us/login")).toBeNull();
    expect(resolveProductAnalyticsRouteKey("/auth/callback")).toBeNull();
    expect(resolveProductAnalyticsRouteKey("/deals")).toBeNull();
    expect(resolveProductAnalyticsRouteKey("/app/contacts/scan")).toBeNull();
    expect(resolveProductAnalyticsRouteKey("/app/meeting-notes/new")).toBeNull();
    expect(resolveProductAnalyticsRouteKey("/app/export")).toBeNull();
  });

  it("does not expose query strings or UUID path params as payload values", () => {
    expect(
      resolveProductAnalyticsRouteKey(
        "/app/deals/550e8400-e29b-41d4-a716-446655440000?query=raw"
      )
    ).toBe("deal_detail");
    expect(resolveProductAnalyticsRouteKey("/app/deals?stage=WON")).toBe(
      "deals"
    );
  });

  it("covers every Backend routeKey allowlist value with a mapper case", () => {
    const coveredRouteKeys = new Set(
      ROUTE_KEY_CASES.map((routeCase) => routeCase.routeKey)
    );

    expect([...coveredRouteKeys].sort()).toEqual(
      [...PRODUCT_ANALYTICS_APP_ROUTE_KEYS].sort()
    );
  });
});
