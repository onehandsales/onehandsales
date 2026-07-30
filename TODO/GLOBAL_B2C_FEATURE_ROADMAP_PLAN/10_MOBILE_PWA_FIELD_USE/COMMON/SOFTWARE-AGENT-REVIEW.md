# Software Agent Review

상태: Confirmed

## 1. 목적

10번 문서가 `AGENT/SOFTWARE_AGENT`의 API, transaction, observability, frontend, DB schema 기준을 따르는지 구현 전에 확인한다.

## 2. 확인한 기준

- `BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`
- `BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `COMMON/ENVIRONMENT.md`
- `DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `DB_SCHEMA/BUSINESS_CARD_SCHEMA.md`
- `DB_SCHEMA/PRODUCT_ANALYTICS_SCHEMA.md`

## 3. 반영 결과

| 기준 | 10번 반영 |
|---|---|
| API contract | `COMMON/API-SPEC`에 method/path/auth/request/response/error/business logic 명시 |
| API spec | 기존 API 재사용 여부와 신규 response field를 명시 |
| Transaction | provider 호출을 장기 transaction에서 제외, confirm만 transaction 유지 |
| Observability | request id, safe error code, provider/model만 허용하고 raw detail 금지 |
| Comment rule | backend/frontend 주석 기준을 공통 문서와 goal 문서에 포함 |
| Environment | 10번 기본 범위에는 신규 env var 없음 |
| Frontend User Web | 모바일 작업 화면 중심, API failure non-blocking, console logging 금지 |
| DB schema | `BusinessCardScanLog` safe failure fields 외 신규 model 없음 |
| Product Analytics | 기존 `ProductAnalyticsEvent` 재사용, payload privacy rules 유지 |

## 4. 구현자가 반드시 확인할 항목

- [ ] API 구현 전 관련 API-SPEC 파일을 열어 실제 DTO와 맞춘다.
- [ ] DB 변경 전 `BE/prisma/schema.prisma`를 다시 확인한다.
- [ ] provider raw response/error를 response/log/analytics/local draft에 넣지 않는다.
- [ ] analytics recorder 실패는 본 mutation을 실패시키지 않는다.
- [ ] 새 공개 함수/핵심 함수 주석은 한국어 한 줄로 역할/기능을 설명한다.
- [ ] 신규 env var를 만들면 `COMMON/ENVIRONMENT.md` 반영 여부를 final에 기록한다.
