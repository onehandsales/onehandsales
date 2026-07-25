# G02 Deal Activity DB Prisma

상태: Ready
목표: DealActivity DB foundation 구현

## 1. 목적

딜 activity 정본을 저장할 Prisma enum/model/migration을 추가한다.

## 2. 선행 조건

- G01 완료
- `COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` DB/Prisma 운영 gate 확인
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

## 6. 주석 기준

Prisma schema에는 한글 주석을 둔다.

예:

```prisma
/// 기능 : 딜 상세 timeline에 표시할 활동 정본입니다. private memo와 provider raw detail은 저장하지 않습니다.
model DealActivity {
  ...
}
```

Migration SQL에는 table/column/index 의도를 한글 주석 또는 COMMENT로 남긴다. `BE-TODO/DB-SCHEMA.md`의 DDL 예시를 기준으로 하되, 실제 Prisma migration 생성 결과와 이름이 다르면 생성 결과에 맞춘다.

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
