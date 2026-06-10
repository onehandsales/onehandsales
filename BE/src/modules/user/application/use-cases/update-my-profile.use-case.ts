import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UpdateUserProfileInput,
  type UserProfileRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class UpdateMyProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    currentUser: CurrentUserContext,
    input: UpdateUserProfileInput
  ): Promise<UserProfileRecord> {
    const profile = await this.userRepository.updateProfile(currentUser.id, {
      name: this.normalizeName(input.name),
    });

    if (!profile || profile.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    return profile;
  }

  private normalizeName(name: string | null | undefined): string | null | undefined {
    if (name === undefined) {
      return undefined;
    }

    if (name === null) {
      return null;
    }

    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
