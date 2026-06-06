import { DomainError } from "./domain-error";

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized") {
    super("Unauthorized", message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden") {
    super("Forbidden", message);
  }
}

export class ValidationDomainError extends DomainError {
  constructor(message = "Validation failed") {
    super("ValidationError", message);
  }
}

export class DeletedResourceError extends DomainError {
  constructor(readonly operation: "read" | "write", message = "Deleted resource") {
    super("DeletedResource", message, { operation });
  }
}
