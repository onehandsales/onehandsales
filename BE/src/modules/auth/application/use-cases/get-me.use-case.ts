import { Inject, Injectable } from "@nestjs/common";
import {
  AUTH_REPOSITORY,
  type AuthMeRecord,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  async execute(currentUser: CurrentUserContext): Promise<AuthMeRecord> {
    const me = await this.authRepository.getMe(currentUser.id);

    if (!me || me.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    return me;
  }
}

