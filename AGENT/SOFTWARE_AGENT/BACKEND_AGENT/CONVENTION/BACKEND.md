# Backend Convention

## 1. Naming

Files and directories:

- kebab-case
- role suffix where useful

Examples:

```text
company.entity.ts
contact.repository.ts
prisma-contact.repository.ts
create-deal.command.ts
deal-stage-changed.event.ts
meeting-note.controller.ts
create-contact.dto.ts
contact.response.dto.ts
contact.mapper.ts
contact.errors.ts
notification.module.ts
```

Classes:

- PascalCase

Interfaces:

- PascalCase
- no `I` prefix

Constants:

- UPPER_SNAKE_CASE

Enums:

- enum name PascalCase
- enum members UPPER_SNAKE_CASE

## 2. TypeScript

Required:

- `strict`
- `noImplicitAny`
- `strictNullChecks`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`

Rules:

- `any` is forbidden.
- Prefer `unknown` with type guards for uncertain data.
- Use `readonly` where values should not change.
- Minimize `as`; prefer validation and explicit mapping.
- DB nullable values are represented as `null`.
- optional function parameters use `undefined`/`?`.

## 3. NestJS

Rules:

- constructor injection only
- DTOs use `class-validator` and `class-transformer`
- global ValidationPipe uses whitelist and forbidNonWhitelisted
- module definitions live in infrastructure
- controllers stay short
- domain entities are not returned directly from controllers

Forbidden:

- property injection
- business logic in controllers
- repository calls from controllers
- Prisma access from controllers

## 4. Prisma

Rules:

- Prisma is infrastructure-only.
- Domain/application must not import Prisma types.
- Prisma rows are mapped to domain objects through mappers.
- applied migration files are not edited or deleted.
- schema model names use PascalCase.
- schema fields use camelCase.
- all FK columns should be indexed.

Migration names should be imperative and snake_case:

```text
add_companies_table
add_user_id_index_to_deals
```

## 4.1. Time And Timezone

Backend 시간 처리 기준은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

Rules:

- `createdAt`, `updatedAt`, `deletedAt`, `expiresAt`, `revokedAt`, `lastLoginAt` 같은 시스템 시각은 UTC 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자가 입력한 local date-time과 IANA `timeZone`을 해석한 뒤 DB에는 UTC instant로 저장한다.
- Backend API 응답의 instant는 ISO 8601 UTC string을 기본으로 한다.
- 날짜만 필요한 값은 Prisma `DateTime @db.Date`를 사용하고 API에서는 `YYYY-MM-DD`로 다룬다.
- 기존 migration에 있는 `TIMESTAMP(3)` 컬럼도 애플리케이션 기준으로 UTC instant로 취급한다.
- 사용자가 입력한 현지 날짜/시간을 저장하는 업무 테이블은 같은 row에 `timeZone` 컬럼을 함께 둔다.
- `timeZone`은 `Asia/Seoul`, `America/Los_Angeles`, `Asia/Singapore` 같은 IANA timezone ID만 허용한다.

New schedule-like instant columns should prefer explicit native DB intent and timezone metadata:

```prisma
startAt  DateTime @db.Timestamptz(3)
endAt    DateTime @db.Timestamptz(3)
timeZone String   @default("Asia/Seoul")
```

## 5. Async

Rules:

- use async/await consistently
- use `Promise.all` for independent parallel calls
- never leave unhandled promises
- external call errors are converted to application/domain errors at adapter boundary

## 6. Error Handling

Use domain error classes for business failures.

Examples:

- `CompanyNotFoundError`
- `DuplicateContactError`
- `InvalidDealStageError`
- `SensitiveAccessReasonRequiredError`

Controller-level try/catch should be rare. Standard exception filters convert domain errors to HTTP responses and structured logs.

## 7. Logging

Use structured logger only.

Rules:

- no `console.log`
- no ASCII box logs
- short event key + context object
- PII is redacted
- domain layer does not log
- exception filters and infrastructure adapters log

See `CONVENTION/COMMENT_AND_LOGGING.md` and `CONVENTION/OBSERVABILITY.md`.

## 7.1. Transaction

Transaction boundary belongs to the application layer.

Rules:

- document transaction need in API contract before implementation
- use transaction when one use case writes multiple models
- keep audit log writes in the same transaction as the audited mutation
- do not start transactions in controllers
- do not expose Prisma transaction types to domain/application contracts
- keep long external Provider calls outside DB transaction when possible

See `CONVENTION/TRANSACTION.md`.

## 7.2. API Contract

New API work starts from a contract document.

Rules:

- API contract lives in `TODO/{PLAN_NAME}/COMMON/API-SPEC/*`
- contract status must be at least `confirmed` before implementation
- request, response, error, transaction, observability, DB model linkage must be written
- User Web and Admin Web consumers must be named
- breaking changes must describe FE impact

See `CONVENTION/API_CONTRACT.md` and `CONVENTION/API_SPEC.md`.

## 8. Environment

Environment files use one `.env` per runnable app. `.env.example` and `.env.local` are not current source-of-truth files.

All environment variable names and purposes must be listed in `ENVIRONMENT.md`.

Access through ConfigService, not direct `process.env`.

Backend examples:

```text
NODE_ENV
PORT
DATABASE_URL
DIRECT_URL
TEST_DATABASE_URL
APP_JWT_ISSUER
APP_JWT_AUDIENCE
APP_JWT_SECRET
APP_ACCESS_TOKEN_TTL_MINUTES
APP_SESSION_TTL_DAYS
APP_REFRESH_COOKIE_NAME
APP_REFRESH_TOKEN_SECRET
INITIAL_ADMIN_EMAILS
COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY
COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION
CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY
CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION
PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY
PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION
ENCRYPTION_MASTER_KEY
ENCRYPTION_KEY_VERSION
SUPABASE_JWKS_URL
SUPABASE_JWT_ISSUER
SUPABASE_JWT_AUDIENCE
API_PUBLIC_ORIGIN
APP_ALLOWED_ORIGINS
APP_REFRESH_COOKIE_DOMAIN
USER_WEB_ORIGIN
ADMIN_WEB_ORIGIN
OPENAI_API_KEY
OPENAI_BASE_URL
OPENAI_MEETING_NOTE_DRAFT_MODEL
OPENAI_MEETING_NOTE_STT_MODEL
OPENAI_BUSINESS_CARD_OCR_MODEL
OPENAI_IMPORT_MAPPING_MODEL
```

Do not document real provider secret values. When a new integration is implemented, add the env key name and purpose to `ENVIRONMENT.md`, then update this section if the key affects Backend conventions.

## 9. Import Order

Order:

1. Node.js standard library
2. external libraries
3. internal absolute paths
4. relative paths

Use TypeScript path alias for `src`:

```text
@/*
```

## 10. Testing Policy

Test coverage scales with risk.

Priority:

- domain entities and value objects
- auth isolation
- user data ownership
- Excel/CSV import mapping
- sensitive raw access audit flow
- trash/restore retention behavior

Unit tests focus on domain logic. Integration tests cover cross-layer behavior where data leakage or irreversible actions are possible.

## 11. Git

Use Conventional Commits:

```text
feat(company): add company history log
fix(deal): prevent stage log duplication
refactor(contact): extract phone value object
docs(architecture): update backend rules
```

Do not bypass hooks with `--no-verify`.

## 12. Forbidden Summary

Forbidden:

- `any`
- Domain importing NestJS/Prisma/HTTP/OpenAI
- Application service using Prisma directly
- Controller business logic
- module-to-module repository import
- direct `process.env`
- `console.log`
- PII plain logging
- editing applied migrations
- User controller role-branching for Admin behavior
- implementing API without a `COMMON/API-SPEC` contract
- omitting transaction and observability sections from mutation/Admin/sensitive API contracts

## 13. Related Documents

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
