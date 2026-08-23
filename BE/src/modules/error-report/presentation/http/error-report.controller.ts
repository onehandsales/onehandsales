import type { Buffer } from "node:buffer";
import {
  ArgumentsHost,
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  HttpCode,
  HttpStatus,
  PayloadTooLargeException,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import {
  ErrorReportApplicationService,
  type UploadedErrorReportScreenshotFile,
} from "@/modules/error-report/application/services/error-report-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CreateErrorReportDto } from "./dto/create-error-report.dto";

const MAX_ERROR_REPORT_SCREENSHOT_SIZE_BYTES = 10 * 1024 * 1024;

// 역할 : UploadedErrorReportScreenshot Multer가 전달한 screenshot 파일 구조를 정의합니다.
interface UploadedErrorReportScreenshot {
  readonly buffer: Buffer;
  readonly mimetype: string;
  readonly originalname: string;
  readonly size: number;
}

// 역할 : ErrorReportUploadExceptionFilter 에러 신고 screenshot 업로드 예외를 안전한 API 오류로 변환합니다.
@Catch(PayloadTooLargeException)
export class ErrorReportUploadExceptionFilter implements ExceptionFilter {
  // 기능 : 10MB 초과 screenshot 업로드를 표준 오류 응답으로 변환합니다.
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: "ERROR_REPORT_SCREENSHOT_TOO_LARGE",
      code: "ERROR_REPORT_SCREENSHOT_TOO_LARGE",
      message: "10MB 이하 스크린샷만 첨부할 수 있어요.",
      field: "screenshot",
    });
  }
}

// 역할 : ErrorReportController 에러 신고 HTTP API 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/error-reports")
export class ErrorReportController {
  // 기능 : 에러 신고 application service를 주입받습니다.
  constructor(
    private readonly errorReportApplicationService: ErrorReportApplicationService
  ) {}

  // API : User Web 도움말 모달 에러 신고 접수
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(ErrorReportUploadExceptionFilter)
  @UseInterceptors(
    FileInterceptor("screenshot", {
      limits: { fileSize: MAX_ERROR_REPORT_SCREENSHOT_SIZE_BYTES },
    })
  )
  createErrorReport(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateErrorReportDto,
    @UploadedFile() screenshot: UploadedErrorReportScreenshot | undefined,
    @Req() request: RequestWithRequestId
  ) {
    // 1. HTTP multipart 입력과 인증 context를 application 계층 계약으로 변환한다.
    return this.errorReportApplicationService.createErrorReport({
      currentUser,
      description: body.description,
      pageUrl: body.pageUrl,
      requestId: request.requestId,
      screenshotFile: this.toUploadedScreenshotFile(screenshot),
      userAgent: request.header("user-agent") ?? null,
    });
  }

  // 기능 : Multer 업로드 파일을 application 계층 파일 구조로 변환합니다.
  private toUploadedScreenshotFile(
    screenshot: UploadedErrorReportScreenshot | undefined
  ): UploadedErrorReportScreenshotFile | null {
    if (!screenshot) {
      return null;
    }

    return {
      buffer: screenshot.buffer,
      mimetype: screenshot.mimetype,
      originalname: screenshot.originalname,
      size: screenshot.size,
    };
  }
}
