-- 기능 : 사용자 에러 신고 처리 상태 enum을 추가한다.
CREATE TYPE "ErrorReportStatus" AS ENUM (
  'OPEN'
);

-- 기능 : User Web 도움말 모달에서 접수된 에러 신고를 저장한다.
CREATE TABLE "error_reports" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "userEmail" TEXT,
  "userDisplayName" TEXT,
  "userRole" "UserRole" NOT NULL,
  "description" TEXT NOT NULL,
  "pageUrl" TEXT NOT NULL,
  "userAgent" TEXT,
  "requestId" TEXT,
  "screenshotStorageProvider" TEXT,
  "screenshotStorageBucket" TEXT,
  "screenshotStorageKey" TEXT,
  "screenshotFileName" TEXT,
  "screenshotMimeType" TEXT,
  "screenshotSizeBytes" INTEGER,
  "screenshotChecksum" TEXT,
  "status" "ErrorReportStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "error_reports_pkey" PRIMARY KEY ("id")
);

-- 기능 : 사용자별 신고 이력과 관리자 처리 queue 조회를 빠르게 만든다.
CREATE INDEX "error_reports_userId_createdAt_idx"
  ON "error_reports"("userId", "createdAt");

CREATE INDEX "error_reports_status_createdAt_idx"
  ON "error_reports"("status", "createdAt");

-- 기능 : 신고 사용자는 내부 User row를 참조한다.
ALTER TABLE "error_reports"
  ADD CONSTRAINT "error_reports_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TYPE "ErrorReportStatus" IS '사용자 에러 신고 처리 상태.';

COMMENT ON TABLE "error_reports" IS 'User Web 도움말 모달에서 접수된 사용자 에러 신고 row.';
COMMENT ON COLUMN "error_reports"."id" IS '에러 신고 row의 고유 식별자.';
COMMENT ON COLUMN "error_reports"."userId" IS '신고한 사용자 ID.';
COMMENT ON COLUMN "error_reports"."userEmail" IS '신고 당시 사용자 email snapshot.';
COMMENT ON COLUMN "error_reports"."userDisplayName" IS '신고 당시 사용자 이름 snapshot.';
COMMENT ON COLUMN "error_reports"."userRole" IS '신고 당시 사용자 role snapshot.';
COMMENT ON COLUMN "error_reports"."description" IS '사용자가 입력한 에러 설명. 일반 로그에 남기지 않는다.';
COMMENT ON COLUMN "error_reports"."pageUrl" IS '신고 시점 User Web 현재 주소.';
COMMENT ON COLUMN "error_reports"."userAgent" IS '요청 user-agent.';
COMMENT ON COLUMN "error_reports"."requestId" IS 'Backend request id.';
COMMENT ON COLUMN "error_reports"."screenshotStorageProvider" IS '스크린샷 저장 provider.';
COMMENT ON COLUMN "error_reports"."screenshotStorageBucket" IS '스크린샷 저장 bucket.';
COMMENT ON COLUMN "error_reports"."screenshotStorageKey" IS '스크린샷 저장 object key.';
COMMENT ON COLUMN "error_reports"."screenshotFileName" IS 'UTC timestamp와 UUID로 만든 파일명.';
COMMENT ON COLUMN "error_reports"."screenshotMimeType" IS '스크린샷 MIME type.';
COMMENT ON COLUMN "error_reports"."screenshotSizeBytes" IS '스크린샷 파일 크기.';
COMMENT ON COLUMN "error_reports"."screenshotChecksum" IS '스크린샷 SHA-256 checksum.';
COMMENT ON COLUMN "error_reports"."status" IS '관리자 처리 상태. 최초 OPEN.';
COMMENT ON COLUMN "error_reports"."createdAt" IS '신고 접수 시각.';
COMMENT ON COLUMN "error_reports"."updatedAt" IS '신고 row 수정 시각.';
COMMENT ON INDEX "error_reports_userId_createdAt_idx" IS '사용자별 신고 이력 조회에 사용한다.';
COMMENT ON INDEX "error_reports_status_createdAt_idx" IS '관리자 처리 queue 조회에 사용한다.';
