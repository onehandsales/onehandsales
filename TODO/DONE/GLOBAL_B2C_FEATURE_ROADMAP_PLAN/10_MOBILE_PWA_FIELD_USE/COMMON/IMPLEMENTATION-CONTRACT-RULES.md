# Implementation Contract Rules

상태: Confirmed

## 1. 목적

10의 각 `/goal`은 Global B2C 개인 영업자 모바일 현장 업무를 target으로 유지하며 구현 전에 request, response, business logic, user flow, DB/Prisma 영향, 코드 주석 기준을 확인해야 한다.

UX/UI 변경 전에는 `AGENT/UXUI_AGENT` 기준을 확인한다. Software/architecture 변경 전에는 `AGENT/SOFTWARE_AGENT` 기준을 확인한다.

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
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/BUSINESS_CARD_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_ANALYTICS_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

DB column/model/table을 추가하거나 생성하는 goal은 아래를 반드시 지킨다.

- Prisma schema에는 추가 field/model의 의도를 한국어 주석으로 남긴다.
- migration SQL에는 가능한 경우 `COMMENT ON COLUMN` 또는 `COMMENT ON TABLE`을 추가한다.
- DB 주석에는 provider raw detail, PII, token, prompt를 저장하지 않는 이유가 필요한 경우 함께 적는다.
- DB 변경이 없는 goal도 `DB/Prisma 변경 없음`을 goal final에 명시한다.

## 5. Transaction 기준

- BusinessCard OCR provider 호출은 DB transaction 밖에서 수행한다.
- OCR 성공/실패 scan log 저장은 단일 model 변경이면 transaction 없음으로 둘 수 있다.
- BusinessCard confirm은 기존 회사/담당자 생성 또는 재사용과 scan log 갱신을 같은 transaction으로 유지한다.
- analytics event 저장 실패는 제품 기능 rollback 사유가 아니다.
- local draft는 FE local storage이므로 DB transaction 대상이 아니다.

## 6. Observability 기준

- log event key는 영어 dot notation을 사용한다.
- request id를 사용한다.
- provider raw response/prompt/API key/quota detail을 log context에 남기지 않는다.
- OCR/STT provider 실패는 safe error code와 retryable 여부만 사용자 응답에 둔다.
- 11 Admin 운영 로그로 넘길 provider raw audit 범위는 10에서 구현하지 않는다.

## 7. 코드 주석 기준

Backend:

- controller endpoint: `// API : ...`
- class/interface: `// 역할 : ...`
- use case/service/repository/helper: `// 기능 : ...`
- 긴 orchestration: `// 1. ...`, `// 2. ...`

Frontend:

- component/hook/function/event handler/API client: `// 기능 : ...`

공통:

- 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에는 한국어 주석을 단다.
- 단순 JSX markup, 단순 type alias, 자명한 변수 선언에는 억지 주석을 달지 않는다.
- 각 goal final에는 한국어 주석 기준 적용 여부를 기록한다.

## 8. 금지 사항

- API 계약 없이 endpoint나 response field를 먼저 만들지 않는다.
- 사용자 약관 동의로 browser push permission을 자동 허용 처리하지 않는다.
- local draft를 서버 DB에 저장하지 않는다.
- image/audio blob을 local draft에 저장하지 않는다.
- transcript/provider raw response를 local draft, analytics, 일반 log에 저장하지 않는다.
- Admin provider failure UI/API를 10에서 만들지 않는다.
- native app 코드를 10에서 만들지 않는다.
