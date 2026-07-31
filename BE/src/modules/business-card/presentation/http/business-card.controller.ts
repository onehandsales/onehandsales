import type { Buffer } from "node:buffer";
import {
  ArgumentsHost,
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  PayloadTooLargeException,
  Post,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import {
  BusinessCardApplicationService,
  type UploadedBusinessCardImageFile,
} from "@/modules/business-card/application/services/business-card-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import {
  ConfirmBusinessCardScanDto,
  ListBusinessCardScansQueryDto,
} from "./dto/business-card-request.dto";

const MAX_BUSINESS_CARD_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

interface UploadedBusinessCardFile {
  readonly buffer: Buffer;
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
}

// 역할 : BusinessCardUploadExceptionFilter 명함 이미지 업로드 단계의 Multer 예외를 안전한 API 오류로 변환합니다.
@Catch(PayloadTooLargeException)
export class BusinessCardUploadExceptionFilter implements ExceptionFilter {
  // 기능 : 10MB 초과 업로드를 G02 IMAGE_TOO_LARGE 계약 응답으로 변환합니다.
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: "IMAGE_TOO_LARGE",
      code: "IMAGE_TOO_LARGE",
      message: "10MB 이하 이미지만 올릴 수 있어요.",
      field: "image",
    });
  }
}

// 역할 : BusinessCardController 명함 스캔 HTTP API 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/business-card-scans")
export class BusinessCardController {
  constructor(
    private readonly businessCardApplicationService: BusinessCardApplicationService
  ) {}

  // API : 명함 스캔 로그 목록 조회
  @Get()
  listScanLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListBusinessCardScansQueryDto
  ) {
    return this.businessCardApplicationService.listScanLogs(currentUser, query);
  }

  // API : 명함스캔. 이미지를 OCR 후보 필드로 변환하고 성공/실패 로그를 남깁니다.
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(BusinessCardUploadExceptionFilter)
  @UseInterceptors(
    FileInterceptor("image", {
      limits: { fileSize: MAX_BUSINESS_CARD_IMAGE_SIZE_BYTES },
    })
  )
  scanBusinessCard(
    @CurrentUser() currentUser: CurrentUserContext,
    @UploadedFile() imageFile: UploadedBusinessCardFile | undefined,
    @Req() request: RequestWithRequestId
  ) {
    return this.businessCardApplicationService.scanBusinessCard(
      currentUser,
      this.toUploadedBusinessCardImageFile(imageFile),
      request.requestId
    );
  }

  // API : 명함 스캔 로그 단건 조회
  @Get(":scanLogId")
  getScanLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scanLogId", ParseUUIDPipe) scanLogId: string
  ) {
    return this.businessCardApplicationService.getScanLog(
      currentUser,
      scanLogId
    );
  }

  // API : 사용자가 보정한 명함 데이터를 회사/담당자로 확정 저장합니다.
  @Post(":scanLogId/confirm")
  @HttpCode(HttpStatus.OK)
  confirmScanLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scanLogId", ParseUUIDPipe) scanLogId: string,
    @Body() body: ConfirmBusinessCardScanDto,
    @Req() request: RequestWithRequestId
  ) {
    return this.businessCardApplicationService.confirmScanLog(
      currentUser,
      scanLogId,
      body,
      request.requestId
    );
  }

  private toUploadedBusinessCardImageFile(
    imageFile: UploadedBusinessCardFile | undefined
  ): UploadedBusinessCardImageFile | undefined {
    if (!imageFile) {
      return undefined;
    }

    return {
      buffer: imageFile.buffer,
      originalname: imageFile.originalname,
      mimetype: imageFile.mimetype,
      size: imageFile.size,
    };
  }
}
