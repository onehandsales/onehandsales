# Before 12 Tasks

상태: G01-G06 Done / 12 Billing Handoff Ready
작성일: 2026-08-07
고도화일: 2026-08-08
성격: 12 Billing 착수 전 closeout 실행 계획
기준 문서: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK`
작성 구조 기준: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`

## 0. Goal 실행 준비 체크리스트

- [x] `01_IMPORT_JOB_PERSISTENCE`의 README, COMMON, API-SPEC, GOAL-SPECS, BE-TODO, FE-TODO 구조를 기준으로 문서 구조를 맞췄다.
- [x] `PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md` 기준 12 전에 할 항목만 포함했다.
- [x] goal은 `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`와 최종 handoff로만 나눴다.
- [x] 새 API, 새 DB migration, 새 User Web route, 새 Admin Web route, 새 Billing 기능은 이번 계획에서 제외했다.
- [x] UX/UI 판단 기준은 `AGENT/UXUI_AGENT`의 Notion식 작업공간 UX와 Attio식 CRM record 관계 UX로 고정했다.
- [x] 소프트웨어 아키텍처, API 계약, transaction, observability, frontend/backend 컨벤션은 `AGENT/SOFTWARE_AGENT` 기준으로 고정했다.
- [x] request, response, business logic, user flow, DB/Prisma 영향이 생기면 `BE/prisma`와 관련 API 계약을 먼저 확인하도록 각 goal에 gate를 넣었다.
- [x] 코드 작업이 발생하면 Backend/Frontend 모두 한글 주석 규칙을 따르도록 명시했다.
- [x] DB schema/migration/raw SQL 작업이 발생하면 한국어 Prisma 주석 또는 SQL `COMMENT ON`/`-- 한글 주석`을 남기도록 명시했다.

## 1. 목적

이 폴더는 `12_BILLING_SUBSCRIPTION_TAX` 착수 전에 반드시 닫아야 하는 PRE12 후속 작업만 `/goal`로 실행 가능하게 분리한다.

이번 계획은 새 제품 기능 구현 계획이 아니다. `PRE12_FOLLOWUP_RECHECK`에서 12 전에 할 것으로 분류된 운영 smoke와 문서 정합성 closeout만 다룬다.

## 2. Goal 분리 판단

PRE12 최종 분류에서 12 전에 할 것으로 확정된 항목은 5개뿐이다. 따라서 goal은 아래처럼 5개 실행 goal과 1개 handoff goal로 나눈다.

| 순서 | PRE12 ID | Goal | 작업 성격 | 실행 상태 |
| --- | --- | --- | --- | --- |
| G01 | `PRE12-F04` | Provider Smoke Closeout | Gmail/Microsoft production-equivalent provider smoke closeout | Done / Production Provider Smoke Verified |
| G02 | `PRE12-F31` | 10 Mobile Checklist Closeout | 10 Mobile Field Use 문서 체크리스트 정합성 | Done |
| G03 | `PRE12-F32` | User Web Route Architecture Closeout | User Web route/architecture 문서 정합성 | Done |
| G04 | `PRE12-F33` | 11 Admin Checklist Closeout | 11 Admin Operation checklist/goal index 정합성 | Done |
| G05 | `PRE12-F34` | Admin Web Architecture Legacy Closeout | Admin Web architecture/legacy route 정합성 | Done |
| G06 | closeout | Before 12 Closeout And Handoff | G01~G05 완료 후 12 착수 가능 상태 판정 | Done / 12 Billing Handoff Ready |

## 3. 포함 범위

- Gmail/Microsoft OAuth 연결과 allowlist 실제 발송 smoke 결과 closeout
- allowlist 밖 수신자 차단 smoke 결과 closeout
- 10 Mobile Field Use 완료 문서, checklist, FE/BE TODO 상태 정합성
- User Web route/architecture 문서와 실제 router 상태 정합성
- 11 Admin Operation 완료 문서, checklist, goal index, BE/FE TODO와 User Web 영향 문서 상태 정합성
- Admin Web architecture, active route, redirect route, legacy/inactive 코드 설명 정합성
- 12 Billing 착수 전 blocker, post-12 후보, billing 종속 후보 분리 상태 확인

## 4. 제외 범위

- 신규 Backend API 추가
- 신규 Prisma schema/migration 추가
- 신규 User Web route 활성화
- 신규 Admin Web route 활성화
- `/app/export` 활성화
- `/api/exports`, `ExportJob`, `UserDraft`, `/api/drafts/*` 추가
- Billing, subscription, plan, entitlement, payment, invoice, refund, tax, paywall 구현
- Customer/B2B tenant admin, organization/member/role/permission 구현
- Admin 직접 Trash 복구, 유료 복구, hard delete, purge 구현
- stale 문서에 맞추기 위한 `/app/notifications` rollback
- legacy `admin-query` route/API 활성화
- post-12 후보를 이번 폴더에서 구현하는 작업

## 5. 공통 구현 기준

모든 `/goal`은 착수 전에 아래를 확인한다.

- Request/Response 영향: 새 API 또는 기존 API 계약 변경이 필요한지 확인한다.
- Business Logic 영향: 기존 use case, provider, transaction 흐름이 바뀌는지 확인한다.
- User Flow 영향: User Web/Admin Web의 실제 route와 사용자 노출 상태가 바뀌는지 확인한다.
- UX/UI 영향: `AGENT/UXUI_AGENT` 기준과 충돌하는 화면/문구 변경이 있는지 확인한다.
- DB/Prisma 영향: `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`를 대조한다.
- Software 기준: `AGENT/SOFTWARE_AGENT`의 Backend/Frontend/API/DB/QA 기준을 따른다.
- 코드 주석: 코드 작업이 생기면 Backend class/interface는 `// 역할 : ...`, API method는 `// API : ...`, 내부 function은 `// 기능 : ...`를 사용한다. Frontend component/hook/API/event handler도 `// 기능 : ...`를 사용한다.
- DB 주석: schema/migration/raw SQL 작업이 생기면 한국어 Prisma 주석, SQL `COMMENT ON`, 또는 `-- 한글 주석`으로 목적, 보관/삭제 기준, 안전 조건을 남긴다.

## 6. 실행 순서

상세 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다.

```text
G01 Provider Smoke Closeout
-> G02 10 Mobile Checklist Closeout
-> G03 User Web Route Architecture Closeout
-> G04 11 Admin Checklist Closeout
-> G05 Admin Web Architecture Legacy Closeout
-> G06 Before 12 Closeout And Handoff
```

G06은 G01~G05가 모두 완료되기 전에는 완료할 수 없다. G01은 2026-08-10 배포 환경 실제 provider smoke verified 기준으로 완료 처리됐고, G02는 2026-08-09 10 Mobile 체크리스트 정합성 closeout으로 완료 처리됐으며, G03은 2026-08-09 User Web route/architecture 문서 정합성 closeout으로 완료 처리됐고, G04는 2026-08-09 11 Admin checklist/goal index 문서 정합성 closeout으로 완료 처리됐으며, G05는 2026-08-09 Admin Web architecture/legacy route 문서 정합성 closeout으로 완료 처리됐다. G06은 G01~G05 결과와 PRE12 최종 분류, 12 Billing scope를 대조해 12 Billing 문서 작성/상세화 착수 가능 상태로 handoff했다.

## 7. 완료 판정

- `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`가 각각 결과 문서로 닫힌다.
- G01은 Gmail과 Microsoft 365 모두 OAuth 연결, allowlist 실제 발송, allowlist 밖 차단이 성공해야 하며, 2026-08-10 배포 환경 실제 provider smoke verified 기준으로 닫혔다.
- 변경된 문서가 실제 BE/FE 코드 상태와 충돌하지 않는다.
- 12 Billing 착수 전 새 API/DB/route 구현이 발생하지 않는다.
- `PRE12_FOLLOWUP_RECHECK`와 이 폴더의 상태가 서로 맞는다.
- 12 Billing으로 넘길 항목과 post-12로 넘길 항목이 다시 섞이지 않는다.
- G06 handoff에서 12 착수 가능 여부가 명확히 기록된다.

## 8. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/README.md`
- `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/FINAL-CLASSIFICATION.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
