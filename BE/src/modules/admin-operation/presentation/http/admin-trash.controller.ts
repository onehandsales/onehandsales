import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminTrashApplicationService } from "@/modules/admin-operation/application/services/admin-trash-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import {
  ListAdminTrashRecoveryRequestsQueryDto,
  ListAdminTrashRecordsQueryDto,
} from "./dto/admin-trash-request.dto";

// 역할 : AdminTrashController Admin Trash 운영 조회 HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api")
export class AdminTrashController {
  // 기능 : Admin Trash application service를 주입받습니다.
  constructor(private readonly adminTrashService: AdminTrashApplicationService) {}

  // API : Admin 사용자 Trash summary 조회
  @Get("users/:userId/trash-summary")
  getUserTrashSummary(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("userId", ParseUUIDPipe) userId: string,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 대상 사용자 ID, request id를 application 계층으로 전달합니다.
    return this.adminTrashService.getUserTrashSummary(currentUser, userId, {
      requestId: request.requestId,
    });
  }

  // API : Admin 사용자 Trash row 목록 조회
  @Get("users/:userId/trash-records")
  listUserTrashRecords(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query() query: ListAdminTrashRecordsQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 대상 사용자 ID, query, request id를 application 계층으로 전달합니다.
    return this.adminTrashService.listUserTrashRecords(
      currentUser,
      userId,
      query,
      { requestId: request.requestId }
    );
  }

  // API : Admin Trash 복구 요청 queue 조회
  @Get("trash/recovery-requests")
  listRecoveryRequests(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListAdminTrashRecoveryRequestsQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 query, request id를 application 계층으로 전달합니다.
    return this.adminTrashService.listRecoveryRequests(currentUser, query, {
      requestId: request.requestId,
    });
  }
}
