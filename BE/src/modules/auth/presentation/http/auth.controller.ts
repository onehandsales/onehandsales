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

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly listAuthProvidersUseCase: ListAuthProvidersUseCase,
    private readonly exchangeExternalAuthTokenUseCase: ExchangeExternalAuthTokenUseCase,
    private readonly refreshAppTokenUseCase: RefreshAppTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly authCookieService: AuthCookieService
  ) {}

  @Get("providers")
  listProviders() {
    return this.listAuthProvidersUseCase.execute();
  }

  @Post("exchange")
  async exchange(
    @Headers("authorization") authorization: string | undefined,
    @Body() body: ExchangeExternalAuthTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.exchangeExternalAuthTokenUseCase.execute({
      supabaseAccessToken: this.getBearerToken(authorization),
      deviceSlot: body.deviceSlot,
      deviceId: body.deviceId,
      deviceLabel: body.deviceLabel ?? null,
      replaceExistingDevice: body.replaceExistingDevice ?? false,
      userAgent: request.header("User-Agent") ?? null,
      ipAddress: request.ip ?? null,
    });

    this.authCookieService.setRefreshToken(response, result.refreshToken);

    return result.response;
  }

  @Post("refresh")
  async refresh(
    @Headers("origin") origin: string | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = this.authCookieService.readRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const result = await this.refreshAppTokenUseCase.execute({
      refreshToken,
      origin: origin ?? null,
    });

    this.authCookieService.setRefreshToken(response, result.refreshToken);

    return result.response;
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  async logout(
    @CurrentUser() currentUser: CurrentUserContext,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.logoutUseCase.execute(currentUser);
    this.authCookieService.clearRefreshToken(response);

    return result;
  }

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
}

