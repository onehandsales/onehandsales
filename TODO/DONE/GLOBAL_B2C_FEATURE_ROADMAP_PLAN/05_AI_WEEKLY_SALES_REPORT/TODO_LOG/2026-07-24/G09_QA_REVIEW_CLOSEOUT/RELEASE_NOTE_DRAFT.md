# 05 AI Weekly Sales Report Release Note Draft

상태: Draft
작성일: 2026-07-24

## Summary

05 AI Weekly Sales Report is complete through G09 QA closeout. The release adds saved AI weekly sales reports on top of the existing weekly schedule report and enables user-confirmed follow-up email/SMS drafts, send, retry, and timeline history.

## Included

- AI weekly sales report generation through `POST /api/sales-reports/weekly`
- Weekly report version history, failed version retention, and snapshot summary endpoint
- Follow-up delivery settings for Gmail/Microsoft 365 connection, SMS sender verification, and channel consent notice
- Follow-up draft creation from AI suggestions, user edit gate, immediate send, safe failure, retry, and timeline display
- User Web integration in `/app/schedules/week`, `/app/settings`, deal detail, and contact detail

## QA Result

- Backend required commands passed: Prisma validate, typecheck, lint, full test, build.
- Frontend required commands passed: typecheck, lint, build, mobile E2E.
- Mobile E2E passed on Chrome 390px and 360px projects.
- `/admin/api/*` dependency was not found in the AI weekly report/follow-up User Web feature surface.

## Release Constraints

- Actual Gmail/Microsoft/SMS provider smoke is not complete until production credentials and provider console callback URLs are configured.
- Production SMS delivery still needs a real provider adapter/credential path before external SMS smoke can be marked complete.
- FE build has a non-blocking main chunk size warning; handle code splitting separately.
