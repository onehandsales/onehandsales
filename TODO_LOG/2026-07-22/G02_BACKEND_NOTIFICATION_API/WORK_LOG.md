# G02 Backend Notification API Work Log

Date: 2026-07-22
Status: Done

## Scope

- Implemented the User Notification HTTP APIs in `BE/src/modules/notification`.
- Kept reminder scheduling, due processor, SMTP/Web Push delivery providers, User Web route changes, and Admin API out of scope for G03/G04.

## Implemented

- Added `NotificationApplicationService`.
  - Lists current-user notifications with pagination, read filter, due filtering, and unread count.
  - Marks notifications as read through user-owned repository access.
  - Returns default notification settings when no settings row exists.
  - Upserts settings with an empty-body validation guard.
  - Returns `WEB_PUSH_VAPID_PUBLIC_KEY` and raises `BrowserPushNotConfigured` when missing.
  - Registers browser push subscriptions through endpoint hashing/encryption and enables `browserPushEnabled`.
  - Revokes browser push subscriptions without hard delete and disables `browserPushEnabled` when no active subscriptions remain.
- Added `NotificationController`.
  - `GET /api/notifications`
  - `GET /api/notifications/unread-count`
  - `PATCH /api/notifications/:notificationId/read`
  - `GET /api/notifications/settings`
  - `PATCH /api/notifications/settings`
  - `GET /api/notifications/browser-push/public-key`
  - `POST /api/notifications/browser-subscriptions`
  - `DELETE /api/notifications/browser-subscriptions/:subscriptionId`
- Added request DTO validation for list query, settings update, and browser push subscription registration.
- Extended the repository port/adapter.
  - Added due filtering to list/unread count paths.
  - Changed list ordering to `scheduledAt DESC`, `createdAt DESC`.
  - Added endpoint-hash lookup for cross-user subscription conflict checks.
  - Prevented subscription upsert update from moving an existing endpoint hash to another user.
- Added domain errors and HTTP mappings.
  - `NotificationNotFound` -> 404 by suffix rule.
  - `PushSubscriptionNotFound` -> 404 by suffix rule.
  - `PushSubscriptionConflict` -> 409.
  - `BrowserPushNotConfigured` -> 503.
  - `PushSubscriptionEncryptFailed` -> 500 by default domain error mapping.
- Registered the controller/service in `NotificationModule` and imported `AuthModule`.

## Review Follow-up

- Aligned the browser push encryption failure error code with the API contract: `PushSubscriptionEncryptFailed`.
- Hardened browser push subscription persistence against cross-user endpoint hash races by updating only rows matching `endpointHash + userId`, creating otherwise, and rechecking ownership in the application service.
- Removed user-provided `deviceLabel` from subscription-created structured logs.
- Moved fixed notification controller routes before the parameterized read route.
- Added application-layer validation for invalid read filters.

## Verification

Executed from `BE` with PowerShell-safe `pnpm.cmd`:

```powershell
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- notification
pnpm.cmd run build
```

Results:

- `typecheck`: passed
- `lint`: passed
- `test -- notification`: passed, 4 suites / 31 tests
- `build`: passed

## Notes

- `POST /api/notifications/browser-subscriptions` returns `201` for successful create/upsert. The API contract allows `201` or `200`.
- Browser push endpoint, `p256dh`, and `auth` plaintext are accepted only at the HTTP/service boundary and are not returned or passed to repository persistence calls.
- `WEB_PUSH_VAPID_PRIVATE_KEY` is intentionally not read by G02 public-key API.
