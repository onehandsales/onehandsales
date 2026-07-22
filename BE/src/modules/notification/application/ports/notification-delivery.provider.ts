// 역할 : email 발송 adapter 주입 token을 정의합니다.
export const EMAIL_NOTIFICATION_DELIVERY_PORT = Symbol(
  "EMAIL_NOTIFICATION_DELIVERY_PORT"
);

// 역할 : browser push 발송 adapter 주입 token을 정의합니다.
export const BROWSER_PUSH_NOTIFICATION_DELIVERY_PORT = Symbol(
  "BROWSER_PUSH_NOTIFICATION_DELIVERY_PORT"
);

// 역할 : 외부 발송 provider 성공 결과에서 저장 가능한 metadata만 정의합니다.
export interface NotificationDeliveryProviderSuccess {
  readonly ok: true;
  readonly provider: string;
  readonly providerMessageId?: string | null;
  readonly providerStatusCode?: string | null;
}

// 역할 : 외부 발송 provider 실패 결과에서 안전한 오류 정보만 정의합니다.
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

// 역할 : email 알림 발송 요청 payload를 정의합니다.
export interface SendNotificationEmailInput {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

// 역할 : SMTP 등 email 발송 구현체가 지켜야 하는 port 계약입니다.
export interface NotificationEmailDeliveryPort {
  // 기능 : email 알림을 외부 provider로 발송하고 안전한 결과만 반환합니다.
  sendEmail(
    input: SendNotificationEmailInput
  ): Promise<NotificationDeliveryProviderResult>;
}

// 역할 : browser push 알림 발송 요청 payload를 정의합니다.
export interface SendNotificationBrowserPushInput {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
  readonly title: string;
  readonly body: string;
  readonly targetPath: string;
}

// 역할 : Web Push 발송 구현체가 지켜야 하는 port 계약입니다.
export interface NotificationBrowserPushDeliveryPort {
  // 기능 : 복호화된 push subscription 정보로 browser push를 발송합니다.
  sendBrowserPush(
    input: SendNotificationBrowserPushInput
  ): Promise<NotificationDeliveryProviderResult>;
}
