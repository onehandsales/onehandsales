# API Spec

## 1. 문서 목록

| 문서 | 계약 상태 | 소비자 |
| --- | --- | --- |
| `MOBILE_AUTH_API.md` | confirmed | Mobile App, Backend auth |

## 2. 기준

- 모바일 인증 API는 웹 cookie 인증 API와 분리한다.
- API 계약이 변경되면 Backend와 Mobile App TODO를 함께 갱신한다.
- 구현 전에 계약 상태는 최소 `confirmed`여야 한다.
- `MOBILE_AUTH_API.md`는 `native_mobile` / `NATIVE_MOBILE` 기준 confirmed 계약이다.
- refresh token 원문은 API response/request body의 `mobileRefreshToken`으로만 다룬다.
- refresh token 원문은 Backend DB, 로그, analytics, crash report, 일반 저장소에 남기지 않는다.
