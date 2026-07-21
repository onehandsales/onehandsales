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
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import {
  DataImportApplicationService,
} from "@/modules/data-import/application/services/data-import-application.service";
import type { ImportUploadedFile } from "@/modules/data-import/application/ports/import-file-parser.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CancelImportJobRequest,
  ConfirmImportJobRequest,
  CreateImportJobRequest,
  GetImportJobRequest,
  ListActiveImportJobsRequest,
  ListImportJobErrorsRequest,
  MapImportJobRequest,
  UpdateImportJobMappingRequest,
  UpdateImportJobRowsRequest,
  ValidateImportJobRequest,
} from "./dto/import-job-request.dto";

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// 역할 : UploadedImportFile multer가 controller에 전달하는 업로드 파일 구조를 표현합니다.
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
  // 기능 : 데이터 불러오기 application service를 주입받습니다.
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
    @Body() body: CreateImportJobRequest,
    @UploadedFile() file: UploadedImportFile | undefined
  ) {
    // 1. multipart 업로드 파일과 대상 타입을 application 계층으로 전달한다.
    return this.dataImportApplicationService.createImportJob(currentUser, {
      targetType: body.targetType,
      file: this.toImportUploadedFile(file),
    });
  }

  // API : 데이터 불러오기 재개 가능한 활성 job 목록 조회
  @Get("active")
  listActiveImportJobs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListActiveImportJobsRequest
  ) {
    // 1. 현재 사용자와 목록 query 조건을 application 계층으로 전달한다.
    return this.dataImportApplicationService.listActiveImportJobs(
      currentUser,
      query
    );
  }

  // API : 데이터 불러오기 임시 job 단건 조회
  @Get(":importJobId")
  getImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Query() query: GetImportJobRequest
  ) {
    // 1. path param의 job ID와 조회 옵션을 application 계층으로 전달한다.
    return this.dataImportApplicationService.getImportJob(
      currentUser,
      importJobId,
      query
    );
  }

  // API : 데이터 불러오기 AI 컬럼 매핑 생성
  @Post(":importJobId/map")
  @HttpCode(HttpStatus.OK)
  generateImportMapping(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: MapImportJobRequest
  ) {
    // 1. path param의 job ID와 매핑 선호 옵션을 application 계층으로 전달한다.
    return this.dataImportApplicationService.generateImportMapping(
      currentUser,
      importJobId,
      body
    );
  }

  // API : 데이터 불러오기 컬럼 매핑 수정 및 row 검증
  @Patch(":importJobId/mapping")
  updateImportMapping(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: UpdateImportJobMappingRequest
  ) {
    // 1. 사용자가 수정한 컬럼 매핑을 application 계층으로 전달한다.
    return this.dataImportApplicationService.updateImportMapping(
      currentUser,
      importJobId,
      { mapping: body.mapping }
    );
  }

  // API : 데이터 불러오기 row 보정 및 재검증
  @Patch(":importJobId/rows")
  updateImportJobRows(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: UpdateImportJobRowsRequest
  ) {
    // 1. 사용자가 보정한 row 데이터를 application 계층으로 전달한다.
    return this.dataImportApplicationService.updateImportJobRows(
      currentUser,
      importJobId,
      { rows: body.rows }
    );
  }

  // API : 데이터 불러오기 현재 매핑 기준 row 재검증
  @Post(":importJobId/validate")
  @HttpCode(HttpStatus.OK)
  validateImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: ValidateImportJobRequest
  ) {
    // 1. path param의 job ID를 기준으로 현재 저장된 매핑과 row를 재검증한다.
    return this.dataImportApplicationService.validateImportJob(
      currentUser,
      importJobId,
      body
    );
  }

  // API : 데이터 불러오기 최종 확정 및 도메인 데이터 생성
  @Post(":importJobId/confirm")
  @HttpCode(HttpStatus.OK)
  confirmImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: ConfirmImportJobRequest
  ) {
    // 1. 확정 요청을 application 계층으로 전달해 domain record와 성공 로그를 생성한다.
    return this.dataImportApplicationService.confirmImportJob(
      currentUser,
      importJobId,
      body
    );
  }

  // API : 데이터 불러오기 임시 job 취소
  @Post(":importJobId/cancel")
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Body() body: CancelImportJobRequest,
    @Res() response: Response
  ) {
    // 1. 임시 job 취소와 원본 파일 정리를 application 계층으로 위임한다.
    await this.dataImportApplicationService.cancelImportJob(
      currentUser,
      importJobId,
      body
    );
    // 2. 취소 성공 시 body 없는 204 응답으로 변환한다.
    response.status(HttpStatus.NO_CONTENT).send();
  }

  // API : 데이터 불러오기 job 오류 이력 조회
  @Get(":importJobId/errors")
  listImportJobErrors(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId", ParseUUIDPipe) importJobId: string,
    @Query() query: ListImportJobErrorsRequest
  ) {
    // 1. path param의 job ID와 paging query를 application 계층으로 전달한다.
    return this.dataImportApplicationService.listImportJobErrors(
      currentUser,
      importJobId,
      query
    );
  }

  // 기능 : multer 업로드 파일을 application port 입력 구조로 변환합니다.
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
