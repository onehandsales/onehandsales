export const APPLICATION_LOGGER = Symbol("APPLICATION_LOGGER");

// 역할 : ApplicationLogger 포트가 application 계층에서 사용할 로그 계약을 정의합니다.
export interface ApplicationLogger {
  // 기능 : 일반 정보 로그를 기록합니다.
  log(message: string, context?: string): void;
  // 기능 : 오류 로그를 기록합니다.
  error(message: string, trace?: string, context?: string): void;
  // 기능 : 경고 로그를 기록합니다.
  warn(message: string, context?: string): void;
}
