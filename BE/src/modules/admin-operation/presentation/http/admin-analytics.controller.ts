import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { AdminAnalyticsApplicationService } from "@/modules/admin-operation/application/services/admin-analytics-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { GetAdminAnalyticsOverviewQueryDto } from "./dto/admin-analytics-request.dto";
import { toAdminAnalyticsOverviewResponse } from "./admin-analytics-response.mapper";

// 역할 : AdminAnalyticsController Admin analytics 운영 overview HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api/analytics")
export class AdminAnalyticsController {
  // 기능 : Admin analytics application service를 주입받습니다.
  constructor(private readonly analyticsService: AdminAnalyticsApplicationService) {}

  // API : Admin analytics overview 조회
  @Get("overview")
  async getAnalyticsOverview(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GetAdminAnalyticsOverviewQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 query 조건, request id를 application 계층으로 전달합니다.
    const overview = await this.analyticsService.getAnalyticsOverview(
      currentUser,
      query,
      {
        requestId: request.requestId,
      }
    );

    // 2. application overview를 Admin API 응답 계약으로 변환합니다.
    return toAdminAnalyticsOverviewResponse(overview);
  }
}
