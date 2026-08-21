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
const ACCOUNT_SETTINGS_MODAL_PATH = "/app";
const ACCOUNT_MODAL_QUERY_KEY = "account";
const ACCOUNT_MODAL_SETTINGS_QUERY_VALUE = "settings";

type EmailConnectionRedirectProvider = "google" | "microsoft" | "email";
type EmailConnectionRedirectStatus = "connected" | "denied" | "failed";

// 역할 : 후속 연락 발송 채널 설정과 동의 확인 API를 제공합니다.
@UseGuards(AuthGuard)
@Controller("api/follow-up-delivery")
export class FollowUpDeliverySettingsController {
  constructor(
    private readonly followUpSettingsApplicationService: FollowUpSettingsApplicationService
  ) {}

  // API : 후속 연락 발송 설정, 내 설정 조회
  @Get("settings")
  getSettings(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 후속 연락 발송 설정 조회를 application 계층에 위임한다.
    return this.followUpSettingsApplicationService.getSettings(currentUser);
  }

  // API : 후속 연락 발송 설정, 이메일 계정 연결 시작
  @Post("email-connections/:provider/connect")
  @HttpCode(HttpStatus.OK)
  startEmailConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("provider") provider: string,
    @Body() body: StartEmailConnectionDto
  ) {
    // 1. 현재 사용자, 제공자, 연결 시작 요청을 application 계층에 전달한다.
    return this.followUpSettingsApplicationService.startEmailConnection(
      currentUser,
      provider,
      body
    );
  }

  // API : 후속 연락 발송 설정, 이메일 계정 연결 해제
  @Post("email-connections/:connectionId/disconnect")
  @HttpCode(HttpStatus.OK)
  disconnectEmailConnection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("connectionId", ParseUUIDPipe) connectionId: string
  ) {
    // 1. 현재 사용자와 연결 식별자를 application 계층에 전달한다.
    return this.followUpSettingsApplicationService.disconnectEmailConnection(
      currentUser,
      connectionId
    );
  }

  // API : 후속 연락 발송 설정, SMS 발신번호 인증 요청
  @Post("sms-sender-numbers")
  @HttpCode(HttpStatus.ACCEPTED)
  requestSmsSenderNumberVerification(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: RequestSmsSenderNumberVerificationDto
  ) {
    // 1. 현재 사용자와 발신번호 인증 요청을 application 계층에 전달한다.
    return this.followUpSettingsApplicationService.requestSmsSenderNumberVerification(
      currentUser,
      body
    );
  }

  // API : 후속 연락 발송 설정, SMS 발신번호 인증 완료
  @Post("sms-sender-numbers/:senderNumberId/verify")
  @HttpCode(HttpStatus.OK)
  verifySmsSenderNumber(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("senderNumberId", ParseUUIDPipe) senderNumberId: string,
    @Body() body: VerifySmsSenderNumberDto
  ) {
    // 1. 현재 사용자, 발신번호 식별자, 인증 코드를 application 계층에 전달한다.
    return this.followUpSettingsApplicationService.verifySmsSenderNumber(
      currentUser,
      senderNumberId,
      body
    );
  }

  // API : 후속 연락 발송 설정, SMS 발신번호 해제
  @Post("sms-sender-numbers/:senderNumberId/revoke")
  @HttpCode(HttpStatus.OK)
  revokeSmsSenderNumber(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("senderNumberId", ParseUUIDPipe) senderNumberId: string
  ) {
    // 1. 현재 사용자와 발신번호 식별자를 application 계층에 전달한다.
    return this.followUpSettingsApplicationService.revokeSmsSenderNumber(
      currentUser,
      senderNumberId
    );
  }

  // API : 후속 연락 발송 설정, 채널 동의 안내 확인
  @Post("consent-notices/:channel/acknowledge")
  @HttpCode(HttpStatus.OK)
  acknowledgeConsentNotice(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("channel") channel: string
  ) {
    // 1. 현재 사용자와 동의 안내 채널을 application 계층에 전달한다.
    return this.followUpSettingsApplicationService.acknowledgeConsentNotice(
      currentUser,
      channel
    );
  }
}

// 역할 : 이메일 연결 제공자 callback을 처리하고 사용자 화면으로 redirect합니다.
@Controller("api/follow-up-delivery")
export class FollowUpEmailConnectionCallbackController {
  constructor(
    private readonly followUpSettingsApplicationService: FollowUpSettingsApplicationService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  // API : 후속 연락 발송 설정, 이메일 연결 callback 처리
  @Get("email-connections/:provider/callback")
  async handleEmailConnectionCallback(
    @Param("provider") provider: string,
    @Query() query: Record<string, unknown>,
    @Res() response: Response
  ) {
    // 1. 제공자 query를 내부 DTO와 redirect용 provider 값으로 정규화한다.
    const callbackQuery = toEmailConnectionCallbackQuery(query);
    const redirectProvider = toEmailConnectionRedirectProvider(provider);

    // 2. 제공자가 오류를 반환한 경우 사용자 설정 화면으로 실패 상태를 전달한다.
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
      // 3. application 계층에 callback 완료 처리를 위임한다.
      await this.followUpSettingsApplicationService.handleEmailConnectionCallback(
        provider,
        callbackQuery
      );

      // 4. 연결 성공 상태를 사용자 설정 화면 redirect URL로 전달한다.
      return response.redirect(
        this.createEmailConnectionRedirectUrl(redirectProvider, "connected")
      );
    } catch (error) {
      // 5. 내부 처리 실패를 안전한 오류 코드만 남기고 사용자 설정 화면으로 전달한다.
      this.logCallbackRedirect("failed", {
        provider: redirectProvider,
        safeErrorCode: getSafeCallbackErrorCode(error),
      });

      return response.redirect(
        this.createEmailConnectionRedirectUrl(redirectProvider, "failed")
      );
    }
  }

  // 기능 : callback 결과를 사용자 설정 화면 redirect URL로 변환합니다.
  private createEmailConnectionRedirectUrl(
    provider: EmailConnectionRedirectProvider,
    status: EmailConnectionRedirectStatus
  ) {
    const origin = (
      this.configService.get<string>("USER_WEB_ORIGIN") ??
      DEFAULT_USER_WEB_ORIGIN
    ).replace(/\/+$/, "");
    const url = new URL(ACCOUNT_SETTINGS_MODAL_PATH, origin);

    url.searchParams.set(
      ACCOUNT_MODAL_QUERY_KEY,
      ACCOUNT_MODAL_SETTINGS_QUERY_VALUE
    );
    url.searchParams.set("followUpEmailConnection", provider);
    url.searchParams.set("status", status);

    return url.toString();
  }

  // 기능 : callback redirect 실패 원인을 안전한 필드만 포함해 경고 로그로 남깁니다.
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

// 기능 : 제공자 callback query를 내부 DTO에 필요한 문자열 필드만 담아 변환합니다.
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

// 기능 : query 값이 문자열일 때만 callback DTO 입력값으로 사용합니다.
function getOptionalStringQueryValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

// 기능 : provider path 값을 사용자 redirect query에 노출할 안전한 제공자 값으로 정규화합니다.
function toEmailConnectionRedirectProvider(
  provider: string
): EmailConnectionRedirectProvider {
  const normalized = provider.trim().toLowerCase();

  if (normalized === "google" || normalized === "microsoft") {
    return normalized;
  }

  return "email";
}

// 기능 : callback 처리 예외에서 사용자에게 노출하지 않을 내부 정보를 제거한 오류 코드를 고릅니다.
function getSafeCallbackErrorCode(error: unknown) {
  if (error instanceof DomainError) {
    return error.code;
  }

  return error instanceof Error && error.name.trim().length > 0
    ? error.name
    : "UnknownError";
}

// 기능 : 제공자가 반환한 오류 값을 로그와 redirect query에 안전한 문자열로 제한합니다.
function sanitizeCallbackError(value: string) {
  const sanitized = value.replace(/[^A-Za-z0-9_.:-]/g, "_").slice(0, 80);

  return sanitized.length > 0 ? sanitized : "provider_error";
}
