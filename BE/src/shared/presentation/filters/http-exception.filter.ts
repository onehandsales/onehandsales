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

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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

  private getDomainErrorStatus(code: string): HttpStatus {
    if (code === "NextActionNotFound") {
      return HttpStatus.CONFLICT;
    }

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
      case "DuplicateProductConnection":
        return HttpStatus.CONFLICT;
      case "InactiveUser":
      case "OwnershipViolation":
        return HttpStatus.FORBIDDEN;
      case "InvalidDeviceSlot":
      case "InvalidDeviceId":
      case "InvalidRefreshOrigin":
      case "InvalidUserSetting":
      case "ValidationError":
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
