# Next Backend API Backlog Plan

상태: Draft
작성일: 2026-07-20
최종 업데이트: 2026-07-26
출처: `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN` G07

## 0. 완료 반영 체크리스트

- [x] `NBA-006 ImportJob persistence/resume API`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료
- [x] `NBA-009 Schedule week report`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`에서 구현 및 QA closeout 완료
- [x] `NBA-010 Notification`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`에서 구현 및 QA closeout 완료
- [x] `NBA-015 Google Calendar Integration`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`에서 구현 및 QA closeout 완료
- [x] `NBA-001 Deal list products summary`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout 완료
- [x] `NBA-002 Contact list dealCount`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout 완료
- [x] `NBA-003 Deal latest activity subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 부분 구현 및 QA closeout 완료
- [x] `NBA-008 Page size 15 contract cleanup`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 FE/BE/test/API 계약 확인 완료
- [x] `NBA-014` 06 범위 DB/Prisma migration 운영 gate closeout
- [x] `NBA-004 MeetingNote detail next action/follow-up draft subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`에서 구현 및 QA closeout 완료
- [x] `NBA-011 MeetingNote AI/STT provider log subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`에서 공통 `AiProviderCallLog` 확장으로 구현 및 QA closeout 완료
- [x] Backend/API/DB/User Web 영향 반영 완료
- [x] 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/TODO_LOG.md`
- [x] 완료 기록: `TODO_LOG/2026-07-22/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/TODO_LOG/2026-07-23/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/GOAL-SPECS/G06_QA_REVIEW_CLOSEOUT.md`
- [ ] 나머지 NBA 후보 계약 확정 및 구현 여부 판단

## 1. 목적

이 계획 후보는 UX/UI 공통 QA와 release QA에서 이번 범위 밖으로 분리한 Backend/API/DB 개선 후보를 한곳에 모은다.

이 문서는 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 입력 문서다. 여기서 확인된 Backend/API/DB 후보 중 Global B2C 기능 목표로 승격할 항목은 Global roadmap의 번호 슬롯으로 옮겨 확정하고, 구현 완료 뒤에는 해당 번호 폴더의 README/API/GOAL-SPECS/TODO_LOG를 완료 이력 정본으로 본다.

G07의 산출물이므로 이 문서는 구현 계획 확정본이 아니다. 각 후보는 제품 가치, API 영향, DB 영향, FE 영향, 보안/운영 리스크를 기준으로 분류했고, 실제 구현은 별도 `/goal`에서 API 계약과 DB 변경 여부를 확정한 뒤 진행한다.

## 2. 현재 결론

- BusinessCard provider failure contract는 남은 release follow-up 후보다.
- `NBA-003` 중 Deal list `latestActivity`는 06에서 구현 완료됐고, Company/Contact/Product latest summary와 generic summary endpoint는 product feature 후보로 남긴다.
- MeetingNote 상세 next action/follow-up draft와 AI/STT provider call log는 07에서 구현 완료됐다. MeetingNote 목록 latest/next summary는 product feature 후보로 남긴다.
- `NBA-014`는 06 범위에서 DB target, migration/seed 금지, Prisma 검증 gate를 닫았다. 실제 운영 DB 적용 절차, backup/restore, 장애 대응, Admin raw audit 같은 data reliability 운영 기준은 별도 첫 판매 gate에서 다룬다.
- `NBA-006 ImportJob persistence/resume API`는 2026-07-21 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-009 Schedule week report`는 2026-07-22 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-010 Notification`은 2026-07-22 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-015 Google Calendar Integration`은 2026-07-23 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-001`, `NBA-002`, `NBA-008`, `NBA-003`의 Deal latest activity subset은 2026-07-26 기준 `06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-004` MeetingNote detail next action/follow-up draft subset과 `NBA-011` MeetingNote provider log subset은 2026-07-26 기준 `07_MEETING_NOTE_AI_PROVIDER_LOG`에서 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- Trash private memo backend restriction, MeetingNote 목록 summary, MeetingNote Admin provider audit/retention, Trash 7일 이후 복구 정책, Admin 운영 UX/API는 남은 후보다.

## 2.1 `NBA-015` 반영 기준

`NBA-015`는 더 이상 이 백로그의 진행 중 후보가 아니다. 정본 완료 범위는 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`이며, 이 백로그에서는 완료 이력과 후속 제외 범위만 유지한다.

완료로 반영할 Backend/API/DB 영향:

- Google Calendar OAuth connect/callback/status/calendar list/selection/sync/disconnect API 구현
- `ExternalCalendarConnection`, `ExternalCalendarSource`, Schedule Google metadata, sync lock/status, token encryption persistence 구현
- 기존 Schedule API에 `meetingUrl`, `isAllDay`, `sourceType`, `googleCalendar`, soft delete/Trash 필드 반영
- Schedule delete를 hard delete에서 `deletedAt/trashExpiresAt` 기반 soft delete로 변경
- `SCHEDULE` Trash list/detail/restore와 Google-origin restore 시 `LOCAL_MODIFIED` 전환 구현
- Weekly Schedule Report와 weekly xlsx export에 Google-origin active schedule, source, meeting URL 반영
- Google-origin schedule도 한손 `SCHEDULE_START_REMINDER` 생성/변경/취소 대상에 포함

남은 백로그로 오해하지 않을 범위:

- 실제 Google provider smoke는 env 미준비로 미실행했으며 운영 확인 단계에서 별도로 본다.
- Google export/write, realtime webhook/watch, 반복 일정 정식 모델, 여러 Google 계정 동시 연결, Google 외 provider는 04 완료 범위가 아니다.
- Admin provider failure UI/log는 `NBA-013` 또는 별도 Admin/ops 계획에서 다룬다.

## 2.2 `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-008`, `NBA-014` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`은 2026-07-26 G07 QA closeout 기준으로 Completed다. 이 백로그에서는 아래 항목을 active 후보가 아니라 완료 이력으로만 유지한다.

완료로 반영할 Backend/API/DB/User Web 영향:

- `DealActivity` Prisma model, migration, repository, timeline API 구현
- `GET /api/deals/:dealId/activities`, `POST /api/deals/:dealId/activities`, `PATCH /api/deals/:dealId/activities/:activityId` 구현
- 딜 생성, 단계 변경, 다음 행동, 일정, 회의록, follow-up 발송 성공/실패 activity transaction 연결
- `GET /api/deals` item에 `products`, `latestActivity` field 추가
- `GET /api/contacts` item에 `dealCount` field 추가
- page size 15 계약을 Backend/API/User Web/test 기준으로 확인
- User Web 딜 상세 activity timeline, 딜 목록 products/latest activity, 담당자 목록 dealCount 표시
- DB target과 migrate/seed 금지 기준 확인. 공유/운영성 DB에 무단 migrate/seed를 실행하지 않음

남은 백로그로 분리할 범위:

- `NBA-003` 중 Company/Contact/Product latest activity, latest memo, next action summary
- MeetingNote 목록 latest/next summary
- MeetingNote Admin provider audit, retention/cleanup, raw access policy
- BusinessCard provider failure contract
- Trash private memo response restriction과 7일 이후 복구/영구삭제 정책
- Admin 운영 API/UX와 data reliability 운영 절차

## 2.3 `NBA-004` MeetingNote detail subset, `NBA-011` provider log subset 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`는 2026-07-26 G06 QA closeout 기준으로 Completed다. 이 백로그에서는 아래 항목을 active 후보가 아니라 완료 이력으로만 유지한다.

완료로 반영할 Backend/API/DB/User Web 영향:

- 기존 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`에 provider call log와 safe failure 계약 반영
- 신규 `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`, `POST /api/meeting-notes/:meetingNoteId/follow-up-draft` 구현
- `AiProviderOperation`에 meeting-note text draft, STT transcription, STT draft, next action draft, follow-up draft operation 추가
- `AiProviderCallLog`에 `targetType`, `targetId`, target 조회 index 추가
- provider raw request/response, prompt 전문, 회의 원문, STT transcript 전문, follow-up body 전문을 log에 저장하지 않는 redaction 기준 확인
- User Web 생성 모달 AI/STT loading/error/success, STT transcript 임시 확인, 회의록 상세 AI 후속 작업 section, next action 후보 편집 저장, follow-up draft 수정/복사 구현
- Backend/User Web typecheck/lint/build/test/e2e 검증 통과

남은 백로그로 분리할 범위:

- `GET /api/meeting-notes` 목록 latest/next summary response field
- Admin/internal provider audit 조회 API, raw access reason, retention/cleanup policy
- 별도 transcript/raw provider response 저장 table
- AI 후보 자동 저장, follow-up 자동 발송, 회의록 follow-up 알림

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
- 완료된 Notification/Weekly Schedule Report/Google Calendar Integration/Deal Activity Timeline/MeetingNote AI Provider Log 범위를 넘어서는 새 알림 endpoint, Admin provider failure UI, PDF/범용 ExportJob, 반복 일정, AI 요약, Google Calendar export/write/realtime webhook, 범용 activity bus, MeetingNote 자동 저장/자동 발송 구현
- User Web에서 `/admin/api/*` 호출 추가
- FE 단독 page size 변경

API가 포함된 구현 goal을 시작하려면 `COMMON/API-SPEC`의 해당 계약을 `confirmed`로 승격하고, request/response/error/transaction/observability/DB/FE 처리 기준을 먼저 채운다.
