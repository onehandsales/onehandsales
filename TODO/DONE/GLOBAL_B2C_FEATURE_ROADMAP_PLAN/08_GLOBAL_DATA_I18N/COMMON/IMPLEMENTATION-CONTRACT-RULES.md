# Implementation Contract Rules

상태: Confirmed

## 1. 목적

08의 각 `/goal`은 구현 전에 request, response, business logic, user flow, DB/Prisma 영향을 확인해야 한다. 범위가 넓은 Global B2C 작업을 대충 구현하지 않도록 모든 goal에 같은 검토 틀을 적용한다.

## 2. Goal 필수 섹션

각 `COMMON/GOAL-SPECS/G*.md`는 아래 항목을 가진다.

- Request 계약: 변경되는 endpoint, query, param, body, form 입력값
- Response 계약: 변경되는 DTO/response field, error code, fallback response
- Business Logic: validation, default, fallback, migration, ownership, transaction
- User Flow: 사용자가 화면에서 어떤 순서로 행동하고 실패 시 어디로 복구되는지
- DB/Prisma 영향: schema, migration, seed, index, enum, data migration
- Goal 검토 체크리스트: 구현자가 완료 전에 직접 확인할 항목

API가 없는 goal도 `Request/Response 영향 없음`을 명시한다. DB 변경이 없는 goal도 `DB/Prisma 변경 없음`을 명시한다.

각 goal은 위 필수 섹션만으로 착수하지 않는다. 구현자는 반드시 `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`에서 실제 수정 후보 파일, 생성 후보 파일, 완료 산출물, 테스트 후보를 확인한 뒤 파일을 열어 현재 코드와 대조한다.

## 3. Prisma 기준

DB 관련 작업은 반드시 아래를 먼저 확인한다.

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`
- 관련 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*.md`

새 table, enum, column, index를 만들거나 기존 model을 바꿀 때는 현재 schema 스타일을 따른다.

Prisma schema:

```prisma
/// 기능 : 사용자가 앱에서 선택한 기본 국가 코드입니다.
countryCode String @default("KR")
```

새 model:

```prisma
/// 기능 : 사용자별 글로벌 지역 표시 기준을 관리합니다.
model ExampleGlobalRegion {
  /// 기능 : 글로벌 지역 row의 고유 식별자입니다.
  id String @id @default(uuid()) @db.Uuid
}
```

Migration SQL:

```sql
-- 기능 : 사용자 기본 국가와 기본 통화를 앱 설정값으로 저장합니다.
ALTER TABLE "User" ADD COLUMN "countryCode" TEXT NOT NULL DEFAULT 'KR';

COMMENT ON COLUMN "User"."countryCode" IS '사용자가 앱 입력과 표시 기본값으로 선택한 ISO 3166-1 alpha-2 국가 코드.';
```

## 4. DB 변경 금지/주의

- 기존 migration 파일을 수정하지 않는다.
- 운영/공유 DB에 무단 `migrate dev`, `migrate deploy`, `seed`를 실행하지 않는다.
- 새 migration은 기존 한국 데이터 보존을 최우선으로 한다.
- 자동 migration 실패 데이터는 삭제하지 않는다.
- enum 추가는 Prisma schema, migration, mapper, seed, test를 함께 확인한다.
- table을 새로 만들면 table comment, column comment, 주요 index comment를 migration에 남긴다.
- PII, token, provider raw response, phone/email 원문이 log 또는 migration comment에 남지 않게 한다.

## 5. Request / Response 작성 기준

- API 계약에는 계약 상태, 소비자, 호환성, API 이름, API 식별자, 인증, 권한을 적는다.
- API 계약 상태는 구현 착수 전 최소 `confirmed`여야 한다.
- request body와 query parameter는 예시 JSON 또는 text route로 남긴다.
- request DTO 이름을 적는다.
- response는 FE가 필요한 field와 fallback field를 명시한다.
- response DTO 이름, success status, body 유무를 적는다.
- error는 사용자 문구가 아니라 `code`, `field` 중심으로 명시한다.
- 날짜/시간 response는 ISO string을 유지한다.
- 통화/전화번호/국가/지역은 표시 문자열만 내려주지 말고 code 값을 포함한다.

## 5A. Transaction / Observability 작성 기준

- mutation API는 transaction 필요 여부를 `필요` 또는 `없음`으로 적는다.
- transaction이 필요하면 변경 model, rollback 범위, 외부 provider 호출 위치를 적는다.
- transaction이 필요 없으면 이유를 적는다.
- 외부 provider 호출은 DB transaction 밖에 둔다.
- mutation, 외부 provider, batch/import, 민감정보 흐름은 observability 항목을 생략하지 않는다.
- observability에는 log event key, request id, audit log 필요 여부, redaction 대상, provider error context를 적는다.
- log event key는 영어 dot notation을 사용한다.

## 6. 코드 주석 기준

Backend:

- controller endpoint: `// API : ...`
- class/interface: `// 역할 : ...`
- 내부 method/helper: `// 기능 : ...`
- 긴 use case 흐름: `// 1. ...`, `// 2. ...`

Frontend:

- component/function/hook/event handler/API client: `// 기능 : ...`

주석은 한국어로 쓰고, 함수명을 단순 번역한 수준으로 쓰지 않는다.
