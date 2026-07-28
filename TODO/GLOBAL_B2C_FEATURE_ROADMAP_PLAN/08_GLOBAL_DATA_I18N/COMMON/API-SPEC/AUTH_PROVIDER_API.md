# Auth Provider API

상태: Done

## 1. 목적

Google, LINE, Apple OAuth provider를 로그인/회원가입에서 사용한다.

## 2. 계약 개요

- 계약 상태: confirmed
- 소비자: User Web
- 호환성: 기존 Google only provider 목록을 Google/LINE/Apple로 확장한다. Kakao는 runtime에서 계속 제외한다.
- 인증: provider 목록은 비로그인 접근 가능, exchange는 Supabase/provider token 기반
- 권한: exchange 성공 후 내부 User session 발급

## 3. GET /api/auth/providers

- API 이름: 로그인 provider 목록 조회 API
- API 식별자: ListAuthProviders
- Method: GET
- Path: `/api/auth/providers`
- Request 이름: 없음
- Response 이름: `AuthProvidersResponse`
- Status: `200`

응답 순서:

```json
{
  "providers": [
    {
      "provider": "google",
      "label": "Google",
      "enabled": true
    },
    {
      "provider": "line",
      "label": "LINE",
      "enabled": true
    },
    {
      "provider": "apple",
      "label": "Apple",
      "enabled": true
    }
  ]
}
```

정책:

- FE 버튼 순서와 API 순서가 일치해야 한다.
- Kakao는 반환하지 않는다.
- 버튼은 항상 표시한다. 설정 오류는 클릭/교환 실패로 처리한다.

Business Logic / 비즈니스 로직 흐름:

1. 활성 provider 정책을 조회한다.
2. Google, LINE, Apple을 고정 순서로 response DTO에 넣는다.
3. Kakao legacy enum은 response에 포함하지 않는다.

연결된 DB 스키마:

- 조회: 없음 또는 설정 source
- 수정: 없음
- transaction: 없음

Transaction:

- 필요 여부: 없음
- 이유: provider 목록 조회는 DB mutation이 없다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

Observability:

- log event key: 실패 시 `auth.providers.listFailed`
- audit log: 없음
- request id: 사용
- redaction: 없음
- provider error context: 없음

## 4. POST /api/auth/exchange

- API 이름: OAuth token exchange API
- API 식별자: ExchangeExternalAuthToken
- Method: POST
- Path: `/api/auth/exchange`
- Request 이름: `ExchangeExternalAuthTokenDto`
- Response 이름: `AuthTokenResponse`
- Status: `200`

인증 헤더:

```text
Authorization: Bearer <supabaseAccessToken>
```

요청 body 후보:

```json
{
  "locale": "en",
  "timeZone": "America/New_York",
  "deviceSlot": "personal_laptop",
  "deviceId": "browser-device-id",
  "deviceLabel": "Personal browser",
  "replaceExistingDevice": true
}
```

provider는 request body 값을 신뢰하지 않는다. Backend는 Authorization Bearer token을 Supabase verifier adapter에서 검증하고, 검증된 token metadata의 provider를 `google`, `line`, `apple` 중 하나로 정규화한다.

응답은 기존 app session 계약을 유지한다.

## 5. Account Linking

처리 순서:

1. Supabase/provider token에서 provider와 provider user id를 확인한다.
2. `provider + providerUserId` 연결이 있으면 기존 User로 로그인한다.
3. 연결이 없으면 verified email을 가져온다.
4. email이 없으면 가입/로그인을 차단한다.
5. email을 lowercase로 정규화한다.
6. 같은 email의 기존 User가 있으면 해당 User에 `UserOAuthAccount`를 추가한다.
7. 같은 email User가 없으면 신규 User를 만든다.

연결된 DB 스키마:

- 조회: User, UserOAuthAccount, AuthDevice, AuthSession
- 생성: 신규 User, UserOAuthAccount, AuthDevice/AuthSession 필요 시
- 수정: 기존 User last-login metadata, 기존 AuthDevice/AuthSession rotation/revoke
- transaction: User/UserOAuthAccount/AuthDevice/AuthSession 변경을 같은 사용자 로그인 흐름으로 묶는다.

Transaction:

- 필요 여부: 필요
- 이유: 신규/기존 User 판정, OAuth 연결 생성, session/device 갱신이 하나의 로그인 결과를 구성한다.
- transaction model: User, UserOAuthAccount, AuthDevice, AuthSession
- rollback 범위: OAuth 연결 생성과 app session 발급 관련 DB 변경 전체
- 외부 Provider 호출 위치: Supabase/provider token 검증은 transaction 밖에서 수행한다.
- audit log 포함 여부: 없음. 단 provider 연결 이력이 비즈니스 감사 요구로 승격되면 별도 결정한다.

Observability:

- log event key: `auth.exchange.succeeded`, `auth.exchange.failed`, `auth.oauthAccount.linked`
- audit log: 없음
- request id: 사용
- redaction: token, authorization header, provider raw error, email 원문 logging 금지
- provider error context: provider, statusCode, providerErrorType, retryable, category, requestId

## 6. Error

사용자 노출 문구는 FE에서 provider raw error 없이 일반 문구로 표시한다.

```text
로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.
```

Backend error 후보:

```json
{
  "code": "AUTH_PROVIDER_EMAIL_REQUIRED",
  "field": "provider",
  "provider": "apple"
}
```

```json
{
  "code": "AUTH_PROVIDER_EXCHANGE_FAILED",
  "field": "provider"
}
```

## 7. FE/BE 처리 기준

- FE: Google, LINE, Apple 버튼을 API 순서와 동일하게 표시한다.
- FE: provider 실패는 일반 문구로 표시한다.
- BE: provider token 검증과 profile normalization은 adapter 경계에서 처리한다.
- BE: application use case는 verified email linking과 session 발급 transaction을 담당한다.

## 8. 구현 체크리스트

- [x] `OAuthProvider.LINE` migration이 있다.
- [x] APPLE mapping이 runtime에서 활성화됐다.
- [x] Kakao는 legacy enum으로만 유지된다.
- [x] provider email 없는 케이스가 차단된다.
- [x] email lowercase 비교 test가 있다.
- [x] 같은 verified email provider 연결 test가 있다.
- [x] provider raw error/token/secret이 log나 response에 노출되지 않는다.
- [x] Transaction 계약과 Observability 계약이 구현 결과와 일치한다.
- [x] Backend 신규/수정 코드에 한글 주석 규칙이 적용된다.

## 9. 구현 기록

- 2026-07-28: `OAuthProvider.LINE` migration, Google/LINE/Apple provider list, Supabase provider normalization, verified email 기존 User linking, safe provider failure error를 구현했다.
- 2026-07-28: Auth exchange는 `auth.exchange.succeeded`, `auth.exchange.failed`, `auth.oauthAccount.linked` 이벤트를 token/email/raw provider error 없이 기록한다.
