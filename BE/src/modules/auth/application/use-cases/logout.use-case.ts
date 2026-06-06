import { Inject, Injectable } from "@nestjs/common";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  async execute(currentUser: CurrentUserContext): Promise<{ success: true }> {
    await this.authRepository.revokeSession(currentUser.sessionId, new Date());

    return { success: true };
  }
}

