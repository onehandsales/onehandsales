import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : BrowserPushSubscriptionEncryptFailedError push 구독 암호화 실패를 표현합니다.
export class BrowserPushSubscriptionEncryptFailedError extends DomainError {
  // 기능 : push 구독 암호화 실패 오류를 생성합니다.
  constructor() {
    super("BrowserPushSubscriptionEncryptFailed", "Push subscription encrypt failed");
  }
}

// 역할 : BrowserPushSubscriptionDecryptFailedError push 구독 복호화 실패를 표현합니다.
export class BrowserPushSubscriptionDecryptFailedError extends DomainError {
  // 기능 : push 구독 복호화 실패 오류를 생성합니다.
  constructor() {
    super("BrowserPushSubscriptionDecryptFailed", "Push subscription decrypt failed");
  }
}
