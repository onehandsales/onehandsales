# Log Soft Delete Plan

Status: implemented

## Scope

- Company, contact, product memo/private memo logs.
- Deal following action and memo logs.
- Implement delete APIs and user-web delete UX only.
- Trash listing, restore, and paid recovery APIs are out of scope for this step.

## Policy

- Delete APIs never physically delete rows.
- Delete sets `deletedAt`, `deletedByUserId`, and `trashExpiresAt`.
- `trashExpiresAt` is `deletedAt + 7 days`.
- Normal list/update flows only target records where `deletedAt IS NULL`.

## Implemented Outputs

- Backend DELETE APIs for all 8 log types.
- Prisma migration `20260625010000_add_log_soft_delete_columns`.
- User Web delete confirmation modal and success feedback.
- API contract: `COMMON/API-SPEC/LOG_SOFT_DELETE_API.md`.
- DB schema docs updated under `AGENT/SOFTWARE_AGENT/DB_SCHEMA`.
