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
| `meetingLocalDateTime` | string | N | 사용자가 입력한 회의 현지 시간 |
| `companies` | JSON array string | N | 관련 회사 후보 |
| `contacts` | JSON array string | N | 관련 연락처 후보 |
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
  transcript?: string | null;
  summary?: string | null;
  details?: string | null;
  nextPlan?: string | null;
  requiredAction?: string | null;
  raw?: unknown;
};
```

FE 표시 규칙:

- 사용자가 검토/수정할 초안 필드만 화면에 표시한다.
- provider raw response가 포함되어 있더라도 사용자 화면, local draft, analytics payload에 저장하지 않는다.
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
