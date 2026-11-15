# Auth/User DB Schema

## 1. 기준

이 문서는 현재 Backend의 Auth/User 데이터베이스 구조를 설명한다.

구현 기준 파일:

- `BE/prisma/schema.prisma`

현재 Auth/User 도메인은 Prisma schema와 migration에 반영되어 있다. 이 문서는 Auth/User 테이블의 역할, 관계, 컬럼 의미를 빠르게 확인하기 위한 구현 설명서로 유지한다.

현재 User locale/region 메타데이터는 `BE/prisma/migrations/20260708010000_add_user_locale_region_metadata/migration.sql` 기준으로 반영되어 있다.
사용자 기본 국가/통화 설정은 `BE/prisma/migrations/20260728010000_add_user_global_settings/migration.sql` 기준으로 반영되어 있다.

08 Global Data I18N 반영 상태:

- G08에서 `OAuthProvider.LINE`을 추가했고 Google, LINE, Apple을 runtime provider로 허용한다.
- 기존 `provider + providerUserId` 조회를 유지하되, 같은 verified email이 있으면 기존 `User`에 새 `UserOAuthAccount`를 연결한다.
- provider email이 없거나 verified email로 확인할 수 없는 경우 가입/로그인을 차단한다.

## 2. 전체 관계

```text
User 1 ─ N UserOAuthAccount
User 1 ─ N AuthDevice
User 1 ─ N AuthSession
AuthDevice 1 ─ N AuthSession
```

관계 요약:

- `User`는 서비스 내부 사용자 기준 테이블이다.
- `UserOAuthAccount`는 Supabase Auth provider 계정과 내부 사용자를 연결한다.
- `AuthDevice`는 로그인 과정에서 자동 등록되는 사용자 기기다.
- `AuthSession`은 Backend refresh session과 현재 인증 상태를 관리한다.

## 3. 현재 제외한 구조

현재 DB 구조에는 아래 항목을 의도적으로 넣지 않는다.

- `UserSetting`: 사용처가 없어 제거했다.
- `User` 영구 삭제 예정 시각 컬럼: 현재 두지 않는다.
- 계정 삭제 API: 현재 만들지 않는다.
- 등록 기기 수정/해제 API용 컬럼: 현재 조회만 제공한다.

참고:

- Workspace/Team/Actor와 범용 CRM 테이블은 현재 존재한다. folk 전환은 [FOLK_SCHEMA_PLAN](FOLK_SCHEMA_PLAN.md)을 따르며 인증 기반을 임의 제거하지 않는다.
- 고정형 고객사/담당자/상품/딜 모델은 현재 `BE/prisma/schema.prisma`에 없다. 제거 기록은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md`를 따른다.

## 4. Enum

### PlatformRole

| 값 | 주석 |
|---|---|
| `USER` | 일반 사용자 |
| `ADMIN` | 관리자. Admin Web 접근은 이 역할과 `AdminGuard`를 통과해야 한다. |

### UserStatus

| 값 | 주석 |
|---|---|
| `ACTIVE` | 정상 사용 가능 |
| `SUSPENDED` | 정지 상태. 인증은 차단된다. |
| `DELETED` | 소프트 삭제 상태. 현재는 영구 삭제 예약 없이 상태만 보관한다. |

### OAuthProvider

| 값 | 주석 |
|---|---|
| `KAKAO` | Legacy value. 현재 로그인 기능에서는 사용하지 않는다. |
| `GOOGLE` | 현재 활성 로그인 provider |
| `APPLE` | 현재 활성 로그인 provider |
| `LINE` | 현재 활성 로그인 provider |

참고: `LINE`은 `20260728050000_add_line_oauth_provider` migration으로 추가됐다.

### AuthSessionStatus

| 값 | 주석 |
|---|---|
| `ACTIVE` | 사용 가능한 session |
| `REVOKED` | 로그아웃, 기기 교체 등으로 폐기된 session |
| `EXPIRED` | 만료된 session. 현재 만료 판단은 `expiresAt`도 함께 본다. |

### AuthDeviceStatus

| 값 | 주석 |
|---|---|
| `ACTIVE` | 현재 등록된 활성 기기 |
| `REPLACED` | 같은 slot의 다른 기기로 교체된 기기 |
| `REVOKED` | 사용자가 해제하거나 정책상 폐기한 기기. 현재 해제 API는 없다. |

### AuthDeviceSlot

| 값 | 주석 |
|---|---|
| `MOBILE` | 모바일 기기 slot |
| `PERSONAL_LAPTOP` | 개인 노트북 slot |
| `WORK_LAPTOP` | 업무용 노트북 slot |

현재 User Web은 화면 폭 기준으로 `MOBILE`과 `PERSONAL_LAPTOP`만 사용한다. `WORK_LAPTOP`은 Backend enum에는 있지만 현재 User Web payload에서는 보내지 않는다.

## 5. Table: User

서비스 내부 사용자 기준 테이블이다. 외부 provider 계정과 별개로 권한, 상태, 로그인 시각을 관리한다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `dbgenerated("gen_random_uuid()")` | 내부 사용자 PK |
| `email` | `String` | 예 | 없음 | provider에서 받은 이메일. 로그인 시 동기화된다. |
| `displayName` | `String` | 예 | 없음 | 서비스에서 보여줄 이름. 기존 사용자 로그인 시 provider 이름으로 덮어쓰지 않는다. |
| `platformRole` | `PlatformRole` | 아니오 | `USER` | 플랫폼 권한 |
| `status` | `UserStatus` | 아니오 | `ACTIVE` | 사용자 상태 |
| `timeZone` | `String` | 아니오 | `Asia/Seoul` | 사용자 기본 IANA timezone |
| `jobSelectOnboardingCompletedAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 기존 직업 선택 온보딩 완료 시각; 직업 값/Kit은 저장하지 않음 |
| `preferredLocale` | `String` | 아니오 | `ko-KR` | 사용자 기본 UI/content locale. |
| `countryCode` | `String` | 아니오 | `KR` | 사용자 기본 국가 코드. 설정 화면과 글로벌 데이터 기본값 계산에 사용한다. 현재 구현은 `KR/US` 중심이다. 추가 국가와 출시 시장은 folk 전환에서 별도로 정한다. |
| `defaultCurrencyCode` | `String` | 아니오 | `KRW` | 사용자 기본 통화 코드. 현재 구현은 `KRW/USD` 중심이다. 추가 통화 지원은 별도 구현 범위다. |
| `signupLocale` | `String` | 예 | 없음 | 최초 가입/token exchange 시점의 locale. |
| `signupCountryCode` | `String` | 예 | 없음 | 최초 가입/token exchange 시점의 국가 코드. |
| `signupTimeZone` | `String` | 예 | 없음 | 최초 가입/token exchange 시점의 timezone. |
| `lastLoginLocale` | `String` | 예 | 없음 | 마지막 로그인/token exchange 시점의 locale. |
| `lastLoginCountryCode` | `String` | 예 | 없음 | 마지막 로그인/token exchange 시점의 국가 코드. |
| `lastLoginTimeZone` | `String` | 예 | 없음 | 마지막 로그인/token exchange 시점의 timezone. |
| `lastLoginAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 마지막 token exchange 성공 시각 |
| `createdAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `now()` | 생성 시각 |
| `updatedAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `@updatedAt` | 수정 시각 |
| `deletedAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 소프트 삭제 시각. 현재 계정 삭제 API는 없다. |

Relations:

- `oauthAccounts`: `UserOAuthAccount[]`
- `authDevices`: `AuthDevice[]`
- `authSessions`: `AuthSession[]`
- `workspaceMembers`: `WorkspaceMember[]`
- `errorReports`: `ErrorReport[]`
- `supportRequests`: `SupportRequest[]`

Indexes:

- `platformRole`: Admin/User 조회 기준
- `status`: 활성/비활성 사용자 필터 기준
- `createdAt`: 가입일 정렬/조회 기준

로그인 메타데이터 정책:

- 신규 사용자 생성 시 `timeZone`, `preferredLocale`, `countryCode`, `defaultCurrencyCode`, `signupLocale`, `signupCountryCode`, `signupTimeZone`, `lastLoginLocale`, `lastLoginCountryCode`, `lastLoginTimeZone`을 exchange metadata와 fallback으로 초기화한다.
- 기존 사용자 로그인 시 `email`, `lastLoginLocale`, `lastLoginCountryCode`, `lastLoginTimeZone`, `lastLoginAt`을 갱신한다.
- 기존 사용자의 `timeZone`은 로그인 시 브라우저 timezone으로 덮어쓰지 않는다. 사용자가 설정한 기본 timezone을 보존하고, 최근 로그인 환경은 `lastLoginTimeZone`에만 남긴다.
- 기존 사용자의 `countryCode`, `defaultCurrencyCode`도 로그인 환경으로 덮어쓰지 않는다.
- 국가 코드는 provider 계정 정보가 아니라 Backend가 받은 proxy geo header에서 가져온다. 헤더가 없으면 `signupCountryCode`/`lastLoginCountryCode`는 `null`일 수 있다.

## 6. Table: UserOAuthAccount

외부 인증 provider 계정과 내부 `User`를 연결한다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | OAuth 연결 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 내부 `User.id` FK |
| `provider` | `OAuthProvider` | 아니오 | 없음 | 외부 인증 provider |
| `providerUserId` | `String` | 아니오 | 없음 | provider 계정 ID. JWT의 `user_metadata.provider_id`, `user_metadata.sub`, 최상위 `sub` 순서로 선택한다. |
| `providerEmail` | `String` | 예 | 없음 | provider에서 받은 이메일 |
| `accessTokenHash` | `String` | 예 | 없음 | 외부 provider access token hash. 현재는 저장하지 않을 수 있다. |
| `refreshTokenHash` | `String` | 예 | 없음 | 외부 provider refresh token hash. 현재는 저장하지 않을 수 있다. |
| `tokenExpiresAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 외부 provider token 만료 시각 |
| `createdAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `now()` | 연결 생성 시각 |
| `updatedAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `@updatedAt` | 연결 수정 시각 |

Constraints:

- `@@unique([provider, providerUserId])`

주석:

- 같은 외부 계정은 내부 사용자 하나에만 연결된다.
- 자동 회원가입/로그인 판단은 `provider + providerUserId`를 먼저 사용한다.
- 과거 Supabase 사용자 ID(`sub`)로 저장된 연결은 로그인 시 확인되면 provider 계정 ID로 갱신한다.
- 기존 provider 계정이 없고 같은 verified email의 기존 `User`가 있으면 새 `User`를 만들지 않고 이 테이블에 provider 계정을 추가한다.

Indexes:

- `userId`: 사용자별 연결 provider 목록 조회 기준

## 7. Table: AuthDevice

사용자가 로그인할 때 자동 등록되는 기기 테이블이다. 사용자가 직접 등록 버튼을 누르지 않는다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 기기 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 내부 `User.id` FK |
| `deviceSlot` | `AuthDeviceSlot` | 아니오 | 없음 | 모바일/개인 노트북/업무용 노트북 slot |
| `deviceIdHash` | `String` | 아니오 | 없음 | FE stable device id를 hash한 값. 원문은 저장하지 않는다. |
| `label` | `String` | 예 | 없음 | 사용자가 볼 기기 이름. 로그인 exchange 때 갱신될 수 있다. |
| `status` | `AuthDeviceStatus` | 아니오 | `ACTIVE` | 기기 상태 |
| `lastSeenAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 마지막 로그인 또는 같은 기기 재로그인 시각 |
| `replacedAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 같은 slot의 새 기기로 교체된 시각 |
| `revokedAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 기기가 폐기된 시각 |
| `createdAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `now()` | 등록 시각 |
| `updatedAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `@updatedAt` | 수정 시각 |

Relations:

- `user`: `User`
- `sessions`: `AuthSession[]`

Indexes:

- `userId`: 사용자별 기기 조회
- `userId + deviceSlot + status`: slot별 활성 기기 확인
- `userId + deviceIdHash`: 같은 기기 재로그인 확인

로그인 시 동작:

- 같은 user와 slot에 활성 기기가 없으면 새 `AuthDevice`를 만든다.
- 같은 user, slot, device hash면 `label`, `lastSeenAt`을 갱신한다.
- 같은 user와 slot에 다른 활성 기기가 있으면 `DeviceSlotAlreadyRegistered`가 발생한다.
- `replaceExistingDevice=true`면 기존 기기를 `REPLACED` 처리하고 기존 기기의 활성 session을 revoke한 뒤 새 기기를 만든다.

현재 User Web은 exchange 때 `replaceExistingDevice=true`를 보낸다. 따라서 같은 slot의 다른 브라우저/기기 로그인은 사용자에게 충돌 오류를 보여주기보다 기존 slot 기기와 session을 교체한다.

## 8. Table: AuthSession

Backend refresh session과 access token 검증의 DB 기준이다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | session PK. App access token payload의 `sessionId`와 연결된다. |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 내부 `User.id` FK |
| `authDeviceId` | `String @db.Uuid` | 아니오 | 없음 | 로그인한 `AuthDevice.id` FK |
| `status` | `AuthSessionStatus` | 아니오 | `ACTIVE` | session 상태 |
| `refreshTokenHash` | `String` | 예 | 없음 | Backend refresh token hash. 원문은 저장하지 않는다. |
| `userAgent` | `String` | 예 | 없음 | 로그인 요청의 User-Agent |
| `ipAddressHash` | `String` | 예 | 없음 | 로그인 요청 IP의 hash |
| `lastUsedAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 마지막 refresh/session 사용 시각 |
| `expiresAt` | `DateTime @db.Timestamptz(3)` | 아니오 | 없음 | refresh session 만료 시각 |
| `revokedAt` | `DateTime @db.Timestamptz(3)` | 예 | 없음 | 로그아웃/기기 교체 등으로 폐기된 시각 |
| `createdAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `now()` | session 생성 시각 |
| `updatedAt` | `DateTime @db.Timestamptz(3)` | 아니오 | `@updatedAt` | session 수정 시각 |

Relations:

- `user`: `User`
- `authDevice`: `AuthDevice`

Indexes:

- `userId`: 사용자별 session 조회
- `authDeviceId`: 기기별 session 조회
- `status`: 활성/폐기 session 필터
- `expiresAt`: 만료 session 정리/조회 기준

인증 시 동작:

- App access token은 `userId`, `sessionId`를 담는다.
- AuthGuard는 JWT만 믿지 않고 `AuthSession`을 조회한다.
- session이 `ACTIVE`가 아니거나 `revokedAt`이 있거나 `expiresAt`이 지났으면 인증 실패다.
- refresh 성공 시 refresh token은 rotation되고 `refreshTokenHash`, `expiresAt`, `lastUsedAt`이 갱신된다.
- 같은 active device에서 다시 로그인하면 기존 active session row를 재사용하고 refresh token만 rotation한다.
- 로그아웃은 현재 session만 `REVOKED` 처리한다. 같은 사용자의 다른 slot session은 유지된다.

## 9. Prisma 정본

모델 정의를 문서에 중복 복사하지 않는다. 실제 컬럼·타입·관계·기본값은 [schema.prisma](../../../BE/prisma/schema.prisma)를 따른다.

2026-11-15 대조: OAuthProvider에는 KAKAO/GOOGLE/APPLE/LINE이 있고 런타임 로그인 제공자는 Google/LINE/Apple이다. User의 timeZone, jobSelectOnboardingCompletedAt 및 WorkspaceMember·지원 접수 관계가 존재한다. 앞의 표는 인증 설명이며 전체 CRM schema 목록이 아니다.

## 10. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/ERROR_REPORT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/SUPPORT_REQUEST_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PUBLIC_CONTACT_REQUEST_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
