import { Inject, Injectable } from "@nestjs/common";
import {
  CancelScheduleNotificationReminderUseCase,
  ScheduleNotificationReminderUseCase,
} from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import {
  GOOGLE_CALENDAR_READ_PROVIDER,
  GoogleCalendarProviderAuthError,
  type GoogleCalendarProviderCalendar,
  type GoogleCalendarProviderEvent,
  GoogleCalendarProviderSyncTokenExpiredError,
  GoogleCalendarProviderTransientError,
  type GoogleCalendarReadProvider,
} from "@/modules/schedule/application/ports/google-calendar-read.provider";
import {
  GOOGLE_CALENDAR_SYNC_REPOSITORY,
  type GoogleCalendarSourceRecord,
  type GoogleCalendarSyncConnectionRecord,
  type GoogleCalendarSyncRepository,
  type GoogleCalendarSyncTrigger,
  type GoogleCalendarSyncedEventInput,
} from "@/modules/schedule/application/ports/google-calendar-sync.repository";
import {
  GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT,
  type GoogleCalendarTokenEncryptionPort,
} from "@/modules/schedule/application/ports/google-calendar-token-encryption.port";
import {
  GoogleCalendarConnectionNotFoundError,
  GoogleCalendarProviderUnavailableError,
  GoogleCalendarReconnectRequiredError,
  GoogleCalendarSourceSelectionRequiredError,
  GoogleCalendarSyncInProgressError,
} from "@/modules/schedule/domain/google-calendar.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DEFAULT_USER_TIME_ZONE,
  isValidIanaTimeZone,
} from "@/shared/application/time-zone/time-zone";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const ACCESS_TOKEN_REFRESH_SKEW_MS = 60_000;
const SYNC_LOCK_MS = 5 * 60_000;
const AUTO_SYNC_FRESHNESS_MS = 10 * 60_000;
const CALENDAR_LIST_PAGE_LIMIT_GUARD = 100;
const EVENTS_PAGE_LIMIT_GUARD = 100;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const URL_PATTERN = /https:\/\/[^\s<>"']+/gi;
const SYSTEM_CONTACTS_CALENDAR_ID =
  "addressbook#contacts@group.v.calendar.google.com";
const SYSTEM_HOLIDAY_CALENDAR_SUFFIX = "#holiday@group.v.calendar.google.com";
const EMPTY_GOOGLE_EVENT_TITLE = "(제목 없음)";

type CalendarDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

type DateTimeParts = CalendarDate & {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
};

interface GoogleCalendarConnectionResponse {
  readonly provider: "GOOGLE";
  readonly status: string;
  readonly providerAccountEmail: string | null;
  readonly connectedAt: string | null;
  readonly reconnectRequiredAt: string | null;
  readonly disconnectedAt: string | null;
  readonly lastSyncedAt: string | null;
  readonly lastSyncStartedAt: string | null;
  readonly lastSyncFailedAt: string | null;
  readonly lastSyncErrorCode: string | null;
  readonly syncLockExpiresAt: string | null;
}

interface GoogleCalendarSourceResponse {
  readonly id: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly calendarTimeZone: string | null;
  readonly isPrimary: boolean;
  readonly isSystemCalendar: boolean;
  readonly status: string;
  readonly lastSyncedAt: string | null;
  readonly lastSyncFailedAt: string | null;
  readonly lastSyncErrorCode: string | null;
}

export interface ListGoogleCalendarsResponse {
  readonly connection: GoogleCalendarConnectionResponse;
  readonly calendars: GoogleCalendarSourceResponse[];
}

export interface UpdateGoogleCalendarSelectionCommand {
  readonly selectedCalendarIds: string[];
}

export interface SyncGoogleCalendarCommand {
  readonly trigger?: GoogleCalendarSyncTrigger;
}

export interface GoogleCalendarSyncResponse {
  readonly trigger: GoogleCalendarSyncTrigger;
  readonly connectionStatus: "CONNECTED";
  readonly rangeStartAt: string;
  readonly rangeEndAt: string;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly selectedCalendarCount: number;
  readonly result: {
    readonly importedCount: number;
    readonly updatedCount: number;
    readonly localModifiedSkippedCount: number;
    readonly googleDeletedCount: number;
    readonly hiddenByCalendarSelectionCount: number;
    readonly trashedCount: number;
    readonly reminderScheduledCount: number;
    readonly reminderCanceledCount: number;
    readonly errorCount: number;
  };
  readonly nextAutoSyncAvailableAt: string;
}

@Injectable()
export class GoogleCalendarSyncService {
  constructor(
    @Inject(GOOGLE_CALENDAR_SYNC_REPOSITORY)
    private readonly syncRepository: GoogleCalendarSyncRepository,
    @Inject(GOOGLE_CALENDAR_READ_PROVIDER)
    private readonly readProvider: GoogleCalendarReadProvider,
    @Inject(GOOGLE_CALENDAR_TOKEN_ENCRYPTION_PORT)
    private readonly tokenEncryption: GoogleCalendarTokenEncryptionPort,
    private readonly scheduleNotificationReminder: ScheduleNotificationReminderUseCase,
    private readonly cancelScheduleNotificationReminder: CancelScheduleNotificationReminderUseCase,
    private readonly logger: AppLogger
  ) {}

  async listCalendars(
    currentUser: CurrentUserContext
  ): Promise<ListGoogleCalendarsResponse> {
    const now = new Date();
    const connection = await this.getConnectedConnection(currentUser.id);

    try {
      const accessToken = await this.ensureUsableAccessToken({
        userId: currentUser.id,
        connection,
        now,
      });
      const providerCalendars = await this.fetchProviderCalendars(accessToken);
      const sources = await this.syncRepository.upsertCalendarSources({
        userId: currentUser.id,
        connectionId: connection.id,
        sources: providerCalendars.map((calendar) => ({
          calendarId: calendar.calendarId,
          calendarName: calendar.calendarName,
          calendarTimeZone: calendar.calendarTimeZone,
          isPrimary: calendar.isPrimary,
          isSystemCalendar: this.isSystemCalendar(calendar.calendarId),
        })),
      });

      return {
        connection: this.toConnectionResponse(connection),
        calendars: sources.map((source) => this.toSourceResponse(source)),
      };
    } catch (error) {
      await this.rethrowMappedProviderError({
        userId: currentUser.id,
        connection,
        now,
        error,
      });
      throw error;
    }
  }

  async updateCalendarSelection(
    currentUser: CurrentUserContext,
    input: UpdateGoogleCalendarSelectionCommand
  ): Promise<ListGoogleCalendarsResponse> {
    const selectedCalendarIds = this.normalizeSelectedCalendarIds(
      input.selectedCalendarIds
    );
    const now = new Date();
    const connection = await this.getConnectedConnection(currentUser.id);
    let currentCalendarIds = new Set<string>();

    try {
      const accessToken = await this.ensureUsableAccessToken({
        userId: currentUser.id,
        connection,
        now,
      });
      const providerCalendars = await this.fetchProviderCalendars(accessToken);
      currentCalendarIds = new Set(
        providerCalendars.map((calendar) => calendar.calendarId)
      );
      await this.syncRepository.upsertCalendarSources({
        userId: currentUser.id,
        connectionId: connection.id,
        sources: providerCalendars.map((calendar) => ({
          calendarId: calendar.calendarId,
          calendarName: calendar.calendarName,
          calendarTimeZone: calendar.calendarTimeZone,
          isPrimary: calendar.isPrimary,
          isSystemCalendar: this.isSystemCalendar(calendar.calendarId),
        })),
      });

      if (
        selectedCalendarIds.some(
          (calendarId) => !currentCalendarIds.has(calendarId)
        )
      ) {
        throw new ValidationDomainError(
          "selectedCalendarIds must belong to the current Google Calendar list"
        );
      }
    } catch (error) {
      await this.rethrowMappedProviderError({
        userId: currentUser.id,
        connection,
        now,
        error,
      });
      throw error;
    }

    const selection = await this.syncRepository.runInTransaction(
      async (repository) => {
        const updated = await repository.updateCalendarSelection({
          userId: currentUser.id,
          connectionId: connection.id,
          selectedCalendarIds,
        });

        if (!updated) {
          throw new ValidationDomainError(
            "selectedCalendarIds must belong to the Google Calendar connection"
          );
        }

        let reminderCanceledCount = 0;

        for (const scheduleId of updated.hiddenScheduleIds) {
          reminderCanceledCount +=
            await this.cancelScheduleNotificationReminder.executeWithRepository(
              {
                userId: currentUser.id,
                scheduleId,
                cancelReason: "SOURCE_HIDDEN",
                now,
              },
              repository
            );
        }

        return { ...updated, reminderCanceledCount };
      }
    );

    this.logEvent("schedule.google.calendar_selection.updated", {
      userId: currentUser.id,
      connectionId: connection.id,
      calendarSourceCount: selection.sources.length,
      selectedCalendarSourceCount: selectedCalendarIds.length,
      hiddenScheduleCount: selection.hiddenScheduleIds.length,
      reminderCanceledCount: selection.reminderCanceledCount,
    });

    return {
      connection: this.toConnectionResponse(connection),
      calendars: selection.sources
        .filter((source) => currentCalendarIds.has(source.calendarId))
        .map((source) => this.toSourceResponse(source)),
    };
  }

  async syncCalendars(
    currentUser: CurrentUserContext,
    input: SyncGoogleCalendarCommand
  ): Promise<GoogleCalendarSyncResponse> {
    const trigger = input.trigger ?? "MANUAL";
    const startedAt = new Date();
    const connection = await this.getConnectedConnection(currentUser.id);
    let selectedSources = await this.syncRepository.listSelectedSources({
      userId: currentUser.id,
      connectionId: connection.id,
    });

    if (selectedSources.length === 0) {
      throw new GoogleCalendarSourceSelectionRequiredError();
    }

    if (
      connection.syncLockExpiresAt &&
      connection.syncLockExpiresAt.getTime() > startedAt.getTime()
    ) {
      throw new GoogleCalendarSyncInProgressError();
    }

    const timeZone = this.resolveUserTimeZone(currentUser.timeZone);
    const range = this.createSyncRange(startedAt, timeZone);

    if (trigger === "AUTO" && this.isAutoSyncFresh(connection, startedAt)) {
      return this.createEmptySyncResponse({
        trigger,
        startedAt,
        finishedAt: startedAt,
        rangeStartAt: range.startAt,
        rangeEndAt: range.endAt,
        selectedCalendarCount: selectedSources.length,
      });
    }

    let accessToken: string;

    try {
      accessToken = await this.ensureUsableAccessToken({
        userId: currentUser.id,
        connection,
        now: startedAt,
      });
    } catch (error) {
      if (error instanceof GoogleCalendarProviderTransientError) {
        await this.syncRepository.markConnectionSyncFailed({
          userId: currentUser.id,
          connectionId: connection.id,
          failedAt: new Date(),
          errorCode: error.safeCode,
        });
        throw new GoogleCalendarProviderUnavailableError();
      }

      throw error;
    }

    try {
      const currentSources = await this.refreshCalendarSources({
        userId: currentUser.id,
        connectionId: connection.id,
        accessToken,
      });
      selectedSources = currentSources.filter(
        (source) => source.status === "SELECTED"
      );
    } catch (error) {
      if (error instanceof GoogleCalendarProviderAuthError) {
        await this.syncRepository.markConnectionReconnectRequired({
          userId: currentUser.id,
          connectionId: connection.id,
          now: new Date(),
          errorCode: error.safeCode,
        });
        throw new GoogleCalendarReconnectRequiredError();
      }

      if (error instanceof GoogleCalendarProviderTransientError) {
        await this.syncRepository.markConnectionSyncFailed({
          userId: currentUser.id,
          connectionId: connection.id,
          failedAt: new Date(),
          errorCode: error.safeCode,
        });
        throw new GoogleCalendarProviderUnavailableError();
      }

      throw error;
    }

    if (selectedSources.length === 0) {
      throw new GoogleCalendarSourceSelectionRequiredError();
    }

    const lockAcquired = await this.syncRepository.markConnectionSyncStarted({
      userId: currentUser.id,
      connectionId: connection.id,
      startedAt,
      lockExpiresAt: new Date(startedAt.getTime() + SYNC_LOCK_MS),
    });

    if (!lockAcquired) {
      throw new GoogleCalendarSyncInProgressError();
    }

    this.logEvent("schedule.google.sync.started", {
      userId: currentUser.id,
      connectionId: connection.id,
      trigger,
      rangeStartAt: range.startAt.toISOString(),
      rangeEndAt: range.endAt.toISOString(),
      selectedCalendarSourceCount: selectedSources.length,
    });

    const counts = this.createZeroCounts();

    try {
      for (const source of selectedSources) {
        const sourceResult = await this.syncSource({
          userId: currentUser.id,
          accessToken,
          source,
          rangeStartAt: range.startAt,
          rangeEndAt: range.endAt,
          timeZone,
          syncedAt: startedAt,
        });

        this.addCounts(counts, sourceResult);
      }

      const finishedAt = new Date();
      await this.syncRepository.markConnectionSyncSucceeded({
        userId: currentUser.id,
        connectionId: connection.id,
        finishedAt,
      });

      this.logEvent("schedule.google.sync.completed", {
        userId: currentUser.id,
        connectionId: connection.id,
        trigger,
        importedCount: counts.importedCount,
        updatedCount: counts.updatedCount,
        localModifiedSkippedCount: counts.localModifiedSkippedCount,
        googleDeletedCount: counts.googleDeletedCount,
        errorCount: counts.errorCount,
      });

      return this.toSyncResponse({
        trigger,
        startedAt,
        finishedAt,
        rangeStartAt: range.startAt,
        rangeEndAt: range.endAt,
        selectedCalendarCount: selectedSources.length,
        counts,
      });
    } catch (error) {
      if (error instanceof GoogleCalendarProviderAuthError) {
        await this.syncRepository.markConnectionReconnectRequired({
          userId: currentUser.id,
          connectionId: connection.id,
          now: new Date(),
          errorCode: error.safeCode,
        });
        this.logEvent("schedule.google.sync.failed", {
          userId: currentUser.id,
          connectionId: connection.id,
          trigger,
          errorCode: error.safeCode,
        });
        throw new GoogleCalendarReconnectRequiredError();
      }

      if (error instanceof GoogleCalendarProviderTransientError) {
        await this.syncRepository.markConnectionSyncFailed({
          userId: currentUser.id,
          connectionId: connection.id,
          failedAt: new Date(),
          errorCode: error.safeCode,
        });
        this.logEvent("schedule.google.sync.failed", {
          userId: currentUser.id,
          connectionId: connection.id,
          trigger,
          errorCode: error.safeCode,
        });
        throw new GoogleCalendarProviderUnavailableError();
      }

      await this.syncRepository.markConnectionSyncFailed({
        userId: currentUser.id,
        connectionId: connection.id,
        failedAt: new Date(),
        errorCode: "GOOGLE_SYNC_FAILED",
      });
      throw error;
    }
  }

  private async getConnectedConnection(
    userId: string
  ): Promise<GoogleCalendarSyncConnectionRecord> {
    this.tokenEncryption.assertReady();
    const connection = await this.syncRepository.findConnectionForUser(userId);

    if (!connection || connection.status === "DISCONNECTED") {
      throw new GoogleCalendarConnectionNotFoundError();
    }

    if (connection.status === "RECONNECT_REQUIRED") {
      throw new GoogleCalendarReconnectRequiredError();
    }

    return connection;
  }

  private async ensureUsableAccessToken(input: {
    readonly userId: string;
    readonly connection: GoogleCalendarSyncConnectionRecord;
    readonly now: Date;
  }): Promise<string> {
    const shouldRefresh =
      !input.connection.encryptedAccessToken ||
      !input.connection.tokenExpiresAt ||
      input.connection.tokenExpiresAt.getTime() <=
        input.now.getTime() + ACCESS_TOKEN_REFRESH_SKEW_MS;

    if (!shouldRefresh && input.connection.encryptedAccessToken) {
      return this.tokenEncryption.decrypt(input.connection.encryptedAccessToken);
    }

    if (!input.connection.encryptedRefreshToken) {
      await this.syncRepository.markConnectionReconnectRequired({
        userId: input.userId,
        connectionId: input.connection.id,
        now: input.now,
        errorCode: "GOOGLE_REFRESH_TOKEN_MISSING",
      });
      throw new GoogleCalendarReconnectRequiredError();
    }

    const refreshToken = this.tokenEncryption.decrypt(
      input.connection.encryptedRefreshToken
    );

    try {
      const refreshed = await this.readProvider.refreshAccessToken(refreshToken);
      const tokenExpiresAt = refreshed.expiresInSeconds
        ? new Date(input.now.getTime() + refreshed.expiresInSeconds * 1000)
        : null;

      await this.syncRepository.updateConnectionAccessToken({
        userId: input.userId,
        connectionId: input.connection.id,
        encryptedAccessToken: this.tokenEncryption.encrypt(
          refreshed.accessToken
        ),
        tokenExpiresAt,
        grantedScopes: refreshed.grantedScopes,
      });

      return refreshed.accessToken;
    } catch (error) {
      if (error instanceof GoogleCalendarProviderAuthError) {
        await this.syncRepository.markConnectionReconnectRequired({
          userId: input.userId,
          connectionId: input.connection.id,
          now: input.now,
          errorCode: error.safeCode,
        });
        throw new GoogleCalendarReconnectRequiredError();
      }

      throw error;
    }
  }

  private async fetchProviderCalendars(
    accessToken: string
  ): Promise<readonly GoogleCalendarProviderCalendar[]> {
    const calendars: GoogleCalendarProviderCalendar[] = [];
    let pageToken: string | undefined;

    for (let page = 0; page < CALENDAR_LIST_PAGE_LIMIT_GUARD; page += 1) {
      const response = await this.readProvider.listCalendarListPage({
        accessToken,
        ...(pageToken ? { pageToken } : {}),
      });
      calendars.push(...response.items);

      if (!response.nextPageToken) {
        return calendars;
      }

      pageToken = response.nextPageToken;
    }

    throw new GoogleCalendarProviderTransientError("GOOGLE_CALENDAR_LIST_LOOP");
  }

  private async refreshCalendarSources(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly accessToken: string;
  }): Promise<readonly GoogleCalendarSourceRecord[]> {
    const providerCalendars = await this.fetchProviderCalendars(input.accessToken);

    return this.syncRepository.upsertCalendarSources({
      userId: input.userId,
      connectionId: input.connectionId,
      sources: providerCalendars.map((calendar) => ({
        calendarId: calendar.calendarId,
        calendarName: calendar.calendarName,
        calendarTimeZone: calendar.calendarTimeZone,
        isPrimary: calendar.isPrimary,
        isSystemCalendar: this.isSystemCalendar(calendar.calendarId),
      })),
    });
  }

  private async rethrowMappedProviderError(input: {
    readonly userId: string;
    readonly connection: GoogleCalendarSyncConnectionRecord;
    readonly now: Date;
    readonly error: unknown;
  }): Promise<void> {
    if (input.error instanceof GoogleCalendarProviderAuthError) {
      await this.syncRepository.markConnectionReconnectRequired({
        userId: input.userId,
        connectionId: input.connection.id,
        now: input.now,
        errorCode: input.error.safeCode,
      });
      throw new GoogleCalendarReconnectRequiredError();
    }

    if (input.error instanceof GoogleCalendarProviderTransientError) {
      throw new GoogleCalendarProviderUnavailableError();
    }
  }

  private async syncSource(input: {
    readonly userId: string;
    readonly accessToken: string;
    readonly source: GoogleCalendarSourceRecord;
    readonly rangeStartAt: Date;
    readonly rangeEndAt: Date;
    readonly timeZone: string;
    readonly syncedAt: Date;
  }) {
    try {
      return await this.syncSourceWithMode({
        ...input,
        syncToken: input.source.syncToken,
      });
    } catch (error) {
      if (
        error instanceof GoogleCalendarProviderSyncTokenExpiredError &&
        input.source.syncToken
      ) {
        await this.syncRepository.clearSourceSyncToken({
          userId: input.userId,
          sourceId: input.source.id,
        });
        try {
          return await this.syncSourceWithMode({
            ...input,
            syncToken: null,
          });
        } catch (retryError) {
          if (retryError instanceof GoogleCalendarProviderTransientError) {
            await this.syncRepository.markSourceSyncFailed({
              userId: input.userId,
              sourceId: input.source.id,
              failedAt: new Date(),
              errorCode: retryError.safeCode,
            });
          }

          throw retryError;
        }
      }

      if (error instanceof GoogleCalendarProviderTransientError) {
        await this.syncRepository.markSourceSyncFailed({
          userId: input.userId,
          sourceId: input.source.id,
          failedAt: new Date(),
          errorCode: error.safeCode,
        });
      }

      throw error;
    }
  }

  private async syncSourceWithMode(input: {
    readonly userId: string;
    readonly accessToken: string;
    readonly source: GoogleCalendarSourceRecord;
    readonly rangeStartAt: Date;
    readonly rangeEndAt: Date;
    readonly timeZone: string;
    readonly syncedAt: Date;
    readonly syncToken: string | null;
  }) {
    const events: GoogleCalendarSyncedEventInput[] = [];
    let mappingErrorCount = 0;
    let completed = false;
    let pageToken: string | undefined;
    let nextSyncToken: string | null = null;

    for (let page = 0; page < EVENTS_PAGE_LIMIT_GUARD; page += 1) {
      const response = await this.readProvider.listEventsPage({
        accessToken: input.accessToken,
        calendarId: input.source.calendarId,
        timeZone: input.timeZone,
        ...(input.syncToken
          ? { syncToken: input.syncToken }
          : { timeMin: input.rangeStartAt, timeMax: input.rangeEndAt }),
        ...(pageToken ? { pageToken } : {}),
      });

      for (const providerEvent of response.items) {
        const normalized = this.normalizeProviderEvent(
          providerEvent,
          input.source,
          input.timeZone
        );

        if (normalized) {
          events.push({
            ...normalized,
            isWithinSyncRange: normalized.fields
              ? this.isInstantRangeOverlapping(
                  normalized.fields.startAt,
                  normalized.fields.endAt,
                  input.rangeStartAt,
                  input.rangeEndAt
                )
              : true,
          });
        } else {
          mappingErrorCount += 1;
        }
      }

      if (!response.nextPageToken) {
        nextSyncToken = response.nextSyncToken;
        completed = true;
        break;
      }

      pageToken = response.nextPageToken;
    }

    if (!completed) {
      throw new GoogleCalendarProviderTransientError("GOOGLE_EVENTS_LIST_LOOP");
    }

    const applied = await this.syncRepository.runInTransaction(
      async (repository) => {
        const result = await repository.applySyncedEvents({
          userId: input.userId,
          source: input.source,
          events,
          nextSyncToken,
          syncedAt: input.syncedAt,
        });
        let reminderScheduledCount = 0;
        let reminderCanceledCount = 0;

        for (const request of result.reminderScheduleRequests) {
          const scheduled =
            await this.scheduleNotificationReminder.executeWithRepository(
              {
                userId: input.userId,
                scheduleId: request.scheduleId,
                scheduleTitle: request.scheduleTitle,
                startAt: request.startAt,
                now: input.syncedAt,
              },
              repository
            );
          reminderScheduledCount += scheduled.scheduled ? 1 : 0;
          reminderCanceledCount += scheduled.canceledCount;
        }

        for (const scheduleId of result.reminderCancelScheduleIds) {
          reminderCanceledCount +=
            await this.cancelScheduleNotificationReminder.executeWithRepository(
              {
                userId: input.userId,
                scheduleId,
                cancelReason: "SOURCE_DELETED",
                now: input.syncedAt,
              },
              repository
            );
        }

        return {
          ...result,
          reminderScheduledCount,
          reminderCanceledCount,
        };
      }
    );

    return {
      importedCount: applied.importedCount,
      updatedCount: applied.updatedCount,
      localModifiedSkippedCount: applied.localModifiedSkippedCount,
      googleDeletedCount: applied.googleDeletedCount,
      hiddenByCalendarSelectionCount: 0,
      trashedCount: applied.trashedCount,
      reminderScheduledCount: applied.reminderScheduledCount,
      reminderCanceledCount: applied.reminderCanceledCount,
      errorCount: mappingErrorCount,
    };
  }

  private normalizeProviderEvent(
    event: GoogleCalendarProviderEvent,
    source: GoogleCalendarSourceRecord,
    fallbackTimeZone: string
  ): GoogleCalendarSyncedEventInput | null {
    if (!event.id || event.id.trim().length === 0) {
      return null;
    }

    const isCancelled = event.status === "cancelled";
    const base = {
      externalEventId: event.id,
      externalEventICalUid: this.normalizeNullableText(event.iCalUID, 255),
      externalEventEtag: this.normalizeNullableText(event.etag, 255),
      externalHtmlLink: this.normalizeNullableUrl(event.htmlLink),
      externalUpdatedAt: this.parseOptionalInstant(event.updated),
      isWithinSyncRange: true,
    };

    if (isCancelled) {
      return {
        ...base,
        isCancelled: true,
        fields: null,
      };
    }

    if (!event.start || !event.end) {
      return null;
    }

    const sourceTimeZone =
      event.start.timeZone ??
      source.calendarTimeZone ??
      fallbackTimeZone ??
      DEFAULT_USER_TIME_ZONE;
    const timeZone = isValidIanaTimeZone(sourceTimeZone)
      ? sourceTimeZone
      : DEFAULT_USER_TIME_ZONE;
    const allDay = Boolean(event.start.date && event.end.date);
    const startAt = allDay
      ? this.dateOnlyToZonedStartOfDay(event.start.date ?? "", timeZone)
      : this.parseOptionalInstant(event.start.dateTime ?? null);
    const endAt = allDay
      ? this.dateOnlyToZonedStartOfDay(event.end.date ?? "", timeZone)
      : this.parseOptionalInstant(event.end.dateTime ?? null);

    if (!startAt || !endAt || endAt.getTime() <= startAt.getTime()) {
      return null;
    }

    const descriptionMemo = this.normalizeDescriptionToMemo(event.description);
    const location = this.normalizeNullableText(event.location, 200);

    return {
      ...base,
      isCancelled: false,
      fields: {
        scheduleTitle:
          this.normalizeNullableText(event.summary, 100) ??
          EMPTY_GOOGLE_EVENT_TITLE,
        startAt,
        endAt,
        timeZone,
        location,
        meetingUrl: this.extractMeetingUrl(event),
        memo: descriptionMemo,
        isAllDay: allDay,
      },
    };
  }

  private extractMeetingUrl(
    event: GoogleCalendarProviderEvent
  ): string | null {
    const candidates = [
      event.hangoutLink,
      event.conferenceData?.entryPoints.find(
        (entryPoint) => entryPoint.entryPointType === "video"
      )?.uri ?? null,
      this.extractFirstDescriptionUrl(event.description),
      event.location,
    ];

    for (const candidate of candidates) {
      const normalized = this.normalizeNullableUrl(candidate);

      if (normalized) {
        return normalized;
      }
    }

    return null;
  }

  private extractFirstDescriptionUrl(description: string | null): string | null {
    if (!description) {
      return null;
    }

    for (const match of description.matchAll(URL_PATTERN)) {
      const normalized = this.normalizeNullableUrl(
        this.trimUrlTrailingPunctuation(match[0])
      );

      if (normalized) {
        return normalized;
      }
    }

    return null;
  }

  private normalizeDescriptionToMemo(description: string | null): string | null {
    if (!description) {
      return null;
    }

    const normalized = this.decodeHtmlEntities(
      description
        .replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
    )
      .replace(/[ \t\r\f\v]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (normalized.length === 0) {
      return null;
    }

    return normalized.slice(0, 2000);
  }

  private decodeHtmlEntities(value: string): string {
    return value
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#(\d+);/g, (_match, code: string) =>
        this.decodeHtmlCodePoint(_match, Number(code))
      )
      .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
        this.decodeHtmlCodePoint(_match, Number.parseInt(code, 16))
      );
  }

  private decodeHtmlCodePoint(fallback: string, codePoint: number): string {
    if (
      !Number.isInteger(codePoint) ||
      codePoint <= 0 ||
      codePoint > 0x10ffff
    ) {
      return fallback;
    }

    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return fallback;
    }
  }

  private normalizeNullableText(
    value: string | null | undefined,
    maxLength: number
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return null;
    }

    return normalized.slice(0, maxLength);
  }

  private normalizeNullableUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const normalized = this.trimUrlTrailingPunctuation(value.trim());

    return this.isValidHttpsUrl(normalized) ? normalized : null;
  }

  private trimUrlTrailingPunctuation(value: string): string {
    return value.replace(/[),.;\]]+$/g, "");
  }

  private isValidHttpsUrl(value: string | null): value is string {
    if (!value || /\s/.test(value)) {
      return false;
    }

    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }

  private parseOptionalInstant(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private dateOnlyToZonedStartOfDay(value: string, timeZone: string): Date | null {
    const date = this.parseDateOnlyOrNull(value);

    if (!date) {
      return null;
    }

    return this.zonedTimeToUtc(
      {
        ...date,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
      timeZone
    );
  }

  private parseDateOnlyOrNull(value: string): CalendarDate | null {
    const match = DATE_ONLY_PATTERN.exec(value);

    if (!match) {
      return null;
    }

    const [, yearText, monthText, dayText] = match;

    if (!yearText || !monthText || !dayText) {
      return null;
    }

    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return { year, month, day };
  }

  private createSyncRange(now: Date, timeZone: string) {
    const todayParts = this.getTimeZoneParts(now, timeZone);
    const today = {
      year: todayParts.year,
      month: todayParts.month,
      day: todayParts.day,
    };

    return {
      startAt: this.dateOnlyToZonedStartOfDay(
        this.formatCalendarDate(this.addCalendarMonths(today, -1)),
        timeZone
      )!,
      endAt: this.dateOnlyToZonedStartOfDay(
        this.formatCalendarDate(this.addCalendarMonths(today, 3)),
        timeZone
      )!,
    };
  }

  private addCalendarMonths(date: CalendarDate, months: number): CalendarDate {
    const targetMonthIndex = date.month - 1 + months;
    const targetYear = date.year + Math.floor(targetMonthIndex / 12);
    const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
    const targetDay = Math.min(
      date.day,
      this.getDaysInCalendarMonth(targetYear, targetMonth + 1)
    );

    return {
      year: targetYear,
      month: targetMonth + 1,
      day: targetDay,
    };
  }

  private getDaysInCalendarMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  private zonedTimeToUtc(parts: DateTimeParts, timeZone: string): Date {
    const utcGuess = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
      )
    );
    const timeZoneParts = this.getTimeZoneParts(utcGuess, timeZone);
    const asUtc = Date.UTC(
      timeZoneParts.year,
      timeZoneParts.month - 1,
      timeZoneParts.day,
      timeZoneParts.hour,
      timeZoneParts.minute,
      timeZoneParts.second,
      timeZoneParts.millisecond
    );
    const offset = asUtc - utcGuess.getTime();

    return new Date(utcGuess.getTime() - offset);
  }

  private getTimeZoneParts(date: Date, timeZone: string): DateTimeParts {
    const formatter = new Intl.DateTimeFormat("en-US", {
      calendar: "iso8601",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone,
      year: "numeric",
    });
    const values = new Map(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );

    return {
      year: values.get("year") ?? 0,
      month: values.get("month") ?? 0,
      day: values.get("day") ?? 0,
      hour: values.get("hour") ?? 0,
      minute: values.get("minute") ?? 0,
      second: values.get("second") ?? 0,
      millisecond: 0,
    };
  }

  private formatCalendarDate(date: CalendarDate): string {
    return [
      date.year.toString().padStart(4, "0"),
      date.month.toString().padStart(2, "0"),
      date.day.toString().padStart(2, "0"),
    ].join("-");
  }

  private resolveUserTimeZone(timeZone: string): string {
    return isValidIanaTimeZone(timeZone) ? timeZone : DEFAULT_USER_TIME_ZONE;
  }

  private isAutoSyncFresh(
    connection: GoogleCalendarSyncConnectionRecord,
    now: Date
  ): boolean {
    const freshnessAt = [
      connection.lastSyncedAt,
      connection.lastSyncStartedAt,
      connection.lastSyncFailedAt,
    ]
      .filter((value): value is Date => value !== null)
      .sort((left, right) => right.getTime() - left.getTime())[0];

    return Boolean(
      freshnessAt && freshnessAt.getTime() + AUTO_SYNC_FRESHNESS_MS > now.getTime()
    );
  }

  private isInstantRangeOverlapping(
    startAt: Date,
    endAt: Date,
    rangeStartAt: Date,
    rangeEndAt: Date
  ) {
    return (
      startAt.getTime() < rangeEndAt.getTime() &&
      endAt.getTime() > rangeStartAt.getTime()
    );
  }

  private isSystemCalendar(calendarId: string): boolean {
    return (
      calendarId.endsWith(SYSTEM_HOLIDAY_CALENDAR_SUFFIX) ||
      calendarId === SYSTEM_CONTACTS_CALENDAR_ID
    );
  }

  private normalizeSelectedCalendarIds(values: readonly string[]): string[] {
    if (!Array.isArray(values) || values.length === 0) {
      throw new GoogleCalendarSourceSelectionRequiredError();
    }

    const normalized = values.map((value) => value.trim());

    if (normalized.some((value) => value.length === 0)) {
      throw new GoogleCalendarSourceSelectionRequiredError();
    }

    if (new Set(normalized).size !== normalized.length) {
      throw new ValidationDomainError(
        "selectedCalendarIds must not contain duplicates"
      );
    }

    return normalized;
  }

  private createEmptySyncResponse(input: {
    readonly trigger: GoogleCalendarSyncTrigger;
    readonly startedAt: Date;
    readonly finishedAt: Date;
    readonly rangeStartAt: Date;
    readonly rangeEndAt: Date;
    readonly selectedCalendarCount: number;
  }): GoogleCalendarSyncResponse {
    return this.toSyncResponse({
      ...input,
      counts: this.createZeroCounts(),
    });
  }

  private toSyncResponse(input: {
    readonly trigger: GoogleCalendarSyncTrigger;
    readonly startedAt: Date;
    readonly finishedAt: Date;
    readonly rangeStartAt: Date;
    readonly rangeEndAt: Date;
    readonly selectedCalendarCount: number;
    readonly counts: ReturnType<GoogleCalendarSyncService["createZeroCounts"]>;
  }): GoogleCalendarSyncResponse {
    return {
      trigger: input.trigger,
      connectionStatus: "CONNECTED",
      rangeStartAt: input.rangeStartAt.toISOString(),
      rangeEndAt: input.rangeEndAt.toISOString(),
      startedAt: input.startedAt.toISOString(),
      finishedAt: input.finishedAt.toISOString(),
      selectedCalendarCount: input.selectedCalendarCount,
      result: { ...input.counts },
      nextAutoSyncAvailableAt: new Date(
        input.finishedAt.getTime() + AUTO_SYNC_FRESHNESS_MS
      ).toISOString(),
    };
  }

  private createZeroCounts() {
    return {
      importedCount: 0,
      updatedCount: 0,
      localModifiedSkippedCount: 0,
      googleDeletedCount: 0,
      hiddenByCalendarSelectionCount: 0,
      trashedCount: 0,
      reminderScheduledCount: 0,
      reminderCanceledCount: 0,
      errorCount: 0,
    };
  }

  private addCounts(
    target: ReturnType<GoogleCalendarSyncService["createZeroCounts"]>,
    source: ReturnType<GoogleCalendarSyncService["createZeroCounts"]>
  ): void {
    target.importedCount += source.importedCount;
    target.updatedCount += source.updatedCount;
    target.localModifiedSkippedCount += source.localModifiedSkippedCount;
    target.googleDeletedCount += source.googleDeletedCount;
    target.hiddenByCalendarSelectionCount += source.hiddenByCalendarSelectionCount;
    target.trashedCount += source.trashedCount;
    target.reminderScheduledCount += source.reminderScheduledCount;
    target.reminderCanceledCount += source.reminderCanceledCount;
    target.errorCount += source.errorCount;
  }

  private toConnectionResponse(
    connection: GoogleCalendarSyncConnectionRecord
  ): GoogleCalendarConnectionResponse {
    return {
      provider: "GOOGLE",
      status: connection.status,
      providerAccountEmail: connection.providerAccountEmail,
      connectedAt: connection.connectedAt?.toISOString() ?? null,
      reconnectRequiredAt: connection.reconnectRequiredAt?.toISOString() ?? null,
      disconnectedAt: connection.disconnectedAt?.toISOString() ?? null,
      lastSyncedAt: connection.lastSyncedAt?.toISOString() ?? null,
      lastSyncStartedAt: connection.lastSyncStartedAt?.toISOString() ?? null,
      lastSyncFailedAt: connection.lastSyncFailedAt?.toISOString() ?? null,
      lastSyncErrorCode: connection.lastSyncErrorCode,
      syncLockExpiresAt: connection.syncLockExpiresAt?.toISOString() ?? null,
    };
  }

  private toSourceResponse(
    source: GoogleCalendarSourceRecord
  ): GoogleCalendarSourceResponse {
    return {
      id: source.id,
      calendarId: source.calendarId,
      calendarName: source.calendarName,
      calendarTimeZone: source.calendarTimeZone,
      isPrimary: source.isPrimary,
      isSystemCalendar: source.isSystemCalendar,
      status: source.status,
      lastSyncedAt: source.lastSyncedAt?.toISOString() ?? null,
      lastSyncFailedAt: source.lastSyncFailedAt?.toISOString() ?? null,
      lastSyncErrorCode: source.lastSyncErrorCode,
    };
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "GoogleCalendarSyncService"
    );
  }
}
