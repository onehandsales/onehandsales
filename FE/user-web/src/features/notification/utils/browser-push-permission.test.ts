import { describe, expect, it } from "vitest";
import type { MobilePushPermissionClientEvent } from "@/features/notification/types/notification";
import {
  emitMobilePushPermissionClientEvent,
  getBrowserPushPermissionLabel,
  toBrowserPushSubscriptionInput,
  urlBase64ToUint8Array,
} from "./browser-push-permission";

describe("browser push permission helpers", () => {
  it("converts permission states to short labels", () => {
    expect(getBrowserPushPermissionLabel("granted")).toBe("허용");
    expect(getBrowserPushPermissionLabel("denied")).toBe("차단");
    expect(getBrowserPushPermissionLabel("default")).toBe("미설정");
    expect(getBrowserPushPermissionLabel("unsupported")).toBe("미지원");
  });

  it("converts VAPID public key from base64url to bytes", () => {
    expect(Array.from(urlBase64ToUint8Array("AQIDBA"))).toEqual([1, 2, 3, 4]);
  });

  it("builds subscription API input from PushSubscription JSON", () => {
    const subscription = {
      toJSON() {
        return {
          endpoint: "https://push.example.test/subscription/001",
          keys: {
            auth: "auth-key",
            p256dh: "p256dh-key",
          },
        };
      },
    } as unknown as PushSubscription;

    expect(toBrowserPushSubscriptionInput(subscription)).toEqual({
      endpoint: "https://push.example.test/subscription/001",
      keys: {
        auth: "auth-key",
        p256dh: "p256dh-key",
      },
      deviceLabel: "User Web",
      userAgent: navigator.userAgent,
    });
  });

  it("emits permission analytics without push endpoint or subscription keys", () => {
    const received: MobilePushPermissionClientEvent[] = [];
    const onEvent = (event: Event) => {
      received.push(
        (event as CustomEvent<MobilePushPermissionClientEvent>).detail
      );
    };

    window.addEventListener("onehand:mobile-push-permission-analytics", onEvent);
    emitMobilePushPermissionClientEvent({
      eventName: "mobile_push_permission_result",
      eventVersion: 1,
      payload: {
        browserPushEnabled: true,
        permissionState: "granted",
      },
    });
    window.removeEventListener(
      "onehand:mobile-push-permission-analytics",
      onEvent
    );

    expect(received).toEqual([
      {
        eventName: "mobile_push_permission_result",
        eventVersion: 1,
        payload: {
          browserPushEnabled: true,
          permissionState: "granted",
        },
      },
    ]);
    expect(JSON.stringify(received)).not.toContain("endpoint");
    expect(JSON.stringify(received)).not.toContain("p256dh");
    expect(JSON.stringify(received)).not.toContain("auth-key");
  });
});
