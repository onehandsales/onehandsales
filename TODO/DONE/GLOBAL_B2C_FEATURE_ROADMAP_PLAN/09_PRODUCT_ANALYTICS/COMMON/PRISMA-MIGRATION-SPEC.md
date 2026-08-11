# Prisma Migration Spec

상태: Confirmed

## 1. 목적

09 DB 생성 시 Prisma schema 주석과 migration SQL COMMENT를 구체적으로 고정한다.

## 2. Migration 파일

신규 migration 이름:

```text
BE/prisma/migrations/{YYYYMMDDHHMMSS}_add_product_analytics/migration.sql
```

기존 migration 파일은 수정하지 않는다.

## 3. 필수 Prisma 주석

모든 신규 enum, model, field에는 `/// 기능 : ...` 주석을 둔다.

예:

```prisma
/// 기능 : 제품 분석 이벤트가 어떤 경로에서 기록됐는지 구분합니다.
enum ProductAnalyticsEventSource {
  CLIENT
  SERVER
  SYSTEM
}

/// 기능 : Global B2C 제품 사용 분석을 위한 allowlist 기반 원본 이벤트입니다.
model ProductAnalyticsEvent {
  /// 기능 : 분석 이벤트 row의 고유 식별자입니다.
  id String @id @default(uuid()) @db.Uuid
}
```

## 4. Migration SQL COMMENT

Migration에는 아래 enum 생성 SQL과 COMMENT를 반드시 포함한다.

Enum 생성:

```sql
CREATE TYPE "ProductAnalyticsEventSource" AS ENUM ('CLIENT', 'SERVER', 'SYSTEM');
CREATE TYPE "UserActivationStatus" AS ENUM ('NOT_ACTIVATED', 'ACTIVATED');
CREATE TYPE "ProductAnalyticsTargetType" AS ENUM ('USER', 'DEAL', 'SCHEDULE', 'MEETING_NOTE', 'BUSINESS_CARD_SCAN', 'IMPORT_JOB', 'EXPORT');
```

Enum/table comment:

```sql
COMMENT ON TYPE "ProductAnalyticsEventSource" IS '제품 분석 이벤트가 client, server, system 중 어디에서 기록됐는지 구분한다.';
COMMENT ON TYPE "UserActivationStatus" IS '사용자 activation snapshot 계산 상태를 구분한다.';
COMMENT ON TYPE "ProductAnalyticsTargetType" IS '제품 분석 이벤트가 연결할 수 있는 안전한 대상 타입을 구분한다.';

COMMENT ON TABLE "ProductAnalyticsEvent" IS 'Global B2C 제품 사용 분석을 위한 allowlist 기반 원본 이벤트.';
COMMENT ON TABLE "UserActivationSnapshot" IS '사용자별 activation 달성 여부와 달성 시점을 저장하는 snapshot.';
COMMENT ON TABLE "RetentionCohortSnapshot" IS '비식별 cohort 단위 retention 계산 결과 snapshot.';
```

`ProductAnalyticsEvent` column comment:

```sql
COMMENT ON COLUMN "ProductAnalyticsEvent"."id" IS '분석 이벤트 row의 고유 ID.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."userId" IS '이벤트를 발생시킨 사용자 ID. 계정 실제 삭제 시 함께 삭제된다.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."authSessionId" IS 'Backend app session ID. Client request에서 받지 않고 Backend 인증 context에서 채운다.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."authDeviceId" IS 'AuthSession에서 파생한 인증 device ID.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."eventName" IS 'allowlist에 등록된 snake_case 제품 분석 이벤트 이름.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."eventVersion" IS '이벤트 payload schema 버전.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."source" IS 'client, server, system 중 이벤트 기록 출처.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."occurredAt" IS '이벤트 발생 시각. UTC instant로 저장한다.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."eventDate" IS '이벤트 당시 사용자 timezone 기준 날짜. D1/D7/D30 retention 계산에 사용한다.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."timeZone" IS '이벤트 당시 사용자 IANA timezone ID.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."idempotencyKey" IS '같은 server event 중복 기록을 막는 선택 key.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."targetType" IS '이벤트가 연결된 안전한 대상 enum 타입. PII 이름을 저장하지 않는다.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."targetId" IS '이벤트가 연결된 안전한 대상 UUID.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."payloadJson" IS 'event별 allowlist schema를 통과한 비식별 payload.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."createdAt" IS '이벤트 row가 수집된 시각.';
```

`UserActivationSnapshot` column comment:

```sql
COMMENT ON COLUMN "UserActivationSnapshot"."id" IS 'activation snapshot row의 고유 ID.';
COMMENT ON COLUMN "UserActivationSnapshot"."userId" IS 'activation을 계산할 사용자 ID. 계정 실제 삭제 시 함께 삭제된다.';
COMMENT ON COLUMN "UserActivationSnapshot"."status" IS '현재 activation 계산 상태.';
COMMENT ON COLUMN "UserActivationSnapshot"."firstDealCreatedAt" IS '첫 딜 생성 이벤트 시각.';
COMMENT ON COLUMN "UserActivationSnapshot"."firstMeaningfulActionAt" IS '첫 다음 행동, 일정 연결, 회의록 연결 이벤트 시각.';
COMMENT ON COLUMN "UserActivationSnapshot"."activatedAt" IS 'activation 달성 시각.';
COMMENT ON COLUMN "UserActivationSnapshot"."activatedEventDate" IS 'activation 달성 이벤트 row의 사용자 timezone 기준 날짜.';
COMMENT ON COLUMN "UserActivationSnapshot"."timeZone" IS 'activation 달성 이벤트 row에 저장된 사용자 IANA timezone.';
COMMENT ON COLUMN "UserActivationSnapshot"."calculatedAt" IS 'snapshot 마지막 계산 시각.';
COMMENT ON COLUMN "UserActivationSnapshot"."createdAt" IS 'snapshot row 생성 시각.';
COMMENT ON COLUMN "UserActivationSnapshot"."updatedAt" IS 'snapshot row 수정 시각.';
```

`RetentionCohortSnapshot` column comment:

```sql
COMMENT ON COLUMN "RetentionCohortSnapshot"."id" IS 'retention cohort snapshot row의 고유 ID.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."cohortDate" IS '사용자 timezone 기준 activation cohort 날짜.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."dayOffset" IS 'retention day offset. 예: 1, 7, 30.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."cohortUserCount" IS 'cohort에 포함된 사용자 수.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."retainedUserCount" IS '해당 day에 active로 관측된 사용자 수.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."calculatedAt" IS 'snapshot 계산 시각.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."createdAt" IS 'snapshot row 생성 시각.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."updatedAt" IS 'snapshot row 수정 시각.';
```

## 5. 필수 Index

```sql
CREATE UNIQUE INDEX "ProductAnalyticsEvent_userId_eventName_idempotencyKey_key"
  ON "ProductAnalyticsEvent"("userId", "eventName", "idempotencyKey");

CREATE INDEX "ProductAnalyticsEvent_userId_eventName_occurredAt_idx"
  ON "ProductAnalyticsEvent"("userId", "eventName", "occurredAt");

CREATE INDEX "ProductAnalyticsEvent_userId_eventDate_idx"
  ON "ProductAnalyticsEvent"("userId", "eventDate");

CREATE INDEX "ProductAnalyticsEvent_eventName_eventDate_idx"
  ON "ProductAnalyticsEvent"("eventName", "eventDate");

CREATE INDEX "ProductAnalyticsEvent_source_createdAt_idx"
  ON "ProductAnalyticsEvent"("source", "createdAt");

CREATE INDEX "ProductAnalyticsEvent_occurredAt_idx"
  ON "ProductAnalyticsEvent"("occurredAt");

CREATE INDEX "ProductAnalyticsEvent_authSessionId_idx"
  ON "ProductAnalyticsEvent"("authSessionId");

CREATE INDEX "ProductAnalyticsEvent_authDeviceId_idx"
  ON "ProductAnalyticsEvent"("authDeviceId");

CREATE INDEX "UserActivationSnapshot_status_activatedEventDate_idx"
  ON "UserActivationSnapshot"("status", "activatedEventDate");

CREATE INDEX "UserActivationSnapshot_activatedAt_idx"
  ON "UserActivationSnapshot"("activatedAt");

CREATE UNIQUE INDEX "RetentionCohortSnapshot_cohortDate_dayOffset_key"
  ON "RetentionCohortSnapshot"("cohortDate", "dayOffset");

CREATE INDEX "RetentionCohortSnapshot_cohortDate_idx"
  ON "RetentionCohortSnapshot"("cohortDate");
```

`occurredAt` index는 365일 raw event purge에 사용한다.

Index comment:

```sql
COMMENT ON INDEX "ProductAnalyticsEvent_userId_eventName_idempotencyKey_key" IS 'server event idempotency key 중복 저장 방지용 unique index.';
COMMENT ON INDEX "ProductAnalyticsEvent_userId_eventName_occurredAt_idx" IS '사용자별 핵심 event 발생 순서와 activation 계산 조회용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_userId_eventDate_idx" IS '사용자 timezone 기준 일자별 active 여부 계산용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_eventName_eventDate_idx" IS 'event 이름과 사용자 timezone 기준 날짜별 aggregate 계산용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_source_createdAt_idx" IS 'client/server/system 출처별 수집 상태 확인용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_occurredAt_idx" IS '365일 raw event retention purge용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_authSessionId_idx" IS '현재 app session에서 파생된 event 추적용 nullable relation index.';
COMMENT ON INDEX "ProductAnalyticsEvent_authDeviceId_idx" IS '인증 device 단위 event 분석용 nullable relation index.';
COMMENT ON INDEX "UserActivationSnapshot_status_activatedEventDate_idx" IS 'activation 상태와 cohort 날짜별 snapshot 조회용 index.';
COMMENT ON INDEX "UserActivationSnapshot_activatedAt_idx" IS 'activation 달성 시각 기준 재계산 범위 조회용 index.';
COMMENT ON INDEX "RetentionCohortSnapshot_cohortDate_dayOffset_key" IS 'cohort 날짜와 retention day offset 중복 snapshot 방지용 unique index.';
COMMENT ON INDEX "RetentionCohortSnapshot_cohortDate_idx" IS 'cohort 날짜 범위별 retention 조회용 index.';
```

## 6. Foreign Key

```sql
ALTER TABLE "ProductAnalyticsEvent"
  ADD CONSTRAINT "ProductAnalyticsEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductAnalyticsEvent"
  ADD CONSTRAINT "ProductAnalyticsEvent_authSessionId_fkey"
  FOREIGN KEY ("authSessionId") REFERENCES "AuthSession"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductAnalyticsEvent"
  ADD CONSTRAINT "ProductAnalyticsEvent_authDeviceId_fkey"
  FOREIGN KEY ("authDeviceId") REFERENCES "AuthDevice"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserActivationSnapshot"
  ADD CONSTRAINT "UserActivationSnapshot_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
```

## 7. 금지

- migration comment에 payload 예시 원문을 넣지 않는다.
- PII 예시를 migration comment에 넣지 않는다.
- 기존 migration 파일을 수정하지 않는다.
- 운영/공유 DB에 무단으로 migration을 적용하지 않는다.
