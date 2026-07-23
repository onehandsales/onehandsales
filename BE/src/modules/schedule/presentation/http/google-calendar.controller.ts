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

@UseGuards(AuthGuard)
@Controller("api/schedules/google")
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarConnectionService: GoogleCalendarConnectionService,
    private readonly googleCalendarSyncService: GoogleCalendarSyncService
  ) {}

  @Post("connect")
  startConnect(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: StartGoogleCalendarConnectDto
  ) {
    return this.googleCalendarConnectionService.startConnect(currentUser, body);
  }

  @Get("status")
  getStatus(@CurrentUser() currentUser: CurrentUserContext) {
    return this.googleCalendarConnectionService.getStatus(currentUser);
  }

  @Post("disconnect")
  disconnect(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: DisconnectGoogleCalendarDto
  ) {
    return this.googleCalendarConnectionService.disconnect(currentUser, body);
  }

  @Get("calendars")
  listCalendars(@CurrentUser() currentUser: CurrentUserContext) {
    return this.googleCalendarSyncService.listCalendars(currentUser);
  }

  @Patch("calendars")
  updateCalendarSelection(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateGoogleCalendarSelectionDto
  ) {
    return this.googleCalendarSyncService.updateCalendarSelection(
      currentUser,
      body
    );
  }

  @Post("sync")
  syncCalendars(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: SyncGoogleCalendarDto
  ) {
    return this.googleCalendarSyncService.syncCalendars(currentUser, body);
  }
}

@Controller("api/schedules/google")
export class GoogleCalendarCallbackController {
  constructor(
    private readonly googleCalendarConnectionService: GoogleCalendarConnectionService
  ) {}

  @Get("callback")
  async handleCallback(
    @Query() query: HandleGoogleCalendarCallbackQueryDto,
    @Res() response: Response
  ) {
    const result = await this.googleCalendarConnectionService.handleCallback(
      query
    );

    return response.redirect(result.redirectTo);
  }
}
