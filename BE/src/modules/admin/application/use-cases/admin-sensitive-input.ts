import { AuditAction, AuditTargetType } from "@prisma/client";
import { AuditReasonRequiredError } from "@/modules/admin/domain/admin.errors";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { AdminSensitiveTargetType } from "../ports/admin-sensitive.repository";
import { normalizeOptionalText, normalizePage, normalizePageSize } from "./admin-query-input";

const minimumReasonLength = 10;
const sensitiveTargetTypes = new Set<string>([
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "MEETING_NOTE",
  "PERSONAL_MEMO",
]);
const auditActions = new Set<string>(Object.values(AuditAction));
const auditTargetTypes = new Set<string>(Object.values(AuditTargetType));

export function normalizeSensitiveTargetType(
  value: string | undefined
): AdminSensitiveTargetType {
  const normalized = value?.trim().toUpperCase() ?? "";

  if (!sensitiveTargetTypes.has(normalized)) {
    throw new ValidationDomainError("Invalid sensitive target type");
  }

  return normalized as AdminSensitiveTargetType;
}

export function normalizeSensitiveFields(value: readonly string[] | undefined) {
  const fields = value
    ?.map((field) => field.trim())
    .filter((field) => field.length > 0) ?? [];
  const uniqueFields = [...new Set(fields)];

  if (uniqueFields.length === 0 || uniqueFields.length > 10) {
    throw new ValidationDomainError("Sensitive fields must contain 1 to 10 items");
  }

  return uniqueFields;
}

export function normalizeAuditReason(value: string | undefined) {
  const reason = value?.trim().replace(/\s+/g, " ") ?? "";

  if (reason.length < minimumReasonLength) {
    throw new AuditReasonRequiredError();
  }

  return reason;
}

export function normalizeAuditLogAction(
  value: string | undefined
): AuditAction | null {
  const normalized = normalizeOptionalText(value)?.toUpperCase() ?? null;

  if (!normalized) {
    return null;
  }

  if (!auditActions.has(normalized)) {
    throw new ValidationDomainError("Invalid audit action");
  }

  return normalized as AuditAction;
}

export function normalizeAuditLogTargetType(
  value: string | undefined
): AuditTargetType | null {
  const normalized = normalizeOptionalText(value)?.toUpperCase() ?? null;

  if (!normalized) {
    return null;
  }

  if (!auditTargetTypes.has(normalized)) {
    throw new ValidationDomainError("Invalid audit target type");
  }

  return normalized as AuditTargetType;
}

export function normalizeAuditDate(value: string | undefined) {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return null;
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationDomainError("Invalid audit date");
  }

  return date;
}

export function normalizeAuditLogPage(value: number | undefined) {
  return normalizePage(value);
}

export function normalizeAuditLogPageSize(value: number | undefined) {
  return normalizePageSize(value);
}
