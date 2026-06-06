import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";

@Injectable()
export class AuthCookieService {
  private readonly refreshCookiePath = "/api/auth/refresh";

  constructor(private readonly configService: ConfigService) {}

  readRefreshToken(request: Request): string | null {
    return this.readCookie(request.header("Cookie"), this.getCookieName());
  }

  setRefreshToken(response: Response, refreshToken: string): void {
    response.cookie(this.getCookieName(), refreshToken, this.getCookieOptions());
  }

  clearRefreshToken(response: Response): void {
    response.clearCookie(this.getCookieName(), this.getCookieOptions());
  }

  private getCookieName(): string {
    return (
      this.configService.get<string>("APP_REFRESH_COOKIE_NAME") ??
      "sales_b2c_refresh"
    );
  }

  private getCookieOptions(): CookieOptions {
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

  private isSecureCookie(): boolean {
    const apiOrigin = this.configService.get<string>("API_PUBLIC_ORIGIN") ?? "";

    return (
      apiOrigin.startsWith("https://") ||
      this.configService.get<string>("NODE_ENV") === "production"
    );
  }

  private readCookie(cookieHeader: string | undefined, name: string): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookie = cookieHeader
      .split(";")
      .map((entry) => entry.trim())
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

