import type { Response } from "express";
import { GoogleCalendarConnectionService } from "@/modules/schedule/application/services/google-calendar-connection.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  GoogleCalendarCallbackController,
  GoogleCalendarController,
} from "./google-calendar.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000001",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

function createService() {
  return {
    startConnect: jest.fn().mockReturnValue({
      connectUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      expiresAt: "2026-07-23T01:10:00.000Z",
      returnTo: "/app/schedules",
    }),
    getStatus: jest.fn().mockResolvedValue({
      connected: false,
      connection: null,
      selectedCalendarCount: 0,
      availableCalendarCount: 0,
      autoSync: {
        enabled: false,
        freshnessMinutes: 10,
        shouldSyncOnScheduleEntry: false,
        nextAutoSyncAvailableAt: null,
      },
    }),
    disconnect: jest.fn().mockResolvedValue({
      connectionStatus: "DISCONNECTED",
      scheduleAction: "KEEP",
      affectedScheduleCount: 0,
      trashedScheduleCount: 0,
      hiddenScheduleCount: 0,
      keptScheduleCount: 0,
      disconnectedAt: "2026-07-23T01:20:00.000Z",
    }),
    handleCallback: jest.fn().mockResolvedValue({
      redirectTo: "/app/schedules?googleCalendar=connected",
    }),
  } as unknown as jest.Mocked<GoogleCalendarConnectionService>;
}

describe("GoogleCalendarController", () => {
  it("delegates connect requests with the current user", () => {
    const service = createService();
    const controller = new GoogleCalendarController(service);

    const response = controller.startConnect(CURRENT_USER, {
      returnTo: "/app/schedules",
    });

    expect(response.returnTo).toBe("/app/schedules");
    expect(service.startConnect).toHaveBeenCalledWith(CURRENT_USER, {
      returnTo: "/app/schedules",
    });
  });

  it("redirects callback responses without requiring a bearer user", async () => {
    const service = createService();
    const controller = new GoogleCalendarCallbackController(service);
    const response = {
      redirect: jest.fn(),
    } as unknown as Response;

    await controller.handleCallback(
      {
        code: "code",
        state: "state",
      },
      response
    );

    expect(response.redirect).toHaveBeenCalledWith(
      "/app/schedules?googleCalendar=connected"
    );
  });
});
