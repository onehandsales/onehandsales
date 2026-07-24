import { DomainError } from "@/shared/domain/errors/domain-error";

export class FollowUpDeliverySecretEncryptionKeyMissingError extends DomainError {
  constructor() {
    super(
      "FollowUpDeliverySecretEncryptionKeyMissing",
      "Follow-up delivery encryption key is not configured."
    );
  }
}

export class FollowUpDeliverySecretEncryptFailedError extends DomainError {
  constructor() {
    super(
      "FollowUpDeliverySecretEncryptFailed",
      "Follow-up delivery secret encryption failed."
    );
  }
}

export class FollowUpDeliverySecretDecryptFailedError extends DomainError {
  constructor() {
    super(
      "FollowUpDeliverySecretDecryptFailed",
      "Follow-up delivery secret decryption failed."
    );
  }
}

export class FollowUpEmailOAuthStateInvalidError extends DomainError {
  constructor() {
    super(
      "FollowUpEmailOAuthStateInvalid",
      "Follow-up email OAuth state is invalid, expired, or already used."
    );
  }
}

export class FollowUpEmailConnectionNotFoundError extends DomainError {
  constructor() {
    super(
      "FollowUpEmailConnectionNotFound",
      "Follow-up email connection was not found."
    );
  }
}

export class FollowUpProviderUnavailableError extends DomainError {
  constructor(message = "Follow-up provider is unavailable.") {
    super("FollowUpProviderUnavailable", message);
  }
}

export class FollowUpProviderRequestFailedError extends DomainError {
  constructor(message = "Follow-up provider request failed.") {
    super("FollowUpProviderRequestFailed", message);
  }
}

export class SmsSenderNumberNotFoundError extends DomainError {
  constructor() {
    super("SmsSenderNumberNotFound", "SMS sender number was not found.");
  }
}

export class SmsSenderVerificationCodeInvalidError extends DomainError {
  constructor() {
    super(
      "SmsSenderVerificationCodeInvalid",
      "SMS sender verification code is invalid."
    );
  }
}

export class SmsSenderVerificationExpiredError extends DomainError {
  constructor() {
    super(
      "SmsSenderVerificationExpired",
      "SMS sender verification code is expired."
    );
  }
}

export class FollowUpDraftSourceInvalidError extends DomainError {
  constructor(message = "Follow-up draft source is invalid.") {
    super("FollowUpDraftSourceInvalid", message);
  }
}

export class FollowUpConsentNoticeRequiredError extends DomainError {
  constructor() {
    super(
      "FollowUpConsentNoticeRequired",
      "Acknowledge the follow-up consent notice before sending."
    );
  }
}

export class FollowUpEmailReconnectRequiredError extends DomainError {
  constructor() {
    super(
      "FollowUpEmailReconnectRequired",
      "Reconnect the email account before sending follow-up messages."
    );
  }
}

export class FollowUpSmsSenderNotVerifiedError extends DomainError {
  constructor() {
    super(
      "FollowUpSmsSenderNotVerified",
      "Verify the SMS sender number before sending follow-up messages."
    );
  }
}

export class FollowUpInvalidRecipientError extends DomainError {
  constructor(message = "Follow-up recipient is invalid.") {
    super("FollowUpInvalidRecipient", message);
  }
}

export class FollowUpMessageAlreadySentError extends DomainError {
  constructor() {
    super(
      "FollowUpMessageAlreadySent",
      "Follow-up message has already been sent."
    );
  }
}

export class FollowUpSmsBodyTooLongError extends DomainError {
  constructor() {
    super("FollowUpSmsBodyTooLong", "Follow-up SMS body is too long.");
  }
}

export class FollowUpMessageNotFoundError extends DomainError {
  constructor() {
    super("FollowUpMessageNotFound", "Follow-up message was not found.");
  }
}

export class FollowUpMessageNotSendableError extends DomainError {
  constructor(message = "Follow-up message cannot be sent.") {
    super("FollowUpMessageNotSendable", message);
  }
}

export class FollowUpMessageNotRetryableError extends DomainError {
  constructor() {
    super(
      "FollowUpMessageNotRetryable",
      "Follow-up message is not retryable."
    );
  }
}
