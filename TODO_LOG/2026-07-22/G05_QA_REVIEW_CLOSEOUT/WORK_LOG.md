# G05 QA Review Closeout Work Log

Date: 2026-07-22
Status: Done

## Scope

- Closed the 02 Notification Reminder implementation against `COMMON/REVIEW-CHECKLIST.md`.
- Verified Backend API, DB/migration, reminder scheduling, delivery processor, provider failure redaction, ownership isolation, and User Web notification UX.
- Kept next-action reminders, meeting-note follow-up reminders, Admin provider failure UI, Billing/email compliance full review, and native push QA out of scope.

## QA Evidence

Product scope:

- Notification types remain limited to `SCHEDULE_START_REMINDER` and `DEAL_DUE_REMINDER`.
- Delivery channels remain limited to `EMAIL` and `BROWSER_PUSH`.
- Next-action, meeting-note follow-up, marketing notification, and automation-builder behavior were not added.

Scheduling:

- Added service-level tests proving schedule create/update/delete call reminder schedule/cancel use cases in the source transaction.
- Added service-level tests proving deal create/expectedEndDate update/delete call due reminder schedule/cancel use cases in the source transaction.
- Existing notification scheduling tests prove schedule start reminder timing, past schedule skip, and deal due reminder at user timezone local 09:00 one day before expected end date.

Delivery:

- Existing due processor tests prove due notifications are marked `SENT`, email attempts are created/sent, retryable failures create retry attempts, provider failure does not roll back app notification state, and non-retryable push failures revoke subscriptions.
- Added due processor test proving successful browser push delivery attempts are marked `SENT`.
- Provider raw details, push endpoint/key storage, and email body persistence are not introduced into delivery attempt records.

Security / ownership:

- Notification API tests cover AuthGuard routes, validation, missing VAPID public key 503, cross-user notification/subscription 404, encryption failure mapping, ownership, read idempotency, default settings, and encrypted browser push subscription persistence.
- `ownership-isolation` test suite passed for existing user-owned domains and admin boundary.
- Prisma migration includes notification enums/models/indexes/FKs/check constraints and comments.
- DB/Prisma gate evidence is inherited from G01: `BE/.env` had no `DATABASE_URL`/`DIRECT_URL` to classify a shared target, and no migrate/seed command was executed in G05.

User Web:

- `/app/notifications` is exposed.
- App shell unread badge is wired to `/api/notifications/unread-count`.
- Read mutation invalidates list and unread-count queries.
- Settings save uses `/api/notifications/settings` and persists in E2E mock state across reload.
- Browser push denied fallback now disables permission request/subscription actions and shows browser settings guidance.
- Browser push unsupported fallback now disables permission request/subscription actions and shows unsupported-browser guidance.
- Mobile 360px/390px Chrome/Edge QA includes `/app/notifications` and passed without document overflow.

## Verification Commands

Backend commands executed from `BE`:

```powershell
pnpm.cmd run prisma:validate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- notification
pnpm.cmd run test -- schedule-application.service
pnpm.cmd run test -- deal-application.service
pnpm.cmd run test -- ownership-isolation
pnpm.cmd run build
```

Backend results:

- `prisma:validate`: passed
- `typecheck`: passed
- `lint`: passed
- `test -- notification`: passed, 6 suites / 37 tests
- `test -- schedule-application.service`: passed, 1 suite / 8 tests
- `test -- deal-application.service`: passed, 1 suite / 11 tests
- `test -- ownership-isolation`: passed, 1 suite / 9 tests
- `build`: passed

User Web commands executed from `FE/user-web`:

```powershell
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
pnpm.cmd exec playwright test tests/e2e/notification-reminder-ux.spec.ts
pnpm.cmd run test:e2e
pnpm.cmd run test:e2e:mobile
```

User Web results:

- `typecheck`: passed
- `lint`: passed
- `build`: passed
- `notification-reminder-ux.spec.ts`: passed, 3 tests
- `test:e2e`: passed, 19 tests
- `test:e2e:mobile`: passed, 12 tests across mobile Chrome/Edge 360px/390px profiles

## Provider Smoke Note

- `BE/.env` exists but does not define SMTP/Web Push provider keys (`SMTP_*`, `WEB_PUSH_VAPID_*`, `NOTIFICATION_PROCESSOR_*`) in this workspace.
- Real external SMTP/Web Push provider smoke was not run.
- G05 provider QA was completed with adapter/stub behavior and forced provider success/failure tests. Production or shared-dev provider smoke must be performed once real credentials are intentionally configured.

## Build Warnings

- User Web build and Playwright web server still report the pre-existing Tailwind warning for `duration-[500ms]`.
- User Web build still reports the pre-existing large chunk warning.
