# User Module

Current scope:

- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`
- `POST /api/users/me/onboarding/job-selection`

The module handles the current profile, device lookup, and onboarding completion. Onboarding stores its completion timestamp and calls the Workspace onboarding port; it does not store a job-specific Kit. The folk onboarding target is a separate transition.

Locale/timezone policy:

- `preferredLocale`, `timeZone`, `countryCode`, and `defaultCurrencyCode` are user profile settings.
- `preferredLocale` is limited to `ko-KR` and `en` in the current User Web profile API.
- Legacy `en-*` locale values are returned as `en`; unsupported legacy locale values fall back to `ko-KR` in profile/auth responses.
- Existing user login does not overwrite `timeZone`; recent login environment is stored in `lastLoginTimeZone`.
- `signupCountryCode` and `lastLoginCountryCode` can be null when proxy geo headers are absent.

Account deletion, permanent deletion, and business-domain preferences are intentionally not exposed in the current baseline.
