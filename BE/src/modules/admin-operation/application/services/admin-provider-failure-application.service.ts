import { Inject, Injectable } from "@nestjs/common";
import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@prisma/client";
import {
  ADMIN_PROVIDER_FAILURE_REPOSITORY,
  AdminProviderFailureFeatureArea,
  AdminProviderFailureType,
  type AdminProviderFailureDetailRecord,
  type AdminProviderFailureListPageRecord,
  type AdminProviderFailureRepository,
  type AdminProviderFailureStatusFilter,
  type ListAdminProviderFailuresInput,
} from "@/modules/admin-operation/application/ports/admin-provider-failure.repository";
import {
  AdminForbiddenError,
  AdminTargetNotFoundError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const DEFAULT_PROVIDER_FAILURE_LIMIT = 50;
const MAX_PROVIDER_FAILURE_LIMIT = 100;
const PROVIDER_FAILURE_STATUS_FILTERS: readonly AdminProviderFailureStatusFilter[] = [
  "FAILED",
  "RETRYABLE",
  "ALL",
];

// 역할 : ListAdminProviderFailuresQueryInput Admin provider 실패 목록 query 입력을 정의합니다.
export interface ListAdminProviderFailuresQueryInput {
  readonly providerType?: string;
  readonly featureArea?: string;
  readonly status?: string;
  readonly retryable?: string;
  readonly userId?: string;
  readonly from?: string;
  readonly to?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

// 역할 : AdminProviderFailureRequestMetadata Admin provider 실패 API 요청 추적 정보를 정의합니다.
export interface AdminProviderFailureRequestMetadata {
  readonly requestId: string;
}

// 역할 : AdminProviderFailureApplicationService Admin provider 실패 운영 조회 유스케이스를 제공합니다.
@Injectable()
export class AdminProviderFailureApplicationService {
  // 기능 : Admin provider 실패 저장소 구현체를 주입받습니다.
  constructor(
    @Inject(ADMIN_PROVIDER_FAILURE_REPOSITORY)
    private readonly providerFailureRepository: AdminProviderFailureRepository
  ) {}

  // 기능 : Admin provider 실패 목록을 조회하고 목록 조회 감사 로그를 남깁니다.
  async listProviderFailures(
    currentUser: CurrentUserContext,
    query: ListAdminProviderFailuresQueryInput,
    metadata: AdminProviderFailureRequestMetadata
  ): Promise<AdminProviderFailureListPageRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. provider 실패 목록 query를 저장소 입력으로 정규화합니다.
    const input = this.toListProviderFailuresInput(query);

    // 3. 목록 조회와 감사 로그 생성을 같은 transaction에서 실행합니다.
    const page = await this.providerFailureRepository.runInTransaction(
      async (repository) => {
        const listPage = await repository.listProviderFailures(input);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: input.userId ?? null,
          targetType: AdminTargetType.PROVIDER_FAILURE,
          targetId: null,
          action: AdminAuditAction.ADMIN_PROVIDER_FAILURE_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "providerFailureList",
            filterKeys: this.getActiveFilterKeys(input),
            providerType: input.providerType ?? "ALL",
            featureArea: input.featureArea ?? "ALL",
            status: input.status,
            retryable: input.retryable ?? null,
            limit: input.limit,
            hasCursor: Boolean(input.cursor),
            userFiltered: Boolean(input.userId),
          },
        });

        return listPage;
      }
    );

    // 4. 사용자 email 안전 값이 포함된 application page를 반환합니다.
    return page;
  }

  // 기능 : Admin provider 실패 상세를 조회하고 상세 조회 감사 로그를 남깁니다.
  async getProviderFailureDetail(
    currentUser: CurrentUserContext,
    failureId: string,
    metadata: AdminProviderFailureRequestMetadata
  ): Promise<AdminProviderFailureDetailRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. 상세 safe context 조회와 감사 로그 생성을 같은 transaction에서 실행합니다.
    const detail = await this.providerFailureRepository.runInTransaction(
      async (repository) => {
        const failureDetail = await repository.getProviderFailureDetail(
          failureId
        );

        if (!failureDetail) {
          throw new AdminTargetNotFoundError();
        }

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: failureDetail.userId,
          targetType: AdminTargetType.PROVIDER_FAILURE,
          targetId: failureDetail.sourceId,
          action: AdminAuditAction.ADMIN_PROVIDER_FAILURE_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "providerFailureDetail",
            failureIdPrefix: failureDetail.id.split(":")[0] ?? "UNKNOWN",
            providerType: failureDetail.providerType,
            sourceModel: failureDetail.sourceModel,
            featureArea: failureDetail.featureArea,
            status: failureDetail.status,
            retryable: failureDetail.retryable,
            safeErrorCode: failureDetail.safeErrorCode,
          },
        });

        return failureDetail;
      }
    );

    // 3. safeContext만 포함한 application detail을 반환합니다.
    return detail;
  }

  // 기능 : 관리자 권한이 아닌 application 호출을 거부합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : provider 실패 목록 query를 저장소 입력으로 변환합니다.
  private toListProviderFailuresInput(
    query: ListAdminProviderFailuresQueryInput
  ): ListAdminProviderFailuresInput {
    const providerType = this.normalizeProviderType(query.providerType);
    const featureArea = this.normalizeFeatureArea(query.featureArea);
    const status = this.normalizeStatusFilter(query.status);
    const retryable = this.normalizeBooleanFilter(query.retryable, "retryable");
    const userId = this.normalizeOptionalText(query.userId);
    const cursor = this.normalizeOptionalText(query.cursor);
    const from = this.parseOptionalInstant(query.from, "from");
    const to = this.parseOptionalInstant(query.to, "to");

    this.assertDateRange(from, to);

    return {
      status,
      limit: this.normalizeLimit(query.limit),
      ...(providerType ? { providerType } : {}),
      ...(featureArea ? { featureArea } : {}),
      ...(retryable !== undefined ? { retryable } : {}),
      ...(userId ? { userId } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(cursor ? { cursor } : {}),
    };
  }

  // 기능 : providerType query를 allowlist 기준으로 정규화합니다.
  private normalizeProviderType(
    value: string | undefined
  ): AdminProviderFailureType | undefined {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (!normalized) {
      return undefined;
    }

    if (!Object.values(AdminProviderFailureType).some((item) => item === normalized)) {
      throw new ValidationDomainError("providerType is not supported");
    }

    return normalized as AdminProviderFailureType;
  }

  // 기능 : featureArea query를 allowlist 기준으로 정규화합니다.
  private normalizeFeatureArea(
    value: string | undefined
  ): AdminProviderFailureFeatureArea | undefined {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (!normalized) {
      return undefined;
    }

    if (
      !Object.values(AdminProviderFailureFeatureArea).some(
        (item) => item === normalized
      )
    ) {
      throw new ValidationDomainError("featureArea is not supported");
    }

    return normalized as AdminProviderFailureFeatureArea;
  }

  // 기능 : status query를 Admin provider 실패 filter 값으로 정규화합니다.
  private normalizeStatusFilter(
    value: string | undefined
  ): AdminProviderFailureStatusFilter {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (!normalized) {
      return "ALL";
    }

    if (
      !PROVIDER_FAILURE_STATUS_FILTERS.some((status) => status === normalized)
    ) {
      throw new ValidationDomainError("status is not supported");
    }

    return normalized as AdminProviderFailureStatusFilter;
  }

  // 기능 : boolean query 문자열을 true/false 값으로 정규화합니다.
  private normalizeBooleanFilter(
    value: string | undefined,
    field: string
  ): boolean | undefined {
    const normalized = this.normalizeOptionalText(value)?.toLowerCase();

    if (!normalized) {
      return undefined;
    }

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }

    throw new ValidationDomainError(`${field} must be true or false`);
  }

  // 기능 : 비어 있는 문자열 query를 undefined로 정리합니다.
  private normalizeOptionalText(value: string | undefined): string | undefined {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  // 기능 : 조회 limit을 Admin API 계약 범위로 정규화합니다.
  private normalizeLimit(limit: number | undefined): number {
    if (limit === undefined) {
      return DEFAULT_PROVIDER_FAILURE_LIMIT;
    }

    return Math.min(Math.max(limit, 1), MAX_PROVIDER_FAILURE_LIMIT);
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

  // 기능 : provider 실패 조회 날짜 범위의 시작과 끝 순서를 검증합니다.
  private assertDateRange(from: Date | undefined, to: Date | undefined): void {
    if (from && to && from.getTime() > to.getTime()) {
      throw new ValidationDomainError("from must be earlier than to");
    }
  }

  // 기능 : audit metadata에 저장할 활성 filter key만 산출합니다.
  private getActiveFilterKeys(input: ListAdminProviderFailuresInput): string[] {
    return [
      ...(input.providerType ? ["providerType"] : []),
      ...(input.featureArea ? ["featureArea"] : []),
      ...(input.status !== "ALL" ? ["status"] : []),
      ...(input.retryable !== undefined ? ["retryable"] : []),
      ...(input.userId ? ["userId"] : []),
      ...(input.from ? ["from"] : []),
      ...(input.to ? ["to"] : []),
      ...(input.cursor ? ["cursor"] : []),
    ];
  }
}
