import { Inject, Injectable } from "@nestjs/common";
import {
  ADMIN_SENSITIVE_REPOSITORY,
  type AdminSensitiveRepository,
} from "@/modules/admin/application/ports/admin-sensitive.repository";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { normalizeOptionalText } from "./admin-query-input";
import {
  normalizeAuditDate,
  normalizeAuditLogAction,
  normalizeAuditLogPage,
  normalizeAuditLogPageSize,
  normalizeAuditLogTargetType,
  normalizeAuditReason,
  normalizeSensitiveFields,
  normalizeSensitiveTargetType,
} from "./admin-sensitive-input";

export interface SensitiveRawRequest {
  readonly targetType?: string;
  readonly targetId?: string;
  readonly fields?: readonly string[];
  readonly reason?: string;
}

export interface SensitiveRawByPathRequest {
  readonly fields?: readonly string[];
  readonly reason?: string;
}

export interface AdminActorContext {
  readonly actorUserId: string;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
}

export interface AdminAuditLogQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly actorUserId?: string;
  readonly targetUserId?: string;
  readonly action?: string;
  readonly targetType?: string;
  readonly from?: string;
  readonly to?: string;
}

@Injectable()
export class AdminSensitiveUseCase {
  constructor(
    @Inject(ADMIN_SENSITIVE_REPOSITORY)
    private readonly adminSensitiveRepository: AdminSensitiveRepository
  ) {}

  viewSensitiveRawData(context: AdminActorContext, request: SensitiveRawRequest) {
    return this.adminSensitiveRepository.viewRawData({
      actorUserId: context.actorUserId,
      targetType: normalizeSensitiveTargetType(request.targetType),
      targetId: normalizeRequiredId(request.targetId, "targetId"),
      fields: normalizeSensitiveFields(request.fields),
      reason: normalizeAuditReason(request.reason),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  viewDealSensitiveRawData(
    context: AdminActorContext,
    dealId: string,
    request: SensitiveRawByPathRequest
  ) {
    return this.adminSensitiveRepository.viewRawData({
      actorUserId: context.actorUserId,
      targetType: "DEAL",
      targetId: normalizeRequiredId(dealId, "dealId"),
      fields: normalizeSensitiveFields(request.fields),
      reason: normalizeAuditReason(request.reason),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  viewMeetingNoteSensitiveRawData(
    context: AdminActorContext,
    meetingNoteId: string,
    request: SensitiveRawByPathRequest
  ) {
    return this.adminSensitiveRepository.viewRawData({
      actorUserId: context.actorUserId,
      targetType: "MEETING_NOTE",
      targetId: normalizeRequiredId(meetingNoteId, "meetingNoteId"),
      fields: normalizeSensitiveFields(request.fields),
      reason: normalizeAuditReason(request.reason),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  listAuditLogs(query: AdminAuditLogQuery) {
    return this.adminSensitiveRepository.listAuditLogs({
      page: normalizeAuditLogPage(query.page),
      pageSize: normalizeAuditLogPageSize(query.pageSize),
      actorUserId: normalizeOptionalText(query.actorUserId),
      targetUserId: normalizeOptionalText(query.targetUserId),
      action: normalizeAuditLogAction(query.action),
      targetType: normalizeAuditLogTargetType(query.targetType),
      from: normalizeAuditDate(query.from),
      to: normalizeAuditDate(query.to),
    });
  }

  getAuditLog(auditLogId: string) {
    return this.adminSensitiveRepository.getAuditLog(
      normalizeRequiredId(auditLogId, "auditLogId")
    );
  }
}

function normalizeRequiredId(value: string | undefined, fieldName: string) {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    throw new ValidationDomainError(`${fieldName} is required`);
  }

  return normalized;
}
