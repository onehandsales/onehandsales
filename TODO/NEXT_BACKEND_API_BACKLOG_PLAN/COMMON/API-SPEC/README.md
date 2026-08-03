# API Spec

상태: Draft
작성일: 2026-07-20
최종 업데이트: 2026-08-03

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: implemented and final-closeout completed in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE` G01~G09
- [x] `NBA-009 Schedule week report`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`
- [x] `NBA-010 Notification`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`
- [x] `NBA-015 Google Calendar Integration`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`
- [x] `NBA-001 Deal list products summary`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- [x] `NBA-002 Contact list dealCount`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- [x] `NBA-003 Deal latest activity subset`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- [x] `NBA-008 Page size 15 contract cleanup`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
- [x] `NBA-004 MeetingNote detail next action/follow-up draft subset`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- [x] `NBA-011 MeetingNote provider log subset`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- [x] `08_GLOBAL_DATA_I18N`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- [x] `09_PRODUCT_ANALYTICS`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- [x] `NBA-005 BusinessCard provider failure code/message contract`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- [x] `10_MOBILE_PWA_FIELD_USE`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- [x] `NBA-007 Trash private memo backend response restriction`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- [x] `NBA-011` Admin/internal provider audit scope: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- [x] `NBA-012 Trash retention/recovery status contract`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- [x] `NBA-013 Admin operation API`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- [x] `11_ADMIN_OPERATION`: implemented in `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`

## 1. 계약 상태

이 폴더의 남은 active API 후보 항목은 `draft` 또는 `후보` 상태다.

완료 이력으로 승격된 `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-004` MeetingNote detail subset, `NBA-005`, `NBA-006`, `NBA-007`, `NBA-008`, `NBA-009`, `NBA-010`, `NBA-011`, `NBA-012`, `NBA-013`, `NBA-014`, `NBA-015`, `08_GLOBAL_DATA_I18N`, `09_PRODUCT_ANALYTICS`, `10_MOBILE_PWA_FIELD_USE`, `11_ADMIN_OPERATION` 외에는 `confirmed`, `implemented` 상태의 새 API 계약을 만들지 않는다. 실제 구현 전에 각 후보는 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`와 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md` 기준으로 별도 계약 문서를 가져야 한다.

사용자 결정 기준으로 12를 먼저 진행한다. 12 완료 후 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`를 따라 남은 API 후보를 다시 분류하고, 필요한 경우 새 TODO 폴더의 `COMMON/API-SPEC`에서 계약을 `confirmed`로 승격한다.

예외: `NBA-006`은 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`로 승격되어 2026-08-03 G01~G09 구현 및 최종 QA closeout이 완료됐고, `NBA-009`는 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`로 승격되어 2026-07-22 구현 완료됐으며, `NBA-010`은 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`로 승격되어 2026-07-22 구현 완료됐고, `NBA-015`는 별도 계획 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`으로 승격되어 2026-07-23 구현 완료됐다. `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-008`, `NBA-014` 06 범위는 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`으로 승격되어 2026-07-26 구현 완료됐다. `NBA-004` MeetingNote detail subset과 `NBA-011` provider log subset은 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`로 승격되어 2026-07-26 구현 완료됐다. `08_GLOBAL_DATA_I18N`은 2026-07-28 구현 및 QA closeout이 완료됐다. `09_PRODUCT_ANALYTICS`는 2026-07-30 구현 및 QA closeout이 완료됐다. `NBA-005`와 `10_MOBILE_PWA_FIELD_USE`는 2026-07-31 구현 및 QA closeout이 완료됐다. `NBA-007`, `NBA-011` Admin/internal 범위, `NBA-012`, `NBA-013`, 11 범위 `NBA-014`, `11_ADMIN_OPERATION`은 2026-08-01 구현 및 QA closeout이 완료됐다. 이 문서에서는 완료 추적용으로만 남긴다.

## 2. API 후보와 완료 이력

| 후보 ID | 계약 상태 | API 영향 | 소비자 | 초안 |
|---|---|---|---|---|
| NBA-001 | implemented | `GET /api/deals` list item response field 추가 | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md` 기준 `products` 구현. |
| NBA-002 | implemented | `GET /api/contacts` list item response field 추가 | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md` 기준 `dealCount` 구현. |
| NBA-003 | partial | Company/Contact/Product list summary field 또는 summary endpoint 후보 | User Web | Deal list `latestActivity`는 06에서 구현 완료. Company/Contact/Product latest summary, `latestMemoAt`, `nextActionSummary`, generic summary endpoint는 후속 draft 후보. |
| NBA-004 | partial | MeetingNote list summary field 후보와 detail AI 후속 작업 draft API | User Web | 완료: 07 기준 `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`, `POST /api/meeting-notes/:meetingNoteId/follow-up-draft` 구현. 남음: `GET /api/meeting-notes` 목록 `latestSummary`, `nextActionSummary` 후보. |
| NBA-005 | implemented | BusinessCard OCR safe failure response/status contract | User Web | 완료: 10 기준 사용자 응답에는 safe `errorCode`, `userMessage`, `retryable`만 두고 provider detail은 일반 response/log/analytics/local draft에 노출하지 않는다. |
| NBA-006 | implemented | ImportJob persistence/resume API와 import 보관/삭제/입력량 제한 최종형 | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/API-SPEC/IMPORT_JOB_API.md` 기준 `/api/imports` 계열 persistence/resume, terminal cleanup, 원본 file binary 즉시 삭제, `ImportUserLogRow` 30일 cleanup, 10MB/5,000행 제한까지 G01~G09에서 최종 closeout 완료. |
| NBA-007 | implemented | Trash detail response 제한 | User Web | 완료: 11 기준 User/Admin Trash response에서 private memo 원문을 내려주지 않고 `privateMemoIncluded=false`와 safe 안내를 사용한다. |
| NBA-008 | implemented | list pagination/page size contract 정리 | User Web | 완료: 06 G05/G06/G07에서 기본 `pageSize=15` 계약을 FE/BE/test/API 문서 기준으로 확인. |
| NBA-009 | implemented | Schedule week report API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md` 기준 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx` 구현. 새 DB/migration 없음. |
| NBA-010 | implemented | Notification API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/API-SPEC/NOTIFICATION_API.md` 기준 notification list/read/settings/browser-push API와 일정/딜 reminder 생성/발송 처리 구현. |
| NBA-015 | implemented | Google Calendar Integration API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md` 기준 Google OAuth connect/callback/status/calendar list/selection/sync/disconnect, Schedule Google fields, Trash restore 확장 구현. |
| NBA-011 | implemented | MeetingNote provider log와 Admin/internal audit API 후보 | Backend internal, Admin Web | 완료: 07 기준 공통 `AiProviderCallLog` enum/target 확장과 provider call log 기록 구현, 11 기준 Admin provider failure 조회와 raw access reason/audit/sensitive log 구현. |
| NBA-012 | implemented | Trash retention/restore status contract | User Web, Backend internal, Admin Web | 완료: 11 기준 만료 Trash row, restore disabled, `POST /api/trash/recovery-requests`, Admin recovery request list 구현. purge/hard delete와 유료 복구 결제는 제외. |
| NBA-013 | implemented | Admin operation API | Admin Web | 완료: 11 기준 `/admin/api/*` 사용자/도메인/Trash/provider/analytics/account/system/audit API와 Admin Web 화면 구현. |
| NBA-014 | implemented | Admin system operation gate API | Backend internal, Admin Web | 완료: 06 범위 DB gate와 11 `GET/POST /admin/api/system/operation-checks*` 구현. Admin API는 migrate/seed/backup/restore를 직접 실행하지 않는다. |
| 08_GLOBAL_DATA_I18N | implemented | User global settings, domain global data, import/export localization, auth provider API | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC` 기준 User settings, Product/Deal currency, Contact phone, Company region/address, Import/Export localization, Google/LINE/Apple auth 구현. DB migration은 2026-07-29 최신 상태 재확인 완료, LINE/Apple 실제 provider smoke도 2026-07-29 사용자 확인 기준 운영 완료. |
| 09_PRODUCT_ANALYTICS | implemented | product analytics collector API와 snapshot/AI usage internal use case | User Web, Backend internal, Admin Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC` 기준 `POST /api/analytics/events`, server event contract, snapshot contract, AI usage summary contract 구현. Admin analytics dashboard는 11 완료, billing/paywall/churn runtime event는 12 후속. |
| 10_MOBILE_PWA_FIELD_USE | implemented | BusinessCard safe failure, existing STT draft/notification/product analytics API 재사용 | User Web | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC` 기준 BusinessCard safe failure, MeetingNote STT draft reuse, browser push permission UX, mobile field analytics event 구현. PWA install/offline shell/native app은 후속. |
| 11_ADMIN_OPERATION | implemented | Admin operation API suite | Admin Web, Backend internal, User Web 일부 Trash/account request | 완료: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC` 기준 Admin 운영 API와 User Trash/account/data request 영향 API 구현. 결제/구독 API는 12 후속. |

## 3. 공통 계약 규칙

- User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- 권한 없음과 소유권 없음은 client 응답에서 다른 사용자 리소스 존재 여부를 노출하지 않는다.
- mutation, Admin API, 민감정보, 외부 Provider API는 transaction과 observability 계약을 생략하지 않는다.
- private memo, transcript, provider detail, API key, quota 정보는 일반 사용자 response에 섞지 않는다.
- page size 변경은 FE 숫자만 바꾸지 않고 Backend 상수, response `pageSize`, API 문서, 테스트를 함께 갱신한다.
- `/app` 다국어를 이유로 User API path에 locale prefix를 추가하지 않는다.
- post-12 재검토 전에는 `draft` 후보 API를 controller/service/repository로 구현하지 않는다.
