# G03 Reminder Generation Delivery Work Log

Date: 2026-07-22
Status: Done

## Scope

- Implemented reminder generation and cancellation for schedules and deals.
- Implemented due notification processing, delivery attempt persistence, retry creation, SMTP email adapter, Web Push VAPID adapter, and an optional background runner.
- Kept User Web notification UX and `/app/notifications` route exposure out of scope for G04.

## Implemented

- Added reminder scheduling use cases.
  - `ScheduleNotificationReminderUseCase`
  - `CancelScheduleNotificationReminderUseCase`
  - `ScheduleDealDueReminderUseCase`
  - `CancelDealDueReminderUseCase`
- Added `NotificationReminderWriteRepository` so schedule/deal repositories can perform reminder writes with their current transaction client.
- Wired Schedule create/update/delete to schedule or cancel `SCHEDULE_START_REMINDER`.
- Wired Deal create/update/delete to schedule or cancel `DEAL_DUE_REMINDER`.
- Added reminder dedupe upsert behavior.
  - Pending notifications for the same source but different dedupe key are canceled.
  - Existing canceled/failed reminder rows with the same dedupe key can be reactivated as pending.
  - Already sent notifications are not reset to pending.
- Added `ProcessDueNotificationsUseCase`.
  - Queries due pending notifications.
  - Marks app notifications as `SENT`.
  - Creates email/browser push delivery attempts according to user settings.
  - Calls providers outside the DB transaction.
  - Stores success/failure with safe provider metadata only.
- Added `SendNotificationDeliveryAttemptUseCase`.
  - Stores SMTP success/failure.
  - Stores Web Push success/failure.
  - Schedules retryable failures up to 3 attempts.
  - Creates a new delivery attempt row for retry.
  - Revokes browser push subscriptions on 404/410-style provider failure.
- Added provider adapters.
  - `SmtpNotificationEmailDeliveryAdapter`
  - `VapidBrowserPushDeliveryAdapter`
- Added optional background processor runner.
  - Enabled only by `NOTIFICATION_PROCESSOR_ENABLED=true`.
  - Uses `NOTIFICATION_PROCESSOR_BATCH_SIZE` and `NOTIFICATION_PROCESSOR_INTERVAL_MS`.
- Added dependencies.
  - `nodemailer`
  - `web-push`
  - `@types/nodemailer`
  - `@types/web-push`

## Security / Redaction

- Push endpoint, `p256dh`, and `auth` are decrypted only for provider calls and are not persisted in delivery attempt records.
- Provider raw responses are not stored.
- Provider failure storage uses safe error code/message fields.
- Delivery logs include IDs, channel, provider, and safe error code only.
- Email body is passed to SMTP only and is not logged.
- Deal amount, private memo, and meeting note body are not included in reminder payloads.

## Notes

- `BE/.env.example` is not the repo environment contract. G03 env names are documented in `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, with actual values kept in `BE/.env`.
- Schedule/Deal source mutations and pending reminder cancel/upsert now execute in the same source repository transaction. `PrismaScheduleRepository` and `PrismaDealRepository` implement `NotificationReminderWriteRepository` and delegate reminder writes to `PrismaNotificationRepository` with the current transaction client.
- Provider smoke tests were not run because real SMTP/Web Push credentials are not present in this workspace.

## Verification

Executed from `BE` with PowerShell-safe `pnpm.cmd`:

```powershell
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- notification
pnpm.cmd run test -- schedule-application.service
pnpm.cmd run test -- deal-application.service
pnpm.cmd run test -- ownership-isolation
pnpm.cmd run prisma:validate
pnpm.cmd run build
```

Results:

- `typecheck`: passed
- `lint`: passed
- `test -- notification`: passed, 6 suites / 36 tests
- `test -- schedule-application.service`: passed, 1 suite / 5 tests
- `test -- deal-application.service`: passed, 1 suite / 8 tests
- `test -- ownership-isolation`: passed, 1 suite / 9 tests
- `prisma:validate`: passed
- `build`: passed
