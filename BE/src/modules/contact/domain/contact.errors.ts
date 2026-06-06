import { DomainError } from "@/shared/domain/errors/domain-error";

export class ContactNotFoundError extends DomainError {
  constructor() {
    super("ContactNotFound", "Contact was not found");
  }
}

export class ContactLogNotFoundError extends DomainError {
  constructor() {
    super("ContactLogNotFound", "Contact log was not found");
  }
}
