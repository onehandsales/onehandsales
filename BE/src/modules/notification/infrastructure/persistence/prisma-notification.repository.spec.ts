import { PrismaNotificationRepository } from "./prisma-notification.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type MockModel<TRecord> = {
  readonly count: jest.Mock<Promise<number>, [unknown]>;
  readonly create: jest.Mock<Promise<TRecord>, [unknown]>;
  readonly findFirst: jest.Mock<Promise<TRecord | null>, [unknown]>;
  readonly findMany: jest.Mock<Promise<TRecord[]>, [unknown]>;
  readonly findUnique: jest.Mock<Promise<TRecord | null>, [unknown]>;
  readonly update: jest.Mock<Promise<TRecord>, [unknown]>;
  readonly updateMany: jest.Mock<Promise<{ readonly count: number }>, [unknown]>;
  readonly upsert: jest.Mock<Promise<TRecord>, [unknown]>;
};

type MockPrismaClient = {
  readonly userNotificationSetting: MockModel<NotificationSettingsFixture>;
  readonly notification: MockModel<NotificationFixture>;
  readonly notificationDeliveryAttempt: MockModel<DeliveryAttemptFixture>;
  readonly browserPushSubscription: MockModel<BrowserPushSubscriptionFixture>;
};

type NotificationSettingsFixture = {
  readonly id: string;
  readonly userId: string;
  readonly scheduleReminderEnabled: boolean;
  readonly dealDueReminderEnabled: boolean;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
  readonly scheduleReminderMinutes: number;
  readonly dealDueReminderDaysBefore: number;
  readonly dealDueReminderLocalTime: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type NotificationFixture = {
  readonly id: string;
  readonly userId: string;
  readonly type: "SCHEDULE_START_REMINDER";
  readonly sourceType: "SCHEDULE";
  readonly sourceId: string;
  readonly dedupeKey: string;
  readonly targetPath: string;
  readonly title: string;
  readonly body: string | null;
  readonly targetLabel: string | null;
  readonly status: "PENDING" | "SENT";
  readonly scheduledAt: Date;
  readonly sentAt: Date | null;
  readonly readAt: Date | null;
  readonly canceledAt: Date | null;
  readonly cancelReason: string | null;
  readonly metadataJson: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type DeliveryAttemptFixture = {
  readonly id: string;
  readonly notificationId: string;
  readonly userId: string;
  readonly channel: "BROWSER_PUSH";
  readonly status: "PENDING";
  readonly attemptNumber: number;
  readonly provider: string | null;
  readonly providerMessageId: string | null;
  readonly providerStatusCode: string | null;
  readonly safeErrorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly retryable: boolean;
  readonly nextRetryAt: Date | null;
  readonly sentAt: Date | null;
  readonly failedAt: Date | null;
  readonly detailJson: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type BrowserPushSubscriptionFixture = {
  readonly id: string;
  readonly userId: string;
  readonly endpointHash: string;
  readonly endpointCiphertext: string;
  readonly p256dhCiphertext: string;
  readonly authCiphertext: string;
  readonly contentKeyVersion: string;
  readonly status: "ACTIVE" | "REVOKED";
  readonly userAgent: string | null;
  readonly deviceLabel: string | null;
  readonly lastSeenAt: Date | null;
  readonly revokedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

const NOW = new Date("2026-07-22T00:00:00.000Z");

describe("PrismaNotificationRepository", () => {
  it("finds notification by notificationId and userId ownership", async () => {
    const client = createMockClient();
    client.notification.findFirst.mockResolvedValue(createNotificationFixture());
    const repository = createRepository(client);

    const notification = await repository.findNotificationByIdForUser({
      userId: "user-1",
      notificationId: "notification-1",
    });

    expect(client.notification.findFirst).toHaveBeenCalledWith({
      where: {
        id: "notification-1",
        userId: "user-1",
      },
    });
    expect(notification?.metadataJson).toEqual({ safe: true });
  });

  it("returns already read notifications without updating them again", async () => {
    const client = createMockClient();
    client.notification.findFirst.mockResolvedValue(
      createNotificationFixture({ readAt: NOW, status: "SENT" })
    );
    const repository = createRepository(client);

    const notification = await repository.markNotificationReadForUser({
      userId: "user-1",
      notificationId: "notification-1",
      readAt: new Date("2026-07-22T01:00:00.000Z"),
    });

    expect(client.notification.update).not.toHaveBeenCalled();
    expect(notification?.readAt).toBe(NOW);
  });

  it("lists only sent user notifications unless upcoming notifications are requested", async () => {
    const client = createMockClient();
    client.notification.findMany.mockResolvedValue([createNotificationFixture()]);
    client.notification.count.mockResolvedValue(1);
    const repository = createRepository(client);

    await repository.listNotificationsForUser({
      userId: "user-1",
      page: 2,
      pageSize: 15,
      now: NOW,
      read: "UNREAD",
    });

    expect(client.notification.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: "SENT",
        readAt: null,
        scheduledAt: { lte: NOW },
      },
      orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      skip: 15,
      take: 15,
    });
    expect(client.notification.count).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: "SENT",
        readAt: null,
        scheduledAt: { lte: NOW },
      },
    });
  });

  it("counts only due sent unread notifications for the current user", async () => {
    const client = createMockClient();
    client.notification.count.mockResolvedValue(3);
    const repository = createRepository(client);

    const count = await repository.countUnreadNotificationsForUser({
      userId: "user-1",
      now: NOW,
    });

    expect(count).toBe(3);
    expect(client.notification.count).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: "SENT",
        readAt: null,
        scheduledAt: { lte: NOW },
      },
    });
  });

  it("queries due pending notifications with the processor index order", async () => {
    const client = createMockClient();
    client.notification.findMany.mockResolvedValue([createNotificationFixture()]);
    const repository = createRepository(client);

    await repository.listDueNotifications({ now: NOW, limit: 50 });

    expect(client.notification.findMany).toHaveBeenCalledWith({
      where: {
        status: "PENDING",
        scheduledAt: { lte: NOW },
      },
      orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
      take: 50,
    });
  });

  it("cancels pending notifications by user-owned source", async () => {
    const client = createMockClient();
    client.notification.updateMany.mockResolvedValue({ count: 2 });
    const repository = createRepository(client);

    const count = await repository.cancelPendingNotificationsBySource({
      userId: "user-1",
      sourceType: "SCHEDULE",
      sourceId: "schedule-1",
      cancelReason: "SOURCE_UPDATED",
      canceledAt: NOW,
    });

    expect(count).toBe(2);
    expect(client.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        sourceType: "SCHEDULE",
        sourceId: "schedule-1",
        status: "PENDING",
      },
      data: {
        status: "CANCELED",
        canceledAt: NOW,
        cancelReason: "SOURCE_UPDATED",
      },
    });
  });

  it("upserts browser push subscription using encrypted fields only", async () => {
    const client = createMockClient();
    client.browserPushSubscription.updateMany.mockResolvedValue({ count: 0 });
    client.browserPushSubscription.create.mockResolvedValue(
      createBrowserPushSubscriptionFixture()
    );
    const repository = createRepository(client);

    await repository.upsertBrowserPushSubscription({
      userId: "user-1",
      endpointHash: "endpoint-hash",
      endpointCiphertext: "endpoint-ciphertext",
      p256dhCiphertext: "p256dh-ciphertext",
      authCiphertext: "auth-ciphertext",
      contentKeyVersion: "v1",
      userAgent: "Test Browser",
      deviceLabel: "Chrome",
      now: NOW,
    });

    expect(client.browserPushSubscription.updateMany).toHaveBeenCalledWith({
      where: {
        endpointHash: "endpoint-hash",
        userId: "user-1",
      },
      data: {
        endpointCiphertext: "endpoint-ciphertext",
        p256dhCiphertext: "p256dh-ciphertext",
        authCiphertext: "auth-ciphertext",
        contentKeyVersion: "v1",
        status: "ACTIVE",
        userAgent: "Test Browser",
        deviceLabel: "Chrome",
        lastSeenAt: NOW,
        revokedAt: null,
      },
    });
    expect(client.browserPushSubscription.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        endpointHash: "endpoint-hash",
        endpointCiphertext: "endpoint-ciphertext",
        p256dhCiphertext: "p256dh-ciphertext",
        authCiphertext: "auth-ciphertext",
        contentKeyVersion: "v1",
        userAgent: "Test Browser",
        deviceLabel: "Chrome",
        lastSeenAt: NOW,
      },
    });
    expect(
      JSON.stringify([
        client.browserPushSubscription.updateMany.mock.calls,
        client.browserPushSubscription.create.mock.calls,
      ])
    ).not.toContain("https://push.example.test");
  });

  it("reactivates only same-user browser push subscriptions", async () => {
    const client = createMockClient();
    client.browserPushSubscription.updateMany.mockResolvedValue({ count: 1 });
    client.browserPushSubscription.findUnique.mockResolvedValue(
      createBrowserPushSubscriptionFixture({ status: "ACTIVE", revokedAt: null })
    );
    const repository = createRepository(client);

    const subscription = await repository.upsertBrowserPushSubscription({
      userId: "user-1",
      endpointHash: "endpoint-hash",
      endpointCiphertext: "endpoint-ciphertext",
      p256dhCiphertext: "p256dh-ciphertext",
      authCiphertext: "auth-ciphertext",
      contentKeyVersion: "v1",
      now: NOW,
    });

    expect(client.browserPushSubscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          endpointHash: "endpoint-hash",
          userId: "user-1",
        },
      })
    );
    expect(client.browserPushSubscription.create).not.toHaveBeenCalled();
    expect(subscription.userId).toBe("user-1");
  });

  it("finds browser push subscription by endpoint hash", async () => {
    const client = createMockClient();
    client.browserPushSubscription.findUnique.mockResolvedValue(
      createBrowserPushSubscriptionFixture()
    );
    const repository = createRepository(client);

    const subscription =
      await repository.findBrowserPushSubscriptionByEndpointHash("endpoint-hash");

    expect(client.browserPushSubscription.findUnique).toHaveBeenCalledWith({
      where: { endpointHash: "endpoint-hash" },
    });
    expect(subscription?.id).toBe("subscription-1");
  });

  it("finds and revokes browser push subscription with user ownership", async () => {
    const client = createMockClient();
    client.browserPushSubscription.updateMany.mockResolvedValue({ count: 1 });
    client.browserPushSubscription.findFirst.mockResolvedValue(
      createBrowserPushSubscriptionFixture({ status: "REVOKED", revokedAt: NOW })
    );
    const repository = createRepository(client);

    const revoked = await repository.revokeBrowserPushSubscriptionForUser({
      userId: "user-1",
      browserSubscriptionId: "subscription-1",
      revokedAt: NOW,
    });

    expect(client.browserPushSubscription.updateMany).toHaveBeenCalledWith({
      where: {
        id: "subscription-1",
        userId: "user-1",
        status: "ACTIVE",
      },
      data: {
        status: "REVOKED",
        revokedAt: NOW,
      },
    });
    expect(client.browserPushSubscription.findFirst).toHaveBeenCalledWith({
      where: {
        id: "subscription-1",
        userId: "user-1",
      },
    });
    expect(revoked?.status).toBe("REVOKED");
  });
});

function createRepository(client: MockPrismaClient) {
  return new PrismaNotificationRepository(client as unknown as PrismaService);
}

function createMockClient(): MockPrismaClient {
  return {
    userNotificationSetting: createMockModel<NotificationSettingsFixture>(),
    notification: createMockModel<NotificationFixture>(),
    notificationDeliveryAttempt: createMockModel<DeliveryAttemptFixture>(),
    browserPushSubscription: createMockModel<BrowserPushSubscriptionFixture>(),
  };
}

function createMockModel<TRecord>(): MockModel<TRecord> {
  return {
    count: jest.fn<Promise<number>, [unknown]>(),
    create: jest.fn<Promise<TRecord>, [unknown]>(),
    findFirst: jest.fn<Promise<TRecord | null>, [unknown]>(),
    findMany: jest.fn<Promise<TRecord[]>, [unknown]>(),
    findUnique: jest.fn<Promise<TRecord | null>, [unknown]>(),
    update: jest.fn<Promise<TRecord>, [unknown]>(),
    updateMany: jest.fn<Promise<{ readonly count: number }>, [unknown]>(),
    upsert: jest.fn<Promise<TRecord>, [unknown]>(),
  };
}

function createNotificationFixture(
  input: Partial<NotificationFixture> = {}
): NotificationFixture {
  return {
    id: "notification-1",
    userId: "user-1",
    type: "SCHEDULE_START_REMINDER",
    sourceType: "SCHEDULE",
    sourceId: "schedule-1",
    dedupeKey: "schedule:schedule-1:start:2026-07-22T00:00:00.000Z",
    targetPath: "/app/schedules/schedule-1",
    title: "일정 알림",
    body: "30분 뒤 일정이 있어요.",
    targetLabel: "상담",
    status: "PENDING",
    scheduledAt: NOW,
    sentAt: null,
    readAt: null,
    canceledAt: null,
    cancelReason: null,
    metadataJson: { safe: true },
    createdAt: NOW,
    updatedAt: NOW,
    ...input,
  };
}

function createBrowserPushSubscriptionFixture(
  input: Partial<BrowserPushSubscriptionFixture> = {}
): BrowserPushSubscriptionFixture {
  return {
    id: "subscription-1",
    userId: "user-1",
    endpointHash: "endpoint-hash",
    endpointCiphertext: "endpoint-ciphertext",
    p256dhCiphertext: "p256dh-ciphertext",
    authCiphertext: "auth-ciphertext",
    contentKeyVersion: "v1",
    status: "ACTIVE",
    userAgent: "Test Browser",
    deviceLabel: "Chrome",
    lastSeenAt: NOW,
    revokedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...input,
  };
}
