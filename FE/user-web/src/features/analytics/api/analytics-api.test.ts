import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { PRODUCT_ANALYTICS_EVENT_VERSION } from "@/features/analytics/types/analytics";
import { trackAnalyticsEvent } from "./analytics-api";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

describe("trackAnalyticsEvent", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
    apiClientMock.mockResolvedValue({ accepted: true });
  });

  it("posts app_route_viewed to the Backend collector API", async () => {
    await expect(
      trackAnalyticsEvent({
        eventName: "app_route_viewed",
        eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
        payload: {
          routeKey: "deals",
        },
      })
    ).resolves.toEqual({ accepted: true });

    expect(apiClientMock).toHaveBeenCalledWith("/api/analytics/events", {
      body: {
        eventName: "app_route_viewed",
        eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
        payload: {
          routeKey: "deals",
        },
      },
      method: "POST",
    });
  });

  it("posts mobile field events to the same Backend collector API", async () => {
    await expect(
      trackAnalyticsEvent({
        eventName: "local_draft_discarded",
        eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
        payload: {
          draftType: "business_card_confirm",
          reason: "saved",
        },
      })
    ).resolves.toEqual({ accepted: true });

    expect(apiClientMock).toHaveBeenCalledWith("/api/analytics/events", {
      body: {
        eventName: "local_draft_discarded",
        eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
        payload: {
          draftType: "business_card_confirm",
          reason: "saved",
        },
      },
      method: "POST",
    });
  });

  it("does not include user, session, device, surface, raw path, or query data", async () => {
    await trackAnalyticsEvent({
      eventName: "app_route_viewed",
      eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
      payload: {
        routeKey: "deal_detail",
      },
    });

    const [, options] = apiClientMock.mock.calls[0] ?? [];
    const body = isRecord(options) ? options["body"] : null;

    expect(body).toEqual({
      eventName: "app_route_viewed",
      eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
      payload: {
        routeKey: "deal_detail",
      },
    });
    expect(JSON.stringify(body)).not.toContain("userId");
    expect(JSON.stringify(body)).not.toContain("authSessionId");
    expect(JSON.stringify(body)).not.toContain("authDeviceId");
    expect(JSON.stringify(body)).not.toContain("deviceId");
    expect(JSON.stringify(body)).not.toContain("surface");
    expect(JSON.stringify(body)).not.toContain("550e8400");
    expect(JSON.stringify(body)).not.toContain("query");
  });
});

// 기능 : unknown test 값을 key 접근 가능한 record로 좁힙니다.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
