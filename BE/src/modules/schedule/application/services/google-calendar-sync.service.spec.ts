import {
  GoogleCalendarProviderAuthError,
  GoogleCalendarProviderTransientError,
  type GoogleCalendarProviderCalendarListPage,
  type GoogleCalendarProviderEventListPage,
  GoogleCalendarProviderSyncTokenExpiredError,
  type GoogleCalendarReadProvider,
  type ListGoogleCalendarEventsPageInput,
} from "@/modules/schedule/application/ports/google-calendar-read.provider";
import type {
  ApplyGoogleCalendarEventsResult,
  GoogleCalendarSourceRecord,
  GoogleCalendarSyncConnectionRecord,
  GoogleCalendarSyncRepository,
  GoogleCalendarSyncedEventInput,
} from "@/modules/schedule/application/ports/google-calendar-sync.repository";
import type { GoogleCalendarTokenEncryptionPort } from "@/modules/schedule/application/ports/google-calendar-token-encryption.port";
import {
  GoogleCalendarProviderUnavailableError,
  GoogleCalendarReconnectRequiredError,
  GoogleCalendarSourceSelectionRequiredError,
} from "@/modules/schedule/domain/google-calendar.errors";
import type {
  CancelPendingNotificationsBySourceInput,
  NotificationRecord,
  NotificationSettingsRecord,
  UpsertReminderNotificationInput,
} from "@/modules/notification/application/ports/notification.repository";
import type {
  CancelScheduleNotificationReminderUseCase,
  ScheduleNotificationReminderUseCase,
} from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { GoogleCalendarSyncService } from "./google-calendar-sync.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const CONNECTION: GoogleCalendarSyncConnectionRecord = {
  id: "connection-1",
  status: "CONNECTED",
  providerAccountEmail: "user@example.com",
  encryptedAccessToken: "enc:access-token",
  encryptedRefreshToken: "enc:refresh-token",
  tokenExpiresAt: new Date("2026-07-23T03:00:00.000Z"),
  connectedAt: new Date("2026-07-23T00:00:00.000Z"),
  reconnectRequiredAt: null,
  disconnectedAt: null,
  lastSyncedAt: null,
  lastSyncStartedAt: null,
  lastSyncFailedAt: null,
  lastSyncErrorCode: null,
  syncLockExpiresAt: null,
};

const SELECTED_SOURCE: GoogleCalendarSourceRecord = {
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
};

class FakeGoogleCalendarSyncRepository implements GoogleCalendarSyncRepository {
  connection: GoogleCalendarSyncConnectionRecord | null = CONNECTION;
  sources: GoogleCalendarSourceRecord[] = [SELECTED_SOURCE];
  appliedEvents: GoogleCalendarSyncedEventInput[] = [];
  clearSourceSyncTokenCalls: string[] = [];
  reconnectRequiredErrorCode: string | null = null;
  syncStartedCount = 0;
  syncSucceededCount = 0;
  syncFailedErrorCode: string | null = null;
  sourceSyncFailedErrorCode: string | null = null;

  async runInTransaction<T>(
    work: (repository: GoogleCalendarSyncRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  async findSettingsForUser(): Promise<NotificationSettingsRecord | null> {
    return null;
  }

  async cancelPendingNotificationsBySource(
    _input: CancelPendingNotificationsBySourceInput
  ): Promise<number> {
    void _input;
    return 0;
  }

  async upsertReminderNotification(
    input: UpsertReminderNotificationInput
  ): Promise<NotificationRecord> {
    return {
      id: "notification-1",
      userId: input.userId,
      type: input.type,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      dedupeKey: input.dedupeKey,
      targetPath: input.targetPath,
      title: input.title,
      body: input.body ?? null,
      targetLabel: input.targetLabel ?? null,
      status: "PENDING",
      scheduledAt: input.scheduledAt,
      sentAt: null,
      readAt: null,
      canceledAt: null,
      cancelReason: null,
      metadataJson: input.metadataJson ?? {},
      createdAt: input.now,
      updatedAt: input.now,
    };
  }

  async findConnectionForUser(): Promise<GoogleCalendarSyncConnectionRecord | null> {
    return this.connection;
  }

  async updateConnectionAccessToken(): Promise<void> {}

  async markConnectionReconnectRequired(input: {
    readonly errorCode: string;
  }): Promise<void> {
    this.reconnectRequiredErrorCode = input.errorCode;
  }

  async markConnectionSyncStarted(): Promise<boolean> {
    this.syncStartedCount += 1;
    return true;
  }

  async markConnectionSyncSucceeded(): Promise<void> {
    this.syncSucceededCount += 1;
  }

  async markConnectionSyncFailed(input: {
    readonly errorCode: string;
  }): Promise<void> {
    this.syncFailedErrorCode = input.errorCode;
  }

  async upsertCalendarSources(input: {
    readonly sources: readonly { readonly calendarId: string }[];
  }): Promise<readonly GoogleCalendarSourceRecord[]> {
    const currentCalendarIds = new Set(
      input.sources.map((source) => source.calendarId)
    );
    this.sources = this.sources.map((source): GoogleCalendarSourceRecord =>
      currentCalendarIds.has(source.calendarId)
        ? source
        : {
            ...source,
            status: "UNSELECTED",
            syncToken: null,
          }
    );

    return this.sources.filter((source) =>
      currentCalendarIds.has(source.calendarId)
    );
  }

  async listCalendarSources(): Promise<readonly GoogleCalendarSourceRecord[]> {
    return this.sources;
  }

  async updateCalendarSelection() {
    return {
      sources: this.sources,
      hiddenScheduleIds: [],
    };
  }

  async listSelectedSources(): Promise<readonly GoogleCalendarSourceRecord[]> {
    return this.sources.filter((source) => source.status === "SELECTED");
  }

  async clearSourceSyncToken(input: {
    readonly sourceId: string;
  }): Promise<void> {
    this.clearSourceSyncTokenCalls.push(input.sourceId);
  }

  async markSourceSyncFailed(input: { readonly errorCode: string }): Promise<void> {
    this.sourceSyncFailedErrorCode = input.errorCode;
  }

  async applySyncedEvents(input: {
    readonly events: readonly GoogleCalendarSyncedEventInput[];
  }): Promise<ApplyGoogleCalendarEventsResult> {
    this.appliedEvents.push(...input.events);

    return {
      importedCount: input.events.length,
      updatedCount: 0,
      localModifiedSkippedCount: 0,
      googleDeletedCount: 0,
      trashedCount: 0,
      reminderScheduleRequests: [],
      reminderCancelScheduleIds: [],
    };
  }
}

function createReadProvider(
  pages: Array<GoogleCalendarProviderEventListPage | Error>
) {
  const listCalendarListPage = jest.fn(
    async (): Promise<GoogleCalendarProviderCalendarListPage> => ({
      items: [
        {
          calendarId: "primary",
          calendarName: "user@example.com",
          calendarTimeZone: "Asia/Seoul",
          isPrimary: true,
        },
      ],
      nextPageToken: null,
    })
  );
  const listEventsPage = jest.fn(
    async (
      _input: ListGoogleCalendarEventsPageInput
    ): Promise<GoogleCalendarProviderEventListPage> => {
      void _input;
      const next = pages.shift();

      if (next instanceof Error) {
        throw next;
      }

      if (!next) {
        return {
          items: [],
          nextPageToken: null,
          nextSyncToken: "sync-token",
        };
      }

      return next;
    }
  );

  return {
    provider: {
      refreshAccessToken: jest.fn(),
      listCalendarListPage,
      listEventsPage,
    } as GoogleCalendarReadProvider,
    listCalendarListPage,
    listEventsPage,
  };
}

function createService(
  pages: Array<GoogleCalendarProviderEventListPage | Error>
) {
  const repository = new FakeGoogleCalendarSyncRepository();
  const { provider, listCalendarListPage, listEventsPage } =
    createReadProvider(pages);
  const tokenEncryption: GoogleCalendarTokenEncryptionPort = {
    assertReady: jest.fn(),
    encrypt: jest.fn((value) => `enc:${value}`),
    decrypt: jest.fn((value) => value.replace(/^enc:/, "")),
  };
  const scheduleNotificationReminder = {
    executeWithRepository: jest.fn(async () => ({
      scheduled: false,
      canceledCount: 0,
    })),
  } as unknown as ScheduleNotificationReminderUseCase;
  const cancelScheduleNotificationReminder = {
    executeWithRepository: jest.fn(async () => 0),
  } as unknown as CancelScheduleNotificationReminderUseCase;
  const logger = {
    log: jest.fn(),
  } as unknown as AppLogger;
  const service = new GoogleCalendarSyncService(
    repository,
    provider,
    tokenEncryption,
    scheduleNotificationReminder,
    cancelScheduleNotificationReminder,
    logger
  );

  return {
    listCalendarListPage,
    listEventsPage,
    repository,
    service,
  };
}

describe("GoogleCalendarSyncService", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-23T01:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("maps all-day Google events and meeting URLs before applying synced events", async () => {
    const { listEventsPage, repository, service } = createService([
      {
        items: [
          {
            id: "event-1",
            status: "confirmed",
            summary: null,
            start: { date: "2026-07-24" },
            end: { date: "2026-07-25" },
            location: "https://location.example.com/room",
            description:
              "<p>Memo&nbsp;text</p><a href=\"https://desc.example.com\">link</a>",
            hangoutLink: "https://meet.google.com/abc-defg-hij",
            conferenceData: {
              entryPoints: [
                {
                  entryPointType: "video",
                  uri: "https://video.example.com/join",
                },
              ],
            },
            htmlLink: "https://calendar.google.com/event",
            iCalUID: "ical-1",
            etag: "etag-1",
            updated: "2026-07-23T00:00:00.000Z",
          },
        ],
        nextPageToken: null,
        nextSyncToken: "sync-token-1",
      },
    ]);

    const response = await service.syncCalendars(CURRENT_USER, {
      trigger: "MANUAL",
    });
    const appliedEvent = repository.appliedEvents[0];
    const providerInput = listEventsPage.mock.calls[0]?.[0];

    expect(providerInput).toMatchObject({
      accessToken: "access-token",
      calendarId: "primary",
      timeZone: "Asia/Seoul",
    });
    expect(providerInput).toHaveProperty("timeMin");
    expect(providerInput).toHaveProperty("timeMax");
    expect(providerInput).not.toHaveProperty("syncToken");
    expect(appliedEvent).toMatchObject({
      externalEventId: "event-1",
      isCancelled: false,
      isWithinSyncRange: true,
      fields: {
        scheduleTitle: "(제목 없음)",
        timeZone: "Asia/Seoul",
        location: "https://location.example.com/room",
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        memo: "Memo text\nlink",
        isAllDay: true,
      },
    });
    expect(appliedEvent?.fields?.startAt.toISOString()).toBe(
      "2026-07-23T15:00:00.000Z"
    );
    expect(appliedEvent?.fields?.endAt.toISOString()).toBe(
      "2026-07-24T15:00:00.000Z"
    );
    expect(response.result.importedCount).toBe(1);
    expect(repository.syncSucceededCount).toBe(1);
  });

  it("keeps invalid numeric HTML entities as memo text while decoding valid ones", async () => {
    const { repository, service } = createService([
      {
        items: [
          {
            id: "event-entity",
            status: "confirmed",
            summary: "Entity event",
            start: { dateTime: "2026-07-24T01:00:00.000Z" },
            end: { dateTime: "2026-07-24T02:00:00.000Z" },
            location: null,
            description: "<p>Memo &#99999999; &#x110000; &#65;</p>",
            hangoutLink: null,
            conferenceData: null,
            htmlLink: null,
            iCalUID: null,
            etag: null,
            updated: null,
          },
        ],
        nextPageToken: null,
        nextSyncToken: "sync-token-1",
      },
    ]);

    await service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" });

    expect(repository.appliedEvents[0]?.fields?.memo).toBe(
      "Memo &#99999999; &#x110000; A"
    );
  });

  it("clips month-end sync ranges to the last valid target-month day", async () => {
    jest.setSystemTime(new Date("2026-03-31T01:00:00.000Z"));
    const { listEventsPage, service } = createService([
      {
        items: [],
        nextPageToken: null,
        nextSyncToken: "sync-token-1",
      },
    ]);

    await service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" });

    const providerInput = listEventsPage.mock.calls[0]?.[0];
    expect(providerInput?.timeMin?.toISOString()).toBe(
      "2026-02-27T15:00:00.000Z"
    );
    expect(providerInput?.timeMax?.toISOString()).toBe(
      "2026-06-29T15:00:00.000Z"
    );
  });

  it("refreshes calendar sources before sync and skips stale selected sources", async () => {
    const { listEventsPage, repository, service } = createService([
      {
        items: [],
        nextPageToken: null,
        nextSyncToken: "sync-token-1",
      },
    ]);
    repository.sources = [
      SELECTED_SOURCE,
      {
        ...SELECTED_SOURCE,
        id: "source-stale",
        calendarId: "stale-calendar",
        calendarName: "Stale",
      },
    ];

    await service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" });

    expect(listEventsPage).toHaveBeenCalledTimes(1);
    expect(listEventsPage.mock.calls[0]?.[0].calendarId).toBe("primary");
    expect(
      repository.sources.find((source) => source.calendarId === "stale-calendar")
        ?.status
    ).toBe("UNSELECTED");
  });

  it("clears expired source sync tokens and retries with a full sync", async () => {
    const { listEventsPage, repository, service } = createService([
      new GoogleCalendarProviderSyncTokenExpiredError(),
      {
        items: [],
        nextPageToken: null,
        nextSyncToken: "fresh-token",
      },
    ]);
    repository.sources = [
      {
        ...SELECTED_SOURCE,
        syncToken: "expired-token",
      },
    ];

    await service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" });

    expect(repository.clearSourceSyncTokenCalls).toEqual(["source-1"]);
    expect(listEventsPage.mock.calls[0]?.[0]).toMatchObject({
      syncToken: "expired-token",
    });
    expect(listEventsPage.mock.calls[1]?.[0]).toHaveProperty("timeMin");
    expect(listEventsPage.mock.calls[1]?.[0]).toHaveProperty("timeMax");
    expect(listEventsPage.mock.calls[1]?.[0]).not.toHaveProperty("syncToken");
  });

  it("records source failure when expired token fallback full sync fails", async () => {
    const { repository, service } = createService([
      new GoogleCalendarProviderSyncTokenExpiredError(),
      new GoogleCalendarProviderTransientError("GOOGLE_EVENTS_UNAVAILABLE"),
    ]);
    repository.sources = [
      {
        ...SELECTED_SOURCE,
        syncToken: "expired-token",
      },
    ];

    await expect(
      service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" })
    ).rejects.toBeInstanceOf(GoogleCalendarProviderUnavailableError);
    expect(repository.clearSourceSyncTokenCalls).toEqual(["source-1"]);
    expect(repository.sourceSyncFailedErrorCode).toBe(
      "GOOGLE_EVENTS_UNAVAILABLE"
    );
  });

  it("rejects calendar selection ids outside the current provider calendar list", async () => {
    const { listCalendarListPage, service } = createService([]);
    listCalendarListPage.mockResolvedValueOnce({
      items: [
        {
          calendarId: "primary",
          calendarName: "user@example.com",
          calendarTimeZone: "Asia/Seoul",
          isPrimary: true,
        },
      ],
      nextPageToken: null,
    });

    await expect(
      service.updateCalendarSelection(CURRENT_USER, {
        selectedCalendarIds: ["stale-calendar"],
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("maps provider auth failures to reconnect required during sync", async () => {
    const { repository, service } = createService([
      new GoogleCalendarProviderAuthError("GOOGLE_EVENTS_AUTH_FAILED"),
    ]);

    await expect(
      service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" })
    ).rejects.toBeInstanceOf(GoogleCalendarReconnectRequiredError);
    expect(repository.reconnectRequiredErrorCode).toBe(
      "GOOGLE_EVENTS_AUTH_FAILED"
    );
  });

  it("maps provider transient failures to unavailable and records sync failure", async () => {
    const { repository, service } = createService([
      new GoogleCalendarProviderTransientError("GOOGLE_EVENTS_UNAVAILABLE"),
    ]);

    await expect(
      service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" })
    ).rejects.toBeInstanceOf(GoogleCalendarProviderUnavailableError);
    expect(repository.syncFailedErrorCode).toBe("GOOGLE_EVENTS_UNAVAILABLE");
  });

  it("requires at least one selected calendar source before sync", async () => {
    const { repository, service } = createService([]);
    repository.sources = [];

    await expect(
      service.syncCalendars(CURRENT_USER, { trigger: "MANUAL" })
    ).rejects.toBeInstanceOf(GoogleCalendarSourceSelectionRequiredError);
    expect(repository.syncStartedCount).toBe(0);
  });
});
