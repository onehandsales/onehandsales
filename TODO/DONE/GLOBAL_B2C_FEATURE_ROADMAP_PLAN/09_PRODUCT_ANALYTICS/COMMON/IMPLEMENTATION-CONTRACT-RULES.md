# Implementation Contract Rules

상태: Confirmed

## 1. 목적

09의 각 `/goal`은 구현 전에 request, response, business logic, user flow, DB/Prisma 영향, 코드 주석 기준을 확인해야 한다.

## 2. Goal 필수 섹션

각 `COMMON/GOAL-SPECS/G*.md`는 아래 항목을 반드시 가진다.

- Request 계약
- Response 계약
- Business Logic
- User Flow
- DB/Prisma 영향
- 코드 주석 기준
- Goal 검토 체크리스트

API가 없는 goal도 `Request/Response 영향 없음`을 명시한다. DB 변경이 없는 goal도 `DB/Prisma 변경 없음`을 명시한다.

## 3. API 계약 기준

API가 포함된 goal은 구현 전 `COMMON/API-SPEC`의 계약 상태가 `confirmed`인지 확인한다.

API 계약에는 아래 항목을 둔다.

- 계약 상태
- 소비자
- 호환성
- Method / Path
- 인증 / 권한
- Request DTO 이름
- Request path/query/header/cookie/body 구분
- Response DTO 이름
- Success status
- Error response와 FE 처리
- Business Logic
- 연결 DB schema
- Transaction
- Observability

## 4. Prisma 기준

DB 관련 goal은 반드시 아래 파일을 먼저 확인한다.

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

Prisma schema 예시:

```prisma
/// 기능 : 이벤트 당시 사용자 timezone 기준 날짜입니다. D1/D7/D30 retention 계산에 사용합니다.
eventDate DateTime @db.Date
```

Migration SQL 예시:

```sql
-- 기능 : 제품 분석 원본 이벤트를 저장합니다.
CREATE TABLE "ProductAnalyticsEvent" (...);

COMMENT ON TABLE "ProductAnalyticsEvent" IS 'Global B2C 제품 사용 분석을 위한 allowlist 기반 원본 이벤트.';
COMMENT ON COLUMN "ProductAnalyticsEvent"."payloadJson" IS 'event별 allowlist schema를 통과한 비식별 payload.';
```

## 5. Transaction 기준

- 제품 mutation과 analytics event 저장은 같은 transaction에 묶지 않는다.
- analytics event 저장 실패는 제품 mutation rollback 사유가 아니다.
- activation/retention snapshot batch는 batch 단위 transaction 또는 upsert를 사용한다.
- retention day offset은 사용자 timezone 기준 `eventDate` date-only 값을 helper로 더하고 서버 local timezone을 쓰지 않는다.
- Prisma `DateTime @db.Date` 저장 변환은 `YYYY-MM-DD`를 UTC midnight `Date`로 만드는 helper만 사용한다.
- Prisma `DateTime @db.Date` 조회 변환은 `toISOString().slice(0, 10)` 기준 helper만 사용한다.
- Account deletion hard purge는 user-linked analytics row 삭제를 포함해야 한다.
- AI provider call log는 기존 transaction/provider 정책을 따른다.

## 6. Observability 기준

- log event key는 영어 dot notation을 사용한다.
- request id를 사용한다.
- analytics payload 원문을 log context에 남기지 않는다.
- server event 저장 실패는 warning log로 남긴다.
- snapshot runner tick/failure는 structured log로 남긴다.
- retention purge 결과는 count 중심으로 남긴다.

## 7. 코드 주석 기준

Backend:

- controller endpoint: `// API : ...`
- class/interface: `// 역할 : ...`
- use case/service/repository/helper: `// 기능 : ...`
- 긴 orchestration: `// 1. ...`, `// 2. ...`

Frontend:

- component/hook/function/event handler/API client: `// 기능 : ...`

주석은 한국어로 쓰고, 함수명이나 클래스명을 단순 번역한 수준으로 쓰지 않는다.

## 8. 금지 사항

- API 계약 없이 endpoint를 먼저 만들지 않는다.
- FE가 userId/sessionId/deviceId를 analytics event에 넣지 않는다.
- payload에 PII/raw text/prompt/raw response를 넣지 않는다.
- product feature success를 analytics failure 때문에 실패 처리하지 않는다.
- Admin full UI/API를 09에서 구현하지 않는다.
- Billing/paywall/churn 최종 계약을 09에서 확정하지 않는다.
