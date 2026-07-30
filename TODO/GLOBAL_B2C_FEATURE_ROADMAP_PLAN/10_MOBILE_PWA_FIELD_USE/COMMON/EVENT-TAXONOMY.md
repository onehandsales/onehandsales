# Event Taxonomy

상태: Confirmed

## 1. 원칙

10번 event는 모바일 필수 기능의 품질 개선과 운영 판단을 위한 최소 event다. 모바일이 필요한지 검증하기 위한 event가 아니다.

공통 규칙:

- event name은 `snake_case`다.
- `eventVersion`은 1부터 시작한다.
- client event는 `POST /api/analytics/events`를 사용한다.
- server event는 09 `ProductAnalyticsEventRecorder`를 사용한다.
- client는 userId/sessionId/deviceId/source/time/target/idempotencyKey를 보내지 않는다.
- payload는 event별 allowlist schema만 허용한다.
- PII, raw text, image/audio blob, transcript, OCR raw text, provider raw response는 payload 금지다.

## 2. Client event

| eventName | 목적 | payload |
|---|---|---|
| `business_card_capture_started` | 명함 촬영/선택 흐름 시작 | `{ "entryPoint": "business_cards", "captureMode": "camera" | "library" | "unknown" }` |
| `business_card_capture_retried` | 다시 촬영/파일 바꾸기 | `{ "reason": "ocr_failed" | "user_replace" | "quality_hint" | "unknown" }` |
| `meeting_note_recording_started` | 녹음 시작 | `{ "entryPoint": "meeting_note_create" }` |
| `meeting_note_recording_completed` | 녹음 완료 | `{ "durationBucket": "under_1m" | "1m_5m" | "5m_15m" | "over_15m" }` |
| `meeting_note_recording_failed` | 녹음 권한/미지원/오류 | `{ "reason": "permission_denied" | "unsupported" | "interrupted" | "unknown" }` |
| `local_draft_saved` | local draft 저장 | `{ "draftType": "business_card_confirm" | "meeting_note_create" }` |
| `local_draft_restored` | local draft 복원 | `{ "draftType": "business_card_confirm" | "meeting_note_create" }` |
| `local_draft_discarded` | local draft 폐기 | `{ "draftType": "business_card_confirm" | "meeting_note_create", "reason": "user_discarded" | "expired" | "saved" }` |
| `mobile_push_permission_prompt_opened` | 사용자가 `푸시 알림 켜기` action을 눌러 권한 prompt를 열었다 | `{ "entryPoint": "notifications" | "settings" | "field_flow" }` |
| `mobile_push_permission_result` | browser permission 결과 | `{ "result": "granted" | "denied" | "default" | "unsupported" }` |

## 3. Server event

| eventName | 목적 | targetType | payload |
|---|---|---|---|
| `business_card_ocr_failed` | OCR 실패율/재시도 품질 판단 | `BUSINESS_CARD_SCAN` | `{ "errorCode": "<safe code>", "retryable": true | false }` |

## 4. BusinessCard safe error code

| errorCode | retryable 기본값 | 사용자 문구 기준 |
|---|---:|---|
| `IMAGE_REQUIRED` | true | 이미지를 선택해 달라고 안내 |
| `IMAGE_TYPE_UNSUPPORTED` | true | JPG, PNG, WebP 안내 |
| `IMAGE_TOO_LARGE` | true | 10MB 이하 이미지 안내 |
| `IMAGE_QUALITY_LOW` | true | 밝은 곳에서 다시 촬영 안내 |
| `OCR_PARSE_FAILED` | true | 다시 촬영/파일 바꾸기 안내 |
| `OCR_PROVIDER_UNAVAILABLE` | true | 잠시 후 다시 시도 안내 |
| `OCR_RATE_LIMITED` | true | 잠시 후 다시 시도 안내 |
| `OCR_UNKNOWN_FAILED` | true | 일반 재시도 안내 |

## 5. 금지 payload key

아래 key 또는 같은 의미의 변형은 client/server analytics payload에 넣지 않는다.

- `name`
- `companyName`
- `contactName`
- `phone`
- `mobile`
- `email`
- `memo`
- `privateMemo`
- `meetingBody`
- `details`
- `transcript`
- `ocrText`
- `imageFileName`
- `audioFileName`
- `providerResponse`
- `prompt`
- `token`
- `authorization`

## 6. 10에서 만들지 않는 event

- PWA install attribution event
- native app install event
- billing/paywall/churn event
- marketing campaign/UTM event
- full offline sync conflict event
- Admin analytics dashboard event
