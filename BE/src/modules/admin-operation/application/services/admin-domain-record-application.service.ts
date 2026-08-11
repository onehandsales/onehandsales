import { Inject, Injectable } from "@nestjs/common";
import {
  ADMIN_DOMAIN_RECORD_REPOSITORY,
  AdminDomainRecordDomain,
  AdminDomainRecordSort,
  type AdminDomainRecordsPageRecord,
  type AdminDomainRecordRepository,
  type ListAdminDomainRecordsInput,
} from "@/modules/admin-operation/application/ports/admin-domain-record.repository";
import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@/modules/admin-operation/application/ports/admin-operation.types";
import {
  AdminDomainUnsupportedError,
  AdminForbiddenError,
  AdminTargetNotFoundError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const DEFAULT_DOMAIN_RECORD_LIMIT = 30;
const MAX_DOMAIN_RECORD_LIMIT = 100;
const MAX_DOMAIN_SEARCH_LENGTH = 100;

const ADMIN_DOMAIN_RECORD_DOMAINS = Object.values(AdminDomainRecordDomain);
const ADMIN_DOMAIN_RECORD_SORTS = Object.values(AdminDomainRecordSort);
const DELETED_SORT_SUPPORTED_DOMAINS: readonly AdminDomainRecordDomain[] = [
  AdminDomainRecordDomain.COMPANY,
  AdminDomainRecordDomain.CONTACT,
  AdminDomainRecordDomain.PRODUCT,
  AdminDomainRecordDomain.DEAL,
  AdminDomainRecordDomain.SCHEDULE,
  AdminDomainRecordDomain.MEETING_NOTE,
];

// 역할 : ListAdminDomainRecordsQueryInput Admin 도메인 read-only 목록 query 입력 구조를 정의합니다.
export interface ListAdminDomainRecordsQueryInput {
  readonly domain?: string;
  readonly q?: string;
  readonly includeDeleted?: boolean;
  readonly cursor?: string;
  readonly limit?: number;
  readonly sort?: string;
}

// 역할 : AdminDomainRecordRequestMetadata Admin 도메인 조회 요청 추적 정보를 정의합니다.
export interface AdminDomainRecordRequestMetadata {
  readonly requestId: string;
}

// 역할 : AdminDomainRecordApplicationService Admin 도메인 read-only 탭 유스케이스를 제공합니다.
@Injectable()
export class AdminDomainRecordApplicationService {
  // 기능 : Admin 도메인 read-only 저장소를 주입받습니다.
  constructor(
    @Inject(ADMIN_DOMAIN_RECORD_REPOSITORY)
    private readonly adminDomainRecordRepository: AdminDomainRecordRepository
  ) {}

  // 기능 : Admin 사용자 소유 도메인 row를 조회하고 조회 감사 로그를 남깁니다.
  async listDomainRecords(
    currentUser: CurrentUserContext,
    userId: string,
    query: ListAdminDomainRecordsQueryInput,
    metadata: AdminDomainRecordRequestMetadata
  ): Promise<AdminDomainRecordsPageRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. domain, filter, sort query를 저장소 입력으로 정규화합니다.
    const input = this.toListDomainRecordsInput(userId, query);

    // 3. 대상 사용자 확인, 도메인 조회, 감사 로그 생성을 같은 transaction에서 실행합니다.
    const page = await this.adminDomainRecordRepository.runInTransaction(
      async (repository) => {
        const targetExists = await repository.targetUserExists(userId);

        if (!targetExists) {
          throw new AdminTargetNotFoundError();
        }

        const recordsPage = await repository.listDomainRecords(input);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: userId,
          targetType: AdminTargetType.USER,
          targetId: userId,
          action: AdminAuditAction.ADMIN_DOMAIN_RECORDS_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            domain: input.domain,
            filterKeys: this.getActiveFilterKeys(input),
            qLength: input.q?.length ?? 0,
            includeDeleted: input.includeDeleted,
            limit: input.limit,
            sort: input.sort,
          },
        });

        return recordsPage;
      }
    );

    // 4. raw 원문 없이 안전 summary application page를 반환합니다.
    return page;
  }

  // 기능 : 관리자 권한이 아닌 application 호출을 거부합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : API query를 저장소 조회 입력으로 변환합니다.
  private toListDomainRecordsInput(
    userId: string,
    query: ListAdminDomainRecordsQueryInput
  ): ListAdminDomainRecordsInput {
    const domain = this.normalizeDomain(query.domain);
    const q = this.normalizeSearchQuery(query.q);
    const cursor = this.normalizeOptionalText(query.cursor);
    const sort = this.normalizeSort(domain, query.sort);

    return {
      userId,
      domain,
      includeDeleted: query.includeDeleted ?? false,
      limit: this.normalizeLimit(query.limit),
      sort,
      ...(q ? { q } : {}),
      ...(cursor ? { cursor } : {}),
    };
  }

  // 기능 : domain query가 G04 allowlist에 포함되는지 검증합니다.
  private normalizeDomain(value: string | undefined): AdminDomainRecordDomain {
    const normalized = this.normalizeOptionalText(value)?.toUpperCase();

    if (
      !normalized ||
      !ADMIN_DOMAIN_RECORD_DOMAINS.some((domain) => domain === normalized)
    ) {
      throw new AdminDomainUnsupportedError();
    }

    return normalized as AdminDomainRecordDomain;
  }

  // 기능 : sort query가 domain별 allowlist에 포함되는지 검증합니다.
  private normalizeSort(
    domain: AdminDomainRecordDomain,
    value: string | undefined
  ): AdminDomainRecordSort {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      return AdminDomainRecordSort.CREATED_AT_DESC;
    }

    if (!ADMIN_DOMAIN_RECORD_SORTS.some((sort) => sort === normalized)) {
      throw new ValidationDomainError("sort is not supported");
    }

    if (
      normalized === AdminDomainRecordSort.DELETED_AT_DESC &&
      !DELETED_SORT_SUPPORTED_DOMAINS.some((supported) => supported === domain)
    ) {
      throw new ValidationDomainError("deletedAt sort is not supported");
    }

    return normalized as AdminDomainRecordSort;
  }

  // 기능 : 검색어를 trim하고 길이 정책을 검증합니다.
  private normalizeSearchQuery(value: string | undefined): string | undefined {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      return undefined;
    }

    if (normalized.length > MAX_DOMAIN_SEARCH_LENGTH) {
      throw new ValidationDomainError("q must be 100 characters or fewer");
    }

    return normalized;
  }

  // 기능 : 비어 있는 문자열 query를 undefined로 정리합니다.
  private normalizeOptionalText(value: string | undefined): string | undefined {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  // 기능 : 조회 limit을 API 계약 범위로 정규화합니다.
  private normalizeLimit(limit: number | undefined): number {
    if (limit === undefined) {
      return DEFAULT_DOMAIN_RECORD_LIMIT;
    }

    return Math.min(Math.max(limit, 1), MAX_DOMAIN_RECORD_LIMIT);
  }

  // 기능 : audit metadata에 저장할 활성 filter key만 산출합니다.
  private getActiveFilterKeys(input: ListAdminDomainRecordsInput): string[] {
    return [
      ...(input.q ? ["q"] : []),
      ...(input.includeDeleted ? ["includeDeleted"] : []),
      ...(input.cursor ? ["cursor"] : []),
    ];
  }
}
