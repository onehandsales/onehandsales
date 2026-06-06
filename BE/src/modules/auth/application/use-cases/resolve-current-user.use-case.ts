import { Inject, Injectable } from "@nestjs/common";
import {
  APP_TOKEN_ISSUER,
  type AppTokenIssuer,
} from "@/modules/auth/application/ports/app-token.port";
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from "@/modules/auth/application/ports/auth.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { UnauthorizedError } from "@/shared/domain/errors/common.errors";

@Injectable()
export class ResolveCurrentUserUseCase {
  constructor(
    @Inject(APP_TOKEN_ISSUER)
    private readonly appTokenIssuer: AppTokenIssuer,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  async resolveFromAccessToken(accessToken: string): Promise<CurrentUserContext> {
    const payload = await this.appTokenIssuer.verifyAccessToken(accessToken);
    const record = await this.authRepository.findSessionByIdWithUser(
      payload.sessionId
    );

    if (!record || record.session.userId !== payload.userId) {
      throw new UnauthorizedError("Invalid session");
    }

    if (
      record.session.status !== "ACTIVE" ||
      record.session.revokedAt ||
      record.session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedError("Expired session");
    }

    if (record.user.status !== "ACTIVE") {
      throw new InactiveUserError();
    }

    return record.user;
  }
}

