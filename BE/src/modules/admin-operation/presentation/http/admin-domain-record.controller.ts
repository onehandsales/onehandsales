import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminDomainRecordApplicationService } from "@/modules/admin-operation/application/services/admin-domain-record-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { RequestWithRequestId } from "@/shared/presentation/middleware/request-id.middleware";
import { ListAdminDomainRecordsQueryDto } from "./dto/admin-domain-record-request.dto";

// 역할 : AdminDomainRecordController Admin 사용자 도메인 read-only HTTP 요청을 처리합니다.
@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api/users/:userId/domain-records")
export class AdminDomainRecordController {
  // 기능 : Admin 도메인 read-only application service를 주입받습니다.
  constructor(
    private readonly adminDomainRecordService: AdminDomainRecordApplicationService
  ) {}

  // API : Admin 사용자 도메인 read-only 목록 조회
  @Get()
  listDomainRecords(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query() query: ListAdminDomainRecordsQueryDto,
    @Req() request: RequestWithRequestId
  ) {
    // 1. 현재 관리자와 사용자 ID, query 조건, request id를 application 계층으로 전달합니다.
    return this.adminDomainRecordService.listDomainRecords(
      currentUser,
      userId,
      query,
      { requestId: request.requestId }
    );
  }
}
