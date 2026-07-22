# Next Backend API Backlog Plan

상태: Draft
작성일: 2026-07-20
출처: `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN` G07

## 0. 완료 반영 체크리스트

- [x] `NBA-006 ImportJob persistence/resume API`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료
- [x] `NBA-009 Schedule week report`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`에서 구현 및 QA closeout 완료
- [x] `NBA-010 Notification`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`에서 구현 및 QA closeout 완료
- [x] Backend/API/DB/User Web 영향 반영 완료
- [x] 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/TODO_LOG.md`
- [x] 완료 기록: `TODO_LOG/2026-07-22/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
- [ ] `NBA-014` DB/Prisma migration 운영 gate closeout
- [ ] 나머지 NBA 후보 계약 확정 및 구현 여부 판단

## 1. 목적

이 계획 후보는 UX/UI 공통 QA와 release QA에서 이번 범위 밖으로 분리한 Backend/API/DB 개선 후보를 한곳에 모은다.

G07의 산출물이므로 이 문서는 구현 계획 확정본이 아니다. 각 후보는 제품 가치, API 영향, DB 영향, FE 영향, 보안/운영 리스크를 기준으로 분류했고, 실제 구현은 별도 `/goal`에서 API 계약과 DB 변경 여부를 확정한 뒤 진행한다.

## 2. 현재 결론

- `RQA-005` DB/Prisma migration 운영 gate는 QA에서 S1 Blocked로 확인된 release blocker 후보다.
- Deal list `products`, Contact list `dealCount`, BusinessCard provider failure contract, page size 15 정리는 release follow-up 후보다.
- latest activity/next action summary, MeetingNote summary는 product feature 후보다.
- `NBA-006 ImportJob persistence/resume API`는 2026-07-21 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-009 Schedule week report`는 2026-07-22 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-010 Notification`은 2026-07-22 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- Trash private memo backend restriction, MeetingNote transcript/provider log, Trash 7일 이후 복구 정책, Admin 운영 UX/API는 ops/security 후보다.

## 3. 우선순위 분류 기준

| 분류 | 의미 |
|---|---|
| release blocker | QA에서 실제 S0/S1/S2로 확인되어 출시 판단을 막거나 사용자 결정 없이는 닫을 수 없는 항목 |
| release follow-up | 출시 전 품질을 높이지만 현재 S0/S1/S2는 아닌 항목 |
| product feature | 품질 QA가 아니라 새 기능 또는 새 사용자 가치에 가까운 항목 |
| ops/security | 운영, 보안, 개인정보, 감사, 복구 정책 확정이 필요한 항목 |
| defer | 당장 계획화하지 않고 근거만 남기는 항목 |

## 4. 작업 문서

- `COMMON/CANDIDATE-MATRIX.md`: 후보별 분류 매트릭스
- `COMMON/API-SPEC/README.md`: draft/후보 상태 API 계약 초안
- `BE-TODO/API-TODO.md`: Backend/API 후속 작업 후보
- `BE-TODO/DB-SCHEMA.md`: DB/migration 영향 후보
- `FE-TODO/USER-WEB-TODO.md`: User Web client/screen 영향 후보

## 5. 실행 금지

이 계획 후보 문서만으로 아래 작업을 시작하지 않는다.

- 새 endpoint 구현
- 기존 response field 추가
- Prisma schema 또는 migration 추가
- seed 수정 또는 운영/공유 DB migration 실행
- Admin API 구현
- 완료된 Notification/Weekly Schedule Report 범위를 넘어서는 새 알림 endpoint, Admin provider failure UI, PDF/범용 ExportJob, 반복 일정, AI 요약 구현
- User Web에서 `/admin/api/*` 호출 추가
- FE 단독 page size 변경

API가 포함된 구현 goal을 시작하려면 `COMMON/API-SPEC`의 해당 계약을 `confirmed`로 승격하고, request/response/error/transaction/observability/DB/FE 처리 기준을 먼저 채운다.
