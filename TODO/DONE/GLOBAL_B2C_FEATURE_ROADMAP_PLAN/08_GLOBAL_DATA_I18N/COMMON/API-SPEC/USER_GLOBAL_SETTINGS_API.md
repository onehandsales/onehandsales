# User Global Settings API

상태: Implemented

## 1. 목적

사용자의 앱 언어, timezone, 국가, 기본 통화를 조회/수정한다.

## 2. 계약 개요

- 계약 상태: confirmed
- 소비자: User Web
- 호환성: 기존 profile API response 확장. 기존 필드는 유지하고 신규 필드는 fallback 기본값을 제공한다.
- 인증: User AuthGuard
- 권한: 현재 로그인 사용자 본인만 조회/수정

## 3. GET /api/users/me/profile

- API 이름: 내 글로벌 설정 조회 API
- API 식별자: GetMyProfileWithGlobalSettings
- Method: GET
- Path: `/api/users/me/profile`
- Request 이름: 없음
- Response 이름: `UserProfileResponse`
- Status: `200`

응답 후보:

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User",
  "preferredLocale": "en",
  "timeZone": "America/New_York",
  "countryCode": "US",
  "defaultCurrencyCode": "USD",
  "oauthAccounts": [
    {
      "provider": "google",
      "providerEmail": "user@example.com"
    }
  ]
}
```

Business Logic / 비즈니스 로직 흐름:

1. AuthGuard로 현재 사용자를 확인한다.
2. `userId` 기준으로 User와 OAuth 연결 목록을 조회한다.
3. `countryCode`, `defaultCurrencyCode`가 비어 있는 기존 사용자는 response mapper에서 `KR`, `KRW` fallback을 제공한다.
4. UTC instant 필드는 ISO string으로 반환한다.
5. response를 `UserProfileResponse`로 변환한다.

연결된 DB 스키마:

- 조회: User, UserOAuthAccount
- 생성: 없음
- 수정: 없음
- transaction: 없음

Transaction:

- 필요 여부: 없음
- 이유: 본인 profile 조회만 수행한다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

Observability:

- log event key: `user.profileGlobalSettings.viewed`는 기본적으로 남기지 않는다. 실패는 exception filter 기준으로 기록한다.
- audit log: 없음
- request id: 사용
- redaction: email은 일반 profile 응답에는 포함 가능하지만 log context에는 원문 저장 금지
- provider error context: 없음

## 4. PATCH /api/users/me/profile

- API 이름: 내 글로벌 설정 수정 API
- API 식별자: UpdateMyGlobalSettings
- Method: PATCH
- Path: `/api/users/me/profile`
- Request 이름: `UpdateMyProfileDto`
- Response 이름: `UserProfileResponse`
- Status: `200`

요청 후보:

```json
{
  "preferredLocale": "ko-KR",
  "timeZone": "Asia/Seoul",
  "countryCode": "KR",
  "defaultCurrencyCode": "KRW"
}
```

응답 후보는 기존 profile response 계약을 유지하고 아래 설정값을 포함한다.

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User",
  "preferredLocale": "ko-KR",
  "timeZone": "Asia/Seoul",
  "countryCode": "KR",
  "defaultCurrencyCode": "KRW",
  "oauthAccounts": []
}
```

Business Logic / 비즈니스 로직 흐름:

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. `preferredLocale`, `countryCode`, `defaultCurrencyCode`, `timeZone` 허용값을 검증한다.
4. 현재 사용자 `User` row만 수정한다.
5. 수정된 설정값을 response DTO로 반환한다.
6. FE는 response를 기준으로 app i18n/format state와 profile query cache를 갱신한다.

연결된 DB 스키마:

- 조회: User
- 수정: User
- 생성: 없음
- transaction: 없음

Transaction:

- 필요 여부: 없음
- 이유: 단일 User row update이며 부수 row 생성이 없다.
- rollback 범위: User update 단일 statement
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

Observability:

- log event key: `user.globalSettings.updated`
- audit log: 없음
- request id: 사용
- redaction: email, token, phone 원문 logging 금지
- provider error context: 없음

## 5. Validation

허용값:

- `preferredLocale`: `ko-KR`, `en`
- `countryCode`: `KR`, `US`
- `defaultCurrencyCode`: `KRW`, `USD`
- `timeZone`: 유효한 IANA timezone ID

에러 후보:

```json
{
  "code": "USER_LOCALE_UNSUPPORTED",
  "field": "preferredLocale"
}
```

```json
{
  "code": "USER_TIMEZONE_INVALID",
  "field": "timeZone"
}
```

## 6. FE/BE 처리 기준

- FE: 저장 성공 후 profile query를 갱신하고 app i18n state를 즉시 바꾼다.
- FE: validation error code를 locale별 문구로 변환한다.
- BE: DTO validation과 application use case validation을 구분한다.
- BE: 기존 사용자의 `timeZone`은 login exchange만으로 덮어쓰지 않는다.

## 7. 구현 체크리스트

- [x] 기존 profile response와 FE type이 충돌하지 않는다.
- [x] 기존 사용자는 `countryCode=KR`, `defaultCurrencyCode=KRW` fallback을 가진다.
- [x] 로그인 시 기존 사용자 `timeZone`이 자동 overwrite되지 않는다.
- [x] 설정 저장 후 FE가 app i18n state를 즉시 갱신할 수 있다.
- [x] Transaction 계약과 Observability 계약이 구현 결과와 일치한다.
- [x] Backend 신규/수정 코드에 한글 주석 규칙이 적용된다.
