import type {
  ProductAnalyticsEventSourceCode,
  ProductAnalyticsRuntimeEventName,
  ProductAnalyticsTargetTypeCode,
} from "@/modules/analytics/domain/product-analytics-event-taxonomy";

// 湲곕뒫 : ?쒗뭹 遺꾩꽍 ??μ냼 provider token???뺤쓽?⑸땲??
export const PRODUCT_ANALYTICS_REPOSITORY = Symbol(
  "PRODUCT_ANALYTICS_REPOSITORY"
);

// ??븷 : CreateProductAnalyticsEventInput ?쒗뭹 遺꾩꽍 ?먮낯 ?대깽??????낅젰???뺤쓽?⑸땲??
export interface CreateProductAnalyticsEventInput {
  readonly userId: string;
  readonly authSessionId: string | null;
  readonly authDeviceId: string | null;
  readonly eventName: string;
  readonly eventVersion: number;
  readonly source: ProductAnalyticsEventSourceCode;
  readonly occurredAt: Date;
  readonly eventDate: string;
  readonly timeZone: string;
  readonly idempotencyKey?: string | null;
  readonly targetType?: ProductAnalyticsTargetTypeCode | null;
  readonly targetId?: string | null;
  readonly payloadJson: Record<string, unknown>;
}

// ??븷 : ProductAnalyticsEventRecord ??λ맂 ?쒗뭹 遺꾩꽍 ?먮낯 ?대깽?몄쓽 理쒖냼 寃곌낵瑜??뺤쓽?⑸땲??
export interface ProductAnalyticsEventRecord {
  readonly id: string;
}

// ??븷 : UserActivationSnapshot ?곹깭 肄붾뱶瑜?Prisma enum??吏곸젒 ?섏〈?섏? ?딅뒗 application 怨꾩빟?쇰줈 ?뺤쓽?⑸땲??
export type UserActivationSnapshotStatus = "NOT_ACTIVATED" | "ACTIVATED";

// ??븷 : ProductAnalyticsRetentionDayOffset retention snapshot day offset allowlist瑜??뺤쓽?⑸땲??
export type ProductAnalyticsRetentionDayOffset = 1 | 7 | 30;

// ??븷 : ActivationCandidate activation 怨꾩궛???꾩슂???ъ슜?먮퀎 理쒖큹 ?대깽???꾨낫瑜??뺤쓽?⑸땲??
export interface ActivationCandidate {
  readonly userId: string;
  readonly firstDealCreatedAt: Date | null;
  readonly firstDealCreatedEventDate: string | null;
  readonly firstDealCreatedTimeZone: string | null;
  readonly firstMeaningfulActionAt: Date | null;
  readonly firstMeaningfulActionEventDate: string | null;
  readonly firstMeaningfulActionTimeZone: string | null;
}

// ??븷 : UpsertUserActivationSnapshotInput ?ъ슜?먮퀎 activation snapshot upsert ?낅젰???뺤쓽?⑸땲??
export interface UpsertUserActivationSnapshotInput {
  readonly userId: string;
  readonly status: UserActivationSnapshotStatus;
  readonly firstDealCreatedAt: Date | null;
  readonly firstMeaningfulActionAt: Date | null;
  readonly activatedAt: Date | null;
  readonly activatedEventDate: string | null;
  readonly timeZone: string | null;
  readonly calculatedAt: Date;
}

// ??븷 : UpsertRetentionCohortSnapshotInput cohort ?⑥쐞 retention snapshot upsert ?낅젰???뺤쓽?⑸땲??
export interface UpsertRetentionCohortSnapshotInput {
  readonly cohortDate: string;
  readonly dayOffset: ProductAnalyticsRetentionDayOffset;
  readonly cohortUserCount: number;
  readonly retainedUserCount: number;
  readonly calculatedAt: Date;
}

export interface ProductAnalyticsRepository {
  // 湲곕뒫 : ?щ윭 snapshot upsert瑜??섎굹??transaction 寃쎄퀎 ?덉뿉???ㅽ뻾?⑸땲??
  runInTransaction<T>(
    work: (repository: ProductAnalyticsRepository) => Promise<T>
  ): Promise<T>;

  // 湲곕뒫 : allowlist瑜??듦낵???쒗뭹 遺꾩꽍 ?먮낯 ?대깽?몃? ??ν빀?덈떎.
  createEvent(
    input: CreateProductAnalyticsEventInput
  ): Promise<ProductAnalyticsEventRecord>;

  // 湲곕뒫 : app session ID濡??곌껐??authDeviceId瑜?議고쉶?⑸땲??
  findAuthDeviceIdBySessionId(sessionId: string): Promise<string | null>;

  // 湲곕뒫 : 吏?뺥븳 eventDate 踰붿쐞?먯꽌 activation ?ш퀎?곗씠 ?꾩슂???ъ슜???꾨낫瑜?議고쉶?⑸땲??
  findFirstActivationCandidates(
    fromDate: string,
    toDate: string,
    limit: number
  ): Promise<ActivationCandidate[]>;

  // 湲곕뒫 : ?ъ슜?먮퀎 activation snapshot??理쒖떊 怨꾩궛 寃곌낵濡?upsert?⑸땲??
  upsertUserActivationSnapshot(
    input: UpsertUserActivationSnapshotInput
  ): Promise<void>;

  // 湲곕뒫 : 吏?뺥븳 踰붿쐞?먯꽌 retention 怨꾩궛 ???activation cohort date 紐⑸줉??議고쉶?⑸땲??
  listActivatedCohortDates(
    fromDate: string,
    toDate: string,
    limit: number
  ): Promise<string[]>;

  // 湲곕뒫 : ?뱀젙 activation cohort date???랁븳 ?쒖꽦???ъ슜???섎? 吏묎퀎?⑸땲??
  countActivatedUsersByDate(cohortDate: string): Promise<number>;

  // 湲곕뒫 : ?뱀젙 cohort ?ъ슜?먭? target date??active event瑜??④꼈?붿? distinct user 湲곗??쇰줈 吏묎퀎?⑸땲??
  countRetainedUsersByDate(
    cohortDate: string,
    targetDate: string,
    activeEventNames: readonly ProductAnalyticsRuntimeEventName[]
  ): Promise<number>;

  // 湲곕뒫 : cohort ?⑥쐞 retention snapshot??upsert?⑸땲??
  upsertRetentionCohortSnapshot(
    input: UpsertRetentionCohortSnapshotInput
  ): Promise<void>;

  // 湲곕뒫 : cutoff蹂대떎 ?ㅻ옒???쒗뭹 遺꾩꽍 raw event瑜?batch ?⑥쐞濡???젣?⑸땲??
  deleteRawEventsBefore(cutoff: Date, batchSize: number): Promise<number>;

}
