import { Inject, Injectable } from "@nestjs/common";
import {
  BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT,
  type BrowserPushSubscriptionEncryptionPort,
  type BrowserPushSubscriptionPlaintext,
} from "@/modules/notification/application/ports/browser-push-subscription-encryption.port";
import {
  BROWSER_PUSH_NOTIFICATION_DELIVERY_PORT,
  EMAIL_NOTIFICATION_DELIVERY_PORT,
  type NotificationBrowserPushDeliveryPort,
  type NotificationDeliveryProviderFailure,
  type NotificationDeliveryProviderResult,
  type NotificationEmailDeliveryPort,
} from "@/modules/notification/application/ports/notification-delivery.provider";
import {
  NOTIFICATION_REPOSITORY,
  type BrowserPushSubscriptionRecord,
  type NotificationDeliveryAttemptRecord,
  type NotificationDeliveryWorkItemRecord,
  type NotificationRecord,
  type NotificationRepository,
  type NotificationSettingsRecord,
  type NotificationUserRecord,
} from "@/modules/notification/application/ports/notification.repository";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_EMAIL_NOTIFICATION_ENABLED = true;
const DEFAULT_BROWSER_PUSH_ENABLED = false;
const DEFAULT_BATCH_SIZE = 50;
const MAX_BATCH_SIZE = 200;
const MAX_DELIVERY_ATTEMPTS = 3;
const RETRY_DELAYS_MINUTES = [5, 15, 60] as const;

// 역할 : provider 발송 대상이 되는 delivery attempt와 관련 context를 묶습니다.
export interface DeliveryWorkItem {
  readonly attempt: NotificationDeliveryAttemptRecord;
  readonly notification: NotificationRecord;
  readonly user: NotificationUserRecord;
  readonly subscription?: BrowserPushSubscriptionRecord;
}

// 역할 : 단일 또는 다중 delivery 처리 결과 count를 정의합니다.
export interface DeliveryCounters {
  readonly sent: number;
  readonly failed: number;
  readonly subscriptionsRevoked: number;
}

// 역할 : due notification processor 실행 command를 정의합니다.
export interface ProcessDueNotificationsCommand {
  readonly now?: Date;
  readonly limit?: number;
  readonly includeRetries?: boolean;
}

// 역할 : due notification processor 실행 결과 통계를 정의합니다.
export interface ProcessDueNotificationsResult {
  readonly dueNotifications: number;
  readonly notificationsSent: number;
  readonly deliveryAttemptsCreated: number;
  readonly deliveryAttemptsSent: number;
  readonly deliveryAttemptsFailed: number;
  readonly retryAttemptsCreated: number;
  readonly subscriptionsRevoked: number;
}

@Injectable()
// 역할 : email/browser push delivery attempt 한 건을 provider로 발송하고 결과를 저장합니다.
export class SendNotificationDeliveryAttemptUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_NOTIFICATION_DELIVERY_PORT)
    private readonly emailDelivery: NotificationEmailDeliveryPort,
    @Inject(BROWSER_PUSH_NOTIFICATION_DELIVERY_PORT)
    private readonly browserPushDelivery: NotificationBrowserPushDeliveryPort,
    @Inject(BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT)
    private readonly browserPushSubscriptionEncryption: BrowserPushSubscriptionEncryptionPort,
    private readonly logger: AppLogger
  ) {}

  async execute(input: DeliveryWorkItem, now: Date): Promise<DeliveryCounters> {
    // 기능 : channel에 맞는 provider 발송 경로로 분기합니다.
    if (input.attempt.channel === "EMAIL") {
      return this.sendEmail(input, now);
    }

    return this.sendBrowserPush(input, now);
  }

  private async sendEmail(
    input: DeliveryWorkItem,
    now: Date
  ): Promise<DeliveryCounters> {
    // 기능 : email 주소가 없으면 provider 호출 없이 안전한 실패로 저장합니다.
    if (!input.user.email) {
      await this.markFailed(input.attempt, now, {
        ok: false,
        provider: "smtp",
        safeErrorCode: "EMAIL_ADDRESS_MISSING",
        safeErrorMessage: "User email is missing",
        retryable: false,
      });

      return { sent: 0, failed: 1, subscriptionsRevoked: 0 };
    }

    const result = await this.emailDelivery.sendEmail({
      to: input.user.email,
      subject: input.notification.title,
      text: this.createEmailText(input.notification),
    });

    return this.persistProviderResult(input.attempt, result, now, null);
  }

  private async sendBrowserPush(
    input: DeliveryWorkItem,
    now: Date
  ): Promise<DeliveryCounters> {
    // 기능 : push subscription 원문은 발송 직전에만 복호화하고 저장하지 않습니다.
    const subscription = await this.resolveBrowserPushSubscription(input);

    if (!subscription || subscription.status !== "ACTIVE") {
      await this.markFailed(input.attempt, now, {
        ok: false,
        provider: "web-push",
        safeErrorCode: "PUSH_SUBSCRIPTION_NOT_ACTIVE",
        safeErrorMessage: "Push subscription is not active",
        retryable: false,
      });

      return { sent: 0, failed: 1, subscriptionsRevoked: 0 };
    }

    const plaintext = this.decryptSubscription(subscription);

    if (!plaintext) {
      await this.markFailed(input.attempt, now, {
        ok: false,
        provider: "web-push",
        safeErrorCode: "PUSH_SUBSCRIPTION_DECRYPT_FAILED",
        safeErrorMessage: "Push subscription decrypt failed",
        retryable: false,
      });

      return { sent: 0, failed: 1, subscriptionsRevoked: 0 };
    }

    const result = await this.browserPushDelivery.sendBrowserPush({
      endpoint: plaintext.endpoint,
      p256dh: plaintext.p256dh,
      auth: plaintext.auth,
      title: input.notification.title,
      body: input.notification.body ?? input.notification.title,
      targetPath: input.notification.targetPath,
    });

    return this.persistProviderResult(
      input.attempt,
      result,
      now,
      subscription.id
    );
  }

  private async persistProviderResult(
    attempt: NotificationDeliveryAttemptRecord,
    result: NotificationDeliveryProviderResult,
    now: Date,
    subscriptionId: string | null
  ): Promise<DeliveryCounters> {
    // 기능 : provider 결과를 안전한 delivery attempt 상태로 변환해 저장합니다.
    if (result.ok) {
      await this.notificationRepository.markDeliveryAttemptSent({
        deliveryAttemptId: attempt.id,
        sentAt: now,
        provider: result.provider,
        providerMessageId: result.providerMessageId ?? null,
        providerStatusCode: result.providerStatusCode ?? null,
      });

      this.logEvent("notification.delivery.sent", {
        userId: attempt.userId,
        notificationId: attempt.notificationId,
        deliveryAttemptId: attempt.id,
        channel: attempt.channel,
        provider: result.provider,
      });

      return { sent: 1, failed: 0, subscriptionsRevoked: 0 };
    }

    const retryable =
      result.retryable && attempt.attemptNumber < MAX_DELIVERY_ATTEMPTS;
    const nextRetryAt = retryable
      ? createNextRetryAt(now, attempt.attemptNumber)
      : null;
    await this.markFailed(attempt, now, {
      ...result,
      retryable,
      nextRetryAt,
    });

    let subscriptionsRevoked = 0;

    if (result.subscriptionGone && subscriptionId) {
      const revoked =
        await this.notificationRepository.revokeBrowserPushSubscriptionForUser({
          userId: attempt.userId,
          browserSubscriptionId: subscriptionId,
          revokedAt: now,
        });

      subscriptionsRevoked = revoked ? 1 : 0;
    }

    this.logEvent("notification.delivery.failed", {
      userId: attempt.userId,
      notificationId: attempt.notificationId,
      deliveryAttemptId: attempt.id,
      channel: attempt.channel,
      provider: result.provider,
      safeErrorCode: result.safeErrorCode,
      retryable,
      subscriptionsRevoked,
    });

    return { sent: 0, failed: 1, subscriptionsRevoked };
  }

  private async markFailed(
    attempt: NotificationDeliveryAttemptRecord,
    now: Date,
    failure: NotificationDeliveryProviderFailure & {
      readonly nextRetryAt?: Date | null;
    }
  ): Promise<void> {
    await this.notificationRepository.markDeliveryAttemptFailed({
      deliveryAttemptId: attempt.id,
      failedAt: now,
      provider: failure.provider,
      providerStatusCode: failure.providerStatusCode ?? null,
      safeErrorCode: failure.safeErrorCode,
      safeErrorMessage: failure.safeErrorMessage,
      retryable: failure.retryable,
      nextRetryAt: failure.nextRetryAt ?? null,
    });
  }

  private async resolveBrowserPushSubscription(
    input: DeliveryWorkItem
  ): Promise<BrowserPushSubscriptionRecord | null> {
    if (input.subscription) {
      return input.subscription;
    }

    const subscriptionId = getStringDetail(
      input.attempt.detailJson,
      "subscriptionId"
    );

    if (!subscriptionId) {
      return null;
    }

    return this.notificationRepository.findBrowserPushSubscriptionForUser({
      userId: input.attempt.userId,
      browserSubscriptionId: subscriptionId,
    });
  }

  private decryptSubscription(
    subscription: BrowserPushSubscriptionRecord
  ): BrowserPushSubscriptionPlaintext | null {
    // 기능 : 복호화 실패는 원문 노출 없이 non-retryable delivery 실패로 처리합니다.
    try {
      return this.browserPushSubscriptionEncryption.decrypt({
        endpointHash: subscription.endpointHash,
        endpointCiphertext: subscription.endpointCiphertext,
        p256dhCiphertext: subscription.p256dhCiphertext,
        authCiphertext: subscription.authCiphertext,
        contentKeyVersion: subscription.contentKeyVersion,
      });
    } catch {
      return null;
    }
  }

  private createEmailText(notification: NotificationRecord): string {
    // 기능 : email 본문은 provider 전달용으로만 만들고 로그나 DB에는 저장하지 않습니다.
    const lines = [
      notification.title,
      notification.body ?? "",
      `Open: ${notification.targetPath}`,
    ].filter((line) => line.trim().length > 0);

    return lines.join("\n\n");
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(JSON.stringify({ event, ...fields }), this.constructor.name);
  }
}

@Injectable()
// 역할 : due 상태의 app notification을 발송 처리하고 retry 대상 attempt를 재시도합니다.
export class ProcessDueNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly sendDeliveryAttempt: SendNotificationDeliveryAttemptUseCase,
    private readonly logger: AppLogger
  ) {}

  async execute(
    input: ProcessDueNotificationsCommand = {}
  ): Promise<ProcessDueNotificationsResult> {
    // 기능 : due notification 조회와 provider 발송을 batch 단위로 처리합니다.
    const now = input.now ?? new Date();
    const limit = normalizeBatchSize(input.limit);
    const dueNotifications = await this.notificationRepository.listDueNotifications({
      now,
      limit,
    });

    let notificationsSent = 0;
    let deliveryAttemptsCreated = 0;
    let deliveryAttemptsSent = 0;
    let deliveryAttemptsFailed = 0;
    let subscriptionsRevoked = 0;

    for (const notification of dueNotifications) {
      const workItems = await this.prepareDueNotification(notification, now);

      if (!workItems) {
        continue;
      }

      notificationsSent += 1;
      deliveryAttemptsCreated += workItems.length;
      const counters = await this.sendWorkItems(workItems, now);
      deliveryAttemptsSent += counters.sent;
      deliveryAttemptsFailed += counters.failed;
      subscriptionsRevoked += counters.subscriptionsRevoked;
    }

    const retryResult =
      input.includeRetries === false
        ? { created: 0, sent: 0, failed: 0, subscriptionsRevoked: 0 }
        : await this.processRetryableDeliveryAttempts({ now, limit });

    this.logEvent("notification.due.processed", {
      dueNotifications: dueNotifications.length,
      notificationsSent,
      deliveryAttemptsCreated,
      deliveryAttemptsSent,
      deliveryAttemptsFailed,
      retryAttemptsCreated: retryResult.created,
      subscriptionsRevoked: subscriptionsRevoked + retryResult.subscriptionsRevoked,
    });

    return {
      dueNotifications: dueNotifications.length,
      notificationsSent,
      deliveryAttemptsCreated,
      deliveryAttemptsSent: deliveryAttemptsSent + retryResult.sent,
      deliveryAttemptsFailed: deliveryAttemptsFailed + retryResult.failed,
      retryAttemptsCreated: retryResult.created,
      subscriptionsRevoked: subscriptionsRevoked + retryResult.subscriptionsRevoked,
    };
  }

  private async prepareDueNotification(
    notification: NotificationRecord,
    now: Date
  ): Promise<DeliveryWorkItem[] | null> {
    // 기능 : notification 상태 변경과 delivery attempt 생성을 같은 DB transaction에서 처리합니다.
    return this.notificationRepository.runInTransaction(async (repository) => {
      const marked = await repository.markNotificationSent({
        notificationId: notification.id,
        sentAt: now,
      });

      if (!marked) {
        return null;
      }

      const [settings, user] = await Promise.all([
        repository.findSettingsForUser(notification.userId),
        repository.findUserForNotification(notification.userId),
      ]);

      if (!user) {
        return [];
      }

      const workItems: DeliveryWorkItem[] = [];
      const effectiveSettings = createEffectiveSettings(settings);

      if (effectiveSettings.emailNotificationEnabled && user.email) {
        const attempt = await repository.createDeliveryAttempt({
          notificationId: notification.id,
          userId: notification.userId,
          channel: "EMAIL",
          status: "PENDING",
          attemptNumber: 1,
          detailJson: {},
        });

        workItems.push({ attempt, notification, user });
      }

      if (effectiveSettings.browserPushEnabled) {
        const subscriptions =
          await repository.listActiveBrowserPushSubscriptionsForUser(
            notification.userId
          );

        for (const subscription of subscriptions) {
          const attempt = await repository.createDeliveryAttempt({
            notificationId: notification.id,
            userId: notification.userId,
            channel: "BROWSER_PUSH",
            status: "PENDING",
            attemptNumber: 1,
            detailJson: { subscriptionId: subscription.id },
          });

          workItems.push({ attempt, notification, user, subscription });
        }
      }

      return workItems;
    });
  }

  private async processRetryableDeliveryAttempts(input: {
    readonly now: Date;
    readonly limit: number;
  }): Promise<{
    readonly created: number;
    readonly sent: number;
    readonly failed: number;
    readonly subscriptionsRevoked: number;
  }> {
    // 기능 : retry 가능 attempt를 새 attempt row로 승격한 뒤 provider 발송을 재실행합니다.
    const retryableAttempts =
      await this.notificationRepository.listRetryableDeliveryAttempts(input);
    let created = 0;
    let sent = 0;
    let failed = 0;
    let subscriptionsRevoked = 0;

    for (const workItem of retryableAttempts) {
      const nextWorkItem = await this.createRetryWorkItem(workItem);

      if (!nextWorkItem) {
        continue;
      }

      created += 1;
      const counters = await this.sendWorkItems([nextWorkItem], input.now);
      sent += counters.sent;
      failed += counters.failed;
      subscriptionsRevoked += counters.subscriptionsRevoked;
    }

    return { created, sent, failed, subscriptionsRevoked };
  }

  private async createRetryWorkItem(
    workItem: NotificationDeliveryWorkItemRecord
  ): Promise<DeliveryWorkItem | null> {
    // 기능 : 기존 failed attempt를 소비 처리하고 다음 attempt number의 row를 생성합니다.
    return this.notificationRepository.runInTransaction(async (repository) => {
      const consumed = await repository.markDeliveryAttemptRetryConsumed(
        workItem.attempt.id
      );

      if (!consumed) {
        return null;
      }

      const attempt = await repository.createDeliveryAttempt({
        notificationId: workItem.notification.id,
        userId: workItem.attempt.userId,
        channel: workItem.attempt.channel,
        status: "PENDING",
        attemptNumber: workItem.attempt.attemptNumber + 1,
        detailJson: workItem.attempt.detailJson,
      });

      return {
        attempt,
        notification: workItem.notification,
        user: workItem.user,
      };
    });
  }

  private async sendWorkItems(
    workItems: readonly DeliveryWorkItem[],
    now: Date
  ): Promise<DeliveryCounters> {
    // 기능 : DB transaction 밖에서 provider 호출을 순차 실행하고 count를 누적합니다.
    let sent = 0;
    let failed = 0;
    let subscriptionsRevoked = 0;

    for (const workItem of workItems) {
      const counters = await this.sendDeliveryAttempt.execute(workItem, now);
      sent += counters.sent;
      failed += counters.failed;
      subscriptionsRevoked += counters.subscriptionsRevoked;
    }

    return { sent, failed, subscriptionsRevoked };
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(JSON.stringify({ event, ...fields }), this.constructor.name);
  }
}

// 기능 : 알림 설정이 없을 때 적용할 delivery channel 기본값을 계산합니다.
function createEffectiveSettings(
  settings: NotificationSettingsRecord | null
): {
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
} {
  return {
    emailNotificationEnabled:
      settings?.emailNotificationEnabled ?? DEFAULT_EMAIL_NOTIFICATION_ENABLED,
    browserPushEnabled: settings?.browserPushEnabled ?? DEFAULT_BROWSER_PUSH_ENABLED,
  };
}

// 기능 : processor batch size를 허용 범위 안의 정수로 정규화합니다.
function normalizeBatchSize(value: number | undefined): number {
  if (!Number.isInteger(value) || value === undefined || value < 1) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(value, MAX_BATCH_SIZE);
}

// 기능 : attempt number에 맞는 다음 retry 예정 시각을 계산합니다.
function createNextRetryAt(now: Date, attemptNumber: number): Date | null {
  const delayMinutes = RETRY_DELAYS_MINUTES[attemptNumber - 1];

  if (delayMinutes === undefined) {
    return null;
  }

  return new Date(now.getTime() + delayMinutes * 60_000);
}

function getStringDetail(
  detailJson: Record<string, unknown>,
  key: string
): string | null {
  const value = detailJson[key];

  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
