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
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { DealApplicationService } from "@/modules/deal/application/services/deal-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { createXlsxDownloadResponse } from "@/shared/presentation/http/download-file-response";
import {
  CreateDealDto,
  CreateDealFollowingActionLogDto,
  CreateDealMemoLogDto,
  ExportDealsQueryDto,
  ListDealsQueryDto,
  UpdateDealDto,
  UpdateDealFollowingActionLogDto,
  UpdateDealMemoLogDto,
} from "./dto/deal-request.dto";

// 역할 : DealController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/deals")
export class DealController {
  // 기능 : 딜 API 처리에 필요한 application service를 주입받습니다.
  constructor(private readonly dealApplicationService: DealApplicationService) {}

  // API : 딜, 단계별 개수 조회
  @Get("stage-counts")
  countDealsByStatus(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 딜 단계별 개수 조회를 application 계층으로 위임한다.
    return this.dealApplicationService.countDealsByStatus(currentUser);
  }

  // API : 딜, 딜 목록 조회
  @Get()
  listDeals(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListDealsQueryDto
  ) {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달한다.
    return this.dealApplicationService.listDeals(currentUser, query);
  }

  // API : 딜, 검색과 필터가 반영된 딜 목록 xlsx 내보내기
  @Get("export/xlsx")
  async exportDealsXlsx(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ExportDealsQueryDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달해 xlsx 파일을 생성한다.
    const file = await this.dealApplicationService.exportDealsXlsx(
      currentUser,
      query
    );

    // 2. 생성된 xlsx 파일 정보를 HTTP 다운로드 응답으로 변환한다.
    return createXlsxDownloadResponse(response, file);
  }

  // API : 딜, 회사 선택 옵션 조회
  @Get("company-options")
  listCompanyOptions(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 회사 옵션 목록 조회를 application 계층으로 위임한다.
    return this.dealApplicationService.listCompanyOptions(currentUser);
  }

  // API : 딜, 담당자 선택 옵션 조회
  @Get("contact-options")
  listContactOptions(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 담당자 옵션 목록 조회를 application 계층으로 위임한다.
    return this.dealApplicationService.listContactOptions(currentUser);
  }

  // API : 딜, 제품 선택 옵션 조회
  @Get("product-options")
  listProductOptions(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 제품 옵션 목록 조회를 application 계층으로 위임한다.
    return this.dealApplicationService.listProductOptions(currentUser);
  }

  // API : 딜, 딜 단건 상세 조회
  @Get(":dealId")
  getDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string
  ) {
    // 1. path param의 딜 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.dealApplicationService.getDeal(currentUser, dealId);
  }

  // API : 딜, 딜 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateDealDto
  ) {
    // 1. request body와 현재 사용자를 application 계층으로 전달한다.
    return this.dealApplicationService.createDeal(currentUser, body);
  }

  // API : 딜, 딜 기본 정보 수정
  @Patch(":dealId")
  updateDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string,
    @Body() body: UpdateDealDto
  ) {
    // 1. path param, request body, 현재 사용자를 application 계층으로 전달한다.
    return this.dealApplicationService.updateDeal(currentUser, dealId, body);
  }

  // API : 딜 다음 행동, 로그 목록 조회
  @Get(":dealId/following-action-logs")
  listFollowingActionLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string
  ) {
    // 1. 딜 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.dealApplicationService.listFollowingActionLogs(
      currentUser,
      dealId
    );
  }

  // API : 딜 다음 행동, 로그 생성
  @Post(":dealId/following-action-logs")
  @HttpCode(HttpStatus.CREATED)
  createFollowingActionLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string,
    @Body() body: CreateDealFollowingActionLogDto
  ) {
    // 1. 딜 ID와 다음 행동 생성 요청을 application 계층으로 전달한다.
    return this.dealApplicationService.createFollowingActionLog(
      currentUser,
      dealId,
      body
    );
  }

  // API : 딜 다음 행동, 로그 수정
  @Patch(":dealId/following-action-logs/:followingActionLogId")
  updateFollowingActionLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string,
    @Param("followingActionLogId", ParseUUIDPipe) followingActionLogId: string,
    @Body() body: UpdateDealFollowingActionLogDto
  ) {
    // 1. 딜 ID, 다음 행동 로그 ID, 수정 본문을 application 계층으로 전달한다.
    return this.dealApplicationService.updateFollowingActionLog(
      currentUser,
      dealId,
      followingActionLogId,
      body
    );
  }

  // API : 딜 메모, 로그 목록 조회
  @Get(":dealId/memo-logs")
  listMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string
  ) {
    // 1. 딜 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.dealApplicationService.listMemoLogs(currentUser, dealId);
  }

  // API : 딜 메모, 로그 생성
  @Post(":dealId/memo-logs")
  @HttpCode(HttpStatus.CREATED)
  createMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string,
    @Body() body: CreateDealMemoLogDto
  ) {
    // 1. 딜 ID와 메모 생성 요청을 application 계층으로 전달한다.
    return this.dealApplicationService.createMemoLog(currentUser, dealId, body);
  }

  // API : 딜 메모, 로그 수정
  @Patch(":dealId/memo-logs/:memoLogId")
  updateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId", ParseUUIDPipe) dealId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string,
    @Body() body: UpdateDealMemoLogDto
  ) {
    // 1. 딜 ID, 메모 로그 ID, 수정 본문을 application 계층으로 전달한다.
    return this.dealApplicationService.updateMemoLog(
      currentUser,
      dealId,
      memoLogId,
      body
    );
  }
}
