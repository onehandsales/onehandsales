# Next Backend API Backlog Plan

2026-08-06 `06_DEAL_ACTIVITY_TIMELINE` 후속 재검토 A 결정 반영: `NBA-003` 잔여 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 API/DB/FE 계약화/구현 대상이 아니며 post-12 B2B/team CRM 전략 후보로 유지한다.

상태: Draft
작성일: 2026-07-20
최종 업데이트: 2026-08-10
출처: `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN` G07, `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`

## 0. 완료 반영 체크리스트

- [x] `NBA-006 ImportJob persistence/resume API`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE` G01~G09에서 구현 및 최종 QA closeout 완료
- [x] `01_IMPORT_JOB_PERSISTENCE` G05~G08 최종형 보관/삭제/입력량 제한 보강과 G09 통합 QA 완료. 01/NBA-006은 최종 서비스 형태 기준 완전 종료
- [x] `NBA-009 Schedule week report`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`에서 구현 및 QA closeout 완료
- [x] `NBA-010 Notification`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`에서 구현 및 QA closeout 완료
- [x] `NBA-010 Notification` 배포 환경 실제 SMTP/Web Push provider smoke QA 완료 (2026-08-04 사용자 확인)
- [x] `NBA-015 Google Calendar Integration`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`에서 구현 및 QA closeout 완료
- [x] `NBA-015 Google Calendar Integration` 배포 환경 실제 Google provider smoke QA 완료 (2026-08-04 사용자 확인)
- [x] `05_AI_WEEKLY_SALES_REPORT`: AI weekly report API/DB/User Web, follow-up delivery API/DB/User Web 구현 및 G01~G09 QA closeout 완료
- [x] `05_AI_WEEKLY_SALES_REPORT` G10 Gmail/Microsoft email provider adapter, reconnect, safe failure, smoke allowlist 구현 및 자동 검증 완료
- [x] `05_AI_WEEKLY_SALES_REPORT` Gmail/Microsoft provider smoke closeout 완료: `PRE12_FOLLOWUP_RECHECK` / `BEFORE_12_TASKS` 기준 2026-08-09 완료 처리
- [x] `NBA-001 Deal list products summary`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout 완료
- [x] `NBA-002 Contact list dealCount`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout 완료
- [x] `NBA-003 Deal latest activity subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 부분 구현 및 QA closeout 완료
- [x] `NBA-008 Page size 15 contract cleanup`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 FE/BE/test/API 계약 확인 완료
- [x] `NBA-014` 06 범위 DB/Prisma migration 운영 gate closeout
- [x] `NBA-004 MeetingNote detail next action/follow-up draft subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`에서 구현 및 QA closeout 완료
- [x] `NBA-011 MeetingNote AI/STT provider log subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`에서 공통 `AiProviderCallLog` 확장으로 구현 및 QA closeout 완료
- [x] `08_GLOBAL_DATA_I18N`: User global settings, `/app` i18n, currency/phone/region/address, import/export localization, Google/LINE/Apple auth 구현 및 QA closeout 완료
- [x] `09_PRODUCT_ANALYTICS`: Product analytics collector API, Prisma schema, server/client event logging, activation/retention snapshot, AI usage summary 구현 및 QA closeout 완료
- [x] `NBA-005 BusinessCard provider failure code/message contract`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`에서 구현 및 QA closeout 완료
- [x] `10_MOBILE_PWA_FIELD_USE`: BusinessCard OCR safe failure, MeetingNote mobile recording, local draft, push permission UX, mobile field analytics 구현 및 QA closeout 완료
- [x] `NBA-007 Trash private memo backend response restriction`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`에서 구현 및 QA closeout 완료
- [x] `NBA-011` Admin/internal provider audit 조회 범위: `11_ADMIN_OPERATION`에서 provider failure 운영 조회와 raw access audit 기준 구현 완료
- [x] `NBA-012 Trash 7일 이후 복구 정책`: `11_ADMIN_OPERATION`에서 User 만료 row/복구 문의와 Admin recovery queue 구현 완료
- [x] `NBA-013 Admin 운영 UX/API`: `11_ADMIN_OPERATION`에서 `/admin/api/*`와 Admin Web 운영 화면 구현 및 QA closeout 완료
- [x] 11 범위 `NBA-014` DB/Prisma/system operation gate closeout 완료
- [x] `11_ADMIN_OPERATION`: Admin 운영 API/Web, audit/redaction, provider/trash/account/system gate 구현 및 QA closeout 완료
- [x] `11_ADMIN_OPERATION` Admin provider failure 목록 source 편중 cursor pagination Finding 해결 및 회귀 테스트 추가 (2026-08-10)
- [x] Backend/API/DB/User Web 영향 반영 완료
- [x] 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
- [x] 완료 기록: `TODO_LOG/2026-08-03/G09_IMPORT_JOB_FINAL_SERVICE_QA_CLOSEOUT/WORK_LOG.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/TODO_LOG.md`
- [x] 완료 기록: `TODO_LOG/2026-07-22/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/TODO_LOG/2026-07-23/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/GOAL-SPECS/G06_QA_REVIEW_CLOSEOUT.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/GOAL-SPECS/G08_QA_DOCUMENT_CLOSEOUT.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-SPECS/G07_QA_DOCUMENT_CLOSEOUT.md`
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- [ ] 나머지 product/billing 후보 계약 확정 및 구현 여부 판단

## 1. 목적

이 계획 후보는 UX/UI 공통 QA와 release QA에서 이번 범위 밖으로 분리한 Backend/API/DB 개선 후보를 한곳에 모은다.

이 문서는 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 입력 문서다. 여기서 확인된 Backend/API/DB 후보 중 Global B2C 기능 목표로 승격할 항목은 Global roadmap의 번호 슬롯으로 옮겨 확정하고, 구현 완료 뒤에는 해당 번호 폴더의 README/API/GOAL-SPECS/TODO_LOG를 완료 이력 정본으로 본다.

G07의 산출물이므로 이 문서는 구현 계획 확정본이 아니다. 각 후보는 제품 가치, API 영향, DB 영향, FE 영향, 보안/운영 리스크를 기준으로 분류했고, 실제 구현은 별도 `/goal`에서 API 계약과 DB 변경 여부를 확정한 뒤 진행한다.

## 2. 현재 결론

- BusinessCard provider failure contract는 2026-07-31 기준 10번에서 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-003` 중 Deal list `latestActivity`는 06에서 구현 완료됐다. Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 2026-08-06 A 결정에 따라 12 전 계약화/구현하지 않고 post-12 B2B/team CRM 전략 후보로 남긴다.
- MeetingNote 상세 next action/follow-up draft와 AI/STT provider call log는 07에서 구현 완료됐다. MeetingNote 목록 latest/next summary는 product feature 후보로 남긴다.
- `NBA-014`는 06 범위에서 DB target, migration/seed 금지, Prisma 검증 gate를 닫았고 11에서 Admin system operation gate도 구현했다. 남은 data reliability 범위는 실제 운영 DB 적용 절차, backup/restore 실행 runbook, 장애 대응 drill이다.
- `NBA-006 ImportJob persistence/resume API`는 2026-08-03 기준 `01_IMPORT_JOB_PERSISTENCE` G01~G09 구현 및 최종 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- 2026-08-03 기준 `01_IMPORT_JOB_PERSISTENCE`는 terminal cleanup, 원본 file binary 즉시 삭제, `ImportUserLogRow` 30일 cleanup, 10MB/5,000행 제한까지 구현해 최종 서비스 형태로 완전 종료했다. 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 미완성이 아니라 별도 post-12 scale/source/Admin ops 후보로 분리한다.
- `NBA-009 Schedule week report`는 2026-07-22 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-010 Notification`은 2026-07-22 기준 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다. 실제 SMTP/Web Push provider smoke도 2026-08-04 사용자 확인 기준 배포 환경에서 완료됐다.
- `NBA-015 Google Calendar Integration`은 2026-07-23 기준 구현 및 QA closeout이 완료됐고, 실제 Google provider smoke도 2026-08-04 사용자 확인 기준 배포 환경에서 완료되어 active backlog 후보에서 제외한다.
- `05_AI_WEEKLY_SALES_REPORT`는 2026-07-24 G01~G09 기준 AI weekly report와 follow-up delivery foundation 구현/QA closeout이 완료됐고, 2026-08-05 G10 기준 Gmail/Microsoft 실제 email provider adapter 구현과 자동 검증이 완료됐다. Gmail/Microsoft provider smoke closeout은 2026-08-09 `PRE12_FOLLOWUP_RECHECK` / `BEFORE_12_TASKS` 기준 완료 처리했다.
- `NBA-001`, `NBA-002`, `NBA-008`, `NBA-003`의 Deal latest activity subset은 2026-07-26 기준 `06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `NBA-004` MeetingNote detail next action/follow-up draft subset과 `NBA-011` MeetingNote provider log subset은 2026-07-26 기준 `07_MEETING_NOTE_AI_PROVIDER_LOG`에서 구현 및 QA closeout이 완료되어 active backlog 후보에서 제외한다.
- `08_GLOBAL_DATA_I18N`은 2026-07-28 기준 구현 및 QA closeout이 완료되어 first-sale global data/API gap에서 제외한다. 2026-07-29 `BE/.env` 연결 DB도 `prisma migrate status` 기준 최신 상태로 재확인했다. 같은 날 사용자 확인 기준 LINE/Apple provider 설정값 연결과 실제 OAuth 동작도 운영 환경에서 완료됐다.
- `09_PRODUCT_ANALYTICS`는 2026-07-30 기준 구현 및 QA closeout이 완료되어 first-sale product analytics foundation gap에서 제외한다. Admin analytics UI/API는 11에서 완료됐고, billing/paywall/churn runtime conversion source는 12에서 다룬다.
- `10_MOBILE_PWA_FIELD_USE`는 2026-07-31 기준 구현 및 QA closeout이 완료되어 mobile field-use API/DB/User Web gap에서 제외한다. PWA install/offline shell, native app, native push/contact/calendar는 후속 별도 로드맵이다.
- `11_ADMIN_OPERATION`은 2026-08-01 기준 구현 및 QA closeout이 완료되어 Admin 운영 API/DB/Admin Web gap에서 제외한다. 결제/구독/plan/payment/invoice/refund는 11에서 제외했고 12에서 다룬다.
- 2026-08-10 기준 Admin provider failure 목록 source 편중 cursor pagination Finding은 `PrismaAdminProviderFailureRepository` batch 조회와 회귀 테스트로 해결했다. 신규 API/DB 후보가 아니라 11 완료 범위의 품질 보정으로 본다.
- MeetingNote 목록 summary, Company/Contact/Product latest summary, Billing 연동 conversion/churn flow, PWA/native packaging은 남은 후보다. 단 Company/Contact/Product latest summary와 generic summary endpoint는 12 전 구현 후보가 아니다.
- 2026-08-10 기준 12 착수 전 01~11 pre-12 재대조, BEFORE_12 closeout, Admin provider failure pagination 보정은 완료됐다. 다음 작업은 12이며, 12 완료 뒤 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`에 따라 이 백로그를 다시 읽고 잔여 후보를 새 TODO 폴더로 승격할지 결정한다.
- 12 완료 전에는 `NBA-003`, `NBA-004`, backup/restore runbook, 장애 대응 drill을 무작위로 구현하지 않는다. 특히 `NBA-003` 잔여는 A 결정에 따라 12 전 계약 초안도 만들지 않고 post-12 전략 재검토 seed로 유지한다.

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

- 실제 Google provider smoke는 2026-08-04 사용자 확인 기준 배포 환경에서 완료했다.
- Google export/write, realtime webhook/watch, 반복 일정 정식 모델, 여러 Google 계정 동시 연결, Google Calendar 외 다른 calendar provider는 04 완료 범위가 아니다.
- Admin provider failure 운영 조회와 log 기준은 11에서 완료됐다.

## 2.2 `05_AI_WEEKLY_SALES_REPORT` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`는 2026-07-24 G01~G09 기준 AI weekly report/follow-up delivery 구현 및 QA closeout이 완료됐고, 2026-08-05 G10 기준 Gmail/Microsoft 실제 email provider adapter 구현과 자동 검증이 완료됐다. 2026-08-09 기준 Gmail/Microsoft provider smoke closeout도 `PRE12_FOLLOWUP_RECHECK` / `BEFORE_12_TASKS`에서 완료 처리했다. 이 백로그에서는 active Backend/API/DB 후보가 아니라 완료 이력으로만 유지한다.

완료로 반영할 Backend/API/DB/User Web 영향:

- `POST /api/sales-reports/weekly`, `GET /api/sales-reports/weekly`, `GET /api/sales-reports/weekly/:reportId`, snapshot summary API 구현
- AI weekly report async job, version/failed version, input snapshot summary, suggestion 저장 구현
- `/api/follow-up-delivery/*` Gmail/Microsoft OAuth connection, SMS sender verification, consent notice API 구현
- `/api/follow-up-messages/*` draft/update/send/retry/list/detail API 구현
- Gmail API `users.messages.send`와 Microsoft Graph `/me/sendMail` 실제 email provider adapter 구현
- access token refresh, reconnect-required, send-only scope 검증, safe failure, smoke allowlist 차단 구현
- `AiWeeklySalesReport`, `AiWeeklySalesReportSuggestion`, `AiJob`, `ExternalEmailConnection`, `FollowUpMessage`, `FollowUpDeliveryAttempt` 계열 DB persistence 구현
- `/app/schedules/week` AI report section, `/app/settings` follow-up provider settings, compose/send/retry/timeline UX 구현

남은 백로그로 오해하지 않을 범위:

- Gmail/Microsoft production-equivalent smoke closeout은 2026-08-09 PRE12/BEFORE_12 기준 완료 처리했으며, 새 Backend API/DB 후보로 남기지 않는다.
- SMS 실제 provider, B2B tenant sender, email sync, sequence/campaign/bulk, unsubscribe, 신규 09 analytics event, 신규 11 Admin provider failure API는 05 완료 범위가 아니다.
- MeetingNote 자동 follow-up 발송/알림, Company/Contact/Product latest summary, MeetingNote 목록 summary, generic ExportJob, Google/Microsoft calendar write/watch는 post-12 재검토 후보로 유지한다. 단 Company/Contact/Product latest summary와 generic summary endpoint는 2026-08-06 A 결정에 따라 12 전 계약화/구현 대상이 아니다.

## 2.3 `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-008`, `NBA-014` 반영 기준

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

- `NBA-003` 중 Company/Contact/Product latest activity, latest memo, next action summary. 2026-08-06 A 결정에 따라 12 전 계약화/구현 대상이 아니며 B2B/team CRM 성격의 post-12 전략 후보로 둔다.
- MeetingNote 목록 latest/next summary
- MeetingNote Admin provider audit/raw access policy, Trash private memo response restriction, 7일 이후 복구 문의, Admin 운영 API/UX는 11에서 완료
- 실제 backup/restore 실행 runbook과 장애 대응 drill

## 2.4 `NBA-004` MeetingNote detail subset, `NBA-011` provider log subset 반영 기준

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
- Admin/internal provider audit 조회 API와 raw access reason은 11에서 완료
- 별도 transcript/raw provider response 저장 table
- AI 후보 자동 저장, follow-up 자동 발송, 회의록 follow-up 알림

## 2.5 `08_GLOBAL_DATA_I18N` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`은 2026-07-28 G10 QA closeout 기준으로 Completed다. 이 백로그에서는 Global B2C 첫 판매용 현지화/글로벌 데이터/API 항목을 active 후보가 아니라 완료 이력으로만 유지한다.

완료로 반영할 Backend/API/DB/User Web 영향:

- `User.countryCode`, `User.preferredLocale`, `User.defaultCurrencyCode`와 profile GET/PATCH, signup 기본값, `/app/settings` 계정 설정 UX 구현
- `/app` 전용 i18n provider/resource/formatter와 핵심 화면 `ko-KR`/`en` 번역 적용. `/app` URL에는 locale prefix를 붙이지 않음
- Product/Deal `currencyCode`, KRW/USD 정수 금액 정책, currency-aware display/export/weekly report 구현
- Contact `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`와 KR legacy phone migration, KR/US 전화번호 정규화, import/business-card/search/export 반영
- Company country/region/address 구조와 `CompanyRegion` country/region code API/FE select 구현
- import template `locale=ko-KR|en`, domain export header/date-time/currency 현지화 구현
- `/api/auth/providers` Google/LINE/Apple 순서, `OAuthProvider.LINE`, Supabase provider normalization, verified email 기반 기존 User linking, provider email required/safe exchange failure 구현
- Backend `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test`, `build`, User Web `typecheck`, `lint`, `build`, E2E/mobile E2E 검증 통과

남은 백로그로 오해하지 않을 범위:

- 현재 `BE/.env` 연결 DB는 2026-07-29 `pnpm.cmd exec prisma migrate status` 기준 최신 상태다. 08 migration 5개 배포는 완료 확인됐고, 이후 추가 DB 변경은 별도 운영 절차로만 적용한다.
- 실제 LINE/Apple OAuth provider smoke는 2026-07-29 사용자 확인 기준 Supabase provider 설정과 provider secret 설정 후 운영 환경에서 완료됐다.
- 추가 국가/통화/전화번호 포맷, `/app` 직접 translation key 전환, Google/LINE/Apple 외 신규 provider, `/app` locale route prefix는 새 계약 없이 확장하지 않는다.

## 2.6 `09_PRODUCT_ANALYTICS` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`는 2026-07-30 G08 QA closeout 기준으로 Completed다. 이 백로그에서는 제품 분석 기반 API/DB/User Web 항목을 active 후보가 아니라 완료 이력으로만 유지한다.

완료로 반영할 Backend/API/DB/User Web 영향:

- `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot` Prisma schema와 migration 구현
- `POST /api/analytics/events` client event collector API 구현. 인증 context에서 user/session/device/timezone을 보강하고 client request의 user/session/time/source/target/idempotency field를 거절한다.
- User Web `VITE_PRODUCT_ANALYTICS_ENABLED` flag, routeKey mapper, `useAppRouteAnalytics` hook, `/api/analytics/events` client 구현
- auth/deal/schedule/meeting-note/business-card/import/export 성공 server event를 best-effort로 기록
- activation snapshot과 D1/D7/D30 retention snapshot batch, 365일 raw event purge 구현
- `AiProviderCallLog` 기반 AI usage summary use case와 repository query 구현. prompt/raw response/provider raw response/email/displayName은 조회하지 않는다.
- billing/paywall/churn event 이름은 reserved taxonomy로만 남기고 09 runtime allowlist에서는 제외
- Backend `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test`, `build`, User Web `typecheck`, `lint`, `test`, `build`, analytics E2E 검증 통과

남은 백로그로 오해하지 않을 범위:

- Admin analytics dashboard/API는 09 범위가 아니며 `11_ADMIN_OPERATION`에서 완료됐다.
- 실제 paywall, subscription, churn survey, paid conversion source event 발생은 09 범위가 아니며 `12_BILLING_SUBSCRIPTION_TAX`에서 다룬다.
- 모바일 field-use 세부 event는 10에서 완료됐다. Admin dashboard는 11에서 완료됐고 billing conversion/churn 연결은 12에서 다룬다.

## 2.7 `10_MOBILE_PWA_FIELD_USE` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`는 2026-07-31 G07 QA closeout 기준으로 Completed다. 이 백로그에서는 모바일 현장 입력성 API/DB/User Web 항목을 active 후보가 아니라 완료 이력으로만 유지한다.

완료로 반영할 Backend/API/DB/User Web 영향:

- BusinessCard OCR 실패 응답에 safe `errorCode`, `userMessage`, `retryable` 계약을 반영하고 provider raw detail은 사용자 응답에서 제외했다.
- `BusinessCardScanLog`에 safe failure field를 추가하고 Prisma 한국어 주석과 migration SQL `COMMENT ON COLUMN`을 적용했다.
- `/app/business-cards` 모바일 촬영 input은 `accept="image/*"`와 `capture="environment"`를 사용하고, 다시 촬영/파일 바꾸기/수동 입력 UX를 제공한다.
- MeetingNote 모바일 녹음은 `MediaRecorder` 기반으로 기존 `POST /api/meeting-notes/stt-draft`를 재사용하고, 권한 거부/미지원 시 음성 파일 fallback을 제공한다.
- BusinessCard/MeetingNote 작성 흐름은 서버 draft DB 없이 FE local draft 24시간 TTL, 복원/폐기 UX로 구현했다.
- Browser push permission은 사용자 명시 클릭 이후에만 요청하고 service notification copy와 marketing copy를 분리했다.
- Mobile field analytics event를 09 collector 위에 allowlist payload로 추가하고, analytics 실패는 사용자 작업을 막지 않는다.

남은 백로그로 오해하지 않을 범위:

- PWA install prompt/offline shell, full offline sync, iOS/Android native app, native push/contact/calendar는 10 완료 범위가 아니다.
- Admin provider failure dashboard와 운영 추적은 `11_ADMIN_OPERATION`에서 완료됐다.
- Marketing opt-in, billing/paywall/churn runtime event는 `12_BILLING_SUBSCRIPTION_TAX`에서 다룬다.

## 2.8 `11_ADMIN_OPERATION` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`은 2026-08-01 G10 QA closeout 기준으로 Completed다. 이 백로그에서는 Admin 운영 API/DB/Admin Web 항목을 active 후보가 아니라 완료 이력으로만 유지한다.

완료로 반영할 Backend/API/DB/Admin Web 영향:

- `/admin/api/*`를 User API와 분리하고 AuthGuard/AdminGuard를 적용했다.
- `INITIAL_ADMIN_EMAILS` 기반 첫 Admin bootstrap과 `/admin/api/me` 확인 흐름을 유지한다.
- Admin 사용자 목록/상세, 활동 timeline, 도메인 read-only records, User Trash summary/records API와 Admin Web 화면을 구현했다.
- raw/sensitive access는 reason validation과 append-only audit/sensitive log를 사용하며 일반 상세 API에 섞지 않는다.
- `AdminAuditLog`, `AdminSensitiveAccessLog`, `TrashRecoveryRequest`, `AccountDeletionRequest`, `UserDataExportRequest`, `AdminOperationCheckRun` schema/migration을 구현했다.
- User Trash 만료 row는 hard delete/purge하지 않고 복구 버튼 disabled와 복구 문의 흐름을 제공한다.
- Admin provider failure, analytics overview, account deletion/data export request queue, trash recovery request queue, system operation gate 화면/API를 구현했다.
- provider raw/prompt/token/quota detail, browser push endpoint/key/userAgent 원문, analytics raw payload dump, private memo 원문 노출 금지 조건을 QA closeout에서 확인했다.
- Admin provider failure 목록 source 편중 cursor pagination은 2026-08-10 회귀 테스트로 보강되어 한 source에 실패 row가 몰려도 다음 cursor가 조기 종료되지 않는다.

남은 백로그로 오해하지 않을 범위:

- 결제/구독/plan/payment/invoice/refund/failed payment recovery/billing-linked conversion/churn은 11 범위가 아니며 `12_BILLING_SUBSCRIPTION_TAX`에서 다룬다.
- Admin 직접 DB migrate/seed/backup/restore 실행은 만들지 않았다. 11 system gate는 점검 결과 기록용이다.
- Admin 직접 Trash 복구 실행, 유료 복구 결제, Trash hard delete/purge는 11 범위가 아니다.
- 자동 민감정보 감지, generic ExportJob 파일 생성/대량 export는 별도 계약 없이는 확장하지 않는다.

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
- 11에서 완료된 Admin 운영 범위를 넘어서는 새 Admin API 구현
- 완료된 Notification/Weekly Schedule Report/Google Calendar Integration/Deal Activity Timeline/MeetingNote AI Provider Log/Global Data I18N/Product Analytics/Mobile Field Use/Admin Operation 범위를 넘어서는 새 알림 endpoint, PDF/범용 ExportJob, 반복 일정, AI 요약, Google Calendar export/write/realtime webhook, 범용 activity bus, MeetingNote 자동 저장/자동 발송, 신규 auth provider, `/app` locale prefix, billing/paywall/churn runtime event, PWA install/offline shell, native app 구현
- 2026-08-06 A 결정으로 보류된 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline 구현
- User Web에서 `/admin/api/*` 호출 추가
- FE 단독 page size 변경

API가 포함된 구현 goal을 시작하려면 `COMMON/API-SPEC`의 해당 계약을 `confirmed`로 승격하고, request/response/error/transaction/observability/DB/FE 처리 기준을 먼저 채운다.
