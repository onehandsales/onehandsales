import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AdminSensitiveUseCase } from "@/modules/admin/application/use-cases/admin-sensitive.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  AdminAuditLogListDto,
  AdminSensitiveRawByPathDto,
  AdminSensitiveRawDto,
} from "./dto/admin-sensitive.dto";

type AdminRequest = Request & {
  currentUser: CurrentUserContext;
};

@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api")
export class AdminSensitiveController {
  constructor(private readonly adminSensitiveUseCase: AdminSensitiveUseCase) {}

  @Post("sensitive/raw")
  viewSensitiveRawData(
    @Req() request: AdminRequest,
    @Body() body: AdminSensitiveRawDto
  ) {
    return this.adminSensitiveUseCase.viewSensitiveRawData(
      getActorContext(request),
      body
    );
  }

  @Post("deals/:dealId/sensitive/raw")
  viewDealSensitiveRawData(
    @Req() request: AdminRequest,
    @Param("dealId") dealId: string,
    @Body() body: AdminSensitiveRawByPathDto
  ) {
    return this.adminSensitiveUseCase.viewDealSensitiveRawData(
      getActorContext(request),
      dealId,
      body
    );
  }

  @Post("meeting-notes/:meetingNoteId/sensitive/raw")
  viewMeetingNoteSensitiveRawData(
    @Req() request: AdminRequest,
    @Param("meetingNoteId") meetingNoteId: string,
    @Body() body: AdminSensitiveRawByPathDto
  ) {
    return this.adminSensitiveUseCase.viewMeetingNoteSensitiveRawData(
      getActorContext(request),
      meetingNoteId,
      body
    );
  }

  @Get("audit-logs")
  listAuditLogs(@Query() query: AdminAuditLogListDto) {
    return this.adminSensitiveUseCase.listAuditLogs(query);
  }

  @Get("audit-logs/:auditLogId")
  getAuditLog(@Param("auditLogId") auditLogId: string) {
    return this.adminSensitiveUseCase.getAuditLog(auditLogId);
  }
}

function getActorContext(request: AdminRequest) {
  return {
    actorUserId: request.currentUser.id,
    ipAddress: getIpAddress(request),
    userAgent: request.header("user-agent") ?? null,
  };
}

function getIpAddress(request: Request) {
  const forwardedFor = request.header("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.ip ?? null;
}
