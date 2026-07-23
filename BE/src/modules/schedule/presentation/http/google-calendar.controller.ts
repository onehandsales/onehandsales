import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { GoogleCalendarConnectionService } from "@/modules/schedule/application/services/google-calendar-connection.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  DisconnectGoogleCalendarDto,
  HandleGoogleCalendarCallbackQueryDto,
  StartGoogleCalendarConnectDto,
} from "./dto/google-calendar-request.dto";

@UseGuards(AuthGuard)
@Controller("api/schedules/google")
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarConnectionService: GoogleCalendarConnectionService
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
