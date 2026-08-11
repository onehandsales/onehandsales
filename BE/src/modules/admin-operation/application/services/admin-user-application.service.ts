import { Inject, Injectable } from "@nestjs/common";
import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
  UserStatus,
} from "@prisma/client";
import {
  ADMIN_USER_REPOSITORY,
  type AdminUserActivityTimelinePageRecord,
  type AdminUserListPageRecord,
  AdminUserListSort,
  type AdminUserOverviewRecord,
  type AdminUserRepository,
  type ListAdminUserActivityTimelineInput,
  type ListAdminUsersInput,
} from "@/modules/admin-operation/application/ports/admin-user.repository";
import {
  AdminForbiddenError,
  AdminUserNotFoundError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const DEFAULT_USER_LIST_LIMIT = 50;
const DEFAULT_TIMELINE_LIMIT = 30;
const MAX_LIMIT = 100;
const MAX_QUERY_LENGTH = 100;

const ADMIN_USER_TIMELINE_EVENT_TYPES = [
  "app_route_viewed",
  "business_card_capture_started",
  "business_card_capture_retried",
  "meeting_note_recording_started",
  "meeting_note_recording_completed",
  "meeting_note_recording_failed",
  "local_draft_saved",
  "local_draft_restored",
  "local_draft_discarded",
  "mobile_push_permission_prompt_opened",
  "mobile_push_permission_result",
  "auth_signup_completed",
  "deal_created",
  "deal_next_action_created",
  "schedule_created",
  "schedule_deal_linked",
  "meeting_note_created",
  "meeting_note_deal_linked",
  "business_card_scan_confirmed",
  "business_card_ocr_failed",
  "import_confirmed",
  "export_downloaded",
  "company_created",
  "contact_created",
  "product_created",
  "business_card_scan_created",
  "import_job_created",
] as const;

// 역할 : ListAdminUsersQueryInput Admin 사용자 목록 query 입력 구조를 정의합니다.
export interface ListAdminUsersQueryInput {
  readonly q?: string;
  readonly status?: UserStatus;
  readonly countryCode?: string;
  readonly preferredLocale?: string;
  readonly cursor?: string;
  readonly limit?: number;
  readonly sort?: AdminUserListSort;
}

// 역할 : ListAdminUserActivityTimelineQueryInput Admin 사용자 활동 query 입력 구조를 정의합니다.
export interface ListAdminUserActivityTimelineQueryInput {
  readonly cursor?: string;
  readonly limit?: number;
  readonly from?: string;
  readonly to?: string;
  readonly eventType?: string;
}

// 역할 : AdminUserRequestMetadata Admin 사용자 운영 API 요청 추적 정보를 정의합니다.
export interface AdminUserRequestMetadata {
  readonly requestId: string;
}

// 역할 : AdminUserApplicationService Admin 사용자 overview 유스케이스를 제공합니다.
@Injectable()
export class AdminUserApplicationService {
  // 기능 : Admin 사용자 저장소를 주입받습니다.
  constructor(
    @Inject(ADMIN_USER_REPOSITORY)
    private readonly adminUserRepository: AdminUserRepository
  ) {}

  // 기능 : Admin 사용자 목록을 조회하고 목록 조회 감사 로그를 남깁니다.
  async listUsers(
    currentUser: CurrentUserContext,
    query: ListAdminUsersQueryInput,
    metadata: AdminUserRequestMetadata
  ): Promise<AdminUserListPageRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. 사용자 목록 query를 저장소 입력으로 정규화합니다.
    const input = this.toListUsersInput(query);
    const now = new Date();

    // 3. 목록 조회와 감사 로그 생성을 같은 transaction에서 실행합니다.
    const page = await this.adminUserRepository.runInTransaction(
      async (repository) => {
        const listPage = await repository.listUsers(input, now);

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: null,
          targetType: AdminTargetType.USER,
          targetId: null,
          action: AdminAuditAction.ADMIN_USER_LIST_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            filterKeys: this.getActiveFilterKeys(input),
            qLength: input.q?.length ?? 0,
            limit: input.limit,
            sort: input.sort,
          },
        });

        return listPage;
      }
    );

    // 4. email/displayName 원문을 포함한 application page를 반환합니다.
    return page;
  }

  // 기능 : Admin 사용자 상세 overview를 조회하고 상세 조회 감사 로그를 남깁니다.
  async getUserOverview(
    currentUser: CurrentUserContext,
    userId: string,
    metadata: AdminUserRequestMetadata
  ): Promise<AdminUserOverviewRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. 사용자 상세 조회와 감사 로그 생성을 같은 transaction에서 실행합니다.
    const overview = await this.adminUserRepository.runInTransaction(
      async (repository) => {
        const userOverview = await repository.getUserOverview(userId, new Date());

        if (!userOverview) {
          throw new AdminUserNotFoundError();
        }

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: userId,
          targetType: AdminTargetType.USER,
          targetId: userId,
          action: AdminAuditAction.ADMIN_USER_DETAIL_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            viewedSections: [
              "profile",
              "domainCounts",
              "trashSummary",
              "analyticsSummary",
              "notificationSummary",
            ],
          },
        });

        return userOverview;
      }
    );

    // 3. profile 원문을 포함한 application overview를 반환합니다.
    return overview;
  }

  // 기능 : Admin 사용자 활동 timeline을 안전한 event summary로 조회합니다.
  async listActivityTimeline(
    currentUser: CurrentUserContext,
    userId: string,
    query: ListAdminUserActivityTimelineQueryInput
  ): Promise<AdminUserActivityTimelinePageRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. timeline query를 저장소 입력으로 정규화합니다.
    const input = this.toTimelineInput(userId, query);

    // 3. 안전한 title/summary만 포함한 timeline read model을 조회합니다.
    const page = await this.adminUserRepository.listActivityTimeline(input);

    // 4. 대상 사용자가 없으면 target not found로 처리합니다.
    if (page.items.length === 0) {
      const overview = await this.adminUserRepository.getUserOverview(
        userId,
        new Date()
      );

      if (!overview) {
        throw new AdminUserNotFoundError();
      }
    }

    return page;
  }

  // 기능 : 관리자 권한이 아닌 application 호출을 거부합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : 사용자 목록 query를 저장소 입력으로 변환합니다.
  private toListUsersInput(query: ListAdminUsersQueryInput): ListAdminUsersInput {
    const q = this.normalizeSearchQuery(query.q);
    const countryCode = this.normalizeUpperText(query.countryCode);
    const preferredLocale = this.normalizeOptionalText(query.preferredLocale);
    const cursor = this.normalizeOptionalText(query.cursor);

    return {
      limit: this.normalizeLimit(query.limit, DEFAULT_USER_LIST_LIMIT),
      sort: query.sort ?? AdminUserListSort.CREATED_AT_DESC,
      ...(q ? { q } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(countryCode ? { countryCode } : {}),
      ...(preferredLocale ? { preferredLocale } : {}),
      ...(cursor ? { cursor } : {}),
    };
  }

  // 기능 : 사용자 활동 timeline query를 저장소 입력으로 변환합니다.
  private toTimelineInput(
    userId: string,
    query: ListAdminUserActivityTimelineQueryInput
  ): ListAdminUserActivityTimelineInput {
    const cursor = this.normalizeOptionalText(query.cursor);
    const eventType = this.normalizeEventType(query.eventType);
    const from = this.parseOptionalInstant(query.from, "from");
    const to = this.parseOptionalInstant(query.to, "to");

    this.assertDateRange(from, to);

    return {
      userId,
      limit: this.normalizeLimit(query.limit, DEFAULT_TIMELINE_LIMIT),
      ...(cursor ? { cursor } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(eventType ? { eventType } : {}),
    };
  }

  // 기능 : 검색어를 trim하고 길이 정책을 검증합니다.
  private normalizeSearchQuery(value: string | undefined): string | undefined {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      return undefined;
    }

    if (normalized.length > MAX_QUERY_LENGTH) {
      throw new ValidationDomainError("q must be 100 characters or fewer");
    }

    return normalized;
  }

  // 기능 : 비어 있는 문자열 query를 undefined로 정리합니다.
  private normalizeOptionalText(value: string | undefined): string | undefined {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  // 기능 : 비어 있지 않은 문자열을 대문자로 정규화합니다.
  private normalizeUpperText(value: string | undefined): string | undefined {
    return this.normalizeOptionalText(value)?.toUpperCase();
  }

  // 기능 : 조회 limit을 API 계약 범위로 정규화합니다.
  private normalizeLimit(limit: number | undefined, fallback: number): number {
    if (limit === undefined) {
      return fallback;
    }

    return Math.min(Math.max(limit, 1), MAX_LIMIT);
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

  // 기능 : timeline 날짜 범위의 시작과 끝 순서를 검증합니다.
  private assertDateRange(from: Date | undefined, to: Date | undefined): void {
    if (from && to && from.getTime() > to.getTime()) {
      throw new ValidationDomainError("from must be earlier than to");
    }
  }

  // 기능 : timeline eventType query가 allowlist에 포함되는지 검증합니다.
  private normalizeEventType(value: string | undefined): string | undefined {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      return undefined;
    }

    if (!ADMIN_USER_TIMELINE_EVENT_TYPES.some((item) => item === normalized)) {
      throw new ValidationDomainError("eventType is not supported");
    }

    return normalized;
  }

  // 기능 : audit metadata에 저장할 활성 filter key만 산출합니다.
  private getActiveFilterKeys(input: ListAdminUsersInput): string[] {
    return [
      ...(input.q ? ["q"] : []),
      ...(input.status ? ["status"] : []),
      ...(input.countryCode ? ["countryCode"] : []),
      ...(input.preferredLocale ? ["preferredLocale"] : []),
      ...(input.cursor ? ["cursor"] : []),
    ];
  }
}
