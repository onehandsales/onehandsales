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
- `Contact`: 거래처/담당자, always a person under a company when company exists
- `Product`: 제품
- `Deal`: 딜/영업 건
- `Schedule`: 일정
- `MeetingNote`: 회의록

Do not introduce a generic `Customer` domain unless a later decision explicitly redefines it.

## 3. Module List

MVP modules:

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

## 4. Layer Rules

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

## 5. Module Communication

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

## 6. User API And Admin API

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

## 7. Transactions

Transaction boundary is application layer.

Use a transaction when one use case writes multiple tables, especially:

- deal creation with stage log
- meeting note save with deal activity log
- sensitive raw access with audit log
- Admin data mutation with audit log
- import batch creation

Domain code must not know about transactions.

For event consistency, prefer an outbox pattern when an external side effect follows a DB write.

## 8. Persistence Rules

Database principles:

- PK is UUID/ULID. Do not expose sequential IDs.
- User-owned data must have `userId`.
- Non-temporary tables have `createdAt` and `updatedAt`.
- Main business data uses `deletedAt` soft delete.
- FK constraints are explicit.
- FK columns are indexed.
- RLS is a last line of defense; backend queries still filter by `userId`.
- Admin RLS bypass must go through explicit Admin methods.

Soft delete retention:

- Main entities and their logs/notes remain recoverable for 30 days.
- User is notified 7 days before permanent deletion where applicable.
- Audit logs are not hard-deleted by normal product flows.

## 9. Enum And Lookup Policy

Use enum when values drive application logic and are not user-editable.

Use lookup table when values are user-editable.

Canonical examples:

- Deal stage defaults are enum-like for MVP: `초기 접촉`, `협의중`, `성사`, `실패`.
- Custom future stages require a lookup/config table.
- Deal activity types are user-customizable, so prepare a lookup table.
- Tags are user-customizable and belong in tag tables.

## 10. AI And External Providers

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

## 11. Migration Rules

Prisma migrations are not edited or deleted after being applied.

For risky changes:

- adding nullable column: one migration is fine
- adding not-null column: nullable add, backfill, then not-null
- renaming column: add new column, double write, switch reads, drop old column later
- splitting/merging tables: write an RFC before implementation

## 12. Backend Checklist

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


