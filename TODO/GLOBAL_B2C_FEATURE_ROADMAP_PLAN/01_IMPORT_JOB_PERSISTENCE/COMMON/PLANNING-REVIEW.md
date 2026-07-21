# Planning Review

상태: Done
검토일: 2026-07-21

## 1. 결론

- 판정: 완료
- 이유: `NBA-006 ImportJob persistence/resume API` 범위가 API, DB, BE, FE, UX, QA, goal 상세 명세까지 구현 및 QA closeout 완료 상태로 연결되어 있다.
- 구현 상태: Done
- 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

완료 전 첫 실행 문구 기록:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G01_DB_PERSISTENCE_FOUNDATION.md 기준으로 G01을 구현해줘.
```

## 2. 검토 대상

01 내부 문서:

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/USER-FLOW.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/IMPORT_JOB_API.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/GOAL-SPECS/G01_DB_PERSISTENCE_FOUNDATION.md`
- `COMMON/GOAL-SPECS/G02_BACKEND_IMPORT_JOB_API.md`
- `COMMON/GOAL-SPECS/G03_USER_WEB_RESUME_UX.md`
- `COMMON/GOAL-SPECS/G04_QA_CLEANUP.md`
- `COMMON/RELEASE-SCOPE-CHECK.md`
- `COMMON/REFERENCES.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`

상위 TODO:

- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/BE-TODO/API-TODO.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/FINAL-SERVICE-SHAPE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-IMPLEMENTED-FUNCTIONS.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/BE-TODO/BACKEND-PRODUCTIZATION-GUIDE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/FE-TODO/USER-WEB-PRODUCTIZATION-GUIDE.md`

AGENT 기준:

- `AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/019_agent_based_planning_review.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DATA_IMPORT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 3. 핵심 발견 사항

| 등급 | 문서 | 문제 | 조치 |
|---|---|---|---|
| Resolved | `COMMON` | `GOAL-SPECS`가 없어 `/goal`별 상세 명세 추적성이 부족했다. | `COMMON/GOAL-SPECS/*` 추가 |
| Resolved | `COMMON` | 구현 전 검토 결과 문서가 없었다. | `COMMON/PLANNING-REVIEW.md` 추가 |
| Resolved | `COMMON` | 출시 gate 전체와 01 범위의 관계가 문서 안에서 명확하지 않았다. | `COMMON/RELEASE-SCOPE-CHECK.md` 추가 |
| Resolved | `COMMON/API-SPEC` | API-SPEC 폴더 안내 문서가 없었다. | `COMMON/API-SPEC/README.md` 추가 |
| Resolved | `FE-TODO`, `USER-FLOW`, `API-SPEC` | 기존 성공 이력 route `/app/import/:importUserLogId`와 확정 전 job route `/app/import/:importJobId`가 충돌할 수 있었다. | 확정 전 review route를 `/app/import/review/:importJobId`로 분리 |
| Resolved | `DB-SCHEMA`, `API-SPEC`, `FE-TODO` | confirmed job 재조회 시 성공 이력 상세 route를 확정적으로 알 수 있는 link가 부족했다. | `ImportJob.importUserLogId` nullable link와 response field 추가 |
| Resolved | `DB-SCHEMA`, `API-SPEC` | 기존 parser/store는 `sourceColumns`를 핵심 상태로 사용하지만 DB/API 계약에 header snapshot 필드가 빠져 있었다. | `ImportJob.sourceColumnsJson`과 `ImportJobDetailResponse.sourceColumns` 추가 |
| Resolved | `API-SPEC`, `BE-TODO`, `FE-TODO` | `CreateImportJobRequest.templateId` 필수 계약이 현재 단순 UX와 기존 API 흐름과 충돌했다. | request는 `targetType`과 file만 받고 Backend가 active template을 찾아 `ImportJob.templateId`에 저장하도록 확정 |
| Resolved | `DB-SCHEMA`, `API-SPEC`, `BE-TODO` | mapping 설명이 일부 문서에서 file header -> template field 방향으로 적혀 있었지만 현재 구현은 template field key -> source column이다. | mapping 방향을 `template field key -> source column`으로 통일 |
| Resolved | `DB-SCHEMA`, `API-SPEC`, `G01` | `rowNumber`가 문서에서는 첫 data row 1, 실제 parser/DTO에서는 첫 data row 2로 달랐다. | 원본 파일 실제 row 번호 정책으로 통일. header row는 1, 첫 data row는 2 |
| Resolved | `GOAL-WORK-ORDER`, `G01`, `DB-SCHEMA` | 검증 명령이 실제 `BE/package.json` script와 달랐다. | `pnpm run prisma:migrate`로 수정 |
| Resolved | `BE-TODO`, `G02` | `GET /api/imports/active`가 동적 `:importJobId` route에 잡힐 수 있었다. | controller 선언 순서를 `active` 먼저로 명시 |

재검토에서 발견한 Critical/Major 후보는 위와 같이 모두 resolved로 반영했다. 현재 기준으로 완료 표기를 막는 미해결 Critical/Major 문제는 없다.

## 4. AGENT 기준 적합성

Backend:

- API 계약은 `confirmed`이며 각 API에 request, response, business logic, DB 연결, transaction, observability, error, FE/BE 처리 기준이 있다.
- BE 작업은 controller, application use case, repository/port, infrastructure adapter로 분리되어 있다.
- Prisma 직접 접근은 infrastructure adapter로 제한하는 기준이 문서화되어 있다.
- User API는 `/api/*`만 사용하고 Admin API와 섞지 않는다.
- 모든 신규 table에 `userId` ownership이 있다.
- confirm은 domain row와 `ImportUserLog*`를 같은 transaction에서 생성하도록 되어 있다.

Frontend/UX:

- User Web은 `/api/*`만 호출한다.
- TanStack Query key와 invalidation 기준이 있다.
- React Hook Form/Zod 사용 가능 구조와 API response source of truth 기준을 유지한다.
- 화면은 Notion식 단순 단계와 Attio식 linked record 정확성을 따른다.
- mobile은 desktop table 축소가 아니라 row card/list 전환을 명시한다.
- API response에 없는 summary를 FE에서 꾸미지 않는 기준이 있다.

DB/운영:

- DDL, index, FK, check constraint, table/column comment가 있다.
- 원본 파일 binary는 DB에 넣지 않는다.
- TTL 7일과 confirm/cancel/expire file delete 정책이 있다.
- raw row/provider raw response/PII logging 금지 기준이 있다.
- 공유/운영성 DB migration은 무단 실행하지 않는 기준이 있다.

## 5. 출시 범위 적합성

01은 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-006`만 구현 대상으로 삼았고, 해당 범위는 완료했다.

01에 포함된 출시 신뢰 항목:

- Import upload/mapping/validation/confirm 중 유실 방지
- refresh, tab 이동, server restart, deploy 중 resume
- 7일 TTL과 cleanup
- original file delete tracking
- cross-user 접근 차단
- confirm transaction rollback
- redacted error history

01에 포함하지 않는 출시 전체 항목:

- Payment/subscription
- Admin operation
- `/app` 다국어
- 다국가 phone/currency/address model
- Product analytics
- Notification
- Schedule week report
- MeetingNote provider audit
- Trash 7일 이후 복구 정책

이 제외는 누락이 아니라 `USER_WEB_PRODUCTIZATION_GAP_PLAN` 기준상 별도 first-sale bundle로 분리해야 하는 항목이다.

## 6. 누락 사항

없음.

## 7. 충돌 사항

없음.

## 8. 사용자의 결정이 필요한 질문

현재 `NBA-006` 구현 완료 상태에는 추가 질문이 필요 없다.

다만 Global B2C 첫 판매 전체로 넘어갈 때는 아래 질문이 별도 계획에서 필요하다.

- 첫 판매 국가
- 결제 provider 또는 Merchant of Record
- Admin 운영 최소 범위
- 앱 내부 다국어 우선순위
- Notification 첫 판매 필수 여부

## 9. 완료 여부

- 완료 여부: Done
- 완료 전 반드시 수정할 항목: 없음
- 완료 goal 순서: G01 -> G02 -> G03 -> G04
