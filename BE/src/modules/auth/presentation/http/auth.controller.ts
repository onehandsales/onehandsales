import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ExchangeExternalAuthTokenUseCase } from "@/modules/auth/application/use-cases/exchange-external-auth-token.use-case";
import { ListAuthProvidersUseCase } from "@/modules/auth/application/use-cases/list-auth-providers.use-case";
import { LogoutUseCase } from "@/modules/auth/application/use-cases/logout.use-case";
import { RefreshAppTokenUseCase } from "@/modules/auth/application/use-cases/refresh-app-token.use-case";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthCookieService } from "./auth-cookie.service";
import { ExchangeExternalAuthTokenDto } from "./dto/exchange-external-auth-token.dto";

// 역할 : AuthController HTTP API 요청을 받아 application 계층으로 위임합니다.
@Controller("api/auth")
export class AuthController {
  // 기능 : 인증 API에 필요한 유스케이스와 쿠키 서비스를 주입받습니다.
  constructor(
    private readonly listAuthProvidersUseCase: ListAuthProvidersUseCase,
    private readonly exchangeExternalAuthTokenUseCase: ExchangeExternalAuthTokenUseCase,
    private readonly refreshAppTokenUseCase: RefreshAppTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly authCookieService: AuthCookieService
  ) {}

  // API : 인증, 인증 제공자 목록 조회
  @Get("providers")
  listProviders() {
    // 1. application 계층에 인증 제공자 목록 조회를 위임한다.
    return this.listAuthProvidersUseCase.execute();
  }

  // API : 인증, 외부 인증 토큰 앱 세션 교환
  @Post("exchange")
  async exchange(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: ExchangeExternalAuthTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    // 1. Authorization 헤더와 요청 body를 application 계층 입력으로 변환한다.
    const result = await this.exchangeExternalAuthTokenUseCase.execute({
      supabaseAccessToken: this.getBearerToken(authorization),
      deviceSlot: body.deviceSlot,
      deviceId: body.deviceId,
      deviceLabel: body.deviceLabel ?? null,
      replaceExistingDevice: body.replaceExistingDevice ?? false,
      locale: body.locale ?? null,
      timeZone: body.timeZone ?? null,
      countryCode: this.getCountryCode(request),
      userAgent: request.header("User-Agent") ?? null,
      ipAddress: request.ip ?? null,
    });

    // 2. refresh token을 httpOnly cookie로 설정한다.
    this.authCookieService.setRefreshToken(response, result.refreshToken);

    // 3. 앱 access token 응답을 반환한다.
    return result.response;
  }

  // API : 인증, refresh token으로 앱 토큰 재발급
  @Post("refresh")
  async refresh(
    @Headers("origin") origin: string | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    // 1. 요청 cookie에서 refresh token을 읽는다.
    const refreshToken = this.authCookieService.readRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    // 2. application 계층에 refresh token 회전을 위임한다.
    const result = await this.refreshAppTokenUseCase.execute({
      refreshToken,
      origin: origin ?? null,
    });

    // 3. 새 refresh token을 httpOnly cookie로 다시 설정한다.
    this.authCookieService.setRefreshToken(response, result.refreshToken);

    // 4. 새 앱 access token 응답을 반환한다.
    return result.response;
  }

  @UseGuards(AuthGuard)
  // API : 인증, 현재 앱 세션 로그아웃
  @Post("logout")
  async logout(
    @CurrentUser() currentUser: CurrentUserContext,
    @Res({ passthrough: true }) response: Response
  ) {
    // 1. application 계층에 현재 세션 폐기를 위임한다.
    const result = await this.logoutUseCase.execute(currentUser);

    // 2. refresh token cookie를 삭제한다.
    this.authCookieService.clearRefreshToken(response);

    // 3. logout 처리 결과를 반환한다.
    return result;
  }

  // 기능 : Authorization 헤더에서 Bearer 토큰 값을 추출하고 형식을 검증합니다.
  private getBearerToken(authorization: string | undefined): string {
    if (!authorization) {
      throw new UnauthorizedException("Missing Authorization header");
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid Authorization header");
    }

    return token;
  }

  // 기능 : 배포 프록시가 제공하는 접속 국가 헤더를 읽습니다.
  private getCountryCode(request: Request): string | null {
    return (
      request.header("cf-ipcountry") ??
      request.header("x-vercel-ip-country") ??
      request.header("cloudfront-viewer-country") ??
      null
    );
  }
}

