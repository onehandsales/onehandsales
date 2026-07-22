export const EMAIL_NOTIFICATION_DELIVERY_PORT = Symbol(
  "EMAIL_NOTIFICATION_DELIVERY_PORT"
);

export const BROWSER_PUSH_NOTIFICATION_DELIVERY_PORT = Symbol(
  "BROWSER_PUSH_NOTIFICATION_DELIVERY_PORT"
);

export interface NotificationDeliveryProviderSuccess {
  readonly ok: true;
  readonly provider: string;
  readonly providerMessageId?: string | null;
  readonly providerStatusCode?: string | null;
}

export interface NotificationDeliveryProviderFailure {
  readonly ok: false;
  readonly provider: string;
  readonly providerStatusCode?: string | null;
  readonly safeErrorCode: string;
  readonly safeErrorMessage: string;
  readonly retryable: boolean;
  readonly subscriptionGone?: boolean;
}

export type NotificationDeliveryProviderResult =
  | NotificationDeliveryProviderSuccess
  | NotificationDeliveryProviderFailure;

export interface SendNotificationEmailInput {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

export interface NotificationEmailDeliveryPort {
  sendEmail(
    input: SendNotificationEmailInput
  ): Promise<NotificationDeliveryProviderResult>;
}

export interface SendNotificationBrowserPushInput {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
  readonly title: string;
  readonly body: string;
  readonly targetPath: string;
}

export interface NotificationBrowserPushDeliveryPort {
  sendBrowserPush(
    input: SendNotificationBrowserPushInput
  ): Promise<NotificationDeliveryProviderResult>;
}
