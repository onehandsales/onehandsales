# Auth Module

Current scope:

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /admin/api/me`
- App access token guard
- Admin guard
- `UserOAuthAccount`, `AuthDevice`, and `AuthSession` persistence

Confirmed Mobile App auth foundation contract:

- Mobile App official session is Backend `AuthSession`, not Supabase session.
- Mobile App auth APIs are planned as `/api/auth/mobile/exchange`, `/api/auth/mobile/refresh`, and `/api/auth/mobile/logout`, separated from web cookie APIs.
- Mobile App uses `deviceSlot: "mobile"` and `replaceExistingDevice: true`.
- Mobile App response field for the raw refresh token is `mobileRefreshToken`.
- Backend stores only refresh token hashes. The raw mobile refresh token is stored only in the app secure storage by the client.

Current runtime policy:

- Supabase OAuth is the external identity provider. Backend app auth starts after `POST /api/auth/exchange`.
- Signup and login share the same exchange path.
- Existing user lookup uses `provider + providerUserId` first. If no provider account exists, a verified provider email can link to an existing user.
- Web app refresh tokens are stored only as hashes in `AuthSession`; the raw token is sent as httpOnly cookie.
- Same active device relogin rotates the existing session. Same slot with a different device replaces the active device when `replaceExistingDevice=true`.
- Country code metadata depends on proxy geo headers and may be null in local/dev.

Business-domain authentication rules should be added later inside the owning domain module.
