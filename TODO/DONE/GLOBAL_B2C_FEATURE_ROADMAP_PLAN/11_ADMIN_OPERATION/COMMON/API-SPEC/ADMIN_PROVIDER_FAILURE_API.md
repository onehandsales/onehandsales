# Admin Provider Failure API

상태: Implemented
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
| `featureArea` | string | no | `AI_WEEKLY_REPORT`, `FOLLOW_UP`, `MEETING_NOTE`, `BUSINESS_CARD_SCAN`, `NOTIFICATION`, `CALENDAR_SYNC` |
| `status` | string | no | `FAILED`, `RETRYABLE`, `ALL` |
| `retryable` | boolean string | no | `true`, `false` |
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

Response field note:

- `status`: `FAILED`, `PENDING`, `CANCELED`

Business Logic:

1. 기존 safe provider log source를 union read model로 조회한다.
2. source별 ID는 `SOURCE:id` opaque string으로 만든다.
3. safe error field만 반환한다.
4. provider raw response, prompt, token, quota detail은 조회하지 않는다.
5. browser push failure라도 endpointHash, endpointCiphertext, p256dh/auth ciphertext, userAgent 원문은 조회하지 않는다.
6. 목록 조회 audit를 남긴다.
7. `AiProviderCallLog`의 `MEETING_NOTE_STT_TRANSCRIPTION`은 `providerType=STT`, 그 외 AI draft/report 호출은 `providerType=AI`로 normalize한다.
8. `CALENDAR` 상세 ID는 source 구분을 위해 `CALENDAR_CONNECTION:id`, `CALENDAR_SOURCE:id`를 사용한다.

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

Transaction: 목록/상세 조회와 audit 기록을 같은 application transaction 안에서 처리한다.

Observability:

- audit log: `ADMIN_PROVIDER_FAILURE_VIEW`
- redaction: provider raw/prompt/token/quota detail 금지, browser push endpoint/key/userAgent 원문 금지
- audit metadata: source prefix, provider type, source model, feature area, status, retryable, safe error code만 저장한다.

## 3. API_SPEC_TEMPLATE_NORMALIZATION G05 보강

판단: 이 문서는 Admin Web 전용 provider 실패 운영 조회 API 보관 문서다. G05에서는 Method/Path/Request 이름, audit transaction, safe context, FE/BE 처리 기준을 현재 구현 기준으로 보강하며 raw provider data를 추가하지 않는다.

- 계약 상태: `implemented`
- 소비자: Admin Web
- 호환성: 기존 `/admin/api/provider-failures` GET 계열 계약 유지. breaking change 없음
- 권한: `AuthGuard` + `AdminGuard`, application service의 `assertAdmin`
- FE 호출 경계: `adminApiClient` 상대 경로 `/provider-failures`, `/provider-failures/:failureId`

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| Admin Provider 실패 목록 API | `ListAdminProviderFailures` | `GET` | `/admin/api/provider-failures` | `ListAdminProviderFailuresQueryDto` / FE `AdminProviderFailureListParams` | `AdminProviderFailureListResponse` |
| Admin Provider 실패 safe 상세 API | `GetAdminProviderFailureDetail` | `GET` | `/admin/api/provider-failures/:failureId` | path param `failureId` | `AdminProviderFailureDetailResponse` / FE `AdminProviderFailureDetail` |

연결된 DB 스키마:

- 조회: `AiProviderCallLog`, `BusinessCardScanLog`, `NotificationDeliveryAttempt`, `FollowUpDeliveryAttempt`, `ExternalCalendarConnection`, `ExternalCalendarSource`, `User`
- audit: `AdminAuditLog`

Transaction:

- 필요 여부: 필요. 목록/상세 safe 조회와 `AdminAuditLog` 생성을 같은 application transaction으로 묶는다.
- rollback 범위: provider failure 조회 audit log 생성. provider 원본 데이터는 수정하지 않는다.
- 외부 Provider: 없음. 저장된 실패 log/read model만 조회한다.

Observability:

- log event key: 별도 application log event 없음. audit action은 `ADMIN_PROVIDER_FAILURE_VIEW`
- audit log: 필수. 목록 metadata는 active filter key와 safe filter 값만 저장하고, 상세 metadata는 failureId prefix, providerType, sourceModel, featureArea, status, retryable, safeErrorCode만 저장한다.
- request id: controller에서 application metadata로 전달해 audit에 저장한다.
- masking: 사용자 이메일은 `userEmailMasked`로만 반환한다.
- redaction: provider raw response, prompt, token, quota detail, push endpoint/key/userAgent, calendarId/syncToken 원문은 response/log/audit metadata에 넣지 않는다.

Error FE 처리/log level:

| 상황 | code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| providerType/featureArea/status/retryable invalid | validation error | 400 | filter 값 초기화 또는 inline 오류 | warn |
| from/to invalid 또는 순서 오류 | validation error | 400 | 기간 filter 오류 안내 | warn |
| failureId 대상 없음 | `ADMIN_TARGET_NOT_FOUND` | 404 | 상세 panel 닫기 또는 not found 상태 표시 | warn |
| Admin 권한 없음 | `ADMIN_FORBIDDEN` | 403 | Admin shell 접근 차단 | warn |
| safe source 조회/audit 저장 실패 | 내부 오류 | 500 | 목록/상세 오류 상태와 재시도 제공 | error |

FE/BE 처리 기준:

- FE는 provider 실패 목록과 상세에서 `safeErrorCode`, `safeErrorMessage`, `safeContext`만 표시한다.
- BE는 `failureId` prefix로 source를 선택하고 safe select만 수행한다.
- raw provider payload가 필요한 별도 원문 조회 API는 G05 범위에 없으며 이 상세 response에 추가하지 않는다.
- `MEETING_NOTE_STT_TRANSCRIPTION`은 `providerType=STT`, 그 외 AI draft/report는 `providerType=AI`로 normalize한다.
