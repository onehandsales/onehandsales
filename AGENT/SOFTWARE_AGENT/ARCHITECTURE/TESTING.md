# Testing Architecture

## 1. Position

MVP test automation covers both frontend apps:

- `FE/user-web`
- `FE/admin-web`

Playwright is the E2E tool for both apps.

Because this repository has no root workspace and no shared packages, each frontend app owns its own test dependencies, Playwright config, and test scripts.

## 2. User Web E2E Scope

User Web E2E should cover the sales user's core workflow.

Priority flows:

- login and protected routing
- company CRUD
- contact CRUD
- product CRUD
- deal create/update/stage change
- deal activity log
- schedule CRUD and entity connection
- meeting note save and deal connection
- business card OCR upload flow with mocked AI/OCR result
- Excel/CSV import flow with mocked AI column mapping
- trash/restore smoke flow

## 3. Admin Web E2E Scope

Admin Web E2E should cover operational safety and global visibility.

Priority flows:

- admin login and role guard
- user list and user detail
- global company/contact/product/deal lists
- per-user company/contact/product/deal view
- sensitive field masking by default
- raw sensitive data view requires reason
- audit log record appears after audited action
- manual payment status management when the payment admin feature is added

## 4. Backend Test Scope

Backend tests are risk-based.

Priority:

- domain entities and value objects
- user ownership isolation
- AdminGuard and admin-only application methods
- sensitive raw access audit transaction
- import mapping validation
- trash retention and restore
- deal stage/activity logging
- meeting note to deal activity integration

## 5. External Services

E2E tests should not call paid or unstable external services by default.

Mock or stub:

- OpenAI
- OCR provider
- Google Calendar
- email/browser push

Use real providers only in explicitly named smoke jobs or manual production-safe checks.

## 6. CI Direction

When CI is introduced:

- run User Web Playwright tests from `FE/user-web`
- run Admin Web Playwright tests from `FE/admin-web`
- run Backend tests from `BE`
- do not introduce root-level package scripts unless the monorepo policy changes

CI timing:

- Pull request: run smoke E2E only for User Web and Admin Web.
- After merge to `main`: run full User Web and Admin Web E2E.
- Before deployment: run full User Web and Admin Web E2E again.

Rationale:

- PR checks should catch broken core flows without slowing every review too much.
- Full E2E after merge catches broader regressions on the integrated main branch.
- Full E2E before deployment is the final release gate.


