import type { Buffer } from "node:buffer";
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  BusinessCardApplicationService,
  type UploadedBusinessCardImageFile,
} from "@/modules/business-card/application/services/business-card-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
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

  // API : 명함등록. 이미지를 OCR 후보 필드로 변환하고 성공/실패 로그를 남깁니다.
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor("image", {
      limits: { fileSize: MAX_BUSINESS_CARD_IMAGE_SIZE_BYTES },
    })
  )
  scanBusinessCard(
    @CurrentUser() currentUser: CurrentUserContext,
    @UploadedFile() imageFile: UploadedBusinessCardFile | undefined
  ) {
    return this.businessCardApplicationService.scanBusinessCard(
      currentUser,
      this.toUploadedBusinessCardImageFile(imageFile)
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

  // API : 사용자가 보정한 명함 데이터를 회사/담당자로 확정 저장
  @Post(":scanLogId/confirm")
  @HttpCode(HttpStatus.OK)
  confirmScanLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scanLogId", ParseUUIDPipe) scanLogId: string,
    @Body() body: ConfirmBusinessCardScanDto
  ) {
    return this.businessCardApplicationService.confirmScanLog(
      currentUser,
      scanLogId,
      body
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
