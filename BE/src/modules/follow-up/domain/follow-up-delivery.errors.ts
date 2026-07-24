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
