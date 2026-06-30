import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { DataImportApplicationService } from "@/modules/data-import/application/services/data-import-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { createXlsxDownloadResponse } from "@/shared/presentation/http/download-file-response";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  DownloadImportTemplateQueryDto,
  ListImportUserLogsQueryDto,
} from "./dto/import-template-request.dto";

// 역할 : ImportTemplateController 데이터 불러오기 양식 HTTP API를 처리합니다.
@UseGuards(AuthGuard)
@Controller("api/import-templates")
export class ImportTemplateController {
  // 기능 : 데이터 불러오기 application service를 주입받습니다.
  constructor(
    private readonly dataImportApplicationService: DataImportApplicationService
  ) {}

  // API : 데이터 불러오기, 활성 양식 목록 조회
  @Get("active")
  listActiveTemplates() {
    // 1. 활성화된 불러오기 양식 목록 조회를 application 계층으로 위임한다.
    return this.dataImportApplicationService.listActiveTemplates();
  }

  // API : 데이터 불러오기, 선택한 양식 xlsx 다운로드
  @Get(":templateId/download")
  async downloadTemplate(
    @Param("templateId", ParseUUIDPipe) templateId: string,
    @Query() query: DownloadImportTemplateQueryDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    // 1. path param과 query context를 application 계층으로 전달해 xlsx 파일을 생성한다.
    const file = await this.dataImportApplicationService.downloadImportTemplate({
      templateId,
      ...(query.companyName !== undefined ? { companyName: query.companyName } : {}),
    });

    // 2. 생성된 xlsx 파일 정보를 HTTP 다운로드 응답으로 변환한다.
    return createXlsxDownloadResponse(response, file);
  }
}

// 역할 : ImportUserLogController 데이터 불러오기 성공 내역 HTTP API를 처리합니다.
@UseGuards(AuthGuard)
@Controller("api/import-user-logs")
export class ImportUserLogController {
  // 기능 : 데이터 불러오기 application service를 주입받습니다.
  constructor(
    private readonly dataImportApplicationService: DataImportApplicationService
  ) {}

  // API : 데이터 불러오기, 성공 내역 목록 조회
  @Get()
  listImportUserLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListImportUserLogsQueryDto
  ) {
    // 1. 현재 사용자와 query 조건을 application 계층으로 전달한다.
    return this.dataImportApplicationService.listImportUserLogs(
      currentUser,
      query
    );
  }

  // API : 데이터 불러오기, 성공 내역 단건 상세 조회
  @Get(":importUserLogId")
  getImportUserLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importUserLogId", ParseUUIDPipe) importUserLogId: string
  ) {
    // 1. path param의 불러오기 내역 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.dataImportApplicationService.getImportUserLog(
      currentUser,
      importUserLogId
    );
  }
}
