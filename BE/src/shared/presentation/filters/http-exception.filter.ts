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
    // 1. 이후 단계에서 사용할 response 값을 준비한다.
    const response = host.switchToHttp().getResponse<Response>();

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
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

    // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (exception instanceof DomainError) {
      const status = this.getDomainErrorStatus(exception.code);
      response.status(status).json(this.createDomainErrorBody(status, exception));
      return;
    }

    // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json({
        statusCode: status,
        error: body,
      });
      return;
    }

    // 5. 현재 단계에서 필요한 동작을 실행한다.
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
    // 1. 이후 단계에서 사용할 safeDetails 값을 준비한다.
    const safeDetails: Record<string, unknown> = {};

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (typeof details?.["retryable"] === "boolean") {
      safeDetails["retryable"] = details["retryable"];
    }

    // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (typeof details?.["field"] === "string") {
      safeDetails["field"] = details["field"];
    }

    // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (typeof details?.["provider"] === "string") {
      safeDetails["provider"] = details["provider"];
    }

    // 5. 계산된 결과를 호출자에게 반환한다.
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
      case "ObjectDefinitionApiSlugAlreadyExists":
        return HttpStatus.CONFLICT;
      case "InactiveUser":
      case "OwnershipViolation":
        return HttpStatus.FORBIDDEN;
      case "InvalidDeviceSlot":
      case "InvalidDeviceId":
      case "InvalidRefreshOrigin":
      case "ValidationError":
      case "CURRENCY_UNSUPPORTED":
      case "USER_LOCALE_UNSUPPORTED":
      case "USER_TIMEZONE_INVALID":
      case "USER_COUNTRY_UNSUPPORTED":
      case "USER_DEFAULT_CURRENCY_UNSUPPORTED":
      case "WORKSPACE_NAME_REQUIRED":
      case "WORKSPACE_NAME_TOO_LONG":
      case "OBJECT_DEFINITION_NAME_REQUIRED":
      case "OBJECT_DEFINITION_NAME_TOO_LONG":
      case "TRASH_TARGET_TYPE_UNSUPPORTED":
      case "ERROR_REPORT_DESCRIPTION_REQUIRED":
      case "ERROR_REPORT_PAGE_URL_REQUIRED":
      case "ERROR_REPORT_PAGE_URL_TOO_LONG":
      case "ERROR_REPORT_SCREENSHOT_TYPE_UNSUPPORTED":
      case "SUPPORT_REQUEST_TYPE_REQUIRED":
      case "SUPPORT_REQUEST_TYPE_INVALID":
      case "SUPPORT_REQUEST_DESCRIPTION_REQUIRED":
      case "SUPPORT_REQUEST_DESCRIPTION_TOO_LONG":
      case "SUPPORT_REQUEST_PAGE_URL_REQUIRED":
      case "SUPPORT_REQUEST_PAGE_URL_TOO_LONG":
      case "PUBLIC_CONTACT_REQUEST_VALIDATION_FAILED":
        return HttpStatus.BAD_REQUEST;
      case "ERROR_REPORT_SCREENSHOT_TOO_LARGE":
        return HttpStatus.PAYLOAD_TOO_LARGE;
      case "ERROR_REPORT_SCREENSHOT_STORAGE_FAILED":
        return HttpStatus.SERVICE_UNAVAILABLE;
      case "AUTH_PROVIDER_EXCHANGE_FAILED":
        return HttpStatus.BAD_GATEWAY;
      case "TRASH_RECORD_NOT_FOUND":
      case "ERROR_REPORT_USER_NOT_FOUND":
      case "SUPPORT_REQUEST_USER_NOT_FOUND":
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
