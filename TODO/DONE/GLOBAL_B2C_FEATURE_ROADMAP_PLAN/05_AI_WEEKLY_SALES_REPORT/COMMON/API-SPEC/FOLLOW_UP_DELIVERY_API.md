# Follow-up Delivery API

계약 상태: confirmed
소비자: User Web
호환성: 신규 API, 05-A API 변경 없음

## 1. 공통 계약

Base paths:

- `/api/follow-up-delivery`
- `/api/follow-up-messages`

인증:

- `Authorization: Bearer <app_access_token>`
- `AuthGuard`
- 단, provider OAuth callback endpoint는 provider redirect로 호출되므로 Bearer header가 없을 수 있다. callback은 `state` hash, 만료 시각, 미사용 여부, 연결 시작 시 저장한 `userId`로 소유권을 검증한다.

권한:

- 모든 조회/변경은 current user `userId`로 제한한다.
- Admin API는 이번 범위에 포함하지 않는다.

공통 enum:

| enum | 값 |
|---|---|
| `FollowUpDeliveryChannel` | `EMAIL`, `SMS` |
| `ExternalEmailProvider` | `GOOGLE`, `MICROSOFT` |
| `FollowUpMessageStatus` | `DRAFT`, `SENDING`, `SENT`, `FAILED` |
| `FollowUpTargetType` | `AI_WEEKLY_REPORT`, `DEAL`, `CONTACT`, `MEETING_NOTE`, `SCHEDULE` |

## 2. GET /api/follow-up-delivery/settings

- API 이름: follow-up 발송 설정 조회 API
- API 식별자: `GetFollowUpDeliverySettings`
- Method: `GET`
- Path: `/api/follow-up-delivery/settings`
- Request 이름: `GetFollowUpDeliverySettingsRequest`
- Response 이름: `FollowUpDeliverySettingsResponse`
- Status: `200 OK`

### Response

```json
{
  "emailConnections": [
    {
      "id": "connection-id",
      "provider": "GOOGLE",
      "providerAccountEmail": "user@example.com",
      "status": "CONNECTED",
      "connectedAt": "2026-07-24T05:00:00.000Z",
      "reconnectRequiredAt": null
    }
  ],
  "smsSenderNumbers": [
    {
      "id": "sender-id",
      "phoneE164Masked": "+82******5678",
      "status": "VERIFIED",
      "verifiedAt": "2026-07-24T05:00:00.000Z"
    }
  ],
  "consentNotices": [
    {
      "channel": "EMAIL",
      "acknowledgedAt": "2026-07-24T05:00:00.000Z"
    }
  ]
}
```

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `followUp.settings.viewed`
- redaction: email/phone은 masking된 값만 response에 반환한다.

## 3. POST /api/follow-up-delivery/email-connections/:provider/connect

- API 이름: email provider 연결 시작 API
- API 식별자: `StartEmailConnection`
- Method: `POST`
- Path: `/api/follow-up-delivery/email-connections/:provider/connect`
- Request 이름: `StartEmailConnectionRequest`
- Response 이름: `StartEmailConnectionResponse`
- Status: `200 OK`

### Request

Path:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `provider` | string | 예 | `google`, `microsoft` | 연결할 email provider |

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `redirectUri` | string | 예 | OAuth callback 이후 돌아올 User Web URL |

### Response

```json
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "stateExpiresAt": "2026-07-24T05:10:00.000Z"
}
```

### 비즈니스 로직

1. current user를 확인한다.
2. provider enum을 검증한다.
3. OAuth state를 생성하고 `ExternalEmailOAuthState`에 `stateHash`, `redirectUri`, `expiresAt`, `userId`를 저장한다.
4. state 원문은 DB에 저장하지 않고 provider authorization URL에만 포함한다.
5. authorization URL을 반환한다.

### Transaction

- 필요 여부: 필요
- 이유: OAuth state 저장과 중복 state revoke가 함께 필요하다.
- 외부 Provider 호출 위치: 없음

### Observability

- log event key: `followUp.emailConnection.connectStarted`
- redaction: OAuth state 원문 logging 금지

## 4. GET /api/follow-up-delivery/email-connections/:provider/callback

- API 이름: email provider callback API
- API 식별자: `HandleEmailConnectionCallback`
- Method: `GET`
- Path: `/api/follow-up-delivery/email-connections/:provider/callback`
- Request 이름: `EmailConnectionCallbackQuery`
- Response 이름: `EmailConnectionCallbackResponse`
- Status: `200 OK`

### Request

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `code` | string | 예 | provider authorization code |
| `state` | string | 예 | 연결 시작 시 생성한 state |

### Response

```json
{
  "connection": {
    "id": "connection-id",
    "provider": "GOOGLE",
    "providerAccountEmail": "user@example.com",
    "status": "CONNECTED"
  }
}
```

### 비즈니스 로직

1. `ExternalEmailOAuthState`에서 state hash, 소유권, 만료 여부, `consumedAt IS NULL`을 검증한다.
2. provider token endpoint를 transaction 밖에서 호출한다.
3. provider profile/email을 조회한다.
4. transaction 안에서 token을 암호화 저장하고 connection을 upsert한다.
5. 같은 transaction에서 `ExternalEmailOAuthState.consumedAt`을 기록해 callback 재사용을 막는다.
6. 기존 같은 provider connection은 새 계정 정보로 갱신한다.

### Transaction

- 필요 여부: 필요
- 이유: connection upsert와 state 사용 처리가 함께 필요하다.
- 외부 Provider 호출 위치: transaction 밖

### Observability

- log event key: `followUp.emailConnection.connected`
- redaction: token, code, provider raw response logging 금지

## 4A. POST /api/follow-up-delivery/email-connections/:connectionId/disconnect

- API 이름: email provider 연결 해제 API
- API 식별자: `DisconnectEmailConnection`
- Method: `POST`
- Path: `/api/follow-up-delivery/email-connections/:connectionId/disconnect`
- Request 이름: `DisconnectEmailConnectionRequest`
- Response 이름: `EmailConnectionResponse`
- Status: `200 OK`

### Request

Path:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `connectionId` | string | 예 | UUID | 해제할 email connection ID |

### Response

```json
{
  "id": "connection-id",
  "provider": "GOOGLE",
  "providerAccountEmail": "user@example.com",
  "status": "DISCONNECTED",
  "disconnectedAt": "2026-07-24T05:30:00.000Z"
}
```

### 비즈니스 로직

1. current user와 connection ownership을 확인한다.
2. provider revoke API가 있으면 transaction 밖에서 호출한다.
3. transaction 안에서 connection을 `DISCONNECTED`로 갱신하고 token ciphertext를 비운다.

### Transaction

- 필요 여부: 필요
- 이유: connection 상태와 token 제거를 함께 처리한다.
- 외부 Provider 호출 위치: transaction 밖

### Observability

- log event key: `followUp.emailConnection.disconnected`
- redaction: token/provider raw response logging 금지

## 5. POST /api/follow-up-delivery/sms-sender-numbers

- API 이름: SMS 발신번호 인증 요청 API
- API 식별자: `RequestSmsSenderNumberVerification`
- Method: `POST`
- Path: `/api/follow-up-delivery/sms-sender-numbers`
- Request 이름: `RequestSmsSenderNumberVerificationRequest`
- Response 이름: `SmsSenderNumberVerificationRequestedResponse`
- Status: `202 Accepted`

### Request

Body:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `phoneE164` | string | 예 | E.164 | 인증할 발신번호 |

### Response

```json
{
  "senderNumber": {
    "id": "sender-id",
    "phoneE164Masked": "+82******5678",
    "status": "PENDING_VERIFICATION",
    "verificationExpiresAt": "2026-07-24T05:10:00.000Z"
  }
}
```

### 비즈니스 로직

1. E.164 형식인지 검증한다.
2. 인증 code를 생성한다.
3. code hash는 provider 호출 성공 후 DB에 저장한다.
4. provider로 인증 SMS를 보낸다.
5. provider 성공 후 sender row와 code hash를 저장한다.
6. provider 실패 시 sender row를 만들지 않고 safe error를 반환한다.

### Transaction

- 필요 여부: 필요
- 이유: sender row와 verification metadata를 저장한다.
- 외부 Provider 호출 위치: transaction 밖. provider 호출이 성공한 뒤 transaction 안에서 `PENDING_VERIFICATION` sender row를 저장한다.

### Observability

- log event key: `followUp.smsSender.verificationRequested`
- redaction: phone 원문, verification code logging 금지

## 6. POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/verify

- API 이름: SMS 발신번호 인증 확인 API
- API 식별자: `VerifySmsSenderNumber`
- Method: `POST`
- Path: `/api/follow-up-delivery/sms-sender-numbers/:senderNumberId/verify`
- Request 이름: `VerifySmsSenderNumberRequest`
- Response 이름: `SmsSenderNumberResponse`
- Status: `200 OK`

### Request

Body:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `code` | string | 예 | 숫자 4~8자리 | SMS로 받은 인증 코드 |

### Response

```json
{
  "id": "sender-id",
  "phoneE164Masked": "+82******5678",
  "status": "VERIFIED",
  "verifiedAt": "2026-07-24T05:05:00.000Z"
}
```

### 에러

| 상황 | error code | HTTP | FE 처리 |
|---|---|---:|---|
| code 불일치 | `SmsSenderVerificationCodeInvalid` | 400 | 코드를 다시 입력 |
| code 만료 | `SmsSenderVerificationExpired` | 410 | 인증 재요청 |

### Transaction

- 필요 여부: 필요
- 이유: 발신번호 status, verifiedAt, verification code 제거를 함께 처리한다.
- 외부 Provider 호출 위치: 없음

### Observability

- log event key: `followUp.smsSender.verified`
- redaction: phone 원문과 인증 code logging 금지

## 6A. POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/revoke

- API 이름: SMS 발신번호 해제 API
- API 식별자: `RevokeSmsSenderNumber`
- Method: `POST`
- Path: `/api/follow-up-delivery/sms-sender-numbers/:senderNumberId/revoke`
- Request 이름: `RevokeSmsSenderNumberRequest`
- Response 이름: `SmsSenderNumberResponse`
- Status: `200 OK`

### 비즈니스 로직

1. current user와 sender number ownership을 확인한다.
2. status를 `REVOKED`로 바꾸고 `revokedAt`을 기록한다.
3. 과거 발송 이력은 삭제하지 않는다.

### Transaction

- 필요 여부: 필요
- 이유: 발신번호 상태 변경은 사용자 설정 mutation이다.
- 외부 Provider 호출 위치: 없음

### Observability

- log event key: `followUp.smsSender.revoked`
- redaction: phone 원문 logging 금지

## 7. POST /api/follow-up-delivery/consent-notices/:channel/acknowledge

- API 이름: follow-up 첫 발송 주의 안내 확인 API
- API 식별자: `AcknowledgeFollowUpConsentNotice`
- Method: `POST`
- Path: `/api/follow-up-delivery/consent-notices/:channel/acknowledge`
- Request 이름: `FollowUpConsentNoticeAcknowledgeRequest`
- Response 이름: `FollowUpConsentNoticeResponse`
- Status: `200 OK`

### Response

```json
{
  "channel": "EMAIL",
  "acknowledgedAt": "2026-07-24T05:00:00.000Z"
}
```

### Transaction

- 필요 여부: 필요
- 이유: 사용자/channel별 확인 이력을 upsert한다.
- 외부 Provider 호출 위치: 없음

### Observability

- log event key: `followUp.consentNotice.acknowledged`
- redaction: 없음

## 8. POST /api/follow-up-messages/drafts

- API 이름: follow-up draft 생성 API
- API 식별자: `CreateFollowUpDraft`
- Method: `POST`
- Path: `/api/follow-up-messages/drafts`
- Request 이름: `CreateFollowUpDraftRequest`
- Response 이름: `FollowUpMessageDetailResponse`
- Status: `201 Created`

### Request

Body:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `sourceReportId` | string | 예 | UUID | 05-A report ID |
| `sourceSuggestionId` | string | 예 | UUID | `FOLLOW_UP` suggestion ID |
| `channel` | string | 예 | `EMAIL` 또는 `SMS` | 생성할 draft 채널 |
| `languageTag` | string | 예 | BCP 47 | 발송 언어 |
| `recipientContactId` | string | 예 | UUID | 수신 담당자 |

### Response

```json
{
  "id": "message-id",
  "status": "DRAFT",
  "channel": "EMAIL",
  "languageTag": "ko-KR",
  "sender": {
    "type": "EMAIL",
    "email": "user@example.com"
  },
  "recipient": {
    "contactId": "contact-id",
    "name": "김민수",
    "email": "minsu@example.com",
    "phoneE164Masked": "+82******5678"
  },
  "subject": "견적 검토 follow-up",
  "body": "지난 미팅에서 논의한 견적 검토 건 확인 부탁드려요.",
  "createdAt": "2026-07-24T05:00:00.000Z"
}
```

### 비즈니스 로직

1. source report/suggestion ownership을 확인한다.
2. suggestion type이 `FOLLOW_UP`인지 확인한다.
3. 수신 contact가 source report의 회의록 또는 딜에 연결되어 있는지 확인한다.
4. channel별 연결 상태를 확인한다.
5. AI provider로 선택한 channel draft만 생성한다.
6. transaction 안에서 message, target, provider call log를 저장한다.

### Transaction

- 필요 여부: 필요
- 이유: message와 target, provider call log 상태를 함께 저장한다.
- 외부 Provider 호출 위치: transaction 밖

### Observability

- log event key: `followUp.draft.created`
- redaction: draft body structured log 금지

## 9. PATCH /api/follow-up-messages/:messageId

- API 이름: follow-up draft 수정 API
- API 식별자: `UpdateFollowUpMessageDraft`
- Method: `PATCH`
- Path: `/api/follow-up-messages/:messageId`
- Request 이름: `UpdateFollowUpMessageDraftRequest`
- Response 이름: `FollowUpMessageDetailResponse`
- Status: `200 OK`

### Request

Body:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `subject` | string | EMAIL 필수 | 이메일 제목. SMS에서는 null 또는 생략 |
| `body` | string | 예 | 이메일/SMS 본문 |
| `recipientContactId` | string | 선택 | 수신 담당자 변경 시 사용 |

### 에러

| 상황 | error code | HTTP |
|---|---|---:|
| SENT message 수정 | `FollowUpMessageAlreadySent` | 409 |
| SMS segment 초과 | `FollowUpSmsBodyTooLong` | 400 |

### Transaction

- 필요 여부: 필요
- 이유: compose draft 본문, 수신자 snapshot, preview를 함께 갱신한다.
- 외부 Provider 호출 위치: 없음

### Observability

- log event key: `followUp.message.updated`
- redaction: subject/body structured log 금지

## 9A. GET /api/follow-up-messages/:messageId

- API 이름: follow-up message 상세 조회 API
- API 식별자: `GetFollowUpMessageDetail`
- Method: `GET`
- Path: `/api/follow-up-messages/:messageId`
- Request 이름: `GetFollowUpMessageDetailRequest`
- Response 이름: `FollowUpMessageDetailResponse`
- Status: `200 OK`

### Response

```json
{
  "id": "message-id",
  "channel": "EMAIL",
  "status": "SENT",
  "languageTag": "ko-KR",
  "recipient": {
    "contactId": "contact-id",
    "name": "김민수",
    "email": "minsu@example.com",
    "phoneE164Masked": "+82******5678"
  },
  "subject": "견적 검토 follow-up",
  "body": "지난 미팅에서 논의한 견적 검토 건 확인 부탁드려요.",
  "sentAt": "2026-07-24T05:05:00.000Z",
  "targets": [
    {
      "targetType": "DEAL",
      "targetId": "deal-id",
      "targetPath": "/app/deals/deal-id",
      "targetLabel": "하반기 CRM 도입"
    }
  ]
}
```

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `followUp.message.detailViewed`
- redaction: response에는 본문을 반환하지만 structured log에는 본문을 남기지 않는다.

## 10. POST /api/follow-up-messages/:messageId/send

- API 이름: follow-up 즉시 발송 API
- API 식별자: `SendFollowUpMessage`
- Method: `POST`
- Path: `/api/follow-up-messages/:messageId/send`
- Request 이름: `SendFollowUpMessageRequest`
- Response 이름: `FollowUpMessageDetailResponse`
- Status: `202 Accepted`

### 비즈니스 로직

1. message ownership을 확인한다.
2. message status가 `DRAFT` 또는 retry 가능한 `FAILED`인지 확인한다.
3. 첫 발송 안내 확인 여부를 확인한다.
4. sender connection 또는 SMS sender number가 유효한지 확인한다.
5. transaction 안에서 message를 `SENDING`으로 바꾸고 `FollowUpDeliveryAttempt`를 만든다.
6. transaction 밖에서 provider를 호출한다.
7. 성공 시 message/attempt를 `SENT`로 갱신한다.
8. 실패 시 message/attempt를 `FAILED`로 갱신하고 safe error를 저장한다.

### Response

```json
{
  "id": "message-id",
  "status": "SENT",
  "channel": "EMAIL",
  "sentAt": "2026-07-24T05:05:00.000Z",
  "safeErrorCode": null,
  "safeErrorMessage": null
}
```

### 에러

| 상황 | error code | HTTP | FE 처리 |
|---|---|---:|---|
| 첫 발송 안내 미확인 | `FollowUpConsentNoticeRequired` | 409 | 안내 dialog 표시 |
| 연결 만료 | `FollowUpEmailReconnectRequired` | 409 | 설정으로 이동 |
| SMS 발신번호 미인증 | `FollowUpSmsSenderNotVerified` | 409 | 인증 화면으로 이동 |
| invalid recipient | `FollowUpInvalidRecipient` | 400 | 수신자 수정 |

## 11. POST /api/follow-up-messages/:messageId/retry

- API 이름: follow-up 발송 재시도 API
- API 식별자: `RetryFollowUpMessage`
- Method: `POST`
- Path: `/api/follow-up-messages/:messageId/retry`
- Request 이름: `RetryFollowUpMessageRequest`
- Response 이름: `FollowUpMessageDetailResponse`
- Status: `202 Accepted`

### 조건

- message status는 `FAILED`여야 한다.
- 마지막 실패가 `retryable=true`이거나 사용자가 connection/sender 문제를 해결한 뒤여야 한다.

### Transaction

- 필요 여부: 필요
- 이유: message를 SENDING으로 전환하고 새 delivery attempt를 만든다.
- 외부 Provider 호출 위치: transaction 밖

### Observability

- log event key: `followUp.message.retryRequested`
- redaction: subject/body structured log 금지

## 12. GET /api/follow-up-messages

- API 이름: follow-up 발송 이력 조회 API
- API 식별자: `ListFollowUpMessages`
- Method: `GET`
- Path: `/api/follow-up-messages`
- Request 이름: `ListFollowUpMessagesQuery`
- Response 이름: `FollowUpMessageListResponse`
- Status: `200 OK`

### Request

Query:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `sourceReportId` | string | 선택 | AI report 기준 이력 조회 |
| `targetType` | string | 선택 | `DEAL`, `CONTACT`, `MEETING_NOTE`, `SCHEDULE` |
| `targetId` | string | 선택 | target record ID |
| `page` | number | 선택 | page-number pagination |

### Response

```json
{
  "items": [
    {
      "id": "message-id",
      "channel": "EMAIL",
      "status": "SENT",
      "recipientName": "김민수",
      "recipientContactId": "contact-id",
      "subject": "견적 검토 follow-up",
      "bodyPreview": "지난 미팅에서 논의한 견적 검토 건...",
      "sentAt": "2026-07-24T05:05:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 15,
  "totalCount": 1,
  "totalPages": 1
}
```

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `followUp.messages.listViewed`
- redaction: 목록은 preview만 반환한다. detail API에서만 본문 전체를 반환한다.
