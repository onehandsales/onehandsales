import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { FollowUpSettingsApplicationService } from "@/modules/follow-up/application/services/follow-up-settings-application.service";
import { DomainError } from "@/shared/domain/errors/domain-error";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  EmailConnectionCallbackQueryDto,
  RequestSmsSenderNumberVerificationDto,
  StartEmailConnectionDto,
  VerifySmsSenderNumberDto,
} from "./dto/follow-up-delivery-settings-request.dto";

const DEFAULT_USER_WEB_ORIGIN = "http://localhost:5173";

type EmailConnectionRedirectProvider = "google" | "microsoft" | "email";
type EmailConnectionRedirectStatus = "connected" | "denied" | "failed";

@UseGuards(AuthGuard)
@Controller("api/follow-up-delivery")
export class FollowUpDeliverySettingsController {
  constructor(
    private readonly followUpSettingsApplicationService: FollowUpSettingsApplicationService
  ) {}

  @Get("settings")
  getSettings(@CurrentUser() currentUser: CurrentUserContext) {
    return this.followUpSettingsApplicationService.getSettings(currentUser);
  }

  @Post("email-connections/:provider/connect")
  @HttpCode(HttpStatus.OK)
  startEmailConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("provider") provider: string,
    @Body() body: StartEmailConnectionDto
  ) {
    return this.followUpSettingsApplicationService.startEmailConnection(
      currentUser,
      provider,
      body
    );
  }

  @Post("email-connections/:connectionId/disconnect")
  @HttpCode(HttpStatus.OK)
  disconnectEmailConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("connectionId", ParseUUIDPipe) connectionId: string
  ) {
    return this.followUpSettingsApplicationService.disconnectEmailConnection(
      currentUser,
      connectionId
    );
  }

  @Post("sms-sender-numbers")
  @HttpCode(HttpStatus.ACCEPTED)
  requestSmsSenderNumberVerification(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: RequestSmsSenderNumberVerificationDto
  ) {
    return this.followUpSettingsApplicationService.requestSmsSenderNumberVerification(
      currentUser,
      body
    );
  }

  @Post("sms-sender-numbers/:senderNumberId/verify")
  @HttpCode(HttpStatus.OK)
  verifySmsSenderNumber(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("senderNumberId", ParseUUIDPipe) senderNumberId: string,
    @Body() body: VerifySmsSenderNumberDto
  ) {
    return this.followUpSettingsApplicationService.verifySmsSenderNumber(
      currentUser,
      senderNumberId,
      body
    );
  }

  @Post("sms-sender-numbers/:senderNumberId/revoke")
  @HttpCode(HttpStatus.OK)
  revokeSmsSenderNumber(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("senderNumberId", ParseUUIDPipe) senderNumberId: string
  ) {
    return this.followUpSettingsApplicationService.revokeSmsSenderNumber(
      currentUser,
      senderNumberId
    );
  }

  @Post("consent-notices/:channel/acknowledge")
  @HttpCode(HttpStatus.OK)
  acknowledgeConsentNotice(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("channel") channel: string
  ) {
    return this.followUpSettingsApplicationService.acknowledgeConsentNotice(
      currentUser,
      channel
    );
  }
}

@Controller("api/follow-up-delivery")
export class FollowUpEmailConnectionCallbackController {
  constructor(
    private readonly followUpSettingsApplicationService: FollowUpSettingsApplicationService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  @Get("email-connections/:provider/callback")
  async handleEmailConnectionCallback(
    @Param("provider") provider: string,
    @Query() query: Record<string, unknown>,
    @Res() response: Response
  ) {
    const callbackQuery = toEmailConnectionCallbackQuery(query);
    const redirectProvider = toEmailConnectionRedirectProvider(provider);

    if (callbackQuery.error) {
      this.logCallbackRedirect("providerError", {
        provider: redirectProvider,
        providerError: sanitizeCallbackError(callbackQuery.error),
      });

      return response.redirect(
        this.createEmailConnectionRedirectUrl(
          redirectProvider,
          callbackQuery.error === "access_denied" ? "denied" : "failed"
        )
      );
    }

    try {
      await this.followUpSettingsApplicationService.handleEmailConnectionCallback(
        provider,
        callbackQuery
      );

      return response.redirect(
        this.createEmailConnectionRedirectUrl(redirectProvider, "connected")
      );
    } catch (error) {
      this.logCallbackRedirect("failed", {
        provider: redirectProvider,
        safeErrorCode: getSafeCallbackErrorCode(error),
      });

      return response.redirect(
        this.createEmailConnectionRedirectUrl(redirectProvider, "failed")
      );
    }
  }

  private createEmailConnectionRedirectUrl(
    provider: EmailConnectionRedirectProvider,
    status: EmailConnectionRedirectStatus
  ) {
    const origin = (
      this.configService.get<string>("USER_WEB_ORIGIN") ??
      DEFAULT_USER_WEB_ORIGIN
    ).replace(/\/+$/, "");
    const url = new URL("/app/settings", origin);

    url.searchParams.set("followUpEmailConnection", provider);
    url.searchParams.set("status", status);

    return url.toString();
  }

  private logCallbackRedirect(
    result: "providerError" | "failed",
    fields: Record<string, unknown>
  ) {
    this.logger.warn(
      JSON.stringify({
        event: "followUp.emailConnection.callbackRedirect",
        result,
        ...fields,
      }),
      "FollowUpEmailConnectionCallbackController"
    );
  }
}

function toEmailConnectionCallbackQuery(
  query: Record<string, unknown>
): EmailConnectionCallbackQueryDto {
  const callbackQuery = new EmailConnectionCallbackQueryDto();
  const code = getOptionalStringQueryValue(query.code);
  const state = getOptionalStringQueryValue(query.state);
  const error = getOptionalStringQueryValue(query.error);

  if (code) {
    callbackQuery.code = code;
  }

  if (state) {
    callbackQuery.state = state;
  }

  if (error) {
    callbackQuery.error = error;
  }

  return callbackQuery;
}

function getOptionalStringQueryValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function toEmailConnectionRedirectProvider(
  provider: string
): EmailConnectionRedirectProvider {
  const normalized = provider.trim().toLowerCase();

  if (normalized === "google" || normalized === "microsoft") {
    return normalized;
  }

  return "email";
}

function getSafeCallbackErrorCode(error: unknown) {
  if (error instanceof DomainError) {
    return error.code;
  }

  return error instanceof Error && error.name.trim().length > 0
    ? error.name
    : "UnknownError";
}

function sanitizeCallbackError(value: string) {
  const sanitized = value.replace(/[^A-Za-z0-9_.:-]/g, "_").slice(0, 80);

  return sanitized.length > 0 ? sanitized : "provider_error";
}
