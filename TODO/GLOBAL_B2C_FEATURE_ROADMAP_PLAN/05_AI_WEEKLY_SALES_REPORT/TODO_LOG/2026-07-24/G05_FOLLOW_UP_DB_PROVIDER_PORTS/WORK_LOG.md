# G05 Follow-up DB Provider Ports Work Log

Date: 2026-07-24

## Scope Completed

- Added follow-up delivery Prisma enums and models:
  - `ExternalEmailConnection`
  - `ExternalEmailOAuthState`
  - `SmsSenderNumber`
  - `FollowUpConsentNotice`
  - `FollowUpMessage`
  - `FollowUpMessageTarget`
  - `FollowUpDeliveryAttempt`
- Added migration SQL:
  - `BE/prisma/migrations/20260724020000_add_follow_up_delivery_foundation/migration.sql`
  - Includes table/index/column comments and DB-level safety checks for non-empty values, retry counts, attempt numbers, and latency.
- Added follow-up provider port contracts:
  - `BE/src/modules/follow-up/application/ports/follow-up-delivery.provider.ts`
- Added follow-up delivery secret encryption port and Node implementation:
  - `BE/src/modules/follow-up/application/ports/follow-up-delivery-secret-encryption.port.ts`
  - `BE/src/modules/follow-up/infrastructure/security/node-follow-up-delivery-secret-encryption.service.ts`
- Added safe provider error mapper:
  - `BE/src/modules/follow-up/application/services/follow-up-delivery-safe-error.mapper.ts`
- Added `FollowUpModule` and registered it in `AppModule`.
- Updated local seed cleanup order for new follow-up FK dependencies.
- Documented follow-up encryption environment variables in `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`.

## Deliberately Excluded

- OAuth endpoint controller.
- Follow-up draft/send endpoint controller.
- User Web settings and compose screens.
- Real Google/Microsoft/SMS provider smoke calls.

These remain in later goals.

## Redaction Coverage

- Encryption tests assert OAuth token, SMS sender phone, OAuth state, and SMS verification code raw values do not appear in serialized encrypted/hash output.
- Safe error mapper tests assert provider raw error/response, token, phone, subject, and body do not appear in serialized safe error output.

## Verification

```powershell
cd BE
pnpm.cmd run prisma:validate
pnpm.cmd run prisma:generate
pnpm.cmd run test -- follow-up
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```

Results:

- `prisma:validate`: passed.
- `prisma:generate`: passed.
- `test -- follow-up`: passed, 2 suites / 14 tests.
- `typecheck`: passed.
- `lint`: passed.
- `build`: passed.
