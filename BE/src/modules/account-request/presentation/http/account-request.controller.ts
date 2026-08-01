import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { AccountRequestApplicationService } from "@/modules/account-request/application/services/account-request-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateMyAccountDeletionRequestDto,
  CreateMyDataExportRequestDto,
} from "./dto/account-request.dto";

// 역할 : AccountRequestController 사용자 데이터 export와 계정 삭제 요청 HTTP API를 처리합니다.
@UseGuards(AuthGuard)
@Controller("api/users/me")
export class AccountRequestController {
  // 기능 : 계정 데이터 요청 application service를 주입받습니다.
  constructor(
    private readonly accountRequestService: AccountRequestApplicationService
  ) {}

  // API : 사용자, 내 데이터 export 요청 생성
  @Post("data-export-requests")
  @HttpCode(HttpStatus.CREATED)
  createMyDataExportRequest(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMyDataExportRequestDto
  ) {
    // 1. 현재 사용자와 export 옵션을 application 계층으로 전달합니다.
    return this.accountRequestService.createMyDataExportRequest(
      currentUser,
      body
    );
  }

  // API : 사용자, 내 데이터 export 요청 상태 조회
  @Get("data-export-requests/:requestId")
  getMyDataExportRequest(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("requestId") requestId: string
  ) {
    // 1. 현재 사용자와 요청 ID를 application 계층으로 전달합니다.
    return this.accountRequestService.getMyDataExportRequest(
      currentUser,
      requestId
    );
  }

  // API : 사용자, 내 계정 삭제 요청 생성
  @Post("account-deletion-requests")
  @HttpCode(HttpStatus.CREATED)
  createMyAccountDeletionRequest(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMyAccountDeletionRequestDto
  ) {
    // 1. 현재 사용자와 삭제 확인 body를 application 계층으로 전달합니다.
    return this.accountRequestService.createMyAccountDeletionRequest(
      currentUser,
      body
    );
  }

  // API : 사용자, 내 계정 삭제 요청 취소
  @Post("account-deletion-requests/:requestId/cancel")
  @HttpCode(HttpStatus.CREATED)
  cancelMyAccountDeletionRequest(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("requestId") requestId: string
  ) {
    // 1. 현재 사용자와 취소할 요청 ID를 application 계층으로 전달합니다.
    return this.accountRequestService.cancelMyAccountDeletionRequest(
      currentUser,
      requestId
    );
  }
}
