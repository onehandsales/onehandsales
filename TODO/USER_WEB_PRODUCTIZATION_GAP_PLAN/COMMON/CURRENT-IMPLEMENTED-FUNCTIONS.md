# Current Implemented Functions

상태: Draft Guide
기준: 2026-08-03 현재 코드와 AGENT 구현 상태 문서

## 0. 완료 반영 체크리스트

- [x] DataImport 기본 upload/mapping/confirm/log 흐름
- [x] DataImport 확정 전 ImportJob DB persistence
- [x] DataImport 새로고침/탭 이동 resume UX
- [x] DataImport confirm/cancel/expired/failed 상태 처리
- [x] DataImport storage delete failure/redaction/ownership QA
- [x] DataImport G05~G08 최종형 보관/삭제/입력량 제한 보강 구현 및 G09 최종 QA closeout 완료
- [x] Weekly Schedule Report API: `GET /api/schedules/week`
- [x] Weekly Schedule Report export API: `GET /api/schedules/week/export/xlsx`
- [x] `/app/schedules/week` 주간 보고서 UX와 Excel 다운로드
- [x] Notification list/read/settings/browser-push API
- [x] Notification 일정/딜 reminder 생성과 delivery attempt 처리
- [x] `/app/notifications`, unread badge, settings, browser push fallback UX
- [x] Google Calendar OAuth connect/callback/status/calendar list/selection/sync/disconnect API
- [x] Google Calendar read-only import, source badge, manual sync, calendar selection UX
- [x] Schedule soft delete/Trash restore and Google-origin schedule reminder integration
- [x] DealActivity DB/API와 딜 상세 activity timeline
- [x] Deal list products/latest activity summary
- [x] Contact list dealCount
- [x] page size 15 Backend/API/User Web/test 계약 확인
- [x] MeetingNote AI/STT provider call log와 safe failure
- [x] MeetingNote next action/follow-up draft API
- [x] `/app/meeting-notes/:meetingNoteId` AI 후속 작업 UX
- [x] User country/locale/default currency global settings
- [x] `/app` i18n foundation과 핵심 화면 `ko-KR`/`en` 번역
- [x] Product/Deal currency, Contact global phone, Company country/region/address
- [x] Import template/export localization
- [x] Google/LINE/Apple auth provider list, exchange, login/signup buttons
- [x] Product analytics collector API, route/server event logging, activation/retention snapshot, AI usage summary
- [x] 모바일 BusinessCard 촬영 input과 OCR safe failure UX
- [x] 모바일 MeetingNote 녹음 UX와 음성 파일 fallback
- [x] BusinessCard/MeetingNote FE local draft 24시간 TTL과 복원/폐기 UX
- [x] Browser push permission explicit click UX
- [x] Mobile field analytics event allowlist와 privacy QA
- [x] Admin operation API/Web, audit/redaction, provider failure, analytics overview, Trash/account request/system gate

## 1. 구현 완료/부분 완료 표

| 영역 | Backend 구현 | User Web 구현 | Admin Web 구현 | 현재 판단 |
|---|---|---|---|---|
| Auth/User | `/api/auth/providers`, Google/LINE/Apple exchange, verified email linking, refresh, logout, `/api/me`, profile, country/locale/default currency, devices, `/admin/api/me`, `INITIAL_ADMIN_EMAILS` bootstrap | Google/LINE/Apple OAuth login/signup, protected route, settings/profile/global preferences/devices | `/admin/api/me` 기반 보호 route와 `/login` | User Web/Admin auth 완료. LINE/Apple 실제 provider smoke도 2026-07-29 사용자 확인 기준 운영 완료 |
| Public/auth locale | Backend 직접 없음 | `/{locale}`, `/{locale}/login`, signup/pricing/contact/about/security/terms/privacy, legacy redirect | N/A | 완료 |
| App i18n/global settings | User profile country/locale/default currency API | `/app` i18n provider/resource/formatter, Settings 언어/국가/기본 통화 저장, 핵심 화면 `ko-KR`/`en` 문구 | N/A | 완료. legacy static text fallback 직접 keying은 polish 후보 |
| Home | Schedule/Deal/MeetingNote API 조합 | `/app` dashboard | N/A | 완료 |
| Company | list/detail/create/update/delete, field/region, country/region/address, memo/private memo, contacts/deals, localized xlsx export, trash | 목록, 상세, 생성 패널, 국가/지역/주소 수정, 삭제/복구, export | N/A | 완료 |
| Contact | list/detail/create/update/delete, company/job grade/department, global phone, memo/private memo, deals, dealCount, localized xlsx export, trash | 목록, 상세, 생성, KR/US 전화번호 수정, 삭제/복구, dealCount, export | N/A | 완료 |
| Product | list/detail/create/update/delete, category/status, currencyCode, memo/private memo, dealCount/sort, deals, localized xlsx export, trash | 목록, 상세, 생성, 통화 수정, 삭제/복구, export | N/A | 완료 |
| Deal | list, stage counts, detail/create/update/delete, company/contact/product options, currencyCode, following action, memo, localized xlsx export, trash, `DealActivity` timeline API, products/latest activity summary | pipeline/list/detail/create/update, stage tabs, linked records, currency-aware amount, next action, memo, 딜 활동 timeline, products/latest activity summary, export | N/A | 완료 |
| Schedule | deal options, list/detail/create/update/delete, 월간/주간 조회, weekly report API, weekly xlsx export, Google Calendar OAuth/read-only import/sync/calendar selection/source metadata, 딜/회사/담당자/다음 행동 요약, timezone 처리 | `/app/schedules`, `/app/schedules/week`, detail, form, 월간/목록, 주간 보고서, Excel 다운로드, Google Calendar status/source badge/manual sync/calendar hidden handling | N/A | 완료. 주간 일정 보고서와 Google Calendar read-only import 포함 |
| MeetingNote | list/detail/create/update/delete, AI draft, STT draft, provider call log, next action draft, follow-up draft, add deal link, trash | 목록, 상세, 작성, AI/STT draft UI, 모바일 녹음/fallback, AI 후속 작업, 다음 행동 후보 편집 저장, follow-up draft 수정/복사, 딜 연동, 삭제/복구, local draft | Admin provider/audit에서 safe 운영 조회 | 완료. Admin audit/raw access는 11 완료. 목록 summary와 자동 발송/알림은 후속 |
| BusinessCard OCR | `/api/business-card-scans`, scan/confirm/log/status, safe failure field, KR/US phone normalization | `/app/business-cards`, 모바일 촬영/앨범 선택, OCR safe failure, 이미지 업로드, 명함스캔, KR/US 전화번호 확인/수정, local draft, 저장 | Admin provider failure에서 safe 운영 조회 | 완료. Admin provider failure dashboard는 11 완료 |
| DataImport | localized import templates, uploads, mapping, row edit/validation, confirm, cancel, active job resume, import logs. pre-confirm job은 DB persistence이며 terminal cleanup, 원본 file binary 즉시 삭제, `ImportUserLogRow` 30일 cleanup, 10MB/5,000행 제한까지 구현 완료 | `/app/import`, `/app/import/review/:importJobId`, template language selector, CSV/XLSX upload, AI mapping, row edit/validation, resume, confirm, log detail, row detail 만료 안내, 제한 초과 안내 구현 완료 | N/A | G01~G09 완료. 01은 최종 서비스 형태 기준 완전 종료 |
| Search | `GET /api/search` | GlobalSearch, loading/empty/error, result navigation | N/A | 완료 |
| Trash | `/api/trash`, detail, restore, Schedule soft delete/restore, 만료 row/recovery request | `/app/trash`, list/detail modal/restore, Schedule restore, 만료 row restore disabled, 복구 문의 | Admin User Trash와 recovery request queue | 7일 이내 복구와 7일 이후 복구 문의 완료. hard delete/purge와 유료 복구 결제는 제외 |
| Domain export | Company/Contact/Product/Deal localized xlsx endpoint, weekly schedule report localized xlsx export | 각 목록 `엑셀 다운로드`, `/app/schedules/week` Excel 다운로드, header/date-time/currency localization | N/A | 완료 |
| Notification | notification list/read/settings/browser-push API, 일정/딜/Google-origin schedule reminder 생성, due processor, email/browser push delivery attempt | `/app/notifications`, unread badge, settings, browser push 권한 explicit click, granted/denied/default/unsupported fallback | N/A | 완료. Google-origin schedule reminder와 10 permission UX 포함. 실제 SMTP/Web Push provider smoke도 2026-08-04 사용자 확인 기준 배포 환경에서 완료 |
| Generic ExportJob | 없음. 현재 제품 정본 아님 | `/app/export`는 `/app` redirect | N/A | 제외/후속 결정 필요 |
| Admin operation | `/admin/api/*` 사용자/도메인/Trash/provider/analytics/account/system/audit API, raw access reason, audit/sensitive log | N/A | `/users`, `/users/:userId`, `/users/:userId/domain`, `/users/:userId/trash`, `/provider-failures`, `/analytics`, `/account-requests`, `/trash/recovery-requests`, `/audit-logs`, `/system` | 11 완료. 결제/구독 Admin 연동은 12 후속 |
| Payment/subscription | 없음 | pricing public page는 있음 | Admin subscription route redirect | 후속 |
| Product analytics | `POST /api/analytics/events`, `ProductAnalyticsEvent`, server event recorder, activation/retention snapshot, AI usage summary, mobile field-use event allowlist, Admin analytics overview API | `/app` route analytics wrapper와 routeKey mapper, mobile field-use analytics helper. 사용자-facing analytics UI 없음 | `/analytics` overview | 09 foundation, 10 mobile field event, 11 Admin analytics 완료. billing conversion/churn source는 12 후속 |
| Mobile field use | BusinessCard safe failure, existing MeetingNote STT draft/Notification/Product Analytics API 재사용, G02 safe failure migration | 모바일 명함 촬영, 회의 녹음/fallback, local draft 복원/폐기, push permission UX, 360px/390px QA | N/A | 10 완료. PWA install/offline shell/native app은 후속 |

## 2. User Web 실제 라우트 상태

| 라우트 | 상태 |
|---|---|
| `/{locale}`, `/{locale}/login`, `/{locale}/signup`, public info pages | 구현 |
| `/auth/callback` | 구현 |
| `/app` | 구현 |
| `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId` | 구현 |
| `/app/contacts`, `/app/contacts/new`, `/app/contacts/new/full`, `/app/contacts/:contactId` | 구현 |
| `/app/contacts/scan` | `/app/business-cards` redirect |
| `/app/products`, `/app/products/new`, `/app/products/new/full`, `/app/products/:productId` | 구현 |
| `/app/deals`, `/app/deals/new`, `/app/deals/new/full`, `/app/deals/:dealId` | 구현 |
| `/app/schedules`, `/app/schedules/:scheduleId` | 구현 |
| `/app/schedules/week` | 구현 |
| `/app/meeting-notes`, `/app/meeting-notes/new`, `/app/meeting-notes/new/full`, `/app/meeting-notes/:meetingNoteId` | 구현 |
| `/app/business-cards` | 구현 |
| `/app/import`, `/app/import/review/:importJobId`, `/app/import/:importUserLogId` | 구현 |
| `/app/trash`, `/app/settings`, `/app/more` | 구현 |
| `/app/notifications` | 구현 |
| `/app/export` | `/app` redirect |

## 3. Admin Web 실제 라우트 상태

| 라우트 | 상태 |
|---|---|
| `/login` | 구현 |
| `/` | Admin placeholder |
| `/users`, `/users/:userId` | 구현 |
| `/users/:userId/domain`, `/users/:userId/trash` | 구현 |
| `/organizations` | `/` redirect |
| `/subscriptions` | `/` redirect |
| `/analytics` | 구현 |
| `/provider-failures` | 구현 |
| `/account-requests` | 구현 |
| `/trash/recovery-requests` | 구현 |
| `/audit-logs` | 구현 |
| `/system` | 구현 |
| `/support` | `/` redirect |

## 4. 현재 구현 상태의 의미

- 개인 영업자 MVP 핵심 루프는 대부분 구현되어 있다.
- 그러나 이 MVP 상태는 판매 기준이 아니다.
- 첫 판매 기준은 Global B2C 유료 판매 가능형이며, 현재 제품에는 결제/구독, 세금/컴플라이언스, Billing 정책/운영 계층이 아직 부족하다. 제품 분석 foundation은 09에서 완료됐고 mobile field-use event는 10에서 완료됐으며 Admin dashboard/운영 계층은 11에서 완료됐다. billing conversion/churn 연결은 12 후속이다.
- 주간 일정 보고서와 Excel export는 구현 완료됐으며, PDF/범용 ExportJob, 반복 일정, AI 요약은 후속 확장 범위다.
- Google Calendar read-only import/sync/calendar selection/source badge/Trash restore는 구현 완료됐다. export/write/realtime webhook/watch/반복 일정/여러 Google 계정 동시 연결은 후속 확장 범위다.
- 일정/딜 reminder 기반 Notification은 구현 완료됐고, 실제 SMTP/Web Push provider smoke도 2026-08-04 사용자 확인 기준 배포 환경에서 완료됐다.
- DealActivity timeline, Deal list products/latest activity, Contact dealCount, page size 15 계약은 구현 및 QA closeout 완료됐다. Company/Contact/Product latest summary, activity deletion/retention/audit 정책은 후속 범위다.
- MeetingNote AI/STT provider log, 회의록 상세 next action/follow-up draft, User Web AI 후속 작업 UX는 구현 및 QA closeout 완료됐다. Admin provider audit/raw access 운영은 11에서 완료됐고, 회의록 목록 summary와 자동 발송/알림은 후속 범위다.
- BusinessCard 모바일 촬영/OCR safe failure, MeetingNote 모바일 녹음/fallback, local draft, browser push permission UX, mobile field analytics는 10에서 구현 및 QA closeout 완료됐다.
- `/app` i18n, user global settings, Product/Deal currency, Contact global phone, Company region/address, Import/Export localization, Google/LINE/Apple auth는 08에서 구현 및 QA closeout 완료됐다. 08 DB migration은 2026-07-29 최신 상태로 재확인됐고, LINE/Apple 실제 provider smoke도 2026-07-29 사용자 확인 기준 운영 완료됐다.
- `11_ADMIN_OPERATION`은 완료됐고, 12 결제/구독/세금 로드맵 슬롯은 아직 작업 필요 상태다. PWA install/offline shell/native app은 10 완료 범위 밖 후속이다.
- 제품화 gap은 "API가 없어서 화면을 못 만든다"보다 "현재 핵심 루프를 Global B2C 첫 판매 gate까지 어떤 순서로 끌어올릴지"에 가깝다.
- 따라서 다음 계획은 MVP 기능 추가 목록이 아니라 Global B2C 첫 판매 기준 대비 gap을 먼저 정리해야 한다.
- 현재 결정된 순서는 12 결제/구독/세금 구현을 먼저 진행한 뒤, `GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 01~12 전체와 `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 다시 대조하는 것이다. 재검토에서 남은 미구현/후속 항목은 새 TODO 폴더로 승격하고, UX/UI 디자인 유지보수는 그 이후 별도 계획으로 진행한다.
