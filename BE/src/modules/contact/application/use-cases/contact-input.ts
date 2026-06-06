import { ContactLogNotFoundError, ContactNotFoundError } from "@/modules/contact/domain/contact.errors";
import { DeletedResourceError, ValidationDomainError } from "@/shared/domain/errors/common.errors";

export function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeRequiredText(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationDomainError("Required text field is empty");
  }

  return trimmed;
}

export function normalizePagination(input: {
  readonly page?: number;
  readonly pageSize?: number;
}): { page: number; pageSize: number } {
  const page = input.page && input.page > 0 ? input.page : 1;
  const pageSize =
    input.pageSize && input.pageSize > 0
      ? Math.min(input.pageSize, 100)
      : 20;

  return { page, pageSize };
}

export function assertContactExists<TContact>(
  contact: TContact | null
): TContact {
  if (!contact) {
    throw new ContactNotFoundError();
  }

  return contact;
}

export function assertContactLogExists<TLog>(log: TLog | null): TLog {
  if (!log) {
    throw new ContactLogNotFoundError();
  }

  return log;
}

export function assertNotDeleted(
  deletedAt: Date | null,
  operation: "read" | "write"
): void {
  if (deletedAt) {
    throw new DeletedResourceError(operation);
  }
}
