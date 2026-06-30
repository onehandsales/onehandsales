import type { Buffer } from "node:buffer";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  DataImportApplicationService,
  type ConfirmImportJobInput,
} from "@/modules/data-import/application/services/data-import-application.service";
import type { ImportUploadedFile } from "@/modules/data-import/application/ports/import-file-parser.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  ConfirmImportJobDto,
  CreateImportJobDto,
  UpdateImportMappingDto,
} from "./dto/import-job-request.dto";

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface UploadedImportFile {
  readonly buffer: Buffer;
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
}

// 역할 : ImportJobController 확정 전 데이터 불러오기 HTTP API를 처리합니다.
@UseGuards(AuthGuard)
@Controller("api/imports")
export class ImportJobController {
  constructor(
    private readonly dataImportApplicationService: DataImportApplicationService
  ) {}

  // API : 데이터 불러오기 파일 업로드 및 임시 job 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_IMPORT_FILE_SIZE_BYTES },
    })
  )
  createImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateImportJobDto,
    @UploadedFile() file: UploadedImportFile | undefined
  ) {
    return this.dataImportApplicationService.createImportJob(currentUser, {
      targetType: body.targetType,
      file: this.toImportUploadedFile(file),
    });
  }

  // API : 데이터 불러오기 임시 job 단건 조회
  @Get(":importJobId")
  getImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string
  ) {
    return this.dataImportApplicationService.getImportJob(
      currentUser,
      importJobId
    );
  }

  // API : 데이터 불러오기 AI 컬럼 매핑 생성
  @Post(":importJobId/map")
  @HttpCode(HttpStatus.OK)
  generateImportMapping(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string
  ) {
    return this.dataImportApplicationService.generateImportMapping(
      currentUser,
      importJobId
    );
  }

  // API : 데이터 불러오기 컬럼 매핑 수정 및 row 검증
  @Patch(":importJobId/mapping")
  updateImportMapping(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: UpdateImportMappingDto
  ) {
    return this.dataImportApplicationService.updateImportMapping(
      currentUser,
      importJobId,
      { mapping: body.mapping }
    );
  }

  // API : 데이터 불러오기 최종 확정 및 도메인 데이터 생성
  @Post(":importJobId/confirm")
  @HttpCode(HttpStatus.OK)
  confirmImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: ConfirmImportJobDto
  ) {
    const input: ConfirmImportJobInput =
      body.rows === undefined ? {} : { rows: body.rows };

    return this.dataImportApplicationService.confirmImportJob(
      currentUser,
      importJobId,
      input
    );
  }

  private toImportUploadedFile(
    file: UploadedImportFile | undefined
  ): ImportUploadedFile {
    if (!file) {
      throw new ValidationDomainError("불러오기 파일이 필요합니다.");
    }

    return {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
