# Page API QA Matrix

상태: Active / Ready
작성일: 2026-08-13
기준 코드:

- `FE/user-web/src/app/router/router.tsx`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/user-web/src/features/**/api/*.ts`
- `FE/admin-web/src/features/**/api/*.ts`

## 1. 목적

현재 프론트에서 접근 가능한 페이지를 기준으로, 각 페이지에서 확인해야 할 API와 QA 관점을 정리한다. 실제 QA 중 결과는 `../COMMON/QA-RESULTS.md`에 기록하고, 수정/제거/숨김/보류 판단은 `../COMMON/ISSUE-LOG.md`에 `FIX/IMPROVE/REMOVE/HIDE/DEFER/RETHINK`로 남긴다.

## 2. 공통 API 경계

- User Web은 `apiClient` 또는 `apiBlobClient`로 `/api/*`만 호출해야 한다.
- Admin Web은 `adminApiClient`로 `/admin/api/*`만 호출해야 한다.
- User Web에서 `/admin/api/*`를 호출하면 `InvalidUserWebApiPath`로 차단되어야 한다.
- Admin Web에서 운영 데이터는 일반 `/api/*`가 아니라 `/admin/api/*`로 확인해야 한다.
- URL query, console, error toast, network log에 access token, refresh token, provider secret, email/phone 원문, memo body, meeting note body, admin raw reason이 노출되지 않아야 한다.
- `:id`, `:companyId`, `:contactId` 등은 실제 QA 데이터의 id로 치환한다.

## 3. User Web Public/Auth Pages

| 페이지 | 주요 API | QA |
|---|---|---|
| `/`, `/login`, `/signup`, `/pricing`, `/contact`, `/about`, `/security`, `/terms`, `/privacy` | N/A, localized route로 redirect | legacy public path가 기본 locale path로 이동하는지 확인한다. redirect 후 화면이 깨지지 않고 보호 API를 호출하지 않아야 한다. |
| `/{locale}`, `/{locale}/login`, `/{locale}/signup` | `/api/auth/providers`, `/api/auth/exchange`, `/api/auth/refresh`, `/api/me`, `/api/auth/logout` | provider 버튼 노출, OAuth callback 성공/실패, refresh 성공/실패, 로그인 후 `/app` 진입, 로그아웃 후 보호 route 차단, URL token 노출 없음을 확인한다. |
| `/{locale}/pricing` | N/A | 요금제 CTA가 로그인/가입 흐름으로 연결되는지 확인한다. Paddle/Billing 결제는 현재 `N/A`로 기록한다. |
| `/{locale}/contact`, `/{locale}/about`, `/{locale}/security`, `/{locale}/terms`, `/{locale}/privacy` | N/A | locale별 정적 페이지 렌더링, 모바일 줄바꿈, footer/link 이동, 보호 API 미호출을 확인한다. |
| `/auth/callback` | `/api/auth/exchange`, `/api/me` | 정상 code/state 교환, 잘못된 code/state 오류, callback 후 query 정리, 실패 시 재로그인 동선을 확인한다. |

## 4. User Web Protected Common

| 적용 페이지 | 주요 API | QA |
|---|---|---|
| `/app/*` 전체 | `/api/me`, `/api/auth/refresh`, `/api/analytics/events`, `/api/notifications/unread-count` | access token 없는 접근은 login으로 이동한다. 만료 token은 refresh 후 재시도한다. analytics 실패가 화면을 막지 않는다. 알림 count 실패가 전체 shell을 깨지 않는다. |
| `/app/*` 전역 검색 | `/api/search?query=...` | 회사/담당자/제품/딜/회의록 검색 결과가 표시되고 결과 클릭 시 상세로 이동한다. 삭제된 데이터와 타 사용자 데이터가 일반 검색에 노출되지 않아야 한다. |
| `/app/*` legacy redirect 진입 | legacy `/companies`, `/contacts`, `/products`, `/deals`, `/schedules`, `/meeting-notes`, `/business-cards`, `/import`, `/trash`, `/settings`, `/more` | legacy URL이 대응하는 `/app/*`로 이동하고 id param이 유지된다. redirect 자체는 API QA가 아니라 route QA로 기록한다. |

## 5. User Web App Pages

### `/app`

API:

- `/api/me`
- `/api/sales-reports/weekly`
- `/api/sales-reports/weekly?weekStart=...`
- `/api/sales-reports/weekly/:reportId`
- `/api/sales-reports/weekly/:reportId/snapshot-summary`
- `/api/follow-up-messages?sourceReportId=...`
- `/api/follow-up-messages/drafts`
- `/api/follow-up-messages/:messageId`
- `/api/follow-up-messages/:messageId/send`
- `/api/follow-up-messages/:messageId/retry`

QA:

- 로그인 직후 홈이 로드되고 사용자 기본 locale/timeZone이 반영된다.
- 주간 리포트 생성은 idempotency key 중복 클릭에도 중복 생성되지 않아야 한다.
- 생성 중/실패/완료 상태가 분리되어 보인다.
- snapshot summary와 후속 메시지 목록이 같은 report 기준으로 연결된다.
- 주간 리포트 기반 follow-up 메시지 draft, 수정, 전송, 재시도가 동작한다.
- AI/provider 실패는 안전한 오류 메시지로만 표시한다.

### `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId`

API:

- `/api/companies`, `/api/companies?filters...`
- `/api/companies/:companyId`
- `/api/company-fields`
- `/api/company-regions`
- `/api/companies/:companyId/contacts`
- `/api/companies/:companyId/deals`
- `/api/companies/:companyId/memo-logs`
- `/api/companies/:companyId/private-memo-logs`
- `/api/companies/export/xlsx`

QA:

- 목록 조회, 필터, 검색, pagination, 정렬이 query와 화면 상태를 맞춘다.
- 생성/수정 후 목록과 상세가 최신 데이터로 갱신된다.
- field/region option 생성/삭제가 form과 필터에 반영된다.
- 상세에서 연결된 담당자/딜 목록이 실제 관계와 일치한다.
- 일반 메모와 private memo는 작성/수정/삭제/pagination이 동작하고 권한 경계가 지켜진다.
- 삭제 후 Trash에 표시되고 복구 후 회사 목록/검색/상세에 다시 나타난다.
- XLSX 다운로드는 현재 필터 기준으로 파일명이 내려오고, 실패 시 화면이 멈추지 않아야 한다.

### `/app/contacts`, `/app/contacts/new`, `/app/contacts/new/full`, `/app/contacts/:contactId`

API:

- `/api/contacts`, `/api/contacts?filters...`
- `/api/contacts/:contactId`
- `/api/contacts/:contactId/deals`
- `/api/contacts/company-options`
- `/api/contact-job-grades`
- `/api/contact-departments`
- `/api/contacts/:contactId/memo-logs`
- `/api/contacts/:contactId/private-memo-logs`
- `/api/follow-up-messages?targetType=CONTACT&targetId=...`
- `/api/follow-up-messages/:messageId`
- `/api/follow-up-messages/:messageId/retry`
- `/api/contacts/export/xlsx`

QA:

- 담당자 생성 시 회사 연결/미연결 케이스가 모두 저장된다.
- 직급/부서 option 생성/삭제가 form과 필터에 반영된다.
- email, phone, URL, 긴 이름이 목록/상세/모바일에서 레이아웃을 깨지 않는다.
- 상세의 연결 딜 목록이 실제 관계와 일치한다.
- 일반 메모/private memo 작성/수정/삭제가 권한과 함께 동작한다.
- 담당자 기준 follow-up 메시지 timeline, 상세, 재시도가 동작한다.
- 삭제/복구 후 회사 상세, 딜 상세, 검색 결과 반영을 확인한다.
- XLSX 다운로드가 필터 기준으로 동작한다.

### `/app/products`, `/app/products/new`, `/app/products/new/full`, `/app/products/:productId`

API:

- `/api/products`, `/api/products?filters...`
- `/api/products/:productId`
- `/api/products/:productId/deals`
- `/api/product-categories`
- `/api/product-statuses`
- `/api/products/:productId/memo-logs`
- `/api/products/:productId/private-memo-logs`
- `/api/products/export/xlsx`

QA:

- 제품 생성/수정에서 가격, 통화, 카테고리, 상태가 저장된다.
- 카테고리/상태 option 생성/삭제가 form과 필터에 반영된다.
- 상세의 연결 딜 목록과 금액 표시가 실제 데이터와 일치한다.
- 메모/private memo CRUD와 pagination을 확인한다.
- 연결된 딜/회의록이 있는 제품 삭제 제한 메시지가 안전하게 표시된다.
- 삭제/복구 후 목록, 검색, 연결 화면 반영을 확인한다.
- XLSX 다운로드와 빈 목록 다운로드 실패/성공 메시지를 확인한다.

### `/app/deals`, `/app/deals/new`, `/app/deals/new/full`, `/app/deals/:dealId`

API:

- `/api/deals/stage-counts`
- `/api/deals?filters...`
- `/api/deals/:dealId`
- `/api/deals/company-options`
- `/api/deals/contact-options`
- `/api/deals/product-options`
- `/api/deals/:dealId/activities`
- `/api/deals/:dealId/following-action-logs`
- `/api/deals/:dealId/memo-logs`
- `/api/follow-up-messages?targetType=DEAL&targetId=...`
- `/api/follow-up-messages/:messageId`
- `/api/follow-up-messages/:messageId/retry`
- `/api/deals/export/xlsx`

QA:

- stage count와 목록 필터 결과가 일치한다.
- 회사/담당자/제품 option 선택 후 딜 생성/수정이 저장된다.
- 금액, currency, close date, stage 변경이 목록/상세에 반영된다.
- activity 생성/수정과 following action log 생성/수정/삭제가 timeline에 반영된다.
- 딜 기준 follow-up 메시지 timeline, 상세, 재시도가 동작한다.
- 메모 CRUD와 pagination을 확인한다.
- 연결 일정/회의록이 있는 딜 삭제 제한 메시지를 확인한다.
- 삭제/복구 후 pipeline, 검색, 관련 회사/담당자/제품 상세 반영을 확인한다.
- XLSX 다운로드가 필터 기준으로 동작한다.

### `/app/schedules`, `/app/schedules/week`, `/app/schedules/:scheduleId`

API:

- `/api/schedules?view=...&baseDate=...`
- `/api/schedules/week?weekStart=...`
- `/api/schedules/week/export/xlsx?weekStart=...`
- `/api/schedules`
- `/api/schedules/:scheduleId`
- `/api/schedules/deal-options`
- `/api/schedules/google/connect`
- `/api/schedules/google/status`
- `/api/schedules/google/calendars`
- `/api/schedules/google/sync`
- `/api/schedules/google/disconnect`

QA:

- 월/주/목록 view가 같은 기준일과 timeZone으로 데이터를 표시한다.
- 일정 생성/수정에서 시작/종료 시간, location, meeting URL, memo, 딜 연결이 저장된다.
- `https://`가 아닌 meeting URL은 안전한 validation 메시지로 막힌다.
- 삭제 후 Trash 표시와 복구 후 일정 화면 재노출을 확인한다.
- 주간 리포트 XLSX 다운로드가 현재 week/timeZone 기준으로 동작한다.
- Google Calendar 연결 상태, 연결 시작, callback 결과 query 처리, calendar 선택, 수동/자동 sync, 연결 해제 동작을 확인한다.
- Google provider 환경이 없으면 `BLOCKED` 또는 `N/A`로 기록하고 일반 일정 QA와 분리한다.

### `/app/meeting-notes`, `/app/meeting-notes/new/full`, `/app/meeting-notes/:meetingNoteId`

API:

- `/api/meeting-notes`, `/api/meeting-notes?filters...`
- `/api/meeting-notes/filter-companies`
- `/api/meeting-notes/filter-contacts`
- `/api/meeting-notes/:meetingNoteId`
- `/api/meeting-notes/ai-draft`
- `/api/meeting-notes/stt-draft`
- `/api/meeting-notes/:meetingNoteId/next-actions/draft`
- `/api/meeting-notes/:meetingNoteId/follow-up-draft`
- `/api/meeting-notes/:meetingNoteId/deals`

QA:

- 목록 필터, 검색, create query `?create=1`, 전체 작성 화면 진입을 확인한다.
- 회사/담당자/제품/딜 연결을 포함한 수동 회의록 생성/수정이 저장된다.
- AI draft, STT draft, next action draft, follow-up draft는 성공/실패/재시도 상태가 분리된다.
- follow-up draft 결과가 follow-up 메시지 작성/전송 흐름과 연결된다.
- meeting note body가 console이나 admin 기본 목록에 원문 노출되지 않는다.
- 삭제/복구 후 목록, 검색, 딜 활동 반영을 확인한다.

### `/app/business-cards`

API:

- `/api/business-card-scans`
- `/api/business-card-scans/:scanLogId`
- `/api/business-card-scans/:scanLogId/confirm`

QA:

- 이미지 업로드, 진행 중, 성공, 실패 상태가 분리되어 보인다.
- OCR 결과 수정 후 회사/담당자 생성 또는 기존 데이터 연결이 저장된다.
- provider failure는 사용자에게 안전한 메시지만 노출한다.
- 중복 confirm, 실패 scan 재시도, 잘못된 파일 형식/용량 제한을 확인한다.
- 생성된 회사/담당자가 각 목록과 검색에 노출된다.

### `/app/notifications`

API:

- `/api/notifications`
- `/api/notifications/:notificationId/read`
- `/api/notifications/unread-count`
- `/api/notifications/settings`
- `/api/notifications/browser-push/public-key`
- `/api/notifications/browser-subscriptions`
- `/api/notifications/browser-subscriptions/:subscriptionId`

QA:

- 전체/읽음/안 읽음 필터와 pagination을 확인한다.
- 알림 읽음 처리 후 목록과 shell unread count가 함께 갱신된다.
- browser push public key 조회, 권한 허용/거부, subscription 생성/삭제를 확인한다.
- 브라우저가 push를 지원하지 않는 경우 기능이 막히지 않고 안내된다.
- 예정 알림 포함 여부가 query와 화면에 맞게 반영된다.

### `/app/import`, `/app/import/review/:importJobId`, `/app/import/:importUserLogId`

API:

- `/api/import-templates/active`
- `/api/import-templates/:templateId/download`
- `/api/imports/active`
- `/api/imports`
- `/api/imports/:importJobId`
- `/api/imports/:importJobId/map`
- `/api/imports/:importJobId/mapping`
- `/api/imports/:importJobId/rows`
- `/api/imports/:importJobId/validate`
- `/api/imports/:importJobId/confirm`
- `/api/imports/:importJobId/cancel`
- `/api/imports/:importJobId/errors`
- `/api/import-user-logs`
- `/api/import-user-logs/:importUserLogId`

QA:

- 템플릿 목록과 언어별 템플릿 다운로드가 정상 동작한다.
- 파일 업로드 후 active job 표시, mapping 자동 생성, mapping 수동 수정, row 수정, validation error 표시를 확인한다.
- confirm은 idempotency 기준으로 중복 저장되지 않아야 한다.
- cancel 후 active job에서 사라지고 review route 재접근 시 안전한 상태가 표시된다.
- import 결과가 회사/담당자/제품/딜 목록에 실제로 생성된다.
- import user log 상세에서 template column, row result, error가 보인다.
- `/api/exports*` generic export API는 코드에는 있으나 `/app/export`가 `/app`으로 redirect되므로 현재 페이지 QA는 `N/A`로 기록한다.

### `/app/trash`

API:

- `/api/trash`
- `/api/trash/:targetType/:targetId`
- `/api/trash/:targetType/:targetId/restore`
- `/api/trash/recovery-requests`

QA:

- domain/status/filter/pagination이 실제 Trash 데이터와 일치한다.
- Trash 상세에서 삭제 시각, 만료 시각, 삭제 사유 또는 관계 상태가 안전하게 표시된다.
- 복구 가능한 항목은 restore 후 원래 목록/상세/검색에 다시 나타난다.
- 복구 불가능/만료/관계 충돌은 안전한 오류 메시지로 표시된다.
- 복구 요청 생성 후 관리자 `trash/recovery-requests` queue에 표시되는지 확인한다.

### `/app/settings`

API:

- `/api/users/me/profile`
- `/api/users/me/devices`
- `/api/users/me/data-export-requests`
- `/api/users/me/data-export-requests/:requestId`
- `/api/users/me/account-deletion-requests`
- `/api/users/me/account-deletion-requests/:requestId/cancel`
- `/api/schedules/google/status`
- `/api/schedules/google/connect`
- `/api/schedules/google/calendars`
- `/api/schedules/google/disconnect`
- `/api/follow-up-delivery/settings`
- `/api/follow-up-delivery/email-connections/:provider/connect`
- `/api/follow-up-delivery/email-connections/:connectionId/disconnect`
- `/api/follow-up-delivery/sms-sender-numbers`
- `/api/follow-up-delivery/sms-sender-numbers/:senderNumberId/verify`
- `/api/follow-up-delivery/sms-sender-numbers/:senderNumberId/revoke`
- `/api/follow-up-delivery/consent-notices/:channel/acknowledge`
- `/api/notifications/settings`

QA:

- profile name, locale, timeZone, country, currency 수정 후 reload에도 유지된다.
- device 목록에서 현재 기기와 active session count가 안전하게 표시된다.
- data export 요청 생성/상세/다운로드 URL 노출 조건을 확인한다.
- account deletion 요청 생성과 cancel이 상태를 올바르게 바꾼다.
- Google Calendar 설정은 일정 페이지의 연결 상태와 같은 데이터를 보여야 한다.
- follow-up email 연결/해제, SMS 발신번호 요청/인증/철회, consent acknowledge가 상태에 반영된다.
- notification 설정 수정이 알림 페이지와 push subscription 흐름에 반영된다.
- provider 연결 callback URL과 오류 메시지에 secret/token이 노출되지 않아야 한다.

### `/app/more`

API:

- `/api/auth/logout`
- 필요 시 `/api/me`

QA:

- 모바일/작은 화면에서 보조 메뉴가 주요 페이지로 이동한다.
- logout 후 access token이 제거되고 `/app/*` 재접근이 차단된다.
- 현재 숨긴 기능인 billing/export/admin 진입 링크가 사용자에게 노출되지 않는지 확인한다.

## 6. User Web Redirect/Inactive Pages

| route | 현재 동작 | QA |
|---|---|---|
| `/app/contacts/scan`, `/contacts/scan` | `/app/business-cards`로 redirect | 명함 OCR로 이동하고 contacts scan 전용 API를 호출하지 않는다. |
| `/app/meeting-notes/new`, `/meeting-notes/new` | `/app/meeting-notes?create=1`로 redirect | 회의록 생성 dialog 또는 생성 진입 상태가 열린다. |
| `/app/export`, `pages/export/index.tsx` | `/app`로 redirect, page file은 router 미연결 | generic `/api/exports*` 호출이 발생하지 않아야 한다. export 기능을 다시 열 때만 별도 QA를 만든다. |
| legacy `/companies/*`, `/contacts/*`, `/products/*`, `/deals/*`, `/schedules/*`, `/meeting-notes/*`, `/business-cards`, `/import/*`, `/trash`, `/settings`, `/more` | 대응하는 `/app/*`로 redirect | id param 유지, query 처리, 보호 route guard를 확인한다. |

## 7. Admin Web Pages

Admin Web의 실제 요청 URL은 모두 `/admin/api` prefix가 붙는다. 아래 API는 client path 기준으로 적는다.

### `/login`

API:

- `/me`

QA:

- admin token이면 `/` 보호 화면에 진입한다.
- token 없음/만료 token/일반 사용자 token은 차단된다.
- mock continue 버튼이나 개발용 우회가 노출되지 않아야 한다.
- 실패 메시지에 token 또는 raw auth response가 노출되지 않아야 한다.

### `/`

API:

- `/me`

QA:

- AdminShell과 navigation이 로드된다.
- 현재 index는 placeholder이므로 운영 데이터 API 호출은 없어야 한다.
- 새로고침 후에도 admin 권한 guard가 유지된다.

### `/users`

API:

- `/users`

QA:

- 사용자 목록 pagination, search, status/role/provider/date filter가 query와 일치한다.
- 기본 목록은 masked email/name 등 필요한 운영 정보만 보여야 한다.
- 일반 사용자 token 또는 User Web token으로 접근 시 403/차단된다.

### `/users/:userId`

API:

- `/users/:userId`
- `/users/:userId/activity-timeline`

QA:

- 사용자 overview, domain count, account status, provider 정보가 표시된다.
- activity timeline cursor/filter가 동작한다.
- overview에 포함된 trash summary panel과 `/users/:userId/trash` 이동 링크가 동작한다.
- raw email/phone/memo/body는 기본 상세에 노출되지 않아야 한다.

### `/users/:userId/domain`

API:

- `/users/:userId/domain-records`
- `/sensitive/raw-access`

QA:

- domain type별 회사/담당자/제품/딜/일정/회의록 read-only 목록이 표시된다.
- 삭제 상태, trash 만료 정보, relation summary가 안전하게 표시된다.
- 민감 원문 조회는 10자 이상 사유 입력이 필요하다.
- 원문 조회 성공 후 `/audit-logs`에서 sensitive raw access 로그가 확인되어야 한다.
- console이나 table 기본 row에 원문 body/reason이 남지 않아야 한다.

### `/users/:userId/trash`

API:

- `/users/:userId/trash-summary`
- `/users/:userId/trash-records`

QA:

- 사용자별 Trash summary와 record 목록이 domain/status/filter와 일치한다.
- 삭제/만료/복구 가능 상태가 운영자가 판단할 수 있게 표시된다.
- Admin 화면에서 직접 사용자 데이터를 복구하는 mutation이 노출되지 않는지 확인한다.

### `/provider-failures`

API:

- `/provider-failures`
- `/provider-failures/:failureId`

QA:

- provider/type/status/retryable/date filter와 pagination을 확인한다.
- 상세는 safe payload만 표시하고 provider secret, access token, 원문 응답 body를 노출하지 않는다.
- 사용자가 본 안전한 오류 메시지와 운영 failure record가 연결되는지 확인한다.

### `/account-requests`

API:

- `/account-deletion-requests`
- `/data-export-requests`

QA:

- 계정 삭제 요청과 데이터 export 요청 queue가 status/date filter와 함께 표시된다.
- 사용자 설정 화면에서 만든 요청이 Admin queue에 나타난다.
- 다운로드 URL, 처리 상태, 만료 시각이 필요한 범위만 표시된다.
- 현재 화면에 처리 mutation이 없다면 read-only로 `N/A` 처리한다.

### `/trash/recovery-requests`

API:

- `/trash/recovery-requests`

QA:

- 사용자 Trash 화면에서 만든 복구 요청이 queue에 나타난다.
- target type/id, status, requestedAt, expiresAt 표시가 실제 데이터와 일치한다.
- 직접 restore mutation이 없다면 read-only로 기록한다.

### `/analytics`

API:

- `/analytics/overview`

QA:

- date range와 timeZone query가 overview 수치에 반영된다.
- activation, retention, AI usage, mobile usage 등 카드 수치가 빈 데이터/부분 데이터에서도 깨지지 않는다.
- analytics API 실패가 다른 admin 화면의 권한 상태를 오염시키지 않는다.

### `/audit-logs`

API:

- `/audit-logs`
- `/sensitive/raw-access`

QA:

- adminUserId, targetUserId, action, result, from/to filter가 동작한다.
- `/users/:userId/domain`에서 민감 원문 조회 후 감사 로그가 생성되는지 확인한다.
- 감사 로그 실패/거부/성공 상태가 구분된다.
- raw reason과 raw response body가 console에 직접 노출되지 않아야 한다.

### `/system`

API:

- `/system/operation-checks/latest`
- `/system/operation-checks`

QA:

- 최신 운영 gate 결과가 없을 때 empty state가 표시된다.
- 새 operation check 생성 시 environment, status, items, notes가 저장된다.
- 결과 status `PASS/WARN/FAIL` 표시가 명확해야 한다.
- notes/items에 secret 값이 들어가지 않도록 입력과 표시를 점검한다.

## 8. Admin Redirect/Inactive Pages

| route | 현재 동작 | QA |
|---|---|---|
| `/organizations`, `pages/organizations/index.tsx` | `/`로 redirect, page file은 router 미연결 | organization 전용 API를 호출하지 않는다. |
| `/subscriptions`, `pages/subscriptions/index.tsx` | `/`로 redirect, page file은 router 미연결 | billing/subscription Admin API는 현재 `N/A`로 기록한다. |
| `/support`, `pages/support/index.tsx` | `/`로 redirect, page file은 router 미연결 | support 전용 API를 호출하지 않는다. |
| `pages/dashboard/index.tsx` | router 미연결 | `/dashboard` route와 `/admin/api/dashboard`는 현재 페이지 QA 대상이 아니다. 다시 화면에 연결할 때 별도 QA를 만든다. |
| `features/admin-query` legacy API | router에 직접 연결되지 않음 | `/dashboard`, `/companies`, `/contacts`, `/products`, `/deals`, `/sensitive/raw` 등 legacy helper는 현재 페이지 QA 대상이 아니다. 다시 화면에 연결할 때 별도 QA를 만든다. |

## 9. 페이지별 QA 기록 방식

각 페이지 QA는 아래 형식으로 `../COMMON/QA-RESULTS.md`에 남긴다.

```markdown
### 2026-08-13 - User Web `/app/companies`

- 환경: local BE + local DB / Chrome desktop 1440px
- API: `/api/companies`, `/api/company-fields`, `/api/company-regions`, `/api/companies/:companyId`
- 결과: PASS / FAIL / BLOCKED / N/A
- 기능 판단: KEEP / FIX / IMPROVE / REMOVE / HIDE / DEFER / RETHINK
- 메모:
  - 생성/수정/삭제/복구 확인:
  - UX/UI 불편:
  - ISSUE-LOG 연결:
```

## 10. 추천 수동 QA 순서

1. 로그인과 `/app` 보호 route를 먼저 확인한다.
2. 회사 -> 담당자 -> 제품 -> 딜 -> 일정 -> 회의록 순서로 기본 CRUD와 관계를 만든다.
3. 만든 데이터로 Search, Export/XLSX, Import, Trash 복구를 확인한다.
4. Settings에서 profile, notification, Google Calendar, follow-up delivery, account request를 확인한다.
5. Admin Web에서 방금 만든 사용자 데이터가 read-only로 보이고, 민감 원문 조회와 audit log가 남는지 확인한다.
6. 마지막에 redirect/inactive route가 의도대로 숨겨져 있는지 확인한다.
