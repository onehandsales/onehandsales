# Auth FE Contract

## 1. 인증 방식 요약

현재 로그인/회원가입 방식은 `Supabase Auth + Backend token exchange`다.

Frontend는 provider 로그인과 Supabase callback 처리를 담당한다. Backend는 Supabase access token을 검증하고, 내부 `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 생성하거나 갱신한다.

회원가입은 별도 API가 아니라 `POST /api/auth/exchange`에서 자동으로 일어난다. 처음 보는 `provider + providerUserId` 조합이면 Backend가 내부 User를 만든다.

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
