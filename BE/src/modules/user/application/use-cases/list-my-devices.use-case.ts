import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserDeviceRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class ListMyDevicesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(currentUser: CurrentUserContext): Promise<{
    readonly devices: UserDeviceRecord[];
  }> {
    return {
      devices: await this.userRepository.listActiveDevices(
        currentUser.id,
        currentUser.sessionId,
        new Date()
      ),
    };
  }
}
