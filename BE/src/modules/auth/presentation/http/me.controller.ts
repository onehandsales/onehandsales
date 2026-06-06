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

@Controller("api/me")
export class MeController {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @UseGuards(AuthGuard)
  @Get()
  async getMe(@CurrentUser() currentUser: CurrentUserContext) {
    return toMeResponse(await this.getMeUseCase.execute(currentUser));
  }
}

@Controller("admin/api/me")
export class AdminMeController {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  async getAdminMe(@CurrentUser() currentUser: CurrentUserContext) {
    return toAdminMeResponse(await this.getMeUseCase.execute(currentUser));
  }
}

