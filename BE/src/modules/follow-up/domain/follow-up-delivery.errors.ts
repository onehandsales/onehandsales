export class FollowUpDeliverySecretEncryptionKeyMissingError extends Error {
  constructor() {
    super("Follow-up delivery encryption key is not configured.");
    this.name = "FollowUpDeliverySecretEncryptionKeyMissingError";
  }
}

export class FollowUpDeliverySecretEncryptFailedError extends Error {
  constructor() {
    super("Follow-up delivery secret encryption failed.");
    this.name = "FollowUpDeliverySecretEncryptFailedError";
  }
}

export class FollowUpDeliverySecretDecryptFailedError extends Error {
  constructor() {
    super("Follow-up delivery secret decryption failed.");
    this.name = "FollowUpDeliverySecretDecryptFailedError";
  }
}
