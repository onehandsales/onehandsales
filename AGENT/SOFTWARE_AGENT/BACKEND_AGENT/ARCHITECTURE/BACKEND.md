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
- `Search`: 기존 도메인을 읽는 통합검색

일반적인 `Customer` 도메인은 현재 정본 모델에 없다. 후속 결정 없이 새로 만들지 않는다.

## 3. Current Implementation Snapshot

Snapshot date: 2026-06-18

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
- `product`
- `deal`
- `schedule`
- `meeting-note`
- `search`

Currently implemented API surface:

- Auth/User: `/api/auth/providers`, `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout`, `/api/me`, `/admin/api/me`, `/api/users/me/profile`, `/api/users/me/devices`
- Company: list/detail/create/update, field/region options, memo/private memo logs, linked contacts/deals, xlsx export
- Contact: list/detail/create/update, company options, department/job grade options, memo/private memo logs, linked deals, xlsx export
- Product: list/detail/create/update, category/status options, memo/private memo logs, linked deals, xlsx export
- Deal: stage counts, list/detail/create/update, company/contact/product options, following action logs, memo logs, xlsx export
- Schedule: deal options, month/week list, detail/create/update/delete, schedule-deal N:M link
- MeetingNote: filter options, list/detail/create/update, AI text draft, STT+AI draft
- Search: `GET /api/search`
- Health: `GET /api/health`

Completed Backend TODO plans:

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/BE-TODO/G01-BE-SCHEDULE-DOMAIN.goal.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/BE-TODO/G01-G12`
- `TODO/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/BE-TODO/G01-BE-MEETING-NOTE-AI-STT-DRAFT.goal.md`

Current response notes:

- List APIs use page-number pagination unless a domain-specific memo log uses cursor pagination.
- `GET /api/companies` returns `items[].contactCount` and `items[].dealCount`.
- `GET /api/companies` supports `sort=createdAtDesc|contactCountDesc|contactCountAsc|dealCountDesc|dealCountAsc`.
- `GET /api/contacts` supports `sort=createdAtDesc|usernameAsc`.
- `GET /api/products` returns `items[].dealCount` and supports `sort=createdAtDesc|dealCountDesc|dealCountAsc`.
- `GET /api/deals/stage-counts` supports `search`, `companyId`, and `contactId` filters.
- `GET /api/deals` supports `search`, `companyId`, `contactId`, `dealStatus`, and `sort=createdAtDesc|dealCostDesc|dealCostAsc|expectedEndDateAsc`.
- `GET /api/schedules` uses local date range query values plus IANA `timeZone` and returns UTC ISO strings.
- `GET /api/meeting-notes` returns summary objects for `companies`, `contacts`, `products`, `deals`, uses fixed `pageSize=10`, and uses `totalPages`.
- `POST /api/meeting-notes/ai-draft` and `POST /api/meeting-notes/stt-draft` generate draft fields only. They do not create a meeting note row.
- MeetingNote AI draft and STT are separated as `MeetingNoteAiDraftProvider` and `MeetingNoteSttProvider`; current adapters are OpenAI.
- MeetingNote AI/STT writes no transcript table, provider log table, or raw-text storage in the current scope.
- `GET /api/search` reads Company, Contact, Product, Deal, Schedule, and MeetingNote data owned by the current user and returns navigation target metadata.

Current runtime behavior:

- global `ValidationPipe` uses whitelist, forbidNonWhitelisted, and transform.
- global `HttpExceptionFilter` is registered.
- request id middleware applies to all routes.
- CORS origins are derived from `USER_WEB_ORIGIN` and `ADMIN_WEB_ORIGIN`.
- default port is `3000`.

Current backend gaps:

- Admin Web query APIs such as `/admin/api/dashboard`, `/admin/api/users`, `/admin/api/companies`, `/admin/api/contacts`, `/admin/api/products`, and `/admin/api/deals` are not implemented yet.
- BusinessCard OCR, generic Import/Export jobs, Notification, Trash, Admin operation query/audit/sensitive raw APIs are not implemented yet.
- MeetingNote delete/restore, Admin API, rawText encryption/raw access, and DealActivity auto-log are future scope.
- MeetingNote AI/STT Frontend integration is pending even though the Backend draft APIs exist.

## 4. Target Module List

Implemented MVP modules:

- `health`
- `auth`
- `user`
- `company`
- `contact`
- `product`
- `deal`
- `schedule`
- `meeting-note`
- `search`

Planned or partially represented modules:

- `business-card`
- `import-export`
- `notification`
- `tag`
- `audit-log`
- `admin`
- `trash`

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

Search and MeetingNote AI/STT draft do not introduce new database tables in the current implementation.

## 11. Enum And Lookup Policy

Use enum when values drive application logic and are not user-editable.

Use lookup table when values are user-editable.

Canonical examples:

- Deal stage defaults are code-level enum values for MVP.
- Company field/region, contact department/job grade, and product category/status are user-editable lookup tables.
- Tags are user-customizable and belong in tag tables.

## 12. AI And External Providers

OpenAI-centered use cases:

- business card OCR
- meeting note draft generation
- meeting note STT transcription
- Excel/CSV import column mapping

Rules:

- OpenAI must be wrapped behind backend ports.
- Domain/application code must not depend on OpenAI SDK directly.
- Provider-specific prompt/response handling belongs in infrastructure adapters.
- MeetingNote AI draft and STT must remain separate provider ports.
- STT provider adapters may be replaced independently of the OpenAI AI draft adapter.
- MeetingNote AI/STT draft APIs generate editable drafts only. Final save remains `POST /api/meeting-notes`.

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
