# Current Implemented Functions

상태: Draft Guide
기준: 2026-07-20 현재 코드와 AGENT 구현 상태 문서

## 1. 구현 완료/부분 완료 표

| 영역 | Backend 구현 | User Web 구현 | Admin Web 구현 | 현재 판단 |
|---|---|---|---|---|
| Auth/User | `/api/auth/providers`, exchange, refresh, logout, `/api/me`, profile, devices | Google OAuth login/signup, protected route, settings/profile/devices | `/admin/api/me` 기반 보호 route | User Web 완료, Admin auth만 부분 완료 |
| Public/auth locale | Backend 직접 없음 | `/{locale}`, `/{locale}/login`, signup/pricing/contact/about/security/terms/privacy, legacy redirect | N/A | 완료 |
| Home | Schedule/Deal/MeetingNote API 조합 | `/app` dashboard | N/A | 완료 |
| Company | list/detail/create/update/delete, field/region, memo/private memo, contacts/deals, xlsx export, trash | 목록, 상세, 생성 패널, 수정, 삭제/복구, export | N/A | 완료 |
| Contact | list/detail/create/update/delete, company/job grade/department, memo/private memo, deals, xlsx export, trash | 목록, 상세, 생성, 수정, 삭제/복구, export | N/A | 완료 |
| Product | list/detail/create/update/delete, category/status, memo/private memo, dealCount/sort, deals, xlsx export, trash | 목록, 상세, 생성, 수정, 삭제/복구, export | N/A | 완료 |
| Deal | list, stage counts, detail/create/update/delete, company/contact/product options, following action, memo, xlsx export, trash | pipeline/list/detail/create/update, stage tabs, linked records, next action, memo, export | N/A | 완료 |
| Schedule | deal options, list/detail/create/update/delete, timezone 처리 | `/app/schedules`, detail, form, 월간/목록 | N/A | 기본 완료. week report는 후속 |
| MeetingNote | list/detail/create/update/delete, AI draft, STT draft, add deal link, trash | 목록, 상세, 작성, AI/STT draft UI, 딜 연동, 삭제/복구 | N/A | 완료 |
| BusinessCard OCR | `/api/business-card-scans`, scan/confirm/log/status | `/app/business-cards`, 이미지 업로드, 명함스캔, 확인/수정, 저장 | N/A | 완료 |
| DataImport | import templates, uploads, mapping, confirm, import logs. pre-confirm job은 in-memory | `/app/import`, template download, CSV/XLSX upload, AI mapping, row edit/validation, confirm, log detail | N/A | 기본 완료. persistence는 후속 |
| Search | `GET /api/search` | GlobalSearch, loading/empty/error, result navigation | N/A | 완료 |
| Trash | `/api/trash`, detail, restore | `/app/trash`, list/detail modal/restore | N/A | 7일 이내 복구 완료 |
| Domain export | Company/Contact/Product/Deal xlsx endpoint | 각 목록 `엑셀 다운로드` | N/A | 완료 |
| Notification | Backend 없음 | `/app/notifications`는 `/app` redirect, feature/page 잔존 | N/A | 후속 |
| Generic ExportJob | 없음. 현재 제품 정본 아님 | `/app/export`는 `/app` redirect | N/A | 제외/후속 결정 필요 |
| Admin operation | `/admin/api/me`만 있음 | N/A | 운영 route는 root redirect | 후속 |
| Payment/subscription | 없음 | pricing public page는 있음 | Admin subscription route redirect | 후속 |
| Product analytics | 없음 | 없음 | analytics route redirect | 후속 |

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
| `/app/schedules/week` | `/app/schedules` redirect |
| `/app/meeting-notes`, `/app/meeting-notes/new`, `/app/meeting-notes/new/full`, `/app/meeting-notes/:meetingNoteId` | 구현 |
| `/app/business-cards` | 구현 |
| `/app/import`, `/app/import/:importUserLogId` | 구현 |
| `/app/trash`, `/app/settings`, `/app/more` | 구현 |
| `/app/notifications` | `/app` redirect |
| `/app/export` | `/app` redirect |

## 3. Admin Web 실제 라우트 상태

| 라우트 | 상태 |
|---|---|
| `/login` | 구현 |
| `/` | Admin placeholder |
| `/users`, `/users/:userId` | `/` redirect |
| `/organizations` | `/` redirect |
| `/subscriptions` | `/` redirect |
| `/analytics` | `/` redirect |
| `/audit-logs` | `/` redirect |
| `/system` | `/` redirect |
| `/support` | `/` redirect |

## 4. 현재 구현 상태의 의미

- 개인 영업자 MVP 핵심 루프는 대부분 구현되어 있다.
- 그러나 이 MVP 상태는 판매 기준이 아니다.
- 첫 판매 기준은 Global B2C 유료 판매 가능형이며, 현재 제품에는 결제/구독, Admin 운영, 앱 내부 다국어, 세금/컴플라이언스, 제품 분석, 운영 신뢰 계층이 아직 부족하다.
- 제품화 gap은 "API가 없어서 화면을 못 만든다"보다 "현재 핵심 루프를 Global B2C 첫 판매 gate까지 어떤 순서로 끌어올릴지"에 가깝다.
- 따라서 다음 계획은 MVP 기능 추가 목록이 아니라 Global B2C 첫 판매 기준 대비 gap을 먼저 정리해야 한다.
