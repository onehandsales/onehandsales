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
  UseGuards,
} from "@nestjs/common";
import { CompanyApplicationService } from "@/modules/company/application/services/company-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateCompanyDto,
  CreateCompanyFieldDto,
  CreateCompanyMemoLogDto,
  CreateCompanyPrivateMemoLogDto,
  CreateCompanyRegionDto,
  CursorQueryDto,
  ListCompaniesQueryDto,
  UpdateCompanyDto,
  UpdateCompanyMemoLogDto,
  UpdateCompanyPrivateMemoLogDto,
} from "./dto/company-request.dto";

@UseGuards(AuthGuard)
@Controller("api/companies")
export class CompanyController {
  // 기능 : 회사 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly companyApplicationService: CompanyApplicationService
  ) {}

  @Get()
  // 기능 : 회사 목록 페이지네이션 요청을 처리합니다.
  listCompanies(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListCompaniesQueryDto
  ) {
    return this.companyApplicationService.listCompanies(currentUser, query);
  }

  @Get(":companyId")
  // 기능 : 회사 단건 조회 요청을 처리합니다.
  getCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string
  ) {
    return this.companyApplicationService.getCompany(currentUser, companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 생성 요청을 처리하고 body 없는 201 응답을 반환합니다.
  async createCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCompanyDto
  ): Promise<void> {
    await this.companyApplicationService.createCompany(currentUser, body);
  }

  @Patch(":companyId")
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 기본 정보 수정 요청을 처리하고 body 없는 201 응답을 반환합니다.
  async updateCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() body: UpdateCompanyDto
  ): Promise<void> {
    await this.companyApplicationService.updateCompany(
      currentUser,
      companyId,
      body
    );
  }

  @Post(":companyId/memo-logs")
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 일반 메모 로그 생성 요청을 처리합니다.
  async createMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() body: CreateCompanyMemoLogDto
  ): Promise<void> {
    await this.companyApplicationService.createMemoLog(
      currentUser,
      companyId,
      body
    );
  }

  @Get(":companyId/memo-logs")
  // 기능 : 회사 일반 메모 로그 cursor 조회 요청을 처리합니다.
  listMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Query() query: CursorQueryDto
  ) {
    return this.companyApplicationService.listMemoLogs(
      currentUser,
      companyId,
      query
    );
  }

  @Patch(":companyId/memo-logs/:memoLogId")
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 일반 메모 로그 본문 수정 요청을 처리합니다.
  async updateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string,
    @Body() body: UpdateCompanyMemoLogDto
  ): Promise<void> {
    await this.companyApplicationService.updateMemoLog(
      currentUser,
      companyId,
      memoLogId,
      body.memo
    );
  }

  @Post(":companyId/private-memo-logs")
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 개인 비밀 메모 로그 생성 요청을 처리합니다.
  async createPrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() body: CreateCompanyPrivateMemoLogDto
  ): Promise<void> {
    await this.companyApplicationService.createPrivateMemoLog(
      currentUser,
      companyId,
      body.memo
    );
  }

  @Get(":companyId/private-memo-logs")
  // 기능 : 회사 개인 비밀 메모 로그 cursor 조회 요청을 처리합니다.
  listPrivateMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Query() query: CursorQueryDto
  ) {
    return this.companyApplicationService.listPrivateMemoLogs(
      currentUser,
      companyId,
      query
    );
  }

  @Patch(":companyId/private-memo-logs/:privateMemoLogId")
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 개인 비밀 메모 로그 본문 수정 요청을 처리합니다.
  async updatePrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("privateMemoLogId", ParseUUIDPipe) privateMemoLogId: string,
    @Body() body: UpdateCompanyPrivateMemoLogDto
  ): Promise<void> {
    await this.companyApplicationService.updatePrivateMemoLog(
      currentUser,
      companyId,
      privateMemoLogId,
      body.memo
    );
  }
}

@UseGuards(AuthGuard)
@Controller("api/company-fields")
export class CompanyFieldController {
  // 기능 : 회사 분야 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly companyApplicationService: CompanyApplicationService
  ) {}

  @Get()
  // 기능 : 회사 분야 전체 조회 요청을 처리합니다.
  listFields(@CurrentUser() currentUser: CurrentUserContext) {
    return this.companyApplicationService.listFields(currentUser);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 분야 생성 요청을 처리하고 body 없는 201 응답을 반환합니다.
  async createField(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCompanyFieldDto
  ): Promise<void> {
    await this.companyApplicationService.createField(currentUser, body.field);
  }

  @Delete(":fieldId")
  @HttpCode(HttpStatus.NO_CONTENT)
  // 기능 : 회사 분야 삭제 요청을 처리하고 body 없는 204 응답을 반환합니다.
  async deleteField(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("fieldId", ParseUUIDPipe) fieldId: string
  ): Promise<void> {
    await this.companyApplicationService.deleteField(currentUser, fieldId);
  }
}

@UseGuards(AuthGuard)
@Controller("api/company-regions")
export class CompanyRegionController {
  // 기능 : 회사 지역 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly companyApplicationService: CompanyApplicationService
  ) {}

  @Get()
  // 기능 : 회사 지역 전체 조회 요청을 처리합니다.
  listRegions(@CurrentUser() currentUser: CurrentUserContext) {
    return this.companyApplicationService.listRegions(currentUser);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // 기능 : 회사 지역 생성 요청을 처리하고 body 없는 201 응답을 반환합니다.
  async createRegion(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCompanyRegionDto
  ): Promise<void> {
    await this.companyApplicationService.createRegion(currentUser, body.region);
  }

  @Delete(":regionId")
  @HttpCode(HttpStatus.NO_CONTENT)
  // 기능 : 회사 지역 삭제 요청을 처리하고 body 없는 204 응답을 반환합니다.
  async deleteRegion(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("regionId", ParseUUIDPipe) regionId: string
  ): Promise<void> {
    await this.companyApplicationService.deleteRegion(currentUser, regionId);
  }
}
