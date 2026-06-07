import { DomainError } from "@/shared/domain/errors/domain-error";

export class TrashItemNotFoundError extends DomainError {
  constructor() {
    super("TrashItemNotFound", "Trash item was not found");
  }
}

export class TrashItemExpiredError extends DomainError {
  constructor() {
    super("TrashItemExpired", "Trash item is expired");
  }
}

export class PermanentDeleteNotAllowedError extends DomainError {
  constructor() {
    super(
      "PermanentDeleteNotAllowed",
      "Permanent delete is not allowed in the MVP"
    );
  }
}
