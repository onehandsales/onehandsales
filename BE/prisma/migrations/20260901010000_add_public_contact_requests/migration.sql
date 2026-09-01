-- 기능 : 로그인 전 공개 문의 접수 처리 상태 enum을 추가합니다.
CREATE TYPE "PublicContactRequestStatus" AS ENUM (
  'OPEN'
);

-- 기능 : 로그인 전 공개 문의 페이지에서 접수된 도입/상담 요청을 저장하는 독립 테이블을 추가합니다.
CREATE TABLE "public_contact_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "normalizedEmail" TEXT NOT NULL,
  "companySize" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "marketingAgreement" BOOLEAN NOT NULL DEFAULT false,
  "wasExistingUserAtSubmission" BOOLEAN NOT NULL DEFAULT false,
  "pageUrl" TEXT,
  "locale" TEXT,
  "userAgent" TEXT,
  "requestId" TEXT,
  "status" "PublicContactRequestStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "public_contact_requests_pkey" PRIMARY KEY ("id")
);

-- 기능 : 공개 문의 접수 최신순 조회를 빠르게 만듭니다.
CREATE INDEX "public_contact_requests_createdAt_idx"
  ON "public_contact_requests"("createdAt");

-- 기능 : 이후 관리자 처리 queue 조회를 빠르게 만듭니다.
CREATE INDEX "public_contact_requests_status_createdAt_idx"
  ON "public_contact_requests"("status", "createdAt");

-- 기능 : 이메일 기준 검색과 중복 확인을 빠르게 만듭니다.
CREATE INDEX "public_contact_requests_normalizedEmail_idx"
  ON "public_contact_requests"("normalizedEmail");

-- 기능 : 제출 시점 회원 여부별 문의 조회를 빠르게 만듭니다.
CREATE INDEX "public_contact_requests_wasExistingUserAtSubmission_createdAt_idx"
  ON "public_contact_requests"("wasExistingUserAtSubmission", "createdAt");

COMMENT ON TYPE "PublicContactRequestStatus" IS '로그인 전 공개 문의 접수 처리 상태.';

COMMENT ON TABLE "public_contact_requests" IS '로그인 전 공개 문의 페이지에서 접수된 도입/상담 요청 row. 어떤 FK도 연결하지 않는 독립 테이블이다.';
COMMENT ON COLUMN "public_contact_requests"."id" IS '공개 문의 row의 고유 식별자.';
COMMENT ON COLUMN "public_contact_requests"."email" IS '사용자가 공개 문의 form에 입력한 이메일.';
COMMENT ON COLUMN "public_contact_requests"."normalizedEmail" IS '회원 여부 확인과 검색에 사용할 trim/lower-case 이메일.';
COMMENT ON COLUMN "public_contact_requests"."companySize" IS '사용자가 선택한 사용 인원 규모.';
COMMENT ON COLUMN "public_contact_requests"."firstName" IS '사용자가 입력한 이름.';
COMMENT ON COLUMN "public_contact_requests"."lastName" IS '사용자가 입력한 성.';
COMMENT ON COLUMN "public_contact_requests"."companyName" IS '사용자가 입력한 회사명.';
COMMENT ON COLUMN "public_contact_requests"."jobTitle" IS '사용자가 입력한 직함.';
COMMENT ON COLUMN "public_contact_requests"."region" IS '사용자가 선택한 국가 또는 지역 코드.';
COMMENT ON COLUMN "public_contact_requests"."phone" IS '사용자가 입력한 연락처 전화번호.';
COMMENT ON COLUMN "public_contact_requests"."plan" IS '사용자가 입력한 OneHand 사용 계획. 일반 application log에 남기지 않는다.';
COMMENT ON COLUMN "public_contact_requests"."source" IS '사용자가 선택한 OneHand 인지 경로.';
COMMENT ON COLUMN "public_contact_requests"."marketingAgreement" IS '제품 소식과 온보딩 안내 수신 동의 여부.';
COMMENT ON COLUMN "public_contact_requests"."wasExistingUserAtSubmission" IS '제출 시점에 같은 정규화 이메일을 가진 삭제되지 않은 회원이 있었는지 여부.';
COMMENT ON COLUMN "public_contact_requests"."pageUrl" IS '문의가 제출된 공개 페이지 URL.';
COMMENT ON COLUMN "public_contact_requests"."locale" IS '문의가 제출된 공개 사이트 언어.';
COMMENT ON COLUMN "public_contact_requests"."userAgent" IS '문의 제출 요청의 user-agent.';
COMMENT ON COLUMN "public_contact_requests"."requestId" IS 'Backend request id.';
COMMENT ON COLUMN "public_contact_requests"."status" IS '공개 문의 처리 상태. 최초 OPEN.';
COMMENT ON COLUMN "public_contact_requests"."createdAt" IS '공개 문의 접수 시각.';
COMMENT ON COLUMN "public_contact_requests"."updatedAt" IS '공개 문의 row 수정 시각.';
COMMENT ON INDEX "public_contact_requests_createdAt_idx" IS '공개 문의 접수 최신순 조회에 사용한다.';
COMMENT ON INDEX "public_contact_requests_status_createdAt_idx" IS '이후 관리자 처리 queue 조회에 사용한다.';
COMMENT ON INDEX "public_contact_requests_normalizedEmail_idx" IS '이메일 기준 검색과 중복 확인에 사용한다.';
COMMENT ON INDEX "public_contact_requests_wasExistingUserAtSubmission_createdAt_idx" IS '회원/비회원 제출 분류 조회에 사용한다.';
