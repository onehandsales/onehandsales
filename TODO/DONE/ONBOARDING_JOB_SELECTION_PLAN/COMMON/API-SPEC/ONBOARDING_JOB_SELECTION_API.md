# Onboarding Job Selection API

- Status: implemented
- Client: User Web
- Endpoint: `POST /api/users/me/onboarding/job-selection`
- Auth: Bearer access token required

## Request

No request body is required. The clicked label is intentionally not persisted in this version.

## Response

```json
{
  "jobSelectOnboardingCompletedAt": "2026-09-14T00:00:00.000Z",
  "workspaceId": "workspace-id",
  "workspace": {
    "id": "workspace-id",
    "name": "User Workspace",
    "kind": "PERSONAL",
    "organizationName": null,
    "organizationDomain": null,
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z"
  },
  "workspaceMember": {
    "id": "workspace-member-id",
    "workspaceId": "workspace-id",
    "userId": "user-id",
    "role": "OWNER",
    "joinedAt": "2026-09-14T00:00:00.000Z",
    "createdAt": "2026-09-14T00:00:00.000Z",
    "updatedAt": "2026-09-14T00:00:00.000Z"
  }
}
```

## Behavior

1. Resolve the current authenticated user from the access token.
2. Find the first `WorkspaceMember` where the current user is `OWNER`.
3. If no OWNER workspace membership exists, create a PERSONAL `Workspace` and OWNER `WorkspaceMember`.
4. If `jobSelectOnboardingCompletedAt` is already set, keep the existing timestamp.
5. If it is `null`, set it to the current UTC instant.
6. Return the completion timestamp, top-level workspace ID, workspace, and workspace member.

## Errors

- `401 Unauthorized`: missing or invalid session.
- `403 InactiveUserError`: user is not active or cannot be resolved.

## Transaction / Observability

- The completion timestamp and OWNER workspace bootstrap run in one application-level transaction.
- The flow may write `User.jobSelectOnboardingCompletedAt`, `Workspace`, and `WorkspaceMember`.
- `Team`, `TeamMember`, kit, object, record, product, and other domain records are not created by this endpoint.
- Do not log the clicked job label because it is not stored.
