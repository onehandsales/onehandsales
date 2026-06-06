import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserRepository,
  type UserSettingRecord,
} from "@/modules/user/application/ports/user.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class GetMySettingsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(currentUser: CurrentUserContext): Promise<UserSettingRecord> {
    return this.userRepository.getOrCreateSetting(currentUser.id);
  }
}

