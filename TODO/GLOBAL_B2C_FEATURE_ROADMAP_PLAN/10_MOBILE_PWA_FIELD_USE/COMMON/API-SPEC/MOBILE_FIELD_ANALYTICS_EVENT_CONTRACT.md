# Mobile Field Analytics Event Contract

상태: Confirmed

## 1. 목적

09 Product Analytics 기반 위에 모바일 현장 입력 품질을 운영 관점에서 파악하기 위한 최소 이벤트를 추가한다. 모바일 필요성을 검증하는 용도가 아니라 필수 모바일 경험의 품질을 점검하는 용도다.

## 2. API

기존 09 API 재사용.

`POST /api/analytics/events`

Content-Type: `application/json`

## 3. Request

```ts
type ProductAnalyticsClientEventRequest = {
  eventName: MobileFieldClientEventName;
  eventVersion: 1;
  occurredAt?: string;
  targetType?: "BUSINESS_CARD_SCAN" | "MEETING_NOTE" | "USER";
  targetId?: string;
  payload?: Record<string, unknown>;
};
```

Client가 보내지 않는 값:

- `userId`
- `organizationId`
- `eventDate`
- `source`
- `deviceId`

Backend가 인증 context와 timezone 정책으로 보정한다.

## 4. Response

성공 status: `202 Accepted`

```json
{
  "accepted": true
}
```

Analytics 실패는 사용자 작업 성공 UX를 막지 않는다.

## 5. Client Event Allowlist

| eventName | targetType | 목적 |
|---|---|---|
| `business_card_capture_started` | `BUSINESS_CARD_SCAN` optional | 촬영/파일 선택 시작 |
| `business_card_capture_retried` | `BUSINESS_CARD_SCAN` optional | OCR 실패 후 재시도 |
| `meeting_note_recording_started` | `MEETING_NOTE` optional | 녹음 시작 |
| `meeting_note_recording_completed` | `MEETING_NOTE` optional | 녹음 종료 |
| `meeting_note_recording_failed` | `MEETING_NOTE` optional | 권한/지원/녹음 오류 |
| `local_draft_saved` | `USER` | local draft 저장 |
| `local_draft_restored` | `USER` | local draft 복구 |
| `local_draft_discarded` | `USER` | local draft 폐기 |
| `mobile_push_permission_prompt_opened` | `USER` | 권한 안내 시작 |
| `mobile_push_permission_result` | `USER` | 권한 결과 |

## 6. Server Event

Backend internal recorder:

```ts
type BusinessCardOcrFailedServerEvent = {
  eventName: "business_card_ocr_failed";
  eventVersion: 1;
  source: "SERVER";
  targetType: "BUSINESS_CARD_SCAN";
  targetId: string;
  payload: {
    safeErrorCode: string;
    retryable: boolean;
    provider?: string;
    model?: string;
    fileSizeBucket?: "0_1mb" | "1_5mb" | "5_10mb" | "over_10mb" | "unknown";
  };
};
```

## 7. Payload Rules

Allowed payload examples:

```json
{
  "draftType": "BUSINESS_CARD_CONFIRM",
  "permissionState": "denied",
  "durationBucket": "30_120s",
  "safeErrorCode": "OCR_PARSE_FAILED"
}
```

Forbidden keys:

- `name`
- `email`
- `phone`
- `companyName`
- `contactName`
- `memo`
- `details`
- `transcript`
- `audio`
- `image`
- `prompt`
- `rawResponse`
- `endpoint`
- `p256dh`
- `auth`
- `token`

## 8. Backend Business Logic

1. eventName allowlist를 확장한다.
2. 인증된 user context로 `userId`를 설정한다.
3. `occurredAt` 미전달 시 server now를 사용한다.
4. `eventDate`는 09 timezone 정책을 따른다.
5. payload 금지 key를 validation에서 차단한다.
6. analytics 저장 실패는 warning log만 남기고 사용자 action을 rollback하지 않는다.

## 9. DB/Prisma

기존 `ProductAnalyticsEvent` 사용.

신규 migration 없음.

주의:

- eventName은 string이므로 신규 enum migration이 필요 없다.
- payloadJson에는 PII/raw text를 넣지 않는다.

## 10. User Flow

- 이벤트 전송은 fire-and-forget이다.
- network failure가 form submit, recording, upload, permission UX를 막지 않는다.
- dev/test에서 analytics disabled면 client는 no-op 또는 mock으로 처리한다.

## 11. Tests

Backend:

- allowlist 신규 event acceptance
- forbidden payload key rejection
- server event `business_card_ocr_failed` record
- analytics failure non-blocking

Frontend:

- 이벤트 helper가 금지 payload를 보내지 않음
- analytics failure가 UX를 막지 않음
- recording/capture/draft/permission 주요 지점에서 이벤트 호출
