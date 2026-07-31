# Admin Provider Failure API

상태: Confirmed Planning
연결 Goal: G06
소비자: Admin Web

## 1. GET /admin/api/provider-failures

- API 이름: Admin Provider 실패 목록 API
- API 식별자: `ListAdminProviderFailures`
- Request: `ListAdminProviderFailuresQuery`
- Response: `AdminProviderFailureListResponse`
- Status: `200`

Query:

| Field | Type | Required | Validation |
|---|---|---|---|
| `providerType` | string | no | `AI`, `OCR`, `STT`, `CALENDAR`, `PUSH`, `EMAIL`, `SMS` |
| `status` | string | no | `FAILED`, `RETRYABLE`, `ALL` |
| `userId` | uuid | no | target user |
| `from` | ISO string | no | UTC |
| `to` | ISO string | no | UTC |
| `cursor` | string | no | opaque |
| `limit` | number | no | 1~100, default 50 |

Response:

```json
{
  "items": [
    {
      "id": "AI:ai-provider-call-log-id",
      "providerType": "AI",
      "sourceModel": "AiProviderCallLog",
      "userId": "user-id",
      "userEmailMasked": "lo***@example.com",
      "featureArea": "MEETING_NOTE",
      "operation": "MEETING_NOTE_STT_DRAFT",
      "targetType": "MEETING_NOTE_DRAFT",
      "targetId": null,
      "status": "FAILED",
      "safeErrorCode": "AI_PROVIDER_TIMEOUT",
      "safeErrorMessage": "AI 응답 시간이 초과됐어요",
      "retryable": true,
      "latencyMs": 12000,
      "requestId": "provider-request-id",
      "occurredAt": "2026-07-31T00:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

Business Logic:

1. 기존 safe provider log source를 union read model로 조회한다.
2. source별 ID는 `SOURCE:id` opaque string으로 만든다.
3. safe error field만 반환한다.
4. provider raw response, prompt, token, quota detail은 조회하지 않는다.
5. browser push failure라도 endpointHash, endpointCiphertext, p256dh/auth ciphertext, userAgent 원문은 조회하지 않는다.
6. 목록 조회 audit를 남긴다.

Source mapping:

| providerType | Source |
|---|---|
| AI/STT | `AiProviderCallLog` |
| OCR | `BusinessCardScanLog` |
| PUSH | `NotificationDeliveryAttempt` |
| EMAIL/SMS | `FollowUpDeliveryAttempt` |
| CALENDAR | `ExternalCalendarConnection`, `ExternalCalendarSource` safe sync error field |

## 2. GET /admin/api/provider-failures/:failureId

- API 이름: Admin Provider 실패 safe 상세 API
- API 식별자: `GetAdminProviderFailureDetail`
- Response: `AdminProviderFailureDetailResponse`
- Status: `200`

Response:

```json
{
  "id": "OCR:business-card-scan-log-id",
  "providerType": "OCR",
  "sourceModel": "BusinessCardScanLog",
  "userId": "user-id",
  "userEmailMasked": "lo***@example.com",
  "featureArea": "BUSINESS_CARD_SCAN",
  "operation": "OCR_SCAN",
  "targetType": "BUSINESS_CARD_SCAN",
  "targetId": "business-card-scan-log-id",
  "status": "FAILED",
  "safeErrorCode": "OCR_IMAGE_BLURRY",
  "safeErrorMessage": "이미지가 흐려서 읽기 어려워요",
  "retryable": true,
  "latencyMs": 3200,
  "requestId": null,
  "occurredAt": "2026-07-31T00:00:00.000Z",
  "safeContext": {
    "candidateCompanyName": "삼성전자",
    "candidateContactName": "김**",
    "imageStored": false
  }
}
```

Business Logic:

1. `failureId` prefix로 source를 선택한다.
2. source별 safe select를 수행한다.
3. 상세 조회 audit를 남긴다.
4. safeContext는 PII 최소화 기준으로만 넣는다.
5. PUSH safeContext에는 endpoint/key/userAgent 원문을 넣지 않는다.

Transaction: audit 기록 포함 시 transaction 후보.

Observability:

- audit log: `ADMIN_PROVIDER_FAILURE_VIEW`
- redaction: provider raw/prompt/token/quota detail 금지, browser push endpoint/key/userAgent 원문 금지
