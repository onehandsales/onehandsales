# Implementation Status

이 문서는 현재 `BE`, `FE/user-web`, `FE/admin-web`, `FE/mobile-app` 기준 구현 완료/부분 완료/후속 범위를 정리하는 AGENT 정본 문서다.

외부 보조 문서나 `UX Design` 아래 현황 문서가 이 문서와 충돌하면 이 문서를 우선한다. 구현 상태가 바뀌면 이 문서를 먼저 갱신하고, 필요한 경우 `MVP_SCOPE.md`, `PRD.md`, Software/UXUI 문서를 함께 갱신한다.

기준일: 2026-08-11
모바일 앱 범위 기준일: 2026-09-03

## 0. 2026-08-11 Closeout 기준

`TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 기준 Global B2C 01~11 기능 선구현 로드맵은 완료 archive로 닫았다. `TODO/DONE/NEXT_BACKEND_API_BACKLOG_PLAN`과 `TODO/DONE/USER_WEB_PRODUCTIZATION_GAP_PLAN`도 완료/이관 archive다.

01~11 각 완료 기능의 세부 범위, API/DB/FE 경계, 제외 범위는 `GLOBAL_B2C_01_11_FEATURE_CATALOG.md`를 따른다.

기존 12 Billing/Subscription/Tax는 즉시 구현하지 않고 `TODO/PADDLE_PLAN`으로 분리했다. Paddle/Billing은 기능 유지보수, UX/UI 상품성 개선, 결제창 없는 100명 베타, 가격/플랜/entitlement/AI 사용량 제한/환불/세금/인보이스 정책 확정 이후 다시 착수한다.

현재 다음 작업은 Paddle checkout 구현이 아니라 제품 유지보수와 UX/UI 상품성 개선이다.

## 1. 완료 기준

이 문서에서 완료는 Backend API가 있고 Frontend가 실제 API와 연결된 상태를 의미한다.

부분 완료는 화면, route, type, API client, placeholder가 있으나 Backend API가 없거나 제품 정본 흐름이 아닌 상태를 의미한다.

후속은 현재 MVP 정본 범위 밖이거나 별도 계획이 필요한 기능을 의미한다.

## 2. 완료된 기능

| 기능 | Backend | Frontend | 현재 상태 |
| --- | --- | --- | --- |
| Auth/User | 완료 | 완료 | 로그인 provider, token exchange/refresh/logout, `/api/me`, 내 프로필, 기기 목록, settings 흐름 |
| Admin auth | 완료 | 완료 | `GET /admin/api/me`, AdminGuard, Admin Web admin/non-admin 보호 route. 운영 화면 foundation은 Admin Operation 범위에서 완료 |
| Public site | 해당 없음 | 완료 | URL locale canonical 공개/인증 진입면. `/{locale}`, `/{locale}/login`, `/{locale}/signup`, `/{locale}/pricing`, `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy` |
| Home | 완료 API 조합 | 완료 | Schedule/Deal/MeetingNote 데이터를 조합한 `/app` 대시보드 |
| Company | 완료 | 완료 | 목록/검색/필터/정렬/page, 생성/상세/수정/삭제, 분야/지역 taxonomy, 메모/개인 메모, Trash 복구, xlsx export |
| Contact | 완료 | 완료 | 목록/검색/필터/정렬/page, 생성/상세/수정/삭제, 부서 taxonomy, 회사 연결, Trash 복구, xlsx export |
| BusinessCard OCR | 완료 | 완료 | `BusinessCardScanLog`, `/api/business-card-scans`, OpenAI strict JSON schema OCR, OCR 성공/실패/확정 로그, 상태 다중 필터, `명함스캔` 진행 표시, 확인/수정 후 회사/담당자 확정 저장, `/app/business-cards` 명함 스캔 화면 |
| Product | 완료 | 완료 | 목록/검색/필터/정렬/page, 생성/상세/수정/삭제, 카테고리/상태 taxonomy, Trash 복구, xlsx export |
| Deal | 완료 | 완료 | 파이프라인/목록/상세, 생성/수정/삭제, 6단계 stage, 회사/담당자/제품 연결, stage counts, 활동 로그, Trash 복구, xlsx export |
| Schedule | 완료 | 완료 | 일정 목록/캘린더, 생성/상세/수정/삭제, Google Calendar read-only sync, soft delete/Trash 복구 |
| MeetingNote | 완료 | 완료 | 수동 CRUD, AI draft, STT draft, 저장 후 딜 연동, 삭제/Trash 복구 |
| Search | 완료 | 완료 | Backend `GET /api/search`와 User Web GlobalSearch 연결 |
| Trash | 완료 | 완료 | `/api/trash` 목록, 상세, 복구. Company/Contact/Product/Deal/Schedule/MeetingNote와 지원 로그의 7일 이내 복구 |
| DataImport / ImportJob | 완료 | 완료 | `ImportTemplate`, `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`, 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 확정 전 job 재개, confirm/cancel/expire, 확정 저장, `ImportUserLog` 목록/상세 |
| Domain export | 완료 | 완료 | Company/Contact/Product/Deal 각 도메인별 xlsx 다운로드 |
| Notification / Reminder | 완료 | 완료 | 알림 설정, 알림 목록/읽음, 일정 시작 reminder, 딜 마감 reminder, browser push subscription foundation, delivery attempt 기록 |
| Weekly Schedule Report | 완료 | 완료 | 주간 일정 보고서 API/User Web 및 XLSX export foundation |
| Google Calendar Integration | 완료 | 완료 | Google Calendar 연결, calendar source 선택, read-only import/sync foundation |
| AI Weekly Sales Report / Follow-up | 완료 | 완료 | 저장형 AI weekly report, suggestion, follow-up draft/send/retry/timeline, Gmail/Microsoft email provider adapter와 provider smoke closeout |
| Deal Activity Timeline | 완료 | 완료 | `DealActivity` 기반 deal activity timeline, record summary subset, 기존 next action/memo log와 연결 |
| MeetingNote AI Provider Log | 완료 | 완료 | `AiProviderCallLog`, 회의록 AI provider log, next action/follow-up draft 고도화 |
| Global Data / I18N | 완료 | 완료 | 사용자 global settings, `/app` i18n foundation, currency/phone/region/address, import/export localization, Google/LINE/Apple auth foundation |
| Product Analytics | 완료 | 완료 | `ProductAnalyticsEvent`, activation snapshot, retention cohort snapshot, server/client event foundation, Admin analytics overview |
| Mobile Field Use | 완료 | 완료 | 모바일 브라우저 현장 입력성, business card mobile capture/failure contract, meeting note mobile recording, local draft, push permission UX, mobile analytics event foundation |
| Admin Operation | 완료 | 완료 | Admin audit/security foundation, user/domain readonly operation, trash/account data request, provider failure operation, admin analytics overview, system operation gate. Billing Admin은 제외 |

## 2A. 2026-07-10 QA 및 라우팅 상태

2026-07-10 기준 현재 완료된 품질 확인은 다음이다.

- 핵심 업무 happy path 1회 재검증 완료: 로그인, 회사, 담당자, 제품, 딜, 일정, 회의록, 명함 OCR, Import, Search, Trash, Domain XLSX Export, 설정/더보기.
- 현재 노출 언어 기준 URL locale smoke 대상: `ko`, `en-us`, `en-ca`. `ja`, `en-gb`, `en-sg`, `en-au`는 추후 확장 후보로만 보류한다.
- 기존 `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy`는 선호 locale URL로 redirect한다.
- `/auth/callback`은 locale prefix 없이 유지한다.
- 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 Supabase OAuth authorize URL을 열고, popup이 차단되면 기존 full-page redirect로 fallback한다.
- `/app/*`는 locale prefix를 붙이지 않고, 비로그인 접근 시 선호 locale의 login URL로 이동한다.
- 회사/담당자/제품/딜 생성은 목록 맥락의 `/app/<domain>/new`와 page-mode 확장 route `/app/<domain>/new/full`을 함께 지원한다. 회의록은 `/app/meeting-notes/new`가 `?create=1`로 redirect하고 `/app/meeting-notes/new/full`이 page-mode 작성 route다.
- Backend `typecheck`, `lint`, `test`, `build` 통과. BE test는 17 suites / 82 tests passed.
- FE/user-web `typecheck`, `lint`, `build`, `test:e2e` 통과.
- FE/admin-web `typecheck`, `lint`, `build` 선택 점검 통과. 2026-08-09 G05 closeout 기준 현재 Admin route smoke E2E도 통과 상태로 기록되어 있다.

출시 전 남은 품질 범위는 UX/UI 공통 QA, 모바일 브라우저 QA, Chrome/Edge 브라우저 QA, 다중 계정 보안 QA, DB/Prisma/migration 운영 정합성 확인이다.

## 3. Domain Export 정본

Export는 범용 `/api/exports` job이나 `ExportJob` table로 처리하지 않는다. 현재 정본은 각 도메인 목록 화면의 동기 xlsx 다운로드다.

| 도메인 | API | User Web 표시 문구 |
| --- | --- | --- |
| Company | `GET /api/companies/export/xlsx` | `엑셀 다운로드` |
| Contact | `GET /api/contacts/export/xlsx` | `엑셀 다운로드` |
| Product | `GET /api/products/export/xlsx` | `엑셀 다운로드` |
| Deal | `GET /api/deals/export/xlsx` | `엑셀 다운로드` |

도메인 구분은 버튼 문구가 아니라 사용자가 보고 있는 목록 화면과 호출 API로 판단한다. FE icon action의 tooltip/aria-label은 공통 `엑셀 다운로드`를 사용한다.

## 4. 부분 완료 또는 주의 필요

| 기능 | 현재 상태 | 판단 |
| --- | --- | --- |
| Admin Billing | 11 Admin Operation은 완료됐지만 subscription/payment/refund/invoice/Billing Admin은 포함하지 않았다 | `TODO/PADDLE_PLAN`에서 Paddle confirmed scope 이후 구현 |
| Generic Export route | `features/import-export` 코드는 남아 있으나 User Web `/app/export`는 `/app`으로 redirect한다 | 현재 제품 정본이 아니며 신규 확장 금지 |
| Mobile App auth foundation | 2026-09-03 기준 `MOBILE_AGENT` 문서와 PM 결정으로 1차 범위 확정 | 로그인/회원가입, 모바일 인증 exchange/refresh/logout, `/api/me`, 최소 홈, 로그아웃만 우선. CRM 전체 화면은 후속 |
| PWA/native CRM | 10 Mobile Field Use는 모바일 브라우저와 field-use foundation 완료 범위다 | install/offline shell, native CRM, native push/contact/calendar는 후속 |
| B2B tenant admin | 11 Admin Operation은 Global B2C 개인 사용자 운영 기준이다 | team/B2B 조직 관리와 seat billing은 후속 전략 후보 |

## 5. 미완성 또는 후속 기능

| 기능 | 현재 상태 | 후속 작업 |
| --- | --- | --- |
| Billing/Paddle | 구현 보류 | `TODO/PADDLE_PLAN` gate 충족 후 Paddle Billing/Checkout, subscription, tax, invoice, refund, entitlement, paywall 구현 |
| Billing Admin | 11 Admin 완료 범위에서 제외 | Paddle/Billing scope 확정 후 subscription/payment/refund/invoice 운영 화면/API 구현 |
| Generic ExportJob | 현재 제품 방향에서 제외 | 신규 구현하지 않음. 필요 시 별도 결정 필요 |
| Advanced DealActivity / B2B activity | Global B2C 개인 사용자 기준 DealActivity foundation은 완료 | Company/Contact/Product 전체 latest summary, team CRM식 timeline은 후속 전략 후보 |
| 7일 이후 복구 | 7일 이내 Trash 복구는 완료. 7일 이후 복구 없음 | 유료 복구/운영 복구 정책 확정 후 구현 |
| Permanent delete 운영 API | 사용자/Admin 즉시 완전 삭제 API 없음 | 보존 정책, 감사 로그, 권한 정책 확정 후 구현 |
| Sensitive export | 민감 데이터 포함 export 없음 | 마스킹, 경고, 감사 로그, 권한 정책과 함께 구현 |

## 5A. 글로벌 B2C 유료 판매/Series A 관점의 미완성 영역

2026-08-11 Global B2C closeout 기준으로, 01~11 기능 foundation은 완료됐지만 결제/구독/세금과 베타 검증 전이므로 아직 글로벌 B2C 유료 판매나 Series A급 제품/사업 상태로 보지 않는다.

글로벌 B2C 유료 판매 전 미완성 영역:

| 영역 | 현재 상태 | 필요한 상태 |
| --- | --- | --- |
| 결제/구독 | 구현 없음 | 무료체험, 월간/연간 구독, 국가별 가격, 환불, 결제 실패 복구, 영수증/인보이스 |
| 세금/컴플라이언스 | 구현 없음 | VAT/GST/판매세 또는 Merchant of Record 처리, chargeback 대응 |
| `/app` 다국어 | 08_GLOBAL_DATA_I18N 완료 기준 `ko-KR`, `en` 1차 지원 | 실제 판매 시장별 추가 앱 내부 locale, 국가별 UX writing |
| 다국가 데이터 모델 | 08_GLOBAL_DATA_I18N 완료 기준 KR/US 전화번호, 국가/지역, KRW/USD, locale export 1차 지원 | KR/US/CA 전략에 맞춘 CA/CAD/캐나다 전화번호/회사 지역 확장 및 이후 국가 확장 |
| Admin 운영 | 11 Admin Operation 완료. Billing Admin 제외 | 고객 지원 운영을 실제 베타/유료 운영 흐름에 맞게 다듬고, 구독/결제 운영은 Paddle 이후 연결 |
| 제품 분석 | 09 Product Analytics와 11 Admin analytics foundation 완료 | paid conversion, churn, ARPU, LTV/CAC, billing funnel, AI cost/user는 Paddle/Billing 이후 확정 |
| 정책/신뢰 문서 | 기본 문서 있음 | 계정 삭제, 데이터 export, 환불, 개인정보, 보안 문구의 실제 판매 범위 정합성 |

Series A급으로 가기 위한 미완성 영역:

- Notification/Reminder 리텐션 루프 고도화
- 주간 영업 리포트 고도화
- AI next action/follow-up/딜 리스크 추천 고도화
- 모바일 현장 입력, 명함 촬영, 음성 기록, push reminder
- DealActivity timeline 고도화
- Google Calendar write/watch/export 고도화
- 결제/paywall 실험
- 제품 분석과 unit economics 고도화
- Admin 운영과 보안/감사 신뢰 체계 고도화

현재 바로 다음 작업은 Paddle 구현이 아니라 기능 유지보수, UX/UI 상품성 개선, 결제창 없는 100명 베타 준비다.

## 6. Admin 정본 상태

관리자 페이지와 운영 API foundation은 11 Admin Operation에서 완료했다. 단, Billing Admin은 포함하지 않는다.

현재 완료된 Admin 범위:

- Backend `GET /admin/api/me`
- AdminGuard 기반 관리자 권한 확인
- Admin audit/security foundation
- Admin user overview
- Admin domain readonly tabs
- Trash retention/recovery operation
- Provider failure operation
- Admin analytics overview
- Account data requests
- System operation gate
- Admin provider failure pagination 보정

후속 Admin 범위:

- Billing Admin: subscription, payment, invoice, refund, failed payment, entitlement 운영
- B2B tenant/team admin
- 운영 mutation 확대
- 유료 복구/영구 삭제 정책과 연결된 고위험 action
- Paddle/Billing 이후 구독 상태와 결제 이슈 고객 지원

## 7. 관련 정본 문서

- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_01_11_FEATURE_CATALOG.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/PM_AGENT/DECISIONS/032_mobile_auth_foundation_scope.md`
- `AGENT/PM_AGENT/DECISIONS/030_global_b2c_closeout_and_paddle_defer.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`
- `TODO/PADDLE_PLAN/README.md`
