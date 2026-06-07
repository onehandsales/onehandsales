import { DomainError } from "@/shared/domain/errors/domain-error";

export class UserNotFoundError extends DomainError {
  constructor() {
    super("UserNotFound", "User was not found");
  }
}

export class AuditReasonRequiredError extends DomainError {
  constructor() {
    super("AuditReasonRequired", "Audit reason is required");
  }
}

export class SensitiveFieldNotAllowedError extends DomainError {
  constructor() {
    super("SensitiveFieldNotAllowed", "Sensitive field is not allowed");
  }
}

export class SensitiveTargetNotFoundError extends DomainError {
  constructor() {
    super("SensitiveTargetNotFound", "Sensitive target was not found");
  }
}

export class AuditLogNotFoundError extends DomainError {
  constructor() {
    super("AuditLogNotFound", "Audit log was not found");
  }
}

export class DecryptionFailedError extends DomainError {
  constructor() {
    super("DecryptionFailed", "Sensitive field decryption failed");
  }
}
