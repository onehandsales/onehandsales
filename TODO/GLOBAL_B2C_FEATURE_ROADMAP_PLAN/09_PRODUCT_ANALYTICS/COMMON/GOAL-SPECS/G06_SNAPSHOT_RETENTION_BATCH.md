# G06 Snapshot Retention Batch

상태: Ready
목표: activation/retention snapshot 계산과 raw event retention purge를 구현한다.

## 1. 목적

G06은 raw event를 실제 KPI 계산에 쓸 수 있게 snapshot으로 만든다.

## 2. 포함 범위

- `ProcessProductAnalyticsSnapshotsUseCase`
- `PurgeProductAnalyticsRawEventsUseCase`
- Activation 계산
- D1/D7/D30 retention 계산
- `RetentionCohortSnapshot` upsert
- optional processor runner
- 365일 raw event purge use case
- 관련 repository query

## 3. 제외 범위

- Admin dashboard/API
- Billing conversion/churn final metric
- External BI dashboard
- Ad attribution

## 4. 작업

1. activation 계산 repository query를 만든다.
2. `UserActivationSnapshot` upsert use case를 만든다.
3. D1/D7/D30 cohort retention 계산을 만든다.
4. `RetentionCohortSnapshot` upsert를 만든다.
5. optional setInterval runner를 만든다.
6. env flag와 batch size를 추가한다.
7. raw event 365일 purge use case를 만든다.
8. snapshot/purge log를 count/date 중심으로 남긴다.

## 5. Request 계약

HTTP request는 없다.

Internal command:

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

Example:

```json
{
  "fromDate": "2026-07-01",
  "toDate": "2026-07-29",
  "limit": 100,
  "now": "2026-07-29T00:00:00.000Z",
  "retentionDays": 365,
  "batchSize": 500
}
```

## 6. Response 계약

Internal result:

```json
{
  "activationSnapshotsUpdated": 12,
  "retentionSnapshotsUpdated": 6,
  "fromDate": "2026-07-01",
  "toDate": "2026-07-29",
  "rawEventsPurged": 0,
  "purgeCutoffOccurredAt": "2025-07-29T00:00:00.000Z"
}
```

## 7. Business Logic

Activation:

1. 사용자별 첫 `deal_created`를 찾는다.
2. 사용자별 첫 `deal_next_action_created`, `schedule_deal_linked`, `meeting_note_deal_linked`를 찾는다.
3. 두 조건이 모두 있으면 늦은 시각을 `activatedAt`으로 둔다.
4. `activatedAt`을 만든 event row의 `eventDate`를 `activatedEventDate`로 저장한다.
5. `activatedAt`을 만든 event row의 `timeZone`을 `timeZone`으로 저장한다.
6. repository가 `eventDate`를 읽을 때는 `formatProductAnalyticsDateOnlyDate`로 `YYYY-MM-DD` string을 만든다.

Retention:

1. activation cohort date를 기준으로 D1/D7/D30 날짜를 계산한다.
2. date-only 계산은 `addDaysToProductAnalyticsDate(cohortDate, dayOffset)` helper로 수행한다.
3. helper는 `YYYY-MM-DD`를 year/month/day로 분해하고 `Date.UTC(year, month - 1, day + dayOffset)`로 더한 뒤 `YYYY-MM-DD`를 반환한다.
4. 해당 날짜에 `app_route_viewed` 또는 `deal_created`, `deal_next_action_created`, `schedule_created`, `schedule_deal_linked`, `meeting_note_created`, `meeting_note_deal_linked`, `business_card_scan_confirmed`, `import_confirmed`, `export_downloaded` 중 하나가 있으면 retained로 본다.
5. `cohortUserCount`는 같은 `activatedEventDate`의 activated user distinct count다.
6. `retainedUserCount`는 target eventDate에 active event가 있는 cohort user distinct count다.
7. repository는 `toProductAnalyticsDateOnlyDate`로 `cohortDate`를 Prisma `DateTime @db.Date` 값으로 변환해 저장한다.
8. userId 없는 aggregate snapshot으로 저장한다.

Purge:

1. `cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)`로 계산한다.
2. `ProductAnalyticsEvent.occurredAt < cutoff` row만 hard delete한다.
3. 삭제 대상은 `ProductAnalyticsEvent` raw event뿐이다. `UserActivationSnapshot`, `RetentionCohortSnapshot`, `AiProviderCallLog`는 이 purge use case에서 삭제하지 않는다.
4. `ProductAnalyticsRepository.deleteRawEventsBefore(cutoff, batchSize)`를 반복 호출해 batch 단위로 삭제한다.
5. 삭제 count와 cutoff만 log에 남긴다.

## 8. User Flow

사용자-facing flow 변화는 없다.

간접 흐름:

1. 사용자가 딜과 다음 행동/일정/회의록을 만든다.
2. server event가 쌓인다.
3. runner가 activation snapshot을 계산한다.
4. 사용자가 다음 날 다시 `/app`을 방문한다.
5. runner가 retention snapshot을 계산한다.

## 9. DB/Prisma 영향

G06은 G02 schema를 사용한다.

- 조회: ProductAnalyticsEvent, UserActivationSnapshot
- upsert: UserActivationSnapshot, RetentionCohortSnapshot
- 삭제: ProductAnalyticsEvent retention purge
- transaction: snapshot batch/upsert에 필요

G06에서 repository에 추가할 method:

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

## 10. 코드 주석 기준

Backend:

- runner class: `// 역할 : 설정으로 켜는 optional product analytics snapshot processor입니다.`
- use case class: `// 역할 : 제품 분석 raw event를 activation과 retention snapshot으로 계산합니다.`
- calculation helper: `// 기능 : ...`
- 긴 계산 흐름에는 numbered step comment를 둔다.

## 11. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- analytics
```

## 12. Goal 검토 체크리스트

- [ ] activation 기준이 결정 로그와 일치한다.
- [ ] retention은 사용자 timezone 기준 eventDate를 사용한다.
- [ ] `RetentionCohortSnapshot`은 userId를 저장하지 않는다.
- [ ] optional runner가 env flag로 켜지고 꺼진다.
- [ ] purge는 365일 기준이다.
- [ ] log에 payload 원문/user list가 없다.
- [ ] 신규/수정 코드에 한국어 주석이 있다.
