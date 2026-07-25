# G02 Deal Activity DB Prisma

상태: Completed
목표: DealActivity DB foundation 구현

## 1. 목적

딜 activity 정본을 저장할 Prisma enum/model/migration을 추가한다.

## 2. 선행 조건

- G01 완료
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` DB/Prisma 운영 gate 확인
- 공유/운영성 DB에 무단 migrate/seed 실행 금지

## 3. 포함 범위

- `DealActivityType` enum
- `DealActivitySourceType` enum
- `DealActivity` model
- `Deal.activities` relation
- migration SQL
- migration SQL의 한글 주석과 `COMMENT ON`
- repository port 확장 또는 새 activity repository port
- repository test

## 4. 제외 범위

- Backend HTTP endpoint 구현
- Frontend 구현
- 수동 activity 삭제 field/API
- Admin audit table

## 5. Schema 기준

필드 후보:

- `id`
- `userId`
- `dealId`
- `activityType`
- `sourceType`
- `sourceId`
- `title`
- `summary`
- `body`
- `occurredAt`
- `linkedRecordsJson`
- `metadataJson`
- `createdAt`
- `updatedAt`

Index 후보:

- `[userId, dealId, occurredAt, id]`
- `[userId, activityType, occurredAt]`
- `[userId, sourceType, sourceId]`

`[userId, dealId, occurredAt, id]` index는 timeline의 `occurredAt desc, id desc` 정렬을 만족해야 한다. PostgreSQL btree 역방향 scan으로 충분한지, Prisma schema에서 desc index를 명시할지 G02에서 확인한다.

## 6. 주석 기준

Prisma schema에는 한국어 문장으로 주석을 둔다. enum/model/field 같은 고유 식별자는 영문 그대로 둔다.

예:

```prisma
/// 기능 : 딜 상세 활동 내역에 표시할 활동 정본입니다. 비공개 메모와 외부 제공자 원문 세부 정보는 저장하지 않습니다.
model DealActivity {
  ...
}
```

Migration SQL에는 table/column/index 의도를 한국어 문장의 한글 주석 또는 COMMENT로 남긴다. `BE-TODO/DB-SCHEMA.md`의 DDL 예시를 기준으로 하되, 실제 Prisma migration 생성 결과와 이름이 다르면 생성 결과에 맞춘다.

## 7. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run test -- deal
```

## 8. 완료 기준

- Prisma schema와 migration이 추가됐다.
- 기존 migration 파일을 수정하지 않았다.
- `DealActivity` repository contract가 준비됐다.
- DB target/migrate 실행 여부가 work log 또는 checklist에 기록됐다.

## 9. 완료 기록

- 완료일: 2026-07-26
- 신규 migration: `BE/prisma/migrations/20260726010000_add_deal_activity/migration.sql`
- Prisma schema 추가: `DealActivityType`, `DealActivitySourceType`, `DealActivity`, `User.dealActivities`, `Deal.activities`
- repository contract/helper/test 추가:
  - `BE/src/modules/deal/application/ports/deal-activity.repository.ts`
  - `BE/src/modules/deal/infrastructure/persistence/prisma-deal-activity.repository.ts`
  - `BE/src/modules/deal/infrastructure/persistence/prisma-deal-activity.repository.spec.ts`
- index 결정: timeline 조회 index는 Prisma schema와 migration SQL에 `occurredAt DESC, id DESC`를 명시해 `ORDER BY occurredAt DESC, id DESC`를 직접 만족하게 했다.
- DB target: `DATABASE_URL`/`DIRECT_URL` host는 `aws-1-ap-northeast-2.pooler.supabase.com`, database는 `postgres`다.
- DB 실행 기록: 원격 Supabase target이므로 `prisma migrate dev`, `prisma migrate deploy`, `prisma seed`는 실행하지 않았다.
- 검증 통과:
  - `pnpm run prisma:validate`
  - `pnpm run prisma:generate`
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run test -- deal`
  - `pnpm run build`
