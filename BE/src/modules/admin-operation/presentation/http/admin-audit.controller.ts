import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminAuditApplicationService } from "@/modules/admin-operation/application/services/admin-audit-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import {
  AdminSensitiveRawAccessRequestDto,
  ListAdminAuditLogsQueryDto,
} from "./dto/admin-audit-request.dto";
import {
  toAdminAuditLogListResponse,
  toAdminSensitiveRawAccessResponse,
} from "./admin-audit-response.mapper";

// 역할 : AdminAuditController Admin 감사 로그와 민감 원문 조회 HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api")
export class AdminAuditController {
  // 기능 : Admin 감사 application service를 주입받습니다.
  constructor(private readonly adminAuditService: AdminAuditApplicationService) {}

  // API : Admin 감사 로그 목록 조회
  @Get("audit-logs")
  async listAuditLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListAdminAuditLogsQueryDto
  ) {
    // 1. 현재 관리자와 query 조건을 application 계층으로 전달합니다.
    const page = await this.adminAuditService.listAuditLogs(currentUser, query);

    // 2. application page를 Admin API 응답 계약으로 변환합니다.
    return toAdminAuditLogListResponse(page);
  }

  // API : Admin 민감 원문 조회
  @Post("sensitive/raw-access")
  @HttpCode(HttpStatus.OK)
  async accessSensitiveRawData(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: AdminSensitiveRawAccessRequestDto,
    @Req() request: RequestWithRequestId
  ) {
    const ipAddress = request.ip;
    const userAgent = request.header("user-agent");

    // 1. 요청 추적 metadata와 body를 application 계층으로 전달합니다.
    const result = await this.adminAuditService.accessSensitiveRawData(
      currentUser,
      body,
      {
        requestId: request.requestId,
        ...(ipAddress ? { ipAddress } : {}),
        ...(userAgent ? { userAgent } : {}),
      }
    );

    // 2. application 결과를 Admin API 응답 계약으로 변환합니다.
    return toAdminSensitiveRawAccessResponse(result.accessLog, result.rawData);
  }
}
