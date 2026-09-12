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

// 역할 : AuthGuard 요청의 인증 또는 권한 접근 조건을 검증합니다.
@Injectable()
export class AuthGuard implements CanActivate {
  // 기능 : access token에서 현재 사용자를 해석할 resolver를 주입받습니다.
  constructor(
    @Inject(CURRENT_USER_RESOLVER)
    private readonly currentUserResolver: CurrentUserResolver
  ) {}

  // 기능 : 요청의 Bearer 토큰을 검증하고 currentUser를 요청 객체에 저장합니다.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 이후 처리에 사용할 request을 계산한다.
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    // 2. 이후 처리에 사용할 accessToken을 계산한다.
    const accessToken = this.getBearerToken(request);
    // 3. 필요한 비동기 작업을 실행한다.
    request.currentUser =
      await this.currentUserResolver.resolveFromAccessToken(accessToken);

    // 4. 계산된 결과를 호출자에게 반환한다.
    return true;
  }

  // 기능 : 요청 Authorization 헤더에서 Bearer 토큰 값을 추출합니다.
  private getBearerToken(request: Request): string {
    // 1. 이후 처리에 사용할 authorization을 계산한다.
    const authorization = request.header("Authorization");

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!authorization) {
      throw new UnauthorizedException("Missing Authorization header");
    }

    // 3. 이후 처리에 사용할 [scheme, token]을 계산한다.
    const [scheme, token] = authorization.split(" ");

    // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid Authorization header");
    }

    // 5. 계산된 결과를 호출자에게 반환한다.
    return token;
  }
}

