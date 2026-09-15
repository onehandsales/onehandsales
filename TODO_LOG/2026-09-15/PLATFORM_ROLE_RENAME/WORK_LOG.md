# Platform role rename

## Status

Complete

## Date

2026-09-15

## Goal

Rename the platform-level user role from `UserRole` / `User.role` to `PlatformRole` / `User.platformRole`, keeping workspace and team roles separate.

## References

- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

## Planned Scope

- Prisma schema and migration for platform role naming.
- Backend auth/current-user/admin guard/profile/support/error-report mappings.
- User Web and Admin Web response types and role display references.
- Focused typecheck/test verification.

## Progress

- Started impact scan for `UserRole`, `userRole`, and `role` references.
- Renamed the Prisma enum/model fields from `UserRole` / `role` to `PlatformRole` / `platformRole`.
- Added a Prisma migration that renames the existing enum, user column, user index, and role snapshot columns.
- Added database comments for the renamed platform role columns.
- Updated backend auth/current-user/admin guard/profile/support/error-report mappings and tests.
- Updated User Web and Admin Web auth/profile types, UI references, and API mocks.
- Updated related AGENT schema/architecture docs.
- Rechecked Supabase schema state. The DB already matched the pre-rename schema, but Prisma migration history was missing/broken.
- Marked existing migrations before `20260915010000_rename_user_role_to_platform_role` as applied with `prisma migrate resolve`.
- Applied `20260915010000_rename_user_role_to_platform_role` to the Supabase DB with `prisma migrate deploy`.
- Aligned Workspace/WorkspaceMember/Team/TeamMember `id` defaults in Prisma schema to the DB-backed `gen_random_uuid()` defaults to remove drift.

## Verification

- `BE`: `pnpm.cmd prisma:validate` passed.
- `BE`: `pnpm.cmd prisma:generate` passed once, later hit a Windows Prisma engine DLL lock after schema drift cleanup; `$env:PRISMA_GENERATE_NO_ENGINE='1'; pnpm.cmd prisma:generate` passed for type generation.
- `BE`: `pnpm.cmd typecheck` passed.
- `BE`: `pnpm.cmd lint` passed.
- `BE`: `pnpm.cmd test -- --runInBand` passed.
- `FE/user-web`: `pnpm.cmd typecheck` passed.
- `FE/user-web`: `pnpm.cmd lint` passed.
- `FE/admin-web`: `pnpm.cmd typecheck` passed.
- `FE/admin-web`: `pnpm.cmd lint` passed.
- `BE/Supabase`: initial `pnpm.cmd run prisma:migrate:deploy` failed because `UserRole` already existed while migration history was not recorded.
- `BE/Supabase`: `pnpm.cmd exec prisma migrate status` now reports `Database schema is up to date!`.
- `BE/Supabase`: `pnpm.cmd exec prisma db pull --print` confirms `PlatformRole`, `User.platformRole`, `ErrorReport.userPlatformRole`, and `SupportRequest.userPlatformRole`.
- `BE/Supabase`: `pnpm.cmd exec prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --exit-code` passed with `No difference detected.`
- Root: `git diff --check` passed with line-ending warnings only.

## Remaining Risk

- Regular `prisma generate` may still need to be retried after closing any process that locks `node_modules/.prisma/client/query_engine-windows.dll.node`; type generation succeeded with `PRISMA_GENERATE_NO_ENGINE=1`.
