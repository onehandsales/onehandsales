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
import { ScheduleApplicationService } from "@/modules/schedule/application/services/schedule-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { createXlsxDownloadResponse } from "@/shared/presentation/http/download-file-response";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateScheduleDto,
  ExportWeeklyScheduleReportXlsxQueryDto,
  GetWeeklyScheduleReportQueryDto,
  ListSchedulesQueryDto,
  UpdateScheduleDto,
} from "./dto/schedule-request.dto";

// 역할 : ScheduleController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/schedules")
export class ScheduleController {
  // 기능 : 일정 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly scheduleApplicationService: ScheduleApplicationService
  ) {}

  // API : 일정, 연결용 딜 옵션 전체 목록 조회
  @Get("deal-options")
  listDealOptions(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 일정 연결용 딜 옵션 조회를 application 계층으로 위임한다.
    return this.scheduleApplicationService.listDealOptions(currentUser);
  }

  // API : 일정, 월간 또는 주간 일정 목록 조회
  @Get()
  listSchedules(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListSchedulesQueryDto
  ) {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달한다.
    return this.scheduleApplicationService.listSchedules(currentUser, query);
  }

  // API : 일정, 주간 보고서 xlsx 다운로드
  @Get("week/export/xlsx")
  async exportWeeklyScheduleReportXlsx(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ExportWeeklyScheduleReportXlsxQueryDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달해 xlsx 파일을 생성합니다.
    const file =
      await this.scheduleApplicationService.exportWeeklyScheduleReportXlsx(
        currentUser,
        query
      );

    // 2. 생성된 xlsx 파일 정보를 HTTP 다운로드 응답으로 변환합니다.
    return createXlsxDownloadResponse(response, file);
  }

  // API : 일정, 주간 보고서 조회
  @Get("week")
  getWeeklyScheduleReport(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GetWeeklyScheduleReportQueryDto
  ) {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달합니다.
    return this.scheduleApplicationService.getWeeklyScheduleReport(
      currentUser,
      query
    );
  }

  // API : 일정, 단건 상세 조회
  @Get(":scheduleId")
  getSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scheduleId", ParseUUIDPipe) scheduleId: string
  ) {
    // 1. path param의 일정 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.scheduleApplicationService.getSchedule(currentUser, scheduleId);
  }

  // API : 일정, 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateScheduleDto
  ) {
    // 1. request body와 현재 사용자를 application 계층으로 전달한다.
    return this.scheduleApplicationService.createSchedule(currentUser, body);
  }

  // API : 일정, 단건 수정
  @Patch(":scheduleId")
  updateSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scheduleId", ParseUUIDPipe) scheduleId: string,
    @Body() body: UpdateScheduleDto
  ) {
    // 1. path param, request body, 현재 사용자를 application 계층으로 전달한다.
    return this.scheduleApplicationService.updateSchedule(
      currentUser,
      scheduleId,
      body
    );
  }

  // API : 일정, 실제 삭제
  @Delete(":scheduleId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSchedule(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("scheduleId", ParseUUIDPipe) scheduleId: string
  ): Promise<void> {
    // 1. path param의 일정 ID와 현재 사용자를 application 계층으로 전달해 실제 삭제한다.
    await this.scheduleApplicationService.deleteSchedule(currentUser, scheduleId);
  }
}
