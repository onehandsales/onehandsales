-- 기능 : 계정 삭제 요청과 사용자 데이터 export 요청의 처리 상태 enum을 추가한다.
CREATE TYPE "AccountDeletionRequestStatus" AS ENUM (
  'REQUESTED',
  'CANCELLED',
  'PROCESSING',
  'COMPLETED'
);

CREATE TYPE "UserDataExportRequestStatus" AS ENUM (
  'REQUESTED',
  'PROCESSING',
  'READY',
  'EXPIRED',
  'FAILED'
);

-- 기능 : 사용자가 요청한 계정 삭제 유예 queue row를 저장한다.
CREATE TABLE "AccountDeletionRequest" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "status" "AccountDeletionRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "reasonCode" TEXT,
  "reasonMessage" TEXT,
  "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scheduledDeletionAt" TIMESTAMPTZ(3) NOT NULL,
  "canCancelUntil" TIMESTAMPTZ(3) NOT NULL,
  "cancelledAt" TIMESTAMPTZ(3),
  "processingStartedAt" TIMESTAMPTZ(3),
  "completedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- 기능 : 사용자가 요청한 본인 데이터 export queue row를 저장한다.
CREATE TABLE "UserDataExportRequest" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "status" "UserDataExportRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "includeSensitive" BOOLEAN NOT NULL DEFAULT false,
  "format" TEXT NOT NULL DEFAULT 'ZIP_JSON_XLSX',
  "artifactPath" TEXT,
  "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processingStartedAt" TIMESTAMPTZ(3),
  "completedAt" TIMESTAMPTZ(3),
  "expiresAt" TIMESTAMPTZ(3),
  "safeErrorCode" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "UserDataExportRequest_pkey" PRIMARY KEY ("id")
);

-- 기능 : 사용자별 열린 계정 삭제 요청 중복 생성을 방지하고 운영 queue 조회 index를 추가한다.
CREATE INDEX "AccountDeletionRequest_userId_status_requestedAt_idx"
  ON "AccountDeletionRequest"("userId", "status", "requestedAt");

CREATE INDEX "AccountDeletionRequest_status_requestedAt_idx"
  ON "AccountDeletionRequest"("status", "requestedAt");

CREATE INDEX "AccountDeletionRequest_scheduledDeletionAt_idx"
  ON "AccountDeletionRequest"("scheduledDeletionAt");

CREATE INDEX "AccountDeletionRequest_createdAt_idx"
  ON "AccountDeletionRequest"("createdAt");

CREATE UNIQUE INDEX "AccountDeletionRequest_open_user_key"
  ON "AccountDeletionRequest"("userId")
  WHERE "status" IN ('REQUESTED', 'PROCESSING');

-- 기능 : 사용자별 열린 데이터 export 요청 중복 생성을 방지하고 운영 queue 조회 index를 추가한다.
CREATE INDEX "UserDataExportRequest_userId_status_requestedAt_idx"
  ON "UserDataExportRequest"("userId", "status", "requestedAt");

CREATE INDEX "UserDataExportRequest_status_requestedAt_idx"
  ON "UserDataExportRequest"("status", "requestedAt");

CREATE INDEX "UserDataExportRequest_expiresAt_idx"
  ON "UserDataExportRequest"("expiresAt");

CREATE INDEX "UserDataExportRequest_createdAt_idx"
  ON "UserDataExportRequest"("createdAt");

CREATE UNIQUE INDEX "UserDataExportRequest_open_user_key"
  ON "UserDataExportRequest"("userId")
  WHERE "status" IN ('REQUESTED', 'PROCESSING', 'READY');

-- 기능 : 사용자 소유 요청 row는 계정 실제 삭제 시 함께 제거될 수 있도록 cascade FK를 둔다.
ALTER TABLE "AccountDeletionRequest"
  ADD CONSTRAINT "AccountDeletionRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserDataExportRequest"
  ADD CONSTRAINT "UserDataExportRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMENT ON TYPE "AccountDeletionRequestStatus" IS '계정 삭제 요청의 처리 상태.';
COMMENT ON TYPE "UserDataExportRequestStatus" IS '사용자 데이터 export 요청의 처리 상태.';

COMMENT ON TABLE "AccountDeletionRequest" IS '사용자가 요청한 계정 삭제 유예 queue row.';
COMMENT ON COLUMN "AccountDeletionRequest"."id" IS '계정 삭제 요청 row의 고유 식별자.';
COMMENT ON COLUMN "AccountDeletionRequest"."userId" IS '계정 삭제를 요청한 사용자 ID.';
COMMENT ON COLUMN "AccountDeletionRequest"."status" IS '계정 삭제 요청 처리 상태.';
COMMENT ON COLUMN "AccountDeletionRequest"."reasonCode" IS '사용자가 선택한 삭제 사유 코드.';
COMMENT ON COLUMN "AccountDeletionRequest"."reasonMessage" IS '사용자가 입력한 삭제 사유 메시지. Admin queue와 audit에는 원문을 노출하지 않는다.';
COMMENT ON COLUMN "AccountDeletionRequest"."requestedAt" IS '계정 삭제 요청을 생성한 시각.';
COMMENT ON COLUMN "AccountDeletionRequest"."scheduledDeletionAt" IS '실제 삭제/익명화 job을 실행할 수 있는 유예 만료 시각.';
COMMENT ON COLUMN "AccountDeletionRequest"."canCancelUntil" IS '사용자가 계정 삭제 요청을 취소할 수 있는 마지막 시각.';
COMMENT ON COLUMN "AccountDeletionRequest"."cancelledAt" IS '계정 삭제 요청을 취소한 시각.';
COMMENT ON COLUMN "AccountDeletionRequest"."processingStartedAt" IS '삭제/익명화 처리를 시작한 시각.';
COMMENT ON COLUMN "AccountDeletionRequest"."completedAt" IS '삭제/익명화 처리가 완료된 시각.';
COMMENT ON COLUMN "AccountDeletionRequest"."createdAt" IS '계정 삭제 요청 row 생성 시각.';
COMMENT ON COLUMN "AccountDeletionRequest"."updatedAt" IS '계정 삭제 요청 row 마지막 수정 시각.';
COMMENT ON INDEX "AccountDeletionRequest_userId_status_requestedAt_idx" IS '사용자별 계정 삭제 요청 상태 최신순 조회에 사용한다.';
COMMENT ON INDEX "AccountDeletionRequest_status_requestedAt_idx" IS 'Admin 계정 삭제 요청 queue 상태별 최신순 조회에 사용한다.';
COMMENT ON INDEX "AccountDeletionRequest_scheduledDeletionAt_idx" IS '계정 삭제 유예 만료 job 대상 조회에 사용한다.';
COMMENT ON INDEX "AccountDeletionRequest_createdAt_idx" IS 'Admin 계정 삭제 요청 queue 기본 최신순 조회에 사용한다.';
COMMENT ON INDEX "AccountDeletionRequest_open_user_key" IS '사용자별 열린 계정 삭제 요청이 중복 생성되지 않게 한다.';

COMMENT ON TABLE "UserDataExportRequest" IS '사용자가 요청한 본인 데이터 export queue row.';
COMMENT ON COLUMN "UserDataExportRequest"."id" IS '데이터 export 요청 row의 고유 식별자.';
COMMENT ON COLUMN "UserDataExportRequest"."userId" IS '데이터 export를 요청한 사용자 ID.';
COMMENT ON COLUMN "UserDataExportRequest"."status" IS '데이터 export 요청 처리 상태.';
COMMENT ON COLUMN "UserDataExportRequest"."includeSensitive" IS '민감 데이터 포함 여부. G08에서는 별도 확인 없는 true 요청을 거부한다.';
COMMENT ON COLUMN "UserDataExportRequest"."format" IS 'export 파일 형식 코드.';
COMMENT ON COLUMN "UserDataExportRequest"."artifactPath" IS '외부 storage 내부 artifact 경로. signed URL 원문을 저장하지 않는다.';
COMMENT ON COLUMN "UserDataExportRequest"."requestedAt" IS 'export 요청을 생성한 시각.';
COMMENT ON COLUMN "UserDataExportRequest"."processingStartedAt" IS 'export 파일 생성 처리를 시작한 시각.';
COMMENT ON COLUMN "UserDataExportRequest"."completedAt" IS 'export 파일 생성 처리가 완료된 시각.';
COMMENT ON COLUMN "UserDataExportRequest"."expiresAt" IS 'export 파일 다운로드 가능 만료 시각.';
COMMENT ON COLUMN "UserDataExportRequest"."safeErrorCode" IS 'export 처리 실패 시 운영자가 볼 수 있는 safe error code.';
COMMENT ON COLUMN "UserDataExportRequest"."createdAt" IS '데이터 export 요청 row 생성 시각.';
COMMENT ON COLUMN "UserDataExportRequest"."updatedAt" IS '데이터 export 요청 row 마지막 수정 시각.';
COMMENT ON INDEX "UserDataExportRequest_userId_status_requestedAt_idx" IS '사용자별 데이터 export 요청 상태 최신순 조회에 사용한다.';
COMMENT ON INDEX "UserDataExportRequest_status_requestedAt_idx" IS 'Admin 데이터 export 요청 queue 상태별 최신순 조회에 사용한다.';
COMMENT ON INDEX "UserDataExportRequest_expiresAt_idx" IS '만료된 export 요청 정리에 사용한다.';
COMMENT ON INDEX "UserDataExportRequest_createdAt_idx" IS 'Admin 데이터 export 요청 queue 기본 최신순 조회에 사용한다.';
COMMENT ON INDEX "UserDataExportRequest_open_user_key" IS '사용자별 열린 데이터 export 요청이 중복 생성되지 않게 한다.';
