import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AdminSystemOperationApplicationService } from "@/modules/admin-operation/application/services/admin-system-operation-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CreateAdminOperationCheckRunDto } from "./dto/admin-system-operation.dto";
import { toAdminOperationCheckRunResponse } from "./admin-system-operation-response.mapper";

// 역할 : AdminSystemOperationController 운영 gate 점검 HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api/system")
export class AdminSystemOperationController {
  // 기능 : Admin 운영 gate application service를 주입받습니다.
  constructor(
    private readonly systemOperationService: AdminSystemOperationApplicationService
  ) {}

  // API : Admin, 운영 gate 최신 점검 조회
  @Get("operation-checks/latest")
  async getLatestOperationCheckRun(
    @CurrentUser() currentUser: CurrentUserContext,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 request id를 application 계층으로 전달합니다.
    const run = await this.systemOperationService.getLatestOperationCheckRun(
      currentUser,
      {
        requestId: request.requestId,
      }
    );

    // 2. application run을 Admin API 응답 계약으로 변환하되, 최신 기록이 없으면 null을 유지합니다.
    return run ? toAdminOperationCheckRunResponse(run) : null;
  }

  // API : Admin, 운영 gate 점검 기록 생성
  @Post("operation-checks")
  @HttpCode(HttpStatus.CREATED)
  async createOperationCheckRun(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateAdminOperationCheckRunDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 점검 body, request id를 application 계층으로 전달합니다.
    const run = await this.systemOperationService.createOperationCheckRun(
      currentUser,
      body,
      {
        requestId: request.requestId,
      }
    );

    // 2. application run을 Admin API 응답 계약으로 변환합니다.
    return toAdminOperationCheckRunResponse(run);
  }
}
