# Onboarding Job Selection Plan

- Status: done
- Owner: User Web / Backend
- Scope: Complete the first-login job-selection onboarding gate.

## Implementation Notes

- `POST /api/users/me/onboarding/job-selection` is implemented.
- First-time authenticated users are routed to `/onboarding` before `/app`.
- The clicked job label is not persisted in this version.
- The flow stores `User.jobSelectOnboardingCompletedAt`.
- The flow ensures the user has an OWNER workspace membership.
- If the user has no OWNER workspace membership, it creates a PERSONAL `Workspace` and OWNER `WorkspaceMember`.
- The flow does not create `Team`, `TeamMember`, kit, object, record, product, or other domain records.

## Completion Notes

- The original API plan only covered the completion timestamp.
- The implemented scope was expanded by `TODO_LOG\2026-09-15\JOB_SELECTION_OWNER_WORKSPACE_BOOTSTRAP\WORK_LOG.md`.
- Remaining current-workspace selection/query behavior after `/app` entry is a separate follow-up scope.
