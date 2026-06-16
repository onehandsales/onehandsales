# Backend Architecture

## 1. Position

Backend is a single NestJS server under `BE`.

Stack:

- NestJS
- Prisma
- Supabase PostgreSQL
- Modular Monolith
- DDD
- Clean Architecture

API split:

- User API: `/api/*`
- Admin API: `/admin/api/*`

The backend is one deployment unit in MVP, but Admin code must be separated enough that it can later be extracted.

## 2. Domain Vocabulary

Legacy documents used `customer` as a broad term. The canonical product model does not.

Use these terms:

- `Company`: 회사
- `Contact`: 담당자, always a person under a company
- `Product`: 제품
- `Deal`: 딜/영업 건
- `Schedule`: 일정
- `MeetingNote`: 회의록

Do not introduce a generic `Customer` domain unless a later decision explicitly redefines it.

## 3. Current Implementation Snapshot

Current source of truth:

- server entry: `BE/src/main.ts`
- root module: `BE/src/app.module.ts`
- Prisma schema: `BE/prisma/schema.prisma`
- package scripts: `BE/package.json`

Currently imported modules in `AppModule`:

- `health`
- `auth`
- `user`
- `company`
- `contact`
- `product`
- `deal`
- `schedule`
- `meeting-note`

Currently implemented API surface:

- `GET /api/health`
- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /admin/api/me`
- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`
- `GET /api/companies`
- `GET /api/companies/export/xlsx`
- `GET /api/companies/:companyId/contacts`
- `GET /api/companies/:companyId/deals`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- Company memo/private memo routes under `/api/companies/:companyId`
- `GET /api/company-fields`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `GET /api/company-regions`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`
- `GET /api/contacts`
- `GET /api/contacts/export/xlsx`
- `GET /api/contacts/company-options`
- `GET /api/contact-job-grades`
- `POST /api/contact-job-grades`
- `DELETE /api/contact-job-grades/:jobGradeId`
- `GET /api/contact-departments`
- `POST /api/contact-departments`
- `DELETE /api/contact-departments/:departmentId`
- `POST /api/contacts`
- `GET /api/contacts/:contactId`
- `GET /api/contacts/:contactId/deals`
- `PATCH /api/contacts/:contactId`
- Contact memo/private memo routes under `/api/contacts/:contactId`
- `GET /api/products`
- `GET /api/products/export/xlsx`
- `GET /api/product-categories`
- `POST /api/product-categories`
- `DELETE /api/product-categories/:categoryId`
- `GET /api/product-statuses`
- `POST /api/product-statuses`
- `DELETE /api/product-statuses/:statusId`
- `POST /api/products`
- `GET /api/products/:productId`
- `GET /api/products/:productId/deals`
- `PATCH /api/products/:productId`
- Product memo/private memo routes under `/api/products/:productId`
- `GET /api/deals/stage-counts`
- `GET /api/deals`
- `GET /api/deals/export/xlsx`
- `GET /api/deals/company-options`
- `GET /api/deals/contact-options`
- `GET /api/deals/product-options`
- `POST /api/deals`
- `GET /api/deals/:dealId`
- `PATCH /api/deals/:dealId`
- Deal following action log routes under `/api/deals/:dealId`
- Deal memo log routes under `/api/deals/:dealId`
- `GET /api/schedules/deal-options`
- `GET /api/schedules`
- `GET /api/schedules/:scheduleId`
- `POST /api/schedules`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`
- `GET /api/meeting-notes`
- `GET /api/meeting-notes/filter-companies`
- `GET /api/meeting-notes/filter-contacts`
- `GET /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes`
- `PATCH /api/meeting-notes/:meetingNoteId`

Completed Backend TODO plans:

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`: completed. Auth/session, current user, profile, and device APIs are implemented and verified.
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`: completed. Company DB/API, request id, private memo encryption, transaction contract, and observability contract are implemented and verified.
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`: completed. Contact DB/API, company ownership, request id, private memo encryption, transaction contract, and observability contract are implemented and verified.
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`: completed. Product DB/API, category/status ownership, private memo encryption, transaction contract, and observability contract are implemented and verified.
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`: completed. Deal DB/API, DealProduct N:M product mapping, code-level status enum, nested FK responses, following action logs, memo logs, xlsx export, transaction contract, and observability contract are implemented and verified.
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`: completed. Schedule DB/API, ScheduleDeal N:M deal mapping, timezone conversion, hard delete transaction, and User Web schedule contract are implemented and verified.
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`: completed. Manual MeetingNote DB/API, N:N snapshot links, filter APIs, transaction contract, and User Web meeting-note contract are implemented and verified.
- `TODO/DONE/ADDITIONAL_WORK_PLAN/BE-TODO/G01-G12`: completed. Company `contactCount`, Company linked Contact list, Company/Contact/Product xlsx export, Company/Product `dealCount`, Company/Contact/Product linked Deal lists, and Product `sort=dealCountDesc|dealCountAsc` are implemented and verified.

Current response notes:

- `GET /api/companies` returns `items[].contactCount` and `items[].dealCount`.
- `GET /api/companies` supports `sort=createdAtDesc|contactCountDesc|contactCountAsc|dealCountDesc|dealCountAsc`.
- `GET /api/contacts` supports `sort=createdAtDesc|usernameAsc`.
- `GET /api/products` returns `items[].dealCount` and supports `sort=createdAtDesc|dealCountDesc|dealCountAsc`.
- `GET /api/deals` supports `sort=createdAtDesc|dealCostDesc|dealCostAsc|expectedEndDateAsc`.
- Company and Product xlsx export files include `딜 수`; Product export also supports the same product list sort query.
- Company/Contact/Product linked Deal list APIs return all linked deals ordered by `createdAt DESC`, `id DESC`.
- `GET /api/schedules` uses local date range query values plus IANA `timeZone` and returns UTC ISO strings.
- `GET /api/meeting-notes` returns summary objects for `companies`, `contacts`, `products`, `deals`, uses fixed `pageSize=10`, and uses `totalPages`, not `hasNext`.
- Manual MeetingNote APIs do not expose AI/STT generation, delete/restore, Admin raw access, `stageText`, request `timeZone`, request `rawText`, or single request `dealId`.

Current runtime behavior:

- global `ValidationPipe` uses whitelist, forbidNonWhitelisted, and transform.
- global `HttpExceptionFilter` is registered.
- CORS origins are derived from `USER_WEB_ORIGIN` and `ADMIN_WEB_ORIGIN`.
- default port is `3000`.

Current backend gaps:

- Admin Web query APIs such as `/admin/api/dashboard`, `/admin/api/users`, `/admin/api/companies`, `/admin/api/contacts`, `/admin/api/products`, and `/admin/api/deals` are not implemented yet.
- BusinessCard OCR, generic Import/Export jobs, Notification, Trash, Search, Admin operation query/audit/sensitive raw APIs are not implemented yet.
- MeetingNote AI/STT generation, delete/restore, Admin API, rawText encryption, and DealActivity auto-log are future scope.

## 4. Target Module List

Planned MVP modules:

- `health`
- `auth`
- `user`
- `company`
- `contact`
- `product`
- `deal`
- `schedule`
- `meeting-note`
- `business-card`
- `import-export`
- `notification`
- `tag`
- `audit-log`
- `admin`

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

### Domain

Domain contains business rules, entities, value objects, domain errors, repository interfaces, and domain services.

Allowed:

- TypeScript standard library
- same-module domain code
- `shared/domain`

Forbidden:

- NestJS decorators
- Prisma types or Prisma client
- HTTP clients
- OpenAI/Supabase SDKs
- logger calls

Domain code throws domain errors. It does not log.

### Application

Application contains use cases and orchestration.

Responsibilities:

- permission checks
- transaction boundaries
- repository/port calls
- module-to-module coordination through exported application services
- command/query objects

Forbidden:

- Prisma direct access
- HTTP calls directly
- returning Prisma rows as business results
- importing another module's repository

External systems must be represented as ports in application code.

### Infrastructure

Infrastructure implements technical adapters:

- Prisma repositories
- OpenAI adapter
- Supabase storage adapter
- email/browser push adapters
- Google Calendar adapter
- Excel/CSV parser adapter

Infrastructure can import domain/application interfaces to implement them.

### Presentation

Presentation contains HTTP controllers, DTOs, response mappers, guards, decorators, and filters.

Rules:

- Controllers are thin.
- Controllers call application services.
- Controllers do not contain business logic.
- Controllers do not call repositories or Prisma.
- Domain entities are mapped to response DTOs before returning.

## 6. Module Communication

Allowed:

- A module may call another module's exported application service.
- A module may publish or consume domain events.

Forbidden:

- importing another module's repository
- reading another module's Prisma model directly
- branching user/admin behavior inside the same controller method

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

Do not put Admin behavior behind role checks in User controllers. Admin needs separate controllers or an isolated `admin` module.

## 8. Transactions

Transaction boundary is application layer.

Use a transaction when one use case writes multiple tables, especially:

- deal creation with first following action log
- meeting note save with deal activity log
- sensitive raw access with audit log
- Admin data mutation with audit log
- import batch creation

Domain code must not know about transactions.

For event consistency, prefer an outbox pattern when an external side effect follows a DB write.

Detailed transaction writing rules are defined in `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`.

Every API contract that changes data must state whether transaction is `필요`, `없음`, or `보류`.

## 8.1. Observability

Backend observability starts with structured JSON logs, audit logs, and request context.

Rules:

- application log and audit log are different records.
- mutation, Admin API, sensitive data access, external Provider, and batch/import flows must state observability requirements in the API contract.
- request id must be available to exception filters and logger wrapper.
- PII, tokens, sensitive memo body, meeting note body, and raw private data are not logged.
- audit log records business-sensitive actions in DB and is not replaced by technical logs.

Detailed observability rules are defined in `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`.

## 9. Persistence Rules

Database principles:

- PK is UUID/ULID. Do not expose sequential IDs.
- User-owned data must have `userId`.
- Non-temporary tables have `createdAt` and `updatedAt`.
- System timestamps such as `createdAt` and `updatedAt` are stored as UTC instants. Schedule `startAt` and `endAt` are stored as UTC instants after interpreting IANA `timeZone`. Tables that own user-entered local date-time fields store `timeZone` in the same row. Date-only values use `@db.Date`.
- Soft delete is domain-specific, not a universal baseline. Current Company/Contact/Product/Deal/Schedule/Manual MeetingNote contracts do not treat `deletedAt` as a shared response/API requirement; add trash/restore fields only when the domain scope explicitly includes them.
- FK constraints are explicit.
- FK columns are indexed.
- RLS is a last line of defense; backend queries still filter by `userId`.
- Admin RLS bypass must go through explicit Admin methods.

Soft delete retention:

- Main entities and their logs/notes remain recoverable for 30 days.
- User is notified 7 days before permanent deletion where applicable.
- Audit logs are not hard-deleted by normal product flows.

## 10. Enum And Lookup Policy

Use enum when values drive application logic and are not user-editable.

Use lookup table when values are user-editable.

Canonical examples:

- Deal stage defaults are code-level enum values for MVP: `초기 접촉`, `니즈 확인`, `제안/견적`, `협상`, `성사`, `실패`. The DB stores English string codes, not a DB enum.
- Custom future stages require a lookup/config table.
- Deal activity types are user-customizable, so prepare a lookup table.
- Tags are user-customizable and belong in tag tables.

## 11. AI And External Providers

OpenAI-centered use cases:

- business card OCR
- meeting note generation
- Excel/CSV import column mapping

Rule:

- OpenAI must be wrapped behind backend ports.
- Domain/application code must not depend on OpenAI SDK directly.
- Provider-specific prompt/response handling belongs in infrastructure adapters.

Other external integrations:

- Google Calendar import first
- Google Calendar export later
- no two-way sync in MVP
- web alerts by email and browser push
- mobile push later

## 12. Migration Rules

Prisma migrations are not edited or deleted after being applied.

For risky changes:

- adding nullable column: one migration is fine
- adding not-null column: nullable add, backfill, then not-null
- renaming column: add new column, double write, switch reads, drop old column later
- splitting/merging tables: write an RFC before implementation

## 13. Backend Checklist

When creating a module:

- domain entity/VO/error exists
- domain repository interface exists
- application command/query/service exists
- infrastructure Prisma repository and mapper exist
- presentation controller/DTO/response mapper exists
- user data is filtered by `userId`
- Admin endpoint uses `/admin/api/*` and AdminGuard
- sensitive fields are masked by default
- mutations that require audit log write it in the same transaction
- API contract exists in `COMMON/API-SPEC` before implementation
- transaction and observability sections are filled for mutation/Admin/sensitive APIs

## 14. Related Documents

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
