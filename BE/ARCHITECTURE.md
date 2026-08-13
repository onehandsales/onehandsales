# Backend Architecture

`BE` is the single NestJS backend for the User API and current Admin Operation API.

Routes:

- User API: `/api/*`
- Admin API: `/admin/api/*`

Active modules:

- `auth`: external auth token exchange, app token refresh/logout, current user lookup, device/session management, login locale/region metadata sync.
- `user`: current user profile, timezone/locale metadata, and registered device lookup.
- `company`: user-owned company, company field/region, memo/private memo logs, linked contacts/deals, soft delete, trash restore, xlsx export.
- `contact`: user-owned contact, company option, department/job grade, memo/private memo logs, linked deals, soft delete, trash restore, xlsx export.
- `business-card`: business card image OCR, scan log, extracted candidate confirmation, company/contact creation or reuse.
- `product`: user-owned product, product category/status, memo/private memo logs, linked deals, soft delete, trash restore, xlsx export.
- `deal`: user-owned deal, company/contact/product links, stage counts, `DealActivity`, following action logs, memo logs, soft delete, trash restore, xlsx export.
- `schedule`: user-owned schedule, month/week list, weekly report/xlsx export, deal links, Google Calendar read-only sync, soft delete, trash restore.
- `meeting-note`: user-owned meeting note, snapshot links, manual CRUD, AI/STT draft, next-action/follow-up draft, saved-note deal linking, soft delete, trash restore.
- `follow-up`: follow-up message draft/send/retry/history, email provider connection, SMS sender number, and consent notice foundation.
- `sales-report`: AI weekly sales report generation, list/detail, and snapshot summary.
- `notification`: notification list/unread/read, settings, browser push subscription, and reminder delivery foundation.
- `analytics`: product analytics client event collection, activation/retention snapshots, and AI usage summary foundation.
- `account-request`: user-facing account deletion and data export request flows.
- `admin-operation`: Admin user/domain read-only operation, sensitive raw access/audit, provider failure, analytics, account/trash/system operation queues.
- `search`: integrated search over company, contact, product, deal, schedule, and meeting note data.
- `trash`: 7-day trash list/detail/restore and recovery request support for supported entities and logs.
- `data-import`: active templates, template xlsx download, DB-backed ImportJob, CSV/XLSX upload, AI column mapping, editable preview validation with cell-scoped validation messages, confirm/cancel/expire import, import logs for company/contact/product/deal.
- `health`: health check endpoint.

Current intentional gaps:

- Generic `/api/exports` and `ExportJob` are not used; exports live in each domain module.
- Paddle/Billing, subscription/payment/tax/invoice/refund, entitlement/paywall, Billing Admin, B2B tenant/team admin, native app packaging, and paid recovery/hard purge policy are deferred.
- Current HTTP confirm wiring passes contact company resolutions, deal company/contact/product resolutions, and row overrides through FE API, DTO, controller, application service, repository, and controller spec.
- Current runtime auth providers are Google, LINE, and Apple. Kakao remains only as a legacy Prisma enum value and is not exposed for runtime exchange.
- Login country metadata depends on proxy geo headers (`cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`). Without those headers, country code fields remain null by design.
- 2026-07-10 verification: `typecheck`, `lint`, `test`, and `build` pass. Backend tests are 17 suites / 82 tests passed.

Auth/session policy:

- Supabase Auth is only the external provider layer. Backend owns the application user, device, session, refresh token, and authorization checks.
- Signup and login share the same token exchange path. An existing `provider + providerUserId` updates last-login metadata; if no provider account exists, a verified email can link the provider account to an existing `User` before creating a new user.
- App access tokens contain `userId` and `sessionId`; `AuthGuard` validates the session against DB state.
- Refresh tokens are stored as hashes in `AuthSession` and rotate on refresh or same-device relogin.
- Current User Web sends either `mobile` or `personal_laptop` device slots. The Backend also supports `work_laptop`, but the current User Web does not use it.

Layer rules:

- `domain`: framework-free domain errors and primitives.
- `application`: use cases, ports, repository interfaces, and transaction orchestration.
- `infrastructure`: Prisma repositories and external provider adapters.
- `presentation`: controllers, DTOs, guards, filters, decorators, and response mapping.

Business modules should continue to be added one module and one migration at a time, following the same layer boundaries.
