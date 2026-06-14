# User Timezone API

## 1. 목적

이 문서는 일정 도메인 구현 전에 필요한 User timezone DB/API 계약을 정의한다.

이 계약은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`의 글로벌 timezone 기준을 따른다.

## 2. 계약 상태

| 항목 | 상태 |
|---|---|
| DB 계약 | confirmed |
| Backend API 계약 | confirmed |
| Frontend 소비 계약 | confirmed |
| 구현 상태 | implemented |

## 3. DB 계약

### 3.1. User 변경

`User` 모델에 `timeZone` 컬럼을 추가한다.

```prisma
model User {
  id       String @id @default(uuid()) @db.Uuid
  // ...
  timeZone String @default("Asia/Seoul")
}
```

규칙:

- 필수 컬럼이다.
- 기존 User row는 `Asia/Seoul`로 채운다.
- `timeZone`은 IANA timezone ID만 허용한다.
- DB check constraint는 선택 사항이다. 1차 구현은 application validation을 정본으로 둔다.
- 인덱스는 만들지 않는다.

허용 예:

- `Asia/Seoul`
- `Asia/Singapore`
- `America/Los_Angeles`
- `America/New_York`
- `Europe/London`

거부 예:

- `KST`
- `PST`
- `EST`
- `GMT+9`
- 빈 문자열

### 3.2. 기존 시간 컬럼

이번 goal에서 기존 `createdAt`, `updatedAt`, `lastLoginAt`, `expiresAt` 컬럼의 DB native type을 일괄 변경하지 않는다.

이 값들은 애플리케이션 기준으로 UTC instant로 취급하고 API 응답은 기존 `toISOString()` 형식을 유지한다.

## 4. 공통 API 규칙

- 인증은 기존 AuthGuard를 사용한다.
- 일반 User API는 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- 응답의 시스템 시각은 ISO 8601 UTC string이다.
- `timeZone`은 string이며 IANA timezone ID다.
- timezone validation 실패는 `400 ValidationError` 또는 기존 validation error 형식으로 반환한다.
- `timeZone`이 request body에서 빠지면 기존 값을 유지한다.
- `name`과 `timeZone`은 독립적으로 수정할 수 있다.

## 5. API 변경 목록

### 5.1. 현재 사용자 조회 API

- API 이름: 현재 사용자 조회 API
- API 식별자: `GetMe`
- Method: `GET`
- Path: `/api/me`
- 소비자: User Web
- 계약 상태: confirmed
- Transaction: 없음. 조회 전용
- Observability: 기존 `user.me.viewed` 기준 유지

#### Response

`MeResponse.user` 또는 기존 me response의 user 객체에 `timeZone`을 추가한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 내부 User ID |
| `supabaseUserId` | string | 예 | 외부 auth user ID |
| `name` | string | 예 | 표시 이름 |
| `email` | string | 예 | 이메일 |
| `role` | string | 아니오 | `USER` 또는 `ADMIN` |
| `status` | string | 아니오 | 계정 상태 |
| `timeZone` | string | 아니오 | IANA timezone ID |

예시:

```json
{
  "id": "uuid",
  "supabaseUserId": "external-user-id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "USER",
  "status": "ACTIVE",
  "timeZone": "Asia/Seoul"
}
```

### 5.2. Admin 현재 사용자 조회 API

- API 이름: Admin 현재 사용자 조회 API
- API 식별자: `GetAdminMe`
- Method: `GET`
- Path: `/admin/api/me`
- 소비자: Admin Web
- 계약 상태: confirmed
- Transaction: 없음. 조회 전용

Response에 `timeZone`을 추가한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 내부 User ID |
| `supabaseUserId` | string | 예 | 외부 auth user ID |
| `name` | string | 예 | 표시 이름 |
| `email` | string | 예 | 이메일 |
| `role` | string | 아니오 | 항상 `ADMIN` |
| `timeZone` | string | 아니오 | IANA timezone ID |

### 5.3. Token Exchange / Refresh 응답

- API 이름: Token Exchange API, Refresh API
- API 식별자: `ExchangeAuthToken`, `RefreshAuthSession`
- Path: `/api/auth/exchange`, `/api/auth/refresh`
- 소비자: User Web, Admin Web
- 계약 상태: confirmed

`AuthTokenResponse.user.timeZone`을 추가한다.

```json
{
  "accessToken": "<backend_app_access_token>",
  "accessTokenExpiresAt": "2026-06-14T03:10:00.000Z",
  "refreshToken": null,
  "user": {
    "id": "uuid",
    "supabaseUserId": "external-user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "timeZone": "Asia/Seoul"
  }
}
```

### 5.4. 개인 정보 조회 API

- API 이름: 개인 정보 조회 API
- API 식별자: `GetMyProfile`
- Method: `GET`
- Path: `/api/users/me/profile`
- 소비자: User Web
- 계약 상태: confirmed
- Transaction: 없음. 조회 전용
- Observability: 기존 `user.profile.viewed` 기준 유지

#### Response

기존 profile response에 `timeZone`을 추가한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | 내부 User ID |
| `email` | string | 예 | 이메일 |
| `name` | string | 예 | 표시 이름 |
| `role` | string | 아니오 | 사용자 역할 |
| `status` | string | 아니오 | 계정 상태 |
| `timeZone` | string | 아니오 | IANA timezone ID |
| `lastLoginAt` | string | 예 | ISO 8601 UTC string |
| `createdAt` | string | 아니오 | ISO 8601 UTC string |
| `updatedAt` | string | 아니오 | ISO 8601 UTC string |
| `oauthAccounts` | array | 아니오 | 연결 provider 목록 |

### 5.5. 개인 정보 수정 API

- API 이름: 개인 정보 수정 API
- API 식별자: `UpdateMyProfile`
- Method: `PATCH`
- Path: `/api/users/me/profile`
- 소비자: User Web
- 계약 상태: confirmed
- Transaction: 없음. 단일 User update
- Observability: 기존 `user.profile.updated` 기준 유지. timezone 값은 민감정보가 아니지만 request body 전체 logging은 금지

#### Request

Request 이름: `UpdateMyProfileRequest`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| body | `name` | string \| null | 아니오 | 최대 80자. 빈 문자열은 null 정규화 | 표시 이름 |
| body | `timeZone` | string | 아니오 | 유효한 IANA timezone ID | 사용자 기본 timezone |

예시:

```json
{
  "name": "홍길동",
  "timeZone": "America/Los_Angeles"
}
```

#### 내부 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. `name`이 있으면 기존 규칙대로 trim하고 빈 문자열은 null로 정규화한다.
3. `timeZone`이 있으면 trim한다.
4. `timeZone`이 없으면 기존 값을 유지한다.
5. `timeZone`이 있으면 IANA timezone ID인지 검증한다.
6. 수정 가능한 필드가 하나도 없어도 기존 profile 응답을 반환한다.
7. User row를 update한다.
8. 갱신된 profile을 조회해 반환한다.

#### Response

`GetMyProfile` response와 동일하다.

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 | `Unauthorized` | 401 |
| 비활성 사용자 | `InactiveUser` | 403 |
| `name` 길이 초과 | `ValidationError` | 400 |
| `timeZone`이 IANA ID가 아님 | `InvalidTimeZone` 또는 `ValidationError` | 400 |

## 6. Backend 구현 기준

- timezone validation은 application 계층에서 다시 수행한다. DTO validation만 믿지 않는다.
- 검증 helper는 Schedule 구현에서도 재사용할 수 있게 `shared` 또는 도메인 경계에 둔다.
- `Intl.DateTimeFormat(undefined, { timeZone })` 검증 또는 동등한 표준 API를 사용할 수 있다.
- `KST`, `PST`, `EST`, `GMT+9` 같은 약어/offset은 거부한다.
- `CurrentUserContext`에 `timeZone`을 포함해 Schedule API가 나중에 기본 timezone으로 사용할 수 있게 한다.

## 7. Frontend 처리 기준

- FE auth user type에 `timeZone`을 추가한다.
- 설정 화면은 사용자의 현재 `timeZone`을 select로 보여준다.
- timezone option은 최소 `Asia/Seoul`, `Asia/Singapore`, `America/Los_Angeles`, `America/New_York`, `Europe/London`을 포함한다.
- 브라우저 timezone은 기본 제안값으로만 사용하고, 저장된 `User.timeZone`을 우선한다.
- 저장 성공 후 profile query와 auth user state를 갱신한다.

## 8. 범위 밖

- Schedule request/response 설계
- Schedule local date-time 변환
- Organization timezone
- Admin Web timezone 설정 UI
- 기존 모든 DateTime 컬럼 native type 변경
