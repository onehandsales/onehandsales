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
import { ContactApplicationService } from "@/modules/contact/application/services/contact-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { createXlsxDownloadResponse } from "@/shared/presentation/http/download-file-response";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateContactDepartmentDto,
  CreateContactDto,
  CreateContactJobGradeDto,
  CreateContactMemoLogDto,
  CreateContactPrivateMemoLogDto,
  CursorQueryDto,
  ExportContactsQueryDto,
  ListContactsQueryDto,
  UpdateContactDto,
  UpdateContactMemoLogDto,
  UpdateContactPrivateMemoLogDto,
} from "./dto/contact-request.dto";

// 역할 : ContactController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/contacts")
export class ContactController {
  // 기능 : 담당자 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly contactApplicationService: ContactApplicationService
  ) {}

  // API : 담당자 목록 조회
  @Get()
  listContacts(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListContactsQueryDto
  ) {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달한다.
    return this.contactApplicationService.listContacts(currentUser, query);
  }

  // API : 담당자, 검색과 필터가 반영된 담당자 목록 xlsx 내보내기
  @Get("export/xlsx")
  async exportContactsXlsx(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ExportContactsQueryDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달해 xlsx 파일을 생성한다.
    const file = await this.contactApplicationService.exportContactsXlsx(
      currentUser,
      query
    );

    // 2. 생성된 xlsx 파일 정보를 HTTP 다운로드 응답으로 변환한다.
    return createXlsxDownloadResponse(response, file);
  }

  // API : 담당자, 필터용 회사 전체 조회
  @Get("company-options")
  listCompanyOptions(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 회사 옵션 조회를 application 계층으로 위임한다.
    return this.contactApplicationService.listCompanyOptions(currentUser);
  }

  // API : 담당자에 연결된 딜 전체 목록 조회
  @Get(":contactId/deals")
  listContactDeals(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string
  ) {
    // 1. path param의 담당자 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.contactApplicationService.listContactDeals(
      currentUser,
      contactId
    );
  }

  // API : 담당자 단건 조회
  @Get(":contactId")
  getContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string
  ) {
    // 1. path param의 담당자 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.contactApplicationService.getContact(currentUser, contactId);
  }

  // API : 담당자 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateContactDto
  ): Promise<void> {
    // 1. request body와 현재 사용자를 application 계층으로 전달한다.
    await this.contactApplicationService.createContact(currentUser, body);
  }

  // API : 담당자 기본 정보 수정
  @Patch(":contactId")
  @HttpCode(HttpStatus.CREATED)
  async updateContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Body() body: UpdateContactDto
  ): Promise<void> {
    // 1. path param, request body, 현재 사용자를 application 계층으로 전달한다.
    await this.contactApplicationService.updateContact(
      currentUser,
      contactId,
      body
    );
  }

  // API : 담당자 삭제
  @Delete(":contactId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContact(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string
  ): Promise<void> {
    // 1. path param의 담당자 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.contactApplicationService.deleteContact(currentUser, contactId);
  }

  // API : 담당자 메모, 일반 메모 로그 생성
  @Post(":contactId/memo-logs")
  @HttpCode(HttpStatus.CREATED)
  async createMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Body() body: CreateContactMemoLogDto
  ): Promise<void> {
    // 1. 담당자 ID와 메모 생성 요청을 application 계층으로 전달한다.
    await this.contactApplicationService.createMemoLog(
      currentUser,
      contactId,
      body
    );
  }

  // API : 담당자 메모, 일반 메모 로그 목록 조회
  @Get(":contactId/memo-logs")
  listMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Query() query: CursorQueryDto
  ) {
    // 1. 담당자 ID와 cursor 조건을 application 계층으로 전달한다.
    return this.contactApplicationService.listMemoLogs(
      currentUser,
      contactId,
      query
    );
  }

  // API : 담당자 메모, 일반 메모 로그 수정
  @Patch(":contactId/memo-logs/:memoLogId")
  @HttpCode(HttpStatus.CREATED)
  async updateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string,
    @Body() body: UpdateContactMemoLogDto
  ): Promise<void> {
    // 1. 담당자 ID, 메모 로그 ID, 수정 본문을 application 계층으로 전달한다.
    await this.contactApplicationService.updateMemoLog(
      currentUser,
      contactId,
      memoLogId,
      body
    );
  }

  // API : 담당자 메모, 일반 메모 로그 삭제
  @Delete(":contactId/memo-logs/:memoLogId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string
  ): Promise<void> {
    // 1. 담당자 ID, 메모 로그 ID를 application 계층으로 전달한다.
    await this.contactApplicationService.deleteMemoLog(
      currentUser,
      contactId,
      memoLogId
    );
  }

  // API : 담당자 비밀 메모, 개인 비밀 메모 로그 생성
  @Post(":contactId/private-memo-logs")
  @HttpCode(HttpStatus.CREATED)
  async createPrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Body() body: CreateContactPrivateMemoLogDto
  ): Promise<void> {
    // 1. 담당자 ID와 비밀 메모 본문을 application 계층으로 전달한다.
    await this.contactApplicationService.createPrivateMemoLog(
      currentUser,
      contactId,
      body.memo
    );
  }

  // API : 담당자 비밀 메모, 개인 비밀 메모 로그 목록 조회
  @Get(":contactId/private-memo-logs")
  listPrivateMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Query() query: CursorQueryDto
  ) {
    // 1. 담당자 ID와 cursor 조건을 application 계층으로 전달한다.
    return this.contactApplicationService.listPrivateMemoLogs(
      currentUser,
      contactId,
      query
    );
  }

  // API : 담당자 비밀 메모, 개인 비밀 메모 로그 수정
  @Patch(":contactId/private-memo-logs/:privateMemoLogId")
  @HttpCode(HttpStatus.CREATED)
  async updatePrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Param("privateMemoLogId", ParseUUIDPipe) privateMemoLogId: string,
    @Body() body: UpdateContactPrivateMemoLogDto
  ): Promise<void> {
    // 1. 담당자 ID, 비밀 메모 로그 ID, 수정 본문을 application 계층으로 전달한다.
    await this.contactApplicationService.updatePrivateMemoLog(
      currentUser,
      contactId,
      privateMemoLogId,
      body.memo
    );
  }

  // API : 담당자 비밀 메모, 개인 비밀 메모 로그 삭제
  @Delete(":contactId/private-memo-logs/:privateMemoLogId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("contactId", ParseUUIDPipe) contactId: string,
    @Param("privateMemoLogId", ParseUUIDPipe) privateMemoLogId: string
  ): Promise<void> {
    // 1. 담당자 ID, 비밀 메모 로그 ID를 application 계층으로 전달한다.
    await this.contactApplicationService.deletePrivateMemoLog(
      currentUser,
      contactId,
      privateMemoLogId
    );
  }
}

// 역할 : ContactJobGradeController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/contact-job-grades")
export class ContactJobGradeController {
  // 기능 : 담당자 직급 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly contactApplicationService: ContactApplicationService
  ) {}

  // API : 담당자 직급, 직급 목록 조회
  @Get()
  listJobGrades(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 담당자 직급 조회를 application 계층으로 위임한다.
    return this.contactApplicationService.listJobGrades(currentUser);
  }

  // API : 담당자 직급, 직급 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJobGrade(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateContactJobGradeDto
  ): Promise<void> {
    // 1. request body의 직급명을 application 계층으로 전달한다.
    await this.contactApplicationService.createJobGrade(
      currentUser,
      body.jobGradeName
    );
  }

  // API : 담당자 직급, 직급 삭제
  @Delete(":jobGradeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJobGrade(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("jobGradeId", ParseUUIDPipe) jobGradeId: string
  ): Promise<void> {
    // 1. 삭제할 직급 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.contactApplicationService.deleteJobGrade(currentUser, jobGradeId);
  }
}

// 역할 : ContactDepartmentController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/contact-departments")
export class ContactDepartmentController {
  // 기능 : 담당자 부서 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly contactApplicationService: ContactApplicationService
  ) {}

  // API : 담당자 부서, 부서 목록 조회
  @Get()
  listDepartments(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 담당자 부서 조회를 application 계층으로 위임한다.
    return this.contactApplicationService.listDepartments(currentUser);
  }

  // API : 담당자 부서, 부서 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateContactDepartmentDto
  ): Promise<void> {
    // 1. request body의 부서명을 application 계층으로 전달한다.
    await this.contactApplicationService.createDepartment(
      currentUser,
      body.departmentName
    );
  }

  // API : 담당자 부서, 부서 삭제
  @Delete(":departmentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDepartment(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("departmentId", ParseUUIDPipe) departmentId: string
  ): Promise<void> {
    // 1. 삭제할 부서 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.contactApplicationService.deleteDepartment(
      currentUser,
      departmentId
    );
  }
}
