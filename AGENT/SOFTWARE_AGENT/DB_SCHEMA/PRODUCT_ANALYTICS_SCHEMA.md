# Product Analytics Schema

## 1. 목적

09 Product Analytics는 Global B2C 유료 판매를 위한 제품 사용 분석 정본을 만든다.

이 schema는 raw event, activation snapshot, retention cohort snapshot만 포함한다. Admin 분석 화면/API는 11에서 구현하고, billing/paywall/churn 최종 이벤트와 과금 사용량 정본은 12에서 확정한다.

## 2. 포함 Model

- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`

## 3. Enum

`ProductAnalyticsEventSource`:

- `CLIENT`
- `SERVER`
- `SYSTEM`

`UserActivationStatus`:

- `NOT_ACTIVATED`
- `ACTIVATED`

`ProductAnalyticsTargetType`:

- `USER`
- `DEAL`
- `SCHEDULE`
- `MEETING_NOTE`
- `BUSINESS_CARD_SCAN`
- `IMPORT_JOB`
- `EXPORT`

## 4. ProductAnalyticsEvent

역할:

- 09 runtime에서 실제 저장하는 allowlist 기반 원본 이벤트다.
- client event와 server event를 같은 table에 저장하되 `source`로 구분한다.
- `payloadJson`에는 event별 allowlist를 통과한 비식별 payload만 저장한다.

주요 column:

- `userId`: 이벤트를 발생시킨 사용자 ID다. User hard delete 시 cascade 삭제한다.
- `authSessionId`: Backend app session ID다. session 삭제 시 null로 둔다.
- `authDeviceId`: AuthSession에서 파생한 device ID다. device 삭제 시 null로 둔다.
- `eventName`: runtime event 이름이다. DB enum이 아니라 string으로 두어 eventVersion 또는 신규 event name으로 확장한다.
- `eventVersion`: 09 1차 payload schema version이며 기본값은 `1`이다.
- `source`: `CLIENT`, `SERVER`, `SYSTEM` 중 하나다.
- `occurredAt`: UTC instant다.
- `eventDate`: 사용자 timezone 기준 `YYYY-MM-DD` date-only 값이다.
- `timeZone`: event 당시 사용자 IANA timezone이다.
- `idempotencyKey`: server event 중복 저장 방지 key다. client event는 null이다.
- `targetType`, `targetId`: PII 이름 대신 안전한 대상 타입과 UUID만 저장한다.
- `payloadJson`: allowlist를 통과한 비식별 payload다.

주요 index:

- `@@unique([userId, eventName, idempotencyKey])`: server event idempotency 보장
- `@@index([userId, eventName, occurredAt])`: activation 계산
- `@@index([userId, eventDate])`: user-day active 계산
- `@@index([eventName, eventDate])`: event/day aggregate
- `@@index([source, createdAt])`: 출처별 수집 상태 확인
- `@@index([occurredAt])`: 365일 raw event purge
- `@@index([authSessionId])`, `@@index([authDeviceId])`: session/device 분석 보강

## 5. UserActivationSnapshot

역할:

- 사용자별 activation 달성 여부와 달성 시점을 저장한다.
- `userId`는 unique이며 User hard delete 시 cascade 삭제한다.

activation 기준:

1. 사용자별 첫 `deal_created`를 찾는다.
2. 사용자별 첫 `deal_next_action_created`, `schedule_deal_linked`, `meeting_note_deal_linked` 중 하나를 찾는다.
3. 두 조건이 모두 있으면 늦은 시각을 `activatedAt`으로 저장한다.
4. `activatedAt`을 만든 event row의 `eventDate`와 `timeZone`을 snapshot에 저장한다.

주요 index:

- `@@index([status, activatedEventDate])`
- `@@index([activatedAt])`

## 6. RetentionCohortSnapshot

역할:

- 비식별 cohort 단위 D1/D7/D30 retention 계산 결과를 저장한다.
- userId를 저장하지 않는 aggregate이므로 계정 삭제 이후에도 장기 보관할 수 있다.

주요 column:

- `cohortDate`: 사용자 timezone 기준 activation date다.
- `dayOffset`: retention day offset이다. 09 기준은 `1`, `7`, `30`이다.
- `cohortUserCount`: cohort에 포함된 사용자 수다.
- `retainedUserCount`: 해당 day에 active로 관측된 사용자 수다.

주요 index:

- `@@unique([cohortDate, dayOffset])`
- `@@index([cohortDate])`

## 7. 제외 범위

09 DB schema에서 만들지 않는 model:

- `AiUsageDaily`
- `ExperimentAssignment`
- `ChurnSurveyResponse`
- `BillingEvent`
- `UserSubscription`
- `UsageMeter`

09 runtime allowlist에 넣지 않는 reserved billing event:

- `paywall_viewed`
- `upgrade_clicked`
- `trial_started`
- `coupon_applied`
- `referral_invited`
- `subscription_started`
- `subscription_canceled`
- `churn_survey_submitted`

## 8. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/EVENT-TAXONOMY.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/BE-TODO/DB-SCHEMA.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/PRISMA-MIGRATION-SPEC.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`
