# G08 Follow-up User Web Work Log

Date: 2026-07-24

## Scope Completed

- Added User Web follow-up delivery feature module:
  - API client for `/api/follow-up-delivery/*` settings endpoints.
  - API client for `/api/follow-up-messages/*` draft, update, send, retry, detail, and list endpoints.
  - TanStack Query keys, queries, and mutations with settings/message invalidation.
- Added `/app/settings` follow-up delivery settings section:
  - Gmail and Microsoft 365 connection status.
  - Connect/reconnect entry using backend OAuth authorization URL.
  - Disconnect confirmation flow.
  - SMS sender E.164 verification request.
  - SMS verification code confirmation.
  - SMS sender revoke action and status display.
- Added AI weekly report follow-up compose flow:
  - Email/SMS channel selection.
  - Language selection.
  - Recipient selection.
  - AI draft generation.
  - Email subject/body editing.
  - SMS body editing with segment count and two-segment limit.
  - First-send consent notice acknowledgement.
  - Duplicate-click prevention while draft/update/send is pending.
  - Safe API error display without logging message body.
- Added follow-up history timeline UI:
  - AI report source history panel.
  - Deal detail target history panel.
  - Contact detail target history panel.
  - Page-number pagination.
  - Expand-on-demand message detail body loading.
  - Retry action for retryable failed messages.
- Added backend detail-response contract support so ready AI report suggestion items include:
  - `id`
  - `sourceSuggestionId`
  - `suggestionKey`
- Added backend test coverage for attaching stored suggestion IDs to ready report detail sections.

## UX/UI Notes

- Settings and timeline layouts follow the existing work-tool density and card/list conventions.
- Mobile layouts use stacked panels and card-style timeline items instead of tables.
- User-facing copy added in this goal uses 해요체.
- The compose dialog keeps the success state visible after send until the user closes it.
- Sent messages lock editing controls.

## Security And Redaction

- User Web calls only `/api/*` user endpoints and does not call `/admin/api/*`.
- Message list UI uses `bodyPreview`; full body is fetched only when a timeline item is expanded.
- Compose and timeline components do not write subject/body to console logs.
- Failed send UI uses backend safe error messages.

## Deliberately Excluded

- Admin cost screen.
- Scheduled send.
- Campaign or bulk sending.
- Onehand.sales branding insertion.
- Real provider UX beyond the existing G06/G07 backend provider boundaries.
- Playwright mobile E2E run; static type/lint/build checks were used for this goal.

## Verification

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build

cd BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- ai-weekly-sales-report-application.service.spec.ts
pnpm.cmd run build

cd ..
git diff --check
rg -n "/admin/api" FE/user-web/src/features/follow-up-delivery FE/user-web/src/features/ai-weekly-report FE/user-web/src/pages/settings/index.tsx FE/user-web/src/features/deal/components/deal-detail-panel.tsx FE/user-web/src/features/contact/components/contact-detail-screen.tsx
```

Results:

- FE `typecheck`: passed.
- FE `lint`: passed.
- FE `build`: passed.
- BE `typecheck`: passed.
- BE `lint`: passed.
- BE focused test: passed, 1 suite / 4 tests.
- BE `build`: passed.
- `git diff --check`: passed.
- `/admin/api` search in touched User Web paths: no matches.

Known warnings:

- FE build still reports the existing Tailwind `duration-[500ms]` ambiguity warning.
- FE build still reports the existing large chunk warning.
