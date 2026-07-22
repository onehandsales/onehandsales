import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT,
  type BrowserPushSubscriptionEncryptionPort,
} from "@/modules/notification/application/ports/browser-push-subscription-encryption.port";
import {
  NOTIFICATION_REPOSITORY,
  type BrowserPushSubscriptionRecord,
  type NotificationReadFilter,
  type NotificationRecord,
  type NotificationRepository,
  type NotificationSettingsRecord,
  type NotificationSourceType,
  type NotificationStatus,
  type NotificationType,
  type UpsertNotificationSettingsInput,
} from "@/modules/notification/application/ports/notification.repository";
import {
  BrowserPushNotConfiguredError,
  NotificationNotFoundError,
  PushSubscriptionConflictError,
  PushSubscriptionNotFoundError,
} from "@/modules/notification/domain/notification.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 50;
const DEFAULT_SCHEDULE_REMINDER_ENABLED = true;
const DEFAULT_DEAL_DUE_REMINDER_ENABLED = true;
const DEFAULT_EMAIL_NOTIFICATION_ENABLED = true;
const DEFAULT_BROWSER_PUSH_ENABLED = false;
const DEFAULT_SCHEDULE_REMINDER_MINUTES = 30;
const DEFAULT_DEAL_DUE_REMINDER_DAYS_BEFORE = 1;
const DEFAULT_DEAL_DUE_REMINDER_LOCAL_TIME = "09:00";
const MAX_ENDPOINT_LENGTH = 4096;
const MAX_SUBSCRIPTION_KEY_LENGTH = 2048;
const MAX_USER_AGENT_LENGTH = 1024;
const MAX_DEVICE_LABEL_LENGTH = 100;

export interface ListNotificationsQueryInput {
  readonly page?: number;
  readonly pageSize?: number;
  readonly read?: NotificationReadFilter;
  readonly includeUpcoming?: boolean;
}

export interface UpdateNotificationSettingsCommand {
  readonly scheduleReminderEnabled?: unknown;
  readonly dealDueReminderEnabled?: unknown;
  readonly emailNotificationEnabled?: unknown;
  readonly browserPushEnabled?: unknown;
}

export interface CreateBrowserPushSubscriptionCommand {
  readonly endpoint?: unknown;
  readonly keys?: {
    readonly p256dh?: unknown;
    readonly auth?: unknown;
  };
  readonly userAgent?: unknown;
  readonly deviceLabel?: unknown;
}

export interface NotificationResponse {
  readonly id: string;
  readonly type: NotificationType;
  readonly status: NotificationStatus;
  readonly sourceType: NotificationSourceType;
  readonly sourceId: string;
  readonly targetPath: string;
  readonly title: string;
  readonly body: string | null;
  readonly targetLabel: string | null;
  readonly scheduledAt: string;
  readonly sentAt: string | null;
  readonly readAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface NotificationListResponse {
  readonly items: NotificationResponse[];
  readonly unreadCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

export interface NotificationUnreadCountResponse {
  readonly unreadCount: number;
}

export interface NotificationSettingsResponse {
  readonly scheduleReminderEnabled: boolean;
  readonly dealDueReminderEnabled: boolean;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
  readonly scheduleReminderMinutes: number;
  readonly dealDueReminderDaysBefore: number;
  readonly dealDueReminderLocalTime: string;
}

export interface BrowserPushPublicKeyResponse {
  readonly publicKey: string;
}

export interface BrowserPushSubscriptionResponse {
  readonly id: string;
  readonly status: "ACTIVE" | "REVOKED";
  readonly deviceLabel: string | null;
  readonly createdAt: string;
  readonly revokedAt: string | null;
}

type NormalizedBrowserPushSubscriptionInput = {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
  readonly userAgent: string | null;
  readonly deviceLabel: string | null;
};

@Injectable()
export class NotificationApplicationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(BROWSER_PUSH_SUBSCRIPTION_ENCRYPTION_PORT)
    private readonly browserPushSubscriptionEncryption: BrowserPushSubscriptionEncryptionPort,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  async listNotifications(
    currentUser: CurrentUserContext,
    query: ListNotificationsQueryInput
  ): Promise<NotificationListResponse> {
    const page = this.normalizePage(query.page);
    const pageSize = this.normalizePageSize(query.pageSize);
    const read = this.normalizeReadFilter(query.read);
    const includeUpcoming = query.includeUpcoming ?? false;
    const now = new Date();
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepository.listNotificationsForUser({
        userId: currentUser.id,
        page,
        pageSize,
        now,
        read,
        includeUpcoming,
      }),
      this.notificationRepository.countUnreadNotificationsForUser({
        userId: currentUser.id,
        now,
      }),
    ]);

    this.logEvent("notification.listed", {
      userId: currentUser.id,
      page,
      pageSize,
      read,
      includeUpcoming,
      count: notifications.items.length,
      unreadCount,
    });

    return {
      items: notifications.items.map((item) => this.toNotificationResponse(item)),
      unreadCount,
      page,
      pageSize,
      totalCount: notifications.totalCount,
    };
  }

  async getUnreadCount(
    currentUser: CurrentUserContext
  ): Promise<NotificationUnreadCountResponse> {
    const unreadCount =
      await this.notificationRepository.countUnreadNotificationsForUser({
        userId: currentUser.id,
        now: new Date(),
      });

    this.logEvent("notification.unreadCountViewed", {
      userId: currentUser.id,
      unreadCount,
    });

    return { unreadCount };
  }

  async markNotificationRead(
    currentUser: CurrentUserContext,
    notificationId: string
  ): Promise<NotificationResponse> {
    const notification =
      await this.notificationRepository.markNotificationReadForUser({
        userId: currentUser.id,
        notificationId,
        readAt: new Date(),
      });

    if (!notification) {
      throw new NotificationNotFoundError();
    }

    this.logEvent("notification.read", {
      userId: currentUser.id,
      notificationId,
    });

    return this.toNotificationResponse(notification);
  }

  async getSettings(
    currentUser: CurrentUserContext
  ): Promise<NotificationSettingsResponse> {
    const settings = await this.notificationRepository.findSettingsForUser(
      currentUser.id
    );

    this.logEvent("notification.settingsViewed", {
      userId: currentUser.id,
      hasSettingsRow: settings !== null,
    });

    return settings
      ? this.toSettingsResponse(settings)
      : this.createDefaultSettingsResponse();
  }

  async updateSettings(
    currentUser: CurrentUserContext,
    input: UpdateNotificationSettingsCommand
  ): Promise<NotificationSettingsResponse> {
    const normalized = this.normalizeSettingsUpdate(currentUser.id, input);
    const settings = await this.notificationRepository.runInTransaction(
      async (repository) => repository.upsertSettings(normalized)
    );

    this.logEvent("notification.settingsUpdated", {
      userId: currentUser.id,
      updatedFields: Object.keys(normalized).filter((key) => key !== "userId"),
    });

    return this.toSettingsResponse(settings);
  }

  getBrowserPushPublicKey(
    currentUser: CurrentUserContext
  ): BrowserPushPublicKeyResponse {
    const publicKey = this.configService
      .get<string>("WEB_PUSH_VAPID_PUBLIC_KEY")
      ?.trim();

    if (!publicKey) {
      throw new BrowserPushNotConfiguredError();
    }

    this.logEvent("notification.browserPush.publicKeyViewed", {
      userId: currentUser.id,
    });

    return { publicKey };
  }

  async createBrowserPushSubscription(
    currentUser: CurrentUserContext,
    input: CreateBrowserPushSubscriptionCommand
  ): Promise<BrowserPushSubscriptionResponse> {
    const normalized = this.normalizeBrowserPushSubscriptionInput(input);
    const encrypted = this.browserPushSubscriptionEncryption.encrypt({
      endpoint: normalized.endpoint,
      p256dh: normalized.p256dh,
      auth: normalized.auth,
    });
    const now = new Date();

    const subscription = await this.notificationRepository.runInTransaction(
      async (repository) => {
        const existing =
          await repository.findBrowserPushSubscriptionByEndpointHash(
            encrypted.endpointHash
          );

        if (existing && existing.userId !== currentUser.id) {
          throw new PushSubscriptionConflictError();
        }

        const upserted = await repository.upsertBrowserPushSubscription({
          userId: currentUser.id,
          endpointHash: encrypted.endpointHash,
          endpointCiphertext: encrypted.endpointCiphertext,
          p256dhCiphertext: encrypted.p256dhCiphertext,
          authCiphertext: encrypted.authCiphertext,
          contentKeyVersion: encrypted.contentKeyVersion,
          userAgent: normalized.userAgent,
          deviceLabel: normalized.deviceLabel,
          now,
        });

        if (upserted.userId !== currentUser.id) {
          throw new PushSubscriptionConflictError();
        }

        await repository.upsertSettings({
          userId: currentUser.id,
          browserPushEnabled: true,
        });

        return upserted;
      }
    );

    this.logEvent("notification.browserPush.subscriptionCreated", {
      userId: currentUser.id,
      subscriptionId: subscription.id,
    });

    return this.toBrowserPushSubscriptionResponse(subscription);
  }

  async revokeBrowserPushSubscription(
    currentUser: CurrentUserContext,
    subscriptionId: string
  ): Promise<BrowserPushSubscriptionResponse> {
    const subscription = await this.notificationRepository.runInTransaction(
      async (repository) => {
        const existing = await repository.findBrowserPushSubscriptionForUser({
          userId: currentUser.id,
          browserSubscriptionId: subscriptionId,
        });

        if (!existing) {
          throw new PushSubscriptionNotFoundError();
        }

        const revoked =
          existing.status === "REVOKED"
            ? existing
            : await repository.revokeBrowserPushSubscriptionForUser({
                userId: currentUser.id,
                browserSubscriptionId: subscriptionId,
                revokedAt: new Date(),
              });

        if (!revoked) {
          throw new PushSubscriptionNotFoundError();
        }

        const activeSubscriptions =
          await repository.listActiveBrowserPushSubscriptionsForUser(
            currentUser.id
          );

        if (activeSubscriptions.length === 0) {
          await repository.upsertSettings({
            userId: currentUser.id,
            browserPushEnabled: false,
          });
        }

        return revoked;
      }
    );

    this.logEvent("notification.browserPush.subscriptionRevoked", {
      userId: currentUser.id,
      subscriptionId,
    });

    return this.toBrowserPushSubscriptionResponse(subscription);
  }

  private normalizeSettingsUpdate(
    userId: string,
    input: UpdateNotificationSettingsCommand
  ): UpsertNotificationSettingsInput {
    const scheduleReminderEnabled = this.normalizeOptionalBoolean(
      input.scheduleReminderEnabled,
      "scheduleReminderEnabled"
    );
    const dealDueReminderEnabled = this.normalizeOptionalBoolean(
      input.dealDueReminderEnabled,
      "dealDueReminderEnabled"
    );
    const emailNotificationEnabled = this.normalizeOptionalBoolean(
      input.emailNotificationEnabled,
      "emailNotificationEnabled"
    );
    const browserPushEnabled = this.normalizeOptionalBoolean(
      input.browserPushEnabled,
      "browserPushEnabled"
    );

    if (
      scheduleReminderEnabled === undefined &&
      dealDueReminderEnabled === undefined &&
      emailNotificationEnabled === undefined &&
      browserPushEnabled === undefined
    ) {
      throw new ValidationDomainError(
        "At least one notification setting field is required"
      );
    }

    return {
      userId,
      ...(scheduleReminderEnabled === undefined
        ? {}
        : { scheduleReminderEnabled }),
      ...(dealDueReminderEnabled === undefined
        ? {}
        : { dealDueReminderEnabled }),
      ...(emailNotificationEnabled === undefined
        ? {}
        : { emailNotificationEnabled }),
      ...(browserPushEnabled === undefined ? {} : { browserPushEnabled }),
    };
  }

  private normalizeBrowserPushSubscriptionInput(
    input: CreateBrowserPushSubscriptionCommand
  ): NormalizedBrowserPushSubscriptionInput {
    return {
      endpoint: this.normalizeRequiredText(
        input.endpoint,
        MAX_ENDPOINT_LENGTH,
        "endpoint"
      ),
      p256dh: this.normalizeRequiredText(
        input.keys?.p256dh,
        MAX_SUBSCRIPTION_KEY_LENGTH,
        "keys.p256dh"
      ),
      auth: this.normalizeRequiredText(
        input.keys?.auth,
        MAX_SUBSCRIPTION_KEY_LENGTH,
        "keys.auth"
      ),
      userAgent: this.normalizeOptionalText(
        input.userAgent,
        MAX_USER_AGENT_LENGTH,
        "userAgent"
      ),
      deviceLabel: this.normalizeOptionalText(
        input.deviceLabel,
        MAX_DEVICE_LABEL_LENGTH,
        "deviceLabel"
      ),
    };
  }

  private normalizeOptionalBoolean(
    value: unknown,
    fieldName: string
  ): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value !== "boolean") {
      throw new ValidationDomainError(`${fieldName} must be a boolean`);
    }

    return value;
  }

  private normalizePage(value: number | undefined): number {
    const page = value ?? DEFAULT_PAGE;

    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationDomainError("page must be a positive integer");
    }

    return page;
  }

  private normalizePageSize(value: number | undefined): number {
    const pageSize = value ?? DEFAULT_PAGE_SIZE;

    if (
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > MAX_PAGE_SIZE
    ) {
      throw new ValidationDomainError("pageSize must be between 1 and 50");
    }

    return pageSize;
  }

  private normalizeReadFilter(
    value: NotificationReadFilter | undefined
  ): NotificationReadFilter {
    const read = value ?? "ALL";

    if (read !== "ALL" && read !== "READ" && read !== "UNREAD") {
      throw new ValidationDomainError("read must be ALL, READ, or UNREAD");
    }

    return read;
  }

  private normalizeRequiredText(
    value: unknown,
    maxLength: number,
    fieldName: string
  ): string {
    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(`${fieldName} is required`);
    }

    if (normalized.length > maxLength) {
      throw new ValidationDomainError(`${fieldName} is too long`);
    }

    return normalized;
  }

  private normalizeOptionalText(
    value: unknown,
    maxLength: number,
    fieldName: string
  ): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return null;
    }

    if (normalized.length > maxLength) {
      throw new ValidationDomainError(`${fieldName} is too long`);
    }

    return normalized;
  }

  private createDefaultSettingsResponse(): NotificationSettingsResponse {
    return {
      scheduleReminderEnabled: DEFAULT_SCHEDULE_REMINDER_ENABLED,
      dealDueReminderEnabled: DEFAULT_DEAL_DUE_REMINDER_ENABLED,
      emailNotificationEnabled: DEFAULT_EMAIL_NOTIFICATION_ENABLED,
      browserPushEnabled: DEFAULT_BROWSER_PUSH_ENABLED,
      scheduleReminderMinutes: DEFAULT_SCHEDULE_REMINDER_MINUTES,
      dealDueReminderDaysBefore: DEFAULT_DEAL_DUE_REMINDER_DAYS_BEFORE,
      dealDueReminderLocalTime: DEFAULT_DEAL_DUE_REMINDER_LOCAL_TIME,
    };
  }

  private toSettingsResponse(
    settings: NotificationSettingsRecord
  ): NotificationSettingsResponse {
    return {
      scheduleReminderEnabled: settings.scheduleReminderEnabled,
      dealDueReminderEnabled: settings.dealDueReminderEnabled,
      emailNotificationEnabled: settings.emailNotificationEnabled,
      browserPushEnabled: settings.browserPushEnabled,
      scheduleReminderMinutes: settings.scheduleReminderMinutes,
      dealDueReminderDaysBefore: settings.dealDueReminderDaysBefore,
      dealDueReminderLocalTime: settings.dealDueReminderLocalTime,
    };
  }

  private toNotificationResponse(
    notification: NotificationRecord
  ): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      status: notification.status,
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      targetPath: notification.targetPath,
      title: notification.title,
      body: notification.body,
      targetLabel: notification.targetLabel,
      scheduledAt: notification.scheduledAt.toISOString(),
      sentAt: notification.sentAt?.toISOString() ?? null,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    };
  }

  private toBrowserPushSubscriptionResponse(
    subscription: BrowserPushSubscriptionRecord
  ): BrowserPushSubscriptionResponse {
    return {
      id: subscription.id,
      status: subscription.status,
      deviceLabel: subscription.deviceLabel,
      createdAt: subscription.createdAt.toISOString(),
      revokedAt: subscription.revokedAt?.toISOString() ?? null,
    };
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "NotificationApplicationService"
    );
  }
}
