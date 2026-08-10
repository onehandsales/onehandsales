# Candidate Matrix

2026-08-06 `06_DEAL_ACTIVITY_TIMELINE` 후속 재검토 A 결정 반영: `NBA-003` 잔여 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 계약화/구현 대상이 아니며 post-12 B2B/team CRM 전략 후보로 유지한다.

상태: Draft
작성일: 2026-07-20
최종 업데이트: 2026-08-10

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: Done (2026-08-03 final closeout)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
  - 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
  - 완료 기록: `TODO_LOG/2026-08-03/G09_IMPORT_JOB_FINAL_SERVICE_QA_CLOSEOUT/WORK_LOG.md`
  - 현재 의미: G01~G09 전체 기준 active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `NBA-009 Schedule week report`: Done (2026-07-22)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/TODO_LOG.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `NBA-010 Notification`: Done (2026-07-22)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`
  - 완료 기록: `TODO_LOG/2026-07-22/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `NBA-015 Google Calendar Integration`: Done (2026-07-23)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/TODO_LOG/2026-07-23/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `05_AI_WEEKLY_SALES_REPORT`: Done / Provider Smoke Closeout Complete (2026-08-09)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-COMPLETION-CHECKLIST.md`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/G10_DOCUMENT_REVIEW.md`
  - 현재 의미: AI weekly report/follow-up delivery/Gmail-Microsoft email provider code와 provider smoke closeout은 active backlog 후보가 아니라 완료 이력으로 남긴다.
- [x] `NBA-001 Deal list products summary`: Done (2026-07-26)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `NBA-002 Contact list dealCount`: Done (2026-07-26)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `NBA-003 Deal latest activity subset`: Partial Done (2026-07-26)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
  - 현재 의미: Deal list `latestActivity`는 완료다. Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 2026-08-06 A 결정에 따라 12 전 계약화/구현하지 않고 post-12 B2B/team CRM 전략 후보로 남긴다.
- [x] `NBA-008 Page size 15 contract cleanup`: Done (2026-07-26)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
  - 현재 의미: active backlog 후보가 아니라 완료 이력으로만 남긴다.
- [x] `NBA-014 DB/Prisma migration 운영 gate`: 06 scope Done (2026-07-26)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
  - 현재 의미: 06 범위 DB target, migrate/seed 금지, 검증 gate는 닫혔다. 운영 DB 적용 절차와 backup/restore는 별도 data reliability gate에서 다룬다.
- [x] `NBA-004 MeetingNote detail next action/follow-up draft subset`: Partial Done (2026-07-26)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/GOAL-SPECS/G06_QA_REVIEW_CLOSEOUT.md`
  - 현재 의미: 회의록 상세 next action/follow-up draft는 완료다. 회의록 목록 latest/next summary는 후속 후보로 남긴다.
- [x] `NBA-011 MeetingNote provider log subset`: Partial Done (2026-07-26)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/GOAL-SPECS/G06_QA_REVIEW_CLOSEOUT.md`
  - 현재 의미: 공통 `AiProviderCallLog` 기반 provider call log는 07에서 완료됐고, Admin/internal audit 조회와 raw access reason은 11에서 완료됐다.
- [x] `08_GLOBAL_DATA_I18N`: Done (2026-07-28)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: first-sale global data/i18n/API subset은 완료다. 2026-07-29 DB migration 최신 상태를 재확인했고, 사용자 확인 기준 LINE/Apple provider 연결과 실제 OAuth smoke도 운영 환경에서 완료됐다.
- [x] `09_PRODUCT_ANALYTICS`: Done (2026-07-30)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/GOAL-SPECS/G08_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: product analytics foundation은 완료다. Admin analytics UI/API는 11에서 완료됐고, billing/paywall/churn runtime source는 12 후보로 남긴다.
- [x] `NBA-005 BusinessCard provider failure code/message contract`: Done (2026-07-31)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-SPECS/G07_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: 사용자 safe failure contract는 10에서 완료됐고, Admin provider failure dashboard와 운영 추적은 11에서 완료됐다.
- [x] `10_MOBILE_PWA_FIELD_USE`: Done (2026-07-31)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-SPECS/G07_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: 모바일 현장 입력성 1차 범위는 완료다. PWA install/offline shell/native app은 후속 후보로 남긴다.
- [x] `NBA-007 Trash private memo backend response restriction`: Done (2026-08-01)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: User/Admin Trash response의 private memo 원문 미노출 기준은 완료다.
- [x] `NBA-011` Admin/internal provider audit 범위: Done (2026-08-01), source-skew pagination QA 보정 완료 (2026-08-10)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: provider failure 운영 조회, raw access reason, audit/sensitive log 기준은 완료다. provider raw/prompt/token/quota detail은 계속 금지한다. Admin provider failure 목록 source 편중 cursor pagination Finding은 2026-08-10 회귀 테스트로 닫혔다.
- [x] `NBA-012 Trash 7일 이후 복구 정책`: Done (2026-08-01)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: 만료 Trash row 보존, User 복구 문의, Admin recovery queue는 완료다. hard delete/purge와 유료 복구 결제는 제외한다.
- [x] `NBA-013 Admin 운영 UX/API`: Done (2026-08-01)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: Admin 운영 API/Web 1차 범위는 완료다. 결제/구독 Admin 연동은 12에서 다룬다.
- [x] `NBA-014 DB/Prisma migration 운영 gate`: 11 scope Done (2026-08-01)
  - 구현 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
  - 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
  - 현재 의미: 11 migration 검증과 `AdminOperationCheckRun` system gate는 완료다. 이후 migration goal마다 선행 체크는 유지한다.

## 1. 기준

후보 분류는 `release blocker`, `release follow-up`, `product feature`, `ops/security`, `defer` 중 하나만 사용한다.

완료 이력으로 승격된 `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-004` MeetingNote detail subset, `NBA-005`, `NBA-006`, `NBA-007`, `NBA-008`, `NBA-009`, `NBA-010`, `NBA-011`, `NBA-012`, `NBA-013`, `NBA-014`, `NBA-015`, `05_AI_WEEKLY_SALES_REPORT`, `08_GLOBAL_DATA_I18N`, `09_PRODUCT_ANALYTICS`, `10_MOBILE_PWA_FIELD_USE`, `11_ADMIN_OPERATION` 외의 후보 API 계약은 `draft` 또는 `후보` 상태로만 남긴다.

## 2. 후보 매트릭스

| ID | 후보명 | 출처 | 분류 | 사용자-facing 여부 | 제품 가치 | API 영향 | DB 영향 | FE 영향 | 보안/운영 리스크 | 권장 다음 goal | 구현 금지 사유 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| NBA-001 | Deal list `products` summary | UX/UI QA, `06_DEAL_ACTIVITY_TIMELINE` | release follow-up | Yes | 완료. 딜 목록에서 제품 linked record까지 바로 비교할 수 있다. | Done: `GET /api/deals` item `products` field 추가 | Done: 기존 `DealProduct` aggregation 사용 | Done: `/app/deals` desktop/mobile 표시 | ownership aggregation QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE` | 완료. Active backlog에서 제외한다. |
| NBA-002 | Contact list `dealCount` | UX/UI QA, `06_DEAL_ACTIVITY_TIMELINE` | release follow-up | Yes | 완료. 담당자 목록에서 영업 연결도를 빠르게 판단할 수 있다. | Done: `GET /api/contacts` item `dealCount` field 추가 | Done: 기존 `DealContact` aggregation 사용 | Done: `/app/contacts` desktop/mobile 표시 | ownership/soft delete aggregation QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE` | 완료. Active backlog에서 제외한다. |
| NBA-003 | Company/Contact/Product latest memo/activity/next action summary | UX/UI QA, `06_DEAL_ACTIVITY_TIMELINE` | defer | Yes | 부분 완료. Deal list latest activity는 완료됐고, 나머지 record summary는 12 전 구현하지 않는다. B2B/team CRM 성격이 더 강한 post-12 전략 후보로 본다. | Partial Done: `GET /api/deals` item `latestActivity` field 추가. Company/Contact/Product summary와 generic summary endpoint는 12 전 계약화하지 않음 | Done for Deal: `DealActivity` model/migration. 잔여 summary/index 설계는 post-12 재검토 전까지 만들지 않음 | Done for Deal list. Company/Contact/Product 화면 summary는 post-12 재검토 전까지 만들지 않음 | private memo/provider raw/meeting note raw/follow-up body redaction QA 완료. 잔여 summary를 만들 경우에도 별도 정책 필요 | Post-12 B2C/B2B record activity strategy recheck | 2026-08-06 A 결정: 06 완료 유지. Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 계약화/구현 금지. |
| NBA-004 | MeetingNote next/latest summary and detail draft | UX/UI QA, `07_MEETING_NOTE_AI_PROVIDER_LOG` | product feature | Yes | 부분 완료. 회의록 상세에서 다음 행동 후보와 follow-up 문안 초안을 바로 만들 수 있다. 목록 summary는 후속이다. | Partial Done: detail `next-actions/draft`, `follow-up-draft` API 구현. 목록 response field는 후보 | Done for 07: 새 action table 없이 provider log는 공통 `AiProviderCallLog` target 확장 사용. 목록 summary 저장은 후속 설계 필요 | Done for detail. 회의록 목록 summary 표시는 후속 | AI/STT 원문, transcript, follow-up body를 log/list에 노출하지 않는 redaction QA 완료. 목록 summary도 같은 기준 필요 | Remaining MeetingNote list summary contract | detail draft subset 완료. 목록 latest/next summary와 자동 저장/자동 발송은 후속 후보로 유지한다. |
| NBA-005 | BusinessCard provider failure code/message contract | UX/UI QA, `10_MOBILE_PWA_FIELD_USE` | release follow-up | Yes | 완료. OCR 실패 시 사용자는 provider/quota/API key/internal stack 없이 안전한 안내와 재시도 행동을 본다. | Done: BusinessCard scan response/list/detail에 safe failure `errorCode`, `userMessage`, `retryable` 반영 | Done: `BusinessCardScanLog` safe failure fields와 migration SQL COMMENT 구현 | Done: 모바일 실패 copy, 다시 촬영, 파일 바꾸기, 수동 입력 UX | provider raw detail response/log/analytics/local draft 미노출 QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE` | 완료. Active backlog에서 제외한다. Admin provider failure dashboard는 11에서 완료됐다. |
| NBA-006 | ImportJob persistence/resume API | AGENT 문서 | product feature | Yes | 완료. 업로드, 매핑, 검증 중 새로고침/탭 이동 복구와 import 데이터 보관/삭제/입력량 제한 기준이 닫혔다. | Done: `/api/imports` 계열 persistence/resume API와 G05~G08 최종형 보강 구현 완료 | Done: ImportJob/Row/Error/UploadedFile schema 및 migration 구현. terminal cleanup, `ImportUserLogRow` 30일 cleanup, 10MB/5,000행 제한은 기존 schema 중심으로 구현 | Done: import review resume UX, row detail 만료 안내, 10MB/5,000행 제한 초과 안내 구현 | redaction, ownership, TTL/delete tracking, terminal cleanup, 원본 file binary 즉시 삭제 QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE` G01~G09 | 완료. Active backlog에서 제외한다. 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 별도 post-12 scale/source/Admin ops 후보로 분리한다. |
| NBA-007 | Trash private memo backend response restriction | UX/UI QA, `11_ADMIN_OPERATION` | ops/security | Yes | 완료. FE 숨김이 아니라 Backend/User/Admin Trash 응답에서 비밀 메모 원문을 제한한다. | Done: Trash list/detail/restore 계열 response에서 `privateMemoIncluded=false`와 safe 안내 사용 | Done: 신규 DB 없음. 11 Trash recovery request migration과 함께 QA 확인 | Done: `/app/trash` 만료 row/복구 문의 UX가 private memo 원문 없이 동작 | private memo ciphertext/key/content 원문 미노출 QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION` | 완료. Active backlog에서 제외한다. |
| NBA-008 | Page size 15 contract 정리 | UX/UI QA, `06_DEAL_ACTIVITY_TIMELINE` | release follow-up | Yes | 완료. desktop record density와 FE/BE/test 계약을 맞췄다. | Done: list pagination contract 확인 | Done: 새 DB 없음 | Done: User Web tests와 E2E에서 확인 | pageSize 불일치 회귀를 test로 확인 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE` | 완료. Active backlog에서 제외한다. |
| NBA-009 | Schedule week report | AGENT 문서, `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT` | product feature | Yes | 완료. 일정과 딜을 주간 영업 판단으로 연결한다. | Done: `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx` 구현 | Done: 새 DB/migration 없음. 기존 `User`, `Schedule`, `ScheduleDeal`, `Deal`, `DealCompany`, `DealContact`, `Company`, `Contact`, `DealFollowingActionLog` runtime aggregation 사용 | Done: `/app/schedules/week` route, 주간 보고서 화면, Excel 다운로드 구현 | timezone/weekStart, cross-user ownership, private note/raw memo redaction QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT` | 완료. Active backlog에서 제외한다. AI weekly report는 05에서 구현 완료됐고, PDF/범용 ExportJob과 반복 일정은 별도 후속 범위다. |
| NBA-010 | Notification | AGENT 문서 | product feature | Yes | reminder 기반 retention loop를 만들 수 있다. | Done: notification list/read/settings/browser-push API 구현 | Done: Notification/UserNotificationSetting/NotificationDeliveryAttempt/BrowserPushSubscription schema 및 migration 구현 | Done: `/app/notifications`, unread badge, settings, browser push fallback UX 구현 | provider raw response, push endpoint/key, email 원문 redaction QA 완료. 실제 SMTP/Web Push provider smoke도 2026-08-04 사용자 확인 기준 배포 환경에서 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER` | 완료. Active backlog에서 제외한다. |
| NBA-015 | Google Calendar Integration | AGENT 문서, `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION` | product feature | Yes | 완료. Google Calendar read-only import를 한손 일정/딜/알림/Trash 흐름에 연결한다. | Done: Google OAuth connect/callback/status/calendar list/selection/sync/disconnect, Schedule list/detail/update/delete, Trash restore 계약 확장 구현 | Done: ExternalCalendarConnection/ExternalCalendarSource, Schedule Google metadata, soft delete/trash fields, sync lock/status migration 구현 | Done: `/app/schedules`, `/app/settings`, `/app/trash` Google Calendar UX, source badge, sync, calendar 선택, Schedule restore 구현 | OAuth state, token encryption/redaction, ownership, Schedule soft delete/restore, reminder QA 완료. 실제 Google provider smoke도 2026-08-04 사용자 확인 기준 배포 환경에서 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION` | 완료. Active backlog에서 제외한다. Google export/write, realtime webhook/watch, 반복 일정, 여러 Google 계정 동시 연결은 별도 후속 범위다. |
| 05_AI_WEEKLY_SALES_REPORT | AI weekly report and follow-up delivery | Productization gap, `05_AI_WEEKLY_SALES_REPORT` | product feature | Yes | 완료. 주간 영업 흐름을 저장형 AI report로 만들고 follow-up draft/send/timeline으로 이어진다. | Done: sales report 생성/조회/snapshot API, follow-up settings/draft/send/retry/list/detail API, Gmail/Microsoft actual send adapter 구현 | Done: AI report/job/suggestion/provider log와 follow-up delivery schema 구현. G10 신규 migration 없음 | Done: `/app/schedules/week` AI report section, `/app/settings` provider settings, compose/send/retry/timeline UX 구현 | provider raw/token/body/recipient redaction, safe error/reconnect, smoke allowlist 자동 검증 완료. Provider smoke closeout은 2026-08-09 PRE12/BEFORE_12 기준 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT` | 구현 완료. Active backlog에서 제외한다. SMS 실제 provider/B2B/sequence/email sync는 별도 후속이다. |
| NBA-011 | MeetingNote provider call log and Admin audit | AGENT 문서, `07_MEETING_NOTE_AI_PROVIDER_LOG`, `11_ADMIN_OPERATION` | ops/security | No | 완료. User provider log subset과 Admin/internal 운영 조회/audit 기준이 원문 없이 연결됐다. 2026-08-10 source 편중 pagination 보정도 완료됐다. | Done: 07 User API provider log write, 11 Admin provider failure/sensitive raw access/audit API 구현. provider failure 목록은 source별 batch 조회와 회귀 테스트로 next cursor 조기 종료를 방지한다. | Done: 07 `AiProviderCallLog` target 확장, 11 `AdminAuditLog`/`AdminSensitiveAccessLog` 구현. 별도 transcript/raw table은 만들지 않음 | Done: User Web safe failure, Admin Web provider/audit 화면 구현 | raw request/response, prompt, 회의 원문, transcript, follow-up body, contact 원문, provider token/quota detail 저장/노출 금지 QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION` | 완료. Active backlog에서 제외한다. |
| NBA-012 | Trash 7일 이후 복구 정책 | AGENT 문서, `11_ADMIN_OPERATION` | ops/security | Yes | 완료. 복구 가능 기한 이후 동작과 운영 책임을 hard delete 없이 명확히 했다. | Done: 만료 Trash response status와 `POST /api/trash/recovery-requests`, Admin recovery request list 구현 | Done: `TrashRecoveryRequest`와 열린 요청 unique index 구현. purge/hard delete table 없음 | Done: `/app/trash` 만료 row copy, restore disabled, 복구 문의 UX | private memo 원문 미노출, 유료 복구 결제/paywall 제외, hard delete/purge 미구현 QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION` | 완료. Active backlog에서 제외한다. |
| NBA-013 | Admin 운영 UX/API | AGENT 문서, `11_ADMIN_OPERATION` | ops/security | No | 완료. 고객 지원, 민감정보 마스킹, 감사 로그 기반 최소 운영이 가능해졌다. | Done: `/admin/api/*` 사용자/도메인/Trash/provider/analytics/account/system/audit API 구현 | Done: Admin audit/sensitive log, recovery/account/data/system operation check tables 구현 | Done: Admin Web `/users`, `/provider-failures`, `/analytics`, `/account-requests`, `/trash/recovery-requests`, `/audit-logs`, `/system` | AuthGuard/AdminGuard, masking, raw access reason, audit log, 결제/구독 제외 QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION` | 완료. Active backlog에서 제외한다. Billing Admin 연동은 12에서 다룬다. |
| NBA-014 | DB/Prisma migration 운영 gate closeout | G02~G06, `06_DEAL_ACTIVITY_TIMELINE`, `11_ADMIN_OPERATION` | release blocker | No | 06 범위와 11 범위 완료. DB 대상, Prisma 검증, migration/seed 금지 기준과 Admin system gate를 확인했다. | Done: 11 Admin system operation check API 구현 | Done for 06/11: 신규 migration 작성, 기존 migration 미수정, 무단 migrate/seed 미실행, `AdminOperationCheckRun` 구현 | Done: Admin Web `/system` 운영 gate 화면 | DB URL/secret/token 저장 차단, Admin API가 migrate/seed/backup/restore 직접 실행하지 않음 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION` | 완료. 이후 migration goal마다 선행 gate로 계속 적용한다. |
| 08_GLOBAL_DATA_I18N | Global data, app i18n, auth provider subset | Productization gap, `08_GLOBAL_DATA_I18N` | first-sale global gap | Yes | 완료. 첫 판매 전 필요한 기본 앱 다국어, 글로벌 데이터 구조, Google/LINE/Apple 인증을 구현했다. | Done: User global settings, domain global data, import/export localization, auth provider API 구현 | Done: User settings, Product/Deal currency, Contact global phone, Company region/address, `OAuthProvider.LINE` migrations 작성 및 DB 최신 상태 확인 | Done: `/app/settings`, app i18n, currency/phone/region UI, import/export language, login/signup provider buttons | Done: LINE/Apple provider secret 연결과 실제 OAuth smoke는 2026-07-29 사용자 확인 기준 운영 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N` | 완료. Active backlog에서 제외한다. 추가 국가/통화/provider는 별도 운영/후속 범위다. |
| 09_PRODUCT_ANALYTICS | Product analytics foundation | Productization gap, `09_PRODUCT_ANALYTICS` | first-sale global gap | Mixed | 완료. activation/retention/core event/AI usage를 자체 DB 기반으로 볼 수 있는 1차 foundation을 구현했다. | Done: `POST /api/analytics/events`, server event recorder, snapshot/AI usage internal use case 구현 | Done: `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot` migration 구현. `AiUsageDaily`/`UsageMeter`는 만들지 않음 | Done: User Web route analytics wrapper와 routeKey mapper 구현. Admin analytics dashboard는 11 완료 | Done: allowlist payload, PII/raw key 차단, billing reserved runtime 제외, raw event 365일 purge 기준 구현 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS` | 완료. Active backlog에서 제외한다. billing conversion/churn source는 12에서 다룬다. |
| 10_MOBILE_PWA_FIELD_USE | Mobile field-use API/UX foundation | Productization gap, `10_MOBILE_PWA_FIELD_USE` | product feature | Yes | 완료. 모바일 현장에서 명함 촬영, 회의 녹음, local draft, push permission, field analytics를 사용할 수 있다. | Done: BusinessCard safe failure, existing MeetingNote STT draft/Notification/Product Analytics API 재사용 | Done: G02 BusinessCard safe failure migration만 추가. `UserDraft`/media binary DB 없음 | Done: BusinessCard capture, MeetingNote recording/fallback, local draft restore/discard, notification permission UX | Done: provider raw/transcript/audio/image/push endpoint/key/token/PII analytics 차단 QA 완료 | Done: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE` | 완료. Active backlog에서 제외한다. PWA install/offline shell/native app은 후속 별도 결정. |

## 3. 다음 실행 순서 제안

1. 2026-08-10 기준 12 착수 전 01~11 pre-12 재대조와 BEFORE_12 closeout은 완료됐고, Admin provider failure pagination 보정도 11 품질 수정으로 닫혔다.
2. 다음 작업은 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/12_BILLING_SUBSCRIPTION_TAX`를 계약화하고 구현하는 것이다.
3. 12 완료 후 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md` 기준으로 이 matrix를 다시 읽는다.
4. `NBA-003`의 Company/Contact/Product latest summary 잔여 범위는 2026-08-06 A 결정에 따라 12 전 계약화하지 않고 post-12 B2C/B2B record activity 전략 재검토 seed로 유지한다. `NBA-004` MeetingNote 목록 summary도 post-12 재검토 seed로 유지한다.
5. Backup/restore 실행 runbook, 장애 대응 drill은 11 system gate 기록과 별개로 post-12 운영 신뢰 후보로 다시 판단한다.
6. Product Analytics foundation은 09에서 완료됐고, mobile field-use event는 10에서 완료됐으며, Admin analytics dashboard는 11에서 완료됐다. billing-linked conversion/churn flow는 12 구현 결과 기준으로 다시 판단한다.
7. MeetingNote 자동 발송/알림, PWA/native packaging, Google Calendar write/webhook/recurrence, generic ExportJob은 post-12 재검토에서 first-sale follow-up인지 Series A later인지 다시 분류한다.
