import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : HttpExceptionFilter 예외를 표준 HTTP 오류 응답으로 변환합니다.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // 기능 : 도메인 예외와 HTTP 예외를 API 오류 응답 형식으로 변환합니다.
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DeletedResourceError) {
      const status =
        exception.operation === "read" ? HttpStatus.GONE : HttpStatus.CONFLICT;
      response.status(status).json({
        statusCode: status,
        error: exception.code,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof DomainError) {
      const status = this.getDomainErrorStatus(exception.code);
      response.status(status).json(this.createDomainErrorBody(status, exception));
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json({
        statusCode: status,
        error: body,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "InternalServerError",
    });
  }

  // 기능 : 도메인 오류 응답 body에 사용자에게 허용된 안전한 detail만 포함합니다.
  private createDomainErrorBody(status: HttpStatus, exception: DomainError) {
    const safeDetails = this.pickSafeDetails(exception.details);

    return {
      statusCode: status,
      error: exception.code,
      ...(typeof safeDetails["field"] === "string" ? { code: exception.code } : {}),
      message: exception.message,
      ...safeDetails,
    };
  }

  // 기능 : retryable, field, provider처럼 사용자 처리에 필요한 안전한 detail만 선별합니다.
  private pickSafeDetails(details: Record<string, unknown> | null) {
    const safeDetails: Record<string, unknown> = {};

    if (typeof details?.["retryable"] === "boolean") {
      safeDetails["retryable"] = details["retryable"];
    }

    if (typeof details?.["field"] === "string") {
      safeDetails["field"] = details["field"];
    }

    if (typeof details?.["provider"] === "string") {
      safeDetails["provider"] = details["provider"];
    }

    return safeDetails;
  }

  // 기능 : 도메인 오류 코드에 맞는 HTTP 상태 코드를 결정합니다.
  private getDomainErrorStatus(code: string): HttpStatus {
    if (code.endsWith("NotFound")) {
      return HttpStatus.NOT_FOUND;
    }

    switch (code) {
      case "Unauthorized":
        return HttpStatus.UNAUTHORIZED;
      case "Forbidden":
      case "ADMIN_FORBIDDEN":
        return HttpStatus.FORBIDDEN;
      case "AUTH_PROVIDER_EMAIL_REQUIRED":
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case "OAuthAccountConflict":
      case "DeviceSlotAlreadyRegistered":
      case "PushSubscriptionConflict":
      case "DuplicateCompanyField":
      case "DuplicateCompanyRegion":
      case "CompanyFieldInUse":
      case "CompanyRegionInUse":
      case "DuplicateContactDepartment":
      case "DuplicateContactJobGrade":
      case "ContactDepartmentInUse":
      case "ContactJobGradeInUse":
      case "DuplicateProductCategory":
      case "DuplicateProductStatus":
      case "ProductCategoryInUse":
      case "ProductStatusInUse":
      case "BusinessCardScanNotConfirmable":
      case "AiWeeklySalesReportAlreadyGenerating":
      case "DealActivityNotEditable":
        return HttpStatus.CONFLICT;
      case "InactiveUser":
      case "OwnershipViolation":
        return HttpStatus.FORBIDDEN;
      case "InvalidDeviceSlot":
      case "InvalidDeviceId":
      case "InvalidRefreshOrigin":
      case "ValidationError":
      case "AUDIO_REQUIRED":
      case "AUDIO_TYPE_UNSUPPORTED":
      case "IMAGE_REQUIRED":
      case "IMAGE_TYPE_UNSUPPORTED":
      case "IMAGE_TOO_LARGE":
      case "CURRENCY_UNSUPPORTED":
      case "AMOUNT_INTEGER_REQUIRED":
      case "USER_LOCALE_UNSUPPORTED":
      case "USER_TIMEZONE_INVALID":
      case "USER_COUNTRY_UNSUPPORTED":
      case "USER_DEFAULT_CURRENCY_UNSUPPORTED":
      case "CONTACT_PHONE_COUNTRY_UNSUPPORTED":
      case "CONTACT_PHONE_INVALID":
      case "COMPANY_REGION_UNSUPPORTED":
      case "InvalidImportMapping":
      case "UnsupportedImportFileType":
      case "ImportFileParseFailed":
      case "GoogleCalendarOAuthStateInvalid":
      case "FollowUpEmailOAuthStateInvalid":
      case "FollowUpDraftSourceInvalid":
      case "FollowUpInvalidRecipient":
      case "FollowUpSmsBodyTooLong":
      case "SmsSenderVerificationCodeInvalid":
      case "GoogleCalendarSourceSelectionRequired":
      case "ScheduleMeetingUrlInvalid":
      case "ANALYTICS_EVENT_UNSUPPORTED":
      case "ANALYTICS_EVENT_VERSION_UNSUPPORTED":
      case "ANALYTICS_PAYLOAD_INVALID":
      case "ANALYTICS_PAYLOAD_PII_REJECTED":
      case "ANALYTICS_ROUTE_KEY_UNSUPPORTED":
      case "ADMIN_DOMAIN_UNSUPPORTED":
      case "ADMIN_REASON_REQUIRED":
      case "ADMIN_SENSITIVE_FIELDSET_UNSUPPORTED":
      case "TRASH_TARGET_TYPE_UNSUPPORTED":
        return HttpStatus.BAD_REQUEST;
      case "AUDIO_TOO_LARGE":
        return HttpStatus.PAYLOAD_TOO_LARGE;
      case "ImportJobExpired":
      case "SmsSenderVerificationExpired":
        return HttpStatus.GONE;
      case "ImportJobAlreadyClosed":
      case "ImportJobAlreadyConfirmed":
      case "ImportJobNotReady":
      case "ImportMappingRequired":
      case "GoogleCalendarReconnectRequired":
      case "GoogleCalendarSyncInProgress":
      case "FollowUpConsentNoticeRequired":
      case "FollowUpEmailReconnectRequired":
      case "FollowUpSmsSenderNotVerified":
      case "FollowUpMessageAlreadySent":
      case "FollowUpMessageNotSendable":
      case "FollowUpMessageNotRetryable":
        return HttpStatus.CONFLICT;
      case "ImportMappingFailed":
      case "ImportConfirmValidationFailed":
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case "ImportFileStorageFailed":
      case "BrowserPushNotConfigured":
      case "MeetingNoteAiDraftProviderUnavailable":
      case "AiWeeklySalesReportProviderUnavailable":
      case "FollowUpProviderUnavailable":
      case "FollowUpDeliverySecretEncryptionKeyMissing":
        return HttpStatus.SERVICE_UNAVAILABLE;
      case "GoogleCalendarProviderUnavailable":
      case "AUTH_PROVIDER_EXCHANGE_FAILED":
      case "STT_PROVIDER_UNAVAILABLE":
      case "AI_DRAFT_FAILED":
      case "AiWeeklySalesReportProviderFailed":
      case "FollowUpProviderRequestFailed":
        return HttpStatus.BAD_GATEWAY;
      case "MeetingNoteAiDraftFailed":
        return HttpStatus.BAD_GATEWAY;
      case "ADMIN_TARGET_NOT_FOUND":
      case "ADMIN_USER_NOT_FOUND":
      case "TRASH_RECORD_NOT_FOUND":
        return HttpStatus.NOT_FOUND;
      case "TRASH_RECOVERY_REQUEST_NOT_ALLOWED_BEFORE_EXPIRY":
        return HttpStatus.CONFLICT;
      case "STT_TRANSCRIPTION_FAILED":
        return HttpStatus.UNPROCESSABLE_ENTITY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
