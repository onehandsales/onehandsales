import { DealStage, UserRole, UserStatus } from "@prisma/client";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const userRoles = new Set<string>(Object.values(UserRole));
const userStatuses = new Set<string>(Object.values(UserStatus));
const dealStages = new Set<string>(Object.values(DealStage));

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

export function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

export function normalizeUserRole(value: string | undefined): UserRole | null {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  if (!userRoles.has(normalized)) {
    throw new ValidationDomainError("Invalid user role");
  }

  return normalized as UserRole;
}

export function normalizeUserStatus(
  value: string | undefined
): UserStatus | null {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  if (!userStatuses.has(normalized)) {
    throw new ValidationDomainError("Invalid user status");
  }

  return normalized as UserStatus;
}

export function normalizeDealStage(
  value: string | undefined
): DealStage | null {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  if (!dealStages.has(normalized)) {
    throw new ValidationDomainError("Invalid deal stage");
  }

  return normalized as DealStage;
}
