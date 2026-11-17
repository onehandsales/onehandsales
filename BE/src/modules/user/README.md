# User Module

Current scope:

- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`
- `POST /api/users/me/onboarding/job-selection`

이 모듈은 현재 프로필, 기기 조회, 온보딩 완료를 담당한다. 온보딩은 완료 시각을 저장하고 Workspace 공개 port를 호출하며 직군별 Kit을 저장하지 않는다. Bonsai의 온보딩·계정·팀 권한은 별도 전환 설계 대상이다.

Locale/timezone policy:

- `preferredLocale`, `timeZone`, `countryCode`, and `defaultCurrencyCode` are user profile settings.
- `preferredLocale` is limited to `ko-KR` and `en` in the current User Web profile API.
- Legacy `en-*` locale values are returned as `en`; unsupported legacy locale values fall back to `ko-KR` in profile/auth responses.
- Existing user login does not overwrite `timeZone`; recent login environment is stored in `lastLoginTimeZone`.
- `signupCountryCode` and `lastLoginCountryCode` can be null when proxy geo headers are absent.

Account deletion, permanent deletion, and business-domain preferences are intentionally not exposed in the current baseline.
