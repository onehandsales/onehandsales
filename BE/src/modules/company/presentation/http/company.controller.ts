import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { CompanyApplicationService } from "@/modules/company/application/services/company-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { createXlsxDownloadResponse } from "@/shared/presentation/http/download-file-response";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateCompanyDto,
  CreateCompanyFieldDto,
  CreateCompanyMemoLogDto,
  CreateCompanyPrivateMemoLogDto,
  CreateCompanyRegionDto,
  CursorQueryDto,
  ExportCompaniesQueryDto,
  ListCompaniesQueryDto,
  UpdateCompanyDto,
  UpdateCompanyMemoLogDto,
  UpdateCompanyPrivateMemoLogDto,
} from "./dto/company-request.dto";

// 역할 : CompanyController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/companies")
export class CompanyController {
  // 기능 : 회사 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly companyApplicationService: CompanyApplicationService
  ) {}

  // API : 회사, 회사 목록 조회
  @Get()
  listCompanies(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListCompaniesQueryDto
  ) {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달한다.
    return this.companyApplicationService.listCompanies(currentUser, query);
  }

  // API : 회사, 검색과 필터가 반영된 회사 목록 xlsx 내보내기
  @Get("export/xlsx")
  async exportCompaniesXlsx(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ExportCompaniesQueryDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달해 xlsx 파일을 생성한다.
    const file = await this.companyApplicationService.exportCompaniesXlsx(
      currentUser,
      query
    );

    // 2. 생성된 xlsx 파일 정보를 HTTP 다운로드 응답으로 변환한다.
    return createXlsxDownloadResponse(response, file);
  }

  // API : 회사, 회사에 연결된 담당자 전체 목록 조회
  @Get(":companyId/contacts")
  listCompanyContacts(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string
  ) {
    // 1. path param의 회사 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.companyApplicationService.listCompanyContacts(
      currentUser,
      companyId
    );
  }

  // API : 회사, 회사에 연결된 딜 전체 목록 조회
  @Get(":companyId/deals")
  listCompanyDeals(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string
  ) {
    // 1. path param의 회사 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.companyApplicationService.listCompanyDeals(
      currentUser,
      companyId
    );
  }

  // API : 회사, 회사 단건 조회
  @Get(":companyId")
  getCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string
  ) {
    // 1. path param의 회사 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.companyApplicationService.getCompany(currentUser, companyId);
  }

  // API : 회사, 회사 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCompanyDto
  ): Promise<void> {
    // 1. request body와 현재 사용자를 application 계층으로 전달한다.
    await this.companyApplicationService.createCompany(currentUser, body);
  }

  // API : 회사, 회사 기본 정보 수정
  @Patch(":companyId")
  @HttpCode(HttpStatus.CREATED)
  async updateCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() body: UpdateCompanyDto
  ): Promise<void> {
    // 1. path param, request body, 현재 사용자를 application 계층으로 전달한다.
    await this.companyApplicationService.updateCompany(
      currentUser,
      companyId,
      body
    );
  }

  // API : 회사 메모, 일반 메모 로그 생성
  @Post(":companyId/memo-logs")
  @HttpCode(HttpStatus.CREATED)
  async createMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() body: CreateCompanyMemoLogDto
  ): Promise<void> {
    // 1. 회사 ID와 메모 생성 요청을 application 계층으로 전달한다.
    await this.companyApplicationService.createMemoLog(
      currentUser,
      companyId,
      body
    );
  }

  // API : 회사 메모, 일반 메모 로그 목록 조회
  @Get(":companyId/memo-logs")
  listMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Query() query: CursorQueryDto
  ) {
    // 1. 회사 ID와 cursor 조건을 application 계층으로 전달한다.
    return this.companyApplicationService.listMemoLogs(
      currentUser,
      companyId,
      query
    );
  }

  // API : 회사 메모, 일반 메모 로그 수정
  @Patch(":companyId/memo-logs/:memoLogId")
  @HttpCode(HttpStatus.CREATED)
  async updateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string,
    @Body() body: UpdateCompanyMemoLogDto
  ): Promise<void> {
    // 1. 회사 ID, 메모 로그 ID, 수정 본문을 application 계층으로 전달한다.
    await this.companyApplicationService.updateMemoLog(
      currentUser,
      companyId,
      memoLogId,
      body
    );
  }

  // API : 회사 메모, 일반 메모 로그 삭제
  @Delete(":companyId/memo-logs/:memoLogId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string
  ): Promise<void> {
    // 1. 회사 ID, 메모 로그 ID를 application 계층으로 전달한다.
    await this.companyApplicationService.deleteMemoLog(
      currentUser,
      companyId,
      memoLogId
    );
  }

  // API : 회사 비밀 메모, 개인 비밀 메모 로그 생성
  @Post(":companyId/private-memo-logs")
  @HttpCode(HttpStatus.CREATED)
  async createPrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() body: CreateCompanyPrivateMemoLogDto
  ): Promise<void> {
    // 1. 회사 ID와 비밀 메모 본문을 application 계층으로 전달한다.
    await this.companyApplicationService.createPrivateMemoLog(
      currentUser,
      companyId,
      body.memo
    );
  }

  // API : 회사 비밀 메모, 개인 비밀 메모 로그 목록 조회
  @Get(":companyId/private-memo-logs")
  listPrivateMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Query() query: CursorQueryDto
  ) {
    // 1. 회사 ID와 cursor 조건을 application 계층으로 전달한다.
    return this.companyApplicationService.listPrivateMemoLogs(
      currentUser,
      companyId,
      query
    );
  }

  // API : 회사 비밀 메모, 개인 비밀 메모 로그 수정
  @Patch(":companyId/private-memo-logs/:privateMemoLogId")
  @HttpCode(HttpStatus.CREATED)
  async updatePrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("privateMemoLogId", ParseUUIDPipe) privateMemoLogId: string,
    @Body() body: UpdateCompanyPrivateMemoLogDto
  ): Promise<void> {
    // 1. 회사 ID, 비밀 메모 로그 ID, 수정 본문을 application 계층으로 전달한다.
    await this.companyApplicationService.updatePrivateMemoLog(
      currentUser,
      companyId,
      privateMemoLogId,
      body.memo
    );
  }

  // API : 회사 비밀 메모, 개인 비밀 메모 로그 삭제
  @Delete(":companyId/private-memo-logs/:privateMemoLogId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("privateMemoLogId", ParseUUIDPipe) privateMemoLogId: string
  ): Promise<void> {
    // 1. 회사 ID, 비밀 메모 로그 ID를 application 계층으로 전달한다.
    await this.companyApplicationService.deletePrivateMemoLog(
      currentUser,
      companyId,
      privateMemoLogId
    );
  }
}

// 역할 : CompanyFieldController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/company-fields")
export class CompanyFieldController {
  // 기능 : 회사 분야 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly companyApplicationService: CompanyApplicationService
  ) {}

  // API : 회사 분야, 분야 목록 조회
  @Get()
  listFields(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 회사 분야 조회를 application 계층으로 위임한다.
    return this.companyApplicationService.listFields(currentUser);
  }

  // API : 회사 분야, 분야 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createField(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCompanyFieldDto
  ): Promise<void> {
    // 1. request body의 분야명을 application 계층으로 전달한다.
    await this.companyApplicationService.createField(currentUser, body.field);
  }

  // API : 회사 분야, 분야 삭제
  @Delete(":fieldId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteField(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("fieldId", ParseUUIDPipe) fieldId: string
  ): Promise<void> {
    // 1. 삭제할 분야 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.companyApplicationService.deleteField(currentUser, fieldId);
  }
}

// 역할 : CompanyRegionController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/company-regions")
export class CompanyRegionController {
  // 기능 : 회사 지역 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly companyApplicationService: CompanyApplicationService
  ) {}

  // API : 회사 지역, 지역 목록 조회
  @Get()
  listRegions(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 회사 지역 조회를 application 계층으로 위임한다.
    return this.companyApplicationService.listRegions(currentUser);
  }

  // API : 회사 지역, 지역 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRegion(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCompanyRegionDto
  ): Promise<void> {
    // 1. request body의 지역명을 application 계층으로 전달한다.
    await this.companyApplicationService.createRegion(currentUser, body.region);
  }

  // API : 회사 지역, 지역 삭제
  @Delete(":regionId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRegion(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("regionId", ParseUUIDPipe) regionId: string
  ): Promise<void> {
    // 1. 삭제할 지역 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.companyApplicationService.deleteRegion(currentUser, regionId);
  }
}
