import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";

// 역할 : AuthCookieService 공통 기능 또는 application 서비스를 제공합니다.
@Injectable()
export class AuthCookieService {
  private readonly refreshCookiePath = "/api/auth/refresh";

  // 기능 : refresh token 쿠키 설정을 읽기 위한 설정 서비스를 주입받습니다.
  constructor(private readonly configService: ConfigService) {}

  // 기능 : 요청 쿠키에서 refresh token 값을 읽습니다.
  readRefreshToken(request: Request): string | null {
    return this.readCookie(request.header("Cookie"), this.getCookieName());
  }

  // 기능 : 응답에 refresh token httpOnly 쿠키를 설정합니다.
  setRefreshToken(response: Response, refreshToken: string): void {
    response.cookie(this.getCookieName(), refreshToken, {
      ...this.getBaseCookieOptions(),
      maxAge: this.getRefreshCookieMaxAgeMs(),
    });
  }

  // 기능 : 응답에서 refresh token 쿠키를 삭제합니다.
  clearRefreshToken(response: Response): void {
    response.clearCookie(this.getCookieName(), this.getBaseCookieOptions());
  }

  // 기능 : refresh token 쿠키 이름 설정값을 반환합니다.
  private getCookieName(): string {
    return (
      this.configService.get<string>("APP_REFRESH_COOKIE_NAME") ??
      "sales_b2c_refresh"
    );
  }

  // 기능 : refresh token 쿠키에 적용할 공통 옵션을 계산합니다.
  private getBaseCookieOptions(): CookieOptions {
    const options: CookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: this.isSecureCookie(),
      path: this.refreshCookiePath,
    };
    const domain = this.configService.get<string>("APP_REFRESH_COOKIE_DOMAIN");

    if (domain && domain.trim().length > 0) {
      options.domain = domain.trim();
    }

    return options;
  }

  // 기능 : 앱 refresh session 정책과 같은 refresh cookie maxAge를 밀리초로 반환합니다.
  private getRefreshCookieMaxAgeMs(): number {
    return this.getSessionTtlDays() * 24 * 60 * 60 * 1000;
  }

  // 기능 : refresh session 만료 기간 설정값을 일 단위 숫자로 반환합니다.
  private getSessionTtlDays(): number {
    const value = Number(
      this.configService.get<string>("APP_SESSION_TTL_DAYS") ?? "7"
    );

    return Number.isFinite(value) && value > 0 ? value : 7;
  }

  // 기능 : 현재 환경에서 secure 쿠키를 사용할지 판단합니다.
  private isSecureCookie(): boolean {
    const apiOrigin = this.configService.get<string>("API_PUBLIC_ORIGIN") ?? "";

    return (
      apiOrigin.startsWith("https://") ||
      this.configService.get<string>("NODE_ENV") === "production"
    );
  }

  // 기능 : Cookie 헤더 문자열에서 지정 이름의 쿠키 값을 추출합니다.
  private readCookie(cookieHeader: string | undefined, name: string): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookie = cookieHeader
      .split(";")
      // 기능 : Cookie 항목의 앞뒤 공백을 제거합니다.
      .map((entry) => entry.trim())
      // 기능 : 요청한 쿠키 이름으로 시작하는 항목을 찾습니다.
      .find((entry) => entry.startsWith(`${name}=`));

    if (!cookie) {
      return null;
    }

    const value = cookie.slice(name.length + 1);

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
}

