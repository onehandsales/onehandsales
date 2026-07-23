import { IsIn, IsOptional, IsString } from "class-validator";
import type { GoogleCalendarDisconnectScheduleAction } from "@/modules/schedule/application/ports/google-calendar-connection.repository";

const DISCONNECT_SCHEDULE_ACTIONS = [
  "KEEP",
  "HIDE",
  "TRASH",
] as const satisfies readonly GoogleCalendarDisconnectScheduleAction[];

export class StartGoogleCalendarConnectDto {
  @IsOptional()
  @IsString()
  returnTo?: string;
}

export class HandleGoogleCalendarCallbackQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  error?: string;
}

export class DisconnectGoogleCalendarDto {
  @IsOptional()
  @IsIn(DISCONNECT_SCHEDULE_ACTIONS)
  scheduleAction?: GoogleCalendarDisconnectScheduleAction;
}
