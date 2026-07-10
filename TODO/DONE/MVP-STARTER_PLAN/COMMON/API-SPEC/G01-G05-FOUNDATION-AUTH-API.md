# G01-G05 Foundation/Auth API 명세

## 1. 목적

이 문서는 G01-G05에서 구현할 Backend 기반 API와 인증/사용자 context API 계약을 정의한다.

이 범위는 도메인 CRUD를 구현하기 전에 User Web, Admin Web, Backend가 같은 인증 기준과 기본 응답 구조를 사용할 수 있게 만드는 단계다.

## 2. 포함 goal

- G01. Backend 프로젝트 스캐폴딩
- G02. User Web 프로젝트 스캐폴딩
- G03. Admin Web 프로젝트 스캐폴딩
- G04. Prisma schema 1차 반영과 DB 연결
- G05. Auth/User Backend 기반

## 2.1. G00 인증 결정 반영

G00에서 Supabase Cloud 사용 범위는 `Auth`, `PostgreSQL`, 파일 저장소 adapter로 확정했다. 이 문서는 그중 인증 계약을 다룬다.

인증 처리 기준:

- Supabase Auth는 MVP 1차에서 외부 로그인 Provider 역할만 맡는다.
- User Web과 Admin Web은 Supabase Auth client로 provider login과 callback 처리를 수행한다.
- User Web의 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 Supabase OAuth authorize URL을 열고, popup이 차단되면 기존 full-page redirect로 fallback한다.
- FE는 Supabase access token을 Backend의 token exchange API에만 전달한다.
- Backend는 exchange 단계에서 Supabase token을 검증하고 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthDevice`, `AuthSession`을 생성하거나 갱신한다.
- Backend는 exchange 성공 시 서비스 자체 `App access token`과 refresh 수단을 발급한다.
- 이후 모든 User API와 Admin API는 Supabase access token이 아니라 Backend가 발급한 App access token을 `Authorization: Bearer <app_access_token>` header로 받는다.
- Backend `AuthGuard`는 App access token을 검증하고 current user context를 만든다.
- Supabase token 검증은 `ExternalAuthVerifier` port 뒤에 둔다. 나중에 Supabase Auth를 자체 Auth 또는 다른 OAuth/OIDC provider로 교체해도 business API의 인증 계약은 바꾸지 않는다.
- business data DB는 Supabase Cloud PostgreSQL이고, NestJS Backend가 Prisma로 직접 접속해 application layer에서 transaction을 관리한다.
- FE는 Supabase DB에 직접 접근하지 않고 business API와 Admin API는 항상 NestJS Backend를 통해 호출한다.
- local/integration/E2E test DB는 재현성과 안전한 reset을 위해 Docker PostgreSQL을 사용할 수 있다.
- Admin API는 App Bearer Token 검증 후 local `User.role = ADMIN`을 확인한다.
- 로그인 유지 정책은 `7일 sliding session`으로 간다.
- App access token은 FE memory에만 저장한다.
- refresh token은 httpOnly refresh cookie로 보관하고, DB에는 `AuthSession.refreshTokenHash`만 저장한다.
- refresh endpoint는 `SameSite=Lax` cookie와 Origin 검증을 함께 사용한다.
- local/preview는 분리 domain을 허용하되, production은 같은 parent domain 아래의 `app`, `admin`, `api` subdomain으로 배포한다.
- production 예시는 `https://app.salesb2c.com`, `https://admin.salesb2c.com`, `https://api.salesb2c.com`이다.
- CORS 허용 origin과 refresh Origin 검증은 환경별 allowlist 기준으로 처리한다.
- auth exchange/refresh/logout처럼 refresh cookie를 설정하거나 전송하는 요청은 허용된 origin에 한해 credential 포함 CORS를 허용한다.

인증 요청 공통 규칙:

- 인증이 필요한 User API와 Admin API는 `Authorization: Bearer <app_access_token>` header를 요구한다.
- Supabase access token은 `/api/auth/exchange` 외의 business API와 Admin API에 전달하지 않는다.
- App access token, App refresh token, Supabase access token을 query string, request body, client log, server log, analytics payload에 남기지 않는다.
- token 검증 실패, 만료, 누락은 `Unauthorized`로 응답한다.
- local user가 아직 동기화되지 않은 상태에서 일반 API를 호출하면 `UserSyncRequired`를 반환한다.

환경 변수 기준:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_JWKS_URL`
- `SUPABASE_JWT_ISSUER`
- `APP_JWT_ISSUER`
- `APP_JWT_AUDIENCE`
- `APP_JWT_SECRET`
- `APP_ACCESS_TOKEN_TTL_MINUTES`
- `APP_SESSION_TTL_DAYS`
- `APP_REFRESH_COOKIE_NAME`
- `APP_REFRESH_TOKEN_SECRET`
- `USER_WEB_ORIGIN`
- `ADMIN_WEB_ORIGIN`
- `API_PUBLIC_ORIGIN`
- `APP_ALLOWED_ORIGINS`
- `APP_REFRESH_COOKIE_DOMAIN`
- `INITIAL_ADMIN_EMAILS`

## 3. API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| Health Check API | `GetHealth` | `GET` | `/api/health` | `HealthCheckRequest` | `HealthCheckResponse` | 없음 |
| 소셜 로그인 Provider 목록 API | `ListAuthProviders` | `GET` | `/api/auth/providers` | `ListAuthProvidersRequest` | `AuthProviderListResponse` | 없음 |
| 외부 Auth Token 교환 API | `ExchangeExternalAuthToken` | `POST` | `/api/auth/exchange` | `ExchangeExternalAuthTokenRequest` | `AuthTokenResponse` | User, UserOAuthAccount, UserSetting, AuthDevice, AuthSession |
| App Token 갱신 API | `RefreshAppToken` | `POST` | `/api/auth/refresh` | `RefreshAppTokenRequest` | `AuthTokenResponse` | AuthSession |
| 로그아웃 API | `Logout` | `POST` | `/api/auth/logout` | `LogoutRequest` | `LogoutResponse` | AuthSession |
| 내 정보 조회 API | `GetMe` | `GET` | `/api/me` | `GetMeRequest` | `MeResponse` | User, UserSetting |
| 회원 탈퇴 API | `DeleteMyAccount` | `DELETE` | `/api/users/me` | `DeleteMyAccountRequest` | `DeleteMyAccountResponse` | User, AuthSession |
| 내 설정 조회 API | `GetMySettings` | `GET` | `/api/users/me/settings` | `GetMySettingsRequest` | `UserSettingResponse` | UserSetting |
| 내 설정 수정 API | `UpdateMySettings` | `PATCH` | `/api/users/me/settings` | `UpdateMySettingsRequest` | `UserSettingResponse` | UserSetting |
| Admin 내 정보 조회 API | `GetAdminMe` | `GET` | `/admin/api/me` | `GetAdminMeRequest` | `AdminMeResponse` | User |

## 4. API 상세

### 4.1 Health Check API

- API 이름: Health Check API
- API 식별자: `GetHealth`
- Method: `GET`
- Path: `/api/health`
- 인증: 없음
- 권한: 없음

#### 목적

Backend 서버가 실행 중인지 FE, 배포 환경, 로컬 개발자가 확인한다.

#### Request

- Request 이름: `HealthCheckRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. 서버 프로세스가 요청을 받는다.
2. DB 연결 확인은 G04 이후 선택적으로 붙인다.
3. API 서버 상태를 `ok`로 응답한다.

#### Response

- Response 이름: `HealthCheckResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `status` | `"ok"` | 서버 상태 |
| `timestamp` | string | 응답 시각 |

### 4.2 소셜 로그인 Provider 목록 API

- API 이름: 소셜 로그인 Provider 목록 API
- API 식별자: `ListAuthProviders`
- Method: `GET`
- Path: `/api/auth/providers`
- 인증: 없음
- 권한: 없음

#### 목적

User Web과 Admin Web 로그인 화면이 MVP에서 제공하는 소셜 로그인 버튼을 동일한 기준으로 렌더링한다.

#### Request

- Request 이름: `ListAuthProvidersRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. G00 결정에 따라 MVP 1차 provider 목록을 만든다.
2. Kakao, Google은 `enabled=true`로 반환한다.
3. Apple은 iOS 앱 개발 단계의 후속 provider이므로 `enabled=false`, `status=planned`로 반환할 수 있다.
4. 각 provider의 `enabled`, `status`, `label`, `displayOrder`를 반환한다.
5. provider별 실제 로그인 이동은 FE Supabase Auth client가 처리한다.

#### Response

- Response 이름: `AuthProviderListResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `providers` | array | provider 목록 |
| `providers[].provider` | enum | `kakao`, `google`, `apple` |
| `providers[].label` | string | UI 표시명 |
| `providers[].enabled` | boolean | 현재 사용 가능 여부 |
| `providers[].status` | enum | `enabled`, `planned`, `disabled` |
| `providers[].displayOrder` | number | 표시 순서 |

MVP 초기 provider 기준:

| provider | enabled | status | 비고 |
|---|---|---|---|
| `kakao` | true | `enabled` | MVP 초기 실제 구현 |
| `google` | true | `enabled` | MVP 초기 실제 구현 |
| `apple` | false | `planned` | iOS 앱 단계 후속 구현 |

### 4.3 외부 Auth Token 교환 API

- API 이름: 외부 Auth Token 교환 API
- API 식별자: `ExchangeExternalAuthToken`
- Method: `POST`
- Path: `/api/auth/exchange`
- 인증: Supabase Bearer Token
- 권한: 외부 token 소유 사용자

#### 목적

Supabase Auth 로그인 완료 후 Supabase token을 Backend App token으로 교환하고 local 사용자 데이터를 동기화한다.

#### Request

- Request 이름: `ExchangeExternalAuthTokenRequest`

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| header | `Authorization` | string | 필수 | `Bearer <supabase_access_token>` |
| body | `deviceSlot` | enum | 필수 | `mobile`, `personal_laptop`, `work_laptop` |
| body | `deviceId` | string | 필수 | FE가 브라우저 profile 또는 앱 설치 단위로 만든 비밀이 아닌 stable local device id. Backend는 hash만 저장 |
| body | `deviceLabel` | string | 선택 | 예: `개인 노트북 Chrome`, `회사 노트북 Edge`, `iPhone` |
| body | `replaceExistingDevice` | boolean | 선택 | 기본값 `false`. 같은 슬롯의 다른 등록 기기를 교체할 때만 `true` |

#### 비즈니스 로직 흐름

1. `ExternalAuthVerifier` port가 Supabase JWT의 서명, issuer, audience, 만료 시간을 검증한다.
2. 외부 token claim 또는 Supabase Auth adapter를 통해 `supabaseUserId`, `email`, `name`, `provider`, `providerAccountId`를 읽는다.
3. `deviceSlot`이 `mobile`, `personal_laptop`, `work_laptop` 중 하나인지 검증한다.
4. `deviceId`가 비어 있거나 허용 길이를 넘으면 `InvalidDeviceId`를 반환한다.
5. email이 없거나 검증 불가능하면 `ExternalUserEmailMissing`을 반환한다.
6. `UserOAuthAccount.provider + providerUserId`로 provider 계정 매핑을 조회한다.
7. provider 계정 매핑이 있으면 연결된 local `User`를 조회한다.
8. provider 계정 매핑이 없으면 같은 이메일의 기존 local `User`가 있더라도 자동 연결하지 않는다.
9. provider 계정 매핑이 없으면 새 `User`, `UserOAuthAccount`, `UserSetting`을 transaction으로 생성한다.
10. provider 계정 매핑이 있으면 이름, 이메일, 마지막 로그인 시각을 갱신한다.
11. 같은 이메일의 다른 provider 계정은 사용자가 후속 계정 연결 기능에서 직접 연결한다.
12. email을 trim/lowercase normalize한 뒤 `INITIAL_ADMIN_EMAILS` 목록과 비교한다.
13. email이 `INITIAL_ADMIN_EMAILS`에 포함되어 있으면 새 local `User`는 `role = ADMIN`으로 생성하고, 기존 local `User.role = USER`이면 `ADMIN`으로 승격한다.
14. local user가 `SUSPENDED` 또는 `DELETED` 등 active 상태가 아니면 `InactiveUser`를 반환한다.
15. `deviceId`를 hash한 뒤 같은 `userId + deviceSlot`의 active `AuthDevice`를 조회한다.
16. 같은 슬롯의 active `AuthDevice`가 없으면 새 `AuthDevice`를 만든다.
17. 같은 슬롯의 active `AuthDevice.deviceIdHash`가 요청 hash와 같으면 기존 `AuthDevice`를 재사용하고 `lastSeenAt`, `label`을 갱신한다.
18. 같은 슬롯의 active `AuthDevice.deviceIdHash`가 요청 hash와 다르고 `replaceExistingDevice=true`가 아니면 `DeviceSlotAlreadyRegistered`를 반환한다.
19. `replaceExistingDevice=true`이면 기존 `AuthDevice`를 `REPLACED`로 바꾸고 그 하위 active `AuthSession`을 revoke한 뒤 새 `AuthDevice`를 만든다.
20. 선택된 `AuthDevice` 아래에 새 `AuthSession`을 만든다. 같은 `AuthDevice`의 다른 active `AuthSession`은 revoke하지 않는다.
21. `AppTokenIssuer`가 local user id와 session id를 담은 App access token을 발급한다.
22. refresh token은 httpOnly cookie로 발급하고, token hash만 `AuthSession.refreshTokenHash`에 저장한다.
23. User Web/Admin Web shell이 사용할 사용자 요약, 등록 기기 요약, token 정보를 반환한다.

#### Response

- Response 이름: `AuthTokenResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `accessToken` | string | Backend가 발급한 App access token |
| `accessTokenExpiresAt` | string | access token 만료 시각 |
| `refreshToken` | null | MVP 1차에서는 body로 refresh token을 전달하지 않는다. refresh token은 httpOnly cookie로 내려준다. |
| `user` | object | `MeResponse`와 같은 사용자 요약 |
| `device` | object | 현재 등록 기기 요약 |
| `device.id` | string | `AuthDevice` id |
| `device.slot` | enum | `mobile`, `personal_laptop`, `work_laptop` |
| `device.label` | string \| null | 등록 기기 표시명 |

Cookie:

- `Set-Cookie`: `APP_REFRESH_COOKIE_NAME` 값으로 refresh token을 httpOnly cookie에 설정한다.
- 속성: `HttpOnly`, `SameSite=Lax`, `Path=/api/auth/refresh`, `Max-Age=APP_SESSION_TTL_DAYS`
- HTTPS 환경에서는 `Secure=true`를 사용한다.

#### 연결된 DB 스키마

- 생성: User, UserOAuthAccount, UserSetting, AuthDevice, AuthSession
- 조회: UserOAuthAccount, User, UserSetting, AuthDevice, AuthSession
- 수정: User, UserOAuthAccount, AuthDevice, AuthSession
- 삭제: hard delete 없음
- 감사 로그: 없음
- transaction: User/UserOAuthAccount/UserSetting/AuthDevice/AuthSession 생성 또는 갱신은 transaction 필요

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 외부 token 없음 또는 검증 실패 | `Unauthorized` | 401 |
| 외부 user email 없음 | `ExternalUserEmailMissing` | 422 |
| provider 계정이 이미 다른 local User에 연결됨 | `OAuthAccountConflict` | 409 |
| 지원하지 않는 device slot | `InvalidDeviceSlot` | 400 |
| 지원하지 않는 device id | `InvalidDeviceId` | 400 |
| 같은 슬롯에 다른 등록 기기가 이미 있음 | `DeviceSlotAlreadyRegistered` | 409 |
| 비활성 사용자 | `InactiveUser` | 403 |

### 4.4 App Token 갱신 API

- API 이름: App Token 갱신 API
- API 식별자: `RefreshAppToken`
- Method: `POST`
- Path: `/api/auth/refresh`
- 인증: refresh 수단
- 권한: 현재 session 사용자

#### 목적

App access token이 만료되었거나 만료 직전일 때 7일 sliding session 정책에 따라 새 App access token을 발급한다.

#### Request

- Request 이름: `RefreshAppTokenRequest`

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| cookie | refresh token | string | 필수 | `APP_REFRESH_COOKIE_NAME` httpOnly cookie |

추가 header:

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| header | `Origin` | string | 필수 | 허용된 User Web/Admin Web origin만 통과 |

#### 비즈니스 로직 흐름

1. `Origin` header가 `APP_ALLOWED_ORIGINS`에 포함되는지 검증한다.
2. refresh 수단을 검증한다.
3. `AuthSession`을 조회하고 revoked/expired 상태를 확인한다.
4. session이 유효하고 7일 sliding 정책 범위 안이면 만료 시간을 갱신한다.
5. 새 App access token을 발급한다.
6. refresh token을 rotation하고 새 refresh token hash를 `AuthSession.refreshTokenHash`에 저장한다.
7. 새 refresh token은 httpOnly refresh cookie로 다시 설정한다.

#### Response

- Response 이름: `AuthTokenResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `accessToken` | string | 새 App access token |
| `accessTokenExpiresAt` | string | access token 만료 시각 |
| `refreshToken` | null | body로 refresh token을 전달하지 않는다. |
| `user` | object | 사용자 요약 |

Cookie:

- `Set-Cookie`: rotation된 refresh token을 httpOnly cookie로 다시 설정한다.
- 속성은 exchange와 동일하게 `HttpOnly`, `SameSite=Lax`, `Path=/api/auth/refresh`, `Max-Age=APP_SESSION_TTL_DAYS`를 사용한다.

### 4.5 로그아웃 API

- API 이름: 로그아웃 API
- API 식별자: `Logout`
- Method: `POST`
- Path: `/api/auth/logout`
- 인증: User
- 권한: 현재 사용자

#### 목적

현재 App session을 폐기하고 FE가 보유한 App token과 Supabase session을 정리할 수 있게 한다.

#### Request

- Request 이름: `LogoutRequest`

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| header | `Authorization` | string | 필수 | `Bearer <app_access_token>` |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자와 session id를 확인한다.
2. 현재 `AuthSession.revokedAt`을 기록한다.
3. refresh token cookie를 만료시킨다.
4. FE는 이 API 호출 전후로 Supabase Auth `signOut`을 수행할 수 있다.
5. 성공 응답을 반환한다.

#### Response

- Response 이름: `LogoutResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `success` | boolean | 로그아웃 처리 여부 |

### 4.6 내 정보 조회 API

- API 이름: 내 정보 조회 API
- API 식별자: `GetMe`
- Method: `GET`
- Path: `/api/me`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `GetMeRequest`

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| header | `Authorization` | string | 필수 | `Bearer <app_access_token>` |

#### 비즈니스 로직 흐름

1. AuthGuard가 App access token을 검증한다.
2. token의 local user id와 session id를 검증한다.
3. `User`와 `UserSetting`을 조회한다.
4. User Web app shell에서 필요한 사용자 요약과 설정을 반환한다.

#### Response

- Response 이름: `MeResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | local 사용자 ID |
| `supabaseUserId` | string | Supabase Auth 사용자 ID. provider 교체 후에는 null 가능 |
| `name` | string | 사용자명 |
| `email` | string | 이메일 |
| `role` | enum | 사용자 역할 |
| `status` | enum | 사용자 상태 |
| `settings` | object | 사용자 기본 설정 |
| `settings.sensitiveWarningEnabled` | boolean | 민감정보 저장 경고 사용 여부 |

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| session 만료 또는 폐기 | `Unauthorized` | 401 |
| 비활성 사용자 | `InactiveUser` | 403 |

### 4.7 회원 탈퇴 API

- API 이름: 회원 탈퇴 API
- API 식별자: `DeleteMyAccount`
- Method: `DELETE`
- Path: `/api/users/me`
- 인증: User
- 권한: 현재 사용자

#### 목적

사용자가 본인 계정을 탈퇴한다. 탈퇴는 즉시 hard delete가 아니라 `User` soft delete이며, 30일 보관 후 시스템 자동 작업이 완전 삭제한다.

#### Request

- Request 이름: `DeleteMyAccountRequest`

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| header | `Authorization` | string | 필수 | `Bearer <app_access_token>` |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자와 session id를 확인한다.
2. 이미 삭제된 사용자이면 `DeletedResource` 409를 반환한다.
3. 현재 시각을 `deletedAt`으로 기록하고, `permanentDeleteAt = deletedAt + 30일`로 계산한다.
4. 같은 transaction에서 `User.status = DELETED`, `User.deletedAt`, `User.permanentDeleteAt`을 갱신한다.
5. 해당 사용자의 active `AuthSession`을 revoke한다.
6. refresh token cookie를 만료시킨다.
7. 이후 token exchange, refresh, 일반 business API는 삭제 계정을 `InactiveUser`로 차단한다.
8. FE는 이 API 호출 후 Supabase Auth `signOut`을 수행할 수 있다.

#### Response

- Response 이름: `DeleteMyAccountResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 삭제 처리된 local 사용자 ID |
| `status` | enum | `DELETED` |
| `deletedAt` | string | soft delete 시각 |
| `permanentDeleteAt` | string | 시스템 자동 완전 삭제 예정 시각 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: User, AuthSession
- 수정: User.status, User.deletedAt, User.permanentDeleteAt, AuthSession.revokedAt
- 삭제: hard delete 없음
- 감사 로그: 없음
- transaction: User soft delete와 active AuthSession revoke는 transaction 필요

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| session 만료 또는 폐기 | `Unauthorized` | 401 |
| 이미 삭제된 사용자 | `DeletedResource` | 409 |

### 4.8 내 설정 조회 API

- API 이름: 내 설정 조회 API
- API 식별자: `GetMySettings`
- Method: `GET`
- Path: `/api/users/me/settings`
- 인증: User
- 권한: 현재 사용자

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 현재 사용자의 `UserSetting`을 조회한다.
3. 설정이 없으면 기본 설정을 생성하거나 기본값을 응답한다.

#### Response

- Response 이름: `UserSettingResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `sensitiveWarningEnabled` | boolean | 민감정보 저장 경고 |
| `defaultReminderMinutes` | number | 기본 알림 시간 |
| `emailNotificationEnabled` | boolean | 이메일 알림 사용 여부 |
| `browserPushEnabled` | boolean | 브라우저 푸시 사용 여부 |

### 4.9 내 설정 수정 API

- API 이름: 내 설정 수정 API
- API 식별자: `UpdateMySettings`
- Method: `PATCH`
- Path: `/api/users/me/settings`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `UpdateMySettingsRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `sensitiveWarningEnabled` | boolean | 선택 | 민감정보 저장 경고 |
| `defaultReminderMinutes` | number | 선택 | 기본 알림 시간 |
| `emailNotificationEnabled` | boolean | 선택 | 이메일 알림 |
| `browserPushEnabled` | boolean | 선택 | 브라우저 푸시 |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. 현재 사용자 `UserSetting`을 upsert한다.
4. 수정된 설정을 반환한다.

#### Response

- Response 이름: `UserSettingResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `sensitiveWarningEnabled` | boolean | 민감정보 저장 경고 |
| `defaultReminderMinutes` | number | 기본 알림 시간 |
| `emailNotificationEnabled` | boolean | 이메일 알림 |
| `browserPushEnabled` | boolean | 브라우저 푸시 |

### 4.10 Admin 내 정보 조회 API

- API 이름: Admin 내 정보 조회 API
- API 식별자: `GetAdminMe`
- Method: `GET`
- Path: `/admin/api/me`
- 인증: Admin
- 권한: `role = ADMIN`

#### Request

- Request 이름: `GetAdminMeRequest`

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| header | `Authorization` | string | 필수 | `Bearer <app_access_token>` |

#### 비즈니스 로직 흐름

1. AuthGuard가 App access token을 검증한다.
2. token의 local user id와 session id를 검증한다.
3. AdminGuard로 `role = ADMIN`인지 확인한다.
4. Admin shell에서 필요한 사용자 정보를 반환한다.

#### Response

- Response 이름: `AdminMeResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | Admin 사용자 ID |
| `supabaseUserId` | string | Supabase Auth 사용자 ID. provider 교체 후에는 null 가능 |
| `name` | string | 이름 |
| `email` | string | 이메일 |
| `role` | enum | `ADMIN` |

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| session 만료 또는 폐기 | `Unauthorized` | 401 |
| Admin 아님 | `Forbidden` | 403 |

## 5. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P0-G00-G04-FOUNDATION.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P1-G05-G11-CORE-DATA.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
