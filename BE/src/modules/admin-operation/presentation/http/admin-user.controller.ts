import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminUserApplicationService } from "@/modules/admin-operation/application/services/admin-user-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import {
  ListAdminUserActivityTimelineQueryDto,
  ListAdminUsersQueryDto,
} from "./dto/admin-user-request.dto";
import {
  toAdminUserActivityTimelineResponse,
  toAdminUserListResponse,
  toAdminUserOverviewResponse,
} from "./admin-user-response.mapper";

// 역할 : AdminUserController Admin 사용자 목록, 상세, 활동 timeline HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api/users")
export class AdminUserController {
  // 기능 : Admin 사용자 application service를 주입받습니다.
  constructor(private readonly adminUserService: AdminUserApplicationService) {}

  // API : Admin 사용자 목록 조회
  @Get()
  async listUsers(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListAdminUsersQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 query 조건, request id를 application 계층으로 전달합니다.
    const page = await this.adminUserService.listUsers(currentUser, query, {
      requestId: request.requestId,
    });

    // 2. application page를 Admin API 응답 계약으로 변환합니다.
    return toAdminUserListResponse(page);
  }

  // API : Admin 사용자 상세 요약 조회
  @Get(":userId")
  async getUserOverview(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("userId", ParseUUIDPipe) userId: string,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 사용자 ID, request id를 application 계층으로 전달합니다.
    const overview = await this.adminUserService.getUserOverview(
      currentUser,
      userId,
      {
        requestId: request.requestId,
      }
    );

    // 2. application overview를 Admin API 응답 계약으로 변환합니다.
    return toAdminUserOverviewResponse(overview);
  }

  // API : Admin 사용자 활동 timeline 조회
  @Get(":userId/activity-timeline")
  async listActivityTimeline(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query() query: ListAdminUserActivityTimelineQueryDto
  ) {
    // 1. 현재 관리자와 사용자 ID, timeline query를 application 계층으로 전달합니다.
    const page = await this.adminUserService.listActivityTimeline(
      currentUser,
      userId,
      query
    );

    // 2. application page를 Admin API 응답 계약으로 변환합니다.
    return toAdminUserActivityTimelineResponse(page);
  }
}
