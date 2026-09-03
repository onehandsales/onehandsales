# Mobile Auth Session Architecture

## 1. 기본 원칙

모바일의 공식 인증 세션은 Supabase session이 아니라 Backend `AuthSession`이다.

모바일 앱은 Backend의 `UserOAuthAccount`, `AuthDevice`, `AuthSession` 정책을 user-web과 공유한다. 단, refresh token 저장/전송 방식은 웹의 httpOnly cookie 정책을 그대로 사용하지 않고 모바일 secure storage 기준으로 별도 API 계약을 사용한다.

## 2. Backend 세션 정책

Backend DB 기준:

- `UserOAuthAccount`: Google, LINE, Apple 같은 외부 OAuth 계정 연결
- `AuthDevice`: 사용자 기기 등록과 slot 관리
- `AuthSession`: refresh session, 세션 만료, revoke 상태 관리

모바일 기준:

- 네이티브 Mobile App의 API `deviceSlot`은 `native_mobile`이고 Backend Prisma enum은 `NATIVE_MOBILE`이다.
- 사용자당 활성 네이티브 모바일 기기는 1대만 허용한다.
- 새 모바일 기기에서 로그인하면 기존 활성 모바일 기기와 세션은 교체한다.
- 모바일 exchange 요청은 `replaceExistingDevice: true`를 사용한다.
- access token은 Backend가 발급한 OneHand app access token만 사용한다.
- access token에는 `userId`와 `sessionId`가 포함되며, Backend AuthGuard는 DB `AuthSession` 상태를 다시 확인한다.

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

### POST /api/auth/mobile/exchange

요청:

- `Authorization: Bearer <external OAuth access token>`
- body:
  - `deviceSlot: "native_mobile"`
  - `deviceId: string`
  - `deviceLabel?: string`
  - `replaceExistingDevice: true`
  - `locale?: string`
  - `timeZone?: string`

응답:

- `accessToken`
- `accessTokenExpiresAt`
- `mobileRefreshToken`
- `user`
- `device`

### POST /api/auth/mobile/refresh

요청 body:

- `mobileRefreshToken`

응답:

- `accessToken`
- `accessTokenExpiresAt`
- `mobileRefreshToken`
- `user`
- `device`

### POST /api/auth/mobile/logout

요청:

- `Authorization: Bearer <accessToken>`

동작:

- 현재 Backend `AuthSession`을 revoke한다.
- 모바일 앱은 secure storage의 `mobileRefreshToken`을 삭제한다.
- 모바일 앱은 메모리의 access token과 사용자 상태를 비운다.

## 4. 토큰 저장

모바일 앱은 refresh token을 반드시 보안 저장소에만 저장한다.

refresh token은 AsyncStorage, Zustand persist, localStorage와 유사한 일반 저장소, 일반 React state에 저장하지 않는다.

access token은 짧은 수명을 가진 토큰으로 취급하며, 메모리에만 보관할 수 있다.

refresh token 회전과 세션 만료/폐기는 백엔드의 AuthSession 정책을 따른다. refresh token rotation은 기존 refresh token hash와 session id 조건이 모두 맞을 때만 성공해야 하며, 이미 회전된 refresh token 재사용은 실패해야 한다.

모바일 refresh token 저장 key:

```text
onehand.mobile.auth.mobileRefreshToken
```

이 key에는 모바일 전용 refresh token 원문만 저장한다.

## 5. 앱 시작 시 세션 복구

모바일 앱은 시작 시 secure storage에서 `onehand.mobile.auth.mobileRefreshToken`을 읽는다.

저장된 `mobileRefreshToken`이 있으면 즉시 `POST /api/auth/mobile/refresh`를 호출한다.

refresh 성공 시:

- 새 `accessToken`을 메모리에 반영한다.
- 새 `accessTokenExpiresAt`을 auth 상태에 반영한다.
- 새 `mobileRefreshToken`을 secure storage에 즉시 덮어쓴다.
- response의 `device`를 현재 모바일 기기 상태로 반영한다.
- `/api/me` 기준 사용자 상태를 반영한다.

refresh 실패 시:

- secure storage의 `mobileRefreshToken`을 삭제한다.
- 메모리의 access token과 사용자 상태를 비운다.
- 인증 상태를 signedOut으로 전환한다.

앱 시작 중 인증 복구가 끝나기 전에는 보호 화면을 렌더링하지 않는다.

## 6. TokenProvider

모바일 공통 API 클라이언트는 인증 상태 저장소에 직접 의존하지 않는다.

API 클라이언트는 `TokenProvider` 인터페이스를 통해 access token을 읽는다.

```ts
interface TokenProvider {
  getAccessToken(): string | null | Promise<string | null>;
}
```

API 요청 시 access token이 있으면 `Authorization: Bearer <accessToken>` 헤더를 자동 주입한다.

API 클라이언트는 Zustand store, React context, secure storage, Supabase client를 직접 import하지 않는다.

## 7. 금지 사항

- refresh token을 URL query parameter, route param, custom header로 전달하지 않는다.
- refresh token을 로그, analytics, crash report, error report에 기록하지 않는다.
- refresh token을 Zustand persist에 저장하지 않는다.
- access token을 business API 외부 목적에 재사용하지 않는다.
- Supabase access token을 `/api/*` business API 호출에 사용하지 않는다.

## 8. Backend 구현 메모

현재 Backend의 웹 `POST /api/auth/exchange`, `POST /api/auth/refresh`는 refresh token 원문을 httpOnly cookie로만 전달한다. 모바일 전용 `/api/auth/mobile/*` API는 별도 API 계약과 구현이 필요하다.

Backend application 계층은 이미 `ExternalAuthVerifier` 포트를 사용하므로, Supabase 독립 시에는 Supabase JWT verifier adapter를 교체하는 방향을 우선 검토한다.
