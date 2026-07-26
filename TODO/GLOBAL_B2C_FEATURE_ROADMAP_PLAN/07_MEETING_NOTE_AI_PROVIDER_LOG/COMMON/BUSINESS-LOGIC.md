# Business Logic

상태: Confirmed
확정일: 2026-07-26

## 1. 공통 원칙

AI는 사용자의 업무 데이터를 자동 변경하지 않는다. AI는 후보와 초안을 만들고, 사용자가 확인한 뒤 저장/복사/수정한다.

Provider log는 유료 제품 운영을 위한 기반이다. 사용자에게 provider 내부정보를 보여주기 위한 기능이 아니다.

## 2. Provider call log

기록 대상:

- 텍스트 AI 회의록 초안
- STT transcription
- STT transcript 기반 AI 회의록 초안
- 회의록 next action 후보 생성
- 회의록 follow-up 초안 생성

기록 필드:

- userId
- operation
- status
- targetType
- targetId
- provider
- model
- requestId
- latencyMs
- token count
- estimated cost
- safeErrorCode
- safeErrorMessage
- retryable
- metadataJson

금지:

- `MeetingNote.rawText`에 AI/STT 원문 저장
- transcript 원문 저장
- prompt 원문 저장
- provider raw response 저장
- 음성 파일 저장
- API key/quota detail 저장

## 3. Text AI draft

흐름:

1. 사용자가 미팅일, 회사, 담당자, 선택 제품/딜, 원문 메모를 입력한다.
2. Backend가 사용자 소유권을 검증한다.
3. `AiProviderCallLog`를 `MEETING_NOTE_TEXT_DRAFT` pending 상태로 만든다.
4. provider를 호출한다.
5. 성공하면 latency/token/cost를 기록하고 `SUCCEEDED`로 갱신한다.
6. 실패하면 safe error를 기록하고 `FAILED`로 갱신한다.
7. 응답은 기존 회의록 form에 채울 `details`, `nextPlan`, `requiredAction`만 반환한다.

## 4. STT draft

흐름:

1. 사용자가 음성 파일과 선택 맥락을 입력한다.
2. Backend가 파일 크기, MIME type, 사용자 소유권을 검증한다.
3. STT provider call log를 `MEETING_NOTE_STT_TRANSCRIPTION`으로 기록한다.
4. STT provider를 호출한다.
5. transcript 원문은 DB에 저장하지 않는다.
6. transcript 길이 같은 안전한 metadata만 기록한다.
7. transcript 기반 AI draft provider call log를 `MEETING_NOTE_STT_DRAFT`로 기록한다.
8. 응답은 transcript 임시 표시와 form field 초안만 반환한다.

## 5. Next action draft

흐름:

1. 사용자가 저장된 회의록 상세에서 `다음 행동 후보` 생성을 요청한다.
2. Backend가 meetingNoteId 소유권을 검증한다.
3. 회의록의 details, nextPlan, requiredAction, linked deal/contact/company snapshot을 AI 입력으로 사용한다.
4. provider call log를 `MEETING_NOTE_NEXT_ACTION_DRAFT`로 기록한다.
5. AI는 1~3개 후보를 반환한다.
6. Backend는 후보 title, memo, recommendedDueDate, dealId, reason만 response로 반환한다.
7. 후보는 DB에 저장하지 않는다.
8. 사용자가 확인/수정 후 기존 딜 다음 행동 저장 흐름으로 저장한다.

저장 주의:

- 기존 `POST /api/deals/:dealId/following-action-logs`는 `followingAction` 문자열만 받는다.
- `recommendedDueDate`, `memo`, `reason`은 07 1차에서 표시/판단용이며 저장하지 않는다.

자동 생성 금지:

- DealFollowingActionLog 자동 생성
- Schedule 자동 생성
- Deal stage 자동 변경

## 6. Follow-up draft

흐름:

1. 사용자가 저장된 회의록 상세에서 follow-up 초안 생성을 요청한다.
2. Backend가 meetingNoteId와 optional deal/contact 소유권을 검증한다.
3. provider call log를 `MEETING_NOTE_FOLLOW_UP_DRAFT`로 기록한다.
4. AI는 email 또는 SMS 초안을 생성한다.
5. response에는 subject/body와 안전한 수신자 후보만 반환한다.
6. subject/body는 DB에 저장하지 않는다.
7. 사용자는 확인/수정/복사한다.

자동 발송 금지:

- email 자동 발송
- SMS 자동 발송
- 예약 발송
- campaign/bulk 발송

## 7. Safe failure

사용자에게 허용되는 정보:

- safe error code
- safe message
- retryable

예시:

```json
{
  "statusCode": 502,
  "error": "MeetingNoteAiDraftFailed",
  "message": "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.",
  "retryable": true
}
```

현재 전역 오류 응답은 `errorCode`가 아니라 `error`를 사용한다. `MeetingNoteAiDraftFailed`는 502, `MeetingNoteAiDraftProviderUnavailable`은 503이다. 07 구현은 기존 `ApiClientError.code` 흐름과 충돌하지 않게 safe failure를 연결한다.

사용자에게 금지되는 정보:

- OpenAI status text 원문
- quota detail
- API key 설정 상태 상세
- provider raw response
- prompt 내용

## 8. Redaction metadata 예시

```json
{
  "source": "meeting_note_next_action",
  "meetingNoteId": "uuid",
  "selectedDealCount": 1,
  "detailsLength": 840,
  "requiredActionLength": 120
}
```

metadata에는 원문을 넣지 않고 길이, count, type, boolean만 둔다.
