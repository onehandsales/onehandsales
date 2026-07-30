-- 기능 : 제품 분석 이벤트 기록 출처 enum을 생성합니다.
CREATE TYPE "ProductAnalyticsEventSource" AS ENUM ('CLIENT', 'SERVER', 'SYSTEM');

-- 기능 : 사용자 activation snapshot 상태 enum을 생성합니다.
CREATE TYPE "UserActivationStatus" AS ENUM ('NOT_ACTIVATED', 'ACTIVATED');

-- 기능 : 제품 분석 이벤트가 연결할 수 있는 안전한 대상 타입 enum을 생성합니다.
CREATE TYPE "ProductAnalyticsTargetType" AS ENUM ('USER', 'DEAL', 'SCHEDULE', 'MEETING_NOTE', 'BUSINESS_CARD_SCAN', 'IMPORT_JOB', 'EXPORT');

COMMENT ON TYPE "ProductAnalyticsEventSource" IS '제품 분석 이벤트가 client, server, system 중 어디에서 기록됐는지 구분한다.';
COMMENT ON TYPE "UserActivationStatus" IS '사용자 activation snapshot 계산 상태를 구분한다.';
COMMENT ON TYPE "ProductAnalyticsTargetType" IS '제품 분석 이벤트가 연결할 수 있는 안전한 대상 타입을 구분한다.';

-- 기능 : Global B2C 제품 사용 분석을 위한 allowlist 기반 원본 이벤트 table을 생성합니다.
CREATE TABLE "ProductAnalyticsEvent" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "authSessionId" UUID,
  "authDeviceId" UUID,
  "eventName" TEXT NOT NULL,
  "eventVersion" INTEGER NOT NULL DEFAULT 1,
  "source" "ProductAnalyticsEventSource" NOT NULL,
  "occurredAt" TIMESTAMPTZ(3) NOT NULL,
  "eventDate" DATE NOT NULL,
  "timeZone" TEXT NOT NULL,
  "idempotencyKey" TEXT,
  "targetType" "ProductAnalyticsTargetType",
  "targetId" UUID,
  "payloadJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- 기능 : 사용자별 activation 달성 여부와 달성 시점을 저장하는 snapshot table을 생성합니다.
CREATE TABLE "UserActivationSnapshot" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "status" "UserActivationStatus" NOT NULL DEFAULT 'NOT_ACTIVATED',
  "firstDealCreatedAt" TIMESTAMPTZ(3),
  "firstMeaningfulActionAt" TIMESTAMPTZ(3),
  "activatedAt" TIMESTAMPTZ(3),
  "activatedEventDate" DATE,
  "timeZone" TEXT,
  "calculatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "UserActivationSnapshot_pkey" PRIMARY KEY ("id")
);

-- 기능 : 비식별 cohort 단위 retention 계산 결과 snapshot table을 생성합니다.
CREATE TABLE "RetentionCohortSnapshot" (
  "id" UUID NOT NULL,
  "cohortDate" DATE NOT NULL,
  "dayOffset" INTEGER NOT NULL,
  "cohortUserCount" INTEGER NOT NULL,
  "retainedUserCount" INTEGER NOT NULL,
  "calculatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "RetentionCohortSnapshot_pkey" PRIMARY KEY ("id")
);

COMMENT ON TABLE "ProductAnalyticsEvent" IS 'Global B2C 제품 사용 분석을 위한 allowlist 기반 원본 이벤트.';
COMMENT ON TABLE "UserActivationSnapshot" IS '사용자별 activation 달성 여부와 달성 시점을 저장하는 snapshot.';
COMMENT ON TABLE "RetentionCohortSnapshot" IS '비식별 cohort 단위 retention 계산 결과 snapshot.';

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

COMMENT ON COLUMN "RetentionCohortSnapshot"."id" IS 'retention cohort snapshot row의 고유 ID.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."cohortDate" IS '사용자 timezone 기준 activation cohort 날짜.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."dayOffset" IS 'retention day offset. 예: 1, 7, 30.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."cohortUserCount" IS 'cohort에 포함된 사용자 수.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."retainedUserCount" IS '해당 day에 active로 관측된 사용자 수.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."calculatedAt" IS 'snapshot 계산 시각.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."createdAt" IS 'snapshot row 생성 시각.';
COMMENT ON COLUMN "RetentionCohortSnapshot"."updatedAt" IS 'snapshot row 수정 시각.';

-- 기능 : server event idempotency key 중복 저장을 방지합니다.
CREATE UNIQUE INDEX "ProductAnalyticsEvent_userId_eventName_idempotencyKey_key"
  ON "ProductAnalyticsEvent"("userId", "eventName", "idempotencyKey");

-- 기능 : 사용자별 핵심 event 발생 순서와 activation 계산 조회에 사용합니다.
CREATE INDEX "ProductAnalyticsEvent_userId_eventName_occurredAt_idx"
  ON "ProductAnalyticsEvent"("userId", "eventName", "occurredAt");

-- 기능 : 사용자 timezone 기준 일자별 active 여부 계산에 사용합니다.
CREATE INDEX "ProductAnalyticsEvent_userId_eventDate_idx"
  ON "ProductAnalyticsEvent"("userId", "eventDate");

-- 기능 : event 이름과 사용자 timezone 기준 날짜별 aggregate 계산에 사용합니다.
CREATE INDEX "ProductAnalyticsEvent_eventName_eventDate_idx"
  ON "ProductAnalyticsEvent"("eventName", "eventDate");

-- 기능 : client/server/system 출처별 수집 상태 확인에 사용합니다.
CREATE INDEX "ProductAnalyticsEvent_source_createdAt_idx"
  ON "ProductAnalyticsEvent"("source", "createdAt");

-- 기능 : 365일 raw event retention purge에 사용합니다.
CREATE INDEX "ProductAnalyticsEvent_occurredAt_idx"
  ON "ProductAnalyticsEvent"("occurredAt");

-- 기능 : 현재 app session에서 파생된 event 추적에 사용합니다.
CREATE INDEX "ProductAnalyticsEvent_authSessionId_idx"
  ON "ProductAnalyticsEvent"("authSessionId");

-- 기능 : 인증 device 단위 event 분석에 사용합니다.
CREATE INDEX "ProductAnalyticsEvent_authDeviceId_idx"
  ON "ProductAnalyticsEvent"("authDeviceId");

-- 기능 : 사용자별 activation snapshot을 하나만 저장합니다.
CREATE UNIQUE INDEX "UserActivationSnapshot_userId_key"
  ON "UserActivationSnapshot"("userId");

-- 기능 : activation 상태와 cohort 날짜별 snapshot 조회에 사용합니다.
CREATE INDEX "UserActivationSnapshot_status_activatedEventDate_idx"
  ON "UserActivationSnapshot"("status", "activatedEventDate");

-- 기능 : activation 달성 시각 기준 재계산 범위 조회에 사용합니다.
CREATE INDEX "UserActivationSnapshot_activatedAt_idx"
  ON "UserActivationSnapshot"("activatedAt");

-- 기능 : cohort 날짜와 retention day offset 중복 snapshot을 방지합니다.
CREATE UNIQUE INDEX "RetentionCohortSnapshot_cohortDate_dayOffset_key"
  ON "RetentionCohortSnapshot"("cohortDate", "dayOffset");

-- 기능 : cohort 날짜 범위별 retention 조회에 사용합니다.
CREATE INDEX "RetentionCohortSnapshot_cohortDate_idx"
  ON "RetentionCohortSnapshot"("cohortDate");

COMMENT ON INDEX "ProductAnalyticsEvent_userId_eventName_idempotencyKey_key" IS 'server event idempotency key 중복 저장 방지용 unique index.';
COMMENT ON INDEX "ProductAnalyticsEvent_userId_eventName_occurredAt_idx" IS '사용자별 핵심 event 발생 순서와 activation 계산 조회용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_userId_eventDate_idx" IS '사용자 timezone 기준 일자별 active 여부 계산용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_eventName_eventDate_idx" IS 'event 이름과 사용자 timezone 기준 날짜별 aggregate 계산용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_source_createdAt_idx" IS 'client/server/system 출처별 수집 상태 확인용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_occurredAt_idx" IS '365일 raw event retention purge용 index.';
COMMENT ON INDEX "ProductAnalyticsEvent_authSessionId_idx" IS '현재 app session에서 파생된 event 추적용 nullable relation index.';
COMMENT ON INDEX "ProductAnalyticsEvent_authDeviceId_idx" IS '인증 device 단위 event 분석용 nullable relation index.';
COMMENT ON INDEX "UserActivationSnapshot_userId_key" IS '사용자별 activation snapshot 중복 방지용 unique index.';
COMMENT ON INDEX "UserActivationSnapshot_status_activatedEventDate_idx" IS 'activation 상태와 cohort 날짜별 snapshot 조회용 index.';
COMMENT ON INDEX "UserActivationSnapshot_activatedAt_idx" IS 'activation 달성 시각 기준 재계산 범위 조회용 index.';
COMMENT ON INDEX "RetentionCohortSnapshot_cohortDate_dayOffset_key" IS 'cohort 날짜와 retention day offset 중복 snapshot 방지용 unique index.';
COMMENT ON INDEX "RetentionCohortSnapshot_cohortDate_idx" IS 'cohort 날짜 범위별 retention 조회용 index.';

-- 기능 : 제품 분석 원본 이벤트는 사용자 hard delete 시 함께 삭제됩니다.
ALTER TABLE "ProductAnalyticsEvent"
  ADD CONSTRAINT "ProductAnalyticsEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : session row가 삭제되면 분석 이벤트는 보존하고 session 연결만 비웁니다.
ALTER TABLE "ProductAnalyticsEvent"
  ADD CONSTRAINT "ProductAnalyticsEvent_authSessionId_fkey"
  FOREIGN KEY ("authSessionId") REFERENCES "AuthSession"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : device row가 삭제되면 분석 이벤트는 보존하고 device 연결만 비웁니다.
ALTER TABLE "ProductAnalyticsEvent"
  ADD CONSTRAINT "ProductAnalyticsEvent_authDeviceId_fkey"
  FOREIGN KEY ("authDeviceId") REFERENCES "AuthDevice"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : activation snapshot은 사용자 hard delete 시 함께 삭제됩니다.
ALTER TABLE "UserActivationSnapshot"
  ADD CONSTRAINT "UserActivationSnapshot_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
