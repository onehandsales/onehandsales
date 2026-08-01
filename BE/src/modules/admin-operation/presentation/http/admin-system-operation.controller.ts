import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AdminSystemOperationApplicationService } from "@/modules/admin-operation/application/services/admin-system-operation-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { CreateAdminOperationCheckRunDto } from "./dto/admin-system-operation.dto";

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
  getLatestOperationCheckRun(
    @CurrentUser() currentUser: CurrentUserContext,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 request id를 application 계층으로 전달합니다.
    return this.systemOperationService.getLatestOperationCheckRun(currentUser, {
      requestId: request.requestId,
    });
  }

  // API : Admin, 운영 gate 점검 기록 생성
  @Post("operation-checks")
  @HttpCode(HttpStatus.CREATED)
  createOperationCheckRun(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateAdminOperationCheckRunDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 점검 body, request id를 application 계층으로 전달합니다.
    return this.systemOperationService.createOperationCheckRun(
      currentUser,
      body,
      {
        requestId: request.requestId,
      }
    );
  }
}
