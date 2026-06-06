import { DomainError } from "@/shared/domain/errors/domain-error";

export class DealNotFoundError extends DomainError {
  constructor() {
    super("DealNotFound", "Deal was not found");
  }
}

export class DealActivityNotFoundError extends DomainError {
  constructor() {
    super("DealActivityNotFound", "Deal activity was not found");
  }
}

export class DealActivityTypeNotFoundError extends DomainError {
  constructor() {
    super("DealActivityTypeNotFound", "Deal activity type was not found");
  }
}

export class RelatedEntityNotFoundError extends DomainError {
  constructor() {
    super("RelatedEntityNotFound", "Related entity was not found");
  }
}

export class NextActionNotFoundError extends DomainError {
  constructor() {
    super("NextActionNotFound", "Next action was not found");
  }
}

export class OwnershipViolationError extends DomainError {
  constructor() {
    super("OwnershipViolation", "Resource does not belong to current user");
  }
}
