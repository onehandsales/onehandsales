# Product Analytics Snapshot Contract

상태: Confirmed Plan

## 1. 목적

Raw `ProductAnalyticsEvent`를 activation, D1/D7/D30 retention, cohort snapshot으로 계산한다.

이 문서는 HTTP API가 아니라 optional background runner와 application use case contract다.

## 2. 계약 개요

- 계약 상태: confirmed
- 소비자: Backend internal, 11 Admin future
- 호환성: 신규 내부 contract, 기존 API response 변경 없음
- 인증: 없음. runner 내부 실행
- 권한: Admin API 노출은 11에서 별도 권한 계약 작성

## 3. Internal API

- API 이름: 제품 분석 snapshot 계산 contract
- API 식별자: ProcessProductAnalyticsSnapshots, PurgeProductAnalyticsRawEvents
- 호출 방식: optional background runner 또는 수동 test use case
- Request 이름: `ProcessProductAnalyticsSnapshotsCommand`
- Response 이름: `ProcessProductAnalyticsSnapshotsResult`, `PurgeProductAnalyticsRawEventsResult`

### Request

```ts
interface ProcessProductAnalyticsSnapshotsCommand {
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly limit?: number;
}

interface PurgeProductAnalyticsRawEventsCommand {
  readonly now: Date;
  readonly retentionDays: 365;
  readonly batchSize: number;
}
```

필드:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `fromDate` | `YYYY-MM-DD` | 선택 | 사용자 timezone 기준 eventDate 시작 |
| `toDate` | `YYYY-MM-DD` | 선택 | 사용자 timezone 기준 eventDate 끝 |
| `limit` | number | 선택 | 한 tick에서 처리할 user/cohort 제한 |
| `now` | Date | 필수 | purge cutoff 계산 기준 시각 |
| `retentionDays` | 365 | 필수 | raw event 보관 일수. 09에서는 365 고정 |
| `batchSize` | number | 필수 | purge 한 번에 삭제할 raw event row 수 |

### Response

```json
{
  "activationSnapshotsUpdated": 12,
  "retentionSnapshotsUpdated": 6,
  "fromDate": "2026-07-01",
  "toDate": "2026-07-29",
  "rawEventsPurged": 500,
  "purgeCutoffOccurredAt": "2025-07-29T00:00:00.000Z"
}
```

## 4. Business Logic

Activation:

1. `deal_created` event가 있는 user를 찾는다.
2. 같은 user의 `deal_next_action_created`, `schedule_deal_linked`, `meeting_note_deal_linked` 중 첫 event를 찾는다.
3. 두 조건이 모두 있으면 늦은 시각을 `activatedAt`으로 계산한다.
4. `activatedEventDate`는 `activatedAt`을 만든 event row의 `eventDate`를 사용한다.
5. `timeZone`은 `activatedAt`을 만든 event row의 `timeZone`을 사용한다.
6. repository가 `eventDate`를 읽을 때는 `formatProductAnalyticsDateOnlyDate`로 `YYYY-MM-DD` string을 만든다.
7. `UserActivationSnapshot`을 upsert한다.

Retention:

1. activation snapshot의 `activatedEventDate`를 cohort date로 사용한다.
2. dayOffset 1, 7, 30에 해당하는 eventDate를 `addDaysToProductAnalyticsDate(cohortDate, dayOffset)`로 계산한다.
3. 해당 날짜에 `app_route_viewed` 또는 아래 active server event가 있는 user를 retained로 본다.
4. `cohortUserCount`는 같은 cohort date의 activated user distinct count다.
5. `retainedUserCount`는 target eventDate에 active event가 있는 cohort user distinct count다.
6. repository는 `toProductAnalyticsDateOnlyDate`로 `cohortDate`를 Prisma `DateTime @db.Date` 값으로 변환해 upsert한다.
7. `RetentionCohortSnapshot`을 upsert한다.

Active server event allowlist:

- `deal_created`
- `deal_next_action_created`
- `schedule_created`
- `schedule_deal_linked`
- `meeting_note_created`
- `meeting_note_deal_linked`
- `business_card_scan_confirmed`
- `import_confirmed`
- `export_downloaded`

Retention purge:

1. `cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)`로 계산한다.
2. `ProductAnalyticsEvent.occurredAt < cutoff` raw event를 삭제한다.
3. 삭제 대상은 `ProductAnalyticsEvent`만이다.
4. `UserActivationSnapshot`, `RetentionCohortSnapshot`, `AiProviderCallLog`는 이 purge에서 삭제하지 않는다.
5. 삭제 count와 cutoff만 structured log에 남긴다.

## 5. 연결된 DB 스키마

- 조회: ProductAnalyticsEvent, UserActivationSnapshot
- 생성/수정: UserActivationSnapshot, RetentionCohortSnapshot
- 삭제: ProductAnalyticsEvent retention purge
- transaction: batch/upsert 단위 필요

Repository method:

```ts
interface ActivationCandidate {
  readonly userId: string;
  readonly firstDealCreatedAt: Date | null;
  readonly firstDealCreatedEventDate: string | null;
  readonly firstDealCreatedTimeZone: string | null;
  readonly firstMeaningfulActionAt: Date | null;
  readonly firstMeaningfulActionEventDate: string | null;
  readonly firstMeaningfulActionTimeZone: string | null;
}

interface UpsertUserActivationSnapshotInput {
  readonly userId: string;
  readonly status: "NOT_ACTIVATED" | "ACTIVATED";
  readonly firstDealCreatedAt: Date | null;
  readonly firstMeaningfulActionAt: Date | null;
  readonly activatedAt: Date | null;
  readonly activatedEventDate: string | null;
  readonly timeZone: string | null;
  readonly calculatedAt: Date;
}

interface UpsertRetentionCohortSnapshotInput {
  readonly cohortDate: string;
  readonly dayOffset: 1 | 7 | 30;
  readonly cohortUserCount: number;
  readonly retainedUserCount: number;
  readonly calculatedAt: Date;
}

interface ProductAnalyticsRepository {
  findFirstActivationCandidates(fromDate: string, toDate: string, limit: number): Promise<ActivationCandidate[]>;
  upsertUserActivationSnapshot(input: UpsertUserActivationSnapshotInput): Promise<void>;
  countActivatedUsersByDate(cohortDate: string): Promise<number>;
  countRetainedUsersByDate(cohortDate: string, targetDate: string, activeEventNames: readonly string[]): Promise<number>;
  upsertRetentionCohortSnapshot(input: UpsertRetentionCohortSnapshotInput): Promise<void>;
  deleteRawEventsBefore(cutoff: Date, batchSize: number): Promise<number>;
}
```

## 6. Transaction

- 필요 여부: 필요
- 이유: 같은 snapshot 계산 결과를 일관되게 upsert해야 한다.
- transaction model: UserActivationSnapshot, RetentionCohortSnapshot
- rollback 범위: batch 단위 snapshot upsert
- 외부 Provider: 없음
- audit log 포함: 없음

## 7. Runner

구현 파일:

```text
BE/src/modules/analytics/infrastructure/processor/product-analytics-snapshot-processor.runner.ts
```

환경 변수:

```text
PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_ENABLED=false
PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_INTERVAL_MS=300000
PRODUCT_ANALYTICS_SNAPSHOT_PROCESSOR_BATCH_SIZE=100
PRODUCT_ANALYTICS_RETENTION_PURGE_ENABLED=false
PRODUCT_ANALYTICS_RETENTION_PURGE_BATCH_SIZE=500
```

기존 `NotificationDueProcessorRunner`, `AiWeeklySalesReportProcessorRunner`의 optional setInterval 패턴을 따른다.

## 8. Observability

| 상황 | Event key | Level |
|---|---|---|
| tick 성공 | `analytics.snapshot.processor.tick` | log |
| tick 실패 | `analytics.snapshot.processor.failed` | error |
| retention purge 성공 | `analytics.retention.purgeCompleted` | log |
| retention purge 실패 | `analytics.retention.purgeFailed` | error |

Log context는 count/date 중심이다. userId 목록과 payload 원문을 남기지 않는다.

## 9. 11 Admin 연결

09는 Admin API를 만들지 않는다.

11에서 할 일:

- snapshot 조회 Admin API
- KPI table/filter
- user-level AI usage 조회
- masking/권한/audit log
- Admin analytics page UI
