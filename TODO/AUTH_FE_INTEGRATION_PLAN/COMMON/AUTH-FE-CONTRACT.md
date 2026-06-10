# Auth FE Contract

## 1. 인증 방식 요약

현재 로그인/회원가입 방식은 `Supabase Auth + Backend token exchange`다.

Frontend는 provider 로그인과 Supabase callback 처리를 담당한다. Backend는 Supabase access token을 검증하고, 내부 `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 생성하거나 갱신한다.

회원가입은 별도 API가 아니라 `POST /api/auth/exchange`에서 자동으로 일어난다. 처음 보는 `provider + providerUserId` 조합이면 Backend가 내부 User를 만든다.

## 1-1. 문서 작성 기준

이 계약 문서는 `TODO/SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고해 작성한다.

API를 수정할 때는 아래 항목을 반드시 함께 갱신한다.

- 요청값 형태: path param, query, header, body, 필수 여부, validation 기준
- 응답값 형태: success status, response body 유무, DTO 이름, 필드명, 타입
- 내부 비즈니스 로직: 인증, provider 검증, user/session/device 처리, transaction, cookie 처리, 에러 분기
- 연결 DB 스키마: 생성/조회/수정 model과 transaction 대상
- FE/BE 처리 기준: token 저장 위치, refresh 재시도, query 재조회, domain error 처리

## 2. Frontend 책임

- Supabase client 초기화
- Kakao, Naver, Google provider 로그인 시작
- Supabase callback 처리
- Supabase session에서 access token 확보
- Backend `POST /api/auth/exchange` 호출
- Backend App access token을 memory에 저장
- refresh cookie를 받을 수 있도록 auth 요청에 credentials 포함
- Backend API 요청에 `Authorization: Bearer <app_access_token>` header 추가
- 401 응답 시 refresh 후 원 요청 1회 재시도
- 로그아웃 시 Backend session revoke와 Supabase signOut 수행
- 설정 탭에서 개인 정보 조회, 개인 정보 수정, 등록 기기 조회 연결
- Admin Web에서는 `/admin/api/me`로 ADMIN 권한 확인

## 3. Frontend가 하지 말아야 하는 일

- Supabase access token을 localStorage/sessionStorage에 저장하지 않는다.
- Backend refresh token을 JavaScript 상태로 저장하지 않는다.
- Supabase access token을 일반 Backend API 인증에 사용하지 않는다.
- Supabase PostgreSQL에 직접 쓰지 않는다.
- 같은 이메일의 다른 provider 계정을 Frontend에서 임의로 병합하지 않는다.

## 4. Provider 목록

### `GET /api/auth/providers`

로그인 화면에서 provider 버튼 활성화 상태를 가져온다.

Response:

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

Frontend 처리:

- `enabled: true`인 provider만 로그인 가능 버튼으로 표시한다.
- `status: "planned"`는 비활성 버튼 또는 숨김 처리한다.
- provider 값은 `kakao`, `naver`, `google`, `apple` 중 하나다.

## 5. Token Exchange

### `POST /api/auth/exchange`

Supabase 로그인 성공 후 Backend App token과 Backend refresh cookie를 받는다.

Request:

```http
POST /api/auth/exchange
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

`credentials: "include"`를 반드시 사용한다.

Body:

```json
{
  "deviceSlot": "personal_laptop",
  "deviceId": "stable-device-id",
  "deviceLabel": "MacBook Chrome",
  "replaceExistingDevice": false
}
```

Body fields:

| 필드 | 필수 | 설명 |
|---|---:|---|
| `deviceSlot` | 예 | `mobile`, `personal_laptop`, `work_laptop` |
| `deviceId` | 예 | 브라우저 profile 또는 앱 설치 단위 stable id. 8~200자 |
| `deviceLabel` | 아니오 | 사용자에게 보여줄 기기 이름. 최대 120자 |
| `replaceExistingDevice` | 아니오 | 같은 슬롯의 기존 기기를 교체할지 여부. 기본 `false` |

Response:

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

Frontend 처리:

- `accessToken`만 memory state에 저장한다.
- `refreshToken`은 항상 `null`로 취급한다.
- refresh cookie는 브라우저가 httpOnly cookie로 관리하게 둔다.
- `user.role`이 `ADMIN`이어도 Admin Web 접근은 `/admin/api/me`로 다시 확인한다.

## 6. Device Slot Conflict

같은 사용자와 같은 `deviceSlot`에 다른 활성 기기가 있으면 Backend는 다음 에러를 반환한다.

```json
{
  "statusCode": 409,
  "error": "DeviceSlotAlreadyRegistered",
  "message": "Another active device is already registered in this slot"
}
```

Frontend 처리:

1. 사용자에게 같은 슬롯의 기존 기기가 있다는 확인 UI를 보여준다.
2. 사용자가 교체를 선택하면 같은 Supabase access token으로 `replaceExistingDevice: true`를 넣어 `POST /api/auth/exchange`를 다시 호출한다.
3. 사용자가 취소하면 로그인 상태를 만들지 않는다.

## 7. Refresh

### `POST /api/auth/refresh`

Backend App access token이 만료되었을 때 새 access token을 받는다.

요구사항:

- `credentials: "include"` 필수
- body 없음
- `Authorization` header 없음
- 브라우저가 `Origin` header를 보내야 하며 Backend 허용 origin에 포함되어야 한다.

Frontend 처리:

- API 응답이 401이면 refresh를 1회 시도한다.
- refresh 성공 시 memory access token을 갱신하고 원 요청을 1회 재시도한다.
- refresh 실패 시 memory access token을 제거하고 로그인 화면으로 보낸다.
- 동시에 여러 요청이 401을 받으면 refresh 요청은 하나만 실행되게 queue 또는 shared promise로 묶는다.

## 8. Logout

### `POST /api/auth/logout`

현재 Backend session을 revoke한다.

Request:

```http
POST /api/auth/logout
Authorization: Bearer <backend_app_access_token>
```

`credentials: "include"`를 사용해서 Backend가 refresh cookie를 clear할 수 있게 한다.

Response:

```json
{
  "success": true
}
```

Frontend 처리:

1. Backend logout 호출
2. memory access token 제거
3. Supabase Auth `signOut` 호출
4. 로그인 화면으로 이동

Backend logout이 401을 반환해도 Frontend local auth state와 Supabase session은 정리한다.

## 9. Current User

### `GET /api/me`

User Web에서 현재 로그인 사용자를 확인한다.

Request:

```http
GET /api/me
Authorization: Bearer <backend_app_access_token>
```

Response:

```json
{
  "id": "uuid",
  "supabaseUserId": "supabase-user-id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "USER",
  "status": "ACTIVE"
}
```

### `GET /admin/api/me`

Admin Web에서 ADMIN 권한을 확인한다.

Request:

```http
GET /admin/api/me
Authorization: Bearer <backend_app_access_token>
```

Response:

```json
{
  "id": "uuid",
  "supabaseUserId": "supabase-user-id",
  "name": "Admin Name",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

Frontend 처리:

- User Web route guard는 `/api/me` 성공을 기준으로 보호 라우트 접근을 허용한다.
- Admin Web route guard는 `/admin/api/me` 성공과 `role: "ADMIN"`을 기준으로 보호 라우트 접근을 허용한다.
- Admin Web에서 403이면 Admin 권한 없음 화면 또는 User Web 이동 안내를 보여준다.

## 10. Settings Tab User APIs

사이드바의 설정 탭은 현재 다음 API만 사용한다.

### `GET /api/users/me/profile`

개인 정보 조회.

Request:

```http
GET /api/users/me/profile
Authorization: Bearer <backend_app_access_token>
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER",
  "status": "ACTIVE",
  "lastLoginAt": "2026-06-10T12:00:00.000Z",
  "createdAt": "2026-06-01T12:00:00.000Z",
  "updatedAt": "2026-06-10T12:00:00.000Z",
  "oauthAccounts": [
    {
      "id": "uuid",
      "provider": "google",
      "providerEmail": "user@example.com",
      "createdAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

### `PATCH /api/users/me/profile`

개인 정보 수정. 현재 수정 가능한 값은 이름뿐이다. 이메일은 외부 Auth provider에서 동기화되므로 FE에서 수정하지 않는다.

Request:

```http
PATCH /api/users/me/profile
Authorization: Bearer <backend_app_access_token>
Content-Type: application/json
```

Body:

```json
{
  "name": "New Name"
}
```

이름을 비우려면 `name: null` 또는 빈 문자열을 보낼 수 있다. Backend는 빈 문자열을 `null`로 정규화한다.

Response는 `GET /api/users/me/profile`과 같다.

### `GET /api/users/me/devices`

등록 기기 조회. 현재 활성 등록 기기만 반환한다.

Request:

```http
GET /api/users/me/devices
Authorization: Bearer <backend_app_access_token>
```

Response:

```json
{
  "devices": [
    {
      "id": "uuid",
      "slot": "personal_laptop",
      "label": "MacBook Chrome",
      "status": "ACTIVE",
      "lastSeenAt": "2026-06-10T12:00:00.000Z",
      "createdAt": "2026-06-01T12:00:00.000Z",
      "updatedAt": "2026-06-10T12:00:00.000Z",
      "activeSessionCount": 1,
      "isCurrentDevice": true
    }
  ]
}
```

Frontend 처리:

- `isCurrentDevice: true`인 항목을 현재 접속 기기로 표시한다.
- `slot`은 모바일, 개인 노트북, 회사 노트북 라벨로 변환해서 표시한다.
- 기기명 수정/기기 해제 API는 아직 없다. UI에 액션 버튼을 만들지 않는다.

## 11. Error Handling

Domain error shape:

```json
{
  "statusCode": 400,
  "error": "InvalidDeviceId",
  "message": "Device id is invalid"
}
```

FE가 명시적으로 처리할 코드:

| status | error | 처리 |
|---:|---|---|
| 400 | `InvalidDeviceSlot` | 기기 슬롯 선택 UI 오류로 보고 재선택 유도 |
| 400 | `InvalidDeviceId` | local device id 재생성 후 재시도 안내 |
| 400 | `InvalidRefreshOrigin` | 환경 설정 오류로 보고 재로그인 유도 |
| 401 | `Unauthorized` 또는 HTTP 401 | refresh 시도. refresh 실패 시 로그아웃 처리 |
| 403 | `InactiveUser` | 계정 비활성/삭제 안내 후 로그아웃 |
| 403 | Admin API 403 | Admin 권한 없음 안내 |
| 409 | `DeviceSlotAlreadyRegistered` | 기기 교체 확인 후 exchange 재시도 |
| 422 | `ExternalUserEmailMissing` | provider 이메일 권한 문제 안내 |

그 외 에러는 일반 로그인 실패 또는 네트워크 오류로 처리한다.

## 12. Device ID 규칙

Frontend는 stable `deviceId`를 만들어 `POST /api/auth/exchange`에 보낸다.

권장:

- 브라우저 profile 단위로 1회 생성
- crypto random UUID 또는 동등 수준 난수
- localStorage에 저장 가능
- 원문은 Backend에 저장되지 않고 hash만 저장된다.

주의:

- access token이나 refresh token을 deviceId로 쓰지 않는다.
- user email, provider id 같은 개인정보를 deviceId로 쓰지 않는다.

## 13. Token Storage 규칙

| 토큰 | 저장 위치 | 설명 |
|---|---|---|
| Supabase access token | memory 또는 Supabase client 내부 session | Backend exchange에만 사용 |
| Backend App access token | memory only | 일반 Backend API Authorization header에 사용 |
| Backend refresh token | httpOnly cookie | JavaScript에서 읽지 않음 |

새로고침 시 memory access token은 사라질 수 있다. 앱 bootstrap에서 `/api/auth/refresh`를 한 번 시도해 session 복원을 수행한다.

## 14. Current Backend Prerequisite

Backend 코드는 구현되어 있지만, 깨끗한 DB에서는 User/Auth DDL 또는 Prisma migration이 먼저 필요하다. FE goal은 API 계약에 맞춰 구현하되, 실제 provider smoke는 Backend DB 준비가 끝난 뒤 수행한다.

## 15. API 상세 명세 보강

이 섹션은 위 계약을 API 명세 형식으로 다시 고정한다. FE/BE 작업자는 이 섹션을 기준으로 request DTO, response DTO, use case, test를 맞춘다.

### 15.1 Provider 목록 API

- API 이름: Provider 목록 API
- API 식별자: ListAuthProviders
- Method: `GET`
- Path: `/api/auth/providers`
- 인증: 없음
- 권한: 없음

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| query | 없음 | 없음 | 아니오 | 요청값 없음 |

내부 비즈니스 로직:

1. Backend 설정 또는 provider registry에서 provider 목록을 읽는다.
2. provider별 enabled/status/displayOrder 값을 만든다.
3. 로그인 화면에서 필요한 공개 정보만 응답한다.

Response:

- Response 이름: `AuthProviderListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `providers` | `AuthProviderResponse[]` | provider 버튼 구성 목록 |
| `providers[].provider` | string | `kakao`, `naver`, `google`, `apple` |
| `providers[].label` | string | 화면 표시 이름 |
| `providers[].enabled` | boolean | 로그인 가능 여부 |
| `providers[].status` | string | `enabled`, `disabled`, `planned` |
| `providers[].displayOrder` | number | 화면 정렬 순서 |

연결 DB 스키마:

- 생성: 없음
- 조회: 없음 또는 provider 설정 저장소
- 수정: 없음
- transaction: 없음

FE/BE 처리 기준:

- FE: `enabled: true`만 로그인 가능 버튼으로 표시한다.
- BE: 비밀값이나 provider client secret을 응답하지 않는다.
- 검증: disabled/planned provider가 로그인 가능 UI로 노출되지 않는지 확인한다.

### 15.2 Token Exchange API

- API 이름: Token Exchange API
- API 식별자: ExchangeAuthToken
- Method: `POST`
- Path: `/api/auth/exchange`
- 인증: Supabase access token 필요
- 권한: Supabase token 검증 성공 사용자

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| header | `Authorization` | string | 예 | `Bearer <supabase_access_token>` |
| body | `deviceSlot` | string | 예 | `mobile`, `personal_laptop`, `work_laptop` |
| body | `deviceId` | string | 예 | stable device id. 8~200자 |
| body | `deviceLabel` | string \| null | 아니오 | 사용자에게 보여줄 기기 이름. 최대 120자 |
| body | `replaceExistingDevice` | boolean | 아니오 | 같은 슬롯의 기존 기기 교체 여부 |

내부 비즈니스 로직:

1. Supabase access token을 검증한다.
2. provider, providerUserId, email을 추출한다.
3. 기존 `UserOAuthAccount`가 있으면 연결된 `User`를 조회한다.
4. 처음 보는 provider 계정이면 transaction 안에서 `User`, `UserOAuthAccount`를 생성한다.
5. `deviceSlot`, `deviceId`, `deviceLabel`을 validation한다.
6. 같은 userId와 deviceSlot에 다른 active device가 있고 `replaceExistingDevice`가 false면 `DeviceSlotAlreadyRegistered`를 반환한다.
7. 교체가 허용되면 기존 device/session을 revoke한다.
8. `AuthDevice`를 생성하거나 lastSeenAt을 갱신한다.
9. `AuthSession`을 생성하고 Backend app access token과 refresh cookie를 발급한다.
10. refresh token 원문은 response body에 넣지 않고 httpOnly cookie로만 내려준다.

Response:

- Response 이름: `AuthExchangeResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `accessToken` | string | Backend App access token |
| `accessTokenExpiresAt` | string | access token 만료 시각 |
| `refreshToken` | null | 항상 null. JS에서 refresh token을 읽지 않게 하기 위한 자리 |
| `user` | object | 내부 사용자 정보 |
| `user.id` | string | 내부 User ID |
| `user.supabaseUserId` | string | Supabase user ID |
| `user.name` | string \| null | 사용자 이름 |
| `user.email` | string | 이메일 |
| `user.role` | string | `USER` 또는 `ADMIN` |
| `user.status` | string | 계정 상태 |
| `device` | object | 등록 기기 정보 |
| `device.id` | string | AuthDevice ID |
| `device.slot` | string | device slot |
| `device.label` | string \| null | 기기 표시 이름 |

연결 DB 스키마:

- 생성: `User` 조건부, `UserOAuthAccount` 조건부, `AuthDevice` 조건부, `AuthSession`
- 조회: `User`, `UserOAuthAccount`, `AuthDevice`
- 수정: `User.lastLoginAt`, `AuthDevice.lastSeenAt`, 기존 `AuthDevice/AuthSession` revoke 조건부
- transaction: user/account/device/session 생성과 교체 흐름

FE/BE 처리 기준:

- FE: `accessToken`만 memory에 저장하고 refresh token은 저장하지 않는다.
- FE: 409 `DeviceSlotAlreadyRegistered`를 받으면 교체 확인 UI 후 `replaceExistingDevice: true`로 재시도한다.
- BE: Supabase token과 provider 계정 검증을 application use case 안에서 처리하고 외부 provider 호출은 adapter 뒤에 둔다.
- 검증: 신규 가입, 기존 로그인, device conflict, device replace, inactive user 흐름을 테스트한다.

### 15.3 Refresh API

- API 이름: Refresh API
- API 식별자: RefreshAuthSession
- Method: `POST`
- Path: `/api/auth/refresh`
- 인증: httpOnly refresh cookie
- 권한: 유효한 active session

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| cookie | refresh token | httpOnly cookie | 예 | JS에서 읽을 수 없음 |
| header | `Origin` | string | 예 | Backend 허용 origin 검증 대상 |
| body | 없음 | 없음 | 아니오 | body 없음 |

내부 비즈니스 로직:

1. refresh cookie를 읽고 hash 또는 session 식별자로 `AuthSession`을 조회한다.
2. session이 active이고 만료되지 않았는지 확인한다.
3. Origin이 허용 목록인지 확인한다.
4. 필요한 경우 refresh token rotation을 수행한다.
5. 새 Backend app access token을 발급한다.
6. 새 refresh cookie를 내려주거나 기존 cookie를 유지한다.

Response:

- Response 이름: `AuthRefreshResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `accessToken` | string | 새 Backend App access token |
| `accessTokenExpiresAt` | string | 새 access token 만료 시각 |
| `refreshToken` | null | 항상 null |

연결 DB 스키마:

- 생성: 없음 또는 rotated `AuthSession` token 정보
- 조회: `AuthSession`, `AuthDevice`, `User`
- 수정: `AuthSession.lastUsedAt`, refresh token hash 조건부
- transaction: refresh rotation을 하면 필요

FE/BE 처리 기준:

- FE: 401을 받으면 refresh를 1회만 시도하고 성공 시 원 요청을 1회 재시도한다.
- FE: 동시 401은 shared promise 또는 queue로 refresh 1회만 실행한다.
- BE: refresh token 원문을 response body에 넣지 않는다.
- 검증: 만료 token, revoked session, invalid origin, 동시 refresh 흐름을 확인한다.

### 15.4 Logout API

- API 이름: Logout API
- API 식별자: LogoutAuthSession
- Method: `POST`
- Path: `/api/auth/logout`
- 인증: Backend app access token, refresh cookie
- 권한: 현재 사용자 session

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` |
| cookie | refresh token | httpOnly cookie | 아니오 | 있으면 함께 revoke/clear |
| body | 없음 | 없음 | 아니오 | body 없음 |

내부 비즈니스 로직:

1. Backend app access token으로 현재 user/session을 확인한다.
2. refresh cookie가 있으면 현재 `AuthSession`을 찾는다.
3. session을 revoked 상태로 갱신한다.
4. refresh cookie를 clear한다.
5. 성공 응답을 반환한다.

Response:

- Response 이름: `LogoutResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `success` | boolean | logout 처리 성공 여부 |

연결 DB 스키마:

- 생성: 없음
- 조회: `AuthSession`
- 수정: `AuthSession.status`, `revokedAt`
- transaction: 없음

FE/BE 처리 기준:

- FE: Backend logout이 401이어도 memory token과 Supabase session을 정리한다.
- BE: cookie clear는 실패/성공 모두 가능한 한 수행한다.
- 검증: 정상 logout, 이미 만료된 session logout, cookie clear를 확인한다.

### 15.5 Current User API

- API 이름: 현재 사용자 조회 API
- API 식별자: GetCurrentUser
- Method: `GET`
- Path: `/api/me`
- 인증: Backend app access token
- 권한: active user

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` |

내부 비즈니스 로직:

1. AuthGuard로 access token을 검증한다.
2. token의 userId로 active `User`를 조회한다.
3. User Web에서 필요한 최소 사용자 정보를 반환한다.

Response:

- Response 이름: `CurrentUserResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | User ID |
| `supabaseUserId` | string | Supabase user ID |
| `name` | string \| null | 사용자 이름 |
| `email` | string | 이메일 |
| `role` | string | 사용자 권한 |
| `status` | string | 계정 상태 |

연결 DB 스키마:

- 조회: `User`
- 생성/수정/삭제: 없음
- transaction: 없음

FE/BE 처리 기준:

- FE: User Web route guard는 이 API 성공을 기준으로 보호 라우트를 연다.
- BE: inactive user는 403 계열 domain error로 막는다.
- 검증: active user, inactive user, expired token 흐름을 확인한다.

### 15.6 Admin Current User API

- API 이름: Admin 현재 사용자 조회 API
- API 식별자: GetAdminCurrentUser
- Method: `GET`
- Path: `/admin/api/me`
- 인증: Backend app access token
- 권한: `ADMIN`

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` |

내부 비즈니스 로직:

1. AuthGuard로 access token을 검증한다.
2. token의 userId로 active `User`를 조회한다.
3. `role`이 `ADMIN`인지 확인한다.
4. Admin Web에 필요한 최소 관리자 정보를 반환한다.

Response:

- Response 이름: `AdminCurrentUserResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | User ID |
| `supabaseUserId` | string | Supabase user ID |
| `name` | string \| null | 관리자 이름 |
| `email` | string | 이메일 |
| `role` | string | `ADMIN` |

연결 DB 스키마:

- 조회: `User`
- 생성/수정/삭제: 없음
- transaction: 없음

FE/BE 처리 기준:

- FE: Admin Web route guard는 이 API 성공과 `role: "ADMIN"`을 기준으로 보호 라우트를 연다.
- BE: 일반 `USER`는 403으로 차단한다.
- 검증: ADMIN 통과, USER 403, inactive user 403을 확인한다.

### 15.7 Profile 조회 API

- API 이름: 개인 정보 조회 API
- API 식별자: GetMyProfile
- Method: `GET`
- Path: `/api/users/me/profile`
- 인증: Backend app access token
- 권한: 본인

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` |

내부 비즈니스 로직:

1. AuthGuard로 현재 사용자를 확인한다.
2. `User`와 연결된 `UserOAuthAccount` 목록을 조회한다.
3. 설정 화면에 필요한 profile 응답으로 변환한다.

Response:

- Response 이름: `UserProfileResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | User ID |
| `email` | string | 이메일 |
| `name` | string \| null | 사용자 이름 |
| `role` | string | 권한 |
| `status` | string | 계정 상태 |
| `lastLoginAt` | string \| null | 마지막 로그인 시각 |
| `createdAt` | string | 가입 시각 |
| `updatedAt` | string | 최근 수정 시각 |
| `oauthAccounts` | `OAuthAccountResponse[]` | 연결 provider 목록 |

연결 DB 스키마:

- 조회: `User`, `UserOAuthAccount`
- 생성/수정/삭제: 없음
- transaction: 없음

FE/BE 처리 기준:

- FE: 설정 탭 진입 시 조회하고 이름 수정 성공 후 재조회한다.
- BE: provider token이나 민감정보를 응답하지 않는다.
- 검증: provider가 여러 개인 사용자와 provider가 1개인 사용자를 확인한다.

### 15.8 Profile 수정 API

- API 이름: 개인 정보 수정 API
- API 식별자: UpdateMyProfile
- Method: `PATCH`
- Path: `/api/users/me/profile`
- 인증: Backend app access token
- 권한: 본인

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` |
| body | `name` | string \| null | 예 | 수정할 이름. 빈 문자열은 null로 정규화 |

내부 비즈니스 로직:

1. AuthGuard로 현재 사용자를 확인한다.
2. `name`을 validation한다.
3. 빈 문자열이면 `null`로 정규화한다.
4. 현재 사용자의 `User.name`만 수정한다.
5. 수정된 profile을 다시 조회해 `UserProfileResponse`로 반환한다.

Response:

- Response 이름: `UserProfileResponse`
- Status: `200 OK`
- Body: 있음

필드는 `GET /api/users/me/profile`과 같다.

연결 DB 스키마:

- 조회: `User`, `UserOAuthAccount`
- 수정: `User.name`
- transaction: 없음

FE/BE 처리 기준:

- FE: 저장 성공 후 profile query를 갱신한다.
- BE: email, role, status는 이 API에서 수정하지 않는다.
- 검증: 정상 이름 수정, null 저장, 80자 초과 validation을 확인한다.

### 15.9 등록 기기 조회 API

- API 이름: 등록 기기 조회 API
- API 식별자: ListMyDevices
- Method: `GET`
- Path: `/api/users/me/devices`
- 인증: Backend app access token
- 권한: 본인

Request:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` |

내부 비즈니스 로직:

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자의 ACTIVE `AuthDevice` 목록을 조회한다.
3. 각 device의 active session 수를 계산한다.
4. 현재 요청 session과 연결된 device에 `isCurrentDevice: true`를 표시한다.
5. 설정 화면 응답으로 변환한다.

Response:

- Response 이름: `MyDeviceListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | 설명 |
|---|---|---|
| `devices` | `MyDeviceResponse[]` | 활성 등록 기기 목록 |
| `devices[].id` | string | AuthDevice ID |
| `devices[].slot` | string | device slot |
| `devices[].label` | string \| null | 기기 표시 이름 |
| `devices[].status` | string | 기기 상태 |
| `devices[].lastSeenAt` | string \| null | 마지막 사용 시각 |
| `devices[].createdAt` | string | 등록 시각 |
| `devices[].updatedAt` | string | 최근 수정 시각 |
| `devices[].activeSessionCount` | number | 활성 session 수 |
| `devices[].isCurrentDevice` | boolean | 현재 접속 기기 여부 |

연결 DB 스키마:

- 조회: `AuthDevice`, `AuthSession`
- 생성/수정/삭제: 없음
- transaction: 없음

FE/BE 처리 기준:

- FE: `isCurrentDevice`를 badge로 표시하고 기기 수정/해제 버튼은 노출하지 않는다.
- BE: ACTIVE 기기만 반환한다.
- 검증: 현재 기기 표시, active session count, revoked device 제외를 확인한다.
