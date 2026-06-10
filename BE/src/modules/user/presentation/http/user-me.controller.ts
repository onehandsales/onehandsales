import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { GetMyProfileUseCase } from "@/modules/user/application/use-cases/get-my-profile.use-case";
import { ListMyDevicesUseCase } from "@/modules/user/application/use-cases/list-my-devices.use-case";
import { UpdateMyProfileUseCase } from "@/modules/user/application/use-cases/update-my-profile.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { UpdateMyProfileDto } from "./dto/update-my-profile.dto";

@UseGuards(AuthGuard)
@Controller("api/users/me")
export class UserMeController {
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly listMyDevicesUseCase: ListMyDevicesUseCase
  ) {}

  @Get("profile")
  getProfile(@CurrentUser() currentUser: CurrentUserContext) {
    return this.getMyProfileUseCase.execute(currentUser);
  }

  @Patch("profile")
  updateProfile(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: UpdateMyProfileDto
  ) {
    return this.updateMyProfileUseCase.execute(currentUser, body);
  }

  @Get("devices")
  listDevices(@CurrentUser() currentUser: CurrentUserContext) {
    return this.listMyDevicesUseCase.execute(currentUser);
  }
}

