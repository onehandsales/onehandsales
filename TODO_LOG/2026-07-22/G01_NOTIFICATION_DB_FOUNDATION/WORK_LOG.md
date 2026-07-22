# G01 Notification DB Foundation Work Log

## Summary

- Goal: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/GOAL-SPECS/G01_DB_NOTIFICATION_FOUNDATION.md`
- Date: 2026-07-22
- Result: Done

## Scope

- Completed the Notification Reminder G01 DB foundation.
- Added Prisma schema and migration for notification settings, notifications, delivery attempts, and browser push subscriptions.
- Added repository port, Prisma adapter, NotificationModule provider wiring, and browser push subscription encryption service.
- Added unit coverage for user ownership repository queries and endpoint/key encryption behavior.

## Changes

- `BE/prisma/schema.prisma`
  - Added `NotificationType`, `NotificationStatus`, `NotificationSourceType`, `NotificationDeliveryChannel`, `NotificationDeliveryStatus`, and `BrowserPushSubscriptionStatus`.
  - Added `UserNotificationSetting`, `Notification`, `NotificationDeliveryAttempt`, and `BrowserPushSubscription`.
  - Added `User` relations for notification settings, notifications, delivery attempts, and browser push subscriptions.
- `BE/prisma/migrations/20260722010000_add_notification_reminder/migration.sql`
  - Added enum types, tables, indexes, FKs, check constraints, and SQL comments.
- `BE/src/modules/notification`
  - Added repository and browser push subscription encryption ports.
  - Added Prisma repository adapter and encrypted browser push subscription storage service.
  - Added `NotificationModule` provider wiring.
- `BE/src/app.module.ts`
  - Registered `NotificationModule`.
- `BE/src/modules/README.md`
  - Documented the new notification foundation module.

## NBA-014 Gate

- `BE/.env` does not define `DATABASE_URL` or `DIRECT_URL`, so no local/dev/test DB target could be classified from the active app env.
- `prisma:migrate`, `prisma:migrate:deploy`, and `prisma:seed` were not executed.
- `prisma:generate` initially hit the known Windows Prisma query engine DLL lock while BE runtime processes were active.
- Stopped only the local BE runtime processes (`pnpm run start:dev`, Nest watch, and `node dist/main`) to release the DLL lock, then reran `prisma:generate` successfully.
- Restarted the BE `start:dev` process after verification. The previous duplicate `node dist/main` process was not restarted to avoid port conflict.

## Verification

- `cd BE; pnpm.cmd run prisma:validate`: passed.
- `cd BE; pnpm.cmd run prisma:generate`: passed after releasing the local Prisma DLL lock.
- `cd BE; pnpm.cmd run typecheck`: passed.
- `cd BE; pnpm.cmd run lint`: passed.
- `cd BE; pnpm.cmd run test -- notification`: passed, 2 suites / 9 tests.
- `cd BE; pnpm.cmd run build`: passed.

## Remaining Scope

- G02 must implement the Notification User API.
- G03 must connect schedule/deal reminder generation, due processing, and email/browser push delivery attempts.
- G04 must open `/app/notifications` and wire User Web unread/settings/push UX.
- SMTP/Web Push runtime dependencies and provider adapters are not part of G01.
