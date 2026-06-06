import { Body, Controller, Delete, Get, Patch, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { DeleteMyAccountUseCase } from "@/modules/user/application/use-cases/delete-my-account.use-case";
import { GetMySettingsUseCase } from "@/modules/user/application/use-cases/get-my-settings.use-case";
import { UpdateMySettingsUseCase } from "@/modules/user/application/use-cases/update-my-settings.use-case";
import { AuthCookieService } from "@/modules/auth/presentation/http/auth-cookie.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UpdateMySettingsDto } from "./dto/update-my-settings.dto";

@UseGuards(AuthGuard)
@Controller("api/users/me")
export class UserMeController {
  constructor(
    private readonly getMySettingsUseCase: GetMySettingsUseCase,
    private readonly updateMySettingsUseCase: UpdateMySettingsUseCase,
    private readonly deleteMyAccountUseCase: DeleteMyAccountUseCase,
    private readonly authCookieService: AuthCookieService
  ) {}

  @Get("settings")
  getSettings(@CurrentUser() currentUser: CurrentUserContext) {
    return this.getMySettingsUseCase.execute(currentUser);
  }

  @Patch("settings")
  updateSettings(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateMySettingsDto
  ) {
    return this.updateMySettingsUseCase.execute(currentUser, body);
  }

  @Delete()
  async deleteMyAccount(
    @CurrentUser() currentUser: CurrentUserContext,
    @Res({ passthrough: true }) response: Response
  ) {
    const deletedUser = await this.deleteMyAccountUseCase.execute(currentUser);
    this.authCookieService.clearRefreshToken(response);

    return {
      id: deletedUser.id,
      status: deletedUser.status,
      deletedAt: deletedUser.deletedAt.toISOString(),
      permanentDeleteAt: deletedUser.permanentDeleteAt.toISOString(),
    };
  }
}

