-- 기능 : Admin 감사 로그와 민감 원문 조회 감사 기반 enum을 추가한다.
CREATE TYPE "AdminAuditAction" AS ENUM (
  'ADMIN_LOGIN',
  'ADMIN_USER_LIST_VIEW',
  'ADMIN_USER_DETAIL_VIEW',
  'ADMIN_DOMAIN_RECORDS_VIEW',
  'ADMIN_TRASH_VIEW',
  'ADMIN_PROVIDER_FAILURE_VIEW',
  'ADMIN_ANALYTICS_VIEW',
  'ADMIN_ACCOUNT_DELETION_VIEW',
  'ADMIN_DATA_EXPORT_VIEW',
  'ADMIN_SYSTEM_CHECK_VIEW',
  'ADMIN_SYSTEM_CHECK_RECORDED',
  'ADMIN_SENSITIVE_RAW_ACCESS'
);

CREATE TYPE "AdminAuditResult" AS ENUM (
  'SUCCESS',
  'DENIED',
  'FAILED'
);

CREATE TYPE "AdminTargetType" AS ENUM (
  'USER',
  'COMPANY',
  'CONTACT',
  'PRODUCT',
  'DEAL',
  'SCHEDULE',
  'MEETING_NOTE',
  'BUSINESS_CARD_SCAN',
  'IMPORT_JOB',
  'NOTIFICATION',
  'PROVIDER_FAILURE',
  'TRASH_RECORD',
  'ACCOUNT_DELETION_REQUEST',
  'DATA_EXPORT_REQUEST',
  'SYSTEM_OPERATION_CHECK'
);

CREATE TYPE "AdminSensitiveFieldSet" AS ENUM (
  'USER_CONTACT',
  'DOMAIN_MEMO',
  'MEETING_NOTE_BODY',
  'TRASH_RECORD_DETAIL'
);

-- 기능 : Admin 주요 조회와 운영 action을 append-only로 남긴다.
CREATE TABLE "AdminAuditLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "adminUserId" UUID NOT NULL,
  "targetUserId" UUID,
  "targetType" "AdminTargetType" NOT NULL,
  "targetId" UUID,
  "action" "AdminAuditAction" NOT NULL,
  "result" "AdminAuditResult" NOT NULL DEFAULT 'SUCCESS',
  "reason" TEXT,
  "requestId" TEXT,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- 기능 : Admin 민감 원문 조회 사유와 반환 필드명을 append-only로 남긴다.
CREATE TABLE "AdminSensitiveAccessLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "auditLogId" UUID NOT NULL,
  "adminUserId" UUID NOT NULL,
  "targetUserId" UUID NOT NULL,
  "targetType" "AdminTargetType" NOT NULL,
  "targetId" UUID NOT NULL,
  "fieldSet" "AdminSensitiveFieldSet" NOT NULL,
  "reason" TEXT NOT NULL,
  "returnedFieldNames" TEXT[] NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminSensitiveAccessLog_pkey" PRIMARY KEY ("id")
);

-- 기능 : Admin 감사 로그 조회와 대상 추적에 필요한 index를 추가한다.
CREATE INDEX "AdminAuditLog_adminUserId_createdAt_idx"
  ON "AdminAuditLog"("adminUserId", "createdAt");

CREATE INDEX "AdminAuditLog_targetUserId_createdAt_idx"
  ON "AdminAuditLog"("targetUserId", "createdAt");

CREATE INDEX "AdminAuditLog_action_createdAt_idx"
  ON "AdminAuditLog"("action", "createdAt");

CREATE INDEX "AdminAuditLog_targetType_targetId_createdAt_idx"
  ON "AdminAuditLog"("targetType", "targetId", "createdAt");

-- 기능 : 민감 원문 조회 로그 조회와 대상 추적에 필요한 index를 추가한다.
CREATE UNIQUE INDEX "AdminSensitiveAccessLog_auditLogId_key"
  ON "AdminSensitiveAccessLog"("auditLogId");

CREATE INDEX "AdminSensitiveAccessLog_adminUserId_createdAt_idx"
  ON "AdminSensitiveAccessLog"("adminUserId", "createdAt");

CREATE INDEX "AdminSensitiveAccessLog_targetUserId_createdAt_idx"
  ON "AdminSensitiveAccessLog"("targetUserId", "createdAt");

CREATE INDEX "AdminSensitiveAccessLog_targetType_targetId_createdAt_idx"
  ON "AdminSensitiveAccessLog"("targetType", "targetId", "createdAt");

-- 기능 : 감사 로그 actor와 민감 원문 조회 actor는 내부 관리자 User를 FK로 연결한다.
ALTER TABLE "AdminAuditLog"
  ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdminSensitiveAccessLog"
  ADD CONSTRAINT "AdminSensitiveAccessLog_auditLogId_fkey"
  FOREIGN KEY ("auditLogId") REFERENCES "AdminAuditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdminSensitiveAccessLog"
  ADD CONSTRAINT "AdminSensitiveAccessLog_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TYPE "AdminAuditAction" IS 'Admin 감사 로그에 기록할 운영 action 종류.';
COMMENT ON TYPE "AdminAuditResult" IS 'Admin 감사 로그 처리 결과.';
COMMENT ON TYPE "AdminTargetType" IS 'Admin 감사 또는 민감 원문 조회 대상 종류.';
COMMENT ON TYPE "AdminSensitiveFieldSet" IS 'Admin 민감 원문 조회에서 허용하는 필드 묶음.';

COMMENT ON TABLE "AdminAuditLog" IS 'Admin 주요 조회와 운영 action을 append-only로 남기는 감사 로그.';
COMMENT ON COLUMN "AdminAuditLog"."id" IS 'Admin 감사 로그 row의 고유 식별자.';
COMMENT ON COLUMN "AdminAuditLog"."adminUserId" IS '작업을 수행한 관리자 사용자 ID.';
COMMENT ON COLUMN "AdminAuditLog"."targetUserId" IS '감사 대상 사용자 ID snapshot. 계정 삭제를 막지 않도록 FK를 만들지 않는다.';
COMMENT ON COLUMN "AdminAuditLog"."targetType" IS '감사 대상 종류.';
COMMENT ON COLUMN "AdminAuditLog"."targetId" IS '감사 대상 record ID.';
COMMENT ON COLUMN "AdminAuditLog"."action" IS '수행된 Admin action.';
COMMENT ON COLUMN "AdminAuditLog"."result" IS '수행 결과.';
COMMENT ON COLUMN "AdminAuditLog"."reason" IS '운영자가 입력한 사유. 원문 민감값은 저장하지 않는다.';
COMMENT ON COLUMN "AdminAuditLog"."requestId" IS 'HTTP 요청 추적 ID.';
COMMENT ON COLUMN "AdminAuditLog"."ipHash" IS 'IP 원문 대신 저장하는 HMAC 또는 단방향 hash.';
COMMENT ON COLUMN "AdminAuditLog"."userAgentHash" IS 'User-Agent 원문 대신 저장하는 hash.';
COMMENT ON COLUMN "AdminAuditLog"."metadataJson" IS '원문 민감값 없는 구조화 metadata.';
COMMENT ON COLUMN "AdminAuditLog"."createdAt" IS '감사 로그 생성 시각.';
COMMENT ON INDEX "AdminAuditLog_adminUserId_createdAt_idx" IS '관리자별 감사 로그 최신순 조회에 사용한다.';
COMMENT ON INDEX "AdminAuditLog_targetUserId_createdAt_idx" IS '대상 사용자별 감사 로그 최신순 조회에 사용한다.';
COMMENT ON INDEX "AdminAuditLog_action_createdAt_idx" IS 'action별 감사 로그 최신순 조회에 사용한다.';
COMMENT ON INDEX "AdminAuditLog_targetType_targetId_createdAt_idx" IS '대상 record별 감사 로그 최신순 조회에 사용한다.';

COMMENT ON TABLE "AdminSensitiveAccessLog" IS 'Admin 민감 원문 조회 사유와 반환 필드명을 추적하는 append-only 로그.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."id" IS '민감 원문 조회 로그 row의 고유 식별자.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."auditLogId" IS '연결된 AdminAuditLog ID.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."adminUserId" IS '작업을 수행한 관리자 사용자 ID.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."targetUserId" IS '민감정보 소유 사용자 ID snapshot.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."targetType" IS '민감정보 대상 종류.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."targetId" IS '민감정보 대상 record ID.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."fieldSet" IS '조회한 민감 필드 묶음.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."reason" IS '운영자가 입력한 원문 조회 사유.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."returnedFieldNames" IS '원문 값 없이 반환된 필드명만 저장한다.';
COMMENT ON COLUMN "AdminSensitiveAccessLog"."createdAt" IS '민감 원문 조회 로그 생성 시각.';
COMMENT ON INDEX "AdminSensitiveAccessLog_auditLogId_key" IS '감사 로그와 민감 원문 조회 로그의 1:1 관계를 보장한다.';
COMMENT ON INDEX "AdminSensitiveAccessLog_adminUserId_createdAt_idx" IS '관리자별 민감 원문 조회 최신순 조회에 사용한다.';
COMMENT ON INDEX "AdminSensitiveAccessLog_targetUserId_createdAt_idx" IS '대상 사용자별 민감 원문 조회 최신순 조회에 사용한다.';
COMMENT ON INDEX "AdminSensitiveAccessLog_targetType_targetId_createdAt_idx" IS '대상 record별 민감 원문 조회 최신순 조회에 사용한다.';
