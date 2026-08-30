import { Inject, Injectable } from "@nestjs/common";
import {
  ADMIN_TRASH_REPOSITORY,
  type AdminTrashRepository,
  type ListAdminTrashRecoveryRequestsInput,
  type ListAdminTrashRecordsInput,
} from "@/modules/admin-operation/application/ports/admin-trash.repository";
import {
  AdminTrashDomain,
  type AdminTrashRecordsPageRecord,
  type AdminTrashRecoveryRequestsPageRecord,
  type AdminTrashRestoreWindowFilter,
  type AdminTrashSummaryRecord,
} from "@/modules/admin-operation/application/ports/admin-trash-read-model.types";
import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  TrashRecoveryRequestStatus,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import {
  AdminDomainUnsupportedError,
  AdminForbiddenError,
  AdminTargetNotFoundError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const DEFAULT_ADMIN_TRASH_LIMIT = 30;
const MAX_ADMIN_TRASH_LIMIT = 100;
const ADMIN_TRASH_DOMAINS = Object.values(AdminTrashDomain);
const ADMIN_TRASH_RESTORE_WINDOWS: readonly AdminTrashRestoreWindowFilter[] = [
  "ACTIVE",
  "EXPIRED",
  "ALL",
];
const TRASH_RECOVERY_REQUEST_STATUSES = Object.values(
  TrashRecoveryRequestStatus
);

// 역할 : AdminTrashRequestMetadata Admin Trash API 요청 추적 정보를 정의합니다.
export interface AdminTrashRequestMetadata {
  readonly requestId: string;
}

// 역할 : ListAdminTrashRecordsQueryInput Admin 사용자 Trash 목록 query 입력을 정의합니다.
export interface ListAdminTrashRecordsQueryInput {
  readonly domain?: string;
  readonly restoreWindow?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

// 역할 : ListAdminTrashRecoveryRequestsQueryInput Admin 복구 요청 queue query 입력을 정의합니다.
export interface ListAdminTrashRecoveryRequestsQueryInput {
  readonly status?: string;
  readonly targetType?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

// 역할 : AdminTrashApplicationService Admin Trash 운영 조회 유스케이스를 제공합니다.
@Injectable()
export class AdminTrashApplicationService {
  // 기능 : Admin Trash 저장소 구현체를 주입받습니다.
  constructor(
    @Inject(ADMIN_TRASH_REPOSITORY)
    private readonly adminTrashRepository: AdminTrashRepository
  ) {}

  // 기능 : Admin 사용자 Trash summary를 조회하고 감사 로그를 남깁니다.
  async getUserTrashSummary(
    currentUser: CurrentUserContext,
    userId: string,
    metadata: AdminTrashRequestMetadata
  ): Promise<AdminTrashSummaryRecord> {
    this.assertAdmin(currentUser);
    const now = new Date();

    const summary = await this.adminTrashRepository.runInTransaction(
      async (repository) => {
        await this.assertTargetUserExists(repository, userId);
        const trashSummary = await repository.getUserTrashSummary(userId, now);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: userId,
          targetType: AdminTargetType.USER,
          targetId: userId,
          action: AdminAuditAction.ADMIN_TRASH_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "userTrashSummary",
            total: trashSummary.total,
          },
        });

        return trashSummary;
      }
    );

    return summary;
  }

  // 기능 : Admin 사용자 Trash row 목록을 조회하고 감사 로그를 남깁니다.
  async listUserTrashRecords(
    currentUser: CurrentUserContext,
    userId: string,
    query: ListAdminTrashRecordsQueryInput,
    metadata: AdminTrashRequestMetadata
  ): Promise<AdminTrashRecordsPageRecord> {
    this.assertAdmin(currentUser);
    const input = this.toListUserTrashRecordsInput(userId, query, new Date());

    const page = await this.adminTrashRepository.runInTransaction(
      async (repository) => {
        await this.assertTargetUserExists(repository, userId);
        const recordsPage = await repository.listUserTrashRecords(input);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: userId,
          targetType: AdminTargetType.USER,
          targetId: userId,
          action: AdminAuditAction.ADMIN_TRASH_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "userTrashRecords",
            domain: input.domain ?? "ALL",
            restoreWindow: input.restoreWindow,
            limit: input.limit,
            hasCursor: Boolean(input.cursor),
          },
        });

        return recordsPage;
      }
    );

    return page;
  }

  // 기능 : Admin 전역 Trash 복구 요청 queue를 조회하고 감사 로그를 남깁니다.
  async listRecoveryRequests(
    currentUser: CurrentUserContext,
    query: ListAdminTrashRecoveryRequestsQueryInput,
    metadata: AdminTrashRequestMetadata
  ): Promise<AdminTrashRecoveryRequestsPageRecord> {
    this.assertAdmin(currentUser);
    const input = this.toListRecoveryRequestsInput(query);

    const page = await this.adminTrashRepository.runInTransaction(
      async (repository) => {
        const requestsPage = await repository.listRecoveryRequests(input);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: null,
          targetType: AdminTargetType.TRASH_RECORD,
          targetId: null,
          action: AdminAuditAction.ADMIN_TRASH_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "recoveryRequests",
            status: input.status ?? "ALL",
            targetType: input.targetType ?? "ALL",
            limit: input.limit,
            hasCursor: Boolean(input.cursor),
          },
        });

        return requestsPage;
      }
    );

    return page;
  }

  // 기능 : application 계층에서도 관리자 권한을 확인합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : 대상 사용자가 없으면 Admin not found 오류로 변환합니다.
  private async assertTargetUserExists(
    repository: AdminTrashRepository,
    userId: string
  ): Promise<void> {
    const exists = await repository.targetUserExists(userId);

    if (!exists) {
      throw new AdminTargetNotFoundError();
    }
  }

  // 기능 : Admin 사용자 Trash 목록 query를 저장소 입력으로 정규화합니다.
  private toListUserTrashRecordsInput(
    userId: string,
    query: ListAdminTrashRecordsQueryInput,
    now: Date
  ): ListAdminTrashRecordsInput {
    const domain = query.domain
      ? this.normalizeDomain(query.domain, "domain")
      : undefined;
    const restoreWindow = this.normalizeRestoreWindow(query.restoreWindow);
    const cursor = this.normalizeOptionalText(query.cursor);

    return {
      userId,
      restoreWindow,
      limit: this.normalizeLimit(query.limit),
      now,
      ...(domain ? { domain } : {}),
      ...(cursor ? { cursor } : {}),
    };
  }

  // 기능 : Admin 복구 요청 queue query를 저장소 입력으로 정규화합니다.
  private toListRecoveryRequestsInput(
    query: ListAdminTrashRecoveryRequestsQueryInput
  ): ListAdminTrashRecoveryRequestsInput {
    const status = this.normalizeRecoveryRequestStatus(query.status);
    const targetType = query.targetType
      ? this.normalizeDomain(query.targetType, "targetType")
      : undefined;
    const cursor = this.normalizeOptionalText(query.cursor);

    return {
      limit: this.normalizeLimit(query.limit),
      ...(status ? { status } : {}),
      ...(targetType ? { targetType } : {}),
      ...(cursor ? { cursor } : {}),
    };
  }

  // 기능 : Admin Trash domain/targetType query를 allowlist 기준으로 검증합니다.
  private normalizeDomain(value: string, field: "domain" | "targetType") {
    const normalized = value.trim().toUpperCase();

    if (!ADMIN_TRASH_DOMAINS.some((domain) => domain === normalized)) {
      throw field === "domain"
        ? new AdminDomainUnsupportedError()
        : new ValidationDomainError("targetType is not supported");
    }

    return normalized as AdminTrashDomain;
  }

  // 기능 : restoreWindow query를 API 계약 값으로 정규화합니다.
  private normalizeRestoreWindow(
    value: string | undefined
  ): AdminTrashRestoreWindowFilter {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (!normalized) {
      return "ALL";
    }

    if (
      !ADMIN_TRASH_RESTORE_WINDOWS.some((restoreWindow) => restoreWindow === normalized)
    ) {
      throw new ValidationDomainError("restoreWindow is not supported");
    }

    return normalized as AdminTrashRestoreWindowFilter;
  }

  // 기능 : 복구 요청 status query를 Prisma enum allowlist 기준으로 검증합니다.
  private normalizeRecoveryRequestStatus(
    value: string | undefined
  ): TrashRecoveryRequestStatus | undefined {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (!normalized) {
      return undefined;
    }

    if (
      !TRASH_RECOVERY_REQUEST_STATUSES.some((status) => status === normalized)
    ) {
      throw new ValidationDomainError("status is not supported");
    }

    return normalized as TrashRecoveryRequestStatus;
  }

  // 기능 : 비어 있는 문자열 query를 undefined로 정리합니다.
  private normalizeOptionalText(value: string | undefined): string | undefined {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  // 기능 : 조회 limit을 Admin API 계약 범위로 정규화합니다.
  private normalizeLimit(limit: number | undefined): number {
    if (limit === undefined) {
      return DEFAULT_ADMIN_TRASH_LIMIT;
    }

    return Math.min(Math.max(limit, 1), MAX_ADMIN_TRASH_LIMIT);
  }
}
