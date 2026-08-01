import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test("sends allowlisted app route analytics events without raw route data", async ({
  page,
}) => {
  await seedAuthenticatedSession(page);
  const api = await setupUserWebApiMocks(page);

  await page.goto("/app");
  await waitForRouteKey(api.analyticsEvents, "home");

  await page.goto("/app/deals");
  await waitForRouteKey(api.analyticsEvents, "deals");

  await page.goto("/app/deals/deal-mobile-001");
  await waitForRouteKey(api.analyticsEvents, "deal_detail");

  await page.goto("/app/deals/deal-mobile-002");
  await waitForRouteKey(api.analyticsEvents, "deal_detail");

  await page.goto("/app/contacts/scan");
  await expect(page).toHaveURL(/\/app\/business-cards$/);
  await waitForRouteKey(api.analyticsEvents, "business_cards");

  await page.goto("/app/export");
  await expect(page).toHaveURL(/\/app$/);
  await waitForRouteKey(api.analyticsEvents, "home");

  const detailEvent = api
    .analyticsEvents()
    .find((event) => analyticsRouteKey(event) === "deal_detail");
  const detailEventJson = JSON.stringify(detailEvent);

  expect(detailEvent).toEqual({
    eventName: "app_route_viewed",
    eventVersion: 1,
    payload: {
      routeKey: "deal_detail",
    },
  });
  expect(detailEventJson).not.toContain("deal-mobile-001");
  expect(detailEventJson).not.toContain("deal-mobile-002");
  expect(detailEventJson).not.toContain("userId");
  expect(detailEventJson).not.toContain("authSessionId");
  expect(detailEventJson).not.toContain("authDeviceId");
  expect(detailEventJson).not.toContain("deviceId");
  expect(detailEventJson).not.toContain("query");
  expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
});

// 기능 : analytics event 목록에 기대 routeKey가 들어올 때까지 기다립니다.
async function waitForRouteKey(
  getEvents: () => readonly unknown[],
  routeKey: string
) {
  await expect
    .poll(() => analyticsRouteKeys(getEvents()).includes(routeKey))
    .toBe(true);
}

// 기능 : analytics event 목록에서 routeKey만 추출합니다.
function analyticsRouteKeys(events: readonly unknown[]) {
  return events.map((event) => analyticsRouteKey(event)).filter(isString);
}

// 기능 : unknown analytics event payload에서 routeKey를 안전하게 읽습니다.
function analyticsRouteKey(event: unknown) {
  if (!isRecord(event)) {
    return null;
  }

  const payload = event["payload"];

  if (!isRecord(payload)) {
    return null;
  }

  return payload["routeKey"];
}

// 기능 : unknown 값을 key 접근 가능한 record로 좁힙니다.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// 기능 : unknown routeKey 후보를 string으로 좁힙니다.
function isString(value: unknown): value is string {
  return typeof value === "string";
}
