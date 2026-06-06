import { DeletedResourceError } from "@/shared/domain/errors/common.errors";
import {
  CompanyLogNotFoundError,
  CompanyNotFoundError,
} from "@/modules/company/domain/company.errors";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

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

export function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) {
    return [];
  }

  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    )
  );
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

export function assertCompanyExists<TCompany>(
  company: TCompany | null
): TCompany {
  if (!company) {
    throw new CompanyNotFoundError();
  }

  return company;
}

export function assertCompanyLogExists<TLog>(log: TLog | null): TLog {
  if (!log) {
    throw new CompanyLogNotFoundError();
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
