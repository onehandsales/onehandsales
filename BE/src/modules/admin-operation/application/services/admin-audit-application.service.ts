import { createHash } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import {
  AdminAuditResult,
  AdminSensitiveFieldSet,
  AdminTargetType,
  type AdminAuditAction,
} from "@prisma/client";
import {
  ADMIN_AUDIT_REPOSITORY,
  type AdminAuditLogPageRecord,
  type AdminAuditRepository,
  type AdminSensitiveAccessRecord,
  type AdminSensitiveRawDataRecord,
  type ListAdminAuditLogsInput,
} from "@/modules/admin-operation/application/ports/admin-audit.repository";
import {
  AdminForbiddenError,
  AdminReasonRequiredError,
  AdminSensitiveFieldSetUnsupportedError,
  AdminTargetNotFoundError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_AUDIT_LOG_LIMIT = 50;
const MAX_AUDIT_LOG_LIMIT = 100;
const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 1000;

// 역할 : ListAdminAuditLogsQueryInput Admin 감사 로그 목록 query 입력 구조를 정의합니다.
export interface ListAdminAuditLogsQueryInput {
  readonly cursor?: string;
  readonly limit?: number;
  readonly adminUserId?: string;
  readonly targetUserId?: string;
  readonly action?: AdminAuditAction;
  readonly result?: AdminAuditResult;
  readonly from?: string;
  readonly to?: string;
}

// 역할 : AdminSensitiveRawAccessCommand 민감 원문 조회 command 구조를 정의합니다.
export interface AdminSensitiveRawAccessCommand {
  readonly targetUserId: string;
  readonly targetType: AdminTargetType;
  readonly targetId: string;
  readonly fieldSet: AdminSensitiveFieldSet;
  readonly reason?: string;
}

// 역할 : AdminRequestMetadata Admin API 요청 추적 정보를 정의합니다.
export interface AdminRequestMetadata {
  readonly requestId: string;
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
}

// 역할 : AdminSensitiveRawAccessApplicationResult 민감 원문 조회 application 결과를 정의합니다.
export interface AdminSensitiveRawAccessApplicationResult {
  readonly rawData: AdminSensitiveRawDataRecord;
  readonly accessLog: AdminSensitiveAccessRecord;
}

// 역할 : AdminAuditApplicationService Admin 감사 로그와 민감 원문 조회 유스케이스를 제공합니다.
@Injectable()
export class AdminAuditApplicationService {
  // 기능 : Admin 감사 저장소와 logger를 주입받습니다.
  constructor(
    @Inject(ADMIN_AUDIT_REPOSITORY)
    private readonly adminAuditRepository: AdminAuditRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : Admin 감사 로그 목록을 조회하고 application page로 반환합니다.
  async listAuditLogs(
    currentUser: CurrentUserContext,
    query: ListAdminAuditLogsQueryInput
  ): Promise<AdminAuditLogPageRecord> {
    // 1. application 계층에서도 관리자 권한을 한 번 더 확인합니다.
    this.assertAdmin(currentUser);

    // 2. query 입력을 저장소 조회 조건으로 정규화합니다.
    const repositoryInput = this.toListAuditLogsInput(query);

    // 3. 날짜 범위가 뒤집힌 경우 안전한 검증 오류로 처리합니다.
    this.assertDateRange(repositoryInput.from, repositoryInput.to);

    // 4. 감사 로그 application page를 반환합니다.
    const page = await this.adminAuditRepository.listAuditLogs(repositoryInput);

    return page;
  }

  // 기능 : 민감 원문 조회 사유를 검증하고 감사 로그를 같은 transaction에서 생성합니다.
  async accessSensitiveRawData(
    currentUser: CurrentUserContext,
    command: AdminSensitiveRawAccessCommand,
    metadata: AdminRequestMetadata
  ): Promise<AdminSensitiveRawAccessApplicationResult> {
    // 1. application 계층에서도 관리자 권한을 한 번 더 확인합니다.
    this.assertAdmin(currentUser);

    // 2. 사유와 fieldSet allowlist를 원문 조회 전에 검증합니다.
    const reason = this.normalizeReason(command.reason);
    this.assertSupportedSensitiveAccess(command);

    // 3. 원문 조회와 감사 로그 생성을 하나의 transaction에 묶습니다.
    const transactionResult =
      await this.adminAuditRepository.runInTransaction(async (repository) => {
        const rawData = await this.findSensitiveRawData(repository, command);

        if (!rawData) {
          throw new AdminTargetNotFoundError();
        }

        const accessLog = await repository.createSensitiveAccessLog({
          adminUserId: currentUser.id,
          targetUserId: command.targetUserId,
          targetType: command.targetType,
          targetId: command.targetId,
          fieldSet: command.fieldSet,
          reason,
          requestId: metadata.requestId,
          ipHash: this.hashOptionalValue(metadata.ipAddress),
          userAgentHash: this.hashOptionalValue(metadata.userAgent),
          returnedFieldNames: rawData.returnedFieldNames,
        });

        return { rawData, accessLog };
      });

    // 4. 원문 값 없이 구조화 운영 이벤트만 남깁니다.
    this.logSensitiveRawAccess(currentUser, command, metadata, transactionResult);

    // 5. 감사 기록 생성 이후 허용 필드 원문과 access log를 application 결과로 반환합니다.
    return transactionResult;
  }

  // 기능 : 관리자 권한이 아닌 application 호출을 거부합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : 감사 로그 조회 limit을 API 계약 범위로 정규화합니다.
  private normalizeLimit(limit: number | undefined): number {
    if (limit === undefined) {
      return DEFAULT_AUDIT_LOG_LIMIT;
    }

    return Math.min(Math.max(limit, 1), MAX_AUDIT_LOG_LIMIT);
  }

  // 기능 : 비어 있는 문자열 query를 undefined로 정리합니다.
  private normalizeOptionalText(value: string | undefined): string | undefined {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  // 기능 : ISO instant 문자열을 Date로 변환합니다.
  private parseOptionalInstant(
    value: string | undefined,
    field: "from" | "to"
  ): Date | undefined {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      return undefined;
    }

    const parsedDate = new Date(normalized);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new ValidationDomainError(`${field} must be a valid ISO instant`);
    }

    return parsedDate;
  }

  // 기능 : API query를 exact optional property에 맞는 저장소 입력으로 변환합니다.
  private toListAuditLogsInput(
    query: ListAdminAuditLogsQueryInput
  ): ListAdminAuditLogsInput {
    const cursor = this.normalizeOptionalText(query.cursor);
    const adminUserId = this.normalizeOptionalText(query.adminUserId);
    const targetUserId = this.normalizeOptionalText(query.targetUserId);
    const from = this.parseOptionalInstant(query.from, "from");
    const to = this.parseOptionalInstant(query.to, "to");

    return {
      limit: this.normalizeLimit(query.limit),
      ...(cursor ? { cursor } : {}),
      ...(adminUserId ? { adminUserId } : {}),
      ...(targetUserId ? { targetUserId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.result ? { result: query.result } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
  }

  // 기능 : 날짜 범위 query의 시작과 끝 순서를 검증합니다.
  private assertDateRange(from: Date | undefined, to: Date | undefined): void {
    if (from && to && from.getTime() > to.getTime()) {
      throw new ValidationDomainError("from must be earlier than to");
    }
  }

  // 기능 : 민감 원문 조회 사유를 공백 정리 후 길이 정책으로 검증합니다.
  private normalizeReason(reason: string | undefined): string {
    const normalized = reason?.trim().replace(/\s+/g, " ") ?? "";

    if (
      normalized.length < MIN_REASON_LENGTH ||
      normalized.length > MAX_REASON_LENGTH
    ) {
      throw new AdminReasonRequiredError();
    }

    return normalized;
  }

  // 기능 : G02에서 허용한 targetType과 fieldSet 조합만 통과시킵니다.
  private assertSupportedSensitiveAccess(
    command: AdminSensitiveRawAccessCommand
  ): void {
    if (
      command.targetType === AdminTargetType.USER &&
      command.fieldSet === AdminSensitiveFieldSet.USER_CONTACT
    ) {
      return;
    }

    if (
      command.targetType === AdminTargetType.MEETING_NOTE &&
      command.fieldSet === AdminSensitiveFieldSet.MEETING_NOTE_BODY
    ) {
      return;
    }

    throw new AdminSensitiveFieldSetUnsupportedError();
  }

  // 기능 : allowlist 조합에 맞는 저장소 조회 메서드를 선택합니다.
  private findSensitiveRawData(
    repository: AdminAuditRepository,
    command: AdminSensitiveRawAccessCommand
  ): Promise<AdminSensitiveRawDataRecord | null> {
    if (
      command.targetType === AdminTargetType.USER &&
      command.fieldSet === AdminSensitiveFieldSet.USER_CONTACT
    ) {
      return repository.findUserContact({
        targetUserId: command.targetUserId,
        targetId: command.targetId,
      });
    }

    if (
      command.targetType === AdminTargetType.MEETING_NOTE &&
      command.fieldSet === AdminSensitiveFieldSet.MEETING_NOTE_BODY
    ) {
      return repository.findMeetingNoteBody({
        targetUserId: command.targetUserId,
        targetId: command.targetId,
      });
    }

    throw new AdminSensitiveFieldSetUnsupportedError();
  }

  // 기능 : IP, User-Agent 원문 대신 SHA-256 hash 문자열을 생성합니다.
  private hashOptionalValue(value: string | null | undefined): string | null {
    const normalized = value?.trim();

    if (!normalized) {
      return null;
    }

    return createHash("sha256").update(normalized).digest("hex");
  }

  // 기능 : 민감 원문 값 없는 운영 이벤트 로그를 기록합니다.
  private logSensitiveRawAccess(
    currentUser: CurrentUserContext,
    command: AdminSensitiveRawAccessCommand,
    metadata: AdminRequestMetadata,
    result: AdminSensitiveRawAccessApplicationResult
  ): void {
    this.logger.log(
      JSON.stringify({
        event: "admin.sensitiveRawAccess.requested",
        adminUserId: currentUser.id,
        targetType: command.targetType,
        fieldSet: command.fieldSet,
        returnedFieldCount: result.rawData.returnedFieldNames.length,
        requestId: metadata.requestId,
        accessId: result.accessLog.id,
      }),
      "AdminAuditApplicationService"
    );
  }
}
