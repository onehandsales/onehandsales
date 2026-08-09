# Follow-up Email Provider DB Schema

상태: confirmed for G10
연결 Goal: G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION
작성일: 2026-08-05

## 1. 결론

G10 기본 구현에는 신규 DB table이나 migration이 필요하지 않다.

현재 `BE/prisma/schema.prisma`의 05-B 모델이 실제 Gmail/Microsoft provider 발송에 필요한 저장소를 이미 제공한다.

| 모델 | G10 사용 방식 |
|---|---|
| `ExternalEmailConnection` | provider, sender account email, encrypted token, granted scopes, reconnect 상태 저장 |
| `ExternalEmailOAuthState` | OAuth callback state 검증과 재사용 방지 |
| `FollowUpMessage` | subject/body 전체, sender/recipient snapshot, message status 저장 |
| `FollowUpDeliveryAttempt` | provider 발송 시도, status, safe error, retryable, latency, providerStatusCode 저장 |
| `FollowUpConsentNotice` | 첫 발송 주의 안내 확인 여부 |

## 2. G10에서 새 migration을 만들지 않는 이유

- `FollowUpMessage.safeErrorCode/safeErrorMessage/retryable`이 provider 실패 표시를 이미 처리한다.
- `FollowUpDeliveryAttempt.safeErrorCode/safeErrorMessage/detailJson`이 provider 실패 추적을 이미 처리한다.
- `ExternalEmailConnection.grantedScopes`가 send scope 검증 결과를 저장할 수 있다.
- `ExternalEmailConnection.status=RECONNECT_REQUIRED`와 `reconnectRequiredAt`이 재연결 CTA를 처리할 수 있다.
- smoke allowlist 차단은 safe error code와 delivery attempt row로 기록하면 된다.

## 3. 저장 정책

저장한다:

- `ExternalEmailConnection.providerAccountEmail`
- `ExternalEmailConnection.grantedScopes`
- `ExternalEmailConnection.encryptedAccessToken`
- `ExternalEmailConnection.encryptedRefreshToken`
- `FollowUpMessage.subject`
- `FollowUpMessage.body`
- `FollowUpMessage.senderEmail`
- `FollowUpMessage.recipientEmail`
- `FollowUpDeliveryAttempt.provider`
- `FollowUpDeliveryAttempt.providerStatusCode`
- `FollowUpDeliveryAttempt.safeErrorCode`
- `FollowUpDeliveryAttempt.safeErrorMessage`
- `FollowUpDeliveryAttempt.retryable`
- `FollowUpDeliveryAttempt.latencyMs`
- `FollowUpDeliveryAttempt.detailJson` redacted summary

저장하지 않는다:

- OAuth code/state 원문
- access token/refresh token 원문
- authorization header
- provider raw response body
- provider raw error body
- provider quota detail
- Gmail/Microsoft mailbox sync data
- email open/click tracking data

## 4. `detailJson` 허용 예시

허용:

```json
{
  "providerStatusReason": "TOKEN_REVOKED",
  "safeCategory": "AUTH",
  "smokeMode": true,
  "externalCallSkipped": true
}
```

금지:

```json
{
  "recipientEmail": "customer@example.com",
  "body": "이메일 본문 전체",
  "providerRawResponse": {
    "error": {
      "message": "provider raw error"
    }
  },
  "accessToken": "..."
}
```

## 5. DB 변경이 필요해지는 경우

아래 상황이 생기면 G10 구현 중이라도 먼저 문서를 갱신하고 migration 여부를 다시 판단한다.

| 상황 | 판단 |
|---|---|
| provider별 message id 외 thread id 저장 필요 | `FollowUpDeliveryAttempt.detailJson` redacted summary로 충분한지 먼저 검토 |
| provider status enum 고정 필요 | string safe code로 충분한지 먼저 검토 |
| Gmail/Microsoft 동시 다중 계정 지원 | 현재 `@@unique([userId, provider])` 변경 필요. G10 범위 아님 |
| email sync/read 기능 | 신규 table과 privacy 계약 필요. G10 범위 아님 |
| unsubscribe/sequence | 신규 정책/DB 필요. G10 범위 아님 |

## 6. DB 주석 필수 규칙

G10 구현 중 Prisma schema 또는 migration SQL을 수정하면 한국어 주석을 반드시 추가한다.

Prisma schema:

```prisma
/// 기능 : Gmail/Microsoft 발송 시도에서 provider raw 없이 safe 실패 정보를 저장합니다.
model FollowUpDeliveryAttempt {
  // ...
}
```

Migration SQL:

```sql
-- 기능 : smoke allowlist 차단 여부를 raw recipient 없이 safe context로만 남깁니다.
COMMENT ON COLUMN "FollowUpDeliveryAttempt"."detailJson" IS 'redacted 발송 detail. provider raw response, token, email 본문, 수신자 email 원문을 넣지 않는다.';
```

규칙:

- 신규 enum/table/index/FK는 migration SQL에 한국어 `COMMENT ON`을 둔다.
- 신규 column은 목적, 보관 기준, 민감정보 여부를 주석에 적는다.
- cleanup/retention/transaction 분기 SQL은 `-- 한글 주석`으로 안전 조건을 적는다.
- 기존 영어 Prisma 주석을 만지는 경우 G10 변경 범위 안에서는 한국어 `/// 기능 : ...`로 보정한다.

## 7. Transaction 확인

| 작업 | 변경 모델 | transaction |
|---|---|---|
| OAuth state 생성 | `ExternalEmailOAuthState` | 필요 |
| connection upsert | `ExternalEmailConnection`, `ExternalEmailOAuthState` | 필요 |
| token refresh 저장 | `ExternalEmailConnection` | 필요 |
| send attempt 시작 | `FollowUpMessage`, `FollowUpDeliveryAttempt` | 필요 |
| send 성공 반영 | `FollowUpMessage`, `FollowUpDeliveryAttempt`, `ExternalEmailConnection` | 필요 |
| send 실패 반영 | `FollowUpMessage`, `FollowUpDeliveryAttempt`, 필요 시 `ExternalEmailConnection` | 필요 |

외부 Gmail/Microsoft HTTP 호출은 transaction 밖에서 수행한다.

## 8. 09/11 영향 판단

09 Product Analytics:

- G10은 신규 `ProductAnalyticsEvent` taxonomy를 추가하지 않는다.
- follow-up 세부 runtime event는 09 완료 범위 밖으로 이미 분리되어 있다.
- 따라서 09 쪽 새 goal 문서 추가는 필요하지 않다.

11 Admin Operation:

- 11의 Admin provider failure API는 이미 `FollowUpDeliveryAttempt`를 EMAIL/SMS source로 사용한다.
- G10은 `FollowUpDeliveryAttempt`의 safe field 계약을 유지한다.
- provider raw/token/body를 저장하지 않는 한 11 쪽 새 goal 문서 추가는 필요하지 않다.
- 만약 G10 구현 중 `FollowUpDeliveryAttempt` safe field 의미를 바꾸면 11 `ADMIN_PROVIDER_FAILURE_API.md`도 함께 갱신해야 한다.

## 9. 검토 체크리스트

- [x] 신규 table/migration 없이 구현 가능한지 다시 확인했다.
- [x] `ExternalEmailConnection.grantedScopes`로 send scope 검증을 처리한다.
- [x] `RECONNECT_REQUIRED` 상태와 `reconnectRequiredAt`을 갱신한다.
- [x] smoke allowlist 차단도 `FollowUpDeliveryAttempt`로 남긴다.
- [x] `detailJson`에 raw recipient/body/token/provider response를 넣지 않는다.
- [x] DB/Prisma를 수정했다면 한국어 주석을 추가했다.
- [x] 09 신규 analytics event를 만들지 않았다.
- [x] 11 Admin provider failure safe select 계약을 깨지 않았다.
