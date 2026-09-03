# Mobile Auth API

계약 상태: confirmed
소비자:

- Mobile App
- Backend auth module

호환성:

- breaking change 여부: 없음. 모바일 전용 신규 API다.
- 기존 User Web 영향: 없음. 기존 `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout` cookie 계약은 유지한다.
- Admin Web 영향: 없음. Mobile App은 `/admin/api/*`를 호출하지 않는다.
- migration 또는 fallback: 기존 `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 우선 재사용한다. `AuthDeviceSlot.NATIVE_MOBILE` enum migration은 G01에서 추가한다.

주의:

- User Web 브라우저 모바일은 현재 `deviceSlot: "mobile"`을 사용한다.
- 네이티브 Mobile App은 `deviceSlot: "native_mobile"`을 사용한다.
- Backend Prisma enum은 `AuthDeviceSlot.NATIVE_MOBILE`을 추가한다.

## 1. 공통 원칙

모바일의 공식 인증 세션은 Backend `AuthSession`이다.

Supabase는 현재 외부 OAuth access token을 얻는 auth provider adapter일 뿐이며, Mobile App business API의 공식 세션이 아니다.

모바일 앱은 Backend가 발급한 OneHand app access token만 `/api/*` 호출에 사용한다.

## 2. 공통 DTO

### MobileAuthTokenResponse

| 필드 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| `accessToken` | string | 아니오 | Backend가 발급한 OneHand app access token |
| `accessTokenExpiresAt` | ISO datetime string | 아니오 | access token 만료 시각 |
| `mobileRefreshToken` | string | 아니오 | 모바일 secure storage에만 저장할 refresh token 원문 |
| `user` | `MobileAuthUserDto` | 아니오 | 현재 사용자 |
| `device` | `MobileAuthDeviceDto` | 아니오 | 현재 모바일 인증 기기 |

`refreshToken`이라는 기존 웹 응답 필드를 모바일 응답에 넣지 않는다. 모바일 refresh token 필드명은 항상 `mobileRefreshToken`이다.

### MobileAuthUserDto

| 필드 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| `id` | UUID string | 아니오 | 내부 User ID |
| `supabaseUserId` | string | 예 | 과거/현재 provider 호환 필드. 향후 Supabase 독립 시 null 가능 |
| `name` | string | 예 | 표시 이름 |
| `email` | string | 예 | 사용자 이메일 |
| `role` | string | 아니오 | `USER` 또는 `ADMIN`. 모바일 앱은 role과 무관하게 `/admin/api/*`를 호출하지 않는다. |
| `status` | string | 아니오 | 사용자 상태. 로그인 가능 상태는 `ACTIVE` |
| `timeZone` | string | 아니오 | IANA timezone ID |
| `preferredLocale` | string | 아니오 | 사용자 선호 locale |
| `countryCode` | string | 아니오 | 사용자 기본 국가 코드 |
| `defaultCurrencyCode` | string | 아니오 | 사용자 기본 통화 코드 |
| `signupLocale` | string | 예 | 가입 시 locale |
| `signupCountryCode` | string | 예 | 가입 시 국가 코드 |
| `signupTimeZone` | string | 예 | 가입 시 timezone |
| `lastLoginLocale` | string | 예 | 최근 로그인 locale |
| `lastLoginCountryCode` | string | 예 | 최근 로그인 국가 코드 |
| `lastLoginTimeZone` | string | 예 | 최근 로그인 timezone |

### MobileAuthDeviceDto

| 필드 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| `id` | UUID string | 아니오 | `AuthDevice.id` |
| `slot` | string | 아니오 | `native_mobile` |
| `label` | string | 예 | 앱이 보낸 모바일 기기 표시명 |

## 3. POST /api/auth/mobile/exchange

- API 이름: 모바일 외부 인증 토큰 앱 세션 교환 API
- API 식별자: `MobileExchangeExternalAuthToken`
- Method: `POST`
- Path: `/api/auth/mobile/exchange`
- Request 이름: `MobileExchangeExternalAuthTokenRequest`
- Response 이름: `MobileAuthTokenResponse`
- Success status: `200`
- Body: 있음
- Cookie: 읽지 않음, 설정하지 않음

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 예시 |
| --- | --- | --- | --- | --- | --- |
| header | `Authorization` | Bearer token | 예 | `Bearer <externalOAuthAccessToken>` 형식 | `Bearer eyJ...` |

Body:

| 필드 | 타입 | 필수 | nullable | validation | 예시 |
| --- | --- | --- | --- | --- | --- |
| `deviceSlot` | string | 예 | 아니오 | 반드시 `native_mobile` | `native_mobile` |
| `deviceId` | string | 예 | 아니오 | trim 후 8자 이상 200자 이하 | `ios-installation-uuid` |
| `deviceLabel` | string | 아니오 | 아니오 | 120자 이하 | `iPhone 15 Pro` |
| `replaceExistingDevice` | boolean | 예 | 아니오 | 반드시 `true` | `true` |
| `locale` | string | 아니오 | 아니오 | 16자 이하 | `ko-KR` |
| `timeZone` | string | 아니오 | 아니오 | 100자 이하, 가능하면 IANA timezone ID | `Asia/Seoul` |

예시:

```json
{
  "deviceSlot": "native_mobile",
  "deviceId": "ios-installation-uuid",
  "deviceLabel": "iPhone 15 Pro",
  "replaceExistingDevice": true,
  "locale": "ko-KR",
  "timeZone": "Asia/Seoul"
}
```

provider는 request body 값을 신뢰하지 않는다. Backend는 Authorization Bearer token을 외부 인증 verifier adapter에서 검증하고, 검증된 token metadata의 provider를 `google`, `line`, `apple` 중 하나로 정규화한다.

### 내부 비즈니스 로직

1. Authorization header에서 외부 OAuth access token을 추출한다.
2. 외부 인증 verifier adapter가 token을 검증한다.
3. provider user id와 verified email을 확보한다.
4. provider email이 없으면 가입/로그인을 차단한다.
5. `deviceSlot`이 `native_mobile`인지 검증한다.
6. `replaceExistingDevice`가 `true`인지 검증한다.
7. `deviceId`를 검증하고 저장 시 hash로 변환한다.
8. `provider + providerUserId` 기준으로 기존 `UserOAuthAccount`를 찾는다.
9. 없으면 verified email 기준으로 기존 User 연결을 시도한다.
10. 기존 User가 없으면 신규 User와 `UserOAuthAccount`를 생성한다.
11. 같은 사용자의 활성 `mobile` device가 같은 `deviceIdHash`면 기존 device의 `lastSeenAt`과 label을 갱신한다.
12. 같은 사용자의 활성 `native_mobile` device가 다른 `deviceIdHash`면 기존 native mobile device를 `REPLACED`로 바꾸고 연결된 활성 session을 revoke한다.
13. 새 native mobile `AuthDevice`를 생성한다.
14. 같은 native mobile device에 활성 session이 있으면 refresh token을 회전하고, 없으면 새 `AuthSession`을 생성한다.
15. Backend app access token을 발급한다.
16. raw refresh token은 response body의 `mobileRefreshToken`으로만 반환한다.
17. Backend DB에는 refresh token hash만 저장한다.

### Response

```json
{
  "accessToken": "onehand-app-access-token",
  "accessTokenExpiresAt": "2026-09-03T12:30:00.000Z",
  "mobileRefreshToken": "raw-mobile-refresh-token",
  "user": {
    "id": "00000000-0000-0000-0000-000000000000",
    "supabaseUserId": null,
    "name": "홍길동",
    "email": "user@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "timeZone": "Asia/Seoul",
    "preferredLocale": "ko-KR",
    "countryCode": "KR",
    "defaultCurrencyCode": "KRW",
    "signupLocale": "ko-KR",
    "signupCountryCode": "KR",
    "signupTimeZone": "Asia/Seoul",
    "lastLoginLocale": "ko-KR",
    "lastLoginCountryCode": "KR",
    "lastLoginTimeZone": "Asia/Seoul"
  },
  "device": {
    "id": "00000000-0000-0000-0000-000000000000",
    "slot": "native_mobile",
    "label": "iPhone 15 Pro"
  }
}
```

### Transaction

- 필요 여부: 필요
- 이유: User, OAuth account, device, session 변경이 하나의 로그인 결과를 구성한다.
- transaction model: `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`
- rollback 범위: 사용자 생성/갱신, OAuth account 연결, device 교체, session 생성/회전 전체
- audit log transaction 포함 여부: 없음
- 외부 Provider 호출 위치: DB transaction 밖에서 수행한다.

### Observability

- log event key: `auth.mobile.exchange.succeeded`, `auth.mobile.exchange.failed`, `auth.oauthAccount.linked`
- audit log: 없음
- request id: 사용
- redaction: Authorization header, external OAuth token, access token, `mobileRefreshToken`, provider raw response, provider raw error, email 원문 logging 금지
- provider error context: provider, providerErrorType, retryable, category, requestId만 허용

## 4. POST /api/auth/mobile/refresh

- API 이름: 모바일 refresh token 앱 세션 갱신 API
- API 식별자: `MobileRefreshAppToken`
- Method: `POST`
- Path: `/api/auth/mobile/refresh`
- Request 이름: `MobileRefreshAppTokenRequest`
- Response 이름: `MobileAuthTokenResponse`
- Success status: `200`
- Body: 있음
- Cookie: 읽지 않음, 설정하지 않음

### Request

Body:

| 필드 | 타입 | 필수 | nullable | validation | 예시 |
| --- | --- | --- | --- | --- | --- |
| `mobileRefreshToken` | string | 예 | 아니오 | 빈 문자열 금지, 최대 1000자 | `raw-mobile-refresh-token` |

예시:

```json
{
  "mobileRefreshToken": "raw-mobile-refresh-token"
}
```

### 내부 비즈니스 로직

1. `mobileRefreshToken`을 body에서 읽는다.
2. token 원문을 hash로 변환한다.
3. hash로 `AuthSession`과 연결 사용자, 연결 `AuthDevice`를 조회한다.
4. session이 없으면 401을 반환한다.
5. session status가 `ACTIVE`가 아니거나 만료됐으면 401을 반환한다.
6. 연결된 user가 `ACTIVE`가 아니면 403을 반환한다.
7. 연결된 `AuthDevice.deviceSlot`이 `NATIVE_MOBILE`이 아니면 401을 반환한다.
8. 새 refresh token을 생성한다.
9. 기존 `AuthSession.refreshTokenHash`와 현재 session id가 모두 일치할 때만 refresh token hash를 atomic하게 회전한다.
10. 조건부 rotation 대상 row가 없으면 같은 refresh token 재사용 또는 이미 회전된 token으로 보고 401을 반환한다.
11. 같은 session id로 새 Backend app access token을 발급한다.
12. 최신 `user`와 현재 mobile `device` 응답을 조회한다.
13. 새 raw refresh token은 response body의 `mobileRefreshToken`으로만 반환한다.

모바일 refresh API는 웹 refresh API의 cookie Origin 검증을 그대로 요구하지 않는다. 모바일 API는 cookie 기반 CSRF 방어가 아니라 refresh token hash와 session/device 상태 검증을 기준으로 한다.

### Response

```json
{
  "accessToken": "new-onehand-app-access-token",
  "accessTokenExpiresAt": "2026-09-03T12:45:00.000Z",
  "mobileRefreshToken": "new-raw-mobile-refresh-token",
  "user": {
    "id": "00000000-0000-0000-0000-000000000000",
    "supabaseUserId": null,
    "name": "홍길동",
    "email": "user@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "timeZone": "Asia/Seoul",
    "preferredLocale": "ko-KR",
    "countryCode": "KR",
    "defaultCurrencyCode": "KRW",
    "signupLocale": "ko-KR",
    "signupCountryCode": "KR",
    "signupTimeZone": "Asia/Seoul",
    "lastLoginLocale": "ko-KR",
    "lastLoginCountryCode": "KR",
    "lastLoginTimeZone": "Asia/Seoul"
  },
  "device": {
    "id": "00000000-0000-0000-0000-000000000000",
    "slot": "native_mobile",
    "label": "iPhone 15 Pro"
  }
}
```

### Transaction

- 필요 여부: 없음
- 이유: 단일 `AuthSession` row 조건부 갱신으로 처리한다. 별도 transaction보다 `sessionId + 기존 refreshTokenHash + ACTIVE` 조건의 atomic update를 우선한다.
- transaction model: `AuthSession`
- rollback 범위: 없음. 조건부 update 실패 시 401을 반환한다.
- audit log transaction 포함 여부: 없음
- 외부 Provider 호출 위치: 없음

### Observability

- log event key: `auth.mobile.refresh.succeeded`, `auth.mobile.refresh.failed`
- audit log: 없음
- request id: 사용
- redaction: `mobileRefreshToken`, access token, refresh token hash, authorization header logging 금지
- provider error context: 없음

## 5. POST /api/auth/mobile/logout

- API 이름: 모바일 현재 앱 세션 로그아웃 API
- API 식별자: `MobileLogout`
- Method: `POST`
- Path: `/api/auth/mobile/logout`
- Request 이름: `MobileLogoutRequest`
- Response 이름: `LogoutResponse`
- Success status: `200`
- Body: 있음
- Cookie: 읽지 않음, 설정하지 않음

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 예시 |
| --- | --- | --- | --- | --- | --- |
| header | `Authorization` | Bearer token | 예 | `Bearer <accessToken>` 형식 | `Bearer eyJ...` |

Body: 없음

### 내부 비즈니스 로직

1. `AuthGuard`가 Backend app access token을 검증한다.
2. access token의 `sessionId`로 현재 `AuthSession`을 확인한다.
3. 현재 session을 `REVOKED`로 변경하고 `revokedAt`을 기록한다.
4. response body로 `{ "success": true }`를 반환한다.
5. Mobile App은 성공/실패와 무관하게 secure storage의 `mobileRefreshToken`과 메모리 access token/user 상태를 삭제한다.

### Response

```json
{
  "success": true
}
```

### Transaction

- 필요 여부: 없음
- 이유: 단일 session revoke mutation이다. 단, repository 구현에서 원자적 update를 사용한다.
- transaction model: `AuthSession`
- rollback 범위: 없음
- audit log transaction 포함 여부: 없음
- 외부 Provider 호출 위치: 없음

### Observability

- log event key: `auth.mobile.logout.succeeded`, `auth.mobile.logout.failed`
- audit log: 없음
- request id: 사용
- redaction: Authorization header, access token, refresh token logging 금지
- provider error context: 없음

## 6. GET /api/me

모바일 앱은 기존 User API `GET /api/me`를 그대로 사용한다.

- Method: `GET`
- Path: `/api/me`
- 인증: `Authorization: Bearer <accessToken>`
- Response 이름: `MobileAuthUserDto`와 동일한 사용자 필드
- Success status: `200`

모바일 앱은 `/admin/api/me`를 호출하지 않는다.

## 7. Error 계약

| 상황 | error code | HTTP status | Mobile App 처리 | log level |
| --- | --- | ---: | --- | --- |
| Authorization header 없음 | `Unauthorized` | 401 | provider pending 해제, 로그인 재시도 문구 | warn |
| Authorization 형식 오류 | `Unauthorized` | 401 | 로그인 재시도 문구 | warn |
| provider token 검증 실패 | `AUTH_PROVIDER_EXCHANGE_FAILED` | 502 | 일반 로그인 실패 문구 | warn |
| provider verified email 없음 | `AUTH_PROVIDER_EMAIL_REQUIRED` | 422 | provider 계정 이메일 확인 안내 | warn |
| `deviceSlot`이 `native_mobile` 아님 | `InvalidDeviceSlot` | 400 | 앱 업데이트 또는 재시도 문구 | warn |
| `replaceExistingDevice`가 `true`가 아님 | `ValidationError` | 400 | 앱 업데이트 또는 재시도 문구 | warn |
| `deviceId` 유효하지 않음 | `InvalidDeviceId` | 400 | 앱 업데이트 또는 재시도 문구 | warn |
| refresh token 없음 | `Unauthorized` | 401 | secure storage 삭제 후 signedOut | warn |
| refresh token invalid/revoked/expired | `Unauthorized` | 401 | secure storage 삭제 후 signedOut | warn |
| refresh token이 native mobile session이 아님 | `Unauthorized` | 401 | secure storage 삭제 후 signedOut | warn |
| 사용자 비활성 | `InactiveUser` | 403 | signedOut 전환, 계정 상태 안내 | warn |
| 요청 validation 실패 | `ValidationError` | 400 | field 또는 일반 오류 표시 | warn |

사용자 노출 문구는 token 원문, provider raw error, 내부 session id를 포함하지 않는다.

## 8. FE 처리 기준

- exchange 성공 시 `mobileRefreshToken`을 즉시 secure storage에 저장한다.
- refresh 성공 시 기존 secure storage 값을 새 `mobileRefreshToken`으로 덮어쓴다.
- refresh 성공 시 response의 `device`를 현재 모바일 기기 상태로 반영한다.
- refresh 실패 시 secure storage 값을 삭제한다.
- access token은 메모리 auth state에만 둔다.
- API client는 `TokenProvider`로 access token을 읽는다.
- 401 응답을 받으면 refresh를 1회 시도하고, 실패하면 signedOut 상태로 전환한다.
- logout은 서버 요청 실패 여부와 관계없이 로컬 token 삭제를 완료한다.

## 9. Backend 처리 기준

- 모바일 controller는 웹 cookie controller와 route/DTO/response mapper를 분리한다.
- 공통 application 로직을 재사용하더라도 모바일 response에는 `mobileRefreshToken`을 사용한다.
- 모바일 refresh API는 cookie를 읽지 않는다.
- raw refresh token은 DB에 저장하지 않는다.
- refresh token hash, access token, Authorization header는 로그에 남기지 않는다.
- external provider verifier는 port/interface 뒤에 유지한다.
