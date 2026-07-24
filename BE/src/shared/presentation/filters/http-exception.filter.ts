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
      response.status(status).json({
        statusCode: status,
        error: exception.code,
        message: exception.message,
      });
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

  // 기능 : 도메인 오류 코드에 맞는 HTTP 상태 코드를 결정합니다.
  private getDomainErrorStatus(code: string): HttpStatus {
    if (code.endsWith("NotFound")) {
      return HttpStatus.NOT_FOUND;
    }

    switch (code) {
      case "Unauthorized":
        return HttpStatus.UNAUTHORIZED;
      case "Forbidden":
        return HttpStatus.FORBIDDEN;
      case "ExternalUserEmailMissing":
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
        return HttpStatus.CONFLICT;
      case "InactiveUser":
      case "OwnershipViolation":
        return HttpStatus.FORBIDDEN;
      case "InvalidDeviceSlot":
      case "InvalidDeviceId":
      case "InvalidRefreshOrigin":
      case "ValidationError":
      case "InvalidImportMapping":
      case "UnsupportedImportFileType":
      case "ImportFileParseFailed":
      case "GoogleCalendarOAuthStateInvalid":
      case "GoogleCalendarSourceSelectionRequired":
      case "ScheduleMeetingUrlInvalid":
        return HttpStatus.BAD_REQUEST;
      case "ImportJobExpired":
        return HttpStatus.GONE;
      case "ImportJobAlreadyClosed":
      case "ImportJobAlreadyConfirmed":
      case "ImportJobNotReady":
      case "ImportMappingRequired":
      case "GoogleCalendarReconnectRequired":
      case "GoogleCalendarSyncInProgress":
        return HttpStatus.CONFLICT;
      case "ImportMappingFailed":
      case "ImportConfirmValidationFailed":
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case "ImportFileStorageFailed":
      case "BrowserPushNotConfigured":
      case "MeetingNoteAiDraftProviderUnavailable":
      case "AiWeeklySalesReportProviderUnavailable":
        return HttpStatus.SERVICE_UNAVAILABLE;
      case "GoogleCalendarProviderUnavailable":
      case "AiWeeklySalesReportProviderFailed":
        return HttpStatus.BAD_GATEWAY;
      case "MeetingNoteAiDraftFailed":
        return HttpStatus.BAD_GATEWAY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
