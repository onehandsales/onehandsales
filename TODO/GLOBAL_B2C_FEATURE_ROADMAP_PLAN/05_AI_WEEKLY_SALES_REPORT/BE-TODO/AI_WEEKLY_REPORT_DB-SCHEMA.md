# 05-A DB Schema And SQL

상태: Implementation-ready draft

## 1. 생성 대상

05-A는 새 DB table이 필요하다.

| 이름 | 목적 |
|---|---|
| `AiWeeklySalesReport` | 주간 AI 리포트 version 정본 |
| `AiWeeklySalesReportSuggestion` | 리포트 section의 risk/action/follow-up/cleanup 제안 |
| `AiJob` | 비동기 AI job 상태 |
| `AiProviderCallLog` | AI provider 호출 비용/상태/실패 추적 |

## 2. Prisma 모델 작성 기준

- 모든 table은 `userId`를 가진다.
- 시스템 시각은 `@db.Timestamptz(3)`로 둔다.
- `weekStart`, `weekEnd`는 `@db.Date`다.
- `inputSnapshotJson`은 민감한 영업 데이터가 들어가므로 일반 response에 반환하지 않는다.
- `provider prompt/raw response`는 저장하지 않는다.
- partial unique index는 Prisma schema가 직접 표현하지 못할 수 있으므로 migration SQL에 명시한다.

## 3. Migration SQL 초안

```sql
-- CreateEnum
CREATE TYPE "AiWeeklySalesReportStatus" AS ENUM (
  'GENERATING',
  'READY',
  'FAILED'
);

-- CreateEnum
CREATE TYPE "AiWeeklySalesReportSuggestionType" AS ENUM (
  'RISK',
  'NEXT_ACTION',
  'FOLLOW_UP',
  'DATA_CLEANUP'
);

-- CreateEnum
CREATE TYPE "AiSuggestionPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM (
  'PENDING',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'CANCELED'
);

-- CreateEnum
CREATE TYPE "AiProviderOperation" AS ENUM (
  'WEEKLY_SALES_REPORT',
  'FOLLOW_UP_EMAIL_DRAFT',
  'FOLLOW_UP_SMS_DRAFT'
);

-- CreateEnum
CREATE TYPE "AiProviderCallStatus" AS ENUM (
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'CANCELED'
);

-- CreateTable
CREATE TABLE "AiWeeklySalesReport" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "weekStart" DATE NOT NULL,
  "weekEnd" DATE NOT NULL,
  "timeZone" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "AiWeeklySalesReportStatus" NOT NULL DEFAULT 'GENERATING',
  "provider" TEXT,
  "model" TEXT,
  "inputSnapshotJson" JSONB NOT NULL DEFAULT '{}',
  "inputMetadataJson" JSONB NOT NULL DEFAULT '{}',
  "outputJson" JSONB,
  "dataCoverageJson" JSONB NOT NULL DEFAULT '{}',
  "safeErrorCode" TEXT,
  "safeErrorMessage" TEXT,
  "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMPTZ(3),
  "generatedAt" TIMESTAMPTZ(3),
  "failedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AiWeeklySalesReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiWeeklySalesReport_version_check" CHECK ("version" >= 1),
  CONSTRAINT "AiWeeklySalesReport_week_range_check" CHECK ("weekEnd" >= "weekStart"),
  CONSTRAINT "AiWeeklySalesReport_timeZone_check" CHECK (length(trim("timeZone")) > 0),
  CONSTRAINT "AiWeeklySalesReport_locale_check" CHECK (length(trim("locale")) > 0)
);

-- CreateTable
CREATE TABLE "AiWeeklySalesReportSuggestion" (
  "id" UUID NOT NULL,
  "reportId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "type" "AiWeeklySalesReportSuggestionType" NOT NULL,
  "suggestionKey" TEXT NOT NULL,
  "priority" "AiSuggestionPriority" NOT NULL DEFAULT 'MEDIUM',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "reason" TEXT,
  "targetType" TEXT,
  "targetId" UUID,
  "targetPath" TEXT,
  "targetLabel" TEXT,
  "payloadJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AiWeeklySalesReportSuggestion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiWeeklySalesReportSuggestion_suggestionKey_check" CHECK (length(trim("suggestionKey")) > 0),
  CONSTRAINT "AiWeeklySalesReportSuggestion_title_check" CHECK (length(trim("title")) > 0),
  CONSTRAINT "AiWeeklySalesReportSuggestion_body_check" CHECK (length(trim("body")) > 0)
);

-- CreateTable
CREATE TABLE "AiJob" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "operation" "AiProviderOperation" NOT NULL,
  "status" "AiJobStatus" NOT NULL DEFAULT 'PENDING',
  "targetType" TEXT NOT NULL,
  "targetId" UUID NOT NULL,
  "idempotencyKey" TEXT,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "maxAttemptCount" INTEGER NOT NULL DEFAULT 1,
  "safeErrorCode" TEXT,
  "safeErrorMessage" TEXT,
  "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMPTZ(3),
  "completedAt" TIMESTAMPTZ(3),
  "failedAt" TIMESTAMPTZ(3),
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AiJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiJob_targetType_check" CHECK (length(trim("targetType")) > 0),
  CONSTRAINT "AiJob_attemptCount_check" CHECK ("attemptCount" >= 0),
  CONSTRAINT "AiJob_maxAttemptCount_check" CHECK ("maxAttemptCount" >= 1)
);

-- CreateTable
CREATE TABLE "AiProviderCallLog" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "operation" "AiProviderOperation" NOT NULL,
  "status" "AiProviderCallStatus" NOT NULL DEFAULT 'PENDING',
  "reportId" UUID,
  "jobId" UUID,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "requestId" TEXT,
  "latencyMs" INTEGER,
  "inputTokenCount" INTEGER,
  "outputTokenCount" INTEGER,
  "totalTokenCount" INTEGER,
  "estimatedCostAmount" DECIMAL(12, 6),
  "costCurrency" TEXT NOT NULL DEFAULT 'USD',
  "safeErrorCode" TEXT,
  "safeErrorMessage" TEXT,
  "retryable" BOOLEAN NOT NULL DEFAULT false,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMPTZ(3),
  "failedAt" TIMESTAMPTZ(3),
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AiProviderCallLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiProviderCallLog_provider_check" CHECK (length(trim("provider")) > 0),
  CONSTRAINT "AiProviderCallLog_model_check" CHECK (length(trim("model")) > 0),
  CONSTRAINT "AiProviderCallLog_latencyMs_check" CHECK ("latencyMs" IS NULL OR "latencyMs" >= 0),
  CONSTRAINT "AiProviderCallLog_retryCount_check" CHECK ("retryCount" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "AiWeeklySalesReport_userId_weekStart_version_key"
  ON "AiWeeklySalesReport"("userId", "weekStart", "version");

-- 같은 사용자와 같은 주에 생성 중인 AI report는 하나만 허용한다.
CREATE UNIQUE INDEX "AiWeeklySalesReport_active_generation_key"
  ON "AiWeeklySalesReport"("userId", "weekStart")
  WHERE "status" = 'GENERATING';

CREATE INDEX "AiWeeklySalesReport_userId_weekStart_status_idx"
  ON "AiWeeklySalesReport"("userId", "weekStart", "status");

CREATE INDEX "AiWeeklySalesReport_userId_weekStart_version_idx"
  ON "AiWeeklySalesReport"("userId", "weekStart", "version" DESC);

CREATE UNIQUE INDEX "AiWeeklySalesReportSuggestion_reportId_suggestionKey_key"
  ON "AiWeeklySalesReportSuggestion"("reportId", "suggestionKey");

CREATE INDEX "AiWeeklySalesReportSuggestion_userId_reportId_type_idx"
  ON "AiWeeklySalesReportSuggestion"("userId", "reportId", "type");

CREATE INDEX "AiWeeklySalesReportSuggestion_userId_target_idx"
  ON "AiWeeklySalesReportSuggestion"("userId", "targetType", "targetId");

CREATE INDEX "AiJob_status_operation_createdAt_idx"
  ON "AiJob"("status", "operation", "createdAt");

CREATE INDEX "AiJob_userId_operation_status_createdAt_idx"
  ON "AiJob"("userId", "operation", "status", "createdAt");

CREATE INDEX "AiJob_userId_targetType_targetId_idx"
  ON "AiJob"("userId", "targetType", "targetId");

CREATE INDEX "AiProviderCallLog_userId_operation_createdAt_idx"
  ON "AiProviderCallLog"("userId", "operation", "createdAt");

CREATE INDEX "AiProviderCallLog_reportId_createdAt_idx"
  ON "AiProviderCallLog"("reportId", "createdAt");

CREATE INDEX "AiProviderCallLog_jobId_createdAt_idx"
  ON "AiProviderCallLog"("jobId", "createdAt");

CREATE INDEX "AiProviderCallLog_status_createdAt_idx"
  ON "AiProviderCallLog"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "AiWeeklySalesReport"
  ADD CONSTRAINT "AiWeeklySalesReport_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiWeeklySalesReportSuggestion"
  ADD CONSTRAINT "AiWeeklySalesReportSuggestion_reportId_fkey"
  FOREIGN KEY ("reportId") REFERENCES "AiWeeklySalesReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiWeeklySalesReportSuggestion"
  ADD CONSTRAINT "AiWeeklySalesReportSuggestion_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiJob"
  ADD CONSTRAINT "AiJob_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiProviderCallLog"
  ADD CONSTRAINT "AiProviderCallLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AiProviderCallLog"
  ADD CONSTRAINT "AiProviderCallLog_reportId_fkey"
  FOREIGN KEY ("reportId") REFERENCES "AiWeeklySalesReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AiProviderCallLog"
  ADD CONSTRAINT "AiProviderCallLog_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "AiJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Comments: enum types
COMMENT ON TYPE "AiWeeklySalesReportStatus" IS 'AI 주간 영업 리포트 version 상태. 생성 중, 성공, 실패 version을 모두 보관한다.';
COMMENT ON TYPE "AiWeeklySalesReportSuggestionType" IS 'AI 주간 리포트가 생성한 제안 유형. 리스크, 다음 행동, follow-up, 데이터 정리를 구분한다.';
COMMENT ON TYPE "AiSuggestionPriority" IS 'AI 제안 우선순위. 화면에서 정렬과 badge에 사용한다.';
COMMENT ON TYPE "AiJobStatus" IS 'AI 비동기 job 상태. provider 호출 전후 상태를 추적한다.';
COMMENT ON TYPE "AiProviderOperation" IS 'AI provider 호출 목적. 05-A 리포트와 05-B follow-up draft를 같은 call log에서 구분한다.';
COMMENT ON TYPE "AiProviderCallStatus" IS 'AI provider call log 상태. provider raw response 없이 성공/실패/취소를 기록한다.';

-- Comments: AiWeeklySalesReport
COMMENT ON TABLE "AiWeeklySalesReport" IS '사용자별 주간 AI 영업 리포트 version 정본. 입력 snapshot 전체와 AI 결과를 저장한다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."id" IS 'AiWeeklySalesReport UUID primary key.';
COMMENT ON COLUMN "AiWeeklySalesReport"."userId" IS '리포트 소유 사용자 ID. 모든 조회와 변경은 current user ownership으로 제한한다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."weekStart" IS '리포트 대상 주 시작일. YYYY-MM-DD date-only이며 요청 timezone 기준 월요일이다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."weekEnd" IS '리포트 대상 주 종료일. weekStart + 6일 date-only다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."timeZone" IS '리포트 주간 범위와 화면 표시 기준 IANA timezone ID.';
COMMENT ON COLUMN "AiWeeklySalesReport"."locale" IS 'AI 리포트 생성 언어. 사용자 앱 언어 기준으로 저장한다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."version" IS '같은 사용자와 같은 weekStart 안의 version 번호. 재생성 시 증가한다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."status" IS '리포트 version 상태. 실패 version도 삭제하지 않는다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."provider" IS 'AI provider 이름. 예: openai.';
COMMENT ON COLUMN "AiWeeklySalesReport"."model" IS 'AI 리포트 생성에 사용한 모델 이름.';
COMMENT ON COLUMN "AiWeeklySalesReport"."inputSnapshotJson" IS 'AI가 참고한 전체 입력 snapshot. 회의록 본문을 포함할 수 있으며 일반 사용자 response에는 원문 전체를 반환하지 않는다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."inputMetadataJson" IS 'snapshot count, input hash, schema version 등 원문 없이 추적 가능한 metadata.';
COMMENT ON COLUMN "AiWeeklySalesReport"."outputJson" IS 'AI provider가 strict JSON schema로 반환한 리포트 결과. READY 상태에서 section response로 변환한다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."dataCoverageJson" IS 'AI가 참고한 일정, 딜, 회의록 수와 누락 신호 요약.';
COMMENT ON COLUMN "AiWeeklySalesReport"."safeErrorCode" IS '사용자와 운영자에게 노출 가능한 안전한 실패 code.';
COMMENT ON COLUMN "AiWeeklySalesReport"."safeErrorMessage" IS '사용자에게 노출 가능한 안전한 실패 메시지. provider raw detail을 넣지 않는다.';
COMMENT ON COLUMN "AiWeeklySalesReport"."requestedAt" IS '사용자가 생성 요청을 보낸 시각. UTC instant.';
COMMENT ON COLUMN "AiWeeklySalesReport"."startedAt" IS '비동기 job이 provider 처리를 시작한 시각. UTC instant.';
COMMENT ON COLUMN "AiWeeklySalesReport"."generatedAt" IS 'AI 리포트 생성 성공 시각. UTC instant.';
COMMENT ON COLUMN "AiWeeklySalesReport"."failedAt" IS 'AI 리포트 생성 실패 시각. UTC instant.';
COMMENT ON COLUMN "AiWeeklySalesReport"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "AiWeeklySalesReport"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: AiWeeklySalesReportSuggestion
COMMENT ON TABLE "AiWeeklySalesReportSuggestion" IS 'AI 주간 리포트 section에서 표시할 구조화 제안. 실제 도메인 데이터를 자동 변경하지 않는다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."id" IS 'AiWeeklySalesReportSuggestion UUID primary key.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."reportId" IS '제안을 생성한 AI 리포트 version ID.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."userId" IS '제안 소유 사용자 ID. report와 같은 userId를 가진다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."type" IS '제안 유형. RISK, NEXT_ACTION, FOLLOW_UP, DATA_CLEANUP 중 하나다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."suggestionKey" IS '같은 report 안에서 AI output을 안정적으로 식별하는 key.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."priority" IS '제안 우선순위. 화면 정렬과 badge에 사용한다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."title" IS '제안 카드 제목.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."body" IS '제안 카드 본문. 사용자에게 노출되는 안전한 설명이다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."reason" IS 'AI가 이 제안을 만든 이유. provider raw reasoning이 아니라 사용자에게 설명 가능한 근거만 저장한다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."targetType" IS '연결 대상 record 타입. DEAL, SCHEDULE, MEETING_NOTE, CONTACT 등 다형 참조 문자열.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."targetId" IS '연결 대상 record ID. 다형 참조이므로 직접 FK를 걸지 않는다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."targetPath" IS 'User Web에서 대상 record를 열 경로.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."targetLabel" IS '사용자에게 보여줄 대상 record label.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."payloadJson" IS 'follow-up 초안, cleanup 세부 정보 등 section별 구조화 payload. provider raw response 전체를 넣지 않는다.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "AiWeeklySalesReportSuggestion"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: AiJob
COMMENT ON TABLE "AiJob" IS 'AI 비동기 작업 상태. 05-A에서는 weekly report generation job을 추적한다.';
COMMENT ON COLUMN "AiJob"."id" IS 'AiJob UUID primary key.';
COMMENT ON COLUMN "AiJob"."userId" IS 'job 소유 사용자 ID.';
COMMENT ON COLUMN "AiJob"."operation" IS 'job이 수행할 AI 작업 종류.';
COMMENT ON COLUMN "AiJob"."status" IS 'job 상태. processor가 PENDING을 가져와 RUNNING, SUCCEEDED, FAILED로 전환한다.';
COMMENT ON COLUMN "AiJob"."targetType" IS 'job 대상 타입. 05-A에서는 AI_WEEKLY_SALES_REPORT.';
COMMENT ON COLUMN "AiJob"."targetId" IS 'job 대상 row ID. 05-A에서는 AiWeeklySalesReport.id.';
COMMENT ON COLUMN "AiJob"."idempotencyKey" IS '사용자 action 중복 방지를 위한 선택 key.';
COMMENT ON COLUMN "AiJob"."attemptCount" IS 'processor 처리 시도 수.';
COMMENT ON COLUMN "AiJob"."maxAttemptCount" IS 'processor 최대 처리 시도 수. 05-A 기본은 1이다.';
COMMENT ON COLUMN "AiJob"."safeErrorCode" IS 'job 실패 시 안전한 error code.';
COMMENT ON COLUMN "AiJob"."safeErrorMessage" IS 'job 실패 시 사용자에게 보여줄 수 있는 안전한 메시지.';
COMMENT ON COLUMN "AiJob"."requestedAt" IS 'job 생성 요청 시각. UTC instant.';
COMMENT ON COLUMN "AiJob"."startedAt" IS 'job 실행 시작 시각. UTC instant.';
COMMENT ON COLUMN "AiJob"."completedAt" IS 'job 성공 완료 시각. UTC instant.';
COMMENT ON COLUMN "AiJob"."failedAt" IS 'job 실패 시각. UTC instant.';
COMMENT ON COLUMN "AiJob"."metadataJson" IS 'job 처리 metadata. provider raw response나 prompt는 저장하지 않는다.';
COMMENT ON COLUMN "AiJob"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "AiJob"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: AiProviderCallLog
COMMENT ON TABLE "AiProviderCallLog" IS 'AI provider 호출 비용, latency, 실패 상태 추적 로그. prompt/raw response는 저장하지 않는다.';
COMMENT ON COLUMN "AiProviderCallLog"."id" IS 'AiProviderCallLog UUID primary key.';
COMMENT ON COLUMN "AiProviderCallLog"."userId" IS 'provider call을 발생시킨 사용자 ID.';
COMMENT ON COLUMN "AiProviderCallLog"."operation" IS 'provider 호출 목적.';
COMMENT ON COLUMN "AiProviderCallLog"."status" IS 'provider call 상태.';
COMMENT ON COLUMN "AiProviderCallLog"."reportId" IS '관련 AI 주간 리포트 ID. 05-A에서는 연결된다.';
COMMENT ON COLUMN "AiProviderCallLog"."jobId" IS '관련 AI job ID.';
COMMENT ON COLUMN "AiProviderCallLog"."provider" IS 'AI provider 이름. 예: openai.';
COMMENT ON COLUMN "AiProviderCallLog"."model" IS '호출한 모델 이름.';
COMMENT ON COLUMN "AiProviderCallLog"."requestId" IS 'HTTP 요청 또는 provider 요청 추적 ID. 민감 token은 넣지 않는다.';
COMMENT ON COLUMN "AiProviderCallLog"."latencyMs" IS 'provider 호출 latency milliseconds.';
COMMENT ON COLUMN "AiProviderCallLog"."inputTokenCount" IS 'provider가 반환한 input token count.';
COMMENT ON COLUMN "AiProviderCallLog"."outputTokenCount" IS 'provider가 반환한 output token count.';
COMMENT ON COLUMN "AiProviderCallLog"."totalTokenCount" IS 'provider가 반환한 total token count.';
COMMENT ON COLUMN "AiProviderCallLog"."estimatedCostAmount" IS '내부 추적용 예상 비용. 사용자 화면에는 기본 노출하지 않는다.';
COMMENT ON COLUMN "AiProviderCallLog"."costCurrency" IS '비용 통화. 기본 USD.';
COMMENT ON COLUMN "AiProviderCallLog"."safeErrorCode" IS 'provider 실패를 redaction한 안전한 code.';
COMMENT ON COLUMN "AiProviderCallLog"."safeErrorMessage" IS 'provider 실패를 redaction한 안전한 message.';
COMMENT ON COLUMN "AiProviderCallLog"."retryable" IS 'provider 호출 재시도 가능 여부.';
COMMENT ON COLUMN "AiProviderCallLog"."retryCount" IS 'provider 호출 재시도 횟수.';
COMMENT ON COLUMN "AiProviderCallLog"."startedAt" IS 'provider 호출 시작 시각. UTC instant.';
COMMENT ON COLUMN "AiProviderCallLog"."completedAt" IS 'provider 호출 성공 완료 시각. UTC instant.';
COMMENT ON COLUMN "AiProviderCallLog"."failedAt" IS 'provider 호출 실패 시각. UTC instant.';
COMMENT ON COLUMN "AiProviderCallLog"."metadataJson" IS 'redacted provider metadata. prompt, raw response, API key, quota detail은 저장하지 않는다.';
COMMENT ON COLUMN "AiProviderCallLog"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "AiProviderCallLog"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

-- Comments: indexes
COMMENT ON INDEX "AiWeeklySalesReport_userId_weekStart_version_key" IS '같은 사용자와 같은 주 안에서 version 번호 중복을 막는다.';
COMMENT ON INDEX "AiWeeklySalesReport_active_generation_key" IS '같은 사용자와 같은 주의 GENERATING report 중복 생성을 막는다.';
COMMENT ON INDEX "AiWeeklySalesReport_userId_weekStart_status_idx" IS '주간 리포트 최신 성공/생성 중/실패 이력 조회에 사용한다.';
COMMENT ON INDEX "AiWeeklySalesReport_userId_weekStart_version_idx" IS '주간 리포트 version 목록 최신순 조회에 사용한다.';
COMMENT ON INDEX "AiWeeklySalesReportSuggestion_reportId_suggestionKey_key" IS '같은 report 안에서 같은 AI suggestion key가 중복 저장되지 않게 한다.';
COMMENT ON INDEX "AiWeeklySalesReportSuggestion_userId_reportId_type_idx" IS '리포트 상세 section별 suggestion 조회에 사용한다.';
COMMENT ON INDEX "AiWeeklySalesReportSuggestion_userId_target_idx" IS '특정 record와 연결된 AI 제안을 찾는 데 사용한다.';
COMMENT ON INDEX "AiJob_status_operation_createdAt_idx" IS 'AI job processor가 처리할 pending job을 찾는 데 사용한다.';
COMMENT ON INDEX "AiJob_userId_operation_status_createdAt_idx" IS '사용자별 AI job 상태 조회와 운영 추적에 사용한다.';
COMMENT ON INDEX "AiJob_userId_targetType_targetId_idx" IS 'report와 연결된 job 조회에 사용한다.';
COMMENT ON INDEX "AiProviderCallLog_userId_operation_createdAt_idx" IS '사용자별 AI 비용과 사용량 추적에 사용한다.';
COMMENT ON INDEX "AiProviderCallLog_reportId_createdAt_idx" IS '리포트별 provider call 이력 조회에 사용한다.';
COMMENT ON INDEX "AiProviderCallLog_jobId_createdAt_idx" IS 'job별 provider call 이력 조회에 사용한다.';
COMMENT ON INDEX "AiProviderCallLog_status_createdAt_idx" IS 'provider 실패/성공 운영 조회에 사용한다.';
```

## 4. User model relation 추가 후보

Prisma `User` model에는 아래 relation을 추가한다.

```prisma
aiWeeklySalesReports      AiWeeklySalesReport[]
aiWeeklyReportSuggestions AiWeeklySalesReportSuggestion[]
aiJobs                    AiJob[]
aiProviderCallLogs        AiProviderCallLog[]
```

## 5. 구현 주의

- `AiWeeklySalesReport_active_generation_key`는 partial unique index이므로 migration SQL에 직접 둔다.
- `inputSnapshotJson`은 크기가 커질 수 있다. report response에서 원문 전체를 반환하지 않는다.
- 계정 삭제/법적 삭제 요청 정책은 별도 Privacy/Compliance 계획에서 다룬다.
- shared/cloud DB에 migration을 적용하기 전 `NBA-014` DB/Prisma 운영 gate를 확인한다.
