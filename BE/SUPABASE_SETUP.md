# Supabase Setup

This backend currently uses Supabase only as an external Auth provider.

## Scope

- PostgreSQL: Backend connects directly through Prisma.
- Auth: FE signs in with Supabase Auth, then Backend verifies the Supabase access token through `/api/auth/exchange`.
- Backend owns the app session after exchange. Supabase Auth is not the application session store.

FE must not write directly to Supabase PostgreSQL.

## Required Values

Create `BE/.env` directly and fill these values. This repository uses `.env` plus `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md` as the environment contract; `.env.example` and `.env.local` are not the source of truth. The current Backend bootstrap can read `BE/.env.local` as a local override, but variables that exist only there are not shared contract variables.

```env
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_JWKS_URL="https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json"
SUPABASE_JWT_ISSUER="https://<project-ref>.supabase.co/auth/v1"
SUPABASE_JWT_AUDIENCE="authenticated"
APP_JWT_SECRET=""
APP_REFRESH_TOKEN_SECRET=""
INITIAL_ADMIN_EMAILS=""
```

Use long random strings for `APP_JWT_SECRET` and `APP_REFRESH_TOKEN_SECRET`.

`INITIAL_ADMIN_EMAILS` is a comma-separated allowlist for the first admin accounts.

See `../AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md` for the complete current variable list. Do not copy real values into docs, issues, or logs.

## Verification

```bash
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run build
```

## Provider Notes

- Google OAuth signup/login has passed manual QA.
- Kakao OAuth requires Kakao Developers configuration before QA:
  - Kakao Login enabled.
  - Consent item `account_email` configured as optional or required consent.
  - Supabase Kakao provider keys and callback URL registered.
- If Kakao shows `KOE205` with `account_email`, the OAuth request is asking for an unconfigured Kakao consent item. Do not remove email from the product flow without redesigning Backend identity, because the current Backend requires provider email during exchange.

## Locale And Country Metadata

- Frontend sends `locale` and IANA `timeZone` during exchange.
- Backend reads country from proxy geo headers: `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`.
- Local development and deployments without those headers store `signupCountryCode`/`lastLoginCountryCode` as `null`.

## Current Code Links

- Auth verifier port: `src/shared/application/ports/external-auth-verifier.port.ts`
- Supabase JWT adapter: `src/shared/infrastructure/supabase/supabase-jwt-verifier.adapter.ts`

Business domain tables and migrations should be added later only when requested.
