# 003 Mobile Auth Session Policy

Date: 2026-09-03

## 1. 결정

모바일 앱은 Backend의 `AuthDevice`와 `AuthSession` 정책을 공유한다.

모바일의 공식 인증 세션은 Supabase session이 아니라 Backend `AuthSession`이다.

Supabase는 현재 빠른 OAuth 구현을 위한 외부 인증 어댑터로만 사용하며, 향후 Supabase에서 독립할 수 있어야 한다.

## 2. 기기 정책

- 네이티브 Mobile App의 API `deviceSlot`은 `native_mobile`이고 Backend Prisma enum은 `NATIVE_MOBILE`이다.
- 사용자당 활성 네이티브 모바일 기기는 1대만 허용한다.
- 새 모바일 기기 로그인 시 기존 활성 모바일 기기와 세션은 교체한다.
- exchange 요청은 `replaceExistingDevice: true`를 사용한다.

## 3. 모바일 전용 인증 API

모바일 인증은 웹 인증 엔드포인트와 분리한다.

```text
POST /api/auth/mobile/exchange
POST /api/auth/mobile/refresh
POST /api/auth/mobile/logout
GET /api/me
```

웹은 httpOnly cookie 기반 refresh token 정책을 사용한다.

모바일은 secure storage 기반 refresh token 정책을 사용한다.

## 4. Refresh Token 계약

모바일 전용 인증 API는 refresh token을 응답 body로 전달한다.

`POST /api/auth/mobile/exchange` 응답에는 access token과 refresh token을 함께 포함한다.

`POST /api/auth/mobile/refresh` 응답에는 새 access token, 새 refresh token, 현재 native mobile device 정보를 함께 포함한다.

응답 필드명은 `mobileRefreshToken`이다.

refresh 요청 body 필드명도 `mobileRefreshToken`이다.

모바일 앱은 응답으로 받은 refresh token을 즉시 secure storage에 저장한다.

## 5. 저장 정책

모바일 앱은 refresh token을 반드시 보안 저장소에만 저장한다.

저장 key:

```text
onehand.mobile.auth.mobileRefreshToken
```

refresh token은 AsyncStorage, Zustand persist, localStorage와 유사한 일반 저장소, 일반 React state에 저장하지 않는다.

access token은 짧은 수명을 가진 토큰으로 취급하며, 메모리에만 보관할 수 있다.

refresh token 회전과 세션 만료/폐기는 백엔드의 AuthSession 정책을 따른다. refresh token rotation은 기존 refresh token hash와 session id 조건이 모두 맞을 때만 성공해야 하며, 이미 회전된 refresh token 재사용은 실패해야 한다.

## 6. 앱 시작 시 세션 복구

모바일 앱은 시작 시 secure storage에서 `onehand.mobile.auth.mobileRefreshToken`을 읽는다.

저장된 `mobileRefreshToken`이 있으면 즉시 `POST /api/auth/mobile/refresh`를 호출한다.

refresh 성공 시 새 `accessToken`, `accessTokenExpiresAt`, `mobileRefreshToken`, `user`, `device`를 반영한다.

새 `mobileRefreshToken`은 secure storage에 즉시 덮어쓴다.

refresh 실패 시 secure storage의 `mobileRefreshToken`을 삭제하고 인증 상태를 signedOut으로 전환한다.

앱 시작 중 인증 복구가 끝나기 전에는 보호 화면을 렌더링하지 않는다.

## 7. Backend 구현 메모

현재 Backend의 웹 인증 API는 refresh token 원문을 httpOnly cookie로만 전달한다.

따라서 모바일 전용 `/api/auth/mobile/*` API는 새 API 계약과 구현이 필요하다.

Backend application 계층은 이미 `ExternalAuthVerifier` 포트를 사용한다. Supabase 독립 시에는 Supabase JWT verifier adapter를 교체하는 방향을 우선 검토한다.

## 8. 관련 문서

- `BE/prisma/schema.prisma`
- `BE/src/modules/auth`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
