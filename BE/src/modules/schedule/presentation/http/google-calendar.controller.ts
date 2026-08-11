import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { GoogleCalendarConnectionService } from "@/modules/schedule/application/services/google-calendar-connection.service";
import { GoogleCalendarSyncService } from "@/modules/schedule/application/services/google-calendar-sync.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  DisconnectGoogleCalendarDto,
  HandleGoogleCalendarCallbackQueryDto,
  StartGoogleCalendarConnectDto,
  SyncGoogleCalendarDto,
  UpdateGoogleCalendarSelectionDto,
} from "./dto/google-calendar-request.dto";

// 역할 : Google Calendar 연결, 캘린더 선택, 동기화 API를 제공합니다.
@UseGuards(AuthGuard)
@Controller("api/schedules/google")
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarConnectionService: GoogleCalendarConnectionService,
    private readonly googleCalendarSyncService: GoogleCalendarSyncService
  ) {}

  // API : Google Calendar, 연결 시작
  @Post("connect")
  startConnect(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: StartGoogleCalendarConnectDto
  ) {
    // 1. 현재 사용자와 연결 시작 요청을 application 계층에 전달한다.
    return this.googleCalendarConnectionService.startConnect(currentUser, body);
  }

  // API : Google Calendar, 연결 상태 조회
  @Get("status")
  getStatus(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 Google Calendar 연결 상태 조회를 위임한다.
    return this.googleCalendarConnectionService.getStatus(currentUser);
  }

  // API : Google Calendar, 연결 해제
  @Post("disconnect")
  disconnect(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: DisconnectGoogleCalendarDto
  ) {
    // 1. 현재 사용자와 연결 해제 요청을 application 계층에 전달한다.
    return this.googleCalendarConnectionService.disconnect(currentUser, body);
  }

  // API : Google Calendar, 캘린더 목록 조회
  @Get("calendars")
  listCalendars(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 연결된 캘린더 목록 조회를 application 계층에 위임한다.
    return this.googleCalendarSyncService.listCalendars(currentUser);
  }

  // API : Google Calendar, 동기화 캘린더 선택 변경
  @Patch("calendars")
  updateCalendarSelection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateGoogleCalendarSelectionDto
  ) {
    // 1. 현재 사용자와 캘린더 선택 변경 요청을 application 계층에 전달한다.
    return this.googleCalendarSyncService.updateCalendarSelection(
      currentUser,
      body
    );
  }

  // API : Google Calendar, 캘린더 수동 동기화
  @Post("sync")
  syncCalendars(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: SyncGoogleCalendarDto
  ) {
    // 1. 현재 사용자와 동기화 요청 조건을 application 계층에 전달한다.
    return this.googleCalendarSyncService.syncCalendars(currentUser, body);
  }
}

// 역할 : Google OAuth callback을 처리하고 사용자 redirect를 수행합니다.
@Controller("api/schedules/google")
export class GoogleCalendarCallbackController {
  constructor(
    private readonly googleCalendarConnectionService: GoogleCalendarConnectionService
  ) {}

  // API : Google Calendar, OAuth callback 처리
  @Get("callback")
  async handleCallback(
    @Query() query: HandleGoogleCalendarCallbackQueryDto,
    @Res() response: Response
  ) {
    // 1. callback query 처리를 application 계층에 위임한다.
    const result = await this.googleCalendarConnectionService.handleCallback(
      query
    );

    // 2. application 계층이 결정한 사용자 화면으로 redirect한다.
    return response.redirect(result.redirectTo);
  }
}
