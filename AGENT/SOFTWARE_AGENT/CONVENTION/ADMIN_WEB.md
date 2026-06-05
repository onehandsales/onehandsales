# Admin Web Convention

Admin Web follows `FRONTEND_USER_WEB.md` unless this document says otherwise.

## 1. Admin-Specific API

Use:

```text
src/lib/admin-api-client.ts
```

Base path:

```text
/admin/api
```

Forbidden:

- User Web `apiClient`
- User API path `/api/*` for admin data
- client-side bypass for AdminGuard failures
- direct `fetch` calls from pages/components for Admin business data

## 2. Query Keys

Admin query keys start with `admin`.

Examples:

```text
['admin', 'users']
['admin', 'users', 'list', filter]
['admin', 'users', 'detail', userId]
['admin', 'deals', 'list', filter]
['admin', 'audit-log', 'list', filter]
```

## 3. Data Tables

Use TanStack Table for global lists.

Rules:

- server pagination for large lists
- server sorting/filtering once global data can exceed 10,000 rows
- no large-data client pagination
- row actions live in a dedicated action cell/component
- dangerous actions require dialog and reason when audited

## 4. Charts

Use Recharts when charting is needed.

Rules:

- chart data should be cached
- no real-time polling unless explicitly required
- stale time of several minutes is acceptable for dashboard metrics

## 5. Desktop-Only UI

Admin Web is desktop-only for MVP.

Rules:

- no mobile-first layout work
- no `sm:`/`md:` responsive branching unless a specific desktop layout still requires it
- dense spacing
- `text-sm` is default for table-heavy pages
- fixed side navigation is acceptable

## 6. Authorization

Use one Admin route guard.

Forbidden:

- role checks scattered inside page components
- hiding protected controls as the only protection

Backend remains the source of truth for authorization.

## 7. Sensitive Data And Audit

Rules:

- PII is not sent to client logs.
- raw sensitive data view requires explicit action and reason.
- reason text is sent to backend audit flow, not Sentry/client logs.
- Admin mutation success is audited by backend, not by client-side fake audit calls.

Client logs may record non-sensitive event IDs and entity IDs only.

## 8. Dangerous Actions

Use AlertDialog-style confirmation.

Actions that need reason:

- raw sensitive view
- user suspension/deletion
- forced data modification
- payment status override
- restore/permanent-delete operation when implemented

## 9. Forbidden Summary

Forbidden:

- User Web API client
- User Web/mobile code import or copy-as-shared abstraction
- mobile responsive work as a default
- component-level repeated role checks
- PII in client logs
- reason text in client logs
- client-only pagination for large global data


