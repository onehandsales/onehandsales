import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserProfileRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(currentUser: CurrentUserContext): Promise<UserProfileRecord> {
    const profile = await this.userRepository.getProfile(currentUser.id);

    if (!profile || profile.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    return profile;
  }
}
