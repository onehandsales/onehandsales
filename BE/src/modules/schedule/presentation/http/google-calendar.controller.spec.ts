import type { Response } from "express";
import { GoogleCalendarConnectionService } from "@/modules/schedule/application/services/google-calendar-connection.service";
import { GoogleCalendarSyncService } from "@/modules/schedule/application/services/google-calendar-sync.service";
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

function createSyncService() {
  return {
    listCalendars: jest.fn().mockResolvedValue({
      connection: {
        provider: "GOOGLE",
        status: "CONNECTED",
        providerAccountEmail: "user@example.com",
        connectedAt: "2026-07-23T01:00:00.000Z",
        reconnectRequiredAt: null,
        disconnectedAt: null,
        lastSyncedAt: null,
        lastSyncStartedAt: null,
        lastSyncFailedAt: null,
        lastSyncErrorCode: null,
        syncLockExpiresAt: null,
      },
      calendars: [],
    }),
    updateCalendarSelection: jest.fn().mockResolvedValue({
      connection: {
        provider: "GOOGLE",
        status: "CONNECTED",
        providerAccountEmail: "user@example.com",
        connectedAt: "2026-07-23T01:00:00.000Z",
        reconnectRequiredAt: null,
        disconnectedAt: null,
        lastSyncedAt: null,
        lastSyncStartedAt: null,
        lastSyncFailedAt: null,
        lastSyncErrorCode: null,
        syncLockExpiresAt: null,
      },
      calendars: [
        {
          id: "source-1",
          calendarId: "primary",
          calendarName: "user@example.com",
          calendarTimeZone: "Asia/Seoul",
          isPrimary: true,
          isSystemCalendar: false,
          status: "SELECTED",
          lastSyncedAt: null,
          lastSyncFailedAt: null,
          lastSyncErrorCode: null,
        },
      ],
    }),
    syncCalendars: jest.fn().mockResolvedValue({
      trigger: "MANUAL",
      connectionStatus: "CONNECTED",
      rangeStartAt: "2026-06-22T00:00:00.000Z",
      rangeEndAt: "2026-10-22T00:00:00.000Z",
      startedAt: "2026-07-23T01:00:00.000Z",
      finishedAt: "2026-07-23T01:00:01.000Z",
      selectedCalendarCount: 1,
      result: {
        importedCount: 0,
        updatedCount: 0,
        localModifiedSkippedCount: 0,
        googleDeletedCount: 0,
        hiddenByCalendarSelectionCount: 0,
        trashedCount: 0,
        reminderScheduledCount: 0,
        reminderCanceledCount: 0,
        errorCount: 0,
      },
      nextAutoSyncAvailableAt: "2026-07-23T01:10:01.000Z",
    }),
  } as unknown as jest.Mocked<GoogleCalendarSyncService>;
}

describe("GoogleCalendarController", () => {
  it("delegates connect requests with the current user", () => {
    const service = createService();
    const syncService = createSyncService();
    const controller = new GoogleCalendarController(service, syncService);

    const response = controller.startConnect(CURRENT_USER, {
      returnTo: "/app/schedules",
    });

    expect(response.returnTo).toBe("/app/schedules");
    expect(service.startConnect).toHaveBeenCalledWith(CURRENT_USER, {
      returnTo: "/app/schedules",
    });
  });

  it("delegates calendar list, selection, and sync requests", async () => {
    const service = createService();
    const syncService = createSyncService();
    const controller = new GoogleCalendarController(service, syncService);

    await expect(controller.listCalendars(CURRENT_USER)).resolves.toMatchObject({
      calendars: [],
    });
    await controller.updateCalendarSelection(CURRENT_USER, {
      selectedCalendarIds: ["primary"],
    });
    await controller.syncCalendars(CURRENT_USER, { trigger: "MANUAL" });

    expect(syncService.listCalendars).toHaveBeenCalledWith(CURRENT_USER);
    expect(syncService.updateCalendarSelection).toHaveBeenCalledWith(
      CURRENT_USER,
      { selectedCalendarIds: ["primary"] }
    );
    expect(syncService.syncCalendars).toHaveBeenCalledWith(CURRENT_USER, {
      trigger: "MANUAL",
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
