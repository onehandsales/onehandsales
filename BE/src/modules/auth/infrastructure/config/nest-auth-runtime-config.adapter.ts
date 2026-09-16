import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthRuntimeConfig } from "@/modules/auth/application/ports/auth-runtime-config.port";

// 역할 : NestAuthRuntimeConfigAdapter가 Nest ConfigService 설정을 인증 application 포트로 변환합니다.
@Injectable()
export class NestAuthRuntimeConfigAdapter implements AuthRuntimeConfig {
  // 기능 : Nest ConfigService를 주입받아 인증 런타임 설정을 조회합니다.
  constructor(private readonly configService: ConfigService) {}

  // 기능 : 초기 관리자 이메일 환경 변수를 읽어 정규화된 목록으로 반환합니다.
  getInitialAdminEmails(): string[] {
    // 1. 쉼표로 구분된 초기 관리자 이메일 환경 변수를 읽는다.
    const value = this.configService.get<string>("INITIAL_ADMIN_EMAILS") ?? "";

    // 2. 공백과 대소문자를 정리하고 빈 항목을 제거한다.
    return value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
  }

  // 기능 : 세션 만료 기간 설정값을 일 단위 숫자로 반환합니다.
  getSessionTtlDays(): number {
    // 1. 환경 변수에서 세션 TTL 일수를 읽고 숫자로 변환한다.
    const value = Number(
      this.configService.get<string>("APP_SESSION_TTL_DAYS") ?? "7"
    );

    // 2. 유효한 양수만 사용하고 잘못된 값은 7일로 대체한다.
    return Number.isFinite(value) && value > 0 ? value : 7;
  }

  // 기능 : 환경 변수 또는 웹 Origin 설정에서 refresh 허용 Origin 목록을 계산합니다.
  getAllowedRefreshOrigins(): string[] {
    // 1. 명시적인 허용 Origin 목록이 있으면 해당 값을 우선 사용한다.
    const explicit = this.configService.get<string>("APP_ALLOWED_ORIGINS");

    if (explicit && explicit.trim().length > 0) {
      return explicit
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    // 2. 명시 설정이 없으면 User/Admin Web origin 기본값을 사용한다.
    return [
      this.configService.get<string>("USER_WEB_ORIGIN") ?? "http://localhost:5173",
      this.configService.get<string>("ADMIN_WEB_ORIGIN") ?? "http://localhost:5174",
    ];
  }
}
