# User id DB generated default

## Status

Complete

## Date

2026-09-15

## Goal

Change `User.id` from Prisma-generated UUID default to the database-generated `gen_random_uuid()` default for consistency with Workspace and Team foundation tables.

## Scope

- Update Prisma schema for `User.id`.
- Add and apply a Prisma migration to set the PostgreSQL default.
- Update the auth user schema document snippet.
- Verify Supabase migration status, schema diff, generated client, and backend typecheck.

## Progress

- Added `20260915020000_use_db_generated_user_id_default`.
- Updated `BE/prisma/schema.prisma`.
- Updated `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`.

## Verification

- `BE`: `pnpm.cmd run prisma:validate` passed.
- `BE/Supabase`: `pnpm.cmd run prisma:migrate:deploy` applied `20260915020000_use_db_generated_user_id_default`.
- `BE/Supabase`: `pnpm.cmd exec prisma migrate status` reports `Database schema is up to date!`.
- `BE/Supabase`: `pnpm.cmd exec prisma db pull --print` confirms `User.id` uses `@default(dbgenerated("gen_random_uuid()"))`.
- `BE/Supabase`: `pnpm.cmd exec prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --exit-code` passed with `No difference detected.`
- `BE`: `pnpm.cmd run prisma:generate` passed.
- `BE`: `pnpm.cmd run typecheck` passed.
- Root: `git diff --check` passed with line-ending warnings only.

## Remaining Risk

- None known for this scoped change.
