# Backend Architecture

`BE` is currently reduced to the base NestJS backend plus Auth/User support.

Routes:

- User API: `/api/*`
- Admin API: `/admin/api/*`

Active modules:

- `auth`: external auth token exchange, app token refresh/logout, current user lookup, device/session management.
- `user`: current user profile and registered device lookup.
- `health`: health check endpoint.

Layer rules:

- `domain`: framework-free domain errors and primitives.
- `application`: use cases, ports, repository interfaces, and transaction orchestration.
- `infrastructure`: Prisma repositories and external provider adapters.
- `presentation`: controllers, DTOs, guards, filters, decorators, and response mapping.

Business modules such as company, contact, product, deal, schedule, and related DDL have been removed. Add them back later one module and one migration at a time.
