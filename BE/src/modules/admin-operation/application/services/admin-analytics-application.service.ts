import { Inject, Injectable } from "@nestjs/common";
import {
  AdminAuditAction,
  AdminAuditResult,
  AdminTargetType,
} from "@prisma/client";
import {
  ADMIN_ANALYTICS_REPOSITORY,
  type AdminAnalyticsOverviewRecord,
  type AdminAnalyticsRepository,
  type GetAdminAnalyticsOverviewInput,
} from "@/modules/admin-operation/application/ports/admin-analytics.repository";
import {
  AdminAnalyticsRangeRequiredError,
  AdminAnalyticsRangeTooLargeError,
  AdminForbiddenError,
  AdminTimezoneInvalidError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

const DEFAULT_ADMIN_ANALYTICS_TIME_ZONE = "Asia/Seoul";
const MAX_ADMIN_ANALYTICS_RANGE_DAYS = 366;
const ADMIN_ANALYTICS_RANGE_MS =
  MAX_ADMIN_ANALYTICS_RANGE_DAYS * 24 * 60 * 60 * 1000;

// 역할 : GetAdminAnalyticsOverviewQueryInput Admin analytics overview query 입력을 정의합니다.
export interface GetAdminAnalyticsOverviewQueryInput {
  readonly from?: string;
  readonly to?: string;
  readonly timeZone?: string;
  readonly countryCode?: string;
  readonly preferredLocale?: string;
}

// 역할 : AdminAnalyticsRequestMetadata Admin analytics API 요청 추적 정보를 정의합니다.
export interface AdminAnalyticsRequestMetadata {
  readonly requestId: string;
}

// 역할 : AdminAnalyticsApplicationService Admin analytics 운영 overview 유스케이스를 제공합니다.
@Injectable()
export class AdminAnalyticsApplicationService {
  // 기능 : Admin analytics 저장소 구현체를 주입받습니다.
  constructor(
    @Inject(ADMIN_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: AdminAnalyticsRepository
  ) {}

  // 기능 : Admin analytics overview를 조회하고 조회 감사 로그를 남깁니다.
  async getAnalyticsOverview(
    currentUser: CurrentUserContext,
    query: GetAdminAnalyticsOverviewQueryInput,
    metadata: AdminAnalyticsRequestMetadata
  ): Promise<AdminAnalyticsOverviewRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. analytics overview query를 저장소 입력으로 정규화합니다.
    const input = this.toGetAnalyticsOverviewInput(query);

    // 3. Transaction 없이 read model을 조회한 뒤 append-only audit를 생성합니다.
    const overview = await this.analyticsRepository.getAnalyticsOverview(input);

    await this.analyticsRepository.createAuditLog({
      adminUserId: currentUser.id,
      targetUserId: null,
      targetType: AdminTargetType.SYSTEM_OPERATION_CHECK,
      targetId: null,
      action: AdminAuditAction.ADMIN_ANALYTICS_VIEW,
      result: AdminAuditResult.SUCCESS,
      requestId: metadata.requestId,
      metadataJson: {
        endpoint: "analyticsOverview",
        from: input.from.toISOString(),
        to: input.to.toISOString(),
        timeZone: input.timeZone,
        filterKeys: this.getActiveFilterKeys(input),
        countryCode: input.countryCode ?? "ALL",
        preferredLocale: input.preferredLocale ?? "ALL",
      },
    });

    // 4. mobile payload 원문 없이 집계값만 담긴 application overview를 반환합니다.
    return overview;
  }

  // 기능 : 관리자 권한이 아닌 application 호출을 거부합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : analytics overview query를 저장소 입력으로 변환합니다.
  private toGetAnalyticsOverviewInput(
    query: GetAdminAnalyticsOverviewQueryInput
  ): GetAdminAnalyticsOverviewInput {
    const from = this.parseRequiredInstant(query.from, "from");
    const to = this.parseRequiredInstant(query.to, "to");
    const timeZone = this.normalizeTimeZone(query.timeZone);
    const countryCode = this.normalizeCountryCode(query.countryCode);
    const preferredLocale = this.normalizeOptionalText(query.preferredLocale);

    this.assertDateRange(from, to);

    return {
      from,
      to,
      timeZone,
      ...(countryCode ? { countryCode } : {}),
      ...(preferredLocale ? { preferredLocale } : {}),
    };
  }

  // 기능 : 필수 ISO instant 문자열을 Date로 변환합니다.
  private parseRequiredInstant(
    value: string | undefined,
    field: "from" | "to"
  ): Date {
    const normalized = this.normalizeOptionalText(value);

    if (!normalized) {
      throw new AdminAnalyticsRangeRequiredError(field);
    }

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      throw new AdminAnalyticsRangeRequiredError(field);
    }

    return date;
  }

  // 기능 : analytics 조회 기간의 순서와 최대 범위를 검증합니다.
  private assertDateRange(from: Date, to: Date): void {
    if (from.getTime() > to.getTime()) {
      throw new AdminAnalyticsRangeRequiredError("to");
    }

    if (to.getTime() - from.getTime() > ADMIN_ANALYTICS_RANGE_MS) {
      throw new AdminAnalyticsRangeTooLargeError();
    }
  }

  // 기능 : IANA timezone query를 기본값 또는 유효한 값으로 정규화합니다.
  private normalizeTimeZone(value: string | undefined): string {
    const timeZone =
      this.normalizeOptionalText(value) ?? DEFAULT_ADMIN_ANALYTICS_TIME_ZONE;

    try {
      new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    } catch {
      throw new AdminTimezoneInvalidError();
    }

    return timeZone;
  }

  // 기능 : countryCode query를 대문자 국가 코드로 정규화합니다.
  private normalizeCountryCode(value: string | undefined): string | undefined {
    return this.normalizeOptionalText(value)?.toUpperCase();
  }

  // 기능 : 공백 문자열을 제거하고 빈 값은 undefined로 변환합니다.
  private normalizeOptionalText(value: string | undefined): string | undefined {
    const normalized = value?.trim();

    return normalized ? normalized : undefined;
  }

  // 기능 : audit metadata에 남길 활성 필터 키만 반환합니다.
  private getActiveFilterKeys(
    input: GetAdminAnalyticsOverviewInput
  ): readonly string[] {
    return [
      "from",
      "to",
      "timeZone",
      ...(input.countryCode ? ["countryCode"] : []),
      ...(input.preferredLocale ? ["preferredLocale"] : []),
    ];
  }
}
