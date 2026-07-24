# G06 Follow-up Settings Backend Work Log

Date: 2026-07-24

## Scope Completed

- Added follow-up settings repository contract and Prisma implementation.
- Added backend application service for:
  - `GET /api/follow-up-delivery/settings`
  - `POST /api/follow-up-delivery/email-connections/:provider/connect`
  - `GET /api/follow-up-delivery/email-connections/:provider/callback`
  - `POST /api/follow-up-delivery/email-connections/:connectionId/disconnect`
  - `POST /api/follow-up-delivery/sms-sender-numbers`
  - `POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/verify`
  - `POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/revoke`
  - `POST /api/follow-up-delivery/consent-notices/:channel/acknowledge`
- Added authenticated settings controller and unauthenticated OAuth callback controller.
- Added configurable Gmail/Microsoft email provider adapter.
  - Uses real provider env when present.
  - Uses deterministic test/dummy provider outside production when provider env is absent.
- Added SMS verification provider adapter.
  - Uses deterministic test/dummy provider outside production.
  - Real SMS follow-up send remains outside G06.
- Added domain errors and HTTP status mapping for OAuth state, SMS verification, and provider failures.
- Added follow-up provider env documentation.
- Added migration to allow `ExternalEmailConnection.encryptedAccessToken` to be cleared on disconnect.

## Security And Redaction

- OAuth raw state is returned only to provider authorization URL and stored as HMAC hash.
- OAuth callback restores user ownership from DB state, not Bearer auth.
- OAuth state replay is rejected by `consumedAt` transition.
- OAuth token exchange runs before DB transaction; token storage and state consume run inside transaction.
- SMS verification code is sent to provider and stored only as HMAC hash.
- SMS sender phone is stored as hash/ciphertext/masked value.
- Settings response returns masked email/phone values and omits token/code/ciphertext fields.
- Disconnect clears email token ciphertext and preserves connection history.

## Deliberately Excluded

- AI follow-up draft generation.
- Actual email/SMS follow-up send endpoint.
- User Web settings UI.
- Production SMS provider integration.

## Verification

```powershell
cd BE
pnpm.cmd run prisma:validate
pnpm.cmd run prisma:generate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- follow-up
pnpm.cmd run build
```

Results:

- `prisma:validate`: passed.
- `prisma:generate`: passed.
- `typecheck`: passed.
- `lint`: passed.
- `test -- follow-up`: passed, 4 suites / 20 tests.
- `build`: passed.
