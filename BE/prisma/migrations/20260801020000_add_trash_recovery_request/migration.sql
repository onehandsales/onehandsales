-- 기능 : Trash 복구 요청의 운영 처리 상태 enum을 추가한다.
CREATE TYPE "TrashRecoveryRequestStatus" AS ENUM (
  'REQUESTED',
  'REVIEWING',
  'WAITING_RECOVERY_POLICY',
  'RECOVERY_AVAILABLE',
  'REJECTED',
  'CLOSED'
);

-- 기능 : 만료된 Trash row에 대한 사용자 복구 문의를 저장한다.
CREATE TABLE "TrashRecoveryRequest" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" UUID NOT NULL,
  "titleSnapshot" TEXT NOT NULL,
  "deletedAt" TIMESTAMPTZ(3) NOT NULL,
  "trashExpiresAt" TIMESTAMPTZ(3) NOT NULL,
  "message" TEXT NOT NULL,
  "status" "TrashRecoveryRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "TrashRecoveryRequest_pkey" PRIMARY KEY ("id")
);

-- 기능 : 사용자/상태별 운영 queue와 대상 row 중복 요청 조회를 위한 index를 추가한다.
CREATE INDEX "TrashRecoveryRequest_userId_status_createdAt_idx"
  ON "TrashRecoveryRequest"("userId", "status", "createdAt");

CREATE INDEX "TrashRecoveryRequest_targetType_targetId_idx"
  ON "TrashRecoveryRequest"("targetType", "targetId");

CREATE INDEX "TrashRecoveryRequest_status_createdAt_idx"
  ON "TrashRecoveryRequest"("status", "createdAt");

CREATE INDEX "TrashRecoveryRequest_createdAt_idx"
  ON "TrashRecoveryRequest"("createdAt");

CREATE UNIQUE INDEX "TrashRecoveryRequest_open_target_key"
  ON "TrashRecoveryRequest"("userId", "targetType", "targetId")
  WHERE "status" IN (
    'REQUESTED',
    'REVIEWING',
    'WAITING_RECOVERY_POLICY',
    'RECOVERY_AVAILABLE'
  );

-- 기능 : 복구 요청은 실제 사용자 row와 연결하되 계정 삭제 정책을 방해하지 않도록 제한 FK를 둔다.
ALTER TABLE "TrashRecoveryRequest"
  ADD CONSTRAINT "TrashRecoveryRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TYPE "TrashRecoveryRequestStatus" IS 'Trash 복구 요청의 운영 처리 상태.';

COMMENT ON TABLE "TrashRecoveryRequest" IS '무료 셀프 복구 기간이 지난 Trash row에 대해 사용자가 남긴 복구 요청.';
COMMENT ON COLUMN "TrashRecoveryRequest"."id" IS 'Trash 복구 요청 row의 고유 식별자.';
COMMENT ON COLUMN "TrashRecoveryRequest"."userId" IS '복구 요청을 생성한 사용자 ID.';
COMMENT ON COLUMN "TrashRecoveryRequest"."targetType" IS '복구 요청 대상 Trash targetType 문자열.';
COMMENT ON COLUMN "TrashRecoveryRequest"."targetId" IS '복구 요청 대상 record ID.';
COMMENT ON COLUMN "TrashRecoveryRequest"."titleSnapshot" IS '요청 생성 시점의 표시 제목 snapshot.';
COMMENT ON COLUMN "TrashRecoveryRequest"."deletedAt" IS '요청 대상 row가 Trash로 이동된 시각 snapshot.';
COMMENT ON COLUMN "TrashRecoveryRequest"."trashExpiresAt" IS '무료 셀프 복구 가능 기간이 끝난 시각 snapshot.';
COMMENT ON COLUMN "TrashRecoveryRequest"."message" IS '사용자가 입력한 복구 문의 메시지.';
COMMENT ON COLUMN "TrashRecoveryRequest"."status" IS 'Admin 운영자가 처리할 복구 요청 상태.';
COMMENT ON COLUMN "TrashRecoveryRequest"."createdAt" IS '복구 요청 생성 시각.';
COMMENT ON COLUMN "TrashRecoveryRequest"."updatedAt" IS '복구 요청 마지막 수정 시각.';
COMMENT ON INDEX "TrashRecoveryRequest_userId_status_createdAt_idx" IS '사용자별 복구 요청 상태 최신순 조회에 사용한다.';
COMMENT ON INDEX "TrashRecoveryRequest_targetType_targetId_idx" IS '복구 요청 대상 row 조회에 사용한다.';
COMMENT ON INDEX "TrashRecoveryRequest_status_createdAt_idx" IS 'Admin 복구 요청 queue 상태별 최신순 조회에 사용한다.';
COMMENT ON INDEX "TrashRecoveryRequest_createdAt_idx" IS 'Admin 복구 요청 queue 기본 최신순 조회에 사용한다.';
COMMENT ON INDEX "TrashRecoveryRequest_open_target_key" IS '같은 사용자와 같은 Trash 대상에 열린 복구 요청이 중복 생성되지 않게 한다.';
