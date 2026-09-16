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
  "jobSelectOnboardingCompletedAt": "2026-09-14T00:00:00.000Z"
}
```

## Behavior

1. Resolve the current authenticated user from the access token.
2. Find the first `WorkspaceMember` where the current user is `OWNER`.
3. If no OWNER workspace membership exists, create a PERSONAL `Workspace` and OWNER `WorkspaceMember`.
4. If `jobSelectOnboardingCompletedAt` is already set, keep the existing timestamp.
5. If it is `null`, set it to the current UTC instant.
6. Return only the completion timestamp.
7. User Web then navigates to `/app`; the `/app` sidebar resolves the default Workspace through the sidebar Workspace API.

## Errors

- `401 Unauthorized`: missing or invalid session.
- `403 InactiveUserError`: user is not active or cannot be resolved.

## Transaction / Observability

- The completion timestamp and OWNER workspace guarantee run in one application-level transaction.
- The flow may write `User.jobSelectOnboardingCompletedAt`, `Workspace`, and `WorkspaceMember`.
- `Team`, `TeamMember`, kit, object, record, product, and other domain records are not created by this endpoint.
- Do not log the clicked job label because it is not stored.

## Compatibility

- Breaking change versus the previous internal contract: response no longer includes `workspaceId`, `workspace`, or `workspaceMember`.
- User Web must not depend on this endpoint for Workspace summary data; `/app` sidebar uses the sidebar Workspace API when it needs the default Workspace summary.

## Implementation

- Backend use case: `BE/src/modules/user/application/use-cases/complete-job-selection-onboarding.use-case.ts`
- Frontend API type: `FE/user-web/src/features/auth/types/auth.ts`
- Frontend onboarding flow: `FE/user-web/src/pages/onboarding/index.tsx`
- Verification:
  - `pnpm.cmd -C BE typecheck`
  - `pnpm.cmd -C BE lint`
  - `pnpm.cmd -C BE test -- --runInBand`
  - `pnpm.cmd -C BE prisma:validate`
  - `pnpm.cmd -C BE build`
  - `pnpm.cmd -C FE/user-web typecheck`
  - `pnpm.cmd -C FE/user-web lint`
