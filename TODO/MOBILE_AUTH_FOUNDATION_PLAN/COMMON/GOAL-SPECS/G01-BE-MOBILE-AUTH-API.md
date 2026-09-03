# G01-BE-MOBILE-AUTH-API

## 1. 목적

Backend auth 모듈에 모바일 전용 인증 API를 구현한다.

웹 인증 API는 httpOnly cookie 기반 refresh token 정책을 유지하고, 모바일 인증 API는 body 기반 `mobileRefreshToken` 계약을 사용한다.

## 2. 구현 범위

- `POST /api/auth/mobile/exchange`
- `POST /api/auth/mobile/refresh`
- `POST /api/auth/mobile/logout`
- 모바일 request DTO
- 모바일 response DTO 또는 mapper
- 모바일 refresh token rotation use case 또는 기존 use case의 안전한 재사용 구조
- 모바일 session/device 검증 테스트

## 3. 설계 기준

- `AuthController`의 웹 cookie 흐름을 훼손하지 않는다.
- 모바일 controller는 cookie service를 사용하지 않는다.
- 외부 OAuth access token 검증은 기존 `ExternalAuthVerifier` port를 사용한다.
- Supabase 관련 naming이 구현 내부에 남아 있더라도 외부 API 계약에는 `externalOAuthAccessToken` 의미로 다룬다.
- `deviceSlot`은 `native_mobile`만 허용한다.
- `replaceExistingDevice`는 모바일에서 항상 `true`로 요구한다.
- refresh token 원문은 response body로 반환하되 DB에는 hash만 저장한다.
- refresh API는 `AuthDevice.deviceSlot`이 `NATIVE_MOBILE`인 session만 허용한다.
- refresh API는 성공 시 현재 mobile `device`를 함께 반환한다.
- refresh token rotation은 기존 refresh token hash와 session id 조건이 모두 맞을 때만 성공하는 atomic update로 구현한다.
- logout은 현재 access token의 `sessionId` 기준으로 session을 revoke한다.

## 4. 테스트 기준

- exchange 성공 시 `mobileRefreshToken`이 body에 있고 cookie가 설정되지 않는다.
- exchange 성공 시 DB에는 refresh token hash만 저장된다.
- 같은 native mobile device 재로그인은 기존 active session을 rotate한다.
- 다른 native mobile device 로그인은 기존 native mobile device/session을 교체한다.
- refresh 성공 시 token이 rotation된다.
- 이미 회전된 refresh token 재사용은 401이다.
- refresh token이 invalid/revoked/expired면 401이다.
- web session refresh token을 mobile refresh API에 넣으면 실패한다.
- logout 성공 시 session이 revoked 된다.
- `/api/auth/mobile/*`가 `/admin/api/*`와 연결되지 않는다.

## 5. 완료 기준

- API 계약과 실제 controller/use case/DTO/mapper가 일치한다.
- Backend typecheck, lint, test, build가 통과한다.
- 실행하지 못한 검증은 사유와 대체 확인을 `TODO_LOG`에 기록한다.
