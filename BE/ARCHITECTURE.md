# Backend Architecture

`BE` is the single NestJS backend for the User API and admin auth verification API.

This backend is a modular monolith. It runs as one NestJS server today, but module boundaries are treated like future service boundaries so the system can be split later without rewriting business flows.

Routes:

- User API: `/api/*`
- Admin auth verification API: `GET /admin/api/me`

Active modules:

- `auth`: external auth token exchange, app token refresh/logout, current user lookup, device/session management, login locale/region metadata sync.
- `user`: current profile, timezone/locale metadata, devices, and onboarding completion.
- `workspace`: workspace creation, sidebar/default lookup, membership and onboarding ports.
- `object-definition`, `list-definition`: creation, sidebar queries and ordering.
- `attribute-definition`, `record-definition`: field and record contracts.
- `view-definition`: view headers, data, configuration preview/save, columns and favorites.
- `error-report`: User Web error report intake and optional screenshot storage.
- `support-request`: authenticated support request intake.
- `public-contact-request`: unauthenticated public contact request intake.
- `health`: health check endpoint.

Current intentional gaps:

- Billing and complete collaboration/product workflows are not implemented. Workspace/Team database models already exist. Target scope follows the folk parity matrix; absence in current code does not exclude a target feature.
- Current runtime auth providers are Google, LINE, and Apple. Kakao remains only as a legacy Prisma enum value and is not exposed for runtime exchange.
- Login country metadata depends on proxy geo headers (`cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`). Without those headers, country code fields remain null by design.
- Validate changed runtime/schema contracts with appropriate typecheck/lint/tests/build and Prisma checks. Documentation-only changes require source, link and diff checks; report runtime checks separately.

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

Business modules should continue to be added one module and one migration at a time, following the same layer boundaries. A module must not import another module's Prisma repository implementation directly; cross-module cooperation should go through the owning module's application/query port or use case facade.

Mutation APIs that may be retried, create multiple rows, or later cross a service boundary should document transaction ownership plus idempotency/outbox needs in the API contract.

The existing flexible CRM engine is active. The folk transition is planned in [FOLK_SCHEMA_PLAN](../AGENT/SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md) and [FOLK_TRANSITION_MATRIX](../AGENT/SOFTWARE_AGENT/COMMON/FOLK_TRANSITION_MATRIX.md). These plans do not change the runtime by themselves.
