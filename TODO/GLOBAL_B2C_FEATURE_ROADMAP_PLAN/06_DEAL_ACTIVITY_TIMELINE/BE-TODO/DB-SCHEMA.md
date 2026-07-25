# DB Schema TODO

상태: Confirmed
확정일: 2026-07-25

## 1. 목적

06은 `DealActivity` 정본 model을 추가한다.

실제 source of truth는 구현 후 `BE/prisma/schema.prisma`와 migration 파일이다.

## 2. 신규 enum 후보

### DealActivityType

- `DEAL_CREATED`
- `STAGE_CHANGED`
- `NEXT_ACTION_CREATED`
- `NEXT_ACTION_COMPLETION_CHANGED`
- `SCHEDULE_LINKED`
- `SCHEDULE_UNLINKED`
- `MEETING_NOTE_LINKED`
- `MEETING_NOTE_UNLINKED`
- `FOLLOW_UP_SENT`
- `FOLLOW_UP_FAILED`
- `CALL`
- `MEETING`
- `EMAIL`
- `VISIT`
- `NOTE`

### DealActivitySourceType

- `SYSTEM`
- `USER`
- `NEXT_ACTION`
- `SCHEDULE`
- `MEETING_NOTE`
- `FOLLOW_UP`

## 3. 신규 model 후보

```prisma
/// 기능 : 딜 상세 활동 내역에 표시할 활동 정본입니다. 비공개 메모와 외부 제공자 원문 세부 정보는 저장하지 않습니다.
model DealActivity {
  id                String                 @id @default(uuid()) @db.Uuid
  userId            String                 @db.Uuid
  dealId            String                 @db.Uuid
  activityType      DealActivityType
  sourceType        DealActivitySourceType
  sourceId          String?                @db.Uuid
  title             String
  summary           String?
  body              String?                @db.Text
  occurredAt        DateTime               @db.Timestamptz(3)
  linkedRecordsJson Json?
  metadataJson      Json?
  createdAt         DateTime               @default(now()) @db.Timestamptz(3)
  updatedAt         DateTime               @updatedAt @db.Timestamptz(3)

  /// 기능 : 활동을 소유한 사용자입니다. 모든 활동 조회와 변경은 이 userId로 제한합니다.
  user User @relation(fields: [userId], references: [id])
  /// 기능 : 활동이 속한 딜입니다.
  deal Deal @relation(fields: [dealId], references: [id])

  @@index([userId, dealId, occurredAt, id])
  @@index([userId, activityType, occurredAt])
  @@index([userId, sourceType, sourceId])
}
```

실제 구현 시 Prisma relation 이름 충돌과 cascade/restrict 정책을 G01/G02에서 확인한다.

## 4. Migration SQL DDL 예시

아래 SQL은 G02 migration 작성 시 기준으로 삼을 예시다. 실제 Prisma migration 생성 결과와 constraint/index 이름이 다르면 G02에서 생성 결과에 맞춰 보정하되, table/column/index 의도를 설명하는 한국어 문장의 한글 주석 또는 `COMMENT ON`은 반드시 남긴다.

```sql
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

-- 기능 : 딜 상세 활동 내역을 최신순 커서 페이지네이션으로 조회합니다.
CREATE INDEX "DealActivity_userId_dealId_occurredAt_id_idx"
  ON "DealActivity"("userId", "dealId", "occurredAt", "id");

-- 기능 : 사용자 단위 활동 유형 필터와 운영 확인에 사용합니다.
CREATE INDEX "DealActivity_userId_activityType_occurredAt_idx"
  ON "DealActivity"("userId", "activityType", "occurredAt");

-- 기능 : 자동 활동의 원본 레코드 추적과 중복 생성 방지 확인에 사용합니다.
CREATE INDEX "DealActivity_userId_sourceType_sourceId_idx"
  ON "DealActivity"("userId", "sourceType", "sourceId");

COMMENT ON INDEX "DealActivity_userId_dealId_occurredAt_id_idx" IS '딜 상세 활동 내역 최신순 조회와 커서 페이지네이션용 색인.';
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
```

## 5. 기존 model 변경 후보

`Deal`에 relation 추가:

```prisma
/// 기능 : 딜 상세 활동 내역에 표시할 활동 목록입니다.
activities DealActivity[]
```

`User`에 relation 추가:

```prisma
/// 기능 : 사용자가 만든 딜 활동 목록입니다. 모든 조회와 변경은 이 userId로 제한합니다.
dealActivities DealActivity[]
```

## 6. Migration 주의

- 신규 migration만 추가한다.
- 기존 migration 파일을 수정하지 않는다.
- `NBA-014` DB/Prisma 운영 gate를 확인한다.
- 공유/운영성 DB에 무단 migrate/seed를 실행하지 않는다.
- table/column/index에 COMMENT 또는 한글 SQL 주석을 남긴다.
- `body`는 민감정보가 포함될 수 있으므로 structured log에 남기지 않는 기준을 함께 구현한다.
- timeline 조회 index는 `occurredAt desc, id desc` 정렬을 만족해야 한다. PostgreSQL btree 역방향 scan 또는 Prisma desc index 지원 여부를 G02에서 확인하고 실제 migration SQL 주석에 남긴다.

## 7. 삭제 정책

1차에서는 `DealActivity`에 soft delete field를 넣지 않는다.

이유:

- 수동 activity 삭제를 1차에서 제공하지 않는다.
- 자동 activity는 수정/삭제하지 않는다.
- 삭제/retention/audit 정책은 11 Admin/Trust/policy와 연결한다.

후속에서 삭제가 필요하면 `deletedAt`, `deletedByUserId`, `trashExpiresAt` 또는 별도 retention model을 검토한다.

## 8. Summary/cache 정책

- 1차에서는 summary cache table을 만들지 않는다.
- Deal list latest activity는 runtime aggregation으로 시작한다.
- 성능 문제가 확인되면 denormalized latest summary/cache를 후속으로 검토한다.

## 9. 검증 기준

- userId/dealId/occurredAt index로 timeline 조회가 가능하다.
- sourceType/sourceId로 중복 자동 activity 방지 또는 조회가 가능하다.
- products summary와 dealCount는 기존 relation runtime aggregation으로 처리한다.
- private memo/provider raw/follow-up body 전체를 저장하지 않는다.
