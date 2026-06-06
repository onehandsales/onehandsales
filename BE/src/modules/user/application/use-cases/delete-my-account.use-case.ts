import { Inject, Injectable } from "@nestjs/common";
import {
  type DeletedUserRecord,
  USER_REPOSITORY,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class DeleteMyAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(currentUser: CurrentUserContext): Promise<DeletedUserRecord> {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return this.userRepository.softDeleteUserAndRevokeSessions(
      currentUser.id,
      now,
      permanentDeleteAt
    );
  }
}

