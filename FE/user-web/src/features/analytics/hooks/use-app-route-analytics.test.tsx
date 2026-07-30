import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  MemoryRouter,
  useNavigate,
  type NavigateFunction,
} from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrackAnalyticsEvent } from "@/features/analytics/types/analytics";
import { env } from "@/lib/env";
import { useAppRouteAnalytics } from "./use-app-route-analytics";

let root: Root | null = null;

describe("useAppRouteAnalytics", () => {
  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
  });

  it("does not call the API when the analytics env flag is disabled", async () => {
    const originalEnabled = env.productAnalyticsEnabled;
    const trackEvent = vi.fn<TrackAnalyticsEvent>().mockResolvedValue({
      accepted: true,
    });

    env.productAnalyticsEnabled = false;

    try {
      const controller = await renderAnalyticsHook({
        initialPath: "/app/deals",
        trackEvent,
      });

      expect(trackEvent).not.toHaveBeenCalled();

      await act(async () => {
        controller.navigate("/app/deals/deal-001");
      });

      expect(trackEvent).not.toHaveBeenCalled();
    } finally {
      env.productAnalyticsEnabled = originalEnabled;
    }
  });

  it("sends allowlisted route changes once and skips immediate routeKey duplicates", async () => {
    const trackEvent = vi.fn<TrackAnalyticsEvent>().mockResolvedValue({
      accepted: true,
    });
    const controller = await renderAnalyticsHook({
      enabled: true,
      initialPath: "/app",
      trackEvent,
    });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenLastCalledWith({
      eventName: "app_route_viewed",
      eventVersion: 1,
      payload: {
        routeKey: "home",
      },
    });

    await act(async () => {
      controller.navigate("/app/deals");
    });

    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenLastCalledWith({
      eventName: "app_route_viewed",
      eventVersion: 1,
      payload: {
        routeKey: "deals",
      },
    });

    await act(async () => {
      controller.navigate("/app/deals?stage=WON");
    });

    expect(trackEvent).toHaveBeenCalledTimes(2);

    await act(async () => {
      controller.navigate("/app/deals/new");
    });

    expect(trackEvent).toHaveBeenCalledTimes(3);
    expect(trackEvent).toHaveBeenLastCalledWith({
      eventName: "app_route_viewed",
      eventVersion: 1,
      payload: {
        routeKey: "deal_create",
      },
    });

    await act(async () => {
      controller.navigate("/app/deals/deal-001");
    });

    expect(trackEvent).toHaveBeenCalledTimes(4);
    expect(trackEvent).toHaveBeenLastCalledWith({
      eventName: "app_route_viewed",
      eventVersion: 1,
      payload: {
        routeKey: "deal_detail",
      },
    });

    await act(async () => {
      controller.navigate("/app/deals/deal-002");
    });

    expect(trackEvent).toHaveBeenCalledTimes(4);
  });

  it("ignores redirect-only routes and hides analytics API failures", async () => {
    const trackEvent = vi
      .fn<TrackAnalyticsEvent>()
      .mockRejectedValueOnce(new Error("collector down"));
    const controller = await renderAnalyticsHook({
      enabled: true,
      initialPath: "/app/export",
      trackEvent,
    });

    expect(trackEvent).not.toHaveBeenCalled();

    await act(async () => {
      controller.navigate("/app/settings");
    });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenLastCalledWith({
      eventName: "app_route_viewed",
      eventVersion: 1,
      payload: {
        routeKey: "settings",
      },
    });
  });
});

type RenderAnalyticsHookOptions = {
  readonly enabled?: boolean;
  readonly initialPath: string;
  readonly trackEvent: TrackAnalyticsEvent;
};

type RenderAnalyticsHookResult = {
  readonly navigate: NavigateFunction;
};

// 기능 : MemoryRouter 안에서 route analytics hook을 테스트용으로 렌더링합니다.
async function renderAnalyticsHook(
  options: RenderAnalyticsHookOptions
): Promise<RenderAnalyticsHookResult> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  let navigate: NavigateFunction | null = null;

  root = createRoot(container);

  await act(async () => {
    root?.render(
      <MemoryRouter initialEntries={[options.initialPath]}>
        <AnalyticsHookProbe
          enabled={options.enabled}
          onReady={(nextNavigate) => {
            navigate = nextNavigate;
          }}
          trackEvent={options.trackEvent}
        />
      </MemoryRouter>
    );
  });

  if (navigate === null) {
    throw new Error("navigate is not ready");
  }

  return { navigate };
}

type AnalyticsHookProbeProps = {
  readonly enabled?: boolean;
  readonly onReady: (navigate: NavigateFunction) => void;
  readonly trackEvent: TrackAnalyticsEvent;
};

// 기능 : 테스트 라우터에서 hook과 navigate 함수를 연결합니다.
function AnalyticsHookProbe({
  enabled,
  onReady,
  trackEvent,
}: AnalyticsHookProbeProps) {
  const navigate = useNavigate();
  useAppRouteAnalytics({ enabled, trackEvent });

  useEffect(() => {
    onReady(navigate);
  }, [navigate, onReady]);

  return null;
}
