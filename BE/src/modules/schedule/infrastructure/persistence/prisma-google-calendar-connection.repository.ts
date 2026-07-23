import {
  type CancelPendingNotificationsBySourceInput,
  type NotificationRecord,
  type NotificationSettingsRecord,
  type UpsertReminderNotificationInput,
} from "@/modules/notification/application/ports/notification.repository";
import { PrismaNotificationRepository } from "@/modules/notification/infrastructure/persistence/prisma-notification.repository";
import {
  type DisconnectGoogleCalendarConnectionInput,
  type DisconnectGoogleCalendarConnectionResult,
  type GoogleCalendarConnectionRecord,
  type GoogleCalendarConnectionRepository,
  type GoogleCalendarConnectionStatusAggregate,
  type UpsertConnectedGoogleCalendarConnectionInput,
} from "@/modules/schedule/application/ports/google-calendar-connection.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { Prisma } from "@prisma/client";

type GoogleCalendarPrismaClient = PrismaService | Prisma.TransactionClient;

type GoogleCalendarConnectionRow = {
  readonly id: string;
  readonly status: string;
  readonly providerAccountId: string | null;
  readonly providerAccountEmail: string | null;
  readonly encryptedRefreshToken: string | null;
  readonly connectedAt: Date | null;
  readonly reconnectRequiredAt: Date | null;
  readonly disconnectedAt: Date | null;
  readonly lastSyncedAt: Date | null;
  readonly lastSyncStartedAt: Date | null;
  readonly lastSyncFailedAt: Date | null;
  readonly lastSyncErrorCode: string | null;
  readonly syncLockExpiresAt: Date | null;
};

export class PrismaGoogleCalendarConnectionRepository
  implements GoogleCalendarConnectionRepository
{
  constructor(
    private readonly client: GoogleCalendarPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repository: GoogleCalendarConnectionRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) =>
      work(new PrismaGoogleCalendarConnectionRepository(transaction, null))
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

  async findConnection(
    userId: string
  ): Promise<GoogleCalendarConnectionRecord | null> {
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

  async getStatusAggregate(
    userId: string
  ): Promise<GoogleCalendarConnectionStatusAggregate> {
    const connection = await this.client.externalCalendarConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "GOOGLE",
        },
      },
      select: {
        ...this.createConnectionSelect(),
        _count: {
          select: {
            sources: true,
          },
        },
        sources: {
          where: {
            status: "SELECTED",
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!connection) {
      return {
        connection: null,
        selectedCalendarCount: 0,
        availableCalendarCount: 0,
      };
    }

    return {
      connection: this.mapConnection(connection),
      selectedCalendarCount: connection.sources.length,
      availableCalendarCount: connection._count.sources,
    };
  }

  async upsertConnectedConnection(
    input: UpsertConnectedGoogleCalendarConnectionInput
  ): Promise<GoogleCalendarConnectionRecord> {
    const connection =
      await this.client.externalCalendarConnection.upsert({
        where: {
          userId_provider: {
            userId: input.userId,
            provider: "GOOGLE",
          },
        },
        create: {
          userId: input.userId,
          provider: "GOOGLE",
          providerAccountId: input.providerAccountId,
          providerAccountEmail: input.providerAccountEmail,
          status: "CONNECTED",
          encryptedAccessToken: input.encryptedAccessToken,
          encryptedRefreshToken: input.encryptedRefreshToken ?? null,
          tokenExpiresAt: input.tokenExpiresAt,
          grantedScopes: [...input.grantedScopes],
          connectedAt: input.connectedAt,
          disconnectedAt: null,
          reconnectRequiredAt: null,
        },
        update: {
          providerAccountId: input.providerAccountId,
          providerAccountEmail: input.providerAccountEmail,
          status: "CONNECTED",
          encryptedAccessToken: input.encryptedAccessToken,
          ...(input.encryptedRefreshToken
            ? { encryptedRefreshToken: input.encryptedRefreshToken }
            : {}),
          tokenExpiresAt: input.tokenExpiresAt,
          grantedScopes: [...input.grantedScopes],
          connectedAt: input.connectedAt,
          disconnectedAt: null,
          reconnectRequiredAt: null,
        },
        select: this.createConnectionSelect(),
      });

    return this.mapConnection(connection);
  }

  async disconnectConnection(
    input: DisconnectGoogleCalendarConnectionInput
  ): Promise<DisconnectGoogleCalendarConnectionResult | null> {
    const connection = await this.client.externalCalendarConnection.findUnique({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: "GOOGLE",
        },
      },
      select: {
        id: true,
      },
    });

    if (!connection) {
      return null;
    }

    const activeGoogleSchedules = await this.client.schedule.findMany({
      where: {
        userId: input.userId,
        sourceType: "GOOGLE",
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    const activeScheduleIds = activeGoogleSchedules.map((schedule) => schedule.id);

    let trashedScheduleCount = 0;
    let hiddenScheduleCount = 0;
    let keptScheduleCount = 0;
    let trashedScheduleIds: string[] = [];

    if (input.scheduleAction === "KEEP") {
      keptScheduleCount = activeScheduleIds.length;
    }

    if (input.scheduleAction === "HIDE") {
      await this.client.externalCalendarSource.updateMany({
        where: {
          userId: input.userId,
          connectionId: connection.id,
          provider: "GOOGLE",
        },
        data: {
          status: "UNSELECTED",
        },
      });
      hiddenScheduleCount = activeScheduleIds.length;
    }

    if (input.scheduleAction === "TRASH" && activeScheduleIds.length > 0) {
      const result = await this.client.schedule.updateMany({
        where: {
          userId: input.userId,
          id: {
            in: activeScheduleIds,
          },
          deletedAt: null,
        },
        data: {
          deletedAt: input.deletedAt,
          deletedByUserId: input.userId,
          trashExpiresAt: input.trashExpiresAt,
          externalSyncStatus: "LOCAL_DELETED",
        },
      });
      trashedScheduleCount = result.count;
      trashedScheduleIds = activeScheduleIds;
    }

    await this.client.externalCalendarConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        encryptedAccessToken: null,
        encryptedRefreshToken: null,
        tokenExpiresAt: null,
        status: "DISCONNECTED",
        disconnectedAt: input.disconnectedAt,
        reconnectRequiredAt: null,
      },
    });

    return {
      connectionStatus: "DISCONNECTED",
      scheduleAction: input.scheduleAction,
      affectedScheduleCount: activeScheduleIds.length,
      trashedScheduleCount,
      hiddenScheduleCount,
      keptScheduleCount,
      disconnectedAt: input.disconnectedAt,
      trashedScheduleIds,
    };
  }

  private createNotificationRepository(): PrismaNotificationRepository {
    return new PrismaNotificationRepository(this.client, null);
  }

  private createConnectionSelect() {
    return {
      id: true,
      status: true,
      providerAccountId: true,
      providerAccountEmail: true,
      encryptedRefreshToken: true,
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

  private mapConnection(
    connection: GoogleCalendarConnectionRow
  ): GoogleCalendarConnectionRecord {
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
      providerAccountId: connection.providerAccountId,
      providerAccountEmail: connection.providerAccountEmail,
      connectedAt: connection.connectedAt,
      reconnectRequiredAt: connection.reconnectRequiredAt,
      disconnectedAt: connection.disconnectedAt,
      lastSyncedAt: connection.lastSyncedAt,
      lastSyncStartedAt: connection.lastSyncStartedAt,
      lastSyncFailedAt: connection.lastSyncFailedAt,
      lastSyncErrorCode: connection.lastSyncErrorCode,
      syncLockExpiresAt: connection.syncLockExpiresAt,
      hasRefreshToken: Boolean(connection.encryptedRefreshToken),
    };
  }
}
