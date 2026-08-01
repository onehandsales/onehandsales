# API TODO

상태: Draft
최종 업데이트: 2026-08-01

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료
- [x] `NBA-009 Schedule week report`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`에서 구현 및 QA closeout 완료
- [x] `NBA-010 Notification`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER`에서 구현 및 QA closeout 완료
- [x] `NBA-015 Google Calendar Integration`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`에서 구현 및 QA closeout 완료
- [x] `NBA-001 Deal list products summary`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout 완료
- [x] `NBA-002 Contact list dealCount`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 구현 및 QA closeout 완료
- [x] `NBA-003 Deal latest activity subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 부분 구현 및 QA closeout 완료
- [x] `NBA-008 Page size 15 contract cleanup`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 확인 완료
- [x] `NBA-014` 06 범위 DB/Prisma migration 운영 gate closeout 완료
- [x] `NBA-004 MeetingNote detail next action/follow-up draft subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`에서 구현 및 QA closeout 완료
- [x] `NBA-011 MeetingNote provider log subset`: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`에서 공통 `AiProviderCallLog` 확장으로 구현 및 QA closeout 완료
- [x] `08_GLOBAL_DATA_I18N`: User global settings, domain global data, import/export localization, Google/LINE/Apple auth API 구현 및 QA closeout 완료
- [x] `09_PRODUCT_ANALYTICS`: product analytics collector API, server event recorder, snapshot/AI usage internal use case 구현 및 QA closeout 완료
- [x] `NBA-005 BusinessCard provider failure code/message contract`: `10_MOBILE_PWA_FIELD_USE`에서 구현 및 QA closeout 완료
- [x] `10_MOBILE_PWA_FIELD_USE`: BusinessCard safe failure, MeetingNote STT draft reuse, notification API reuse, mobile analytics event 구현 및 QA closeout 완료
- [x] `NBA-007 Trash private memo backend response restriction`: `11_ADMIN_OPERATION`에서 구현 및 QA closeout 완료
- [x] `NBA-011` Admin/internal provider audit 조회 범위: `11_ADMIN_OPERATION`에서 provider failure 운영 조회와 raw access audit 기준 구현 완료
- [x] `NBA-012 Trash 7일 이후 복구 정책`: `11_ADMIN_OPERATION`에서 User 만료 row/복구 문의와 Admin recovery queue 구현 완료
- [x] `NBA-013 Admin 운영 UX/API`: `11_ADMIN_OPERATION`에서 `/admin/api/*`와 Admin Web 운영 화면 구현 완료
- [x] `11_ADMIN_OPERATION`: Admin 운영 API/Web, audit/redaction, provider/trash/account/system gate 구현 및 QA closeout 완료

## 1. 목적

이 문서는 G07에서 분리한 Backend/API 후속 후보를 실행 가능한 다음 계획으로 만들기 전의 초안이다.

이 문서에서 남은 active 새 API 후보는 `COMMON/API-SPEC/README.md`에서 `draft` 또는 `후보` 상태로만 관리한다. `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-004` MeetingNote detail subset, `NBA-005`, `NBA-006`, `NBA-007`, `NBA-008`, `NBA-009`, `NBA-010`, `NBA-011`, `NBA-012`, `NBA-013`, `NBA-014`, `NBA-015`, `08_GLOBAL_DATA_I18N`, `09_PRODUCT_ANALYTICS`, `10_MOBILE_PWA_FIELD_USE`, `11_ADMIN_OPERATION`은 별도 계획에서 구현 완료된 이력으로만 남긴다.

## 2. 06에서 닫힌 release blocker

### NBA-014. DB/Prisma migration 운영 gate closeout

- 연결 이슈: `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/ISSUE-LOG.md`의 `RQA-005`
- API 영향: 없음
- Backend 영향: Prisma generate, migration status, seed 정책, DB target 분류
- 06 반영 결과:
  - G02에서 active DB target이 원격 Supabase임을 확인했다.
  - 기존 migration 파일은 수정하지 않았다.
  - 공유/운영성 DB에 무단 migrate/seed를 실행하지 않았다.
  - G07에서 `prisma:validate`, Backend typecheck/lint/test/build를 통과했다.
- 06 밖으로 남는 범위:
  - 실제 운영 DB 적용 절차, backup/restore, Admin raw audit, 장애 대응 기준은 Global B2C data reliability gate에서 별도 결정한다.

## 2.1 07에서 닫힌 MeetingNote API/provider log subset

- 연결 이슈: `NBA-004` MeetingNote detail next action/follow-up draft subset, `NBA-011` MeetingNote provider log subset
- API 영향:
  - 기존 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft` provider call log와 safe failure 계약 보강
  - 신규 `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`, `POST /api/meeting-notes/:meetingNoteId/follow-up-draft` 구현
- Backend 영향:
  - provider 호출은 DB transaction 밖에서 수행
  - provider log는 공통 `AiProviderCallLog`에 원문 없이 비용/latency/실패 상태 중심으로 기록
  - AI 후보는 자동 저장하지 않고 follow-up draft는 자동 발송하지 않음
- 07 밖으로 남는 범위:
  - `GET /api/meeting-notes` 목록 latest/next summary
  - Admin/internal provider audit 조회와 raw access reason은 11에서 완료
  - 별도 transcript/raw provider response 저장 table
  - 회의록 follow-up 알림 또는 자동 발송

## 2.2 08에서 닫힌 Global Data I18N API

- 연결 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`
- API 영향:
  - User global settings/profile API에 country/locale/default currency 저장과 조회 반영
  - Product/Deal create/update/list/detail/export/report API에 `currencyCode`와 currency-aware amount 반영
  - Contact create/update/list/detail/search/import/business-card/export API에 KR/US 글로벌 전화번호 구조 반영
  - Company create/update/list/detail/export API와 region option API에 country/region/address 구조 반영
  - Import template API `locale=ko-KR|en`과 domain export API header/date-time/currency 현지화 반영
  - `/api/auth/providers` Google/LINE/Apple provider list, Supabase exchange normalization, verified email linking, email-required safe failure 구현
- Backend 영향:
  - provider raw error와 token/secret은 사용자 응답과 log에 노출하지 않는다.
  - `/app` 다국어는 public-site locale routing과 분리하고 User API에는 locale route prefix를 추가하지 않는다.
- 08 밖으로 남는 범위:
  - 추가 국가/통화/전화번호 포맷, Google/LINE/Apple 외 신규 provider. Admin provider 운영 화면은 11에서 완료
- 08 후속 운영 확인 완료:
  - 2026-07-29 사용자 확인 기준 LINE/Apple provider 설정값 연결과 실제 OAuth 동작이 운영 환경에서 완료됐다.

## 2.3 09에서 닫힌 Product Analytics API

- 연결 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- API 영향:
  - `POST /api/analytics/events` client collector API 구현
  - product analytics server event recorder와 core mutation 성공 event command 구현
  - snapshot processing, raw event purge, AI usage summary는 HTTP endpoint 없이 internal use case로 구현
- Backend 영향:
  - client request의 user/session/device/time/source/idempotency/target field는 거절하고 Backend 인증 context로 보강한다.
  - server event는 idempotencyKey를 필수로 하고 product API 성공을 막지 않도록 best-effort로 기록한다.
  - billing/paywall/churn event는 reserved taxonomy로만 유지하고 runtime allowlist에는 넣지 않는다.
- 09 밖으로 남는 범위:
  - Admin analytics dashboard/API는 11에서 완료
  - 실제 billing/paywall/churn survey flow와 paid conversion source event

## 2.4 10에서 닫힌 Mobile Field Use API

- 연결 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- API 영향:
  - BusinessCard scan response/list/detail safe failure 계약 구현
  - MeetingNote 모바일 녹음은 기존 `POST /api/meeting-notes/stt-draft` 재사용
  - Browser push permission UX는 기존 notification API 재사용
  - Mobile field analytics event는 기존 `POST /api/analytics/events` collector 재사용
- Backend 영향:
  - provider raw detail, transcript 전문, audio/image raw data, push endpoint/key/token, PII/raw text를 response/log/analytics/local draft에 저장하지 않는다.
  - 10 범위 신규 DB model은 없고 G02 BusinessCard safe failure migration만 추가했다.
- 10 밖으로 남는 범위:
  - PWA install/offline shell, full offline sync, iOS/Android native app, native push/contact/calendar
  - Admin provider failure dashboard와 운영 추적은 11에서 완료
  - marketing opt-in, billing/paywall/churn runtime event

## 2.5 11에서 닫힌 Admin Operation API

- 연결 계획: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- API 영향:
  - `/admin/api/*` 사용자/도메인/Trash/provider/analytics/account/system/audit API 구현
  - `POST /api/trash/recovery-requests` 만료 Trash 복구 문의 API 구현
  - 계정 삭제/데이터 export request User/Admin API 구현
  - Admin raw access reason validation과 sensitive/audit log transaction 구현
- Backend 영향:
  - Admin API는 AuthGuard와 AdminGuard를 모두 통과한다.
  - User API와 Admin API를 같은 endpoint의 role 분기로 합치지 않는다.
  - provider raw/prompt/token/quota detail, browser push endpoint/key/userAgent 원문, analytics raw payload dump, private memo 원문은 response/log에 노출하지 않는다.
  - Admin system gate는 migration/seed/backup/restore/provider smoke 점검 결과를 기록하지만 shell command를 직접 실행하지 않는다.
- 11 밖으로 남는 범위:
  - 결제/구독/plan/payment/invoice/refund/failed payment recovery와 billing-linked conversion/churn event
  - Admin 직접 Trash 복구 실행, 유료 복구 결제, Trash hard delete/purge
  - 자동 민감정보 감지와 generic ExportJob 파일 생성/대량 export

## 3. Release follow-up API 후보

06 완료로 active 후보에서 제외:

- `NBA-001`: Deal list `products` summary
- `NBA-002`: Contact list `dealCount`
- `NBA-008`: Page size 15 contract cleanup

남은 release follow-up 후보:

- 현재 이 문서 기준 신규 확정 후보 없음. `NBA-005`는 10에서 완료됐다.

남은 release follow-up 공통 다음 작업:

- API 계약을 `confirmed`로 승격할 별도 goal을 만든다.
- request/response DTO 이름, success status, error response, FE/BE 처리 기준을 적는다.
- ownership isolation과 pagination/filter 테스트 영향을 함께 적는다.
- FE client type 변경이 있으면 같은 goal에서 검증한다.

## 4. Product feature API 후보

- `NBA-003`: Company/Contact/Product latest memo/activity/next action summary. Deal list `latestActivity` subset은 06에서 완료
- `NBA-004`: MeetingNote 목록 next/latest summary. 상세 next action/follow-up draft subset은 07에서 완료

공통 다음 작업:

- 사용자-facing 가치와 MVP 이후 우선순위를 먼저 확정한다.
- 새 endpoint가 필요한지, 기존 list response 확장으로 충분한지 분리한다.
- DB table/migration 필요 여부를 `BE-TODO/DB-SCHEMA.md`와 함께 확정한다.
- 외부 Provider 또는 retention이 있으면 observability/redaction 기준을 먼저 잡는다.

## 5. Ops/security API 후보

현재 이 문서 기준 신규 확정 ops/security API 후보는 없다. `NBA-007`, `NBA-011` Admin/internal 범위, `NBA-012`, `NBA-013`은 11에서 완료됐다.

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
