# G04 User Web Notification UX Work Log

Date: 2026-07-22
Status: Done

## Scope

- Implemented the User Web notification UX for `/app/notifications`.
- Kept Admin Web, marketing notifications, next-action reminders, and meeting-note follow-up reminders out of scope.

## Implemented

- Exposed `/app/notifications` by replacing the redirect with `NotificationsPage`.
- Aligned the User Web notification API client and types with `COMMON/API-SPEC/NOTIFICATION_API.md`.
  - List query uses `read` and `includeUpcoming`.
  - Settings use `GET/PATCH /api/notifications/settings`.
  - Browser push public key, subscription create/revoke, and unread-count APIs are wired.
- Added app shell notification bell with unread badge and `99+` display.
- Reworked the notification screen around the 02 reminder contract.
  - List, read filter, pagination, unread count, linked record action, read mutation, and loading/empty/error states.
  - Settings panel for schedule, deal, email, and browser push toggles.
  - Browser push permission/subscription UX with unsupported, denied, and missing public-key fallback states.
- Updated `notification-sw.js` so notification clicks default to `/app/notifications`.
- Updated Playwright mocks for notification list, unread count, settings, browser push public key, subscription create/revoke, and read mutation.
- Added `/app/notifications` to mobile browser QA route coverage.

## Security / UX Notes

- Notification rows show title/body/target label only; private memo, meeting note body, provider raw detail, push endpoint/key, and deal amount are not introduced into the UI.
- Browser push public-key lookup failure is shown inside the push panel and does not break the full notification page.
- Read mutation invalidates both list and unread-count queries.

## Verification

Executed from `FE/user-web` with PowerShell-safe `pnpm.cmd`:

```powershell
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
pnpm.cmd run test:e2e
pnpm.cmd run test:e2e:mobile
```

Results:

- `typecheck`: passed
- `lint`: passed
- `build`: passed
- `test:e2e`: passed, 16 tests
- `test:e2e:mobile`: passed, 12 tests across mobile Chrome/Edge 360px/390px profiles

## Notes

- `vite build` and Playwright web server output still report the existing Tailwind warning for `duration-[500ms]`.
- `vite build` still reports the existing large chunk warning.
