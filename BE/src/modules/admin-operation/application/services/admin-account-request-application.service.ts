import { Inject, Injectable } from "@nestjs/common";
import {
  ADMIN_ACCOUNT_REQUEST_REPOSITORY,
  type AdminAccountDeletionRequestsPageRecord,
  type AdminAccountRequestRepository,
  type AdminDataExportRequestsPageRecord,
  type ListAdminAccountDeletionRequestsInput,
  type ListAdminDataExportRequestsInput,
} from "@/modules/admin-operation/application/ports/admin-account-request.repository";
import {
  AccountDeletionRequestStatus,
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  UserDataExportRequestStatus,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import { AdminForbiddenError } from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const DEFAULT_ADMIN_ACCOUNT_REQUEST_LIMIT = 30;
const MAX_ADMIN_ACCOUNT_REQUEST_LIMIT = 100;
const ACCOUNT_DELETION_REQUEST_STATUSES = Object.values(
  AccountDeletionRequestStatus
);
const DATA_EXPORT_REQUEST_STATUSES = Object.values(UserDataExportRequestStatus);

// 역할 : AdminAccountRequestMetadata Admin 계정 데이터 요청 API 추적 정보를 정의합니다.
export interface AdminAccountRequestMetadata {
  readonly requestId: string;
}

// 역할 : ListAdminAccountDeletionRequestsQueryInput Admin 계정 삭제 요청 query 입력을 정의합니다.
export interface ListAdminAccountDeletionRequestsQueryInput {
  readonly status?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

// 역할 : ListAdminDataExportRequestsQueryInput Admin 데이터 export 요청 query 입력을 정의합니다.
export interface ListAdminDataExportRequestsQueryInput {
  readonly status?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

// 역할 : AdminAccountRequestApplicationService 계정 데이터 요청 Admin queue 유스케이스를 제공합니다.
@Injectable()
export class AdminAccountRequestApplicationService {
  // 기능 : Admin 계정 데이터 요청 저장소 구현체를 주입받습니다.
  constructor(
    @Inject(ADMIN_ACCOUNT_REQUEST_REPOSITORY)
    private readonly accountRequestRepository: AdminAccountRequestRepository
  ) {}

  // 기능 : Admin 계정 삭제 요청 queue를 조회하고 audit를 남깁니다.
  async listAccountDeletionRequests(
    currentUser: CurrentUserContext,
    query: ListAdminAccountDeletionRequestsQueryInput,
    metadata: AdminAccountRequestMetadata
  ): Promise<AdminAccountDeletionRequestsPageRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. queue query를 저장소 입력으로 정규화합니다.
    const input = this.toListAccountDeletionRequestsInput(query);

    // 3. queue 조회와 audit 생성을 같은 transaction으로 묶습니다.
    const page = await this.accountRequestRepository.runInTransaction(
      async (repository) => {
        const requestsPage =
          await repository.listAccountDeletionRequests(input);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: null,
          targetType: AdminTargetType.ACCOUNT_DELETION_REQUEST,
          targetId: null,
          action: AdminAuditAction.ADMIN_ACCOUNT_DELETION_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "accountDeletionRequests",
            status: input.status ?? "ALL",
            limit: input.limit,
            hasCursor: Boolean(input.cursor),
          },
        });

        return requestsPage;
      }
    );

    // 4. 사용자 email masking과 reasonMessage 제외가 적용된 application page를 반환합니다.
    return page;
  }

  // 기능 : Admin 데이터 export 요청 queue를 조회하고 audit를 남깁니다.
  async listDataExportRequests(
    currentUser: CurrentUserContext,
    query: ListAdminDataExportRequestsQueryInput,
    metadata: AdminAccountRequestMetadata
  ): Promise<AdminDataExportRequestsPageRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. queue query를 저장소 입력으로 정규화합니다.
    const input = this.toListDataExportRequestsInput(query);

    // 3. queue 조회와 audit 생성을 같은 transaction으로 묶습니다.
    const page = await this.accountRequestRepository.runInTransaction(
      async (repository) => {
        const requestsPage = await repository.listDataExportRequests(input);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: null,
          targetType: AdminTargetType.DATA_EXPORT_REQUEST,
          targetId: null,
          action: AdminAuditAction.ADMIN_DATA_EXPORT_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "dataExportRequests",
            status: input.status ?? "ALL",
            limit: input.limit,
            hasCursor: Boolean(input.cursor),
          },
        });

        return requestsPage;
      }
    );

    // 4. export artifact/internal storage 정보 없이 queue application page를 반환합니다.
    return page;
  }

  // 기능 : 관리자 권한이 아닌 application 호출을 거부합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : Admin 계정 삭제 요청 query를 저장소 입력으로 정규화합니다.
  private toListAccountDeletionRequestsInput(
    query: ListAdminAccountDeletionRequestsQueryInput
  ): ListAdminAccountDeletionRequestsInput {
    const status = this.normalizeAccountDeletionStatus(query.status);
    const cursor = this.normalizeOptionalText(query.cursor);

    return {
      limit: this.normalizeLimit(query.limit),
      ...(status ? { status } : {}),
      ...(cursor ? { cursor } : {}),
    };
  }

  // 기능 : Admin 데이터 export 요청 query를 저장소 입력으로 정규화합니다.
  private toListDataExportRequestsInput(
    query: ListAdminDataExportRequestsQueryInput
  ): ListAdminDataExportRequestsInput {
    const status = this.normalizeDataExportStatus(query.status);
    const cursor = this.normalizeOptionalText(query.cursor);

    return {
      limit: this.normalizeLimit(query.limit),
      ...(status ? { status } : {}),
      ...(cursor ? { cursor } : {}),
    };
  }

  // 기능 : 계정 삭제 요청 status query를 Prisma enum allowlist 기준으로 정규화합니다.
  private normalizeAccountDeletionStatus(
    value: string | undefined
  ): AccountDeletionRequestStatus | undefined {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (!normalized || normalized === "ALL") {
      return undefined;
    }

    if (
      !ACCOUNT_DELETION_REQUEST_STATUSES.some((status) => status === normalized)
    ) {
      throw new ValidationDomainError("account deletion status is not supported");
    }

    return normalized as AccountDeletionRequestStatus;
  }

  // 기능 : 데이터 export 요청 status query를 Prisma enum allowlist 기준으로 정규화합니다.
  private normalizeDataExportStatus(
    value: string | undefined
  ): UserDataExportRequestStatus | undefined {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (!normalized || normalized === "ALL") {
      return undefined;
    }

    if (!DATA_EXPORT_REQUEST_STATUSES.some((status) => status === normalized)) {
      throw new ValidationDomainError("data export status is not supported");
    }

    return normalized as UserDataExportRequestStatus;
  }

  // 기능 : cursor/문자열 query의 공백을 제거하고 빈 값을 undefined로 변환합니다.
  private normalizeOptionalText(value: string | undefined): string | undefined {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  // 기능 : Admin queue page size를 기본값과 최대값 사이로 정규화합니다.
  private normalizeLimit(value: number | undefined): number {
    if (!value) {
      return DEFAULT_ADMIN_ACCOUNT_REQUEST_LIMIT;
    }

    return Math.min(Math.max(1, value), MAX_ADMIN_ACCOUNT_REQUEST_LIMIT);
  }
}
