# Software Agent Review

상태: Reviewed
검토일: 2026-07-27

## 1. 검토 기준

아래 `AGENT/SOFTWARE_AGENT` 문서를 기준으로 08 문서를 재검토했다.

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`

## 2. 발견한 보강 필요점

| 항목 | 보강 전 상태 | 보강 결과 |
|---|---|---|
| API 계약 상태/소비자/호환성 | 일부 API spec에 명시 부족 | API spec README와 주요 API 문서에 confirmed, User Web, 호환성 추가 |
| Transaction | goal 문서에는 있었지만 API spec 수준에서 부족 | User/Auth/Domain/Import Export API spec에 transaction 계약 추가 |
| Observability | provider 실패 중심으로만 일부 언급 | event key, request id, redaction, provider context 기준 추가 |
| Business Logic | 제품 결정 중심 | application 흐름, ownership, transaction, logging 기준 추가 |
| DB/Prisma | 참조와 주석 기준은 있었음 | 새 table/column/enum/index 작성 기준과 `BE/prisma` 필수 참조 강화 |
| Goal checklist | goal별 체크리스트는 있었음 | request/response/business/user flow/DB 공통 gate 추가 |

## 3. 08 구현 전 필수 Gate

- [ ] 구현 전 해당 goal의 API spec 계약 상태가 `confirmed`인지 확인한다.
- [ ] request/response DTO 이름과 FE API type이 일치한다.
- [ ] mutation은 transaction 필요 여부를 `필요` 또는 `없음`으로 명시한다.
- [ ] 외부 provider 호출은 DB transaction 밖에 둔다.
- [ ] observability event key와 redaction 기준을 구현 전에 확인한다.
- [ ] DB 변경 시 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`를 확인한다.
- [ ] 새 table/column/enum/index에는 Prisma schema 한글 주석과 migration COMMENT가 있다.
- [ ] User Web은 `/admin/api/*`를 호출하지 않는다.
- [ ] Backend는 controller business logic, direct Prisma access, direct provider SDK 호출을 피한다.

## 4. 남은 주의점

- 08은 문서상 ready 상태지만 실제 구현 전 G01에서 현재 코드 DTO 이름과 API path를 한 번 더 대조해야 한다.
- Apple/LINE 실제 smoke는 외부 provider env와 Supabase 설정이 필요한 항목이어서 G08/G10에는 수동 QA 결과 또는 미실행 사유를 남겼다. 2026-07-29 사용자 확인 기준 운영 환경 설정과 실제 OAuth 동작이 완료됐다.
- Product/Deal/Contact/Company 기존 export 구현체는 도메인별로 흩어져 있으므로 G07에서 실제 코드 위치를 먼저 확정해야 한다.
- 기존 AGENT 문서의 Google only, Apple/LINE future, provider-only user 판정 정책은 G01 또는 G10에서 구현 결과와 동기화해야 한다.
