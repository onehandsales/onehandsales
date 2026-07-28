import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : ExternalUserEmailMissingError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ExternalUserEmailMissingError extends DomainError {
  // 기능 : 외부 인증 provider가 검증된 이메일을 주지 않은 오류를 생성합니다.
  constructor(provider: string) {
    super("AUTH_PROVIDER_EMAIL_REQUIRED", "Provider email is required", {
      field: "provider",
      provider,
    });
  }
}

// 역할 : AuthProviderExchangeFailedError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class AuthProviderExchangeFailedError extends DomainError {
  // 기능 : 외부 인증 provider 교환 실패를 원문 없이 안전한 오류로 생성합니다.
  constructor() {
    super("AUTH_PROVIDER_EXCHANGE_FAILED", "Auth provider exchange failed", {
      field: "provider",
    });
  }
}

// 역할 : InvalidDeviceSlotError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class InvalidDeviceSlotError extends DomainError {
  // 기능 : 지원하지 않는 기기 슬롯 오류를 생성합니다.
  constructor() {
    super("InvalidDeviceSlot", "Device slot is invalid");
  }
}

// 역할 : InvalidDeviceIdError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class InvalidDeviceIdError extends DomainError {
  // 기능 : 유효하지 않은 기기 식별자 오류를 생성합니다.
  constructor() {
    super("InvalidDeviceId", "Device id is invalid");
  }
}

// 역할 : DeviceSlotAlreadyRegisteredError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class DeviceSlotAlreadyRegisteredError extends DomainError {
  // 기능 : 동일 슬롯에 다른 활성 기기가 이미 등록된 오류를 생성합니다.
  constructor() {
    super(
      "DeviceSlotAlreadyRegistered",
      "Another active device is already registered in this slot"
    );
  }
}

// 역할 : InactiveUserError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class InactiveUserError extends DomainError {
  // 기능 : 비활성 사용자 접근 오류를 생성합니다.
  constructor() {
    super("InactiveUser", "User is not active");
  }
}

// 역할 : OAuthAccountConflictError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class OAuthAccountConflictError extends DomainError {
  // 기능 : 이미 연결된 OAuth 계정 충돌 오류를 생성합니다.
  constructor() {
    super("OAuthAccountConflict", "OAuth account is already linked");
  }
}

// 역할 : InvalidRefreshOriginError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class InvalidRefreshOriginError extends DomainError {
  // 기능 : 허용되지 않은 refresh 요청 Origin 오류를 생성합니다.
  constructor() {
    super("InvalidRefreshOrigin", "Refresh origin is not allowed");
  }
}

