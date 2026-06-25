# Log Soft Delete Plan

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
