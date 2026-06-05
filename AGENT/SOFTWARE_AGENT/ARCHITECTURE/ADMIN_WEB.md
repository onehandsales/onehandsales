# Admin Web Architecture

## 1. Position

Admin Web is a separate React app under:

```text
FE/admin-web
```

Stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Zod
- TanStack Table
- Recharts when charts are needed

Admin Web is desktop-only for MVP.

## 2. Separation Rule

Admin Web does not import or share code with User Web.

This is intentional:

- User Web optimizes for fast sales workflow.
- Admin Web optimizes for dense data review, auditability, and operational safety.

Both clients call the same backend, but Admin Web only calls:

```text
/admin/api/*
```

## 3. MVP Admin Scope

MVP Admin should include:

- user list/detail
- all deals
- all companies
- all contacts
- all products
- per-user deal/company/contact/product view
- audit log view
- sensitive raw access workflow
- basic manual bank transfer/payment status management later

Manual bank transfer management is important, but comes after core user/product data visibility.

## 4. Structure

Use the same feature-first base as User Web. Admin Web has its own source tree and does not share code with User Web.

```text
src/
  assets/
  app/
    providers/
    router/
    app.tsx
  components/
    ui/
    layout/
  features/
    auth/
    user-management/
    deal-management/
    company-management/
    contact-management/
    product-management/
    audit-log/
    payment-management/
  hooks/
  lib/
    admin-api-client.ts
    env.ts
    query-client.ts
  pages/
    login/
    dashboard/
    users/
    deals/
    companies/
    contacts/
    products/
    audit-log/
    payments/
    settings/
  store/
  types/
  utils/
  styles/
  main.tsx
```

Dependency direction:

```text
main/app/router -> pages -> features -> components/hooks/lib/store/types/utils/styles
```

Rules:

- `app` owns providers, router creation, and app-level composition only.
- `pages` are route entry points. They compose Admin feature components and remain thin.
- `features` own Admin use cases, table/query hooks, filters, dialogs, schemas, feature components, and feature-local types.
- `components/ui` contains generic primitives.
- `components/layout` contains Admin shell, sidebar, header, page layout, table layout primitives, and toolbar primitives.
- `hooks`, `lib`, `store`, `types`, and `utils` must stay domain-free.
- `store` is only for cross-page client UI state such as table density, sidebar state, and view preferences.
- Shared root folders cannot import from `pages`, `features`, `app`, or `router`.
- Feature-to-feature imports are allowed only through the other feature's `index.ts`.
- Pages must import feature public APIs, not feature internal files.

## 5. Auth And Authorization

Admin route requirements:

- authenticated user
- `role === 'ADMIN'`

Use one route guard for protected admin routes.

Do not scatter role checks across page components.

On login:

- call auth API
- verify user role
- reject non-admin users immediately

Backend must still enforce AdminGuard. Client-side role checks are only UX protection.

## 6. API Client

Admin API client lives in:

```text
src/lib/admin-api-client.ts
```

Client name:

```text
adminApiClient
```

Base path:

```text
${VITE_API_URL}/admin/api
```

Rules:

- Admin Web must not use the User Web API client.
- Admin Web must not call `/api/*` for Admin data.
- Feature API files call `adminApiClient`; pages and components do not call `fetch` directly for Admin data.
- 401 goes to login.
- 403 goes to forbidden page.

## 7. Data Table Policy

Admin uses TanStack Table for large data sets.

Rules:

- server pagination is default for large lists
- server sorting/filtering is required once data can exceed 10,000 rows
- avoid client-only pagination for global user/deal/company/contact/product lists
- table state should be reflected in URL search params when useful

## 8. Sensitive Data Policy

Sensitive fields are masked by default.

Sensitive data includes:

- personal memo
- meeting note body
- deal amount
- user-marked sensitive data

Raw sensitive access requires:

- explicit user action
- reason input
- backend audit log

Admin Web must never send raw sensitive data or reason text to client logs.

## 9. Dangerous Actions

Dangerous actions require:

- clear dialog
- reason input when audit requires it
- backend mutation
- audit log in backend transaction

Examples:

- user suspension
- user deletion or restore
- sensitive raw view
- forced data modification
- payment status override

## 10. UI Direction

Admin is a work tool.

Rules:

- desktop-only layout
- dense tables and filters
- smaller spacing than User Web
- clear side navigation
- no marketing/hero composition
- no mobile-specific responsive work in MVP
- destructive actions use AlertDialog-style confirmation

## 11. Logging Boundary

Client logs:

- UI errors
- network failures
- non-sensitive event keys

Backend audit logs:

- actual Admin mutations
- raw sensitive access
- reason text

Do not confuse client Sentry logs with audit logs.

## 12. Checklist

When creating an Admin feature:

- route is protected by Admin route guard
- feature folder exposes public API through `index.ts`
- API uses `adminApiClient`
- query keys start with `admin`
- table uses server pagination when global data is involved
- sensitive fields are masked by default
- dangerous actions require reason if audited
- client logs do not contain PII or reason text
- page imports from feature public API only

