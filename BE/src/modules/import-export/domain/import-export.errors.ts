import { DomainError } from "@/shared/domain/errors/domain-error";

export class ImportJobNotFoundError extends DomainError {
  constructor() {
    super("ImportJobNotFound", "Import job was not found");
  }
}

export class InvalidImportFileError extends DomainError {
  constructor(message = "Invalid import file") {
    super("InvalidImportFile", message);
  }
}

export class ImportRowLimitExceededError extends DomainError {
  constructor(message = "Import row limit was exceeded") {
    super("ImportRowLimitExceeded", message);
  }
}

export class FileStorageUnavailableError extends DomainError {
  constructor(message = "File storage is unavailable") {
    super("FileStorageUnavailable", message);
  }
}

export class AiProviderUnavailableError extends DomainError {
  constructor(message = "AI provider is unavailable") {
    super("AiProviderUnavailable", message);
  }
}

export class ImportMappingRequiredError extends DomainError {
  constructor() {
    super("ImportMappingRequired", "Import mapping is required");
  }
}

export class ImportValidationFailedError extends DomainError {
  constructor(message = "Import contains validation errors") {
    super("ImportValidationFailed", message);
  }
}

export class ImportExecutionFailedError extends DomainError {
  constructor(message = "Import execution failed") {
    super("ImportExecutionFailed", message);
  }
}

export class ValidationError extends DomainError {
  constructor(message = "Validation error") {
    super("ValidationError", message);
  }
}

export class OwnershipViolationError extends DomainError {
  constructor() {
    super("OwnershipViolation", "Resource does not belong to current user");
  }
}
