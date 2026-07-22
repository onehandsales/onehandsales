import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : NotificationNotFoundError 사용자 소유 알림을 찾을 수 없는 오류입니다.
export class NotificationNotFoundError extends DomainError {
  // 기능 : 알림 없음 또는 소유권 불일치 오류를 생성합니다.
  constructor() {
    super("NotificationNotFound", "Notification was not found");
  }
}

// 역할 : BrowserPushNotConfiguredError Web Push VAPID 설정 누락 오류입니다.
export class BrowserPushNotConfiguredError extends DomainError {
  // 기능 : browser push public key를 제공할 수 없는 오류를 생성합니다.
  constructor() {
    super("BrowserPushNotConfigured", "Browser push is not configured");
  }
}

// 역할 : PushSubscriptionConflictError 다른 사용자의 endpoint hash 충돌 오류입니다.
export class PushSubscriptionConflictError extends DomainError {
  // 기능 : browser push endpoint가 다른 사용자에게 이미 등록된 오류를 생성합니다.
  constructor() {
    super(
      "PushSubscriptionConflict",
      "Push subscription already belongs to another user"
    );
  }
}

// 역할 : PushSubscriptionNotFoundError 사용자 소유 push 구독을 찾을 수 없는 오류입니다.
export class PushSubscriptionNotFoundError extends DomainError {
  // 기능 : push 구독 없음 또는 소유권 불일치 오류를 생성합니다.
  constructor() {
    super("PushSubscriptionNotFound", "Push subscription was not found");
  }
}

// 역할 : BrowserPushSubscriptionEncryptFailedError push 구독 암호화 실패를 표현합니다.
export class BrowserPushSubscriptionEncryptFailedError extends DomainError {
  // 기능 : push 구독 암호화 실패 오류를 생성합니다.
  constructor() {
    super("PushSubscriptionEncryptFailed", "Push subscription encrypt failed");
  }
}

// 역할 : BrowserPushSubscriptionDecryptFailedError push 구독 복호화 실패를 표현합니다.
export class BrowserPushSubscriptionDecryptFailedError extends DomainError {
  // 기능 : push 구독 복호화 실패 오류를 생성합니다.
  constructor() {
    super("BrowserPushSubscriptionDecryptFailed", "Push subscription decrypt failed");
  }
}
