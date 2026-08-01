-- 기능 : Admin 운영 gate 점검 결과 상태 enum을 추가한다.
CREATE TYPE "AdminOperationCheckRunStatus" AS ENUM (
  'PASS',
  'WARN',
  'FAIL'
);

-- 기능 : DB/migration/backup/restore/provider smoke 점검 결과를 기록한다.
CREATE TABLE "AdminOperationCheckRun" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "adminUserId" UUID NOT NULL,
  "environment" TEXT NOT NULL,
  "status" "AdminOperationCheckRunStatus" NOT NULL,
  "itemsJson" JSONB NOT NULL DEFAULT '{}',
  "notes" TEXT,
  "checkedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminOperationCheckRun_pkey" PRIMARY KEY ("id")
);

-- 기능 : 최신 운영 gate 상태와 관리자별 점검 이력을 빠르게 조회한다.
CREATE INDEX "AdminOperationCheckRun_environment_checkedAt_idx"
  ON "AdminOperationCheckRun"("environment", "checkedAt");

CREATE INDEX "AdminOperationCheckRun_status_checkedAt_idx"
  ON "AdminOperationCheckRun"("status", "checkedAt");

CREATE INDEX "AdminOperationCheckRun_adminUserId_checkedAt_idx"
  ON "AdminOperationCheckRun"("adminUserId", "checkedAt");

-- 기능 : 점검 기록 행위자는 내부 관리자 User row를 참조한다.
ALTER TABLE "AdminOperationCheckRun"
  ADD CONSTRAINT "AdminOperationCheckRun_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TYPE "AdminOperationCheckRunStatus" IS 'Admin 운영 gate 점검 결과 상태.';

COMMENT ON TABLE "AdminOperationCheckRun" IS 'Admin이 기록한 DB/migration/backup/restore/provider smoke 운영 gate 점검 row.';
COMMENT ON COLUMN "AdminOperationCheckRun"."id" IS '운영 gate 점검 기록 row의 고유 식별자.';
COMMENT ON COLUMN "AdminOperationCheckRun"."adminUserId" IS '점검을 기록한 관리자 사용자 ID.';
COMMENT ON COLUMN "AdminOperationCheckRun"."environment" IS '점검 대상 환경. local, qa, staging, production 중 하나.';
COMMENT ON COLUMN "AdminOperationCheckRun"."status" IS '전체 운영 gate 점검 결과.';
COMMENT ON COLUMN "AdminOperationCheckRun"."itemsJson" IS 'prisma validate/generate, migration, seed, backup, restore, provider smoke 결과 JSON. secret은 저장하지 않는다.';
COMMENT ON COLUMN "AdminOperationCheckRun"."notes" IS '운영자가 남긴 점검 메모. DB URL, token, secret 저장은 validation으로 차단한다.';
COMMENT ON COLUMN "AdminOperationCheckRun"."checkedAt" IS '점검 기준 시각.';
COMMENT ON COLUMN "AdminOperationCheckRun"."createdAt" IS '점검 기록 row 생성 시각.';
COMMENT ON INDEX "AdminOperationCheckRun_environment_checkedAt_idx" IS '환경별 최신 운영 gate 점검 조회에 사용한다.';
COMMENT ON INDEX "AdminOperationCheckRun_status_checkedAt_idx" IS '상태별 운영 gate 점검 이력 조회에 사용한다.';
COMMENT ON INDEX "AdminOperationCheckRun_adminUserId_checkedAt_idx" IS '관리자별 운영 gate 점검 이력 조회에 사용한다.';
