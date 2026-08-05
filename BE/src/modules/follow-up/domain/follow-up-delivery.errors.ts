import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : follow-up delivery secret 암호화 key 누락 오류를 표현합니다.
export class FollowUpDeliverySecretEncryptionKeyMissingError extends DomainError {
  constructor() {
    super(
      "FollowUpDeliverySecretEncryptionKeyMissing",
      "Follow-up delivery encryption key is not configured."
    );
  }
}

// 역할 : follow-up delivery secret 암호화 실패 오류를 표현합니다.
export class FollowUpDeliverySecretEncryptFailedError extends DomainError {
  constructor() {
    super(
      "FollowUpDeliverySecretEncryptFailed",
      "Follow-up delivery secret encryption failed."
    );
  }
}

// 역할 : follow-up delivery secret 복호화 실패 오류를 표현합니다.
export class FollowUpDeliverySecretDecryptFailedError extends DomainError {
  constructor() {
    super(
      "FollowUpDeliverySecretDecryptFailed",
      "Follow-up delivery secret decryption failed."
    );
  }
}

// 역할 : 외부 email OAuth state 검증 실패 오류를 표현합니다.
export class FollowUpEmailOAuthStateInvalidError extends DomainError {
  constructor() {
    super(
      "FollowUpEmailOAuthStateInvalid",
      "Follow-up email OAuth state is invalid, expired, or already used."
    );
  }
}

// 역할 : 외부 email connection 조회 실패 오류를 표현합니다.
export class FollowUpEmailConnectionNotFoundError extends DomainError {
  constructor() {
    super(
      "FollowUpEmailConnectionNotFound",
      "Follow-up email connection was not found."
    );
  }
}

// 역할 : 외부 follow-up provider 설정 또는 사용 불가 오류를 표현합니다.
export class FollowUpProviderUnavailableError extends DomainError {
  constructor(message = "Follow-up provider is unavailable.") {
    super("FollowUpProviderUnavailable", message);
  }
}

// 역할 : 외부 follow-up provider 요청 실패 오류를 표현합니다.
export class FollowUpProviderRequestFailedError extends DomainError {
  constructor(message = "Follow-up provider request failed.") {
    super("FollowUpProviderRequestFailed", message);
  }
}

// 역할 : SMS 발신번호 조회 실패 오류를 표현합니다.
export class SmsSenderNumberNotFoundError extends DomainError {
  constructor() {
    super("SmsSenderNumberNotFound", "SMS sender number was not found.");
  }
}

// 역할 : SMS 발신번호 인증 코드 불일치 오류를 표현합니다.
export class SmsSenderVerificationCodeInvalidError extends DomainError {
  constructor() {
    super(
      "SmsSenderVerificationCodeInvalid",
      "SMS sender verification code is invalid."
    );
  }
}

// 역할 : SMS 발신번호 인증 만료 오류를 표현합니다.
export class SmsSenderVerificationExpiredError extends DomainError {
  constructor() {
    super(
      "SmsSenderVerificationExpired",
      "SMS sender verification code is expired."
    );
  }
}

// 역할 : follow-up 초안 생성 source가 유효하지 않은 오류를 표현합니다.
export class FollowUpDraftSourceInvalidError extends DomainError {
  constructor(message = "Follow-up draft source is invalid.") {
    super("FollowUpDraftSourceInvalid", message);
  }
}

// 역할 : follow-up 첫 발송 주의 안내 미확인 오류를 표현합니다.
export class FollowUpConsentNoticeRequiredError extends DomainError {
  constructor() {
    super(
      "FollowUpConsentNoticeRequired",
      "Acknowledge the follow-up consent notice before sending."
    );
  }
}

// 역할 : email 연결 재연결이 필요한 오류를 표현합니다.
export class FollowUpEmailReconnectRequiredError extends DomainError {
  constructor() {
    super(
      "FollowUpEmailReconnectRequired",
      "Reconnect the email account before sending follow-up messages."
    );
  }
}

// 역할 : email 발송 scope 부족 오류를 표현합니다.
export class FollowUpEmailScopeInsufficientError extends DomainError {
  constructor() {
    super(
      "FollowUpEmailScopeInsufficient",
      "Reconnect the email account with email send permission."
    );
  }
}

// 역할 : SMS 발신번호 인증이 필요한 오류를 표현합니다.
export class FollowUpSmsSenderNotVerifiedError extends DomainError {
  constructor() {
    super(
      "FollowUpSmsSenderNotVerified",
      "Verify the SMS sender number before sending follow-up messages."
    );
  }
}

// 역할 : follow-up 수신자 정보 오류를 표현합니다.
export class FollowUpInvalidRecipientError extends DomainError {
  constructor(message = "Follow-up recipient is invalid.") {
    super("FollowUpInvalidRecipient", message);
  }
}

// 역할 : 이미 발송된 follow-up message 오류를 표현합니다.
export class FollowUpMessageAlreadySentError extends DomainError {
  constructor() {
    super(
      "FollowUpMessageAlreadySent",
      "Follow-up message has already been sent."
    );
  }
}

// 역할 : SMS 본문 길이 초과 오류를 표현합니다.
export class FollowUpSmsBodyTooLongError extends DomainError {
  constructor() {
    super("FollowUpSmsBodyTooLong", "Follow-up SMS body is too long.");
  }
}

// 역할 : follow-up message 조회 실패 오류를 표현합니다.
export class FollowUpMessageNotFoundError extends DomainError {
  constructor() {
    super("FollowUpMessageNotFound", "Follow-up message was not found.");
  }
}

// 역할 : follow-up message 발송 불가 오류를 표현합니다.
export class FollowUpMessageNotSendableError extends DomainError {
  constructor(message = "Follow-up message cannot be sent.") {
    super("FollowUpMessageNotSendable", message);
  }
}

// 역할 : follow-up message 재시도 불가 오류를 표현합니다.
export class FollowUpMessageNotRetryableError extends DomainError {
  constructor() {
    super(
      "FollowUpMessageNotRetryable",
      "Follow-up message is not retryable."
    );
  }
}
