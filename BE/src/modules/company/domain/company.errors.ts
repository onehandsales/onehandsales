import { DomainError } from "@/shared/domain/errors/domain-error";

export class CompanyNotFoundError extends DomainError {
  constructor() {
    super("CompanyNotFound", "Company was not found");
  }
}

export class CompanyLogNotFoundError extends DomainError {
  constructor() {
    super("CompanyLogNotFound", "Company log was not found");
  }
}

export class OwnershipViolationError extends DomainError {
  constructor() {
    super("OwnershipViolation", "Resource does not belong to current user");
  }
}

