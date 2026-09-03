# Backend API TODO

상태: Ready

## 1. 구현 대상

| Method | Path | 목적 | 상태 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/mobile/exchange` | 외부 OAuth token을 Backend app session으로 교환 | Ready |
| `POST` | `/api/auth/mobile/refresh` | 모바일 secure storage refresh token으로 app token 갱신 | Ready |
| `POST` | `/api/auth/mobile/logout` | 현재 모바일 app session revoke | Ready |

## 2. 공통 Backend 작업

- [ ] `COMMON/API-SPEC/MOBILE_AUTH_API.md` 계약을 기준으로 DTO와 response를 확정한다.
- [ ] `AuthDeviceSlot.NATIVE_MOBILE` enum migration을 추가한다.
- [ ] 모바일 전용 controller를 추가하거나 기존 auth controller에서 route를 명확히 분리한다.
- [ ] 모바일 controller는 `AuthCookieService`를 사용하지 않는다.
- [ ] 모바일 response는 `refreshToken: null` 대신 `mobileRefreshToken`을 사용한다.
- [ ] raw refresh token, refresh token hash, access token, Authorization header를 로그에 남기지 않는다.
- [ ] `BE/src/modules/auth/README.md`에 구현 완료 상태를 반영한다.

## 3. Exchange

- [ ] `MobileExchangeExternalAuthTokenDto`를 작성한다.
- [ ] `Authorization: Bearer <externalOAuthAccessToken>`을 필수로 처리한다.
- [ ] `deviceSlot`은 `native_mobile`만 허용한다.
- [ ] `deviceId`는 trim 후 8자 이상 200자 이하로 검증한다.
- [ ] `deviceLabel`은 120자 이하로 검증한다.
- [ ] `replaceExistingDevice`는 반드시 `true`로 요구하고, 아니면 400 validation error로 처리한다.
- [ ] `locale`, `timeZone`, proxy country header를 기존 로그인 metadata 정책과 맞춘다.
- [ ] 기존 `ExchangeExternalAuthTokenUseCase`를 재사용하거나 모바일 전용 orchestration을 추가한다.
- [ ] 같은 native mobile device 재로그인은 기존 active session을 rotate한다.
- [ ] 다른 native mobile device 로그인은 기존 native mobile device를 replace하고 기존 active session을 revoke한다.
- [ ] response body에 `accessToken`, `accessTokenExpiresAt`, `mobileRefreshToken`, `user`, `device`를 반환한다.
- [ ] response cookie를 설정하지 않는다.

## 4. Refresh

- [ ] `MobileRefreshAppTokenDto`를 작성한다.
- [ ] request body의 `mobileRefreshToken`을 필수로 처리한다.
- [ ] refresh cookie를 읽지 않는다.
- [ ] web refresh의 Origin cookie CSRF 검증을 모바일 API에 그대로 요구하지 않는다.
- [ ] refresh token hash로 `AuthSession`, `User`, `AuthDevice`를 조회한다.
- [ ] session status, `revokedAt`, `expiresAt`을 검증한다.
- [ ] user status가 `ACTIVE`인지 검증한다.
- [ ] 연결 device slot이 `NATIVE_MOBILE`인지 검증한다.
- [ ] 기존 refresh token hash와 session id가 모두 일치할 때만 refresh token을 atomic하게 rotation한다.
- [ ] 이미 회전된 refresh token 재사용은 401로 처리한다.
- [ ] refresh token을 rotation하고 새 `mobileRefreshToken`과 현재 `device`를 반환한다.
- [ ] 새 app access token은 기존 session id 기준으로 발급한다.

## 5. Logout

- [ ] `AuthGuard`로 app access token을 검증한다.
- [ ] 현재 `sessionId` 기준으로 `AuthSession`을 revoke한다.
- [ ] `{ "success": true }`를 반환한다.
- [ ] refresh cookie를 삭제하거나 설정하지 않는다.
- [ ] 이미 revoked/expired인 session 처리 방식을 기존 auth 정책과 맞춘다.

## 6. 테스트

- [ ] exchange 성공
- [ ] exchange provider token 검증 실패
- [ ] exchange provider email 없음
- [ ] exchange `deviceSlot !== native_mobile`
- [ ] exchange `replaceExistingDevice !== true`
- [ ] 같은 native mobile device session rotation
- [ ] 다른 native mobile device 교체와 기존 session revoke
- [ ] refresh 성공과 token rotation
- [ ] refresh token 재사용 401
- [ ] refresh invalid/revoked/expired token 401
- [ ] refresh web session token 거부
- [ ] logout session revoke
- [ ] 기존 web auth API 회귀

## 7. 검증 명령

실제 명령은 `BE/package.json`을 확인한 뒤 실행한다.

기본 후보:

```text
pnpm --dir BE typecheck
pnpm --dir BE lint
pnpm --dir BE test
pnpm --dir BE build
```

명령이 존재하지 않거나 환경이 부족하면 `TODO_LOG`에 사유를 기록한다.
