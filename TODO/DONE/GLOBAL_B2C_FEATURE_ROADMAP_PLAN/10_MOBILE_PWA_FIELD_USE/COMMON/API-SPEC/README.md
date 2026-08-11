# API Spec

상태: Confirmed

## 1. 목적

10번 Mobile/PWA Field Use에서 구현자가 따라야 하는 User Web/Backend API 계약을 고정한다.

모바일은 사용성 검증 대상이 아니라 Global B2C 영업 사용자에게 필수 제품 표면이다. 10번은 native app을 만들기 전, 모바일 브라우저에서 현장 입력이 실제로 가능한 수준까지 명함 촬영, 회의 녹음, 임시 저장, 알림 권한 UX, 필드 사용성 이벤트를 완성한다.

## 2. Spec 파일

- `BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md`
- `MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md`
- `LOCAL_DRAFT_CONTRACT.md`
- `MOBILE_NOTIFICATION_PERMISSION_CONTRACT.md`
- `MOBILE_FIELD_ANALYTICS_EVENT_CONTRACT.md`

## 3. API 원칙

- 신규 API를 우선 만들지 않는다. 기존 API를 모바일 UX에 맞게 확장하거나 응답 계약을 명확히 한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- client body에서 `userId`, `organizationId`, `deviceId`를 신뢰하지 않는다.
- browser push 권한은 회원가입/약관 동의로 자동 허용된 것으로 간주하지 않는다.
- provider raw error, prompt, raw response, transcript raw debug text는 user response, analytics payload, FE log에 넣지 않는다.
- request/response의 시간 필드는 UTC ISO string을 기본으로 한다.
- 모든 goal 구현자는 API 변경 전후에 이 폴더의 관련 계약과 goal별 체크리스트를 확인해야 한다.

## 4. API 목록

| 구분 | Method | Path | 10번 처리 |
|---|---:|---|---|
| BusinessCard | `POST` | `/api/business-card-scans` | 기존 API 유지, 모바일 파일/카메라 입력과 safe OCR failure response 확정 |
| BusinessCard | `GET` | `/api/business-card-scans` | 기존 API 유지, `failure` nullable response 확장 |
| BusinessCard | `GET` | `/api/business-card-scans/:scanLogId` | 기존 API 유지, `failure` nullable response 확장 |
| BusinessCard | `POST` | `/api/business-card-scans/:scanLogId/confirm` | 기존 API 유지, 모바일 confirm flow와 local draft 연계 |
| MeetingNote | `POST` | `/api/meeting-notes/stt-draft` | 기존 API 유지, mobile `MediaRecorder` blob/file upload 계약 확정 |
| LocalDraft | 없음 | client local storage | DB/server draft 미생성, 24h TTL local draft 계약 확정 |
| Notification | `GET/PATCH` | `/api/notifications/settings` | 기존 API 유지, mobile permission UX와 service/marketing 분리 |
| Notification | `GET` | `/api/notifications/browser-push/public-key` | 기존 API 유지 |
| Notification | `POST` | `/api/notifications/browser-subscriptions` | 기존 API 유지, explicit click 이후에만 호출 |
| Notification | `DELETE` | `/api/notifications/browser-subscriptions/:subscriptionId` | 기존 API 유지 |
| Analytics | `POST` | `/api/analytics/events` | 09 API 재사용, 10 mobile field events allowlist 추가 |
| Analytics | 내부 | ProductAnalytics recorder | OCR failure server event 기록 |

## 5. 공통 Error Response

Backend가 HTTP error를 반환해야 하는 경우 safe error shape를 사용한다.

```json
{
  "code": "IMAGE_TYPE_UNSUPPORTED",
  "field": "image",
  "message": "지원하지 않는 이미지 형식입니다."
}
```

FE 처리 원칙:

- 사용자에게 provider/raw detail을 표시하지 않는다.
- retry 가능한 오류는 같은 화면에서 다시 촬영/재업로드할 수 있게 한다.
- API 실패가 local draft 저장을 막지 않도록 한다.
- analytics 전송 실패는 사용자 작업을 막지 않는다.

## 6. Observability

- request id를 backend log context에 포함한다.
- provider raw response, prompt, transcript, 명함 원문 이미지는 log에 넣지 않는다.
- retryable 여부와 safe error code는 운영 분석에 필요한 수준으로만 기록한다.
- local draft payload는 logging하지 않는다.

## 7. 코드 주석

Backend:

- controller endpoint: `// API : ...`
- class/interface: `// 역할 : ...`
- use case/service/repository/helper: `// 기능 : ...`

Frontend:

- component/hook/function/event handler/API client: `// 기능 : ...`

주석은 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에만 단다.
