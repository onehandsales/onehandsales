# Meeting Note AI Draft Log API

상태: Implemented
확정일: 2026-07-26
구현 확인일: 2026-07-26

## 1. 목적

사용자가 회의 원문 텍스트 또는 음성 파일로 회의록 초안을 만들 때, 저장 가능한 회의록 필드만 반환하고 AI provider 호출 이력은 공통 `AiProviderCallLog`에 남긴다.

이 API의 제품 가치는 내부 로그가 아니라 사용자가 회의 직후 기록 부담을 줄이고 다음 행동을 빠르게 정리하는 것이다. Provider log는 Global B2C 운영에서 비용, 지연, 실패율을 추적하기 위한 기반이다.

## 2. 기존 API 유지

| Method | Path | 목적 | 상태 |
|---|---|---|---|
| `POST` | `/api/meeting-notes/ai-draft` | 텍스트 원문 기반 회의록 초안 생성 | 기존 API 확장 |
| `POST` | `/api/meeting-notes/stt-draft` | 음성 STT 후 회의록 초안 생성 | 기존 API 확장 |

User Web은 `/api/*`만 호출한다. `/admin/api/*`는 07 범위에서 만들지 않는다.

## 3. Text AI Draft Request

```http
POST /api/meeting-notes/ai-draft
Content-Type: application/json
Authorization: Bearer <accessToken>
```

```json
{
  "meetingLocalDateTime": "2026-07-26T14:30",
  "companies": ["2d44c5a7-6ed4-4e67-b6d7-7f7f8dc5e0b1"],
  "contacts": ["92a57c9d-5413-4745-b1f8-bf8ac70a80d6"],
  "products": ["6ba04c95-ec63-4bff-8852-55c7fbf4c3d3"],
  "deals": ["39d8c871-72e9-43c6-91cb-ec534de3df71"],
  "text": "오늘 미팅에서 고객은 8월 초 도입 가능성을 확인했고, 가격표와 보안 자료를 요청했다."
}
```

Request 규칙:

- `meetingLocalDateTime`: 현재 MeetingNote API와 동일한 local datetime 문자열
- `companies`: 필수, 최소 1개, 현재 사용자 소유 회사 UUID
- `contacts`: 필수, 최소 1개, 현재 사용자 소유 담당자 UUID
- `products`: 선택, 현재 사용자 소유 제품 UUID
- `deals`: 선택, 현재 사용자 소유 딜 UUID
- `text`: 필수, 최대 60,000자

## 4. Text AI Draft Response

```json
{
  "sourceType": "TEXT_AI",
  "transcript": null,
  "details": "고객은 8월 초 도입 가능성을 확인했고 가격표와 보안 자료를 요청했다.",
  "nextPlan": "가격표와 보안 자료를 전달한 뒤 다음 미팅 일정을 조율한다.",
  "requiredAction": "가격표와 보안 자료 보내기"
}
```

Response 규칙:

- `sourceType`: `TEXT_AI`
- `transcript`: 항상 `null`
- `details`, `nextPlan`, `requiredAction`: 사용자가 저장 전에 수정할 수 있는 초안
- Provider request id, token, cost, latency는 사용자 응답에 포함하지 않는다.

## 5. STT Draft Request

```http
POST /api/meeting-notes/stt-draft
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

Form fields:

```text
audio=<File>
meetingLocalDateTime=2026-07-26T14:30
companies=2d44c5a7-6ed4-4e67-b6d7-7f7f8dc5e0b1
contacts=92a57c9d-5413-4745-b1f8-bf8ac70a80d6
products=6ba04c95-ec63-4bff-8852-55c7fbf4c3d3
deals=39d8c871-72e9-43c6-91cb-ec534de3df71
```

Request 규칙:

- `audio`: 필수, 최대 25MB
- 허용 MIME type은 현재 `MeetingNoteAiDraftApplicationService`의 `ALLOWED_AUDIO_MIME_TYPES` 기준을 따른다.
- 배열 field는 반복 field 또는 comma-separated field를 허용한다.
- 선택 맥락의 ownership 검증은 text draft와 동일하다.

## 6. STT Draft Response

```json
{
  "sourceType": "STT_AI",
  "transcript": "고객은 8월 초 도입 가능성을 확인했고 가격표와 보안 자료를 요청했습니다.",
  "details": "고객은 8월 초 도입 가능성을 확인했고 가격표와 보안 자료를 요청했다.",
  "nextPlan": "가격표와 보안 자료를 전달한 뒤 다음 미팅 일정을 조율한다.",
  "requiredAction": "가격표와 보안 자료 보내기"
}
```

Response 규칙:

- `sourceType`: `STT_AI`
- `transcript`: 화면에서 임시 확인용으로만 사용한다.
- 사용자가 회의록을 저장해도 `transcript` 전문은 DB에 저장하지 않는다.
- 사용자가 필요한 문장만 `details`, `nextPlan`, `requiredAction`에 남기는 구조다.

## 7. Safe Failure Response

기존 전역 오류 응답 형식과 호환한다.

```json
{
  "statusCode": 502,
  "error": "MeetingNoteAiDraftFailed",
  "message": "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.",
  "retryable": true
}
```

오류 규칙:

- 사용자에게 provider 원문 오류, quota detail, prompt, 파일 원문을 노출하지 않는다.
- `MeetingNoteAiDraftProviderUnavailable`은 설정/운영 문제로 처리하고 사용자에게 안전 메시지만 노출한다.
- `MeetingNoteAiDraftFailed`는 provider 호출 실패 또는 응답 파싱 실패를 포괄한다.
- 현재 전역 필터 기준 `MeetingNoteAiDraftFailed`는 502, `MeetingNoteAiDraftProviderUnavailable`은 503이다.
- `retryable`은 FE가 다시 시도 버튼 노출 여부를 판단할 때만 사용한다.
- 전역 filter가 `retryable`을 바로 지원하지 않으면 07 구현에서 안전한 방법으로 확장한다.

## 8. 비즈니스 로직

Text AI draft:

1. AuthGuard로 현재 사용자를 확인한다.
2. `text`, `meetingLocalDateTime`, 선택 맥락 ID를 검증한다.
3. 회사/담당자/제품/딜이 현재 사용자 소유인지 확인한다.
4. Provider 호출 전 `AiProviderCallLog`를 `PENDING`으로 생성하거나 호출 직후 성공/실패를 원자적으로 기록할 수 있는 adapter를 둔다.
5. AI provider에 redacted prompt context만 전달한다.
6. 응답을 `details`, `nextPlan`, `requiredAction`으로 정규화한다.
7. `AiProviderCallLog`를 `SUCCEEDED` 또는 `FAILED`로 갱신한다.
8. 사용자 응답에는 회의록 초안 필드만 반환한다.

STT draft:

1. AuthGuard로 현재 사용자를 확인한다.
2. multipart 파일과 선택 맥락을 검증한다.
3. STT provider 호출을 `MEETING_NOTE_STT_TRANSCRIPTION` operation으로 기록한다.
4. STT transcript를 메모리에만 두고 DB에는 저장하지 않는다.
5. transcript 기반 AI draft provider 호출을 `MEETING_NOTE_STT_DRAFT` operation으로 기록한다.
6. 응답에는 임시 확인용 `transcript`와 저장 가능한 초안 필드만 반환한다.

## 9. DB 기록 계약

`AiProviderOperation` enum 추가:

```prisma
enum AiProviderOperation {
  WEEKLY_SALES_REPORT
  FOLLOW_UP_EMAIL_DRAFT
  FOLLOW_UP_SMS_DRAFT
  MEETING_NOTE_TEXT_DRAFT
  MEETING_NOTE_STT_TRANSCRIPTION
  MEETING_NOTE_STT_DRAFT
  MEETING_NOTE_NEXT_ACTION_DRAFT
  MEETING_NOTE_FOLLOW_UP_DRAFT
}
```

`AiProviderCallLog` 확장:

```prisma
model AiProviderCallLog {
  targetType String?
  targetId   String? @db.Uuid

  @@index([userId, targetType, targetId, createdAt])
}
```

Meeting Note draft log metadata 예시:

```json
{
  "targetType": "MEETING_NOTE_DRAFT",
  "targetId": null,
  "feature": "meeting-note",
  "source": "create-dialog",
  "inputKind": "text",
  "contextCounts": {
    "companies": 1,
    "contacts": 1,
    "products": 1,
    "deals": 1
  }
}
```

STT log metadata 예시:

```json
{
  "targetType": "MEETING_NOTE_DRAFT",
  "targetId": null,
  "feature": "meeting-note",
  "source": "create-dialog",
  "inputKind": "audio",
  "audio": {
    "mimeType": "audio/webm",
    "sizeBucket": "10mb_25mb"
  }
}
```

금지:

- `text` 전문
- `transcript` 전문
- prompt 전문
- provider raw request/response
- API key, quota detail
- contact email/phone 전문

## 10. Transaction 기준

- Provider 호출 자체는 DB transaction 밖에서 수행한다.
- Provider call log의 `PENDING` 생성과 `SUCCEEDED/FAILED` 갱신은 짧은 DB write로 분리한다.
- 회의록 저장(`POST /api/meeting-notes`)은 기존 저장 API에서 사용자가 확인한 값만 저장한다.
- 기존 `MeetingNote.rawText` field는 07 AI/STT 원문 저장에 쓰지 않고 `null` 유지 정책을 따른다.
- `ai-draft`, `stt-draft`는 회의록 row를 생성하지 않는다.

## 11. Backend 구현 위치

후보 파일:

- `BE/src/modules/meeting-note/presentation/http/meeting-note.controller.ts`
- `BE/src/modules/meeting-note/presentation/http/dto/meeting-note-request.dto.ts`
- `BE/src/modules/meeting-note/application/services/meeting-note-ai-draft-application.service.ts`
- `BE/src/modules/meeting-note/application/ports/meeting-note-ai-draft.provider.ts`
- `BE/src/modules/meeting-note/application/ports/meeting-note-stt.provider.ts`
- `BE/src/modules/meeting-note/infrastructure/providers/openai-meeting-note-ai-draft.provider.ts`
- `BE/src/modules/meeting-note/infrastructure/providers/openai-meeting-note-stt.provider.ts`
- `BE/src/modules/sales-report/infrastructure/persistence/prisma-ai-weekly-sales-report.repository.ts`의 log 저장 패턴 참고

코드 작업 시 새 함수, 복잡한 분기, provider log 저장 경계에는 반드시 한글 주석을 추가한다.

## 12. Frontend 구현 위치

후보 파일:

- `FE/user-web/src/features/meeting-note/api/meeting-note-api.ts`
- `FE/user-web/src/features/meeting-note/types/meeting-note.ts`
- `FE/user-web/src/features/meeting-note/hooks/use-meeting-note-mutations.ts`
- `FE/user-web/src/features/meeting-note/components/meeting-note-create-dialog.tsx`

FE 규칙:

- STT transcript는 생성 모달 상태에만 둔다.
- 저장 API body에 transcript를 넣지 않는다.
- 오류 UI는 안전 메시지, 다시 시도, 직접 작성 유지 흐름을 제공한다.
- User Web에서 `/admin/api/*`를 호출하지 않는다.

## 13. G06 구현 확인

- Backend `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft` provider log와 safe failure test가 통과했다.
- User Web 생성 모달은 AI/STT 실패 시 안전 메시지와 retryable 다시 시도를 제공한다.
- STT transcript는 생성 모달의 임시 확인 영역에만 표시되고 저장 request body에는 포함되지 않는다.
- `pnpm run test -- meeting-note`, User Web `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e`, `pnpm run test:e2e:mobile`이 통과했다.

## 14. API_SPEC_TEMPLATE_NORMALIZATION G03 보강

판단: 현재 `MeetingNoteController`, `MeetingNoteAiDraftApplicationService`, provider call log repository, User Web `meeting-note-api.ts` 기준으로 템플릿 누락 항목만 보강한다. API 계약 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 기존 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`를 provider log로 확장한 구현 이력이다. 현재 path/method/request/response 유지, breaking change 없음
- 인증: User `AuthGuard`
- 권한: 현재 로그인한 사용자 소유 회사/담당자/제품/딜 context만 초안 생성 입력으로 허용한다.

| API 이름 | API 식별자 | Request 이름 | Response 이름 |
|---|---|---|---|
| 회의록 텍스트 AI 초안 생성 API | `CreateMeetingNoteTextAiDraft` | `CreateMeetingNoteTextAiDraftDto` | `MeetingNoteAiDraftResponse` |
| 회의록 음성 STT+AI 초안 생성 API | `CreateMeetingNoteSttAiDraft` | `CreateMeetingNoteSttAiDraftDto` + multipart `audio` | `MeetingNoteAiDraftResponse` |

Error FE 처리/log level:

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 로그인/토큰 갱신 흐름 | warn |
| context validation 실패 | 400 | form field error 또는 선택값 정리 | warn |
| 본인 소유가 아닌 context | 404 | 선택값 새로고침 안내 | warn |
| 오디오 크기 초과 | 413 | 파일 교체 안내, 직접 작성 유지 | warn |
| AI/STT provider 실패 | 502/503 | 안전 메시지와 retry 제공 | error |

Transaction:

- 업무 data transaction 없음. 초안 API는 `MeetingNote` row를 생성하지 않는다.
- `AiProviderCallLog`는 provider 호출 전 `PENDING`, 성공/실패 후 `SUCCEEDED`/`FAILED`로 짧게 갱신한다.
- 외부 Provider 호출은 DB transaction 밖에서 수행한다.

Observability:

- provider call log operation: `MEETING_NOTE_TEXT_DRAFT`, `MEETING_NOTE_STT_TRANSCRIPTION`, `MEETING_NOTE_STT_DRAFT`
- audit log: 없음
- request id: 기존 middleware 기준 사용
- redaction: text/transcript/audio/prompt/provider raw request/response/contact email/phone 원문 logging 금지
- provider error context: provider, model, operation, latency, retryable, safe error code만 허용

FE/BE 처리 기준:

- FE는 초안 응답의 `transcript`를 임시 확인용으로만 쓰고 저장 body에 포함하지 않는다.
- FE는 provider 실패 시 사용자가 직접 작성으로 이어갈 수 있게 기존 입력 상태를 유지한다.
- BE는 provider raw response를 사용자 응답이나 업무 table에 포함하지 않는다.
