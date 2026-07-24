# G07 Follow-up Draft Send Backend Work Log

Date: 2026-07-24

## Scope Completed

- Added follow-up draft AI provider contract and deterministic provider.
- Added follow-up message repository contract and Prisma implementation.
- Added backend application service for:
  - `POST /api/follow-up-messages/drafts`
  - `PATCH /api/follow-up-messages/:messageId`
  - `GET /api/follow-up-messages/:messageId`
  - `POST /api/follow-up-messages/:messageId/send`
  - `POST /api/follow-up-messages/:messageId/retry`
  - `GET /api/follow-up-messages`
- Added authenticated follow-up message controller and DTOs.
- Implemented draft source validation so only `FOLLOW_UP` AI suggestions can create drafts.
- Implemented recipient validation against suggestion/report context:
  - Contact target.
  - Linked deal contacts.
  - Meeting note attendees.
  - Schedule-linked deal contacts.
  - Report snapshot fallback.
- Implemented sender readiness checks:
  - Email requires connected user email provider account with token ciphertext.
  - SMS requires verified user sender number.
- Implemented consent notice gating before send.
- Implemented status-transition based send/retry duplicate prevention.
- Implemented delivery attempt creation and success/failure persistence.
- Implemented retryable failure handling and retry endpoint.
- Implemented history query by AI report and target timeline.
- Updated development/test email and SMS provider adapters so G07 send flows can complete without real provider credentials.
- Added G07 domain errors and HTTP status mappings.

## Security And Redaction

- Full subject/body is stored only on `FollowUpMessage`.
- List API returns `bodyPreview`, not full `body`.
- Structured application logs do not include subject/body/provider raw response.
- AI provider call log metadata stores only safe identifiers and channel/language context.
- Provider send calls run outside DB transactions.
- OAuth token and SMS sender number are decrypted only immediately before provider send.
- SMS recipient raw phone is loaded from the user's contact record at send time and is not persisted on `FollowUpMessage`; only masked recipient phone is stored.

## Deliberately Excluded

- Provider connection settings API changes.
- User Web compose/history screens.
- Scheduled send.
- Multi-channel simultaneous send.
- Campaign or bulk sending.
- Production-specific real Gmail/Microsoft/SMS send adapter implementation beyond the existing configurable provider boundary.

## Verification

```powershell
cd BE
pnpm.cmd run prisma:validate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- follow-up
pnpm.cmd run build
```

Results:

- `prisma:validate`: passed.
- `typecheck`: passed.
- `lint`: passed.
- `test -- follow-up`: passed, 6 suites / 29 tests.
- `build`: passed.
