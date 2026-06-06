import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  CURRENT_USER_RESOLVER,
  type CurrentUserResolver,
} from "@/shared/application/ports/current-user-resolver.port";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CURRENT_USER_RESOLVER)
    private readonly currentUserResolver: CurrentUserResolver
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    const accessToken = this.getBearerToken(request);
    request.currentUser =
      await this.currentUserResolver.resolveFromAccessToken(accessToken);

    return true;
  }

  private getBearerToken(request: Request): string {
    const authorization = request.header("Authorization");

    if (!authorization) {
      throw new UnauthorizedException("Missing Authorization header");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid Authorization header");
    }

    return token;
  }
}

