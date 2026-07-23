# API TODO

상태: Draft

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료
- [x] `NBA-009 Schedule week report`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`에서 구현 및 QA closeout 완료
- [x] `NBA-010 Notification`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`에서 구현 및 QA closeout 완료
- [x] `NBA-015 Google Calendar Integration`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`에서 구현 및 QA closeout 완료

## 1. 목적

이 문서는 G07에서 분리한 Backend/API 후속 후보를 실행 가능한 다음 계획으로 만들기 전의 초안이다.

이 문서에서 남은 새 API 후보는 `COMMON/API-SPEC/README.md`에서 `draft` 또는 `후보` 상태로만 관리한다. `NBA-006`, `NBA-009`, `NBA-010`, `NBA-015`는 별도 계획에서 구현 완료된 이력으로만 남긴다.

## 2. Release blocker 후보

### NBA-014. DB/Prisma migration 운영 gate closeout

- 연결 이슈: `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/ISSUE-LOG.md`의 `RQA-005`
- API 영향: 없음
- Backend 영향: Prisma generate, migration status, seed 정책, DB target 분류
- 다음 작업:
  - active `BE/.env` 기준 DB URL을 로컬 dev/test, 공유 QA, 운영성 중 하나로 확정한다.
  - cloud DB 대상이면 migration/seed 자동 실행을 금지하고 별도 운영 절차를 확정한다.
  - Windows Prisma query engine DLL `EPERM` lock 재현 원인을 실행 중 프로세스와 분리해 정리한다.
  - migrate status의 17개 미적용 보고를 운영 리스크로 닫거나 적용 절차를 확정한다.

## 3. Release follow-up API 후보

- `NBA-001`: Deal list `products` summary
- `NBA-002`: Contact list `dealCount`
- `NBA-005`: BusinessCard provider failure code/message contract
- `NBA-008`: Page size 15 contract cleanup

공통 다음 작업:

- API 계약을 `confirmed`로 승격할 별도 goal을 만든다.
- request/response DTO 이름, success status, error response, FE/BE 처리 기준을 적는다.
- ownership isolation과 pagination/filter 테스트 영향을 함께 적는다.
- FE client type 변경이 있으면 같은 goal에서 검증한다.

## 4. Product feature API 후보

- `NBA-003`: Company/Contact/Product latest memo/activity/next action summary
- `NBA-004`: MeetingNote next/latest summary

공통 다음 작업:

- 사용자-facing 가치와 MVP 이후 우선순위를 먼저 확정한다.
- 새 endpoint가 필요한지, 기존 list response 확장으로 충분한지 분리한다.
- DB table/migration 필요 여부를 `BE-TODO/DB-SCHEMA.md`와 함께 확정한다.
- 외부 Provider 또는 retention이 있으면 observability/redaction 기준을 먼저 잡는다.

## 5. Ops/security API 후보

- `NBA-007`: Trash private memo backend response restriction
- `NBA-011`: MeetingNote transcript/provider call log table
- `NBA-012`: Trash 7일 이후 복구 정책
- `NBA-013`: Admin 운영 UX/API

공통 다음 작업:

- 개인정보, 민감 원문, provider context, audit log 범위를 먼저 확정한다.
- Admin API는 AuthGuard와 AdminGuard를 모두 전제로 한다.
- 민감정보 원문 조회는 일반 상세 API에 섞지 않고 사유 입력과 audit log를 분리한다.
- User Web과 Admin Web API 경계를 섞지 않는다.

## 6. 금지

- 이 draft 문서만 보고 controller/service/repository를 구현하지 않는다.
- API 계약 상태가 `draft`인 후보를 구현하지 않는다.
- User API와 Admin API를 같은 endpoint의 role 분기로 합치지 않는다.
- private memo, transcript, provider raw detail을 일반 사용자 response에 추가하지 않는다.
