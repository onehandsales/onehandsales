# Onboarding Job Selection API

- Status: confirmed
- Client: User Web
- Endpoint: `POST /api/users/me/onboarding/job-selection`
- Auth: Bearer access token required

## Request

No request body is required. The clicked label is intentionally not persisted in this version.

## Response

```json
{
  "jobSelectOnboardingCompletedAt": "2026-09-14T00:00:00.000Z"
}
```

## Behavior

1. Resolve the current authenticated user from the access token.
2. If `jobSelectOnboardingCompletedAt` is already set, return the existing timestamp.
3. If it is `null`, set it to the current UTC instant.
4. Return the completion timestamp.

## Errors

- `401 Unauthorized`: missing or invalid session.
- `403 InactiveUserError`: user is not active or cannot be resolved.

## Transaction / Observability

- Single user-row update. No explicit multi-step transaction is required.
- Do not log the clicked job label because it is not stored.
