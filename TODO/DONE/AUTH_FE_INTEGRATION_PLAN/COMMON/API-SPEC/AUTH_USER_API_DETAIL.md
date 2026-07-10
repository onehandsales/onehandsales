# Auth/User API Detail

## 1. 목적

이 문서는 `AUTH_FE_INTEGRATION_PLAN`에서 사용하는 인증/사용자 API의 요청값, 응답값, 내부 비즈니스 로직, 연결 DB, 에러, FE/BE 처리 기준을 고정한다.

작성 기준:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`

## 2. 공통 규칙

- User API는 `/api/*`를 사용한다.
- Admin API는 `/admin/api/*`를 사용한다.
- 일반 Backend API 인증은 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- `POST /api/auth/exchange`만 Supabase access token을 `Authorization` header로 받는다.
- refresh token은 httpOnly cookie로만 운용하고 response body에 원문을 담지 않는다.
- FE는 Backend App access token을 memory에만 저장한다.
- FE는 Supabase access token을 일반 Backend API 인증에 사용하지 않는다.
- Auth/User DB 기준은 `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`이다.
- `UserSetting`, 계정 삭제 API, 기기명 수정 API, 기기 해제 API는 현재 범위가 아니다.

## 3. API 목록

1. Provider 목록 API: `GET /api/auth/providers`
2. Token Exchange API: `POST /api/auth/exchange`
3. Refresh API: `POST /api/auth/refresh`
4. Logout API: `POST /api/auth/logout`
5. 현재 사용자 조회 API: `GET /api/me`
6. Admin 현재 사용자 조회 API: `GET /admin/api/me`
7. 개인 정보 조회 API: `GET /api/users/me/profile`
8. 개인 정보 수정 API: `PATCH /api/users/me/profile`
9. 등록 기기 조회 API: `GET /api/users/me/devices`

## 3.1. API 계약 상태 요약

Auth/User API의 Backend 구현과 검증은 완료됐으며, 계약 상태는 `implemented`로 둔다.

| API | 소비자 | 계약 상태 | Transaction | Observability |
|---|---|---|---|---|
| `GET /api/auth/providers` | User Web, Admin Web | implemented | 없음. 설정 조회 전용 | event key: `auth.providers.listed`, audit log: 없음, request id: 사용, redaction: provider secret logging 금지 |
| `POST /api/auth/exchange` | User Web, Admin Web | implemented | 필요. User/OAuthAccount/AuthDevice/AuthSession 생성과 device 교체 흐름 | event key: `auth.exchanged`, audit log: 없음, request id: 사용, redaction: Supabase token, refresh token, device id 원문 logging 금지 |
| `POST /api/auth/refresh` | User Web, Admin Web | implemented | 필요. refresh token rotation 갱신 | event key: `auth.refreshed`, audit log: 없음, request id: 사용, redaction: refresh token 원문 logging 금지 |
| `POST /api/auth/logout` | User Web, Admin Web | implemented | 없음. 단일 AuthSession revoke | event key: `auth.loggedOut`, audit log: 없음, request id: 사용, redaction: token 원문 logging 금지 |
| `GET /api/me` | User Web | implemented | 없음. 조회 전용 | event key: `user.me.viewed`, audit log: 없음, request id: 사용, redaction: token 원문 logging 금지 |
| `GET /admin/api/me` | Admin Web | implemented | 없음. 조회 전용 | event key: `admin.me.viewed`, audit log: 없음, request id: 사용, redaction: token 원문 logging 금지 |
| `GET /api/users/me/profile` | User Web | implemented | 없음. 조회 전용 | event key: `user.profile.viewed`, audit log: 없음, request id: 사용, redaction: provider token hash logging 금지 |
| `PATCH /api/users/me/profile` | User Web | implemented | 없음. 단일 User 수정 | event key: `user.profile.updated`, audit log: 없음, request id: 사용, redaction: email, token hash logging 금지 |
| `GET /api/users/me/devices` | User Web | implemented | 없음. 조회 전용 | event key: `user.devices.listed`, audit log: 없음, request id: 사용, redaction: device id hash, user agent 원문 logging 금지 |

## 4. Provider 목록 API

- API 이름: Provider 목록 API
- API 식별자: `ListAuthProviders`
- Method: `GET`
- Path: `/api/auth/providers`
- 인증: 없음
- 권한: 없음

### Request

- Request 이름: `ListAuthProvidersRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| query | 없음 | 없음 | 아니오 | 없음 | 요청값 없음 |
| header | 없음 | 없음 | 아니오 | 없음 | 인증 header 없음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard를 적용하지 않는다.
2. Backend provider registry 또는 설정에서 Kakao, Google, Apple provider 상태를 읽는다.
3. provider별 `enabled`, `status`, `displayOrder` 값을 만든다.
4. public login 화면에서 필요한 값만 response DTO로 변환한다.
5. client secret, provider secret, internal config key는 응답에 포함하지 않는다.

### Response

- Response 이름: `AuthProviderListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `providers` | `AuthProviderResponse[]` | 아니오 | provider 버튼 구성 목록 |
| `providers[].provider` | string | 아니오 | `kakao`, `google`, `apple` |
| `providers[].label` | string | 아니오 | 화면 표시 이름 |
| `providers[].enabled` | boolean | 아니오 | 로그인 가능 여부 |
| `providers[].status` | string | 아니오 | `enabled`, `disabled`, `planned` |
| `providers[].displayOrder` | number | 아니오 | 화면 정렬 순서 |

예시:

```json
{
  "providers": [
    {
      "provider": "kakao",
      "label": "Kakao",
      "enabled": true,
      "status": "enabled",
      "displayOrder": 1
    }
  ]
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음 또는 provider 설정 저장소
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| provider 설정 로드 실패 | `AuthProviderConfigUnavailable` | 500 |

### FE/BE 처리 기준

- FE: `enabled: true`인 provider만 로그인 가능한 버튼으로 표시한다.
- FE: `status: "planned"`는 비활성 버튼 또는 숨김 처리한다.
- BE: provider secret은 절대 응답하지 않는다.
- 검증: disabled/planned provider가 로그인 가능 UI로 노출되지 않는지 확인한다.

## 5. Token Exchange API

- API 이름: Token Exchange API
- API 식별자: `ExchangeAuthToken`
- Method: `POST`
- Path: `/api/auth/exchange`
- 인증: Supabase access token 필요
- 권한: Supabase token 검증 성공 사용자

### Request

- Request 이름: `ExchangeAuthTokenRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <supabase_access_token>` | Supabase access token |
| header | `Origin` | string | 예 | Backend 허용 origin | refresh cookie 발급 origin 검증 |
| body | `deviceSlot` | string | 예 | `mobile`, `personal_laptop`, `work_laptop` | 기기 slot |
| body | `deviceId` | string | 예 | 8~200자 | FE stable device id. DB에는 hash만 저장 |
| body | `deviceLabel` | string \| null | 아니오 | 최대 120자 | 사용자 표시용 기기 이름 |
| body | `replaceExistingDevice` | boolean | 아니오 | boolean | 같은 slot의 다른 기기 교체 여부. 기본 false |

### 내부 비즈니스 로직

1. Supabase access token을 검증한다.
2. Supabase user id, provider, provider user id, email, display name을 추출한다.
3. `deviceSlot`, `deviceId`, `deviceLabel`, `replaceExistingDevice`를 validation한다.
4. transaction을 시작한다.
5. `provider + providerUserId`로 `UserOAuthAccount`를 조회한다.
6. 기존 계정이 있으면 연결된 `User`를 조회하고 `status`가 `ACTIVE`인지 확인한다.
7. 기존 계정이 없으면 `User`와 `UserOAuthAccount`를 생성한다.
8. `User.lastLoginAt`을 갱신한다.
9. `deviceId` 원문을 hash한다.
10. 같은 userId와 deviceSlot에 다른 ACTIVE `AuthDevice`가 있고 `replaceExistingDevice=false`면 transaction을 중단하고 `DeviceSlotAlreadyRegistered`를 반환한다.
11. `replaceExistingDevice=true`면 기존 ACTIVE device를 `REPLACED` 처리하고 기존 ACTIVE session을 `REVOKED` 처리한다.
12. 같은 device hash가 있으면 `AuthDevice.label`, `lastSeenAt`을 갱신하고, 없으면 새 `AuthDevice`를 생성한다.
13. `AuthSession`을 생성하고 refresh token hash, userAgent, ipAddressHash, expiresAt을 저장한다.
14. Backend App access token을 발급한다.
15. refresh token 원문은 httpOnly cookie로 내려주고 response body에는 `refreshToken: null`을 넣는다.
16. transaction을 commit한다.

### Response

- Response 이름: `AuthExchangeResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `accessToken` | string | 아니오 | Backend App access token |
| `accessTokenExpiresAt` | string | 아니오 | access token 만료 시각 |
| `refreshToken` | null | 예 | 항상 null |
| `user.id` | string | 아니오 | 내부 User ID |
| `user.supabaseUserId` | string | 예 | Supabase user ID |
| `user.name` | string | 예 | 사용자 이름 |
| `user.email` | string | 예 | 이메일 |
| `user.role` | string | 아니오 | `USER` 또는 `ADMIN` |
| `user.status` | string | 아니오 | 계정 상태 |
| `device.id` | string | 아니오 | AuthDevice ID |
| `device.slot` | string | 아니오 | 기기 slot |
| `device.label` | string | 예 | 기기 표시 이름 |

예시:

```json
{
  "accessToken": "<backend_app_access_token>",
  "accessTokenExpiresAt": "2026-06-10T12:00:00.000Z",
  "refreshToken": null,
  "user": {
    "id": "uuid",
    "supabaseUserId": "supabase-user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "USER",
    "status": "ACTIVE"
  },
  "device": {
    "id": "uuid",
    "slot": "personal_laptop",
    "label": "MacBook Chrome"
  }
}
```

### 연결된 DB 스키마

- 생성: `User` 조건부, `UserOAuthAccount` 조건부, `AuthDevice` 조건부, `AuthSession`
- 조회: `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`
- 수정: `User.lastLoginAt`, `AuthDevice.lastSeenAt`, 기존 `AuthDevice/AuthSession` revoke 조건부
- 삭제: 없음
- 감사 로그: 없음
- transaction: User/OAuthAccount/AuthDevice/AuthSession 생성과 device 교체 흐름

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| Supabase token 없음 또는 invalid | `Unauthorized` | 401 |
| deviceSlot invalid | `InvalidDeviceSlot` | 400 |
| deviceId invalid | `InvalidDeviceId` | 400 |
| provider 이메일 없음 | `ExternalUserEmailMissing` | 422 |
| 계정 비활성 | `InactiveUser` | 403 |
| 같은 slot에 다른 ACTIVE device 존재 | `DeviceSlotAlreadyRegistered` | 409 |

### FE/BE 처리 기준

- FE: `accessToken`만 memory에 저장한다.
- FE: refresh token은 JS 상태, localStorage, sessionStorage에 저장하지 않는다.
- FE: 409 `DeviceSlotAlreadyRegistered`를 받으면 교체 확인 UI를 띄우고 확인 시 `replaceExistingDevice=true`로 재시도한다.
- BE: Supabase 호출은 infrastructure adapter 뒤에 둔다.
- BE: transaction boundary는 application use case에 둔다.
- 검증: 신규 가입, 기존 로그인, device conflict, device replace, inactive user, invalid token을 테스트한다.

## 6. Refresh API

- API 이름: Refresh API
- API 식별자: `RefreshAuthSession`
- Method: `POST`
- Path: `/api/auth/refresh`
- 인증: httpOnly refresh cookie
- 권한: 유효한 ACTIVE AuthSession

### Request

- Request 이름: `RefreshAuthSessionRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| cookie | refresh token | httpOnly cookie | 예 | hash로 session 조회 가능 | JS에서 읽을 수 없음 |
| header | `Origin` | string | 예 | Backend 허용 origin | refresh origin 검증 |
| header | `Authorization` | 없음 | 아니오 | 없어야 함 | access token을 보내지 않는다 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. refresh cookie를 읽는다.
2. refresh token 원문을 hash한다.
3. hash로 `AuthSession`을 조회한다.
4. `AuthSession.status`가 `ACTIVE`인지 확인한다.
5. `revokedAt`이 없고 `expiresAt`이 지나지 않았는지 확인한다.
6. 연결된 `User.status`가 `ACTIVE`인지 확인한다.
7. `Origin`이 허용 목록인지 확인한다.
8. refresh token rotation을 수행한다.
9. `AuthSession.refreshTokenHash`, `lastUsedAt`, `expiresAt`을 갱신한다.
10. 새 Backend App access token을 발급한다.
11. 새 refresh token은 httpOnly cookie로 내려주고 response body에는 `refreshToken: null`을 유지한다.

### Response

- Response 이름: `AuthRefreshResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `accessToken` | string | 아니오 | 새 Backend App access token |
| `accessTokenExpiresAt` | string | 아니오 | 새 access token 만료 시각 |
| `refreshToken` | null | 예 | 항상 null |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `AuthSession`, `AuthDevice`, `User`
- 수정: `AuthSession.refreshTokenHash`, `AuthSession.lastUsedAt`, `AuthSession.expiresAt`
- 삭제: 없음
- 감사 로그: 없음
- transaction: refresh token rotation 갱신

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| refresh cookie 없음 | `Unauthorized` | 401 |
| session 없음 또는 revoked | `Unauthorized` | 401 |
| session 만료 | `Unauthorized` | 401 |
| origin invalid | `InvalidRefreshOrigin` | 400 |
| 계정 비활성 | `InactiveUser` | 403 |

### FE/BE 처리 기준

- FE: API 401을 받으면 refresh를 1회 시도하고 성공 시 원 요청을 1회 재시도한다.
- FE: 동시 401은 shared promise 또는 queue로 refresh 호출 1개만 실행한다.
- FE: refresh 실패 시 memory token을 제거하고 로그인 화면으로 보낸다.
- BE: refresh token 원문을 DB나 response body에 저장/노출하지 않는다.
- 검증: 만료 access token, revoked session, invalid origin, 동시 refresh를 테스트한다.

## 7. Logout API

- API 이름: Logout API
- API 식별자: `LogoutAuthSession`
- Method: `POST`
- Path: `/api/auth/logout`
- 인증: Backend App access token
- 권한: 현재 사용자 session

### Request

- Request 이름: `LogoutAuthSessionRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 현재 session 식별 |
| cookie | refresh token | httpOnly cookie | 아니오 | 있으면 clear 대상 | refresh cookie |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 access token을 검증한다.
2. token의 `sessionId`로 `AuthSession`을 조회한다.
3. session이 있으면 `status=REVOKED`, `revokedAt=now()`로 갱신한다.
4. refresh cookie를 clear한다.
5. `success: true`를 반환한다.

### Response

- Response 이름: `LogoutResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `success` | boolean | 아니오 | logout 처리 성공 여부 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `AuthSession`
- 수정: `AuthSession.status`, `AuthSession.revokedAt`
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| access token invalid | `Unauthorized` | 401 |

### FE/BE 처리 기준

- FE: Backend logout이 401이어도 memory token과 Supabase session은 정리한다.
- BE: 가능한 경우 인증 실패 응답에서도 refresh cookie clear header를 내려준다.
- 검증: 정상 logout, 이미 만료된 access token logout, cookie clear를 확인한다.

## 8. 현재 사용자 조회 API

- API 이름: 현재 사용자 조회 API
- API 식별자: `GetCurrentUser`
- Method: `GET`
- Path: `/api/me`
- 인증: Backend App access token
- 권한: ACTIVE user

### Request

- Request 이름: `GetCurrentUserRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 access token과 `AuthSession`을 검증한다.
2. token의 userId로 `User`를 조회한다.
3. `User.status`가 `ACTIVE`인지 확인한다.
4. User Web route guard에 필요한 최소 사용자 정보를 response DTO로 변환한다.

### Response

- Response 이름: `CurrentUserResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | User ID |
| `supabaseUserId` | string | 예 | Supabase user ID |
| `name` | string | 예 | 사용자 이름 |
| `email` | string | 예 | 이메일 |
| `role` | string | 아니오 | `USER` 또는 `ADMIN` |
| `status` | string | 아니오 | 사용자 상태 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `User`, `AuthSession`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 또는 invalid | `Unauthorized` | 401 |
| session inactive | `Unauthorized` | 401 |
| 계정 비활성 | `InactiveUser` | 403 |

### FE/BE 처리 기준

- FE: User Web route guard는 이 API 성공을 기준으로 보호 라우트를 연다.
- BE: Admin 전용 판단을 이 User API에 섞지 않는다.
- 검증: ACTIVE user 성공, inactive user 403, revoked session 401을 확인한다.

## 9. Admin 현재 사용자 조회 API

- API 이름: Admin 현재 사용자 조회 API
- API 식별자: `GetAdminCurrentUser`
- Method: `GET`
- Path: `/admin/api/me`
- 인증: Backend App access token
- 권한: `ADMIN`

### Request

- Request 이름: `GetAdminCurrentUserRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 access token과 `AuthSession`을 검증한다.
2. AdminGuard로 `User.role === ADMIN`인지 확인한다.
3. `User.status`가 `ACTIVE`인지 확인한다.
4. Admin Web route guard에 필요한 최소 관리자 정보를 response DTO로 변환한다.

### Response

- Response 이름: `AdminCurrentUserResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | User ID |
| `supabaseUserId` | string | 예 | Supabase user ID |
| `name` | string | 예 | 관리자 이름 |
| `email` | string | 예 | 이메일 |
| `role` | string | 아니오 | `ADMIN` |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `User`, `AuthSession`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 또는 invalid | `Unauthorized` | 401 |
| Admin 권한 없음 | `Forbidden` | 403 |
| 계정 비활성 | `InactiveUser` | 403 |

### FE/BE 처리 기준

- FE: Admin Web route guard는 이 API 성공과 `role: "ADMIN"`을 기준으로 보호 라우트를 연다.
- BE: User API controller와 분리된 Admin route/controller에서 처리한다.
- 검증: ADMIN 성공, USER 403, revoked session 401을 확인한다.

## 10. 개인 정보 조회 API

- API 이름: 개인 정보 조회 API
- API 식별자: `GetMyProfile`
- Method: `GET`
- Path: `/api/users/me/profile`
- 인증: Backend App access token
- 권한: 본인

### Request

- Request 이름: `GetMyProfileRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 userId로 `User`를 조회한다.
3. 현재 userId의 `UserOAuthAccount` 목록을 조회한다.
4. provider token hash 같은 민감값은 제외한다.
5. 설정 화면용 profile DTO로 변환한다.

### Response

- Response 이름: `UserProfileResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | User ID |
| `email` | string | 예 | 이메일 |
| `name` | string | 예 | 사용자 이름 |
| `role` | string | 아니오 | 권한 |
| `status` | string | 아니오 | 계정 상태 |
| `lastLoginAt` | string | 예 | 마지막 로그인 시각 |
| `createdAt` | string | 아니오 | 가입 시각 |
| `updatedAt` | string | 아니오 | 최근 수정 시각 |
| `oauthAccounts` | `OAuthAccountResponse[]` | 아니오 | 연결 provider 목록 |
| `oauthAccounts[].id` | string | 아니오 | OAuth account ID |
| `oauthAccounts[].provider` | string | 아니오 | provider |
| `oauthAccounts[].providerEmail` | string | 예 | provider 이메일 |
| `oauthAccounts[].createdAt` | string | 아니오 | provider 연결 시각 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `User`, `UserOAuthAccount`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 또는 invalid | `Unauthorized` | 401 |
| 계정 비활성 | `InactiveUser` | 403 |

### FE/BE 처리 기준

- FE: 설정 탭 진입 시 조회한다.
- FE: profile 수정 성공 후 이 query를 재조회한다.
- BE: provider access/refresh token hash는 응답하지 않는다.
- 검증: oauthAccounts 포함 여부와 민감값 미노출을 확인한다.

## 11. 개인 정보 수정 API

- API 이름: 개인 정보 수정 API
- API 식별자: `UpdateMyProfile`
- Method: `PATCH`
- Path: `/api/users/me/profile`
- 인증: Backend App access token
- 권한: 본인

### Request

- Request 이름: `UpdateMyProfileRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| body | `name` | string \| null | 예 | null 또는 80자 이하. 빈 문자열은 null로 정규화 | 수정할 이름 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. request body의 `name`을 validation한다.
3. 빈 문자열이면 `null`로 정규화한다.
4. 현재 userId의 `User.displayName` 또는 현재 구현의 이름 컬럼만 수정한다.
5. 이메일, role, status는 이 API에서 수정하지 않는다.
6. 수정 후 profile 조회와 같은 shape로 응답한다.

### Response

- Response 이름: `UserProfileResponse`
- Status: `200 OK`
- Body: 있음

필드는 `GET /api/users/me/profile`과 같다.

### 연결된 DB 스키마

- 생성: 없음
- 조회: `User`, `UserOAuthAccount`
- 수정: `User.displayName` 또는 현재 구현 이름 컬럼
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 또는 invalid | `Unauthorized` | 401 |
| name 형식 오류 | `ValidationError` | 400 |
| 계정 비활성 | `InactiveUser` | 403 |

### FE/BE 처리 기준

- FE: 저장 성공 후 profile query를 갱신한다.
- FE: validation 오류는 form field 메시지로 표시한다.
- BE: 이메일/권한/상태 수정을 차단한다.
- 검증: 정상 이름 수정, null 저장, 80자 초과 validation을 확인한다.

## 12. 등록 기기 조회 API

- API 이름: 등록 기기 조회 API
- API 식별자: `ListMyDevices`
- Method: `GET`
- Path: `/api/users/me/devices`
- 인증: Backend App access token
- 권한: 본인

### Request

- Request 이름: `ListMyDevicesRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

### 내부 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 userId의 ACTIVE `AuthDevice` 목록을 조회한다.
3. 각 device의 ACTIVE `AuthSession` 수를 계산한다.
4. 현재 요청의 sessionId와 연결된 device를 찾아 `isCurrentDevice`를 계산한다.
5. device id 원문, deviceIdHash, refresh token hash는 응답하지 않는다.
6. 설정 화면용 device list DTO로 변환한다.

### Response

- Response 이름: `MyDeviceListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `devices` | `MyDeviceResponse[]` | 아니오 | 활성 등록 기기 목록 |
| `devices[].id` | string | 아니오 | AuthDevice ID |
| `devices[].slot` | string | 아니오 | device slot |
| `devices[].label` | string | 예 | 기기 표시 이름 |
| `devices[].status` | string | 아니오 | 기기 상태 |
| `devices[].lastSeenAt` | string | 예 | 마지막 사용 시각 |
| `devices[].createdAt` | string | 아니오 | 등록 시각 |
| `devices[].updatedAt` | string | 아니오 | 최근 수정 시각 |
| `devices[].activeSessionCount` | number | 아니오 | 활성 session 수 |
| `devices[].isCurrentDevice` | boolean | 아니오 | 현재 접속 기기 여부 |

### 연결된 DB 스키마

- 생성: 없음
- 조회: `AuthDevice`, `AuthSession`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 또는 invalid | `Unauthorized` | 401 |
| 계정 비활성 | `InactiveUser` | 403 |

### FE/BE 처리 기준

- FE: `slot`을 모바일, 개인 노트북, 회사 노트북 라벨로 변환한다.
- FE: `isCurrentDevice`가 true인 항목에 현재 기기 badge를 표시한다.
- FE: 기기명 수정/해제 버튼은 만들지 않는다.
- BE: ACTIVE 기기만 반환한다.
- 검증: 현재 기기 표시, active session count, revoked/replaced device 제외를 확인한다.

## 13. 관련 문서

- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/COMMON/AUTH-FE-CONTRACT.md`
- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/COMMON/WORK-SPLIT.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
