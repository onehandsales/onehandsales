-- 기능 : 사용자 지원 요청 문의 유형 enum을 추가한다.
CREATE TYPE "SupportRequestType" AS ENUM (
  'FEATURE_QUESTION',
  'PRICING_QUESTION',
  'PHONE_CONSULTATION',
  'FEATURE_SUGGESTION',
  'OTHER'
);

-- 기능 : 사용자 지원 요청 처리 상태 enum을 추가한다.
CREATE TYPE "SupportRequestStatus" AS ENUM (
  'OPEN'
);

-- 기능 : User Web 도움말 모달에서 접수된 지원 요청을 저장한다.
CREATE TABLE "support_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "userEmail" TEXT,
  "userDisplayName" TEXT,
  "userRole" "UserRole" NOT NULL,
  "type" "SupportRequestType" NOT NULL,
  "description" TEXT NOT NULL,
  "pageUrl" TEXT NOT NULL,
  "userAgent" TEXT,
  "requestId" TEXT,
  "status" "SupportRequestStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

-- 기능 : 사용자별 지원 요청 이력, 처리 queue, 유형별 조회를 빠르게 만든다.
CREATE INDEX "support_requests_userId_createdAt_idx"
  ON "support_requests"("userId", "createdAt");

CREATE INDEX "support_requests_status_createdAt_idx"
  ON "support_requests"("status", "createdAt");

CREATE INDEX "support_requests_type_createdAt_idx"
  ON "support_requests"("type", "createdAt");

-- 기능 : 지원 요청 사용자는 내부 User row를 참조한다.
ALTER TABLE "support_requests"
  ADD CONSTRAINT "support_requests_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TYPE "SupportRequestType" IS '사용자 지원 요청 문의 유형.';
COMMENT ON TYPE "SupportRequestStatus" IS '사용자 지원 요청 처리 상태.';

COMMENT ON TABLE "support_requests" IS 'User Web 도움말 모달에서 접수된 사용자 지원 요청 row.';
COMMENT ON COLUMN "support_requests"."id" IS '지원 요청 row의 고유 식별자.';
COMMENT ON COLUMN "support_requests"."userId" IS '지원 요청을 남긴 사용자 ID.';
COMMENT ON COLUMN "support_requests"."userEmail" IS '지원 요청 당시 사용자 email snapshot.';
COMMENT ON COLUMN "support_requests"."userDisplayName" IS '지원 요청 당시 사용자 이름 snapshot.';
COMMENT ON COLUMN "support_requests"."userRole" IS '지원 요청 당시 사용자 role snapshot.';
COMMENT ON COLUMN "support_requests"."type" IS '지원 요청 문의 유형.';
COMMENT ON COLUMN "support_requests"."description" IS '사용자가 입력한 지원 요청 본문. 일반 로그에 남기지 않는다.';
COMMENT ON COLUMN "support_requests"."pageUrl" IS '지원 요청 시점 User Web 현재 주소.';
COMMENT ON COLUMN "support_requests"."userAgent" IS '요청 user-agent.';
COMMENT ON COLUMN "support_requests"."requestId" IS 'Backend request id.';
COMMENT ON COLUMN "support_requests"."status" IS '관리자 처리 상태. 최초 OPEN.';
COMMENT ON COLUMN "support_requests"."createdAt" IS '지원 요청 접수 시각.';
COMMENT ON COLUMN "support_requests"."updatedAt" IS '지원 요청 row 수정 시각.';
COMMENT ON INDEX "support_requests_userId_createdAt_idx" IS '사용자별 지원 요청 이력 조회에 사용한다.';
COMMENT ON INDEX "support_requests_status_createdAt_idx" IS '관리자 처리 queue 조회에 사용한다.';
COMMENT ON INDEX "support_requests_type_createdAt_idx" IS '문의 유형별 지원 요청 조회에 사용한다.';
