import type {
  DealLikelihoodStatus,
  DealStage,
  NextActionStatus,
} from "@/modules/deal/application/ports/deal.repository";
import { DealActivityNotFoundError, DealNotFoundError } from "@/modules/deal/domain/deal.errors";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";

const DEAL_STAGES: DealStage[] = [
  "INITIAL_CONTACT",
  "IN_DISCUSSION",
  "WON",
  "LOST",
];

const DEAL_LIKELIHOOD_STATUSES: DealLikelihoodStatus[] = [
  "POSITIVE",
  "NEUTRAL",
  "NEGATIVE",
];

const NEXT_ACTION_STATUSES: NextActionStatus[] = [
  "NONE",
  "SCHEDULED",
  "DUE_SOON",
  "OVERDUE",
  "DONE",
];

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

export function normalizeAmount(value: number | null | undefined): number {
  if (value === undefined || value === null) {
    throw new ValidationDomainError("Deal amount is required");
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationDomainError("Deal amount must be a non-negative integer");
  }

  return value;
}

export function normalizeCurrency(value: string | null | undefined): string {
  const normalized = normalizeOptionalText(value)?.toUpperCase() ?? "KRW";

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ValidationDomainError("Invalid currency");
  }

  return normalized;
}

export function normalizeLikelihoodPercent(
  value: number | null | undefined
): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new ValidationDomainError("Likelihood percent must be between 0 and 100");
  }

  return value;
}

export function normalizeOptionalDate(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value.trim().length === 0) {
    return null;
  }

  return parseDate(value);
}

export function normalizeRequiredDate(value: string): Date {
  return parseDate(value);
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

export function normalizeDealStage(
  value: string | null | undefined,
  fallback: DealStage
): DealStage {
  if (value === undefined || value === null || value.trim().length === 0) {
    return fallback;
  }

  if (DEAL_STAGES.includes(value as DealStage)) {
    return value as DealStage;
  }

  throw new ValidationDomainError("Invalid deal stage");
}

export function normalizeRequiredDealStage(value: string): DealStage {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ValidationDomainError("Deal stage is required");
  }

  return normalizeDealStage(trimmed, "INITIAL_CONTACT");
}

export function normalizeDealLikelihoodStatus(
  value: string | null | undefined,
  fallback: DealLikelihoodStatus
): DealLikelihoodStatus {
  if (value === undefined || value === null || value.trim().length === 0) {
    return fallback;
  }

  if (DEAL_LIKELIHOOD_STATUSES.includes(value as DealLikelihoodStatus)) {
    return value as DealLikelihoodStatus;
  }

  throw new ValidationDomainError("Invalid deal likelihood status");
}

export function normalizeNextActionStatus(
  value: string | null | undefined,
  fallback: NextActionStatus
): NextActionStatus {
  if (value === undefined || value === null || value.trim().length === 0) {
    return fallback;
  }

  if (NEXT_ACTION_STATUSES.includes(value as NextActionStatus)) {
    return value as NextActionStatus;
  }

  throw new ValidationDomainError("Invalid next action status");
}

export function normalizeOptionalId(value: string | null | undefined): string | null {
  return normalizeOptionalText(value);
}

export function normalizeRequiredId(value: string): string {
  return normalizeRequiredText(value);
}

export function normalizeProductIds(values: readonly string[] | undefined): string[] {
  const uniqueIds = new Set<string>();

  for (const value of values ?? []) {
    const id = normalizeOptionalText(value);

    if (id) {
      uniqueIds.add(id);
    }
  }

  return Array.from(uniqueIds);
}

export function assertDealExists<TDeal>(deal: TDeal | null): TDeal {
  if (!deal) {
    throw new DealNotFoundError();
  }

  return deal;
}

export function assertDealActivityExists<TActivity>(
  activity: TActivity | null
): TActivity {
  if (!activity) {
    throw new DealActivityNotFoundError();
  }

  return activity;
}

export function assertNotDeleted(
  deletedAt: Date | null,
  operation: "read" | "write"
): void {
  if (deletedAt) {
    throw new DeletedResourceError(operation);
  }
}

function parseDate(value: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationDomainError("Invalid date");
  }

  return date;
}
