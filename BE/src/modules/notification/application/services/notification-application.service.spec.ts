import { ConfigService } from "@nestjs/config";
import type { BrowserPushSubscriptionEncryptionPort } from "@/modules/notification/application/ports/browser-push-subscription-encryption.port";
import type {
  BrowserPushSubscriptionRecord,
  NotificationRecord,
  NotificationRepository,
  NotificationSettingsRecord,
} from "@/modules/notification/application/ports/notification.repository";
import {
  BrowserPushNotConfiguredError,
  NotificationNotFoundError,
  PushSubscriptionConflictError,
  PushSubscriptionNotFoundError,
} from "@/modules/notification/domain/notification.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { NotificationApplicationService } from "./notification-application.service";

const NOW = new Date("2026-07-22T01:02:03.000Z");

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

describe("NotificationApplicationService", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("lists current user notifications with due unread count", async () => {
    const repository = createRepositoryFake();
    repository.listNotificationsForUser.mockResolvedValue({
      items: [createNotificationFixture()],
      totalCount: 1,
    });
    repository.countUnreadNotificationsForUser.mockResolvedValue(4);
    const service = createService(repository);

    const response = await service.listNotifications(CURRENT_USER, {
      page: 2,
      pageSize: 20,
      read: "UNREAD",
      includeUpcoming: true,
    });

    expect(repository.listNotificationsForUser).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      page: 2,
      pageSize: 20,
      now: NOW,
      read: "UNREAD",
      includeUpcoming: true,
    });
    expect(repository.countUnreadNotificationsForUser).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      now: NOW,
    });
    expect(response).toMatchObject({
      unreadCount: 4,
      page: 2,
      pageSize: 20,
      totalCount: 1,
      items: [
        {
          id: "notification-1",
          scheduledAt: NOW.toISOString(),
          readAt: null,
        },
      ],
    });
  });

  it("rejects invalid read filters at the application boundary", async () => {
    const repository = createRepositoryFake();
    const service = createService(repository);

    await expect(
      service.listNotifications(CURRENT_USER, {
        read: "INVALID" as never,
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
    expect(repository.listNotificationsForUser).not.toHaveBeenCalled();
  });

  it("marks notifications as read and treats missing ownership as not found", async () => {
    const repository = createRepositoryFake();
    repository.markNotificationReadForUser.mockResolvedValue(
      createNotificationFixture({ readAt: NOW })
    );
    const service = createService(repository);

    await expect(
      service.markNotificationRead(CURRENT_USER, "notification-1")
    ).resolves.toMatchObject({
      id: "notification-1",
      readAt: NOW.toISOString(),
    });
    expect(repository.markNotificationReadForUser).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      notificationId: "notification-1",
      readAt: NOW,
    });

    repository.markNotificationReadForUser.mockResolvedValueOnce(null);

    await expect(
      service.markNotificationRead(CURRENT_USER, "other-user-notification")
    ).rejects.toBeInstanceOf(NotificationNotFoundError);
  });

  it("returns default settings when no settings row exists", async () => {
    const repository = createRepositoryFake();
    repository.findSettingsForUser.mockResolvedValue(null);
    const service = createService(repository);

    await expect(service.getSettings(CURRENT_USER)).resolves.toEqual({
      scheduleReminderEnabled: true,
      dealDueReminderEnabled: true,
      emailNotificationEnabled: true,
      browserPushEnabled: false,
      scheduleReminderMinutes: 30,
      dealDueReminderDaysBefore: 1,
      dealDueReminderLocalTime: "09:00",
    });
  });

  it("upserts non-empty settings changes in a transaction", async () => {
    const repository = createRepositoryFake();
    repository.upsertSettings.mockResolvedValue(
      createSettingsFixture({
        emailNotificationEnabled: false,
        browserPushEnabled: true,
      })
    );
    const service = createService(repository);

    const response = await service.updateSettings(CURRENT_USER, {
      emailNotificationEnabled: false,
      browserPushEnabled: true,
    });

    expect(repository.runInTransaction).toHaveBeenCalledTimes(1);
    expect(repository.upsertSettings).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      emailNotificationEnabled: false,
      browserPushEnabled: true,
    });
    expect(response.emailNotificationEnabled).toBe(false);
    expect(response.browserPushEnabled).toBe(true);
  });

  it("rejects empty settings updates", async () => {
    const repository = createRepositoryFake();
    const service = createService(repository);

    await expect(
      service.updateSettings(CURRENT_USER, {})
    ).rejects.toBeInstanceOf(ValidationDomainError);
    expect(repository.upsertSettings).not.toHaveBeenCalled();
  });

  it("returns VAPID public key and fails safely when it is missing", () => {
    const repository = createRepositoryFake();
    const service = createService(repository, {
      publicKey: "public-vapid-key",
    });

    expect(service.getBrowserPushPublicKey(CURRENT_USER)).toEqual({
      publicKey: "public-vapid-key",
    });

    const missingService = createService(repository, { publicKey: "" });
    expect(() =>
      missingService.getBrowserPushPublicKey(CURRENT_USER)
    ).toThrow(BrowserPushNotConfiguredError);
  });

  it("registers encrypted browser push subscriptions and enables settings", async () => {
    const repository = createRepositoryFake();
    repository.findBrowserPushSubscriptionByEndpointHash.mockResolvedValue(null);
    repository.upsertBrowserPushSubscription.mockResolvedValue(
      createBrowserPushSubscriptionFixture()
    );
    repository.upsertSettings.mockResolvedValue(
      createSettingsFixture({ browserPushEnabled: true })
    );
    const encryption = createEncryptionFake();
    const service = createService(repository, {}, encryption);

    const response = await service.createBrowserPushSubscription(CURRENT_USER, {
      endpoint: "https://push.example.test/raw-endpoint",
      keys: {
        p256dh: "raw-p256dh",
        auth: "raw-auth",
      },
      userAgent: "Test Browser",
      deviceLabel: "Chrome",
    });

    expect(encryption.encrypt).toHaveBeenCalledWith({
      endpoint: "https://push.example.test/raw-endpoint",
      p256dh: "raw-p256dh",
      auth: "raw-auth",
    });
    expect(repository.findBrowserPushSubscriptionByEndpointHash).toHaveBeenCalledWith(
      "endpoint-hash"
    );
    expect(repository.upsertBrowserPushSubscription).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      endpointHash: "endpoint-hash",
      endpointCiphertext: "endpoint-ciphertext",
      p256dhCiphertext: "p256dh-ciphertext",
      authCiphertext: "auth-ciphertext",
      contentKeyVersion: "v1",
      userAgent: "Test Browser",
      deviceLabel: "Chrome",
      now: NOW,
    });
    expect(JSON.stringify(repository.upsertBrowserPushSubscription.mock.calls))
      .not.toContain("raw-endpoint");
    expect(repository.upsertSettings).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      browserPushEnabled: true,
    });
    expect(response).toEqual({
      id: "subscription-1",
      status: "ACTIVE",
      deviceLabel: "Chrome",
      createdAt: NOW.toISOString(),
      revokedAt: null,
    });
  });

  it("rejects browser push endpoint hash owned by another user", async () => {
    const repository = createRepositoryFake();
    repository.findBrowserPushSubscriptionByEndpointHash.mockResolvedValue(
      createBrowserPushSubscriptionFixture({ userId: "other-user" })
    );
    const service = createService(repository);

    await expect(
      service.createBrowserPushSubscription(CURRENT_USER, {
        endpoint: "https://push.example.test/raw-endpoint",
        keys: {
          p256dh: "raw-p256dh",
          auth: "raw-auth",
        },
      })
    ).rejects.toBeInstanceOf(PushSubscriptionConflictError);
    expect(repository.upsertBrowserPushSubscription).not.toHaveBeenCalled();
  });

  it("rejects browser push upsert results that resolve to another user", async () => {
    const repository = createRepositoryFake();
    repository.findBrowserPushSubscriptionByEndpointHash.mockResolvedValue(null);
    repository.upsertBrowserPushSubscription.mockResolvedValue(
      createBrowserPushSubscriptionFixture({ userId: "other-user" })
    );
    const service = createService(repository);

    await expect(
      service.createBrowserPushSubscription(CURRENT_USER, {
        endpoint: "https://push.example.test/raw-endpoint",
        keys: {
          p256dh: "raw-p256dh",
          auth: "raw-auth",
        },
      })
    ).rejects.toBeInstanceOf(PushSubscriptionConflictError);
    expect(repository.upsertSettings).not.toHaveBeenCalled();
  });

  it("revokes browser push subscriptions and disables settings when none remain", async () => {
    const repository = createRepositoryFake();
    repository.findBrowserPushSubscriptionForUser.mockResolvedValue(
      createBrowserPushSubscriptionFixture()
    );
    repository.revokeBrowserPushSubscriptionForUser.mockResolvedValue(
      createBrowserPushSubscriptionFixture({ status: "REVOKED", revokedAt: NOW })
    );
    repository.listActiveBrowserPushSubscriptionsForUser.mockResolvedValue([]);
    repository.upsertSettings.mockResolvedValue(
      createSettingsFixture({ browserPushEnabled: false })
    );
    const service = createService(repository);

    const response = await service.revokeBrowserPushSubscription(
      CURRENT_USER,
      "subscription-1"
    );

    expect(repository.findBrowserPushSubscriptionForUser).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      browserSubscriptionId: "subscription-1",
    });
    expect(repository.revokeBrowserPushSubscriptionForUser).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      browserSubscriptionId: "subscription-1",
      revokedAt: NOW,
    });
    expect(repository.upsertSettings).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      browserPushEnabled: false,
    });
    expect(response.status).toBe("REVOKED");
  });

  it("treats missing browser push subscription ownership as not found", async () => {
    const repository = createRepositoryFake();
    repository.findBrowserPushSubscriptionForUser.mockResolvedValue(null);
    const service = createService(repository);

    await expect(
      service.revokeBrowserPushSubscription(CURRENT_USER, "subscription-1")
    ).rejects.toBeInstanceOf(PushSubscriptionNotFoundError);
    expect(repository.revokeBrowserPushSubscriptionForUser).not.toHaveBeenCalled();
  });
});

function createService(
  repository: jest.Mocked<NotificationRepository>,
  config: { readonly publicKey?: string } = {},
  encryption: jest.Mocked<BrowserPushSubscriptionEncryptionPort> =
    createEncryptionFake()
) {
  const configService = {
    get: jest.fn((key: string) =>
      key === "WEB_PUSH_VAPID_PUBLIC_KEY" ? config.publicKey : undefined
    ),
  } as unknown as ConfigService;
  const logger = { log: jest.fn() } as unknown as AppLogger;

  return new NotificationApplicationService(
    repository,
    encryption,
    configService,
    logger
  );
}

function createRepositoryFake(): jest.Mocked<NotificationRepository> {
  const repository: Partial<jest.Mocked<NotificationRepository>> = {
    findSettingsForUser: jest.fn(),
    upsertSettings: jest.fn(),
    createNotification: jest.fn(),
    findNotificationByIdForUser: jest.fn(),
    listNotificationsForUser: jest.fn(),
    countUnreadNotificationsForUser: jest.fn(),
    markNotificationReadForUser: jest.fn(),
    cancelPendingNotificationsBySource: jest.fn(),
    listDueNotifications: jest.fn(),
    markNotificationSent: jest.fn(),
    createDeliveryAttempt: jest.fn(),
    upsertBrowserPushSubscription: jest.fn(),
    findBrowserPushSubscriptionForUser: jest.fn(),
    findBrowserPushSubscriptionByEndpointHash: jest.fn(),
    listActiveBrowserPushSubscriptionsForUser: jest.fn(),
    revokeBrowserPushSubscriptionForUser: jest.fn(),
  };
  const runInTransactionMock = jest.fn(
    (work: (repository: NotificationRepository) => Promise<unknown>) =>
      work(repository as jest.Mocked<NotificationRepository>)
  );
  repository.runInTransaction =
    runInTransactionMock as unknown as jest.Mocked<NotificationRepository>["runInTransaction"];

  return repository as unknown as jest.Mocked<NotificationRepository>;
}

function createEncryptionFake(): jest.Mocked<BrowserPushSubscriptionEncryptionPort> {
  return {
    encrypt: jest.fn().mockReturnValue({
      endpointHash: "endpoint-hash",
      endpointCiphertext: "endpoint-ciphertext",
      p256dhCiphertext: "p256dh-ciphertext",
      authCiphertext: "auth-ciphertext",
      contentKeyVersion: "v1",
    }),
    decrypt: jest.fn(),
  };
}

function createNotificationFixture(
  input: Partial<NotificationRecord> = {}
): NotificationRecord {
  return {
    id: "notification-1",
    userId: CURRENT_USER.id,
    type: "SCHEDULE_START_REMINDER",
    sourceType: "SCHEDULE",
    sourceId: "schedule-1",
    dedupeKey: "schedule:schedule-1:start:2026-07-22T01:02:03.000Z",
    targetPath: "/app/schedules/schedule-1",
    title: "Schedule reminder",
    body: "Schedule starts soon.",
    targetLabel: "Sales call",
    status: "SENT",
    scheduledAt: NOW,
    sentAt: NOW,
    readAt: null,
    canceledAt: null,
    cancelReason: null,
    metadataJson: {},
    createdAt: NOW,
    updatedAt: NOW,
    ...input,
  };
}

function createSettingsFixture(
  input: Partial<NotificationSettingsRecord> = {}
): NotificationSettingsRecord {
  return {
    id: "settings-1",
    userId: CURRENT_USER.id,
    scheduleReminderEnabled: true,
    dealDueReminderEnabled: true,
    emailNotificationEnabled: true,
    browserPushEnabled: false,
    scheduleReminderMinutes: 30,
    dealDueReminderDaysBefore: 1,
    dealDueReminderLocalTime: "09:00",
    createdAt: NOW,
    updatedAt: NOW,
    ...input,
  };
}

function createBrowserPushSubscriptionFixture(
  input: Partial<BrowserPushSubscriptionRecord> = {}
): BrowserPushSubscriptionRecord {
  return {
    id: "subscription-1",
    userId: CURRENT_USER.id,
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
