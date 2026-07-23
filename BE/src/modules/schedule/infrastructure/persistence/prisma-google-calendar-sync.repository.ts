import {
  type CancelPendingNotificationsBySourceInput,
  type NotificationRecord,
  type NotificationSettingsRecord,
  type UpsertReminderNotificationInput,
} from "@/modules/notification/application/ports/notification.repository";
import { PrismaNotificationRepository } from "@/modules/notification/infrastructure/persistence/prisma-notification.repository";
import {
  type ApplyGoogleCalendarEventsResult,
  type GoogleCalendarSourceRecord,
  type GoogleCalendarSyncConnectionRecord,
  type GoogleCalendarSyncRepository,
  type GoogleCalendarSyncedEventInput,
  type ScheduleReminderRequest,
  type UpdateGoogleCalendarSelectionResult,
  type UpsertGoogleCalendarSourceInput,
} from "@/modules/schedule/application/ports/google-calendar-sync.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { Prisma } from "@prisma/client";

type GoogleCalendarSyncPrismaClient = PrismaService | Prisma.TransactionClient;

type ConnectionRow = {
  readonly id: string;
  readonly status: string;
  readonly providerAccountEmail: string | null;
  readonly encryptedAccessToken: string | null;
  readonly encryptedRefreshToken: string | null;
  readonly tokenExpiresAt: Date | null;
  readonly connectedAt: Date | null;
  readonly reconnectRequiredAt: Date | null;
  readonly disconnectedAt: Date | null;
  readonly lastSyncedAt: Date | null;
  readonly lastSyncStartedAt: Date | null;
  readonly lastSyncFailedAt: Date | null;
  readonly lastSyncErrorCode: string | null;
  readonly syncLockExpiresAt: Date | null;
};

type SourceRow = {
  readonly id: string;
  readonly calendarId: string;
  readonly calendarName: string;
  readonly calendarTimeZone: string | null;
  readonly isPrimary: boolean;
  readonly isSystemCalendar: boolean;
  readonly status: string;
  readonly syncToken: string | null;
  readonly lastSyncedAt: Date | null;
  readonly lastSyncFailedAt: Date | null;
  readonly lastSyncErrorCode: string | null;
};

type ExistingScheduleRow = {
  readonly id: string;
  readonly scheduleTitle: string;
  readonly startAt: Date;
  readonly deletedAt: Date | null;
  readonly externalSyncStatus: string | null;
};

export class PrismaGoogleCalendarSyncRepository
  implements GoogleCalendarSyncRepository
{
  constructor(
    private readonly client: GoogleCalendarSyncPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repository: GoogleCalendarSyncRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) =>
      work(new PrismaGoogleCalendarSyncRepository(transaction, null))
    );
  }

  async findSettingsForUser(
    userId: string
  ): Promise<NotificationSettingsRecord | null> {
    return this.createNotificationRepository().findSettingsForUser(userId);
  }

  async cancelPendingNotificationsBySource(
    input: CancelPendingNotificationsBySourceInput
  ): Promise<number> {
    return this.createNotificationRepository().cancelPendingNotificationsBySource(
      input
    );
  }

  async upsertReminderNotification(
    input: UpsertReminderNotificationInput
  ): Promise<NotificationRecord> {
    return this.createNotificationRepository().upsertReminderNotification(input);
  }

  async findConnectionForUser(
    userId: string
  ): Promise<GoogleCalendarSyncConnectionRecord | null> {
    const connection = await this.client.externalCalendarConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "GOOGLE",
        },
      },
      select: this.createConnectionSelect(),
    });

    return connection ? this.mapConnection(connection) : null;
  }

  async updateConnectionAccessToken(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly encryptedAccessToken: string;
    readonly tokenExpiresAt: Date | null;
    readonly grantedScopes: readonly string[];
  }): Promise<void> {
    await this.client.externalCalendarConnection.updateMany({
      where: {
        id: input.connectionId,
        userId: input.userId,
        provider: "GOOGLE",
      },
      data: {
        encryptedAccessToken: input.encryptedAccessToken,
        tokenExpiresAt: input.tokenExpiresAt,
        grantedScopes: [...input.grantedScopes],
      },
    });
  }

  async markConnectionReconnectRequired(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly now: Date;
    readonly errorCode: string;
  }): Promise<void> {
    await this.client.externalCalendarConnection.updateMany({
      where: {
        id: input.connectionId,
        userId: input.userId,
        provider: "GOOGLE",
      },
      data: {
        encryptedAccessToken: null,
        tokenExpiresAt: null,
        status: "RECONNECT_REQUIRED",
        reconnectRequiredAt: input.now,
        lastSyncFailedAt: input.now,
        lastSyncErrorCode: input.errorCode,
        syncLockExpiresAt: null,
      },
    });
  }

  async markConnectionSyncStarted(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly startedAt: Date;
    readonly lockExpiresAt: Date;
  }): Promise<boolean> {
    const updated = await this.client.externalCalendarConnection.updateMany({
      where: {
        id: input.connectionId,
        userId: input.userId,
        provider: "GOOGLE",
        status: "CONNECTED",
        OR: [
          { syncLockExpiresAt: null },
          { syncLockExpiresAt: { lte: input.startedAt } },
        ],
      },
      data: {
        syncLockExpiresAt: input.lockExpiresAt,
        lastSyncStartedAt: input.startedAt,
      },
    });

    return updated.count > 0;
  }

  async markConnectionSyncSucceeded(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly finishedAt: Date;
  }): Promise<void> {
    await this.client.externalCalendarConnection.updateMany({
      where: {
        id: input.connectionId,
        userId: input.userId,
        provider: "GOOGLE",
      },
      data: {
        lastSyncedAt: input.finishedAt,
        lastSyncFailedAt: null,
        lastSyncErrorCode: null,
        syncLockExpiresAt: null,
      },
    });
  }

  async markConnectionSyncFailed(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly failedAt: Date;
    readonly errorCode: string;
  }): Promise<void> {
    await this.client.externalCalendarConnection.updateMany({
      where: {
        id: input.connectionId,
        userId: input.userId,
        provider: "GOOGLE",
      },
      data: {
        lastSyncFailedAt: input.failedAt,
        lastSyncErrorCode: input.errorCode,
        syncLockExpiresAt: null,
      },
    });
  }

  async upsertCalendarSources(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly sources: readonly UpsertGoogleCalendarSourceInput[];
  }): Promise<readonly GoogleCalendarSourceRecord[]> {
    const currentCalendarIds = input.sources.map((source) => source.calendarId);
    const existingSources = await this.client.externalCalendarSource.findMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
      },
      select: {
        calendarId: true,
        status: true,
      },
    });
    const existingStatusByCalendarId = new Map(
      existingSources.map((source) => [source.calendarId, source.status])
    );

    await this.client.externalCalendarSource.updateMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
        status: "SELECTED",
        ...(currentCalendarIds.length > 0
          ? {
              calendarId: {
                notIn: currentCalendarIds,
              },
            }
          : {}),
      },
      data: {
        status: "UNSELECTED",
        syncToken: null,
      },
    });

    for (const source of input.sources) {
      const existingStatus = existingStatusByCalendarId.get(source.calendarId);
      const defaultStatus =
        existingStatus ??
        (source.isPrimary && !source.isSystemCalendar ? "SELECTED" : "UNSELECTED");

      await this.client.externalCalendarSource.upsert({
        where: {
          userId_provider_calendarId: {
            userId: input.userId,
            provider: "GOOGLE",
            calendarId: source.calendarId,
          },
        },
        create: {
          userId: input.userId,
          connectionId: input.connectionId,
          provider: "GOOGLE",
          calendarId: source.calendarId,
          calendarName: source.calendarName,
          calendarTimeZone: source.calendarTimeZone,
          isPrimary: source.isPrimary,
          isSystemCalendar: source.isSystemCalendar,
          status: defaultStatus,
        },
        update: {
          connectionId: input.connectionId,
          calendarName: source.calendarName,
          calendarTimeZone: source.calendarTimeZone,
          isPrimary: source.isPrimary,
          isSystemCalendar: source.isSystemCalendar,
        },
      });
    }

    return this.listCalendarSourcesByCalendarIds({
      ...input,
      calendarIds: currentCalendarIds,
    });
  }

  async listCalendarSources(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<readonly GoogleCalendarSourceRecord[]> {
    const sources = await this.client.externalCalendarSource.findMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
      },
      select: this.createSourceSelect(),
      orderBy: [{ isPrimary: "desc" }, { calendarName: "asc" }, { id: "asc" }],
    });

    return sources.map((source) => this.mapSource(source));
  }

  private async listCalendarSourcesByCalendarIds(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly calendarIds: readonly string[];
  }): Promise<readonly GoogleCalendarSourceRecord[]> {
    if (input.calendarIds.length === 0) {
      return [];
    }

    const sources = await this.client.externalCalendarSource.findMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
        calendarId: {
          in: [...input.calendarIds],
        },
      },
      select: this.createSourceSelect(),
      orderBy: [{ isPrimary: "desc" }, { calendarName: "asc" }, { id: "asc" }],
    });

    return sources.map((source) => this.mapSource(source));
  }

  async updateCalendarSelection(input: {
    readonly userId: string;
    readonly connectionId: string;
    readonly selectedCalendarIds: readonly string[];
  }): Promise<UpdateGoogleCalendarSelectionResult | null> {
    const sources = await this.client.externalCalendarSource.findMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
      },
      select: {
        id: true,
        calendarId: true,
        status: true,
      },
    });
    const existingCalendarIds = new Set(
      sources.map((source) => source.calendarId)
    );

    if (
      input.selectedCalendarIds.some(
        (calendarId) => !existingCalendarIds.has(calendarId)
      )
    ) {
      return null;
    }

    const selectedCalendarIdSet = new Set(input.selectedCalendarIds);
    const newlyUnselectedSourceIds = sources
      .filter(
        (source) =>
          source.status === "SELECTED" &&
          !selectedCalendarIdSet.has(source.calendarId)
      )
      .map((source) => source.id);

    await this.client.externalCalendarSource.updateMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
        calendarId: {
          in: [...selectedCalendarIdSet],
        },
      },
      data: {
        status: "SELECTED",
      },
    });
    await this.client.externalCalendarSource.updateMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
        calendarId: {
          notIn: [...selectedCalendarIdSet],
        },
      },
      data: {
        status: "UNSELECTED",
      },
    });

    const hiddenSchedules = newlyUnselectedSourceIds.length
      ? await this.client.schedule.findMany({
          where: {
            userId: input.userId,
            sourceType: "GOOGLE",
            externalCalendarSourceId: {
              in: newlyUnselectedSourceIds,
            },
            deletedAt: null,
            externalSyncStatus: {
              notIn: ["GOOGLE_DELETED", "LOCAL_DELETED"],
            },
          },
          select: {
            id: true,
          },
        })
      : [];
    const updatedSources = await this.listCalendarSources(input);

    return {
      sources: updatedSources,
      hiddenScheduleIds: hiddenSchedules.map((schedule) => schedule.id),
    };
  }

  async listSelectedSources(input: {
    readonly userId: string;
    readonly connectionId: string;
  }): Promise<readonly GoogleCalendarSourceRecord[]> {
    const sources = await this.client.externalCalendarSource.findMany({
      where: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: "GOOGLE",
        status: "SELECTED",
      },
      select: this.createSourceSelect(),
      orderBy: [{ isPrimary: "desc" }, { calendarName: "asc" }, { id: "asc" }],
    });

    return sources.map((source) => this.mapSource(source));
  }

  async clearSourceSyncToken(input: {
    readonly userId: string;
    readonly sourceId: string;
  }): Promise<void> {
    await this.client.externalCalendarSource.updateMany({
      where: {
        id: input.sourceId,
        userId: input.userId,
        provider: "GOOGLE",
      },
      data: {
        syncToken: null,
      },
    });
  }

  async markSourceSyncFailed(input: {
    readonly userId: string;
    readonly sourceId: string;
    readonly failedAt: Date;
    readonly errorCode: string;
  }): Promise<void> {
    await this.client.externalCalendarSource.updateMany({
      where: {
        id: input.sourceId,
        userId: input.userId,
        provider: "GOOGLE",
      },
      data: {
        lastSyncFailedAt: input.failedAt,
        lastSyncErrorCode: input.errorCode,
      },
    });
  }

  async applySyncedEvents(input: {
    readonly userId: string;
    readonly source: GoogleCalendarSourceRecord;
    readonly events: readonly GoogleCalendarSyncedEventInput[];
    readonly nextSyncToken: string | null;
    readonly syncedAt: Date;
  }): Promise<ApplyGoogleCalendarEventsResult> {
    const reminderScheduleRequests: ScheduleReminderRequest[] = [];
    const reminderCancelScheduleIds: string[] = [];
    let importedCount = 0;
    let updatedCount = 0;
    let localModifiedSkippedCount = 0;
    let googleDeletedCount = 0;
    let trashedCount = 0;

    for (const event of input.events) {
      const existing = await this.findScheduleByExternalEvent({
        userId: input.userId,
        sourceId: input.source.id,
        externalEventId: event.externalEventId,
      });

      if (event.isCancelled) {
        if (existing?.deletedAt || existing?.externalSyncStatus === "LOCAL_DELETED") {
          trashedCount += existing ? 1 : 0;
          continue;
        }

        if (existing) {
          const updated = await this.client.schedule.updateMany({
            where: {
              id: existing.id,
              userId: input.userId,
              deletedAt: null,
            },
            data: {
              externalEventICalUid: event.externalEventICalUid,
              externalEventEtag: event.externalEventEtag,
              externalHtmlLink: event.externalHtmlLink,
              externalUpdatedAt: event.externalUpdatedAt,
              lastExternalSyncedAt: input.syncedAt,
              externalDeletedAt: input.syncedAt,
              externalSyncStatus: "GOOGLE_DELETED",
            },
          });

          if (updated.count > 0) {
            googleDeletedCount += 1;
            reminderCancelScheduleIds.push(existing.id);
          }
        }

        continue;
      }

      if (!event.fields) {
        continue;
      }

      if (!existing && !event.isWithinSyncRange) {
        continue;
      }

      if (existing?.deletedAt || existing?.externalSyncStatus === "LOCAL_DELETED") {
        trashedCount += existing ? 1 : 0;
        continue;
      }

      if (!existing) {
        const created = await this.client.schedule.create({
          data: {
            userId: input.userId,
            scheduleTitle: event.fields.scheduleTitle,
            startAt: event.fields.startAt,
            endAt: event.fields.endAt,
            timeZone: event.fields.timeZone,
            location: event.fields.location,
            meetingUrl: event.fields.meetingUrl,
            memo: event.fields.memo,
            isAllDay: event.fields.isAllDay,
            sourceType: "GOOGLE",
            externalCalendarSourceId: input.source.id,
            externalEventId: event.externalEventId,
            externalEventICalUid: event.externalEventICalUid,
            externalEventEtag: event.externalEventEtag,
            externalHtmlLink: event.externalHtmlLink,
            externalUpdatedAt: event.externalUpdatedAt,
            lastExternalSyncedAt: input.syncedAt,
            externalDeletedAt: null,
            externalSyncStatus: "SYNCED",
          },
          select: {
            id: true,
          },
        });

        importedCount += 1;
        reminderScheduleRequests.push({
          scheduleId: created.id,
          scheduleTitle: event.fields.scheduleTitle,
          startAt: event.fields.startAt,
        });
        continue;
      }

      if (existing.externalSyncStatus === "LOCAL_MODIFIED") {
        const updated = await this.client.schedule.updateMany({
          where: {
            id: existing.id,
            userId: input.userId,
            deletedAt: null,
          },
          data: {
            externalEventICalUid: event.externalEventICalUid,
            externalEventEtag: event.externalEventEtag,
            externalHtmlLink: event.externalHtmlLink,
            externalUpdatedAt: event.externalUpdatedAt,
            lastExternalSyncedAt: input.syncedAt,
            externalDeletedAt: null,
          },
        });

        if (updated.count > 0) {
          localModifiedSkippedCount += 1;
        }
        continue;
      }

      const updated = await this.client.schedule.updateMany({
        where: {
          id: existing.id,
          userId: input.userId,
          deletedAt: null,
        },
        data: {
          scheduleTitle: event.fields.scheduleTitle,
          startAt: event.fields.startAt,
          endAt: event.fields.endAt,
          timeZone: event.fields.timeZone,
          location: event.fields.location,
          meetingUrl: event.fields.meetingUrl,
          isAllDay: event.fields.isAllDay,
          externalEventICalUid: event.externalEventICalUid,
          externalEventEtag: event.externalEventEtag,
          externalHtmlLink: event.externalHtmlLink,
          externalUpdatedAt: event.externalUpdatedAt,
          lastExternalSyncedAt: input.syncedAt,
          externalDeletedAt: null,
          externalSyncStatus: "SYNCED",
        },
      });

      if (updated.count > 0) {
        updatedCount += 1;
        reminderScheduleRequests.push({
          scheduleId: existing.id,
          scheduleTitle: event.fields.scheduleTitle,
          startAt: event.fields.startAt,
        });
      }
    }

    await this.client.externalCalendarSource.updateMany({
      where: {
        id: input.source.id,
        userId: input.userId,
        provider: "GOOGLE",
      },
      data: {
        syncToken: input.nextSyncToken,
        lastSyncedAt: input.syncedAt,
        lastSyncFailedAt: null,
        lastSyncErrorCode: null,
      },
    });

    return {
      importedCount,
      updatedCount,
      localModifiedSkippedCount,
      googleDeletedCount,
      trashedCount,
      reminderScheduleRequests,
      reminderCancelScheduleIds,
    };
  }

  private async findScheduleByExternalEvent(input: {
    readonly userId: string;
    readonly sourceId: string;
    readonly externalEventId: string;
  }): Promise<ExistingScheduleRow | null> {
    return this.client.schedule.findFirst({
      where: {
        userId: input.userId,
        externalCalendarSourceId: input.sourceId,
        externalEventId: input.externalEventId,
      },
      select: {
        id: true,
        scheduleTitle: true,
        startAt: true,
        deletedAt: true,
        externalSyncStatus: true,
      },
    });
  }

  private createNotificationRepository(): PrismaNotificationRepository {
    return new PrismaNotificationRepository(this.client, null);
  }

  private createConnectionSelect() {
    return {
      id: true,
      status: true,
      providerAccountEmail: true,
      encryptedAccessToken: true,
      encryptedRefreshToken: true,
      tokenExpiresAt: true,
      connectedAt: true,
      reconnectRequiredAt: true,
      disconnectedAt: true,
      lastSyncedAt: true,
      lastSyncStartedAt: true,
      lastSyncFailedAt: true,
      lastSyncErrorCode: true,
      syncLockExpiresAt: true,
    } satisfies Prisma.ExternalCalendarConnectionSelect;
  }

  private createSourceSelect() {
    return {
      id: true,
      calendarId: true,
      calendarName: true,
      calendarTimeZone: true,
      isPrimary: true,
      isSystemCalendar: true,
      status: true,
      syncToken: true,
      lastSyncedAt: true,
      lastSyncFailedAt: true,
      lastSyncErrorCode: true,
    } satisfies Prisma.ExternalCalendarSourceSelect;
  }

  private mapConnection(
    connection: ConnectionRow
  ): GoogleCalendarSyncConnectionRecord {
    if (
      connection.status !== "CONNECTED" &&
      connection.status !== "RECONNECT_REQUIRED" &&
      connection.status !== "DISCONNECTED"
    ) {
      throw new Error(
        `Invalid Google Calendar connection status in database: ${connection.status}`
      );
    }

    return {
      id: connection.id,
      status: connection.status,
      providerAccountEmail: connection.providerAccountEmail,
      encryptedAccessToken: connection.encryptedAccessToken,
      encryptedRefreshToken: connection.encryptedRefreshToken,
      tokenExpiresAt: connection.tokenExpiresAt,
      connectedAt: connection.connectedAt,
      reconnectRequiredAt: connection.reconnectRequiredAt,
      disconnectedAt: connection.disconnectedAt,
      lastSyncedAt: connection.lastSyncedAt,
      lastSyncStartedAt: connection.lastSyncStartedAt,
      lastSyncFailedAt: connection.lastSyncFailedAt,
      lastSyncErrorCode: connection.lastSyncErrorCode,
      syncLockExpiresAt: connection.syncLockExpiresAt,
    };
  }

  private mapSource(source: SourceRow): GoogleCalendarSourceRecord {
    if (source.status !== "SELECTED" && source.status !== "UNSELECTED") {
      throw new Error(
        `Invalid Google Calendar source status in database: ${source.status}`
      );
    }

    return {
      id: source.id,
      calendarId: source.calendarId,
      calendarName: source.calendarName,
      calendarTimeZone: source.calendarTimeZone,
      isPrimary: source.isPrimary,
      isSystemCalendar: source.isSystemCalendar,
      status: source.status,
      syncToken: source.syncToken,
      lastSyncedAt: source.lastSyncedAt,
      lastSyncFailedAt: source.lastSyncFailedAt,
      lastSyncErrorCode: source.lastSyncErrorCode,
    };
  }
}
