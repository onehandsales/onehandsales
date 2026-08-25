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
- Current runtime OAuth providers are Google, LINE, and Apple. Backend exposes them through `GET /api/auth/providers` and accepts them through the Supabase token exchange path when the provider configuration is valid.
- Kakao OAuth has been removed from runtime exposure and exchange. Existing Prisma `OAuthProvider.KAKAO` values are legacy data only.
- Provider smoke for Google/LINE/Apple depends on Supabase/provider operational settings and secrets. If a provider is not configured in the target environment, record that QA item as environment `N/A` or `BLOCKED` rather than changing the runtime provider contract.

## Production URL Configuration

2026-08-25 기준 User Web production canonical domain은 `https://www.onehandsales.com`이다. Supabase Auth URL 설정은 다음 기준을 사용한다.

Site URL:

```text
https://www.onehandsales.com
```

Redirect URLs:

```text
http://localhost:5173/auth/callback
http://localhost:5174/auth/callback
http://127.0.0.1:5173/auth/callback
http://127.0.0.1:5175/auth/callback
https://www.onehandsales.com/auth/callback
https://onehandsales.com/auth/callback
https://onehandsales.vercel.app/auth/callback
https://onehandsales-admin.vercel.app/auth/callback
```

- `https://www.onehandsales.com/auth/callback` is the production User Web callback.
- `https://onehandsales.com/auth/callback` is kept because the apex domain can be entered directly before redirecting to `www`.
- `https://onehandsales.vercel.app/auth/callback` is transition/legacy compatibility for the Vercel default domain.
- Admin Web currently uses `https://onehandsales-admin.vercel.app`; add `https://admin.onehandsales.com/auth/callback` only after that custom domain is actually connected.

Google Cloud OAuth authorized JavaScript origins:

```text
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
http://127.0.0.1:5175
https://www.onehandsales.com
https://onehandsales.com
https://onehandsales.vercel.app
https://onehandsales-admin.vercel.app
```

Google Cloud OAuth authorized redirect URIs:

```text
https://<project-ref>.supabase.co/auth/v1/callback
http://localhost:3000/api/schedules/google/callback
http://localhost:3000/api/follow-up-delivery/email-connections/google/callback
https://onehandsales-production.up.railway.app/api/schedules/google/callback
https://onehandsales-production.up.railway.app/api/follow-up-delivery/email-connections/google/callback
```

If Backend later moves to `https://api.onehandsales.com`, add these redirect URIs before switching production traffic:

```text
https://api.onehandsales.com/api/schedules/google/callback
https://api.onehandsales.com/api/follow-up-delivery/email-connections/google/callback
```

When separate Google OAuth clients are used for Supabase login, Google Calendar, and follow-up email delivery, put only the relevant origins/redirect URIs into each client. Do not remove the Supabase callback or Railway callbacks until the production smoke for the replacement domain has passed.

## Locale And Country Metadata

- Frontend sends `locale` and IANA `timeZone` during exchange.
- Backend reads country from proxy geo headers: `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`.
- Local development and deployments without those headers store `signupCountryCode`/`lastLoginCountryCode` as `null`.

## Current Code Links

- Auth verifier port: `src/shared/application/ports/external-auth-verifier.port.ts`
- Auth provider list: `src/modules/auth/application/use-cases/list-auth-providers.use-case.ts`
- Supabase JWT adapter: `src/shared/infrastructure/supabase/supabase-jwt-verifier.adapter.ts`

Business domain tables and migrations should be added later only when requested.
