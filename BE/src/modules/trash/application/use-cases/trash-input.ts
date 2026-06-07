import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { TrashTargetType } from "../ports/trash.repository";

const targetTypes = new Set<TrashTargetType>([
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
  "COMPANY_LOG",
  "CONTACT_LOG",
  "PRODUCT_LOG",
  "PRODUCT_CONNECTION",
  "DEAL_ACTIVITY",
  "PERSONAL_MEMO",
]);

export function normalizeTrashTargetType(
  value: string | undefined
): TrashTargetType | null {
  if (!value || value.trim().length === 0 || value === "ALL") {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  if (!targetTypes.has(normalized as TrashTargetType)) {
    throw new ValidationDomainError("Invalid trash target type");
  }

  return normalized as TrashTargetType;
}

export function normalizeRequiredTrashTargetType(
  value: string
): TrashTargetType {
  const normalized = normalizeTrashTargetType(value);

  if (!normalized) {
    throw new ValidationDomainError("Trash target type is required");
  }

  return normalized;
}

export function normalizePage(value: number | undefined) {
  if (value === undefined) {
    return 1;
  }

  if (!Number.isInteger(value) || value < 1) {
    throw new ValidationDomainError("Page must be a positive integer");
  }

  return value;
}

export function normalizePageSize(value: number | undefined) {
  if (value === undefined) {
    return 20;
  }

  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new ValidationDomainError("Page size must be between 1 and 100");
  }

  return value;
}
