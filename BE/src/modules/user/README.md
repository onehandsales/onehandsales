# User Module

Current scope:

- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`

The module only keeps current-user profile and active registered device lookup.

Locale/timezone policy:

- `preferredLocale` and `timeZone` are user profile settings.
- Existing user login does not overwrite `timeZone`; recent login environment is stored in `lastLoginTimeZone`.
- `signupCountryCode` and `lastLoginCountryCode` can be null when proxy geo headers are absent.

Account deletion, permanent deletion, and business-domain preferences are intentionally not exposed in the current baseline.
