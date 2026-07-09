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
- Current HTTP confirm wiring passes contact company resolutions and row overrides. Deal import missing company/contact/product resolution arrays are represented in types/use cases but need FE API and controller forwarding review before being treated as fully wired.

Layer rules:

- `domain`: framework-free domain errors and primitives.
- `application`: use cases, ports, repository interfaces, and transaction orchestration.
- `infrastructure`: Prisma repositories and external provider adapters.
- `presentation`: controllers, DTOs, guards, filters, decorators, and response mapping.

Business modules should continue to be added one module and one migration at a time, following the same layer boundaries.
