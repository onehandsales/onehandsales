import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import webPush from "web-push";
import type {
  NotificationBrowserPushDeliveryPort,
  NotificationDeliveryProviderResult,
  SendNotificationBrowserPushInput,
} from "@/modules/notification/application/ports/notification-delivery.provider";

const PROVIDER = "web-push";

type WebPushError = Error & {
  readonly statusCode?: number;
};

@Injectable()
// 역할 : web-push library와 VAPID 설정으로 browser push 알림을 발송합니다.
export class VapidBrowserPushDeliveryAdapter
  implements NotificationBrowserPushDeliveryPort
{
  constructor(private readonly configService: ConfigService) {}

  async sendBrowserPush(
    input: SendNotificationBrowserPushInput
  ): Promise<NotificationDeliveryProviderResult> {
    // 기능 : VAPID 설정이 없으면 provider 호출 없이 안전한 실패를 반환합니다.
    const config = this.getConfig();

    if (!config.ok) {
      return config.failure;
    }

    try {
      webPush.setVapidDetails(
        config.subject,
        config.publicKey,
        config.privateKey
      );

      const response = await webPush.sendNotification(
        {
          endpoint: input.endpoint,
          keys: {
            p256dh: input.p256dh,
            auth: input.auth,
          },
        },
        JSON.stringify({
          title: input.title,
          body: input.body,
          targetPath: input.targetPath,
        }),
        {
          TTL: 3600,
        }
      );

      return {
        ok: true,
        provider: PROVIDER,
        providerMessageId: null,
        providerStatusCode:
          typeof response.statusCode === "number"
            ? response.statusCode.toString()
            : null,
      };
    } catch (error) {
      return createFailureResult(error);
    }
  }

  private getConfig():
    | {
        readonly ok: true;
        readonly publicKey: string;
        readonly privateKey: string;
        readonly subject: string;
      }
    | {
        readonly ok: false;
        readonly failure: NotificationDeliveryProviderResult;
      } {
    // 기능 : 환경 변수에서 Web Push VAPID public/private key와 subject를 읽습니다.
    const publicKey = this.getTrimmed("WEB_PUSH_VAPID_PUBLIC_KEY");
    const privateKey = this.getTrimmed("WEB_PUSH_VAPID_PRIVATE_KEY");
    const subject = this.getTrimmed("WEB_PUSH_VAPID_SUBJECT");

    if (!publicKey || !privateKey || !subject) {
      return {
        ok: false,
        failure: {
          ok: false,
          provider: PROVIDER,
          safeErrorCode: "WEB_PUSH_NOT_CONFIGURED",
          safeErrorMessage: "Web Push provider is not configured",
          retryable: true,
        },
      };
    }

    return {
      ok: true,
      publicKey,
      privateKey,
      subject,
    };
  }

  private getTrimmed(key: string): string | undefined {
    // 기능 : 빈 문자열 환경 변수는 설정되지 않은 값으로 취급합니다.
    const value = this.configService.get<string>(key)?.trim();

    return value && value.length > 0 ? value : undefined;
  }
}

// 기능 : web-push 오류를 retry 정책과 안전한 error code로 변환합니다.
function createFailureResult(
  error: unknown
): NotificationDeliveryProviderResult {
  const statusCode = getStatusCode(error);

  if (statusCode === 404 || statusCode === 410) {
    return {
      ok: false,
      provider: PROVIDER,
      providerStatusCode: statusCode.toString(),
      safeErrorCode: "PUSH_SUBSCRIPTION_GONE",
      safeErrorMessage: "Push subscription is gone",
      retryable: false,
      subscriptionGone: true,
    };
  }

  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return {
      ok: false,
      provider: PROVIDER,
      providerStatusCode: statusCode.toString(),
      safeErrorCode: "PUSH_REQUEST_REJECTED",
      safeErrorMessage: "Web Push request was rejected",
      retryable: false,
    };
  }

  return {
    ok: false,
    provider: PROVIDER,
    providerStatusCode: statusCode ? statusCode.toString() : null,
    safeErrorCode: "PUSH_SEND_FAILED",
    safeErrorMessage: "Web Push provider failed",
    retryable: true,
  };
}

// 기능 : web-push library 오류 객체에서 HTTP status code만 안전하게 추출합니다.
function getStatusCode(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as WebPushError).statusCode === "number"
  ) {
    return (error as WebPushError).statusCode ?? null;
  }

  return null;
}
