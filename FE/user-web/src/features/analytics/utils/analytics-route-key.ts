import type { ProductAnalyticsAppRouteKey } from "@/features/analytics/types/analytics";

const STATIC_APP_ROUTE_KEYS = new Map<string, ProductAnalyticsAppRouteKey>([
  ["/app", "home"],
  ["/app/companies", "companies"],
  ["/app/companies/new", "company_create"],
  ["/app/companies/new/full", "company_create"],
  ["/app/contacts", "contacts"],
  ["/app/contacts/new", "contact_create"],
  ["/app/contacts/new/full", "contact_create"],
  ["/app/products", "products"],
  ["/app/products/new", "product_create"],
  ["/app/products/new/full", "product_create"],
  ["/app/deals", "deals"],
  ["/app/deals/new", "deal_create"],
  ["/app/deals/new/full", "deal_create"],
  ["/app/schedules", "schedules"],
  ["/app/schedules/week", "schedule_week"],
  ["/app/meeting-notes", "meeting_notes"],
  ["/app/meeting-notes/new/full", "meeting_note_create"],
  ["/app/business-cards", "business_cards"],
  ["/app/notifications", "notifications"],
  ["/app/import", "import"],
  ["/app/trash", "trash"],
  ["/app/more", "more"],
]);

const REDIRECT_ONLY_APP_PATHS = new Set([
  "/app/contacts/scan",
  "/app/meeting-notes/new",
  "/app/export",
]);

type DynamicRouteMatcher = {
  readonly pattern: RegExp;
  readonly routeKey: ProductAnalyticsAppRouteKey;
};

const DYNAMIC_APP_ROUTE_MATCHERS: readonly DynamicRouteMatcher[] = [
  { pattern: /^\/app\/companies\/[^/]+$/, routeKey: "company_detail" },
  { pattern: /^\/app\/contacts\/[^/]+$/, routeKey: "contact_detail" },
  { pattern: /^\/app\/products\/[^/]+$/, routeKey: "product_detail" },
  { pattern: /^\/app\/deals\/[^/]+$/, routeKey: "deal_detail" },
  { pattern: /^\/app\/schedules\/[^/]+$/, routeKey: "schedule_detail" },
  {
    pattern: /^\/app\/meeting-notes\/[^/]+$/,
    routeKey: "meeting_note_detail",
  },
  { pattern: /^\/app\/import\/review\/[^/]+$/, routeKey: "import_review" },
  { pattern: /^\/app\/import\/[^/]+$/, routeKey: "import_detail" },
];

// 기능 : 현재 pathname을 분석 허용 routeKey로 변환합니다.
export function resolveProductAnalyticsRouteKey(
  pathname: string
): ProductAnalyticsAppRouteKey | null {
  const normalizedPathname = normalizePathname(pathname);

  if (!normalizedPathname.startsWith("/app")) {
    return null;
  }

  if (REDIRECT_ONLY_APP_PATHS.has(normalizedPathname)) {
    return null;
  }

  const staticRouteKey = STATIC_APP_ROUTE_KEYS.get(normalizedPathname);

  if (staticRouteKey) {
    return staticRouteKey;
  }

  const dynamicMatch = DYNAMIC_APP_ROUTE_MATCHERS.find((matcher) =>
    matcher.pattern.test(normalizedPathname)
  );

  return dynamicMatch?.routeKey ?? null;
}

// 기능 : pathname 후보에서 query/hash와 trailing slash를 제거합니다.
function normalizePathname(pathname: string) {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] ?? "";
  const withLeadingSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;

  if (withLeadingSlash === "/") {
    return withLeadingSlash;
  }

  return withLeadingSlash.replace(/\/+$/, "");
}
