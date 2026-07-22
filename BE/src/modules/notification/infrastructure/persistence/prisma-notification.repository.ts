import { Prisma } from "@prisma/client";
import {
  type BrowserPushSubscriptionRecord,
  type CancelPendingNotificationsBySourceInput,
  type CountUnreadNotificationsForUserInput,
  type CreateNotificationDeliveryAttemptInput,
  type CreateNotificationInput,
  type FindBrowserPushSubscriptionForUserInput,
  type FindNotificationForUserInput,
  type ListDueNotificationsInput,
  type ListNotificationsForUserInput,
  type MarkNotificationReadInput,
  type MarkNotificationSentInput,
  type NotificationDeliveryAttemptRecord,
  type NotificationPageRecord,
  type NotificationRecord,
  type NotificationRepository,
  type NotificationSettingsRecord,
  type RevokeBrowserPushSubscriptionForUserInput,
  type UpsertBrowserPushSubscriptionInput,
  type UpsertNotificationSettingsInput,
} from "@/modules/notification/application/ports/notification.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type NotificationPrismaClient = PrismaService | Prisma.TransactionClient;

type NotificationRow = Omit<NotificationRecord, "metadataJson"> & {
  readonly metadataJson: unknown;
};

type NotificationDeliveryAttemptRow = Omit<
  NotificationDeliveryAttemptRecord,
  "detailJson"
> & {
  readonly detailJson: unknown;
};

type NotificationSettingsScalarData = {
  readonly scheduleReminderEnabled?: boolean;
  readonly dealDueReminderEnabled?: boolean;
  readonly emailNotificationEnabled?: boolean;
  readonly browserPushEnabled?: boolean;
  readonly scheduleReminderMinutes?: number;
  readonly dealDueReminderDaysBefore?: number;
  readonly dealDueReminderLocalTime?: string;
};

// 역할 : PrismaNotificationRepository 알림 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaNotificationRepository implements NotificationRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: NotificationPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 알림 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: NotificationRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) =>
      work(new PrismaNotificationRepository(transaction, null))
    );
  }

  // 기능 : 현재 사용자의 알림 설정을 조회합니다.
  async findSettingsForUser(
    userId: string
  ): Promise<NotificationSettingsRecord | null> {
    const settings = await this.client.userNotificationSetting.findUnique({
      where: { userId },
    });

    return settings ? this.mapSettings(settings) : null;
  }

  // 기능 : 현재 사용자의 알림 설정을 생성하거나 갱신합니다.
  async upsertSettings(
    input: UpsertNotificationSettingsInput
  ): Promise<NotificationSettingsRecord> {
    const data = this.createSettingsScalarData(input);
    const settings = await this.client.userNotificationSetting.upsert({
      where: { userId: input.userId },
      update: data,
      create: {
        userId: input.userId,
        ...data,
      },
    });

    return this.mapSettings(settings);
  }

  // 기능 : 앱 안 알림 정본 row를 생성합니다.
  async createNotification(
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

  // 기능 : 현재 사용자 소유 알림을 ID 기준으로 조회합니다.
  async findNotificationByIdForUser(
    input: FindNotificationForUserInput
  ): Promise<NotificationRecord | null> {
    const notification = await this.client.notification.findFirst({
      where: {
        id: input.notificationId,
        userId: input.userId,
      },
    });

    return notification ? this.mapNotification(notification) : null;
  }

  // 기능 : 현재 사용자 알림 목록을 page 기준으로 조회합니다.
  async listNotificationsForUser(
    input: ListNotificationsForUserInput
  ): Promise<NotificationPageRecord> {
    const where = this.createListWhere(input);
    const [items, totalCount] = await Promise.all([
      this.client.notification.findMany({
        where,
        orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.client.notification.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapNotification(item)),
      totalCount,
    };
  }

  // 기능 : 현재 사용자 unread 알림 수를 조회합니다.
  async countUnreadNotificationsForUser(
    input: CountUnreadNotificationsForUserInput
  ): Promise<number> {
    return this.client.notification.count({
      where: {
        userId: input.userId,
        status: "SENT",
        readAt: null,
        scheduledAt: { lte: input.now },
      },
    });
  }

  // 기능 : 현재 사용자 알림을 읽음 처리합니다.
  async markNotificationReadForUser(
    input: MarkNotificationReadInput
  ): Promise<NotificationRecord | null> {
    const notification = await this.findNotificationByIdForUser(input);

    if (!notification) {
      return null;
    }

    if (notification.readAt) {
      return notification;
    }

    const updated = await this.client.notification.update({
      where: { id: notification.id },
      data: { readAt: input.readAt },
    });

    return this.mapNotification(updated);
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
      },
      data: {
        status: "CANCELED",
        canceledAt: input.canceledAt,
        cancelReason: input.cancelReason,
      },
    });

    return result.count;
  }

  // 기능 : due processor가 처리할 pending 알림을 조회합니다.
  async listDueNotifications(
    input: ListDueNotificationsInput
  ): Promise<NotificationRecord[]> {
    const notifications = await this.client.notification.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: input.now },
      },
      orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
      take: input.limit,
    });

    return notifications.map((notification) =>
      this.mapNotification(notification)
    );
  }

  // 기능 : due 처리된 알림을 SENT 상태로 변경합니다.
  async markNotificationSent(input: MarkNotificationSentInput): Promise<boolean> {
    const result = await this.client.notification.updateMany({
      where: {
        id: input.notificationId,
        status: "PENDING",
      },
      data: {
        status: "SENT",
        sentAt: input.sentAt,
      },
    });

    return result.count === 1;
  }

  // 기능 : email/browser push 발송 시도 이력을 생성합니다.
  async createDeliveryAttempt(
    input: CreateNotificationDeliveryAttemptInput
  ): Promise<NotificationDeliveryAttemptRecord> {
    const attempt = await this.client.notificationDeliveryAttempt.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        notificationId: input.notificationId,
        userId: input.userId,
        channel: input.channel,
        status: input.status ?? "PENDING",
        attemptNumber: input.attemptNumber ?? 1,
        provider: input.provider ?? null,
        providerMessageId: input.providerMessageId ?? null,
        providerStatusCode: input.providerStatusCode ?? null,
        safeErrorCode: input.safeErrorCode ?? null,
        safeErrorMessage: input.safeErrorMessage ?? null,
        retryable: input.retryable ?? false,
        nextRetryAt: input.nextRetryAt ?? null,
        sentAt: input.sentAt ?? null,
        failedAt: input.failedAt ?? null,
        detailJson: this.toInputJson(input.detailJson ?? {}),
      },
    });

    return this.mapDeliveryAttempt(attempt);
  }

  // 기능 : 암호화된 browser push subscription을 생성하거나 갱신합니다.
  async upsertBrowserPushSubscription(
    input: UpsertBrowserPushSubscriptionInput
  ): Promise<BrowserPushSubscriptionRecord> {
    const updateData = this.createBrowserPushSubscriptionUpdateData(input);
    const updated = await this.client.browserPushSubscription.updateMany({
      where: {
        endpointHash: input.endpointHash,
        userId: input.userId,
      },
      data: updateData,
    });

    if (updated.count > 0) {
      return this.findRequiredBrowserPushSubscriptionByEndpointHash(
        input.endpointHash
      );
    }

    try {
      const subscription = await this.client.browserPushSubscription.create({
        data: {
          ...(input.id ? { id: input.id } : {}),
          userId: input.userId,
          endpointHash: input.endpointHash,
          endpointCiphertext: input.endpointCiphertext,
          p256dhCiphertext: input.p256dhCiphertext,
          authCiphertext: input.authCiphertext,
          contentKeyVersion: input.contentKeyVersion,
          userAgent: input.userAgent ?? null,
          deviceLabel: input.deviceLabel ?? null,
          lastSeenAt: input.now,
        },
      });

      return this.mapBrowserPushSubscription(subscription);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        const retryUpdated = await this.client.browserPushSubscription.updateMany({
          where: {
            endpointHash: input.endpointHash,
            userId: input.userId,
          },
          data: updateData,
        });

        if (retryUpdated.count > 0) {
          return this.findRequiredBrowserPushSubscriptionByEndpointHash(
            input.endpointHash
          );
        }

        return this.findRequiredBrowserPushSubscriptionByEndpointHash(
          input.endpointHash
        );
      }

      throw error;
    }
  }

  // 기능 : 현재 사용자 소유 browser push subscription을 조회합니다.
  async findBrowserPushSubscriptionForUser(
    input: FindBrowserPushSubscriptionForUserInput
  ): Promise<BrowserPushSubscriptionRecord | null> {
    const subscription = await this.client.browserPushSubscription.findFirst({
      where: {
        id: input.browserSubscriptionId,
        userId: input.userId,
      },
    });

    return subscription ? this.mapBrowserPushSubscription(subscription) : null;
  }

  // 기능 : endpoint hash 기준 browser push subscription을 조회합니다.
  async findBrowserPushSubscriptionByEndpointHash(
    endpointHash: string
  ): Promise<BrowserPushSubscriptionRecord | null> {
    const subscription = await this.client.browserPushSubscription.findUnique({
      where: { endpointHash },
    });

    return subscription ? this.mapBrowserPushSubscription(subscription) : null;
  }

  // 기능 : 현재 사용자 active browser push subscription 목록을 조회합니다.
  async listActiveBrowserPushSubscriptionsForUser(
    userId: string
  ): Promise<BrowserPushSubscriptionRecord[]> {
    const subscriptions = await this.client.browserPushSubscription.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return subscriptions.map((subscription) =>
      this.mapBrowserPushSubscription(subscription)
    );
  }

  // 기능 : 현재 사용자 browser push subscription을 해제 상태로 변경합니다.
  async revokeBrowserPushSubscriptionForUser(
    input: RevokeBrowserPushSubscriptionForUserInput
  ): Promise<BrowserPushSubscriptionRecord | null> {
    await this.client.browserPushSubscription.updateMany({
      where: {
        id: input.browserSubscriptionId,
        userId: input.userId,
        status: "ACTIVE",
      },
      data: {
        status: "REVOKED",
        revokedAt: input.revokedAt,
      },
    });

    return this.findBrowserPushSubscriptionForUser(input);
  }

  // 기능 : 알림 설정 갱신용 scalar data를 구성합니다.
  private createSettingsScalarData(
    input: UpsertNotificationSettingsInput
  ): NotificationSettingsScalarData {
    return {
      ...(input.scheduleReminderEnabled === undefined
        ? {}
        : { scheduleReminderEnabled: input.scheduleReminderEnabled }),
      ...(input.dealDueReminderEnabled === undefined
        ? {}
        : { dealDueReminderEnabled: input.dealDueReminderEnabled }),
      ...(input.emailNotificationEnabled === undefined
        ? {}
        : { emailNotificationEnabled: input.emailNotificationEnabled }),
      ...(input.browserPushEnabled === undefined
        ? {}
        : { browserPushEnabled: input.browserPushEnabled }),
      ...(input.scheduleReminderMinutes === undefined
        ? {}
        : { scheduleReminderMinutes: input.scheduleReminderMinutes }),
      ...(input.dealDueReminderDaysBefore === undefined
        ? {}
        : { dealDueReminderDaysBefore: input.dealDueReminderDaysBefore }),
      ...(input.dealDueReminderLocalTime === undefined
        ? {}
        : { dealDueReminderLocalTime: input.dealDueReminderLocalTime }),
    };
  }

  // 기능 : 알림 목록 조회 조건을 Prisma where로 변환합니다.
  // 기능 : 같은 사용자의 browser push subscription 재등록 update 값을 구성합니다.
  private createBrowserPushSubscriptionUpdateData(
    input: UpsertBrowserPushSubscriptionInput
  ): Prisma.BrowserPushSubscriptionUpdateManyMutationInput {
    return {
      endpointCiphertext: input.endpointCiphertext,
      p256dhCiphertext: input.p256dhCiphertext,
      authCiphertext: input.authCiphertext,
      contentKeyVersion: input.contentKeyVersion,
      status: "ACTIVE",
      userAgent: input.userAgent ?? null,
      deviceLabel: input.deviceLabel ?? null,
      lastSeenAt: input.now,
      revokedAt: null,
    };
  }

  // 기능 : endpoint hash로 subscription row를 다시 읽고 없으면 인프라 오류로 처리합니다.
  private async findRequiredBrowserPushSubscriptionByEndpointHash(
    endpointHash: string
  ): Promise<BrowserPushSubscriptionRecord> {
    const subscription = await this.client.browserPushSubscription.findUnique({
      where: { endpointHash },
    });

    if (!subscription) {
      throw new Error("Browser push subscription was not found after upsert");
    }

    return this.mapBrowserPushSubscription(subscription);
  }

  // 기능 : Prisma unique constraint 충돌인지 판별합니다.
  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  private createListWhere(
    input: ListNotificationsForUserInput
  ): Prisma.NotificationWhereInput {
    return {
      userId: input.userId,
      status:
        input.includeUpcoming === true
          ? { in: ["PENDING", "SENT"] }
          : "SENT",
      ...(input.includeUpcoming === true
        ? {}
        : { scheduledAt: { lte: input.now } }),
      ...(input.read === "READ" ? { readAt: { not: null } } : {}),
      ...(input.read === "UNREAD" ? { readAt: null } : {}),
    };
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

  // 기능 : Prisma 발송 시도 row를 application record로 변환합니다.
  private mapDeliveryAttempt(
    row: NotificationDeliveryAttemptRow
  ): NotificationDeliveryAttemptRecord {
    return {
      id: row.id,
      notificationId: row.notificationId,
      userId: row.userId,
      channel: row.channel,
      status: row.status,
      attemptNumber: row.attemptNumber,
      provider: row.provider,
      providerMessageId: row.providerMessageId,
      providerStatusCode: row.providerStatusCode,
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      nextRetryAt: row.nextRetryAt,
      sentAt: row.sentAt,
      failedAt: row.failedAt,
      detailJson: this.toRecordJson(row.detailJson),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  // 기능 : Prisma push 구독 row를 application record로 변환합니다.
  private mapBrowserPushSubscription(
    row: BrowserPushSubscriptionRecord
  ): BrowserPushSubscriptionRecord {
    return {
      id: row.id,
      userId: row.userId,
      endpointHash: row.endpointHash,
      endpointCiphertext: row.endpointCiphertext,
      p256dhCiphertext: row.p256dhCiphertext,
      authCiphertext: row.authCiphertext,
      contentKeyVersion: row.contentKeyVersion,
      status: row.status,
      userAgent: row.userAgent,
      deviceLabel: row.deviceLabel,
      lastSeenAt: row.lastSeenAt,
      revokedAt: row.revokedAt,
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
