# Decision Log

상태: Decision Baseline / Roadmap DONE / Billing moved to `TODO/PADDLE_PLAN`
기준일: 2026-08-11

> 2026-08-24 전략 업데이트: 현재 우선 타겟 국가는 한국, 미국, 캐나다다. 이 완료 결정 로그의 과거 시장/locale 문구는 당시 이력으로 보존하며, 새 기준은 `AGENT/PM_AGENT/DECISIONS/031_kr_us_ca_priority_market.md`를 따른다.

## 0. 완료 반영

- [x] 01 ImportJob Persistence: Done (2026-07-21)
- [x] 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
- [x] 02 Notification Reminder: Done (2026-07-22)
- [x] 완료 기록: `TODO_LOG/2026-07-22/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
- [x] 03 Weekly Schedule Report: Done (2026-07-22)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/TODO_LOG.md`
- [x] 04 Google Calendar Integration: Done (2026-07-23)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/TODO_LOG/2026-07-23/G05_QA_REVIEW_CLOSEOUT/WORK_LOG.md`
- [x] 05 AI Weekly Sales Report: G01-G09 Done (2026-07-24), G10 Implemented (2026-08-05), provider smoke closeout completed by PRE12/BEFORE_12 (2026-08-09)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- [x] 06 Deal Activity Timeline: Done (2026-07-26)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`
- [x] 07 MeetingNote AI Provider Log: Done (2026-07-26)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/GOAL-SPECS/G06_QA_REVIEW_CLOSEOUT.md`
- [x] 08 Global Data I18N: Done (2026-07-28), DB 최신 상태 2026-07-29 재확인
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- [x] 09 Product Analytics: Done (2026-07-30)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/GOAL-SPECS/G08_QA_DOCUMENT_CLOSEOUT.md`
- [x] 10 Mobile PWA Field Use: Done (2026-07-31)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-SPECS/G07_QA_DOCUMENT_CLOSEOUT.md`
- [x] 11 Admin Operation: Done (2026-08-01)
- [x] 완료 기록: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- [x] PRE12 Follow-up Recheck: Done (2026-08-09, 2026-08-10 Admin provider failure pagination 보정 반영)
- [x] 12 Billing Subscription Tax: Moved / Deferred to `TODO/PADDLE_PLAN` (2026-08-11)

## 1. 제품 방향 결정

| 결정 | 내용 |
|---|---|
| UX 기준 | Notion식 작업공간 UX와 Attio식 CRM record 관계 UX를 함께 따른다. |
| 사용 편의성 | 설정을 많이 요구하지 않고, 강한 기본값과 짧은 action으로 사용자가 바로 업무를 이어가게 한다. |
| Record 관계 | 회사, 담당자, 제품, 딜, 일정, 회의록은 linked record로 정확히 연결한다. |
| AI 원칙 | AI는 자동 mutation하지 않고, 사용자가 확인할 수 있는 제안과 초안을 만든다. |
| 모바일 원칙 | 모바일은 desktop table 축소가 아니라 card/list, 현장 입력, draft 중심으로 간다. |
| 운영 원칙 | 민감정보, provider raw response, 결제/운영 판단은 User Web 일반 화면에 노출하지 않는다. |

## 2. 로드맵 운영 결정

| 결정 | 내용 |
|---|---|
| 로드맵 방식 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 Backend/API/DB 후보와 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 최종 서비스 gap을 01~12 기능 폴더로 재배치한다. 각 폴더는 착수 전 검토 슬롯으로 사용한다. |
| 구현 순서 | 기존 01~11 기능 선구현 순서는 완료됐다. 2026-08-11 이후 다음 active direction은 기능 유지보수, UX/UI 상품성 개선, 100명 베타 테스트다. |
| 판매 기준 | MVP는 판매하지 않는다. Global B2C가 첫 판매 기준이다. |
| 마지막 묶음 | Admin 운영은 11에서 완료했다. 기존 12 구독/결제/세금 상세 구현은 즉시 실행하지 않고 `TODO/PADDLE_PLAN`으로 이관했다. Paddle 구현은 UX/UI 유지보수와 100명 베타 이후 가격/플랜/권한/policy 확정 뒤 진행한다. |
| `/goal` 관계 | 이 로드맵은 `/goal`이 아니며, 각 번호 폴더를 보강한 뒤 별도 `/goal`로 전환한다. |
| 슬롯 의사결정 | 각 슬롯은 이 문서의 추천 결정을 기본값으로 삼고, 구현 전 `SCOPE/API/DB/FE` 문서에서 confirmed로 승격한다. |
| First-sale gate | `COMMON/FIRST-SALE-GATE-MAP.md`를 Global roadmap의 선행 gate 기준으로 둔다. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`과 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 최종 방향이 01~12 순서에서 약해지지 않게 추적한다. |
| PRE12와 Billing 이관 | 2026-08-09 기준 01~11 완료 슬롯 재대조와 BEFORE_12 closeout은 완료됐다. 선택된 `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`는 닫혔다. billing/paywall/churn/paid conversion/invoice/tax와 직접 연결되는 항목은 `TODO/PADDLE_PLAN`으로 이관한다. |
| Global roadmap closeout | 2026-08-11 기준 `GLOBAL_B2C_FEATURE_ROADMAP_PLAN`은 DONE으로 닫는다. 결제는 `TODO/PADDLE_PLAN`, UX/UI와 기능 유지보수는 별도 유지보수/UXUI 계획에서 다룬다. |

## 3. 슬롯별 추천 결정

| 슬롯 | 결정 상태 | 추천 결정 |
|---|---|---|
| 01 ImportJob Persistence | Done | `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`로 확정 전 작업을 DB에 저장한다. 작업 재개 TTL은 7일로 둔다. 원본 파일 binary는 DB에 저장하지 않고 storage에 두며 장기 보관하지 않는다. confirm/cancel/expire 후 원본 파일 삭제를 추적한다. resume route와 cancel API를 제공한다. 구현 및 QA closeout 완료. 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 미완성이 아니라 post-12 scale/source/Admin ops 후보로 분리한다. |
| 02 Notification Reminder | Done | 2026-07-22 구현 및 QA closeout 완료. 1차 채널은 앱 안 알림, browser push, email을 모두 포함한다. 1차 알림 대상은 일정 시작 전과 딜 마감일만 포함한다. 일정 알림은 시작 30분 전, 딜 마감 알림은 사용자 timezone 기준 마감일 1일 전 오전 9시에 보낸다. 다음 행동 알림은 딜 데이터 구조 변경 가능성이 있어 06 DealActivity/다음 행동 고도화에서 다시 설계한다. 회의록 후속 알림은 07에서 다시 설계한다. 실제 SMTP/Web Push provider smoke는 2026-08-04 사용자 확인 기준 운영 완료됐다. |
| 03 Weekly Schedule Report | Done | 2026-07-22 구현 및 QA closeout 완료. 03은 주간 보고서 화면과 동기식 Excel 다운로드까지만 구현했다. `NBA-009 Schedule week report`를 confirmed 기능 goal로 승격했고, API는 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`로 확정/구현했다. `weekStart`는 월요일 date-only로 받고, 다일 일정은 겹치는 날짜마다 표시하며, 일정 없는 날도 7일 모두 표시한다. 딜 금액/단계/마감일/회사/담당자/다음 행동은 포함하되 일정 메모 본문은 제외하고 `hasMemo`만 둔다. 새 DB 구조와 migration은 만들지 않았다. 03은 Global B2C retention/Product UX 일부를 강화하지만 첫 판매 gate 전체를 닫지 않는다. 결제/Admin/앱 전체 다국어/통화 모델/제품 분석, 제품 요약, PDF, `/app/export`, 범용 ExportJob, 반복 일정 정식 모델은 별도 사용자 결정/goal로 분리한다. |
| 04 Google Calendar Integration | Done | 2026-07-23 구현 및 QA closeout 완료. Google login과 Calendar scope를 분리했고, 사용자당 Google Calendar connection 1개에서 primary calendar 기본 선택과 추가 calendar 선택을 구현했다. 04는 Google read-only import이며 Google export, 양방향 sync, webhook, 반복 일정 정식 모델, 참석자 import, Google reminders import는 제외했다. `/app/schedules` 진입 시 10분 freshness 자동 sync와 수동 sync를 제공한다. sync range는 사용자 timezone 기준 과거 1개월/미래 3개월이다. Google description은 최초 import 때만 `Schedule.memo`로 저장하고 이후 sync는 memo를 덮어쓰지 않는다. safe `https://` meeting URL, all-day `isAllDay`, source badge를 구현했다. Google-origin schedule도 로컬 수정/딜 연결/메모/한손 `SCHEDULE_START_REMINDER`를 지원하며, 로컬 수정은 `Google · 로컬 수정` badge와 `LOCAL_MODIFIED`로 보호한다. Google 삭제/선택 해제/연결 해제 숨김은 물리 삭제하지 않고 보존한다. Schedule 삭제는 전체적으로 soft delete/Trash로 전환했고, 연결 해제는 `KEEP/HIDE/TRASH` 중 선택하며 기본은 `KEEP`이다. 실제 Google provider smoke는 2026-08-04 사용자 확인 기준 운영 완료됐다. |
| 05 AI Weekly Sales Report | Done / Provider Smoke Closeout Complete | 저장형 AI weekly report, follow-up delivery, Gmail/Microsoft 실제 email provider adapter, reconnect, safe failure, smoke allowlist 구현 및 자동 검증 완료. Gmail/Microsoft provider smoke closeout은 2026-08-09 PRE12/BEFORE_12에서 완료 처리됐으며, SMS 실제 provider와 고급 딜 리스크/자동화는 후속이다. |
| 06 Deal Activity Timeline | Done | `DealActivity` 정본 모델/API/UX, 딜 목록 products/latest activity, 담당자 dealCount, page size 15 계약, 06 범위 DB/Prisma gate closeout 완료. Company/Contact/Product latest summary와 범용 activity bus는 후속이다. |
| 07 MeetingNote AI Provider Log | Done | 공통 `AiProviderCallLog` target 확장, MeetingNote AI/STT safe failure, 상세 next action/follow-up draft, User Web AI 후속 작업 UX 구현 및 QA closeout 완료. 목록 summary, 자동 발송, Admin audit/retention은 후속이다. |
| 08 Global Data I18N | Done | `/app` `ko-KR`/`en` i18n, user global settings, Product/Deal currency, Contact KR/US phone, Company country/region/address, Import/Export localization, Google/LINE/Apple auth 구현 완료. 2026-07-29 현재 DB 최신 상태 재확인 완료. 2026-07-29 사용자 확인 기준 LINE/Apple 운영 설정과 실제 OAuth 동작도 완료됐다. |
| 09 Product Analytics | Done | 자체 DB `ProductAnalyticsEvent` 기반 allowlist event taxonomy, `POST /api/analytics/events`, User Web route event wrapper, core server event logging, activation/retention snapshot, 365일 raw event purge, `AiProviderCallLog` 기반 AI usage summary를 구현하고 QA closeout을 완료했다. billing/paywall/churn event는 reserved taxonomy로만 남기고 실제 runtime flow는 `TODO/PADDLE_PLAN`에서 연결한다. Admin analytics UI/API는 11에서 구현 완료됐다. |
| 10 Mobile PWA Field Use | Done | 2026-07-31 구현 및 QA closeout 완료. native app 전 모바일 웹 현장 입력성에 집중했고, 명함 후면 카메라/앨범 선택, OCR safe failure 계약, 회의 직후 녹음과 음성 파일 fallback, FE local draft 24시간 TTL, browser push permission UX, mobile field analytics event를 구현했다. server draft DB, audio/image binary DB 저장, provider raw detail/log/analytics/local draft 저장, PWA install/offline shell, native app은 제외했다. native app 전환은 후속 지표와 사용자 결정으로 판단한다. |
| 11 Admin Operation | Done | 2026-08-01 구현 및 QA closeout 완료. `INITIAL_ADMIN_EMAILS` bootstrap, `/admin/api/*` AuthGuard/AdminGuard 분리, 사용자/도메인 read-only 운영 조회, masking, raw access reason, append-only audit/sensitive log, Trash 만료/복구 문의, account deletion/data export request, provider failure, analytics overview, system operation gate를 구현했다. 결제/구독/plan/payment/invoice/refund는 11에서 제외했고 2026-08-11 기준 `TODO/PADDLE_PLAN`으로 이관했다. |
| 12 Billing Subscription Tax | Moved / Deferred | 기존 결정 baseline은 `TODO/PADDLE_PLAN`으로 이관했다. Paddle은 Merchant of Record 우선 후보이고 Stripe 직접 결제는 fallback이다. 판매 rollout, 가격, plan, entitlement, AI 사용량 limit, failed payment, refund, chargeback, invoice/tax 정책은 UX/UI 유지보수와 100명 베타 이후 `TODO/PADDLE_PLAN`에서 confirmed로 승격한다. |

## 4. 구현 전 승격 규칙

이 문서의 결정은 완료된 슬롯별 기본 방향과 archive 기준이다. 새 구현에 들어가려면 이 폴더를 재개하지 않고 새 TODO 또는 `TODO/PADDLE_PLAN`에서 아래를 완료해야 한다.

1. `COMMON/SCOPE.md`에 포함/제외 범위를 confirmed 수준으로 반영한다.
2. API가 있으면 `COMMON/API-SPEC`을 만들고 계약 상태를 `confirmed`로 둔다.
3. DB 변경이 있으면 `BE-TODO/DB-SCHEMA.md`에 Prisma model, DDL, index, retention을 적는다.
4. 신규 migration이 있으면 `COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` 체크를 선행 조건으로 goal spec에 넣는다.
5. User Web 변경이 있으면 `FE-TODO/USER-WEB-TODO.md`에 route, state, query key, empty/error/success를 적는다.
6. `/app` 핵심 업무 흐름을 바꾸면 Product UX first-sale gate 영향 여부를 적는다.
7. Trash/export/delete/retention/billing/policy를 건드리면 Trust/policy first-sale gate 영향 여부를 적는다.
8. `/goal` 실행 전 `COMMON/GOAL-SPECS`와 `COMMON/PLANNING-REVIEW.md`를 만든다.

## 5. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/ROADMAP-CLOSEOUT.md`
- `TODO/PADDLE_PLAN/README.md`
