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
- Google is the only active Supabase OAuth provider.
- Kakao OAuth has been removed from runtime exposure and exchange. Existing Prisma `OAuthProvider.KAKAO` values are legacy data only.
- Apple login is a future candidate for iOS/platform policy needs.
- LINE login is a future candidate for Japan/Taiwan market expansion.

## Locale And Country Metadata

- Frontend sends `locale` and IANA `timeZone` during exchange.
- Backend reads country from proxy geo headers: `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`.
- Local development and deployments without those headers store `signupCountryCode`/`lastLoginCountryCode` as `null`.

## Current Code Links

- Auth verifier port: `src/shared/application/ports/external-auth-verifier.port.ts`
- Supabase JWT adapter: `src/shared/infrastructure/supabase/supabase-jwt-verifier.adapter.ts`

Business domain tables and migrations should be added later only when requested.
