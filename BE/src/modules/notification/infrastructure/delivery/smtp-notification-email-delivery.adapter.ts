import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type {
  NotificationDeliveryProviderResult,
  NotificationEmailDeliveryPort,
  SendNotificationEmailInput,
} from "@/modules/notification/application/ports/notification-delivery.provider";

const PROVIDER = "smtp";

@Injectable()
export class SmtpNotificationEmailDeliveryAdapter
  implements NotificationEmailDeliveryPort
{
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(
    input: SendNotificationEmailInput
  ): Promise<NotificationDeliveryProviderResult> {
    const config = this.getConfig();

    if (!config.ok) {
      return config.failure;
    }

    try {
      const transporter = nodemailer.createTransport(config.options);
      const result = await transporter.sendMail({
        from: config.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });

      return {
        ok: true,
        provider: PROVIDER,
        providerMessageId:
          typeof result.messageId === "string" ? result.messageId : null,
        providerStatusCode: null,
      };
    } catch (error) {
      return {
        ok: false,
        provider: PROVIDER,
        safeErrorCode: getSafeSmtpErrorCode(error),
        safeErrorMessage: "SMTP provider failed",
        retryable: true,
      };
    }
  }

  private getConfig():
    | {
        readonly ok: true;
        readonly from: string;
        readonly options: SMTPTransport.Options;
      }
    | {
        readonly ok: false;
        readonly failure: NotificationDeliveryProviderResult;
      } {
    const host = this.getTrimmed("SMTP_HOST");
    const port = parsePort(this.getTrimmed("SMTP_PORT"));
    const from = this.getTrimmed("SMTP_FROM");
    const user = this.getTrimmed("SMTP_USER");
    const pass = this.getTrimmed("SMTP_PASS");

    if (!host || !port || !from) {
      return {
        ok: false,
        failure: {
          ok: false,
          provider: PROVIDER,
          safeErrorCode: "SMTP_NOT_CONFIGURED",
          safeErrorMessage: "SMTP provider is not configured",
          retryable: true,
        },
      };
    }

    if ((user && !pass) || (!user && pass)) {
      return {
        ok: false,
        failure: {
          ok: false,
          provider: PROVIDER,
          safeErrorCode: "SMTP_AUTH_INCOMPLETE",
          safeErrorMessage: "SMTP auth is incomplete",
          retryable: true,
        },
      };
    }

    return {
      ok: true,
      from,
      options: {
        host,
        port,
        secure: parseBoolean(this.getTrimmed("SMTP_SECURE"), port === 465),
        ...(user && pass ? { auth: { user, pass } } : {}),
      },
    };
  }

  private getTrimmed(key: string): string | undefined {
    const value = this.configService.get<string>(key)?.trim();

    return value && value.length > 0 ? value : undefined;
  }
}

function parsePort(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const port = Number(value);

  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : null;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  return value === "true" || value === "1";
}

function getSafeSmtpErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    switch (error.code) {
      case "EAUTH":
        return "SMTP_AUTH_FAILED";
      case "ECONNECTION":
      case "ETIMEDOUT":
        return "SMTP_CONNECTION_FAILED";
      default:
        return "SMTP_SEND_FAILED";
    }
  }

  return "SMTP_SEND_FAILED";
}
