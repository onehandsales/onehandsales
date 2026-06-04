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

G00에서 Supabase 사용 범위는 `Auth`만 사용하는 것으로 확정했다.

인증 처리 기준:

- 소셜 로그인 provider 연동, OAuth 인증 화면, Supabase session 발급은 Supabase Auth가 담당한다.
- Supabase Auth 개발 환경은 개발용 `Remote Supabase project`를 사용한다.
- Backend는 Supabase Auth provider redirect를 시작하는 API와 Supabase Auth callback을 처리하는 API를 구현한다.
- Backend는 callback 처리 시 Supabase session/user 정보를 확인하고 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthSession`을 동기화한다.
- Backend는 FE에 Supabase access token을 노출하지 않고 httpOnly session cookie를 발급한다.
- Backend `AuthGuard`는 httpOnly session cookie와 local `AuthSession`을 검증하고 현재 사용자 context를 만든다.
- business data DB는 Supabase DB가 아니라 Docker PostgreSQL과 Prisma가 관리한다.
- Admin API는 session cookie 검증 후 local `User.role = ADMIN`을 확인한다.
- mutating API는 CSRF token 또는 Origin 검증을 요구한다.

환경 변수 기준:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_JWKS_URL`
- `SUPABASE_JWT_ISSUER`
- `AUTH_SESSION_COOKIE_NAME`
- `AUTH_SESSION_SECRET`
- `CSRF_COOKIE_NAME`
- `CSRF_SECRET`

## 3. API 목록

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| Health Check API | `GetHealth` | `GET` | `/api/health` | `HealthCheckRequest` | `HealthCheckResponse` | 없음 |
| 소셜 로그인 Provider 목록 API | `ListAuthProviders` | `GET` | `/api/auth/providers` | `ListAuthProvidersRequest` | `AuthProviderListResponse` | 없음 |
| Supabase OAuth 시작 API | `StartSupabaseOAuthLogin` | `GET` | `/api/auth/:provider/start` | `StartSupabaseOAuthLoginRequest` | redirect | 없음 |
| Supabase OAuth Callback API | `HandleSupabaseOAuthCallback` | `GET` | `/api/auth/callback` | `SupabaseOAuthCallbackRequest` | redirect | User, UserOAuthAccount, UserSetting, AuthSession |
| CSRF Token API | `GetCsrfToken` | `GET` | `/api/auth/csrf` | `GetCsrfTokenRequest` | `CsrfTokenResponse` | AuthSession |
| 로그아웃 API | `Logout` | `POST` | `/api/auth/logout` | `LogoutRequest` | `LogoutResponse` | AuthSession |
| 내 정보 조회 API | `GetMe` | `GET` | `/api/me` | `GetMeRequest` | `MeResponse` | User, UserSetting |
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

#### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 서버 내부 오류 | `InternalServerError` | 500 |

### 4.2 소셜 로그인 Provider 목록 API

- API 이름: 소셜 로그인 Provider 목록 API
- API 식별자: `ListAuthProviders`
- Method: `GET`
- Path: `/api/auth/providers`
- 인증: 없음
- 권한: 없음

#### 목적

User Web 로그인 화면이 MVP에서 제공하는 소셜 로그인 버튼을 동일한 기준으로 렌더링한다.

#### Request

- Request 이름: `ListAuthProvidersRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. 서버 또는 FE 배포 설정에서 Supabase Auth provider 활성화 상태를 읽는다.
2. MVP 기본 provider인 Kakao, Google, Naver, Apple을 반환한다.
3. provider가 Supabase Auth project에서 비활성화되었거나 환경 변수가 미설정된 경우 `enabled = false`로 내려준다.

#### Response

- Response 이름: `AuthProviderListResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `providers` | array | 로그인 provider 목록 |
| `providers[].provider` | enum | `KAKAO`, `GOOGLE`, `NAVER`, `APPLE` |
| `providers[].label` | string | 화면 표시명 |
| `providers[].enabled` | boolean | 현재 환경에서 사용 가능 여부 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| provider 설정 로딩 실패 | `AuthProviderConfigError` | 500 |

### 4.3 Supabase OAuth 시작 API

- API 이름: Supabase OAuth 시작 API
- API 식별자: `StartSupabaseOAuthLogin`
- Method: `GET`
- Path: `/api/auth/:provider/start`
- 인증: 없음
- 권한: 없음

#### 목적

User Web 또는 Admin Web의 로그인 버튼을 Supabase Cloud Auth provider 인증 화면으로 redirect한다.

#### Request

- Request 이름: `StartSupabaseOAuthLoginRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `provider` | enum path | 필수 | `kakao`, `google`, `naver`, `apple` |
| `returnTo` | string query | 선택 | 로그인 성공 후 FE에서 이동할 내부 경로. 외부 URL은 허용하지 않는다. |

#### 비즈니스 로직 흐름

1. provider path 값을 validation한다.
2. provider가 Supabase Auth project에서 활성화되어 있는지 확인한다.
3. `returnTo`가 내부 경로인지 검증한다.
4. CSRF/state 값을 생성하고 짧은 수명의 state cookie를 설정한다.
5. Supabase Auth provider 인증 URL을 생성한다.
6. 사용자를 Supabase Auth provider 인증 URL로 redirect한다.

#### Response

- Response 이름: redirect

| 필드 | 타입 | 설명 |
|---|---|---|
| redirect | HTTP redirect | Supabase Auth provider 인증 URL로 이동 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 지원하지 않는 provider | `UnsupportedOAuthProvider` | 400 |
| provider 설정 누락 | `OAuthProviderDisabled` | 503 |
| 허용되지 않은 returnTo | `InvalidAuthReturnTo` | 400 |

### 4.4 Supabase OAuth Callback API

- API 이름: Supabase OAuth Callback API
- API 식별자: `HandleSupabaseOAuthCallback`
- Method: `GET`
- Path: `/api/auth/callback`
- 인증: 없음
- 권한: 없음

#### 목적

Supabase Auth callback을 Backend가 처리하고, local user와 server session을 만든 뒤 FE로 redirect한다.

#### Request

- Request 이름: `SupabaseOAuthCallbackRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `code` | string query | 필수 | Supabase Auth authorization code |
| `state` | string query | 필수 | start API에서 생성한 CSRF/state 값 |

#### 비즈니스 로직 흐름

1. state query와 state cookie를 검증한다.
2. Supabase Auth adapter로 `code`를 session/user 정보로 교환한다.
3. Supabase user id, email, provider 정보를 읽는다.
4. `UserOAuthAccount`에서 provider 계정을 조회한다.
5. 기존 local user가 없으면 `User`, `UserOAuthAccount`, `UserSetting`을 생성한다.
6. 기존 local user가 있으면 이메일, 이름, 마지막 로그인 시각, provider mapping을 갱신한다.
7. 비활성 local user이면 session을 만들지 않고 로그인 실패 경로로 redirect한다.
8. `AuthSession`을 생성하고 session token hash를 저장한다.
9. session token 원문은 httpOnly cookie로 내려준다.
10. FE의 허용된 return path로 redirect한다.

#### Response

- Response 이름: redirect

| 필드 | 타입 | 설명 |
|---|---|---|
| redirect | HTTP redirect | 로그인 성공 후 User Web 또는 Admin Web 경로로 이동 |

#### 연결된 DB 스키마

- 생성: User, UserOAuthAccount, UserSetting, AuthSession
- 조회: UserOAuthAccount, User
- 수정: User, UserOAuthAccount
- 삭제: 없음
- 감사 로그: 없음
- transaction: User/UserOAuthAccount/UserSetting/AuthSession 생성 또는 갱신은 transaction 필요

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| state 불일치 | `InvalidOAuthState` | 400 |
| Supabase code 교환 실패 | `SupabaseAuthExchangeFailed` | 401 |
| 비활성 사용자 | `InactiveUser` | 403 |

### 4.5 로그아웃 API

- API 이름: 로그아웃 API
- API 식별자: `Logout`
- Method: `POST`
- Path: `/api/auth/logout`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `LogoutRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | Supabase session 해제는 FE Supabase Auth signOut이 처리한다. |

#### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. Backend는 local refresh token이나 session을 직접 저장하지 않는 것을 기본 전제로 한다.
3. 현재 사용자의 마지막 logout 시각 또는 provider account 상태 갱신이 필요하면 `UserOAuthAccount`에 기록한다.
4. 성공 응답을 반환한다.

#### Response

- Response 이름: `LogoutResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `success` | boolean | 로그아웃 처리 여부 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: UserOAuthAccount
- 수정: UserOAuthAccount. 마지막 logout 시각을 기록하는 경우
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |

### 4.6 내 정보 조회 API

- API 이름: 내 정보 조회 API
- API 식별자: `GetMe`
- Method: `GET`
- Path: `/api/me`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `GetMeRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. AuthGuard가 Supabase access token을 검증한다.
2. token의 `supabaseUserId`와 연결된 local `User`를 조회한다.
3. local user가 없으면 `POST /api/auth/sync`를 먼저 호출해야 하므로 `UserSyncRequired`를 반환한다.
4. `User`와 `UserSetting`을 조회한다.
5. User Web app shell에서 필요한 사용자 요약과 설정을 반환한다.

#### Response

- Response 이름: `MeResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 사용자 ID |
| `supabaseUserId` | string | Supabase Auth 사용자 ID |
| `name` | string | 사용자명 |
| `email` | string | 이메일 |
| `role` | enum | 사용자 역할 |
| `status` | enum | 사용자 상태 |
| `settings` | object | 사용자 기본 설정 |
| `settings.sensitiveWarningEnabled` | boolean | 민감정보 저장 경고 사용 여부 |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: User, UserSetting
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| local user 동기화 전 | `UserSyncRequired` | 409 |
| 비활성 사용자 | `InactiveUser` | 403 |

### 4.7 내 설정 조회 API

- API 이름: 내 설정 조회 API
- API 식별자: `GetMySettings`
- Method: `GET`
- Path: `/api/users/me/settings`
- 인증: User
- 권한: 현재 사용자

#### Request

- Request 이름: `GetMySettingsRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

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

#### 연결된 DB 스키마

- 생성: UserSetting. 없을 때 기본값 생성 가능
- 조회: UserSetting
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 기본값 생성 시 upsert

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |

### 4.8 내 설정 수정 API

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

#### 연결된 DB 스키마

- 생성: UserSetting
- 조회: UserSetting
- 수정: UserSetting
- 삭제: 없음
- 감사 로그: 없음
- transaction: upsert 단위

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| 알림 시간이 음수 | `ValidationError` | 400 |

### 4.9 Admin 내 정보 조회 API

- API 이름: Admin 내 정보 조회 API
- API 식별자: `GetAdminMe`
- Method: `GET`
- Path: `/admin/api/me`
- 인증: Admin
- 권한: `role = ADMIN`

#### Request

- Request 이름: `GetAdminMeRequest`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| 없음 | - | - | query/body 없음 |

#### 비즈니스 로직 흐름

1. AuthGuard가 Supabase access token을 검증한다.
2. token의 `supabaseUserId`와 연결된 local `User`를 조회한다.
3. local user가 없으면 `POST /api/auth/sync`를 먼저 호출해야 하므로 `UserSyncRequired`를 반환한다.
4. AdminGuard로 `role = ADMIN`인지 확인한다.
5. Admin shell에서 필요한 사용자 정보를 반환한다.

#### Response

- Response 이름: `AdminMeResponse`

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | Admin 사용자 ID |
| `supabaseUserId` | string | Supabase Auth 사용자 ID |
| `name` | string | 이름 |
| `email` | string | 이메일 |
| `role` | enum | `ADMIN` |

#### 연결된 DB 스키마

- 생성: 없음
- 조회: User
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

#### 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| local user 동기화 전 | `UserSyncRequired` | 409 |
| Admin 아님 | `Forbidden` | 403 |

## 5. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P0-G00-G04-FOUNDATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P1-G05-G11-CORE-DATA.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
