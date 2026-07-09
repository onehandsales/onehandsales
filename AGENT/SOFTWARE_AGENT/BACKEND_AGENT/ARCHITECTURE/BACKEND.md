# Backend Architecture

## 1. Position

Backend는 `BE` 아래의 단일 NestJS 서버다.

Stack:

- NestJS 11
- Prisma 6
- Supabase PostgreSQL
- Modular Monolith
- DDD
- Clean Architecture

API split:

- User API: `/api/*`
- Admin API: `/admin/api/*`

MVP에서는 하나의 배포 단위로 운영한다. 단, Admin 코드는 나중에 분리할 수 있도록 controller, guard, application method 경계를 User API와 분리한다.

## 2. Domain Vocabulary

Canonical domain:

- `Company`: 회사
- `Contact`: 담당자, 항상 회사에 속한 사람
- `Product`: 제품
- `Deal`: 딜/영업 건
- `Schedule`: 일정
- `MeetingNote`: 회의록
- `BusinessCardScanLog`: 명함 OCR 요청/확정 저장 로그
- `Search`: 기존 도메인을 읽는 통합검색

일반적인 `Customer` 도메인은 현재 정본 모델에 없다. 후속 결정 없이 새로 만들지 않는다.

## 3. Current Implementation Snapshot

Snapshot date: 2026-07-09

Current source of truth:

- server entry: `BE/src/main.ts`
- root module: `BE/src/app.module.ts`
- Prisma schema: `BE/prisma/schema.prisma`
- package scripts: `BE/package.json`
- API summary: `API_SAMPLE.md`

Currently imported modules in `AppModule`:

- `health`
- `auth`
- `user`
- `company`
- `contact`
- `business-card`
- `product`
- `deal`
- `schedule`
- `meeting-note`
- `search`
- `trash`
- `data-import`

Currently implemented API surface:

- Auth/User: `/api/auth/providers`, `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout`, `/api/me`, `/admin/api/me`, `/api/users/me/profile`, `/api/users/me/devices`, user timezone/locale/region metadata
- Company: list/detail/create/update/delete, field/region options, memo/private memo logs, linked contacts/deals, xlsx export
- Contact: list/detail/create/update/delete, company options, department/job grade options, memo/private memo logs, linked deals, xlsx export
- BusinessCard OCR: `POST /api/business-card-scans`, `GET /api/business-card-scans`, `GET /api/business-card-scans/:scanLogId`, `POST /api/business-card-scans/:scanLogId/confirm`
- Product: list/detail/create/update/delete, category/status options, memo/private memo logs, linked deals, xlsx export
- Deal: stage counts, list/detail/create/update/delete, company/contact/product options, following action logs, memo logs, xlsx export
- Schedule: deal options, month/week list, detail/create/update/delete, schedule-deal N:M link
- MeetingNote: filter options, list/detail/create/update/delete, AI text draft, STT+AI draft, saved-note deal linking
- Search: `GET /api/search`
- Trash: `GET /api/trash`, `GET /api/trash/:targetType/:targetId`, `POST /api/trash/:targetType/:targetId/restore`
- DataImport: active templates, template xlsx download, CSV/XLSX upload for Company/Contact/Product/Deal, AI mapping, mapping validation, confirm import, import user logs
- Health: `GET /api/health`

Implemented Backend TODO references:

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/BE-TODO/G01-G12`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/BE-TODO/G01-BE-MEETING-NOTE-AI-STT-DRAFT.goal.md`
- `TODO/DONE/BUSINESS_CARD_OCR_PLAN`
- `TODO/DONE/IMPORT_TEMPLATE_PLAN`

Current response notes:

- List APIs use page-number pagination unless a domain-specific memo log uses cursor pagination.
- `GET /api/companies` returns `items[].contactCount` and `items[].dealCount`.
- `GET /api/companies` supports `sort=createdAtDesc|contactCountDesc|contactCountAsc|dealCountDesc|dealCountAsc`.
- `GET /api/contacts` supports `sort=createdAtDesc|usernameAsc`.
- `GET /api/products` returns `items[].dealCount` and supports `sort=createdAtDesc|dealCountDesc|dealCountAsc`.
- `GET /api/deals/stage-counts` supports `search`, repeated `companyIds`, and repeated `contactIds` filters.
- `GET /api/deals` supports `search`, repeated `companyIds`, repeated `contactIds`, `dealStatus`, and `sort=createdAtDesc|dealCostDesc|dealCostAsc|expectedEndDateAsc`.
- `GET /api/schedules` uses local date range query values plus IANA `timeZone` and returns UTC ISO strings.
- `GET /api/meeting-notes` returns summary objects for `companies`, `contacts`, `products`, `deals`, uses fixed `pageSize=10`, and uses `totalPages`.
- `POST /api/meeting-notes/ai-draft` and `POST /api/meeting-notes/stt-draft` generate draft fields only. They do not create a meeting note row.
- `POST /api/meeting-notes/:meetingNoteId/deals` adds deal links to a saved meeting note and writes linked deal following-action logs.
- `POST /api/business-card-scans` accepts an image file as `image`, calls OpenAI OCR, stores `OCR_SUCCESS` or `OCR_FAILED` in `BusinessCardScanLog`, and does not create Company/Contact.
- `GET /api/business-card-scans` supports `page` and repeated or comma-separated `status=OCR_SUCCESS|OCR_FAILED|CONFIRMED` filters. Results are ordered by newest registration first.
- `POST /api/business-card-scans/:scanLogId/confirm` requires user-confirmed fields, reuses existing Company/Contact when found, creates missing Company/Contact and taxonomy rows when needed, and updates the scan log to `CONFIRMED`.
- BusinessCard OCR does not store the uploaded image. The log stores extracted/corrected fields, provider model, token/cost metrics, `costCurrency`, `pendingTimeMs`, and linked company/contact IDs after confirmation.
- `DELETE /api/meeting-notes/:meetingNoteId` is a soft delete API and the deleted row can be restored through Trash while it remains within retention.
- MeetingNote AI draft and STT are separated as `MeetingNoteAiDraftProvider` and `MeetingNoteSttProvider`; current adapters are OpenAI.
- MeetingNote AI/STT writes no transcript table, provider log table, or raw-text storage in the current scope.
- `GET /api/search` reads Company, Contact, Product, Deal, Schedule, and MeetingNote data owned by the current user and returns navigation target metadata.
- `DELETE /api/companies/:companyId`, `DELETE /api/contacts/:contactId`, `DELETE /api/products/:productId`, and `DELETE /api/deals/:dealId` are soft delete APIs. They set `deletedAt`, `deletedByUserId`, and `trashExpiresAt` and return `204 No Content`.
- `GET /api/trash` aggregates deleted Company, Contact, Product, Deal, MeetingNote, and supported memo/action log rows owned by the current user where `deletedAt IS NOT NULL` and `trashExpiresAt > now`.
- `GET /api/trash/:targetType/:targetId` returns preview details for the trash detail modal. Private memo content is not exposed before restore.
- `POST /api/trash/:targetType/:targetId/restore` clears `deletedAt`, `deletedByUserId`, and `trashExpiresAt` and returns the restored target metadata.
- `GET /api/import-templates/active` returns active import templates for Company, Contact, Product, and Deal.
- `GET /api/import-templates/:templateId/download` returns an xlsx template. Contact templates may receive `companyName` as context.
- `POST /api/imports` accepts a CSV/XLSX file as `file`, creates an in-memory import job, and returns preview rows. The file limit is 10 MB.
- `POST /api/imports/:importJobId/map` calls the import mapping provider and falls back to heuristic mapping if the provider fails.
- `PATCH /api/imports/:importJobId/mapping` applies the user's mapping and validates mapped rows.
- `POST /api/imports/:importJobId/confirm` creates Company, Contact, Product, or Deal rows and writes `ImportUserLog`/`ImportUserLogRow` snapshots in a database transaction.
- Deal import creates the deal and `DealCompany`, `DealContact`, `DealProduct` links in one transaction when referenced company/contact/product values resolve. Current application types/use cases represent resolution arrays for missing references, but the current FE API function and HTTP controller do not forward `dealCompanyResolutions`, `dealContactResolutions`, or `dealProductResolutions`; treat that path as review-needed before release.
- Temporary DataImport jobs use an in-memory store. Persistent job recovery across server restart is future scope.

Current runtime behavior:

- global `ValidationPipe` uses whitelist, forbidNonWhitelisted, and transform.
- global `HttpExceptionFilter` is registered.
- request id middleware applies to all routes.
- CORS origins are derived from `USER_WEB_ORIGIN` and `ADMIN_WEB_ORIGIN`.
- default port is `3000`.
- User locale/region metadata columns are present on `User`: `preferredLocale`, signup/last-login locale, country code, and timezone metadata.

Auth/session runtime notes:

- Supabase Auth is treated as an external identity provider. Backend application auth starts at `POST /api/auth/exchange`.
- Signup and login share the same exchange path. New `provider + providerUserId` creates `User` and `UserOAuthAccount`; existing pairs update last-login metadata.
- Backend requires provider email during exchange. Do not remove Kakao `account_email` without redesigning app identity.
- App access tokens carry `userId` and `sessionId`; `AuthGuard` checks DB session state instead of trusting JWT alone.
- Refresh token originals are sent through httpOnly cookie and stored in DB only as hashes.
- Same active device relogin rotates the existing session refresh token. Different device in the same slot replaces the active device when `replaceExistingDevice=true` and revokes the previous slot sessions.
- Current User Web uses `mobile` and `personal_laptop` slots only. Backend also supports `work_laptop` for future clients.
- Country code metadata is read from proxy geo headers only: `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`.

Current backend gaps and intentional deferrals:

- Admin pages and Admin Web query APIs such as `/admin/api/dashboard`, `/admin/api/users`, `/admin/api/companies`, `/admin/api/contacts`, `/admin/api/products`, and `/admin/api/deals` are deferred.
- Persistent ImportJob recovery, Notification, Admin operation query/audit/sensitive raw APIs are not implemented yet.
- Generic ExportJob is intentionally not used for the current export direction. Company, Contact, Product, and Deal each provide their own `GET /api/<domain>/export/xlsx` API.
- MeetingNote Admin, rawText encryption/raw access, and generic DealActivity table are future scope.
- Kakao OAuth provider setup is deferred until Kakao Developers account access is available. Expected configuration includes Kakao Login activation and `account_email` consent item.
- Country code fields may remain null in local/dev environments that do not provide proxy geo headers.

## 4. Target Module List

Implemented MVP modules:

- `health`
- `auth`
- `user`
- `company`
- `contact`
- `business-card`
- `product`
- `deal`
- `schedule`
- `meeting-note`
- `search`
- `trash`
- `data-import`

Planned or partially represented modules:

- `notification`
- `audit-log`
- `admin`

`export` is not planned as a generic Backend module in the current direction. Domain xlsx export lives inside `company`, `contact`, `product`, and `deal`.

Each business module owns its own four layers:

```text
src/modules/<module>/
  domain/
  application/
  infrastructure/
  presentation/
```

Shared technical code lives under:

```text
src/shared/
  domain/
  application/
  infrastructure/
  presentation/
```

## 5. Layer Rules

Domain:

- contains business rules, entities, value objects, domain errors, repository interfaces, and domain services.
- may import TypeScript standard library, same-module domain code, and `shared/domain`.
- must not import NestJS decorators, Prisma types/client, HTTP clients, OpenAI/Supabase SDKs, or logger calls.

Application:

- contains use cases, orchestration, permission checks, transaction boundaries, repository/port calls, and command/query objects.
- must not access Prisma directly.
- must not call HTTP/provider SDKs directly.
- external systems must be represented as application ports.

Infrastructure:

- implements Prisma repositories, OpenAI adapters, Supabase storage adapters, Google Calendar adapters, email/push adapters, and file parser adapters.
- may import domain/application interfaces to implement them.

Presentation:

- contains HTTP controllers, DTOs, response mappers, guards, decorators, and filters.
- controllers stay thin and call application services only.
- domain entities are mapped to response DTOs before returning.

## 6. Module Communication

Allowed:

- a module may call another module's exported application service.
- a module may publish or consume domain events.

Forbidden:

- importing another module's repository.
- reading another module's Prisma model directly.
- mixing User/Admin behavior inside the same controller method.

Admin-specific application methods must be explicit:

```text
findAllForAdmin
countForAdmin
restoreForAdmin
viewSensitiveForAdmin
```

## 7. User API And Admin API

User controllers:

- route prefix: `/api/*`
- guard: JWT/auth guard
- scope: current user's own data only

Admin controllers:

- route prefix: `/admin/api/*`
- guards: JWT/auth guard + admin guard
- scope: cross-user data access through admin-specific application methods
- sensitive fields masked by default
- raw sensitive access requires reason and audit log

Do not put Admin behavior behind role checks in User controllers.

## 8. Transactions

Transaction boundary is application layer.

Use a transaction when one use case writes multiple tables, especially:

- deal creation with first following action log
- meeting note save with snapshot links
- business card confirmation that can create taxonomy, company, contact, and update scan log
- import confirmation that creates domain data and writes import log snapshots
- sensitive raw access with audit log
- Admin data mutation with audit log
- import batch creation

Read-only APIs such as `GET /api/search` do not need a transaction.

Domain code must not know about transactions.

Detailed transaction writing rules are defined in `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`.

## 9. Observability

Backend observability starts with structured JSON logs, audit logs, and request context.

Rules:

- application log and audit log are different records.
- mutation, Admin API, sensitive data access, external Provider, and batch/import flows must state observability requirements in the API contract.
- request id must be available to exception filters and logger wrapper.
- PII, tokens, sensitive memo body, meeting note body, raw private data, search query raw text, and provider raw prompts are not logged.
- audit log records business-sensitive actions in DB and is not replaced by technical logs.

Detailed observability rules are defined in `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`.

## 10. Persistence Rules

Database principles:

- PK is UUID/ULID. Do not expose sequential IDs.
- User-owned data must have `userId`.
- Non-temporary tables have `createdAt` and `updatedAt`.
- System timestamps are stored as UTC instants.
- Schedule `startAt` and `endAt` are stored as UTC instants after interpreting IANA `timeZone`.
- Date-only values use `@db.Date`.
- Soft delete is domain-specific, not a universal baseline.
- FK constraints are explicit and FK columns are indexed.
- RLS is a last line of defense; backend queries still filter by `userId`.
- Admin RLS bypass must go through explicit Admin methods.

Search and MeetingNote AI/STT draft do not introduce new database tables in the current implementation. BusinessCard OCR uses `BusinessCardScanLog` because success/failure/conversion and provider usage metrics must be analyzed. DataImport uses `ImportTemplate`, `ImportUserLog`, and `ImportUserLogRow`; pre-confirmation jobs are temporary in-memory records.

## 11. Enum And Lookup Policy

Use enum when values drive application logic and are not user-editable.

Use lookup table when values are user-editable.

Canonical examples:

- Deal stage defaults are code-level enum values for MVP.
- Company field/region, contact department/job grade, and product category/status are user-editable lookup tables.

## 12. AI And External Providers

OpenAI-centered use cases:

- business card OCR
- meeting note draft generation
- meeting note STT transcription
- Excel/CSV import column mapping for DataImport

Rules:

- OpenAI must be wrapped behind backend ports.
- Domain/application code must not depend on OpenAI SDK directly.
- Provider-specific prompt/response handling belongs in infrastructure adapters.
- MeetingNote AI draft and STT must remain separate provider ports.
- BusinessCard OCR must remain a separate provider port from MeetingNote AI draft/STT.
- DataImport column mapping must remain a separate provider port from MeetingNote and BusinessCard providers.
- BusinessCard OCR OpenAI adapter uses the Responses API with strict JSON schema output. The prompt constant and schema live in `BE/src/modules/business-card/infrastructure/providers/openai-business-card-ocr.provider.ts`.
- DataImport OpenAI adapter uses the Responses API and falls back to heuristic mapping when provider output is unavailable or invalid.
- STT provider adapters may be replaced independently of the OpenAI AI draft adapter.
- MeetingNote AI/STT draft APIs generate editable drafts only. Final save remains `POST /api/meeting-notes`.
- BusinessCard OCR APIs generate editable company/contact candidate fields only. Final save remains `POST /api/business-card-scans/:scanLogId/confirm`.

## 13. Migration Rules

Prisma migrations are not edited or deleted after being applied.

For risky changes:

- adding nullable column: one migration is fine
- adding not-null column: nullable add, backfill, then not-null
- renaming column: add new column, double write, switch reads, drop old column later
- splitting/merging tables: write an RFC before implementation

## 14. Backend Checklist

When creating a module:

- domain entity/value object/error exists
- domain repository interface exists
- application command/query/service exists
- infrastructure Prisma repository and mapper exist
- presentation controller/DTO/response mapper exists
- user data is filtered by `userId`
- Admin endpoint uses `/admin/api/*` and AdminGuard
- sensitive fields are masked by default
- mutations that require audit log write it in the same transaction
- API contract exists in `COMMON/API-SPEC` before implementation
- transaction and observability sections are filled for mutation/Admin/sensitive/provider APIs

## 15. Related Documents

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
