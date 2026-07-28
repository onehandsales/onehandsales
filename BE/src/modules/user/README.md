# User Module

Current scope:

- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`

The module only keeps current-user profile and active registered device lookup.

Locale/timezone policy:

- `preferredLocale`, `timeZone`, `countryCode`, and `defaultCurrencyCode` are user profile settings.
- `preferredLocale` is limited to `ko-KR` and `en` in the current User Web profile API.
- Legacy `en-*` locale values are returned as `en`; unsupported legacy locale values fall back to `ko-KR` in profile/auth responses.
- `countryCode` is limited to `KR` and `US`; `defaultCurrencyCode` is limited to `KRW` and `USD`.
- Existing user login does not overwrite `timeZone`; recent login environment is stored in `lastLoginTimeZone`.
- `signupCountryCode` and `lastLoginCountryCode` can be null when proxy geo headers are absent.

Account deletion, permanent deletion, and business-domain preferences are intentionally not exposed in the current baseline.
