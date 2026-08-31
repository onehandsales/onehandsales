# MeetingNote Mobile Recording STT Contract

상태: Confirmed

## 1. 목적

모바일 브라우저에서 회의 직후 음성을 녹음하거나 오디오 파일을 업로드해 기존 STT draft API로 회의록 초안을 생성한다.

## 2. Consumer

- Frontend: User Web mobile browser
- Backend: MeetingNote module
- DB: `AiProviderCallLog`, 기존 MeetingNote 저장 flow
- Analytics: mobile recording client events

## 3. Request

`POST /api/meeting-notes/stt-draft`

Content-Type: `multipart/form-data`

Headers:

| 이름 | 필수 | 설명 |
|---|---:|---|
| `Authorization` | Y | 사용자 JWT/session 기반 인증 |

Form fields:

| 이름 | 타입 | 필수 | 제약 |
|---|---|---:|---|
| `audio` | file | Y | max 25MB, `audio/*` 중 backend/provider 지원 가능 형식 |
| `meetingLocalDateTime` | string | Y | 사용자가 입력한 회의 현지 시간 |
| `companies` | JSON array string | Y | 관련 회사 후보. current DTO는 최소 1개를 요구한다. |
| `contacts` | JSON array string | Y | 관련 연락처 후보. current DTO는 최소 1개를 요구한다. |
| `products` | JSON array string | N | 관련 상품 후보 |
| `deals` | JSON array string | N | 관련 deal 후보 |

Mobile FE recording:

- `MediaRecorder` 사용
- 권장 MIME 우선순위: `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav`, `audio/ogg`
- browser recording 불가 또는 권한 거부 시 audio file upload fallback 제공
- 녹음 원본은 local draft에 저장하지 않는다.

## 4. Response

성공 status: `201 Created`

DTO: `MeetingNoteAiDraftResponse`

```ts
type MeetingNoteAiDraftResponse = {
  sourceType: "STT_AI";
  transcript: string | null;
  details: string;
  nextPlan: string | null;
  requiredAction: string | null;
};
```

FE 표시 규칙:

- 사용자가 검토/수정할 초안 필드만 화면에 표시한다.
- provider raw response는 응답에 포함하지 않고 사용자 화면, local draft, analytics payload에 저장하지 않는다.
- 초안 저장은 기존 MeetingNote create/update flow에서 사용자가 명시적으로 저장할 때만 수행한다.

## 5. Safe Error Codes

| code | HTTP status | retryable | 처리 |
|---|---:|---:|---|
| `AUDIO_REQUIRED` | 400 | true | 녹음 또는 파일 선택 안내 |
| `AUDIO_TYPE_UNSUPPORTED` | 400 | true | 다른 오디오 파일 선택 |
| `AUDIO_TOO_LARGE` | 413 | true | 25MB 이하 파일 안내 |
| `AUDIO_RECORDING_PERMISSION_DENIED` | FE-only | true | 파일 업로드 fallback 안내 |
| `AUDIO_RECORDING_NOT_SUPPORTED` | FE-only | true | 파일 업로드 fallback 안내 |
| `STT_PROVIDER_UNAVAILABLE` | 502 | true | 잠시 후 재시도 또는 직접 입력 |
| `STT_TRANSCRIPTION_FAILED` | 422 | true | 다시 녹음/파일 교체 |
| `AI_DRAFT_FAILED` | 502 | true | transcript가 있으면 직접 정리, 없으면 재시도 |

## 6. Backend Business Logic

1. 인증된 사용자 기준으로 audio file과 context fields를 검증한다.
2. audio file은 provider 처리에 필요한 범위에서만 사용하고 DB에 binary로 저장하지 않는다.
3. STT provider 호출과 AI draft 생성은 기존 MeetingNote application flow를 사용한다.
4. `AiProviderCallLog`에는 provider, model, operation, token/cost, safe error를 남긴다.
5. MeetingNote row는 사용자가 초안을 확인하고 저장하기 전까지 생성하지 않는다.
6. provider raw response/prompt/transcript debug text는 user response, analytics payload, FE log에 넣지 않는다.

## 7. DB/Prisma

신규 DB model을 만들지 않는다.

사용하는 기존 model:

- `AiProviderCallLog`
- MeetingNote 저장 시 기존 MeetingNote 관련 model

저장하지 않는 것:

- audio binary
- browser recording blob
- local draft
- provider raw response
- provider raw error

## 8. Transaction

- provider 호출은 DB transaction 내부에 넣지 않는다.
- provider call log 저장 실패는 user draft 생성 성공을 막지 않는 방향으로 처리한다.
- MeetingNote 최종 저장 transaction은 기존 create/update API 계약을 따른다.

## 9. Observability

Backend log context:

- `requestId`
- `userId`
- `operation`
- `provider`
- `model`
- `safeErrorCode`
- `retryable`

금지:

- audio binary
- transcript 전문
- prompt
- provider raw response/error
- company/contact raw text payload

## 10. User Flow

1. 사용자가 모바일 회의록 작성 화면에서 녹음 버튼을 누른다.
2. browser microphone permission prompt는 사용자의 클릭 이후에만 발생한다.
3. 녹음 중에는 시간, 정지, 취소 상태를 명확히 보여준다.
4. 정지 후 `초안 만들기`를 누르면 `audio` file/blob를 API로 전송한다.
5. 권한 거부/미지원이면 같은 화면에서 파일 업로드 fallback을 제공한다.
6. API 성공 시 초안 form을 채우고 24h local draft를 시작한다.
7. 사용자가 저장하면 local draft를 삭제한다.

## 11. Tests

Backend:

- audio missing/type/size validation
- provider success response mapping
- provider failure safe error mapping
- provider raw detail 미노출
- `AiProviderCallLog` safe error 저장

Frontend:

- `MediaRecorder` 지원/미지원 분기
- permission denied fallback
- recording start/stop/cancel state
- STT draft submit loading/error state
- 360px/390px viewport overflow 없음

E2E:

- mobile viewport에서 audio upload fallback으로 초안 생성
- recording unsupported mock에서 파일 업로드 CTA 노출

## 12. API_SPEC_TEMPLATE_NORMALIZATION G04 보강

판단: 이 문서는 현재 구현된 STT draft HTTP API와 모바일 브라우저 녹음 UX/local draft 계약이 함께 들어 있는 보관 문서다. 서버 HTTP API는 `POST /api/meeting-notes/stt-draft` 1개이며, `MediaRecorder`, microphone permission, browser recording blob, file upload fallback, local draft는 서버 API 없음 범위로 분리한다. API path, method, request/response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web mobile browser
- 호환성: 기존 `/api/meeting-notes/stt-draft` 계약 유지. breaking change 없음
- 인증: User `AuthGuard`
- 권한: 현재 로그인한 사용자 소유 회사/담당자/제품/딜 ID만 STT draft context로 허용한다.

서버 API 없음:

- `MediaRecorder` 지원/미지원 판정, microphone permission prompt, 녹음 시작/정지/취소 상태는 browser-only UX 계약이다.
- `AUDIO_RECORDING_PERMISSION_DENIED`, `AUDIO_RECORDING_NOT_SUPPORTED`는 FE-only error이며 Backend HTTP error code가 아니다.
- 녹음 blob/audio file은 draft payload나 DB에 저장하지 않고 multipart upload 요청에만 사용한다.
- 회의록 local draft는 `LOCAL_DRAFT_CONTRACT.md`의 IndexedDB/localStorage 계약을 따르며 서버 draft API를 만들지 않는다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 모바일 회의록 음성 STT+AI 초안 생성 API | `CreateMeetingNoteSttAiDraft` | `POST` | `/api/meeting-notes/stt-draft` | `CreateMeetingNoteSttAiDraftDto` + multipart `audio` | `MeetingNoteAiDraftResponse` / FE `MeetingNoteAiDraftResponse` |

현재 구현 기준 Request 필드:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `audio` | file | 필수 | multipart field. 최대 25MB. `audio/*` 또는 허용 MIME |
| `meetingLocalDateTime` | string | 필수 | 사용자가 입력한 local date-time |
| `companies` | string[] | 필수 | UUID 배열. 최소 1개 |
| `contacts` | string[] | 필수 | UUID 배열. 최소 1개 |
| `products` | string[] | 선택 | UUID 배열 |
| `deals` | string[] | 선택 | UUID 배열 |

Error FE 처리/log level:

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 로그인/토큰 갱신 흐름 | warn |
| audio 누락 또는 body validation 실패 | 400 | 파일 선택 안내 또는 form field error | warn |
| audio 크기 초과 | 413 | 25MB 이하 파일 교체 안내 | warn |
| 선택 리소스가 없거나 타 사용자 소유 | 404 | 선택값 새로고침 안내 | warn |
| provider 설정/호출 실패 | 502/503 | 안전 메시지와 재시도 또는 직접 작성 유지 | error |

Transaction:

- STT draft API는 최종 `MeetingNote` row를 만들지 않으므로 업무 data transaction 없음.
- STT provider와 AI draft provider 호출은 업무 DB transaction 밖에서 수행한다.
- `AiProviderCallLog`는 `MEETING_NOTE_STT_TRANSCRIPTION`, `MEETING_NOTE_STT_DRAFT` operation으로 짧은 create/update write만 수행한다.
- 최종 회의록 저장은 기존 `POST /api/meeting-notes` 계약의 transaction을 따른다.

Observability:

- provider call log operation: `MEETING_NOTE_STT_TRANSCRIPTION`, `MEETING_NOTE_STT_DRAFT`
- provider failure event: `provider.openai.meetingNoteStt.failed`, `provider.openai.meetingNoteDraft.failed`
- analytics event: `meeting_note_recording_started`, `meeting_note_recording_completed`, `meeting_note_recording_failed`
- audit log: 없음
- request id: 기존 middleware 기준 사용
- redaction: audio binary, transcript 전문, prompt, provider raw response/error, 회사/담당자 raw text payload logging 금지

FE/BE 처리 기준:

- FE는 `audioFile`, `meetingLocalDateTime`, 선택 context만 `FormData`로 전송하고 녹음 원본을 local draft에 저장하지 않는다.
- FE는 초안 응답을 사용자가 검토할 form field에만 반영하고, 저장 전까지 업무 row 생성을 기대하지 않는다.
- BE는 선택 context ownership을 검증한 뒤 provider를 호출하고, raw audio/provider response를 업무 DB row나 응답에 저장하지 않는다.
