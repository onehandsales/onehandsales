import {
  AiProviderCallStatus,
  Prisma,
  UserActivationStatus,
} from "@prisma/client";
import type {
  AdminAnalyticsRepository,
  CreateAdminAnalyticsAuditLogInput,
  GetAdminAnalyticsOverviewInput,
} from "@/modules/admin-operation/application/ports/admin-analytics.repository";
import type {
  AdminAnalyticsActivationRecord,
  AdminAnalyticsAiUsageRecord,
  AdminAnalyticsMobileFieldUseRecord,
  AdminAnalyticsMobilePushPermissionResultRecord,
  AdminAnalyticsOverviewRecord,
  AdminAnalyticsRetentionRecord,
  AdminAnalyticsRouteViewRecord,
} from "@/modules/admin-operation/application/ports/admin-analytics-read-model.types";
import {
  formatProductAnalyticsDateOnlyDate,
  resolveProductAnalyticsEventDate,
  toProductAnalyticsDateOnlyDate,
} from "@/modules/analytics/application/services/product-analytics-date";
import {
  PRODUCT_ANALYTICS_APP_ROUTE_KEYS,
  PRODUCT_ANALYTICS_SERVER_EVENT_NAMES,
  isProductAnalyticsAppRouteKey,
} from "@/modules/analytics/domain/product-analytics-event-taxonomy";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type AdminAnalyticsPrismaClient = PrismaService | Prisma.TransactionClient;
type MutableAdminAnalyticsMobilePushPermissionResultRecord = {
  -readonly [Key in keyof AdminAnalyticsMobilePushPermissionResultRecord]: AdminAnalyticsMobilePushPermissionResultRecord[Key];
};
type MutableAdminAnalyticsMobileFieldUseRecord = Omit<
  {
    -readonly [Key in keyof AdminAnalyticsMobileFieldUseRecord]: AdminAnalyticsMobileFieldUseRecord[Key];
  },
  "mobilePushPermissionResult"
> & {
  mobilePushPermissionResult: MutableAdminAnalyticsMobilePushPermissionResultRecord;
};
type AdminAnalyticsMobileFieldUseCountKey = Exclude<
  keyof AdminAnalyticsMobileFieldUseRecord,
  "mobilePushPermissionResult"
>;

const ADMIN_ANALYTICS_MOBILE_FIELD_USE_EVENT_MAP = {
  business_card_capture_started: "businessCardCaptureStarted",
  business_card_capture_retried: "businessCardCaptureRetried",
  business_card_ocr_failed: "businessCardOcrFailed",
  meeting_note_recording_started: "meetingNoteRecordingStarted",
  meeting_note_recording_completed: "meetingNoteRecordingCompleted",
  meeting_note_recording_failed: "meetingNoteRecordingFailed",
  local_draft_saved: "localDraftSaved",
  local_draft_restored: "localDraftRestored",
  local_draft_discarded: "localDraftDiscarded",
  mobile_push_permission_prompt_opened: "mobilePushPermissionPromptOpened",
} as const satisfies Record<
  string,
  Exclude<keyof AdminAnalyticsMobileFieldUseRecord, "mobilePushPermissionResult">
>;
const ADMIN_ANALYTICS_MOBILE_FIELD_USE_EVENT_NAMES = Object.keys(
  ADMIN_ANALYTICS_MOBILE_FIELD_USE_EVENT_MAP
);
const ADMIN_ANALYTICS_ROUTE_VIEW_EVENT_NAME = "app_route_viewed";
const ADMIN_ANALYTICS_PUSH_PERMISSION_RESULT_EVENT_NAME =
  "mobile_push_permission_result";
const ADMIN_ANALYTICS_PUSH_PERMISSION_STATES = [
  "granted",
  "denied",
  "default",
  "unsupported",
] as const satisfies readonly (keyof Omit<
  AdminAnalyticsMobilePushPermissionResultRecord,
  "browserPushEnabledTrue" | "browserPushEnabledFalse"
  >)[];
type AdminAnalyticsPushPermissionState =
  (typeof ADMIN_ANALYTICS_PUSH_PERMISSION_STATES)[number];

// 역할 : AdminAnalyticsRouteBucketRow routeKey allowlist SQL 집계 row를 정의합니다.
interface AdminAnalyticsRouteBucketRow {
  readonly routeKey: string | null;
  readonly viewCount: number | bigint | string;
}

// 역할 : AdminAnalyticsPushPermissionBucketRow push permission allowlist SQL 집계 row를 정의합니다.
interface AdminAnalyticsPushPermissionBucketRow {
  readonly permissionState: string | null;
  readonly browserPushEnabled: boolean | null;
  readonly count: number | bigint | string;
}

// 역할 : PrismaAdminAnalyticsRepository Admin analytics overview read model을 Prisma 조회로 구현합니다.
export class PrismaAdminAnalyticsRepository implements AdminAnalyticsRepository {
  // 기능 : Prisma client를 주입받아 Admin analytics 집계 조회에 사용합니다.
  constructor(private readonly client: AdminAnalyticsPrismaClient) {}

  // 기능 : 09 ProductAnalyticsEvent를 Admin 운영 요약으로 집계합니다.
  async getAnalyticsOverview(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsOverviewRecord> {
    const [activation, retention, events, routes, aiUsage, mobileFieldUse] =
      await Promise.all([
        this.getActivationSummary(input),
        this.listRetentionSummary(input),
        this.listCoreEventCounts(input),
        this.listRouteViewCounts(input),
        this.getAiUsageSummary(input),
        this.getMobileFieldUseSummary(input),
      ]);

    return {
      range: {
        from: input.from.toISOString(),
        to: input.to.toISOString(),
        timeZone: input.timeZone,
      },
      activation,
      retention,
      events,
      routes,
      aiUsage,
      mobileFieldUse,
    };
  }

  // 기능 : Admin analytics 조회 감사 로그를 append-only로 생성합니다.
  async createAuditLog(input: CreateAdminAnalyticsAuditLogInput): Promise<void> {
    const metadataJson = input.metadataJson as Prisma.InputJsonObject;

    await this.client.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        targetUserId: input.targetUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        action: input.action,
        result: input.result,
        requestId: input.requestId,
        metadataJson,
      },
      select: { id: true },
    });
  }

  // 기능 : activation snapshot에서 기간 내 activation과 현재 미활성 사용자를 집계합니다.
  private async getActivationSummary(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsActivationRecord> {
    const userWhere = this.createUserWhere(input);
    const [activatedUsers, notActivatedUsers] = await Promise.all([
      this.client.userActivationSnapshot.count({
        where: {
          status: UserActivationStatus.ACTIVATED,
          activatedAt: {
            gte: input.from,
            lte: input.to,
          },
          ...(userWhere ? { user: userWhere } : {}),
        },
      }),
      this.client.userActivationSnapshot.count({
        where: {
          status: UserActivationStatus.NOT_ACTIVATED,
          ...(userWhere ? { user: userWhere } : {}),
        },
      }),
    ]);

    return {
      activatedUsers,
      notActivatedUsers,
      activationRate: this.calculateRate(
        activatedUsers,
        activatedUsers + notActivatedUsers
      ),
    };
  }

  // 기능 : retention snapshot을 requested timezone 기준 date-only 범위로 조회합니다.
  private async listRetentionSummary(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsRetentionRecord[]> {
    const fromDate = this.toDateOnlyInTimeZone(input.from, input.timeZone);
    const toDate = this.toDateOnlyInTimeZone(input.to, input.timeZone);
    const rows = await this.client.retentionCohortSnapshot.findMany({
      where: {
        cohortDate: {
          gte: toProductAnalyticsDateOnlyDate(fromDate),
          lte: toProductAnalyticsDateOnlyDate(toDate),
        },
      },
      orderBy: [{ cohortDate: "asc" }, { dayOffset: "asc" }],
      select: {
        cohortDate: true,
        dayOffset: true,
        cohortUserCount: true,
        retainedUserCount: true,
      },
    });

    return rows.map((row) => ({
      cohortDate: formatProductAnalyticsDateOnlyDate(row.cohortDate),
      dayOffset: row.dayOffset,
      cohortUserCount: row.cohortUserCount,
      retainedUserCount: row.retainedUserCount,
      retentionRate: this.calculateRate(
        row.retainedUserCount,
        row.cohortUserCount
      ),
    }));
  }

  // 기능 : billing source가 없는 지표를 11에서 계산하지 않도록 제한합니다.
  private async listCoreEventCounts(input: GetAdminAnalyticsOverviewInput) {
    const rows = await this.client.productAnalyticsEvent.groupBy({
      by: ["eventName"],
      where: this.createProductAnalyticsEventWhere(input, [
        ...PRODUCT_ANALYTICS_SERVER_EVENT_NAMES,
      ]),
      _count: {
        _all: true,
      },
    });
    const countByEventName = this.toCountMap(rows);

    return PRODUCT_ANALYTICS_SERVER_EVENT_NAMES.map((eventName) => ({
      eventName,
      count: countByEventName.get(eventName) ?? 0,
    }));
  }

  // 기능 : route view payload에서 allowlist routeKey만 읽어 route별 조회 수를 집계합니다.
  private async listRouteViewCounts(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsRouteViewRecord[]> {
    const rows = await this.client.$queryRaw<AdminAnalyticsRouteBucketRow[]>(
      this.createRouteViewBucketSql(input)
    );
    const countByRouteKey = new Map<string, number>();

    for (const row of rows) {
      const routeKey = row.routeKey;

      if (!routeKey || !isProductAnalyticsAppRouteKey(routeKey)) {
        continue;
      }

      countByRouteKey.set(
        routeKey,
        (countByRouteKey.get(routeKey) ?? 0) + this.toQueryCount(row.viewCount)
      );
    }

    return PRODUCT_ANALYTICS_APP_ROUTE_KEYS.map((routeKey) => ({
      routeKey,
      viewCount: countByRouteKey.get(routeKey) ?? 0,
    })).filter((row) => row.viewCount > 0);
  }

  // 기능 : AiProviderCallLog에서 prompt/raw response 없이 count와 비용만 집계합니다.
  private async getAiUsageSummary(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsAiUsageRecord> {
    const where = this.createAiProviderCallLogWhere(input);
    const [requestCount, successCount, failureCount, costAggregate] =
      await Promise.all([
        this.client.aiProviderCallLog.count({ where }),
        this.client.aiProviderCallLog.count({
          where: {
            ...where,
            status: AiProviderCallStatus.SUCCEEDED,
          },
        }),
        this.client.aiProviderCallLog.count({
          where: {
            ...where,
            status: {
              in: [AiProviderCallStatus.FAILED, AiProviderCallStatus.CANCELED],
            },
          },
        }),
        this.client.aiProviderCallLog.aggregate({
          where,
          _sum: {
            estimatedCostAmount: true,
          },
        }),
      ]);

    return {
      requestCount,
      successCount,
      failureCount,
      estimatedCost: this.formatEstimatedCost(
        costAggregate._sum.estimatedCostAmount
      ),
    };
  }

  // 기능 : 10 mobile field-use eventName count와 push permission allowlist bucket을 집계합니다.
  private async getMobileFieldUseSummary(
    input: GetAdminAnalyticsOverviewInput
  ): Promise<AdminAnalyticsMobileFieldUseRecord> {
    const [countRows, permissionRows] = await Promise.all([
      this.client.productAnalyticsEvent.groupBy({
        by: ["eventName"],
        where: this.createProductAnalyticsEventWhere(input, [
          ...ADMIN_ANALYTICS_MOBILE_FIELD_USE_EVENT_NAMES,
        ]),
        _count: {
          _all: true,
        },
      }),
      this.client.$queryRaw<AdminAnalyticsPushPermissionBucketRow[]>(
        this.createPushPermissionBucketSql(input)
      ),
    ]);
    const summary = this.createEmptyMobileFieldUseSummary();
    const countByEventName = this.toCountMap(countRows);

    for (const [eventName, fieldName] of Object.entries(
      ADMIN_ANALYTICS_MOBILE_FIELD_USE_EVENT_MAP
    ) as [string, AdminAnalyticsMobileFieldUseCountKey][]) {
      summary[fieldName] = countByEventName.get(eventName) ?? 0;
    }

    for (const row of permissionRows) {
      this.addPushPermissionBucket(summary.mobilePushPermissionResult, row);
    }

    return summary;
  }

  // 기능 : push permission payload에서 permissionState와 browserPushEnabled allowlist bucket만 증가시킵니다.
  private addPushPermissionBucket(
    bucket: MutableAdminAnalyticsMobilePushPermissionResultRecord,
    row: AdminAnalyticsPushPermissionBucketRow
  ): void {
    const permissionState = row.permissionState;
    const browserPushEnabled = row.browserPushEnabled;
    const count = this.toQueryCount(row.count);

    if (permissionState && this.isPushPermissionState(permissionState)) {
      bucket[permissionState] += count;
    }

    if (browserPushEnabled === true) {
      bucket.browserPushEnabledTrue += count;
    }

    if (browserPushEnabled === false) {
      bucket.browserPushEnabledFalse += count;
    }
  }

  // 기능 : ProductAnalyticsEvent 공통 기간/사용자 filter where 조건을 만듭니다.
  private createProductAnalyticsEventWhere(
    input: GetAdminAnalyticsOverviewInput,
    eventName: string | readonly string[]
  ): Prisma.ProductAnalyticsEventWhereInput {
    const userWhere = this.createUserWhere(input);
    const eventNameFilter =
      typeof eventName === "string" ? eventName : { in: [...eventName] };

    return {
      eventName: eventNameFilter,
      occurredAt: {
        gte: input.from,
        lte: input.to,
      },
      ...(userWhere ? { user: userWhere } : {}),
    };
  }

  // 기능 : AiProviderCallLog 공통 기간/사용자 filter where 조건을 만듭니다.
  private createAiProviderCallLogWhere(
    input: GetAdminAnalyticsOverviewInput
  ): Prisma.AiProviderCallLogWhereInput {
    const userWhere = this.createUserWhere(input);

    return {
      startedAt: {
        gte: input.from,
        lte: input.to,
      },
      ...(userWhere ? { user: userWhere } : {}),
    };
  }

  // 기능 : countryCode/preferredLocale 사용자 relation filter를 생성합니다.
  private createUserWhere(
    input: GetAdminAnalyticsOverviewInput
  ): Prisma.UserWhereInput | undefined {
    const userWhere: Prisma.UserWhereInput = {
      ...(input.countryCode ? { countryCode: input.countryCode } : {}),
      ...(input.preferredLocale
        ? { preferredLocale: input.preferredLocale }
        : {}),
    };

    return Object.keys(userWhere).length > 0 ? userWhere : undefined;
  }

  // 기능 : route view payload에서 routeKey allowlist 후보만 추출하는 SQL을 생성합니다.
  private createRouteViewBucketSql(
    input: GetAdminAnalyticsOverviewInput
  ): Prisma.Sql {
    return Prisma.sql`
      SELECT
        analytics_event."payloadJson"->>'routeKey' AS "routeKey",
        COUNT(*)::int AS "viewCount"
      FROM "ProductAnalyticsEvent" AS analytics_event
      WHERE analytics_event."eventName" = ${ADMIN_ANALYTICS_ROUTE_VIEW_EVENT_NAME}
        AND analytics_event."occurredAt" >= ${input.from}
        AND analytics_event."occurredAt" <= ${input.to}
        ${this.createProductAnalyticsUserFilterSql(input)}
      GROUP BY analytics_event."payloadJson"->>'routeKey'
    `;
  }

  // 기능 : push permission payload에서 허용된 bucket key 후보만 추출하는 SQL을 생성합니다.
  private createPushPermissionBucketSql(
    input: GetAdminAnalyticsOverviewInput
  ): Prisma.Sql {
    return Prisma.sql`
      SELECT
        analytics_event."payloadJson"->>'permissionState' AS "permissionState",
        CASE
          WHEN analytics_event."payloadJson"->>'browserPushEnabled' IN ('true', 'false')
          THEN (analytics_event."payloadJson"->>'browserPushEnabled')::boolean
          ELSE NULL
        END AS "browserPushEnabled",
        COUNT(*)::int AS "count"
      FROM "ProductAnalyticsEvent" AS analytics_event
      WHERE analytics_event."eventName" = ${ADMIN_ANALYTICS_PUSH_PERMISSION_RESULT_EVENT_NAME}
        AND analytics_event."occurredAt" >= ${input.from}
        AND analytics_event."occurredAt" <= ${input.to}
        ${this.createProductAnalyticsUserFilterSql(input)}
      GROUP BY
        analytics_event."payloadJson"->>'permissionState',
        CASE
          WHEN analytics_event."payloadJson"->>'browserPushEnabled' IN ('true', 'false')
          THEN (analytics_event."payloadJson"->>'browserPushEnabled')::boolean
          ELSE NULL
        END
    `;
  }

  // 기능 : SQL 집계에서 사용자 국가/locale filter만 안전하게 추가합니다.
  private createProductAnalyticsUserFilterSql(
    input: GetAdminAnalyticsOverviewInput
  ): Prisma.Sql {
    const userConditions: Prisma.Sql[] = [];

    if (input.countryCode) {
      userConditions.push(
        Prisma.sql`user_filter."countryCode" = ${input.countryCode}`
      );
    }

    if (input.preferredLocale) {
      userConditions.push(
        Prisma.sql`user_filter."preferredLocale" = ${input.preferredLocale}`
      );
    }

    if (userConditions.length === 0) {
      return Prisma.empty;
    }

    return Prisma.sql`
      AND EXISTS (
        SELECT 1
        FROM "User" AS user_filter
        WHERE user_filter."id" = analytics_event."userId"
          AND ${Prisma.join(userConditions, " AND ")}
      )
    `;
  }

  // 기능 : groupBy 결과를 eventName별 count map으로 변환합니다.
  private toCountMap(
    rows: readonly { readonly eventName: string; readonly _count: { readonly _all: number } }[]
  ): Map<string, number> {
    return new Map(rows.map((row) => [row.eventName, row._count._all]));
  }

  // 기능 : UTC instant를 requested timezone 기준 date-only 문자열로 변환합니다.
  private toDateOnlyInTimeZone(date: Date, timeZone: string): string {
    return resolveProductAnalyticsEventDate(date, timeZone);
  }

  // 기능 : 분모가 0인 경우를 방어하며 4자리 비율을 계산합니다.
  private calculateRate(numerator: number, denominator: number): number {
    if (denominator === 0) {
      return 0;
    }

    return Number((numerator / denominator).toFixed(4));
  }

  // 기능 : SQL count 결과 타입을 number로 정규화합니다.
  private toQueryCount(value: number | bigint | string): number {
    return Number(value);
  }

  // 기능 : Decimal 비용 합계를 API 표시용 6자리 문자열로 변환합니다.
  private formatEstimatedCost(value: Prisma.Decimal | null | undefined): string {
    if (!value) {
      return "0.000000";
    }

    return value.toString();
  }

  // 기능 : 문자열 값이 push permission allowlist bucket key인지 확인합니다.
  private isPushPermissionState(
    value: string
  ): value is AdminAnalyticsPushPermissionState {
    return ADMIN_ANALYTICS_PUSH_PERMISSION_STATES.some((state) => state === value);
  }

  // 기능 : mobile field-use summary의 모든 bucket을 0으로 초기화합니다.
  private createEmptyMobileFieldUseSummary(): MutableAdminAnalyticsMobileFieldUseRecord {
    return {
      businessCardCaptureStarted: 0,
      businessCardCaptureRetried: 0,
      businessCardOcrFailed: 0,
      meetingNoteRecordingStarted: 0,
      meetingNoteRecordingCompleted: 0,
      meetingNoteRecordingFailed: 0,
      localDraftSaved: 0,
      localDraftRestored: 0,
      localDraftDiscarded: 0,
      mobilePushPermissionPromptOpened: 0,
      mobilePushPermissionResult: {
        granted: 0,
        denied: 0,
        default: 0,
        unsupported: 0,
        browserPushEnabledTrue: 0,
        browserPushEnabledFalse: 0,
      },
    };
  }
}
