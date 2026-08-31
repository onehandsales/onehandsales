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

## 12. API_SPEC_TEMPLATE_NORMALIZATION G04 보강

판단: 이 문서는 현재 구현된 analytics collector HTTP API와 모바일 field-use event taxonomy/server internal recorder 계약이 함께 들어 있는 보관 문서다. 서버 HTTP API는 `POST /api/analytics/events` 1개이며, `business_card_ocr_failed`는 Backend internal recorder event로 HTTP endpoint가 아니다. API path, method, request/response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web mobile browser
- 호환성: 기존 09 Product Analytics collector API 재사용. mobile field event allowlist 확장 외 breaking change 없음
- 인증: User `AuthGuard`
- 권한: client event는 현재 로그인한 사용자 본인 event만 수집한다. client가 `userId`, `organizationId`, `deviceId`를 보내면 거절한다.

서버 API 없음:

- `business_card_ocr_failed`는 Backend `ProductAnalyticsEventRecorder`가 기록하는 server event이며 User Web이 호출하는 HTTP API가 아니다.
- `trackMobileFieldAnalyticsEvent`는 FE fire-and-forget helper이며 별도 서버 API가 아니다.
- analytics 실패는 명함 촬영, 회의 녹음, local draft, permission UX를 rollback하지 않는다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 모바일 현장 사용 분석 이벤트 수집 API | `CollectProductAnalyticsEvent` | `POST` | `/api/analytics/events` | `CollectProductAnalyticsEventDto` / FE `TrackAnalyticsEventInput` | `CollectProductAnalyticsEventResponse` |

현재 구현 기준 Request 필드:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `eventName` | `ProductAnalyticsClientEventName` | 필수 | 09/10 client event allowlist 값 |
| `eventVersion` | number | 필수 | `1`만 허용 |
| `occurredAt` | string | 선택 | ISO datetime. 없으면 server now |
| `targetType` | `USER \| BUSINESS_CARD_SCAN \| MEETING_NOTE` | 선택 | event별 허용 target type만 가능 |
| `targetId` | string | 선택 | UUID. `targetType`이 있을 때만 사용 |
| `payload` | object | 필수 | event별 allowlist payload |

금지 request field:

- `userId`
- `organizationId`
- `authSessionId`
- `authDeviceId`
- `deviceId`
- `eventDate`
- `timeZone`
- `source`
- `idempotencyKey`

Error FE 처리/log level:

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 사용자 표시 없이 중단 | normal |
| eventName 미지원 | 400 | 사용자 표시 없음 | warn |
| eventVersion 미지원 | 400 | 사용자 표시 없음 | warn |
| targetType/targetId 불일치 | 400 | 사용자 표시 없음 | warn |
| payload schema 또는 금지 PII key 포함 | 400 | 사용자 표시 없음 | warn |

Transaction:

- 필요 여부: 없음
- 이유: `ProductAnalyticsEvent` 단건 insert이며 사용자 업무 mutation과 묶이지 않는다.
- rollback 범위: analytics event insert 단일 statement
- 외부 Provider: 없음
- server event `business_card_ocr_failed` 기록 실패는 OCR scan 사용자 응답을 rollback하지 않는다.

Observability:

- log event key: 실패 시 `analytics.event.collectFailed` 또는 exception filter
- audit log: 없음
- request id: collector use case로 전달
- redaction: payload 원문 dump, name/email/phone/company/contact/memo/details/transcript/audio/image/prompt/rawResponse/endpoint/p256dh/auth/token logging 금지
- provider error context: 없음

FE/BE 처리 기준:

- FE는 `TrackAnalyticsEventInput` allowlist type과 `trackMobileFieldAnalyticsEvent` helper로만 mobile field event를 전송한다.
- FE는 analytics 전송 실패를 화면 error로 표시하지 않는다.
- BE는 `currentUser.id`, session, timezone으로 user/source/date context를 보강하고 client 제공 식별자와 출처 field를 신뢰하지 않는다.
- BE는 mobile event별 target type과 payload schema를 allowlist로 검증한다.
