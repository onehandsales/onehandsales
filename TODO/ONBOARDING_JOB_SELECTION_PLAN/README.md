# Onboarding Job Selection Plan

- Status: confirmed
- Owner: User Web / Backend
- Scope: Complete the first-login job-selection onboarding gate.

## Implementation Notes

- Add `POST /api/users/me/onboarding/job-selection`.
- Store only `User.jobSelectOnboardingCompletedAt`.
- Route first-time authenticated users to `/onboarding` before `/app`.
- Do not create workspace, team, member, or product/domain records in this flow.
