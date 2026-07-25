-- 기능 : 딜 활동 유형을 고정 enum으로 관리해 활동 내역 표시와 자동 생성 분기를 안정화합니다.
CREATE TYPE "DealActivityType" AS ENUM (
  'DEAL_CREATED',
  'STAGE_CHANGED',
  'NEXT_ACTION_CREATED',
  'NEXT_ACTION_COMPLETION_CHANGED',
  'SCHEDULE_LINKED',
  'SCHEDULE_UNLINKED',
  'MEETING_NOTE_LINKED',
  'MEETING_NOTE_UNLINKED',
  'FOLLOW_UP_SENT',
  'FOLLOW_UP_FAILED',
  'CALL',
  'MEETING',
  'EMAIL',
  'VISIT',
  'NOTE'
);

-- 기능 : 활동이 시스템, 사용자, 연결 도메인 중 어디에서 생성됐는지 구분합니다.
CREATE TYPE "DealActivitySourceType" AS ENUM (
  'SYSTEM',
  'USER',
  'NEXT_ACTION',
  'SCHEDULE',
  'MEETING_NOTE',
  'FOLLOW_UP'
);

COMMENT ON TYPE "DealActivityType" IS '딜 활동 내역에 표시할 활동 종류. 수동 활동과 자동 활동을 함께 표현한다.';
COMMENT ON TYPE "DealActivitySourceType" IS '활동 생성 출처. 수정 가능 여부와 연결 레코드 해석에 사용한다.';

-- 기능 : 딜 상세 활동 내역의 정본 행입니다. 비공개 메모와 외부 제공자 원문 세부 정보는 저장하지 않습니다.
CREATE TABLE "DealActivity" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "dealId" UUID NOT NULL,
  "activityType" "DealActivityType" NOT NULL,
  "sourceType" "DealActivitySourceType" NOT NULL,
  "sourceId" UUID,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "body" TEXT,
  "occurredAt" TIMESTAMPTZ(3) NOT NULL,
  "linkedRecordsJson" JSONB,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "DealActivity_pkey" PRIMARY KEY ("id")
);

COMMENT ON TABLE "DealActivity" IS '딜 상세에서 시간순으로 보여줄 활동 정본. 민감 원문과 외부 제공자 원문 응답은 저장하지 않는다.';
COMMENT ON COLUMN "DealActivity"."userId" IS '활동 소유 사용자. 모든 조회, 생성, 수정에서 소유권 조건으로 사용한다.';
COMMENT ON COLUMN "DealActivity"."dealId" IS '활동이 속한 딜. 삭제된 딜의 활동은 일반 User Web에 노출하지 않는다.';
COMMENT ON COLUMN "DealActivity"."activityType" IS '활동 내역 표시 유형과 비즈니스 분기 기준.';
COMMENT ON COLUMN "DealActivity"."sourceType" IS 'SYSTEM/USER/NEXT_ACTION/SCHEDULE/MEETING_NOTE/FOLLOW_UP 출처 구분.';
COMMENT ON COLUMN "DealActivity"."sourceId" IS '원본 사건 또는 원본 레코드 ID. 단계 변경은 dealId, 연결 해제는 삭제 직전 연결 행 ID, follow-up 발송 성공/실패는 FollowUpDeliveryAttempt.id를 저장한다.';
COMMENT ON COLUMN "DealActivity"."title" IS '활동 내역 제목. 구조화 로그에 원문을 남기지 않는다.';
COMMENT ON COLUMN "DealActivity"."summary" IS '안전한 짧은 요약. 비공개 메모, follow-up 본문 전체, 외부 제공자 원문 세부 정보를 넣지 않는다.';
COMMENT ON COLUMN "DealActivity"."body" IS '수동 활동 본문. 사용자가 민감정보를 적을 수 있으므로 로그와 목록 요약에 원문을 남기지 않는다.';
COMMENT ON COLUMN "DealActivity"."occurredAt" IS '활동 발생 시각. 활동 내역 정렬 커서의 1차 기준이다.';
COMMENT ON COLUMN "DealActivity"."linkedRecordsJson" IS 'User Web 이동에 필요한 targetType, targetId, targetPath, targetLabel만 담는 안전한 연결 레코드 배열. 삭제되거나 접근 불가한 원본은 response 변환 시 제외한다.';
COMMENT ON COLUMN "DealActivity"."metadataJson" IS '자동 활동 생성에 필요한 허용 목록 기반 비식별 메타데이터. 외부 제공자 원문 응답, token, API key, quota detail을 넣지 않는다.';

-- 기능 : 딜 상세 활동 내역을 최신순 커서 페이지네이션으로 조회합니다. PostgreSQL btree의 동일 방향 정렬을 명시해 occurredAt DESC, id DESC 정렬을 직접 만족합니다.
CREATE INDEX "DealActivity_userId_dealId_occurredAt_id_idx"
  ON "DealActivity"("userId", "dealId", "occurredAt" DESC, "id" DESC);

-- 기능 : 사용자 단위 활동 유형 필터와 운영 확인에 사용합니다.
CREATE INDEX "DealActivity_userId_activityType_occurredAt_idx"
  ON "DealActivity"("userId", "activityType", "occurredAt");

-- 기능 : 자동 활동의 원본 레코드 추적과 중복 생성 방지 확인에 사용합니다.
CREATE INDEX "DealActivity_userId_sourceType_sourceId_idx"
  ON "DealActivity"("userId", "sourceType", "sourceId");

COMMENT ON INDEX "DealActivity_userId_dealId_occurredAt_id_idx" IS '딜 상세 활동 내역 최신순 조회와 커서 페이지네이션용 색인. occurredAt DESC, id DESC 정렬을 직접 만족한다.';
COMMENT ON INDEX "DealActivity_userId_activityType_occurredAt_idx" IS '활동 유형 필터 조회용 색인.';
COMMENT ON INDEX "DealActivity_userId_sourceType_sourceId_idx" IS '사건 또는 원본 레코드 기반 자동 활동 추적과 중복 생성 확인용 색인.';

-- 기능 : 활동은 사용자 소유권 기준을 유지합니다.
ALTER TABLE "DealActivity"
  ADD CONSTRAINT "DealActivity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 기능 : 활동은 딜 삭제와 독립적으로 남기되, 일반 조회에서는 활성 딜만 노출합니다.
ALTER TABLE "DealActivity"
  ADD CONSTRAINT "DealActivity_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
