# Deployment Architecture

## 1. Environment Policy

MVP uses two environments only:

- `local`
- `production`

There is no `staging` environment in MVP.

Reason:

- MVP should keep operations simple.
- The project has not yet reached the point where a separate staging environment is worth the maintenance cost.
- Full E2E runs before deployment act as the release gate.

## 2. Local

`local` is used for:

- development
- local debugging
- local E2E runs
- mocked external provider testing

Local services may use:

- local backend process
- local frontend dev servers
- Supabase project or local Postgres depending on later implementation decision
- mocked OpenAI/OCR/Google Calendar/email/browser push where possible

## 3. Production

`production` is the only live environment.

Production is used for:

- real users
- real data
- real payments later
- real external provider calls when required

Rules:

- Production secrets are never used in local `.env`.
- Admin access is restricted and audited.
- Sensitive data is masked by default.
- Raw sensitive access requires explicit action, reason, and audit log.
- Deployment must run full User Web/Admin Web E2E before release.

## 4. CI And Release Gate

CI timing:

- Pull request: User Web/Admin Web smoke E2E.
- After merge to `main`: User Web/Admin Web full E2E.
- Before deployment: User Web/Admin Web full E2E again.

If pre-deployment full E2E fails, do not deploy.

## 5. External Provider Checks

Default automated E2E should mock or stub:

- OpenAI
- OCR provider
- Google Calendar
- email/browser push

Real provider checks are manual or explicitly named smoke jobs.

Because there is no staging environment, real provider checks must be narrowly scoped and must not mutate real user data unexpectedly.



