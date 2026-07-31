import { describe, expect, it, vi } from "vitest";
import { PRODUCT_ANALYTICS_EVENT_VERSION } from "@/features/analytics/types/analytics";
import { trackMobileFieldAnalyticsEvent } from "./mobile-field-analytics";

describe("trackMobileFieldAnalyticsEvent", () => {
  it("posts safe mobile field events when analytics is enabled", async () => {
    const trackEvent = vi.fn().mockResolvedValue({ accepted: true });

    trackMobileFieldAnalyticsEvent(
      {
        eventName: "business_card_capture_started",
        eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
        payload: {
          captureMode: "camera",
          entryPoint: "business_cards",
        },
      },
      { enabled: true, trackEvent }
    );
    await vi.waitFor(() => expect(trackEvent).toHaveBeenCalledTimes(1));

    expect(trackEvent).toHaveBeenCalledWith({
      eventName: "business_card_capture_started",
      eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
      payload: {
        captureMode: "camera",
        entryPoint: "business_cards",
      },
    });
  });

  it("does not send mobile field events when analytics is disabled", () => {
    const trackEvent = vi.fn().mockResolvedValue({ accepted: true });

    trackMobileFieldAnalyticsEvent(
      {
        eventName: "local_draft_saved",
        eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
        payload: {
          draftType: "meeting_note_create",
        },
      },
      { enabled: false, trackEvent }
    );

    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("hides collector failures from the caller", async () => {
    const trackEvent = vi.fn().mockRejectedValue(new Error("network down"));

    expect(() =>
      trackMobileFieldAnalyticsEvent(
        {
          eventName: "meeting_note_recording_failed",
          eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
          payload: {
            reason: "unsupported",
          },
        },
        { enabled: true, trackEvent }
      )
    ).not.toThrow();

    await vi.waitFor(() => expect(trackEvent).toHaveBeenCalledTimes(1));
  });

  it("keeps push endpoint and subscription keys out of permission analytics", async () => {
    const trackEvent = vi.fn().mockResolvedValue({ accepted: true });

    trackMobileFieldAnalyticsEvent(
      {
        eventName: "mobile_push_permission_result",
        eventVersion: PRODUCT_ANALYTICS_EVENT_VERSION,
        payload: {
          browserPushEnabled: true,
          permissionState: "granted",
        },
      },
      { enabled: true, trackEvent }
    );
    await vi.waitFor(() => expect(trackEvent).toHaveBeenCalledTimes(1));

    const sentBody = trackEvent.mock.calls[0]?.[0];

    expect(JSON.stringify(sentBody)).not.toContain("endpoint");
    expect(JSON.stringify(sentBody)).not.toContain("p256dh");
    expect(JSON.stringify(sentBody)).not.toContain("auth");
    expect(JSON.stringify(sentBody)).not.toContain("token");
  });
});
