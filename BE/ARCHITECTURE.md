# Backend Architecture

`BE` is the single NestJS backend for the User API and admin auth verification API.

This backend is a modular monolith. It runs as one NestJS server today, but module boundaries are treated like future service boundaries so the system can be split later without rewriting business flows.

Routes:

- User API: `/api/*`
- Admin auth verification API: `GET /admin/api/me`

Active modules:

- `auth`: external auth token exchange, app token refresh/logout, current user lookup, device/session management, login locale/region metadata sync.
- `user`: current user profile, timezone/locale metadata, and registered device lookup.
- `error-report`: User Web error report intake and optional screenshot storage.
- `support-request`: authenticated support request intake.
- `public-contact-request`: unauthenticated public contact request intake.
- `health`: health check endpoint.

Current intentional gaps:

- Paddle/Billing, subscription/payment/tax/invoice/refund, entitlement/paywall, B2B tenant/team features, and paid recovery/hard purge policy are deferred.
- Current runtime auth providers are Google, LINE, and Apple. Kakao remains only as a legacy Prisma enum value and is not exposed for runtime exchange.
- Login country metadata depends on proxy geo headers (`cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`). Without those headers, country code fields remain null by design.
- Verification must be rerun after code or document contract changes: `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test`, and `build`.

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

The fixed company/search domain has been removed for the OneHand CRM pivot. The next CRM core should be introduced as a flexible Workspace/Kit/Object/Attribute/Relationship/Record/List/View model instead of extending the old company tables.
