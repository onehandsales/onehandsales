# Backend Architecture

`BE` is currently the base NestJS backend plus Auth/User support and the user-facing Company domain.

Routes:

- User API: `/api/*`
- Admin API: `/admin/api/*`

Active modules:

- `auth`: external auth token exchange, app token refresh/logout, current user lookup, device/session management.
- `user`: current user profile and registered device lookup.
- `company`: user-owned company, company field/region, memo log, and encrypted private memo log management.
- `contact`: user-owned contact, company option, contact department/job grade, memo log, and encrypted private memo log management.
- `health`: health check endpoint.

Layer rules:

- `domain`: framework-free domain errors and primitives.
- `application`: use cases, ports, repository interfaces, and transaction orchestration.
- `infrastructure`: Prisma repositories and external provider adapters.
- `presentation`: controllers, DTOs, guards, filters, decorators, and response mapping.

Business modules such as product, deal, schedule, and related DDL should be added later one module and one migration at a time.
