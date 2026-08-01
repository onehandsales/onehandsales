import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { AdminAccountRequestApplicationService } from "@/modules/admin-operation/application/services/admin-account-request-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import {
  ListAdminAccountDeletionRequestsQueryDto,
  ListAdminDataExportRequestsQueryDto,
} from "./dto/admin-account-request.dto";

// 역할 : AdminAccountRequestController 계정 삭제와 데이터 export 운영 queue HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api")
export class AdminAccountRequestController {
  // 기능 : Admin 계정 데이터 요청 application service를 주입받습니다.
  constructor(
    private readonly accountRequestService: AdminAccountRequestApplicationService
  ) {}

  // API : Admin, 계정 삭제 요청 queue 조회
  @Get("account-deletion-requests")
  listAccountDeletionRequests(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListAdminAccountDeletionRequestsQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 query 조건, request id를 application 계층으로 전달합니다.
    return this.accountRequestService.listAccountDeletionRequests(
      currentUser,
      query,
      {
        requestId: request.requestId,
      }
    );
  }

  // API : Admin, 데이터 export 요청 queue 조회
  @Get("data-export-requests")
  listDataExportRequests(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListAdminDataExportRequestsQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 query 조건, request id를 application 계층으로 전달합니다.
    return this.accountRequestService.listDataExportRequests(
      currentUser,
      query,
      {
        requestId: request.requestId,
      }
    );
  }
}
