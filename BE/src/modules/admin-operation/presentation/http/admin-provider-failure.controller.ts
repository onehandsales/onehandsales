import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { AdminProviderFailureApplicationService } from "@/modules/admin-operation/application/services/admin-provider-failure-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { ListAdminProviderFailuresQueryDto } from "./dto/admin-provider-failure-request.dto";

// 역할 : AdminProviderFailureController Admin provider 실패 운영 조회 HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api/provider-failures")
export class AdminProviderFailureController {
  // 기능 : Admin provider 실패 application service를 주입받습니다.
  constructor(
    private readonly providerFailureService: AdminProviderFailureApplicationService
  ) {}

  // API : Admin provider 실패 목록 조회
  @Get()
  listProviderFailures(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListAdminProviderFailuresQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 query 조건, request id를 application 계층으로 전달합니다.
    return this.providerFailureService.listProviderFailures(
      currentUser,
      query,
      {
        requestId: request.requestId,
      }
    );
  }

  // API : Admin provider 실패 safe 상세 조회
  @Get(":failureId")
  getProviderFailureDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("failureId") failureId: string,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 opaque failure ID, request id를 application 계층으로 전달합니다.
    return this.providerFailureService.getProviderFailureDetail(
      currentUser,
      failureId,
      {
        requestId: request.requestId,
      }
    );
  }
}
