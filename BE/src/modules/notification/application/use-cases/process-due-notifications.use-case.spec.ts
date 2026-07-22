import type { BrowserPushSubscriptionEncryptionPort } from "@/modules/notification/application/ports/browser-push-subscription-encryption.port";
import type {
  NotificationBrowserPushDeliveryPort,
  NotificationEmailDeliveryPort,
} from "@/modules/notification/application/ports/notification-delivery.provider";
import type {
  BrowserPushSubscriptionRecord,
  NotificationDeliveryAttemptRecord,
  NotificationRecord,
  NotificationRepository,
  NotificationSettingsRecord,
  NotificationUserRecord,
} from "@/modules/notification/application/ports/notification.repository";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import {
  ProcessDueNotificationsUseCase,
  SendNotificationDeliveryAttemptUseCase,
} from "./process-due-notifications.use-case";

const NOW = new Date("2026-07-22T00:00:00.000Z");
const USER_ID = "00000000-0000-4000-8000-000000000101";

// 기능 : due notification 처리, provider 결과 저장, retry 생성, push 구독 해제를 검증합니다.
describe("ProcessDueNotificationsUseCase", () => {
  it("marks due notifications sent and records email and browser push delivery results", async () => {
    const repository = createRepositoryMock();
    const emailDelivery = createEmailDeliveryMock();
    const browserPushDelivery = createBrowserPushDeliveryMock();
    const encryption = createEncryptionMock();
    const notification = createNotificationFixture();
    const emailAttempt = createDeliveryAttemptFixture({ channel: "EMAIL" });
    const pushAttempt = createDeliveryAttemptFixture({
      id: "attempt-push",
      channel: "BROWSER_PUSH",
      detailJson: { subscriptionId: "subscription-1" },
    });
    const subscription = createBrowserPushSubscriptionFixture();
    repository.listDueNotifications.mockResolvedValue([notification]);
    repository.markNotificationSent.mockResolvedValue(true);
    repository.findSettingsForUser.mockResolvedValue(
      createSettingsFixture({
        emailNotificationEnabled: true,
        browserPushEnabled: true,
      })
    );
    repository.findUserForNotification.mockResolvedValue(createUserFixture());
    repository.listActiveBrowserPushSubscriptionsForUser.mockResolvedValue([
      subscription,
    ]);
    repository.createDeliveryAttempt
      .mockResolvedValueOnce(emailAttempt)
      .mockResolvedValueOnce(pushAttempt);
    repository.listRetryableDeliveryAttempts.mockResolvedValue([]);
    repository.markDeliveryAttemptSent.mockResolvedValue(
      createDeliveryAttemptFixture({ channel: "EMAIL", status: "SENT" })
    );
    repository.markDeliveryAttemptFailed.mockResolvedValue(
      createDeliveryAttemptFixture({
        id: "attempt-push",
        channel: "BROWSER_PUSH",
        status: "FAILED",
      })
    );
    repository.revokeBrowserPushSubscriptionForUser.mockResolvedValue({
      ...subscription,
      status: "REVOKED",
      revokedAt: NOW,
    });
    emailDelivery.sendEmail.mockResolvedValue({
      ok: true,
      provider: "smtp",
      providerMessageId: "smtp-message-1",
      providerStatusCode: null,
    });
    browserPushDelivery.sendBrowserPush.mockResolvedValue({
      ok: false,
      provider: "web-push",
      providerStatusCode: "410",
      safeErrorCode: "PUSH_SUBSCRIPTION_GONE",
      safeErrorMessage: "Push subscription is gone",
      retryable: false,
      subscriptionGone: true,
    });
    const useCase = createProcessUseCase(
      repository,
      emailDelivery,
      browserPushDelivery,
      encryption
    );

    const result = await useCase.execute({
      now: NOW,
      limit: 10,
    });

    expect(repository.markNotificationSent).toHaveBeenCalledWith({
      notificationId: notification.id,
      sentAt: NOW,
    });
    expect(repository.createDeliveryAttempt).toHaveBeenCalledTimes(2);
    expect(repository.markDeliveryAttemptSent).toHaveBeenCalledWith({
      deliveryAttemptId: emailAttempt.id,
      sentAt: NOW,
      provider: "smtp",
      providerMessageId: "smtp-message-1",
      providerStatusCode: null,
    });
    expect(repository.markDeliveryAttemptFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryAttemptId: pushAttempt.id,
        provider: "web-push",
        providerStatusCode: "410",
        safeErrorCode: "PUSH_SUBSCRIPTION_GONE",
        retryable: false,
      })
    );
    expect(repository.revokeBrowserPushSubscriptionForUser).toHaveBeenCalledWith({
      userId: USER_ID,
      browserSubscriptionId: "subscription-1",
      revokedAt: NOW,
    });
    expect(JSON.stringify(repository.createDeliveryAttempt.mock.calls)).not.toContain(
      "https://push.example.test/raw-endpoint"
    );
    expect(result).toEqual({
      dueNotifications: 1,
      notificationsSent: 1,
      deliveryAttemptsCreated: 2,
      deliveryAttemptsSent: 1,
      deliveryAttemptsFailed: 1,
      retryAttemptsCreated: 0,
      subscriptionsRevoked: 1,
    });
  });

  it("records a successful browser push delivery attempt for active subscriptions", async () => {
    const repository = createRepositoryMock();
    const emailDelivery = createEmailDeliveryMock();
    const browserPushDelivery = createBrowserPushDeliveryMock();
    const encryption = createEncryptionMock();
    const notification = createNotificationFixture({
      body: "Renewal deal closes tomorrow.",
      sourceType: "DEAL",
      targetPath: "/app/deals/source-1",
      title: "Deal due reminder",
      type: "DEAL_DUE_REMINDER",
    });
    const pushAttempt = createDeliveryAttemptFixture({
      id: "attempt-push-success",
      channel: "BROWSER_PUSH",
      detailJson: { subscriptionId: "subscription-1" },
    });
    const subscription = createBrowserPushSubscriptionFixture();
    repository.listDueNotifications.mockResolvedValue([notification]);
    repository.markNotificationSent.mockResolvedValue(true);
    repository.findSettingsForUser.mockResolvedValue(
      createSettingsFixture({
        browserPushEnabled: true,
        emailNotificationEnabled: false,
      })
    );
    repository.findUserForNotification.mockResolvedValue(createUserFixture());
    repository.listActiveBrowserPushSubscriptionsForUser.mockResolvedValue([
      subscription,
    ]);
    repository.createDeliveryAttempt.mockResolvedValue(pushAttempt);
    repository.listRetryableDeliveryAttempts.mockResolvedValue([]);
    repository.markDeliveryAttemptSent.mockResolvedValue({
      ...pushAttempt,
      provider: "web-push",
      providerStatusCode: "201",
      sentAt: NOW,
      status: "SENT",
    });
    browserPushDelivery.sendBrowserPush.mockResolvedValue({
      ok: true,
      provider: "web-push",
      providerMessageId: null,
      providerStatusCode: "201",
    });
    const useCase = createProcessUseCase(
      repository,
      emailDelivery,
      browserPushDelivery,
      encryption
    );

    const result = await useCase.execute({ now: NOW, limit: 10 });

    expect(repository.createDeliveryAttempt).toHaveBeenCalledWith({
      notificationId: notification.id,
      userId: USER_ID,
      channel: "BROWSER_PUSH",
      status: "PENDING",
      attemptNumber: 1,
      detailJson: { subscriptionId: "subscription-1" },
    });
    expect(browserPushDelivery.sendBrowserPush).toHaveBeenCalledWith(
      expect.objectContaining({
        body: "Renewal deal closes tomorrow.",
        endpoint: "https://push.example.test/raw-endpoint",
        targetPath: "/app/deals/source-1",
        title: "Deal due reminder",
      })
    );
    expect(repository.markDeliveryAttemptSent).toHaveBeenCalledWith({
      deliveryAttemptId: "attempt-push-success",
      provider: "web-push",
      providerMessageId: null,
      providerStatusCode: "201",
      sentAt: NOW,
    });
    expect(result).toEqual(
      expect.objectContaining({
        deliveryAttemptsCreated: 1,
        deliveryAttemptsFailed: 0,
        deliveryAttemptsSent: 1,
        subscriptionsRevoked: 0,
      })
    );
  });

  it("creates a new attempt for retryable delivery failures", async () => {
    const repository = createRepositoryMock();
    const emailDelivery = createEmailDeliveryMock();
    const browserPushDelivery = createBrowserPushDeliveryMock();
    const encryption = createEncryptionMock();
    const notification = createNotificationFixture();
    const failedAttempt = createDeliveryAttemptFixture({
      id: "attempt-failed",
      channel: "EMAIL",
      status: "FAILED",
      attemptNumber: 1,
      retryable: true,
      nextRetryAt: NOW,
    });
    const retryAttempt = createDeliveryAttemptFixture({
      id: "attempt-retry",
      channel: "EMAIL",
      attemptNumber: 2,
    });
    repository.listDueNotifications.mockResolvedValue([]);
    repository.listRetryableDeliveryAttempts.mockResolvedValue([
      {
        attempt: failedAttempt,
        notification,
        user: createUserFixture(),
      },
    ]);
    repository.markDeliveryAttemptRetryConsumed.mockResolvedValue(true);
    repository.createDeliveryAttempt.mockResolvedValue(retryAttempt);
    repository.markDeliveryAttemptSent.mockResolvedValue({
      ...retryAttempt,
      status: "SENT",
      sentAt: NOW,
    });
    emailDelivery.sendEmail.mockResolvedValue({
      ok: true,
      provider: "smtp",
      providerMessageId: "smtp-message-2",
      providerStatusCode: null,
    });
    const useCase = createProcessUseCase(
      repository,
      emailDelivery,
      browserPushDelivery,
      encryption
    );

    const result = await useCase.execute({ now: NOW });

    expect(repository.markDeliveryAttemptRetryConsumed).toHaveBeenCalledWith(
      "attempt-failed"
    );
    expect(repository.createDeliveryAttempt).toHaveBeenCalledWith({
      notificationId: notification.id,
      userId: USER_ID,
      channel: "EMAIL",
      status: "PENDING",
      attemptNumber: 2,
      detailJson: {},
    });
    expect(result.retryAttemptsCreated).toBe(1);
    expect(result.deliveryAttemptsSent).toBe(1);
  });
});

// 기능 : 실제 processor와 delivery attempt use case 조합을 테스트용 의존성으로 생성합니다.
function createProcessUseCase(
  repository: jest.Mocked<NotificationRepository>,
  emailDelivery: jest.Mocked<NotificationEmailDeliveryPort>,
  browserPushDelivery: jest.Mocked<NotificationBrowserPushDeliveryPort>,
  encryption: jest.Mocked<BrowserPushSubscriptionEncryptionPort>
): ProcessDueNotificationsUseCase {
  const sendUseCase = new SendNotificationDeliveryAttemptUseCase(
    repository,
    emailDelivery,
    browserPushDelivery,
    encryption,
    createLogger()
  );

  return new ProcessDueNotificationsUseCase(
    repository,
    sendUseCase,
    createLogger()
  );
}

// 기능 : due processor가 사용하는 알림 저장소 mock을 생성합니다.
function createRepositoryMock(): jest.Mocked<NotificationRepository> {
  const repository: Partial<jest.Mocked<NotificationRepository>> = {
    findSettingsForUser: jest.fn(),
    upsertSettings: jest.fn(),
    createNotification: jest.fn(),
    upsertReminderNotification: jest.fn(),
    findNotificationByIdForUser: jest.fn(),
    listNotificationsForUser: jest.fn(),
    countUnreadNotificationsForUser: jest.fn(),
    markNotificationReadForUser: jest.fn(),
    cancelPendingNotificationsBySource: jest.fn(),
    listDueNotifications: jest.fn(),
    markNotificationSent: jest.fn(),
    createDeliveryAttempt: jest.fn(),
    markDeliveryAttemptSent: jest.fn(),
    markDeliveryAttemptFailed: jest.fn(),
    markDeliveryAttemptRetryConsumed: jest.fn(),
    listRetryableDeliveryAttempts: jest.fn(),
    findUserForNotification: jest.fn(),
    upsertBrowserPushSubscription: jest.fn(),
    findBrowserPushSubscriptionForUser: jest.fn(),
    findBrowserPushSubscriptionByEndpointHash: jest.fn(),
    listActiveBrowserPushSubscriptionsForUser: jest.fn(),
    revokeBrowserPushSubscriptionForUser: jest.fn(),
  };
  repository.runInTransaction = jest.fn(
    (work: (repository: NotificationRepository) => Promise<unknown>) =>
      work(repository as jest.Mocked<NotificationRepository>)
  ) as unknown as jest.Mocked<NotificationRepository>["runInTransaction"];

  return repository as jest.Mocked<NotificationRepository>;
}

// 기능 : email delivery provider mock을 생성합니다.
function createEmailDeliveryMock(): jest.Mocked<NotificationEmailDeliveryPort> {
  return {
    sendEmail: jest.fn(),
  };
}

// 기능 : browser push delivery provider mock을 생성합니다.
function createBrowserPushDeliveryMock(): jest.Mocked<NotificationBrowserPushDeliveryPort> {
  return {
    sendBrowserPush: jest.fn(),
  };
}

// 기능 : push subscription 복호화 mock을 생성합니다.
function createEncryptionMock(): jest.Mocked<BrowserPushSubscriptionEncryptionPort> {
  return {
    encrypt: jest.fn(),
    decrypt: jest.fn().mockReturnValue({
      endpoint: "https://push.example.test/raw-endpoint",
      p256dh: "raw-p256dh",
      auth: "raw-auth",
    }),
  };
}

// 기능 : 테스트 중 구조화 로그 출력을 mock으로 대체합니다.
function createLogger(): AppLogger {
  return {
    log: jest.fn(),
  } as unknown as AppLogger;
}

// 기능 : due processor 입력으로 사용할 notification fixture를 생성합니다.
function createNotificationFixture(
  input: Partial<NotificationRecord> = {}
): NotificationRecord {
  return {
    id: "notification-1",
    userId: USER_ID,
    type: "SCHEDULE_START_REMINDER",
    sourceType: "SCHEDULE",
    sourceId: "source-1",
    dedupeKey: "dedupe",
    targetPath: "/app/schedules/source-1",
    title: "Schedule reminder",
    body: "Sales call starts soon.",
    targetLabel: "Sales call",
    status: "PENDING",
    scheduledAt: NOW,
    sentAt: null,
    readAt: null,
    canceledAt: null,
    cancelReason: null,
    metadataJson: {},
    createdAt: NOW,
    updatedAt: NOW,
    ...input,
  };
}

// 기능 : 알림 설정 fixture를 생성합니다.
function createSettingsFixture(
  input: Partial<NotificationSettingsRecord> = {}
): NotificationSettingsRecord {
  return {
    id: "settings-1",
    userId: USER_ID,
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

// 기능 : 발송 대상 사용자 fixture를 생성합니다.
function createUserFixture(
  input: Partial<NotificationUserRecord> = {}
): NotificationUserRecord {
  return {
    id: USER_ID,
    email: "user@example.com",
    timeZone: "Asia/Seoul",
    ...input,
  };
}

// 기능 : email/browser push delivery attempt fixture를 생성합니다.
function createDeliveryAttemptFixture(
  input: Partial<NotificationDeliveryAttemptRecord> = {}
): NotificationDeliveryAttemptRecord {
  return {
    id: "attempt-email",
    notificationId: "notification-1",
    userId: USER_ID,
    channel: "EMAIL",
    status: "PENDING",
    attemptNumber: 1,
    provider: null,
    providerMessageId: null,
    providerStatusCode: null,
    safeErrorCode: null,
    safeErrorMessage: null,
    retryable: false,
    nextRetryAt: null,
    sentAt: null,
    failedAt: null,
    detailJson: {},
    createdAt: NOW,
    updatedAt: NOW,
    ...input,
  };
}

// 기능 : 암호화 저장 상태의 browser push subscription fixture를 생성합니다.
function createBrowserPushSubscriptionFixture(
  input: Partial<BrowserPushSubscriptionRecord> = {}
): BrowserPushSubscriptionRecord {
  return {
    id: "subscription-1",
    userId: USER_ID,
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
