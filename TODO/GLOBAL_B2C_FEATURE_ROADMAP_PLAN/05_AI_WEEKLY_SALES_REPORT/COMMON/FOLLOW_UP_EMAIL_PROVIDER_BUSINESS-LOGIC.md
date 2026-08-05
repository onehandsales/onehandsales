# Follow-up Email Provider Business Logic

상태: confirmed for G10
연결 Goal: G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION
작성일: 2026-08-05

## 1. 목적

G10은 05-B에서 이미 만든 follow-up email 연결/compose/send 흐름을 실제 Gmail/Microsoft 365 발송까지 닫는다.

현재 코드에는 OAuth URL 생성, token exchange, profile 조회, token 암호화 저장, draft/send 상태 전환, delivery attempt 저장 기반이 있다. 남은 핵심은 production에서 `sendEmail()`이 `FollowUpProviderUnavailable`로 끝나는 부분을 실제 provider API 호출로 교체하고, 실패를 안전하게 저장/표시하는 것이다.

## 2. 확정 결정

| 항목 | 결정 |
|---|---|
| Provider | Gmail, Microsoft 365 둘 다 지원한다. |
| 발송 방식 | 사용자 본인이 연결한 Gmail/Microsoft 계정으로 보낸다. |
| Provider API | SMTP나 외부 email SaaS가 아니라 Gmail API, Microsoft Graph API를 직접 호출한다. |
| OAuth scope | send-only 최소 scope를 사용한다. Gmail mailbox read, Microsoft Mail.Read는 요청하지 않는다. |
| Microsoft tenant | `FOLLOW_UP_MICROSOFT_TENANT_ID` 없으면 `common`을 기본으로 쓴다. |
| 본문 형식 | plain text만 지원한다. HTML, 첨부, tracking은 제외한다. |
| 발송 본문 저장 | 기존 05 계약대로 `FollowUpMessage.subject/body` 전체를 저장한다. |
| Structured log | subject/body, recipient email, sender email, token, provider raw response를 남기지 않는다. |
| Smoke 검증 | 전용 allowlist 수신자에게만 실제 provider 호출을 허용하는 smoke mode를 제공한다. |
| Smoke 실패 | provider 호출 없이 `FollowUpDeliveryAttempt` 실패 이력을 남긴다. |
| 재연결 필요 | token/revoked/invalid_grant/insufficient scope는 connection을 `RECONNECT_REQUIRED`로 바꾼다. |
| SMS | G10에서 구현하지 않는다. |
| Email sync | G10에서 구현하지 않는다. |

## 3. Use Case 목록

| Use case | G10 책임 |
|---|---|
| `StartEmailConnection` | send-only scope와 provider credential preflight를 확정한다. |
| `HandleEmailConnectionCallback` | granted scope 검증과 token 저장을 확정한다. |
| `SendFollowUpMessage` | Gmail/Microsoft provider API 실제 호출을 수행한다. |
| `RetryFollowUpMessage` | 실제 provider 재시도와 reconnect-required 분기를 적용한다. |
| `GetFollowUpDeliverySettings` | `RECONNECT_REQUIRED` 상태와 granted scope 정보를 User Web reconnect CTA에 맞게 반환한다. |

## 4. 연결 시작 흐름

1. 사용자가 `/app/settings`에서 Gmail 또는 Microsoft 365 연결을 누른다.
2. Backend는 provider credential 환경 변수가 있는지 확인한다.
3. OAuth state 원문을 생성하고 hash만 DB에 저장한다.
4. provider별 최소 scope를 authorization URL에 넣는다.
5. User Web은 authorization URL로 이동한다.

구현 기준:

- production에서 credential이 없으면 test provider로 fallback하지 않는다.
- non-production test provider는 기존 자동 테스트를 위해 유지할 수 있다.
- OAuth state 원문, client secret은 log에 남기지 않는다.

## 5. Callback 흐름

1. Backend는 state hash로 `ExternalEmailOAuthState`를 찾는다.
2. user/provider/만료/재사용 여부를 검증한다.
3. provider token endpoint를 transaction 밖에서 호출한다.
4. provider profile endpoint로 sender email을 확인한다.
5. granted scope에 send 권한이 없으면 연결을 실패 처리한다.
6. token을 암호화하고 `ExternalEmailConnection`을 upsert한다.
7. state를 consumed 처리한다.

구현 기준:

- token refresh가 가능하려면 refresh token을 암호화 저장한다.
- Microsoft `offline_access`가 없어서 refresh token을 못 받으면 연결을 완료하지 않는다.
- 기존 같은 user/provider connection은 새 token과 scope로 갱신한다.

## 6. 발송 흐름

1. 사용자가 compose에서 수신자, 제목, 본문을 확인하고 `보내기`를 누른다.
2. Backend는 message ownership, status, channel, first-send notice를 확인한다.
3. email connection이 `CONNECTED`인지 확인한다.
4. granted scope에 send 권한이 있는지 확인한다.
5. smoke mode가 켜져 있으면 수신자 email allowlist를 먼저 확인한다.
6. allowlist에 없으면 외부 provider를 호출하지 않고 failed attempt를 저장한다.
7. message를 `SENDING`으로 전환하고 delivery attempt를 만든다.
8. transaction 밖에서 access token을 refresh하고 provider send API를 호출한다.
9. 성공하면 message/attempt를 `SENT`로 갱신한다.
10. 실패하면 provider error를 safe error로 변환해 message/attempt를 `FAILED`로 갱신한다.
11. 인증/권한 계열 실패면 connection을 `RECONNECT_REQUIRED`로 갱신한다.

중복 발송 방지:

- `DRAFT` 또는 retry 가능한 `FAILED`에서만 `SENDING`으로 바뀐다.
- `SENT`는 다시 발송하지 않는다.
- concurrent send는 DB status gate로 하나만 성공해야 한다.

## 7. Provider Adapter 세부 로직

Gmail:

1. plain text MIME message를 만든다.
2. subject는 UTF-8 encoded-word 또는 안전한 MIME header encoding을 사용한다.
3. `To`, `From`, `Subject`, `Content-Type`만 필요한 최소 header를 넣는다.
4. MIME 전체를 base64url로 변환한다.
5. Gmail `users.messages.send`를 호출한다.
6. response id만 `providerMessageId`로 사용한다.

Microsoft 365:

1. Graph `/me/sendMail` request body를 만든다.
2. `body.contentType`은 `Text`로 고정한다.
3. `saveToSentItems`는 `true`로 둔다.
4. `202 Accepted`면 성공으로 본다.
5. Graph가 message id를 반환하지 않는 흐름은 `providerMessageId=null`을 허용한다.

공통:

- provider HTTP timeout을 둔다.
- provider raw body는 safe mapper 내부에서도 저장하지 않는다.
- adapter logging은 provider, status code, latency, safe error code까지만 남긴다.

## 8. Safe Error Mapping

| provider 상황 | safe error code | retryable | 추가 처리 |
|---|---|---:|---|
| access token expired 후 refresh 성공 | 없음 | false | 새 token 저장 후 발송 계속 |
| refresh token invalid/revoked | `FollowUpEmailReconnectRequired` | false | connection `RECONNECT_REQUIRED` |
| Gmail/Microsoft 401/403 auth | `FollowUpEmailReconnectRequired` | false | connection `RECONNECT_REQUIRED` |
| send scope 없음 | `FollowUpEmailScopeInsufficient` | false | connection `RECONNECT_REQUIRED` |
| invalid recipient | `FollowUpInvalidRecipient` | false | 수신자 수정 안내 |
| provider timeout | `FollowUpProviderTemporaryFailure` | true | retry UI 표시 |
| provider 429 | `FollowUpProviderTemporaryFailure` | true | retry UI 표시 |
| provider 5xx | `FollowUpProviderTemporaryFailure` | true | retry UI 표시 |
| credential/env 누락 | `FollowUpProviderUnavailable` | false | 운영 설정 확인 |
| smoke allowlist 차단 | `FollowUpEmailSmokeRecipientNotAllowed` | false | provider 호출 없음 |

## 9. 개인정보와 고객 컴플레인 기준

서비스 방향은 Attio처럼 사용자 연결 계정 기반 CRM 발송 흐름을 따른다.

G10에서 지키는 기준:

- 고객의 받은 편지함이나 사용자 mailbox를 동기화하지 않는다.
- 고객 contact email은 사용자가 이미 저장한 담당자 record에서만 사용한다.
- 사용자가 compose에서 수신자, 제목, 본문을 확인한 뒤에만 보낸다.
- 발신자는 onehand.sales 공용 주소가 아니라 사용자 본인 연결 계정이다.
- 첫 발송 주의 안내로 수신자가 연락을 받을 수 있는 관계인지 확인하게 한다.
- 발송 실패 로그와 운영 로그는 safe error 중심으로 남긴다.
- 고객 email 원문은 structured log, analytics payload, provider failure admin detail에 넣지 않는다.

G10에서 하지 않는 것:

- email inbox sync
- customer enrichment
- bulk sequence/campaign
- unsubscribe 관리
- 자동 발송
- SMS/B2B tenant 확장

## 10. Transaction 기준

| 흐름 | transaction | 외부 provider 위치 |
|---|---|---|
| 연결 시작 | 필요 | 없음 |
| callback token 저장 | 필요 | token/profile 호출은 transaction 밖 |
| send attempt 시작 | 필요 | provider send 전 |
| provider send 성공 반영 | 필요 | provider send 후 |
| provider send 실패 반영 | 필요 | provider send 후 |
| reconnect-required 갱신 | 필요 | provider 실패 확인 후 |

원칙:

- 외부 HTTP 호출은 DB transaction 안에서 실행하지 않는다.
- provider 호출 전후 DB 변경은 짧은 transaction으로 분리한다.
- provider 호출 성공 후 DB 저장 실패가 발생하면 중복 발송 가능성이 있으므로 idempotency key와 providerMessageId를 attempt에 최대한 남긴다.

## 11. Observability 기준

Structured log event:

- `followUp.emailConnection.connectStarted`
- `followUp.emailConnection.connected`
- `followUp.emailConnection.reconnectRequired`
- `followUp.message.sendRequested`
- `followUp.message.sent`
- `followUp.message.failed`
- `provider.gmail.followUpSend.failed`
- `provider.microsoft.followUpSend.failed`

Logging 금지:

- OAuth code/state 원문
- access token, refresh token
- sender email, recipient email 원문
- subject/body
- provider raw response body
- authorization header

DB 저장 허용:

- `FollowUpMessage.subject/body` 전체
- `FollowUpMessage.senderEmail/recipientEmail` snapshot
- `FollowUpDeliveryAttempt.providerStatusCode`
- `FollowUpDeliveryAttempt.safeErrorCode/safeErrorMessage`
- `FollowUpDeliveryAttempt.detailJson`의 redacted summary

## 12. 코드 주석 필수 기준

G10 구현으로 새로 만들거나 수정하는 코드는 한국어 주석을 반드시 추가한다.

Backend:

- class/interface: `// 역할 : ...`
- controller method: `// API : ...`
- internal method/function: `// 기능 : ...`
- application orchestration: `// 1. ...`, `// 2. ...` numbered step comment
- provider adapter의 MIME 생성, token refresh, reconnect-required 판단에는 왜 그렇게 처리하는지 한국어 주석을 둔다.

Frontend:

- React component, hook, API client, event handler: `// 기능 : ...`
- reconnect CTA, smoke safe error, compose 상태 전환처럼 사용자가 보는 흐름에는 한국어 주석을 둔다.

DB/SQL:

- Prisma schema를 수정하면 `/// 기능 : ...` 주석을 둔다.
- migration SQL을 추가하면 `COMMENT ON TABLE`, `COMMENT ON COLUMN`, `COMMENT ON INDEX` 또는 `-- 한글 주석`을 포함한다.

## 13. 테스트 기준

Backend:

- Gmail MIME/base64url 생성 unit test
- Microsoft Graph request body 생성 unit test
- token refresh 성공 후 발송 test
- invalid_grant/revoked/scope 부족 시 `RECONNECT_REQUIRED` 전환 test
- smoke allowlist 차단 시 provider 호출 없음 test
- provider timeout/429/5xx retryable mapping test
- structured log redaction test

Frontend:

- settings에서 `RECONNECT_REQUIRED`가 다시 연결 CTA로 보이는지 확인
- send 실패 safe error rendering
- smoke allowlist 차단 문구
- compose 본문/제목 log 출력 없음
- 모바일 390px/360px에서 settings/compose/timeline 겹침 없음

운영 확인:

- Gmail 실제 연결과 allowlist 수신자 발송
- Microsoft 365 실제 연결과 allowlist 수신자 발송
- allowlist 밖 수신자 차단
- credential/callback URL 누락 시 safe failure
