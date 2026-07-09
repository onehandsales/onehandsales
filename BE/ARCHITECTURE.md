# Backend Architecture

`BE` is the single NestJS backend for the User API and the limited current Admin API.

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
- `deal`: user-owned deal, company/contact/product links, stage counts, following action logs, memo logs, soft delete, trash restore, xlsx export.
- `schedule`: user-owned schedule, month/week list, deal links, hard delete.
- `meeting-note`: user-owned meeting note, snapshot links, manual CRUD, AI/STT draft, saved-note deal linking, soft delete, trash restore.
- `search`: integrated search over company, contact, product, deal, schedule, and meeting note data.
- `trash`: 7-day trash list/detail/restore for supported entities and logs.
- `data-import`: active templates, template xlsx download, CSV/XLSX upload, AI column mapping, editable preview validation, confirm import, import logs for company/contact/product/deal.
- `health`: health check endpoint.

Current intentional gaps:

- Admin operation APIs are limited to `GET /admin/api/me`.
- Generic `/api/exports` and `ExportJob` are not used; exports live in each domain module.
- Persistent ImportJob recovery, Notification, Admin audit/sensitive raw access, and generic DealActivity are future scope.
- Current HTTP confirm wiring passes contact company resolutions, deal company/contact/product resolutions, and row overrides through FE API, DTO, controller, application service, repository, and controller spec.
- Kakao OAuth is exposed as a provider, but Kakao Developers must enable Kakao Login and configure the `account_email` consent item before it can pass provider login. Google OAuth has passed manual QA.
- Login country metadata depends on proxy geo headers (`cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`). Without those headers, country code fields remain null by design.

Auth/session policy:

- Supabase Auth is only the external provider layer. Backend owns the application user, device, session, refresh token, and authorization checks.
- Signup and login share the same token exchange path. A new `provider + providerUserId` creates a `User`; an existing pair updates last-login metadata.
- App access tokens contain `userId` and `sessionId`; `AuthGuard` validates the session against DB state.
- Refresh tokens are stored as hashes in `AuthSession` and rotate on refresh or same-device relogin.
- Current User Web sends either `mobile` or `personal_laptop` device slots. The Backend also supports `work_laptop`, but the current User Web does not use it.

Layer rules:

- `domain`: framework-free domain errors and primitives.
- `application`: use cases, ports, repository interfaces, and transaction orchestration.
- `infrastructure`: Prisma repositories and external provider adapters.
- `presentation`: controllers, DTOs, guards, filters, decorators, and response mapping.

Business modules should continue to be added one module and one migration at a time, following the same layer boundaries.
