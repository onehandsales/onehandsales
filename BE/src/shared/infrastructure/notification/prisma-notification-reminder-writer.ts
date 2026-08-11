import { Prisma } from "@prisma/client";
import type {
  CancelPendingNotificationsBySourceInput,
  CreateNotificationInput,
  NotificationRecord,
  NotificationReminderWriteRepository,
  NotificationSettingsRecord,
  UpsertReminderNotificationInput,
} from "@/shared/application/notification/notification-reminder-writer.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type NotificationReminderPrismaClient = PrismaService | Prisma.TransactionClient;

type NotificationRow = Omit<NotificationRecord, "metadataJson"> & {
  readonly metadataJson: unknown;
};

// 역할 : PrismaNotificationReminderWriter 원본 module transaction client로 reminder 알림 쓰기를 수행합니다.
export class PrismaNotificationReminderWriter
  implements NotificationReminderWriteRepository
{
  // 기능 : Prisma client 또는 transaction client를 주입받습니다.
  constructor(private readonly client: NotificationReminderPrismaClient) {}

  // 기능 : 현재 사용자의 알림 설정을 조회합니다.
  async findSettingsForUser(
    userId: string
  ): Promise<NotificationSettingsRecord | null> {
    const settings = await this.client.userNotificationSetting.findUnique({
      where: { userId },
    });

    return settings ? this.mapSettings(settings) : null;
  }

  // 기능 : dedupe key 기준으로 reminder 알림을 생성하거나 pending 상태로 갱신합니다.
  async upsertReminderNotification(
    input: UpsertReminderNotificationInput
  ): Promise<NotificationRecord> {
    const existing = await this.findNotificationByDedupeKey(
      input.userId,
      input.dedupeKey
    );

    if (!existing) {
      try {
        return await this.createNotification(input);
      } catch (error) {
        if (!this.isUniqueConstraintError(error)) {
          throw error;
        }

        return this.findRequiredNotificationByDedupeKey(
          input.userId,
          input.dedupeKey
        );
      }
    }

    if (existing.status === "SENT") {
      return this.mapNotification(existing);
    }

    const notification = await this.client.notification.update({
      where: { id: existing.id },
      data: {
        type: input.type,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
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
        metadataJson: this.toInputJson(input.metadataJson ?? {}),
      },
    });

    return this.mapNotification(notification);
  }

  // 기능 : 원본 일정/딜 기준 pending 알림을 취소합니다.
  async cancelPendingNotificationsBySource(
    input: CancelPendingNotificationsBySourceInput
  ): Promise<number> {
    const result = await this.client.notification.updateMany({
      where: {
        userId: input.userId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        status: "PENDING",
        ...(input.excludeDedupeKey
          ? { dedupeKey: { not: input.excludeDedupeKey } }
          : {}),
      },
      data: {
        status: "CANCELED",
        canceledAt: input.canceledAt,
        cancelReason: input.cancelReason,
      },
    });

    return result.count;
  }

  // 기능 : 앱 안 알림 정본 row를 생성합니다.
  private async createNotification(
    input: CreateNotificationInput
  ): Promise<NotificationRecord> {
    const notification = await this.client.notification.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        userId: input.userId,
        type: input.type,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        dedupeKey: input.dedupeKey,
        targetPath: input.targetPath,
        title: input.title,
        body: input.body ?? null,
        targetLabel: input.targetLabel ?? null,
        scheduledAt: input.scheduledAt,
        metadataJson: this.toInputJson(input.metadataJson ?? {}),
      },
    });

    return this.mapNotification(notification);
  }

  // 기능 : dedupe key 기준 알림 row를 조회합니다.
  private async findNotificationByDedupeKey(
    userId: string,
    dedupeKey: string
  ): Promise<NotificationRow | null> {
    return this.client.notification.findFirst({
      where: {
        userId,
        dedupeKey,
      },
    });
  }

  // 기능 : unique retry 이후 필요한 알림 row를 다시 조회합니다.
  private async findRequiredNotificationByDedupeKey(
    userId: string,
    dedupeKey: string
  ): Promise<NotificationRecord> {
    const notification = await this.findNotificationByDedupeKey(
      userId,
      dedupeKey
    );

    if (!notification) {
      throw new Error("Notification was not found after unique retry");
    }

    return this.mapNotification(notification);
  }

  // 기능 : Prisma unique constraint 충돌인지 판별합니다.
  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  // 기능 : Prisma 알림 설정 row를 application record로 변환합니다.
  private mapSettings(row: NotificationSettingsRecord): NotificationSettingsRecord {
    return {
      id: row.id,
      userId: row.userId,
      scheduleReminderEnabled: row.scheduleReminderEnabled,
      dealDueReminderEnabled: row.dealDueReminderEnabled,
      emailNotificationEnabled: row.emailNotificationEnabled,
      browserPushEnabled: row.browserPushEnabled,
      scheduleReminderMinutes: row.scheduleReminderMinutes,
      dealDueReminderDaysBefore: row.dealDueReminderDaysBefore,
      dealDueReminderLocalTime: row.dealDueReminderLocalTime,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  // 기능 : Prisma 알림 row를 application record로 변환합니다.
  private mapNotification(row: NotificationRow): NotificationRecord {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      dedupeKey: row.dedupeKey,
      targetPath: row.targetPath,
      title: row.title,
      body: row.body,
      targetLabel: row.targetLabel,
      status: row.status,
      scheduledAt: row.scheduledAt,
      sentAt: row.sentAt,
      readAt: row.readAt,
      canceledAt: row.canceledAt,
      cancelReason: row.cancelReason,
      metadataJson: this.toRecordJson(row.metadataJson),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  // 기능 : unknown JSON 값을 object record로 변환합니다.
  private toRecordJson(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  // 기능 : unknown JSON 값을 Prisma input JSON 값으로 변환합니다.
  private toInputJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }
}
