# Auth 모듈

예정 범위:

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- App access token guard
- Admin guard 지원
- `UserOAuthAccount`, `AuthDevice`, `AuthSession` 동기화

구현을 시작할 때 full layer 구조는 `../_template`을 따른다.
