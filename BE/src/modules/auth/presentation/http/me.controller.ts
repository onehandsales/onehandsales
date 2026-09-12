import { Controller, Get, UseGuards } from "@nestjs/common";
import { GetMeUseCase } from "@/modules/auth/application/use-cases/get-me.use-case";
import {
  toAdminMeResponse,
  toMeResponse,
} from "@/modules/auth/application/auth-response";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";

// 역할 : MeController HTTP API 요청을 받아 application 계층으로 위임합니다.
@Controller("api/me")
export class MeController {
  // 기능 : 사용자 내 정보 조회 유스케이스를 주입받습니다.
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  // 기능 : get Me 값을 조회합니다.
  @UseGuards(AuthGuard)
  // API : 사용자, 현재 사용자 조회
  @Get()
  async getMe(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. application 계층에 현재 사용자 조회를 위임한다.
    return toMeResponse(await this.getMeUseCase.execute(currentUser));
  }
}

// 역할 : AdminMeController HTTP API 요청을 받아 application 계층으로 위임합니다.
@Controller("admin/api/me")
export class AdminMeController {
  // 기능 : 관리자 내 정보 조회 유스케이스를 주입받습니다.
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  // 기능 : get Admin Me 값을 조회합니다.
  @UseGuards(AuthGuard, AdminGuard)
  // API : 관리자, 현재 관리자 조회
  @Get()
  async getAdminMe(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. application 계층에 현재 관리자 조회를 위임한다.
    return toAdminMeResponse(await this.getMeUseCase.execute(currentUser));
  }
}

