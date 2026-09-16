export const AUTH_RUNTIME_CONFIG = Symbol("AUTH_RUNTIME_CONFIG");

// 역할 : AuthRuntimeConfig 포트가 인증 use case에 필요한 런타임 설정 계약을 정의합니다.
export interface AuthRuntimeConfig {
  // 기능 : 초기 관리자 승격에 사용할 이메일 목록을 반환합니다.
  getInitialAdminEmails(): string[];
  // 기능 : refresh session 만료 기간을 일 단위로 반환합니다.
  getSessionTtlDays(): number;
  // 기능 : refresh API 호출을 허용할 Origin 목록을 반환합니다.
  getAllowedRefreshOrigins(): string[];
}
