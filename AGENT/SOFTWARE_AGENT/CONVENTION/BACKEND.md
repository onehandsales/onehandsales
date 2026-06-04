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

See `CONVENTION/COMMENT_AND_LOGGING.md`.

## 8. Environment

All environment variables must be listed in `.env.example`.

Access through ConfigService, not direct `process.env`.

Backend examples:

```text
NODE_ENV
PORT
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
OPENAI_API_KEY
APP_ORIGIN
SENTRY_DSN
```

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



