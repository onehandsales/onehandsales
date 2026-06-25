# Log Soft Delete API

Status: confirmed
Consumer: User Web

## Behavior

- All endpoints require the current authenticated user.
- Successful delete returns `204 No Content`.
- Delete stores:
  - `deletedAt`: current UTC instant
  - `deletedByUserId`: current user id
  - `trashExpiresAt`: `deletedAt + 7 days`
- Deleted logs are excluded from normal list/update APIs.
- Physical deletion, trash list, restore, and paid recovery are not included here.

## Endpoints

| Domain | Method | Path | Response |
| --- | --- | --- | --- |
| Company memo | DELETE | `/api/companies/{companyId}/memo-logs/{memoLogId}` | 204 |
| Company private memo | DELETE | `/api/companies/{companyId}/private-memo-logs/{privateMemoLogId}` | 204 |
| Contact memo | DELETE | `/api/contacts/{contactId}/memo-logs/{memoLogId}` | 204 |
| Contact private memo | DELETE | `/api/contacts/{contactId}/private-memo-logs/{privateMemoLogId}` | 204 |
| Product memo | DELETE | `/api/products/{productId}/memo-logs/{memoLogId}` | 204 |
| Product private memo | DELETE | `/api/products/{productId}/private-memo-logs/{privateMemoLogId}` | 204 |
| Deal following action | DELETE | `/api/deals/{dealId}/following-action-logs/{followingActionLogId}` | 204 |
| Deal memo | DELETE | `/api/deals/{dealId}/memo-logs/{memoLogId}` | 204 |

## Errors

| Condition | Error |
| --- | --- |
| Parent entity does not exist for current user | Existing parent not-found error |
| Log does not exist, is owned by another user, belongs to another parent, or is already deleted | Existing log not-found error |
