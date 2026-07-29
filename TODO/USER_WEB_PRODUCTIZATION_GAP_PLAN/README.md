# User Web Productization Gap Plan

상태: Draft Guide
작성일: 2026-07-20
최종 업데이트: 2026-07-29
성격: 제품화 gap 판단 가이드

## 0. 완료 반영 체크리스트

- [x] DataImport 기본 흐름
- [x] DataImport ImportJob persistence/resume (`NBA-006`)
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE` 구현 및 QA closeout
- [x] Weekly Schedule Report (`NBA-009`)
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT` 구현 및 QA closeout
- [x] Notification reminder (`NBA-010`)
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER` 구현 및 QA closeout
- [x] Google Calendar Integration (`NBA-015`)
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION` 구현 및 QA closeout
- [x] Deal Activity Timeline (`NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-008`, `NBA-014` 06 범위)
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE` 구현 및 QA closeout
- [x] MeetingNote AI Provider Log (`NBA-004` detail subset, `NBA-011` provider log subset)
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG` 구현 및 QA closeout
- [x] Global Data I18N (`08_GLOBAL_DATA_I18N`)
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N` 구현 및 QA closeout
- [ ] Admin 운영 API/화면
- [ ] 결제/구독/세금
- [ ] 제품 분석 (`09_PRODUCT_ANALYTICS`부터 작업 필요)

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales`의 최종 서비스 형태와 현재 구현 상태 사이의 차이를 정리한다.

이 문서는 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 입력 문서다. 여기서 드러난 Global B2C gap 중 기능으로 먼저 만들어야 하는 항목은 Global roadmap의 01~12 슬롯으로 승격하고, UX/UI 전체 polish는 기능 흐름이 충분히 갖춰진 뒤 별도 계획에서 잡는다.

이 문서는 `/goal` 실행 계획이 아니다. 바로 구현하거나 이슈를 닫기 위한 작업 순서가 아니라, 다음 구현 계획을 만들기 전에 제품 방향, UX/UI 완성도, 기능/운영 gap을 판단하기 위한 기준 문서다.

판매 기준선은 `Global B2C 유료 판매 가능형`이다. `MVP`는 판매용 제품이 아니라, Global B2C 판매 버전을 만들기 전에 핵심 업무 루프가 동작하는지 확인하는 내부 품질/제품화 준비 단계로 본다.

## 2. 먼저 확인한 범위

- `FE/user-web`: 실제 사용자 앱 라우트, feature, layout, API client 구조
- `FE/admin-web`: Admin route와 현재 redirect/placeholder 상태
- `BE`: NestJS module, controller/API path, Prisma schema 기준 구현 도메인
- `AGENT/PM_AGENT`: PRD, MVP scope, implementation status, Global B2C/Series A roadmap
- `AGENT/UXUI_AGENT`: UX/UI direction, user flow/screen list, Notion+Attio reference, UX writing guide
- `AGENT/SOFTWARE_AGENT`: Front/Backend architecture, API contract, DB schema 기준
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`

## 3. 현재 결론

현재 제품은 핵심 MVP 업무 기능이 상당히 구현되어 있다. 다만 MVP 상태로는 판매하지 않는다.

첫 판매 가능한 제품은 Global B2C 기준을 만족해야 한다. 따라서 다음 판단은 "MVP 기능이 더 있는가"가 아니라, 현재 구현된 핵심 루프가 글로벌 B2C 유료 판매에 필요한 결제, 운영, 신뢰, 현지화, 분석 계층과 어떻게 연결되어야 하는지다.

완료된 핵심 축:

- Auth/User
- Public/auth URL locale
- Google/LINE/Apple auth
- User global settings
- `/app` i18n
- `/app` home dashboard
- Company
- Contact
- Product
- Deal
- Deal Activity Timeline
- Schedule
- Weekly Schedule Report
- Google Calendar Integration
- MeetingNote
- MeetingNote AI 후속 작업 draft
- BusinessCard OCR
- DataImport
- Notification reminder
- Search
- Trash
- Company/Contact/Product/Deal xlsx export
- 글로벌 통화/전화번호/회사 지역/주소 및 Import/Export 현지화

부족한 핵심 축:

- 제품화 수준의 최종 UX/UI 완성도 판단
- 첫 판매 기준인 Global B2C 유료 판매를 위한 결제/구독, 세금/컴플라이언스, Admin 운영, 제품 분석, 정책/신뢰/DB 운영 gate
- Series A급 고급 리텐션/AI/모바일 현장 사용성
- Admin 운영 API 같은 후속 기능의 우선순위 확정

## 3.1 `NBA-015` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION`은 2026-07-23 G05 QA closeout 기준으로 Done이다. 이 제품화 갭 문서에서는 Google Calendar read-only import를 미구현 gap으로 보지 않는다.

완료로 반영할 User Web/제품 흐름:

- `/app/schedules`에서 Google 연결 CTA, 연결 상태, 선택 calendar 요약, 자동/수동 sync, source badge, 숨긴 Google 일정 filter 제공
- `/app/settings`에서 Google Calendar 연결, 재연결, calendar 선택 관리, 연결 해제 action 제공
- `/app/schedules/:scheduleId`에서 Google-origin schedule의 meeting URL, `종일`, source badge, 로컬 수정 상태, 딜/메모 수정 지원
- `/app/schedules/week`에서 Google-origin active schedule과 meeting URL/source badge 표시
- `/app/trash`에서 `SCHEDULE` 휴지통 항목과 복구 지원
- Google-origin schedule도 일정 reminder와 연결되어 retention 흐름에 포함

남은 제품화 gap으로 분리할 범위:

- 실제 Google provider smoke는 env 준비 후 운영 확인 단계에서 실행한다.
- Google export/write, realtime webhook/watch, 반복 일정 정식 모델, 여러 Google 계정 동시 연결은 새 계획 없이는 확장하지 않는다.
- 첫 판매 전 핵심 gap은 여전히 결제/구독/세금, Admin 운영, 제품 분석, 정책/신뢰/DB 운영 gate다.

## 3.2 `06_DEAL_ACTIVITY_TIMELINE` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`은 2026-07-26 G07 QA closeout 기준으로 Completed다. 이 제품화 갭 문서에서는 아래 범위를 더 이상 미구현 gap으로 보지 않는다.

완료로 반영할 User Web/제품 흐름:

- `/app/deals/:dealId`에서 `딜 활동` timeline으로 딜 생성, 단계 변경, 다음 행동, 일정, 회의록, follow-up, 수동 활동 흐름을 읽을 수 있다.
- 수동 활동 생성/수정 UX와 loading/empty/error/success 상태가 있다.
- `/app/deals` 목록에서 연결 제품 summary와 최신 활동 summary를 API 응답 기준으로 표시한다.
- `/app/contacts` 목록에서 `dealCount`를 API 응답 기준으로 표시한다.
- page size 15 계약을 Backend/API/User Web/test 기준으로 확인했다.
- User Web은 API 응답에 없는 latest activity, products summary, dealCount를 임의 생성하지 않는다.

남은 제품화 gap으로 분리할 범위:

- Company/Contact/Product latest activity, latest memo, next action summary
- 일반 메모와 private memo의 activity 통합 정책
- 수동 activity 삭제, retention, audit 정책
- MeetingNote 목록 latest/next summary
- MeetingNote Admin provider audit, retention/cleanup, raw access policy
- 첫 판매 전 핵심 gap인 결제/구독/세금, Admin 운영, 제품 분석, backup/restore와 운영 DB 적용 절차

## 3.3 `07_MEETING_NOTE_AI_PROVIDER_LOG` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`는 2026-07-26 G06 QA closeout 기준으로 Completed다. 이 제품화 갭 문서에서는 아래 범위를 더 이상 미구현 gap으로 보지 않는다.

완료로 반영할 User Web/제품 흐름:

- `/app/meeting-notes` 생성 모달에서 AI/STT draft loading/error/success와 안전한 retry 흐름을 제공한다.
- STT transcript는 생성 모달의 임시 확인 영역에만 표시되고 저장 request body에는 포함되지 않는다.
- `/app/meeting-notes/:meetingNoteId`에서 `AI 후속 작업` section으로 다음 행동 후보를 만들고, 수정 후 기존 다음 행동 API로 저장할 수 있다.
- 회의록 상세에서 이메일/SMS follow-up draft를 생성하고, 사용자가 수정/복사할 수 있다.
- AI 후보는 자동 저장하지 않고 follow-up draft는 자동 발송하지 않는다.
- Backend provider log는 공통 `AiProviderCallLog`에 원문 없이 기록되고 User Web은 `/admin/api/*`를 호출하지 않는다.

남은 제품화 gap으로 분리할 범위:

- 회의록 목록 latest/next summary
- 회의록 follow-up 자동 발송 또는 알림
- Admin/internal provider audit 조회, raw access reason, retention/cleanup policy
- 별도 transcript/raw provider response 저장 table

## 3.4 `08_GLOBAL_DATA_I18N` 반영 기준

`TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N`은 2026-07-28 G10 QA closeout 기준으로 Completed다. 이 제품화 갭 문서에서는 `/app` 내부 다국어와 기본 글로벌 데이터 모델을 더 이상 미구현 gap으로 보지 않는다.

완료로 반영할 User Web/제품 흐름:

- `/app/settings`에서 국가, 앱 언어, 기본 통화 설정을 저장하고 저장 직후 문구와 formatter가 반영된다.
- `/app` 핵심 화면은 `ko-KR`/`en` app i18n resource와 legacy static fallback으로 동작한다.
- Product/Deal 금액은 `currencyCode`와 KRW/USD 표시 정책을 따른다.
- Contact 전화번호는 KR/US 국가 코드, national number, E.164 기준으로 생성/수정/import/business-card/search/export 흐름에 반영된다.
- Company는 country/region/address 구조와 region option을 사용한다.
- Import template과 domain export는 `ko-KR`/`en` header/date-time/currency 현지화를 지원한다.
- 로그인/회원가입은 Google, LINE, Apple provider를 동일한 UI 패턴으로 제공한다.

남은 제품화 gap으로 분리할 범위:

- 08 DB migration 최신 상태는 2026-07-29 재확인 완료. 남은 운영 항목은 LINE/Apple provider 설정값 연결과 실제 OAuth smoke
- 추가 국가/통화/전화번호 포맷, 국가별 세금/약관/가격 정책
- app i18n legacy static fallback을 직접 translation key로 줄이는 polish
- 결제/구독, Admin 운영, 제품 분석, backup/restore와 장애 대응 기준

## 4. 문서 구성

- `COMMON/FINAL-SERVICE-SHAPE.md`: 최종 서비스 단계별 기능 정의
- `COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`: Global B2C 첫 판매 gate 기준
- `COMMON/CURRENT-IMPLEMENTED-FUNCTIONS.md`: 현재 구현된 FE/BE 기능 표
- `COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`: 최종 형태와 현재 상태의 차이
- `FE-TODO/USER-WEB-PRODUCTIZATION-GUIDE.md`: User Web 화면/UX 관점 가이드
- `BE-TODO/BACKEND-PRODUCTIZATION-GUIDE.md`: Backend/API/DB/운영 관점 가이드

## 5. 사용 방법

새 기능을 구현하기 전에 이 가이드로 먼저 판단한다.

1. `COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md` 기준으로 해당 기능이 Global B2C 첫 판매 gate에 필요한지, Series A 이후 기능인지 구분한다.
2. MVP 핵심 루프가 이미 구현된 기능인지 확인하되, MVP 완료를 판매 가능으로 해석하지 않는다.
3. UX/UI만 보강하면 되는지, API/DB/운영/정책 계약이 필요한지 분리한다.
4. Backend/API가 필요하면 `COMMON/API-SPEC`이 있는 별도 TODO 계획을 만든다.
5. 실제 구현은 별도 `/goal` 문서로 쪼갠 뒤 진행한다.

## 6. 지금 바로 구현하지 않을 것

아래 항목은 이 가이드 작성만으로 바로 구현하지 않는다.

- Notification 확장: 회의록 follow-up 알림, Admin provider failure UI, 실제 SMTP/Web Push provider smoke
- Admin 운영 API/화면
- 결제/구독
- AI 주간 영업 리포트, PDF/범용 ExportJob, 반복 일정 같은 주간 일정 보고서 확장
- 완료된 Google Calendar Integration 범위를 넘어서는 Google Calendar export/write, realtime webhook/watch, 반복 일정, 여러 Google 계정 동시 연결
- 완료된 MeetingNote AI Provider Log 범위를 넘어서는 회의록 목록 summary, 자동 follow-up 발송/알림, Admin provider audit 조회, 별도 transcript/raw provider response table
- 완료된 Deal Activity Timeline 범위를 넘어서는 범용 activity bus, Company/Contact/Product latest summary, activity deletion/retention/audit 정책
- 완료된 Global Data I18N 범위를 넘어서는 신규 국가/통화/provider, `/app` locale prefix, 추가 DB migration 실행, LINE/Apple provider smoke를 운영 계획 없이 진행

위 항목은 제품화 우선순위와 UX/UI 방향을 확정한 뒤 별도 계획에서 다룬다.

단, 결제/구독, Admin 운영, 제품 분석, 세금/컴플라이언스, 정책/운영 신뢰는 단순 후순위가 아니다. 특히 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS` 이후 슬롯은 아직 작업 필요 상태이며, Global B2C 첫 판매 gate에 포함되는 별도 큰 계획으로 분리해서 다룬다.

## 7. 관련 문서

- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
