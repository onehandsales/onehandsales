# Follow-up Email Provider Integration API

계약 상태: confirmed
연결 Goal: G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION
소비자: User Web, Backend internal
작성일: 2026-08-05

## 1. 목적

G10은 기존 05-B follow-up API 경로를 유지하면서 Gmail/Microsoft 365 실제 발송 adapter를 운영 가능 상태로 닫는다.

새 User API path를 만들지 않는다. 변경 범위는 email provider 연결 scope 검증, 실제 provider API 발송, smoke allowlist 검증, safe failure/reconnect 처리 계약 보강이다.

## 2. 호환성

| 항목 | 계약 |
|---|---|
| breaking change | 없음. 기존 `/api/follow-up-delivery/*`, `/api/follow-up-messages/*` 경로를 유지한다. |
| SMS 영향 | 없음. G10은 SMS provider 구현을 포함하지 않는다. |
| Email sync 영향 | 없음. 받은 편지함/캘린더 동기화, 이메일 히스토리 import, tracking pixel은 만들지 않는다. |
| 09 Product Analytics 영향 | 신규 runtime event taxonomy를 만들지 않는다. |
| 11 Admin 영향 | 기존 `FollowUpDeliveryAttempt` safe failure source 계약을 유지한다. |

## 3. 공통 환경 변수

Backend:

| 변수 | 필수 | 설명 |
|---|---:|---|
| `FOLLOW_UP_GOOGLE_CLIENT_ID` | production 필수 | Gmail OAuth client id |
| `FOLLOW_UP_GOOGLE_CLIENT_SECRET` | production 필수 | Gmail OAuth client secret |
| `FOLLOW_UP_MICROSOFT_CLIENT_ID` | production 필수 | Microsoft OAuth client id |
| `FOLLOW_UP_MICROSOFT_CLIENT_SECRET` | production 필수 | Microsoft OAuth client secret |
| `FOLLOW_UP_MICROSOFT_TENANT_ID` | 선택 | 기본값 `common` |
| `FOLLOW_UP_DELIVERY_ENCRYPTION_KEY` | 권장 | 없으면 `ENCRYPTION_MASTER_KEY` fallback |
| `FOLLOW_UP_DELIVERY_ENCRYPTION_KEY_VERSION` | 권장 | 없으면 `ENCRYPTION_KEY_VERSION`, `v1` 순서로 fallback |
| `FOLLOW_UP_EMAIL_SMOKE_MODE` | 선택 | `true`면 allowlist 수신자에게만 실제 email provider 호출을 허용한다. |
| `FOLLOW_UP_EMAIL_SMOKE_ALLOWED_RECIPIENTS` | smoke 필수 | comma-separated email allowlist. 소문자 trim 기준으로 비교한다. |

User Web:

| 변수 | 필수 | 설명 |
|---|---:|---|
| `VITE_API_URL` | 필수 | OAuth callback URL 생성과 API 호출 기준 origin |

## 4. Provider Scope 계약

Gmail:

```text
openid
email
https://www.googleapis.com/auth/gmail.send
```

Microsoft 365:

```text
openid
email
offline_access
User.Read
Mail.Send
```

규칙:

- 연결 시작 request는 위 scope만 요청한다.
- callback에서 `grantedScopes`에 send 권한이 없으면 연결을 완료하지 않고 safe error로 처리한다.
- G10은 mailbox read, calendar read/write, contact read, tracking 관련 scope를 요청하지 않는다.

## 5. POST /api/follow-up-delivery/email-connections/:provider/connect

- API 이름: email provider 연결 시작 API
- API 식별자: `StartEmailConnection`
- 계약 상태: confirmed
- Method: `POST`
- Path: `/api/follow-up-delivery/email-connections/:provider/connect`
- 인증: `Authorization: Bearer <app_access_token>`
- 권한: current user `userId`
- Request 이름: `StartEmailConnectionRequest`
- Response 이름: `StartEmailConnectionResponse`
- Status: `200 OK`

### Request

Path:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `provider` | string | 예 | `google`, `microsoft` | 연결할 email provider |

Body:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `redirectUri` | string | 예 | absolute URL | OAuth callback 후 User Web으로 돌아갈 URL |

### Response

```json
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "stateExpiresAt": "2026-08-05T05:10:00.000Z"
}
```

### 비즈니스 로직 흐름

1. AuthGuard로 current user를 확인한다.
2. `provider`를 `GOOGLE` 또는 `MICROSOFT`로 정규화한다.
3. provider credential 환경 변수가 production 기준으로 준비되어 있는지 확인한다.
4. provider별 send-only 최소 scope를 선택한다.
5. OAuth state 원문을 생성하고 hash만 `ExternalEmailOAuthState`에 저장한다.
6. provider authorization URL에 state, redirectUri, scope를 넣어 반환한다.

### 연결된 DB 스키마

- 생성: `ExternalEmailOAuthState`
- 조회: `User`
- 수정: 같은 user/provider의 미사용 state 만료 또는 revoke 처리 가능
- 삭제: 없음
- 감사 로그: 없음
- transaction: `ExternalEmailOAuthState`

### Transaction

- 필요 여부: 필요
- 이유: 신규 state 생성과 기존 미사용 state 정리를 같은 연결 시작 행동으로 묶는다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `followUp.emailConnection.connectStarted`
- audit log: 없음
- request id: 사용
- redaction: OAuth state 원문, client secret logging 금지
- provider error context: provider 이름, missing config 여부만 safe context로 기록

### 에러 응답

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 미지원 provider | `FollowUpEmailProviderUnsupported` | 400 | 연결 버튼 상태 유지 | warn |
| production credential 누락 | `FollowUpProviderUnavailable` | 503 | 안전한 실패 문구와 관리자 확인 안내 | error |

## 6. GET /api/follow-up-delivery/email-connections/:provider/callback

- API 이름: email provider callback API
- API 식별자: `HandleEmailConnectionCallback`
- 계약 상태: confirmed
- Method: `GET`
- Path: `/api/follow-up-delivery/email-connections/:provider/callback`
- 인증: Bearer 없음 가능. OAuth state로 user를 식별한다.
- 권한: `ExternalEmailOAuthState.userId`
- Request 이름: `EmailConnectionCallbackQuery`
- Response 이름: `EmailConnectionCallbackResponse`
- Status: `200 OK`

### Request

Query:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `code` | string | 예 | non-empty | provider authorization code |
| `state` | string | 예 | non-empty | 연결 시작 시 생성한 state 원문 |

### Response

```json
{
  "connection": {
    "id": "connection-id",
    "provider": "GOOGLE",
    "providerAccountEmail": "user@example.com",
    "status": "CONNECTED",
    "grantedScopes": [
      "openid",
      "email",
      "https://www.googleapis.com/auth/gmail.send"
    ]
  }
}
```

### 비즈니스 로직 흐름

1. `state` hash로 `ExternalEmailOAuthState`를 조회한다.
2. state 소유자, provider, 만료, 미사용 여부를 검증한다.
3. transaction 밖에서 provider token endpoint를 호출한다.
4. provider profile endpoint로 연결 계정 email을 확인한다.
5. `grantedScopes`에 send 권한이 있는지 확인한다.
6. transaction 안에서 token을 암호화해 `ExternalEmailConnection`을 upsert한다.
7. 같은 transaction에서 `ExternalEmailOAuthState.consumedAt`을 기록한다.
8. response에는 token, raw provider response, provider raw error를 포함하지 않는다.

### 연결된 DB 스키마

- 생성: `ExternalEmailConnection` upsert
- 조회: `ExternalEmailOAuthState`, `User`
- 수정: `ExternalEmailOAuthState.consumedAt`, `ExternalEmailConnection.status/grantedScopes/encryptedAccessToken/encryptedRefreshToken`
- 삭제: 없음
- 감사 로그: 없음
- transaction: `ExternalEmailConnection`, `ExternalEmailOAuthState`

### Transaction

- 필요 여부: 필요
- 이유: connection upsert와 state 사용 처리가 함께 성공해야 한다.
- 외부 Provider 호출 위치: transaction 밖
- rollback 범위: connection upsert와 state consumed 처리
- audit log 포함 여부: 없음

### Observability

- log event key: `followUp.emailConnection.connected`
- audit log: 없음
- request id: 사용
- redaction: code, state 원문, access token, refresh token, provider raw response logging 금지
- provider error context: provider, safe error code, retryable 여부

### 에러 응답

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| state 만료 또는 재사용 | `FollowUpEmailOAuthStateInvalid` | 400 | 다시 연결 안내 | warn |
| token exchange 실패 | `FollowUpProviderRequestFailed` | 502 | 다시 시도 안내 | warn |
| send scope 누락 | `FollowUpEmailScopeInsufficient` | 409 | 다시 연결 안내 | warn |
| provider account email 없음 | `FollowUpProviderRequestFailed` | 502 | 다시 시도 안내 | warn |

## 7. Provider 발송 adapter 계약

이 항목은 User API request가 아니라 Backend provider adapter의 외부 API 호출 계약이다.

### Gmail

- API: `POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send`
- 인증: `Authorization: Bearer <access_token>`
- Body: `{ "raw": "<base64url MIME message>" }`
- MIME content type: `text/plain; charset=UTF-8`
- 성공: provider response `id`를 `providerMessageId`로 저장한다.

### Microsoft 365

- API: `POST https://graph.microsoft.com/v1.0/me/sendMail`
- 인증: `Authorization: Bearer <access_token>`
- Body:

```json
{
  "message": {
    "subject": "견적 검토 follow-up",
    "body": {
      "contentType": "Text",
      "content": "지난 미팅에서 논의한 견적 검토 건 확인 부탁드려요."
    },
    "toRecipients": [
      {
        "emailAddress": {
          "address": "customer@example.com"
        }
      }
    ]
  },
  "saveToSentItems": true
}
```

- 성공: Microsoft Graph가 `202 Accepted`와 빈 body를 반환할 수 있으므로 `providerMessageId`는 nullable로 둔다.

### 공통 발송 규칙

- HTML body는 G10 범위에 포함하지 않는다. plain text만 보낸다.
- 첨부파일, tracking pixel, open tracking, link tracking은 만들지 않는다.
- provider raw response body는 DB/log에 저장하지 않는다.
- access token 만료 시 refresh token으로 갱신 후 발송한다.
- refresh token도 실패하면 connection을 `RECONNECT_REQUIRED`로 바꾼다.

## 8. POST /api/follow-up-messages/:messageId/send

- API 이름: follow-up 즉시 발송 API
- API 식별자: `SendFollowUpMessage`
- 계약 상태: confirmed
- Method: `POST`
- Path: `/api/follow-up-messages/:messageId/send`
- 인증: `Authorization: Bearer <app_access_token>`
- 권한: current user `userId`
- Request 이름: `SendFollowUpMessageRequest`
- Response 이름: `FollowUpMessageDetailResponse`
- Status: `202 Accepted`

### Request

Path:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `messageId` | string | 예 | UUID | 발송할 follow-up message ID |

Body: 없음

### Response - 성공

```json
{
  "id": "message-id",
  "status": "SENT",
  "channel": "EMAIL",
  "sentAt": "2026-08-05T05:05:00.000Z",
  "safeErrorCode": null,
  "safeErrorMessage": null,
  "deliveryAttempts": [
    {
      "status": "SENT",
      "provider": "google",
      "providerStatusCode": "200",
      "safeErrorCode": null,
      "retryable": false
    }
  ]
}
```

### Response - smoke allowlist 차단

```json
{
  "id": "message-id",
  "status": "FAILED",
  "channel": "EMAIL",
  "sentAt": null,
  "failedAt": "2026-08-05T05:05:00.000Z",
  "safeErrorCode": "FollowUpEmailSmokeRecipientNotAllowed",
  "safeErrorMessage": "검증용 수신자에게만 보낼 수 있어요.",
  "retryable": false
}
```

### Response - 재연결 필요

```json
{
  "id": "message-id",
  "status": "FAILED",
  "channel": "EMAIL",
  "sentAt": null,
  "failedAt": "2026-08-05T05:05:00.000Z",
  "safeErrorCode": "FollowUpEmailReconnectRequired",
  "safeErrorMessage": "이메일 연결이 만료됐어요. 다시 연결해 주세요.",
  "retryable": false
}
```

### 비즈니스 로직 흐름

1. current user와 message ownership을 확인한다.
2. message가 `EMAIL`이고 `DRAFT` 또는 retry 가능한 `FAILED`인지 확인한다.
3. 첫 발송 주의 안내가 확인되어 있는지 확인한다.
4. `ExternalEmailConnection.status=CONNECTED`와 send scope를 확인한다.
5. `FOLLOW_UP_EMAIL_SMOKE_MODE=true`면 수신자 email이 allowlist에 있는지 먼저 검사한다.
6. allowlist 차단이면 외부 provider를 호출하지 않고 failed attempt를 저장한다.
7. transaction 안에서 message를 `SENDING`으로 바꾸고 `FollowUpDeliveryAttempt`를 만든다.
8. transaction 밖에서 access token refresh와 provider send API를 호출한다.
9. 성공 시 message/attempt를 `SENT`로 갱신한다.
10. 실패 시 safe error mapper를 거쳐 message/attempt를 `FAILED`로 갱신한다.
11. token/revoked/invalid_grant/insufficient scope 계열이면 connection을 `RECONNECT_REQUIRED`로 갱신한다.

### 연결된 DB 스키마

- 생성: `FollowUpDeliveryAttempt`
- 조회: `FollowUpMessage`, `FollowUpConsentNotice`, `ExternalEmailConnection`, `Contact`
- 수정: `FollowUpMessage`, `FollowUpDeliveryAttempt`, 필요 시 `ExternalEmailConnection`
- 삭제: 없음
- 감사 로그: 없음
- transaction: message status 전환, attempt 생성/갱신, connection reconnect 상태 갱신

### Transaction

- 필요 여부: 필요
- 이유: message status와 delivery attempt가 항상 같은 사용자 행동 결과로 움직인다.
- rollback 범위: provider 호출 전 `SENDING` 전환과 attempt 생성, provider 호출 후 성공/실패 상태 갱신
- 외부 Provider 호출 위치: transaction 밖
- audit log 포함 여부: 없음

### Observability

- log event key:
  - `followUp.message.sendRequested`
  - `followUp.message.sent`
  - `followUp.message.failed`
  - `followUp.emailConnection.reconnectRequired`
  - `provider.gmail.followUpSend.failed`
  - `provider.microsoft.followUpSend.failed`
- audit log: 없음
- request id: 사용
- redaction: subject/body, recipient email, sender email, token, provider raw response logging 금지
- provider error context: provider, status code, safe error code, retryable, latencyMs

### 에러 응답

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 첫 발송 안내 미확인 | `FollowUpConsentNoticeRequired` | 409 | 안내 dialog 표시 | warn |
| 연결 없음 | `FollowUpEmailConnectionRequired` | 409 | 설정 이동 CTA | warn |
| 연결 만료/권한 오류 | `FollowUpEmailReconnectRequired` | 409 또는 202 failed body | 다시 연결 CTA | warn |
| scope 부족 | `FollowUpEmailScopeInsufficient` | 409 | 다시 연결 CTA | warn |
| smoke allowlist 차단 | `FollowUpEmailSmokeRecipientNotAllowed` | 202 failed body | 검증 수신자 안내 | warn |
| invalid recipient | `FollowUpInvalidRecipient` | 400 | 수신자 수정 | warn |
| rate limit/timeout | `FollowUpProviderTemporaryFailure` | 202 failed body | 재시도 표시 | warn |
| provider 설정 누락 | `FollowUpProviderUnavailable` | 503 또는 202 failed body | 안전한 실패 문구 | error |

## 9. POST /api/follow-up-messages/:messageId/retry

- API 이름: follow-up 발송 재시도 API
- API 식별자: `RetryFollowUpMessage`
- 계약 상태: confirmed
- Method: `POST`
- Path: `/api/follow-up-messages/:messageId/retry`
- 인증: `Authorization: Bearer <app_access_token>`
- 권한: current user `userId`
- Request 이름: `RetryFollowUpMessageRequest`
- Response 이름: `FollowUpMessageDetailResponse`
- Status: `202 Accepted`

### Request

Path:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `messageId` | string | 예 | UUID | 재시도할 follow-up message ID |

Body: 없음

### 비즈니스 로직 흐름

1. current user와 message ownership을 확인한다.
2. message status가 `FAILED`인지 확인한다.
3. 마지막 실패가 retryable이거나 사용자가 재연결을 완료했는지 확인한다.
4. `SendFollowUpMessage`와 같은 smoke allowlist, provider send, safe error, reconnect-required 계약을 적용한다.

### 연결된 DB 스키마

- 생성: 새 `FollowUpDeliveryAttempt`
- 조회: `FollowUpMessage`, `ExternalEmailConnection`, 마지막 `FollowUpDeliveryAttempt`
- 수정: `FollowUpMessage`, `FollowUpDeliveryAttempt`, 필요 시 `ExternalEmailConnection`
- 삭제: 없음
- 감사 로그: 없음
- transaction: message status 전환과 새 attempt 생성/갱신

### Transaction

- 필요 여부: 필요
- 이유: 재시도 요청마다 별도 attempt가 생성되어야 한다.
- 외부 Provider 호출 위치: transaction 밖
- rollback 범위: `SENDING` 전환과 새 attempt 생성/갱신
- audit log 포함 여부: 없음

### Observability

- log event key:
  - `followUp.message.retryRequested`
  - `followUp.message.sent`
  - `followUp.message.failed`
- redaction: subject/body, recipient email, sender email, token, provider raw response logging 금지

## 10. FE/BE 처리 기준

Backend:

- 실제 provider 호출 코드는 infrastructure adapter에 둔다.
- application service는 provider SDK/HTTP detail을 직접 알지 않는다.
- 새 Backend class/interface/controller method/function에는 한국어 주석을 반드시 둔다.
- controller method는 `// API : ...`, 내부 함수는 `// 기능 : ...`, class/interface는 `// 역할 : ...` 형식을 따른다.
- send orchestration에는 numbered step comment를 둔다.

Frontend:

- 기존 follow-up API client path를 유지한다.
- 연결 만료 또는 scope 부족이면 `/app/settings`로 이어지는 다시 연결 CTA를 보여준다.
- smoke allowlist 차단 문구는 운영자/QA 맥락에서만 노출한다.
- 사용자가 보는 문구는 해요체를 쓴다.
- 새 component/hook/api/client/event handler에는 한국어 `// 기능 : ...` 주석을 둔다.

검증:

- Gmail 실제 provider adapter unit/integration test
- Microsoft Graph 실제 provider adapter unit/integration test
- smoke mode allowlist 차단 test
- reconnect-required 상태 전환 test
- provider raw/token/body/recipient log redaction test
- User Web reconnect CTA와 safe error rendering test
