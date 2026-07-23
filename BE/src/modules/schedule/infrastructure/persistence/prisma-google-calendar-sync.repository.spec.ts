import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaGoogleCalendarSyncRepository } from "./prisma-google-calendar-sync.repository";

type MockPrismaClient = {
  readonly externalCalendarConnection: {
    readonly findUnique: jest.Mock;
    readonly updateMany: jest.Mock;
  };
  readonly externalCalendarSource: {
    readonly findMany: jest.Mock;
    readonly upsert: jest.Mock;
    readonly updateMany: jest.Mock;
  };
  readonly schedule: {
    readonly findFirst: jest.Mock;
    readonly findMany: jest.Mock;
    readonly create: jest.Mock;
    readonly updateMany: jest.Mock;
  };
};

const SOURCE = {
  id: "source-1",
  calendarId: "primary",
  calendarName: "user@example.com",
  calendarTimeZone: "Asia/Seoul",
  isPrimary: true,
  isSystemCalendar: false,
  status: "SELECTED",
  syncToken: null,
  lastSyncedAt: null,
  lastSyncFailedAt: null,
  lastSyncErrorCode: null,
} as const;

function createClient(): MockPrismaClient {
  return {
    externalCalendarConnection: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    externalCalendarSource: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    schedule: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };
}

describe("PrismaGoogleCalendarSyncRepository", () => {
  it("upserts provider calendars with primary selected, system unselected, and existing status preserved", async () => {
    const client = createClient();
    client.externalCalendarSource.findMany
      .mockResolvedValueOnce([
        {
          calendarId: "team",
          status: "SELECTED",
        },
        {
          calendarId: "stale",
          status: "SELECTED",
        },
      ])
      .mockResolvedValueOnce([
        SOURCE,
        {
          ...SOURCE,
          id: "source-2",
          calendarId: "holiday#holiday@group.v.calendar.google.com",
          calendarName: "Holiday",
          isPrimary: false,
          isSystemCalendar: true,
          status: "UNSELECTED",
        },
        {
          ...SOURCE,
          id: "source-3",
          calendarId: "team",
          calendarName: "Team",
          isPrimary: false,
          status: "SELECTED",
        },
      ]);
    const repository = new PrismaGoogleCalendarSyncRepository(
      client as unknown as PrismaService
    );

    const sources = await repository.upsertCalendarSources({
      userId: "user-1",
      connectionId: "connection-1",
      sources: [
        {
          calendarId: "primary",
          calendarName: "user@example.com",
          calendarTimeZone: "Asia/Seoul",
          isPrimary: true,
          isSystemCalendar: false,
        },
        {
          calendarId: "holiday#holiday@group.v.calendar.google.com",
          calendarName: "Holiday",
          calendarTimeZone: "Asia/Seoul",
          isPrimary: false,
          isSystemCalendar: true,
        },
        {
          calendarId: "team",
          calendarName: "Team",
          calendarTimeZone: "Asia/Seoul",
          isPrimary: false,
          isSystemCalendar: false,
        },
      ],
    });

    expect(client.externalCalendarSource.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        connectionId: "connection-1",
        provider: "GOOGLE",
        status: "SELECTED",
        calendarId: {
          notIn: [
            "primary",
            "holiday#holiday@group.v.calendar.google.com",
            "team",
          ],
        },
      },
      data: {
        status: "UNSELECTED",
        syncToken: null,
      },
    });
    expect(client.externalCalendarSource.upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        create: expect.objectContaining({
          calendarId: "primary",
          status: "SELECTED",
        }),
      })
    );
    expect(client.externalCalendarSource.upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        create: expect.objectContaining({
          calendarId: "holiday#holiday@group.v.calendar.google.com",
          status: "UNSELECTED",
        }),
      })
    );
    expect(client.externalCalendarSource.upsert).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        create: expect.objectContaining({
          calendarId: "team",
          status: "SELECTED",
        }),
      })
    );
    expect(sources.map((source) => source.calendarId)).toEqual([
      "primary",
      "holiday#holiday@group.v.calendar.google.com",
      "team",
    ]);
  });

  it("creates new in-range imported events and stores description as memo only on insert", async () => {
    const client = createClient();
    client.schedule.findFirst.mockResolvedValueOnce(null);
    client.schedule.create.mockResolvedValueOnce({ id: "schedule-1" });
    client.externalCalendarSource.updateMany.mockResolvedValue({ count: 1 });
    const repository = new PrismaGoogleCalendarSyncRepository(
      client as unknown as PrismaService
    );
    const syncedAt = new Date("2026-07-23T01:00:00.000Z");

    const result = await repository.applySyncedEvents({
      userId: "user-1",
      source: SOURCE,
      nextSyncToken: "sync-token",
      syncedAt,
      events: [
        {
          externalEventId: "event-1",
          externalEventICalUid: "ical-1",
          externalEventEtag: "etag-1",
          externalHtmlLink: "https://calendar.google.com/event",
          externalUpdatedAt: syncedAt,
          isWithinSyncRange: true,
          isCancelled: false,
          fields: {
            scheduleTitle: "Google event",
            startAt: new Date("2026-07-24T01:00:00.000Z"),
            endAt: new Date("2026-07-24T02:00:00.000Z"),
            timeZone: "Asia/Seoul",
            location: "Seoul",
            meetingUrl: "https://meet.google.com/abc-defg-hij",
            memo: "Imported memo",
            isAllDay: false,
          },
        },
      ],
    });

    expect(client.schedule.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sourceType: "GOOGLE",
        externalCalendarSourceId: "source-1",
        externalEventId: "event-1",
        memo: "Imported memo",
        externalSyncStatus: "SYNCED",
      }),
      select: {
        id: true,
      },
    });
    expect(result.importedCount).toBe(1);
    expect(result.reminderScheduleRequests).toEqual([
      {
        scheduleId: "schedule-1",
        scheduleTitle: "Google event",
        startAt: new Date("2026-07-24T01:00:00.000Z"),
      },
    ]);
  });

  it("protects local modified fields and only updates external metadata", async () => {
    const client = createClient();
    client.schedule.findFirst.mockResolvedValueOnce({
      id: "schedule-1",
      scheduleTitle: "Local title",
      startAt: new Date("2026-07-24T01:00:00.000Z"),
      deletedAt: null,
      externalSyncStatus: "LOCAL_MODIFIED",
    });
    client.schedule.updateMany.mockResolvedValue({ count: 1 });
    client.externalCalendarSource.updateMany.mockResolvedValue({ count: 1 });
    const repository = new PrismaGoogleCalendarSyncRepository(
      client as unknown as PrismaService
    );
    const syncedAt = new Date("2026-07-23T01:00:00.000Z");

    const result = await repository.applySyncedEvents({
      userId: "user-1",
      source: SOURCE,
      nextSyncToken: "sync-token",
      syncedAt,
      events: [
        {
          externalEventId: "event-1",
          externalEventICalUid: "ical-1",
          externalEventEtag: "etag-2",
          externalHtmlLink: "https://calendar.google.com/event",
          externalUpdatedAt: syncedAt,
          isWithinSyncRange: true,
          isCancelled: false,
          fields: {
            scheduleTitle: "Provider title",
            startAt: new Date("2026-07-24T03:00:00.000Z"),
            endAt: new Date("2026-07-24T04:00:00.000Z"),
            timeZone: "Asia/Seoul",
            location: "Busan",
            meetingUrl: "https://meet.google.com/new-link",
            memo: "Provider memo",
            isAllDay: false,
          },
        },
      ],
    });
    const updateData = client.schedule.updateMany.mock.calls[0]?.[0].data;

    expect(updateData).toEqual({
      externalEventICalUid: "ical-1",
      externalEventEtag: "etag-2",
      externalHtmlLink: "https://calendar.google.com/event",
      externalUpdatedAt: syncedAt,
      lastExternalSyncedAt: syncedAt,
      externalDeletedAt: null,
    });
    expect(result.localModifiedSkippedCount).toBe(1);
  });

  it("marks cancelled existing Google events hidden without hard deleting schedules", async () => {
    const client = createClient();
    client.schedule.findFirst.mockResolvedValueOnce({
      id: "schedule-1",
      scheduleTitle: "Google event",
      startAt: new Date("2026-07-24T01:00:00.000Z"),
      deletedAt: null,
      externalSyncStatus: "SYNCED",
    });
    client.schedule.updateMany.mockResolvedValue({ count: 1 });
    client.externalCalendarSource.updateMany.mockResolvedValue({ count: 1 });
    const repository = new PrismaGoogleCalendarSyncRepository(
      client as unknown as PrismaService
    );
    const syncedAt = new Date("2026-07-23T01:00:00.000Z");

    const result = await repository.applySyncedEvents({
      userId: "user-1",
      source: SOURCE,
      nextSyncToken: "sync-token",
      syncedAt,
      events: [
        {
          externalEventId: "event-1",
          externalEventICalUid: "ical-1",
          externalEventEtag: "etag-2",
          externalHtmlLink: "https://calendar.google.com/event",
          externalUpdatedAt: syncedAt,
          isWithinSyncRange: true,
          isCancelled: true,
          fields: null,
        },
      ],
    });

    expect(client.schedule.updateMany).toHaveBeenCalledWith({
      where: {
        id: "schedule-1",
        userId: "user-1",
        deletedAt: null,
      },
      data: expect.objectContaining({
        externalSyncStatus: "GOOGLE_DELETED",
        externalDeletedAt: syncedAt,
      }),
    });
    expect(client.schedule.create).not.toHaveBeenCalled();
    expect(result.googleDeletedCount).toBe(1);
    expect(result.reminderCancelScheduleIds).toEqual(["schedule-1"]);
  });

  it("skips new incremental events outside the sync range", async () => {
    const client = createClient();
    client.schedule.findFirst.mockResolvedValueOnce(null);
    client.externalCalendarSource.updateMany.mockResolvedValue({ count: 1 });
    const repository = new PrismaGoogleCalendarSyncRepository(
      client as unknown as PrismaService
    );

    await repository.applySyncedEvents({
      userId: "user-1",
      source: SOURCE,
      nextSyncToken: "sync-token",
      syncedAt: new Date("2026-07-23T01:00:00.000Z"),
      events: [
        {
          externalEventId: "event-outside",
          externalEventICalUid: null,
          externalEventEtag: null,
          externalHtmlLink: null,
          externalUpdatedAt: null,
          isWithinSyncRange: false,
          isCancelled: false,
          fields: {
            scheduleTitle: "Outside",
            startAt: new Date("2027-01-01T01:00:00.000Z"),
            endAt: new Date("2027-01-01T02:00:00.000Z"),
            timeZone: "Asia/Seoul",
            location: null,
            meetingUrl: null,
            memo: null,
            isAllDay: false,
          },
        },
      ],
    });

    expect(client.schedule.create).not.toHaveBeenCalled();
  });
});
