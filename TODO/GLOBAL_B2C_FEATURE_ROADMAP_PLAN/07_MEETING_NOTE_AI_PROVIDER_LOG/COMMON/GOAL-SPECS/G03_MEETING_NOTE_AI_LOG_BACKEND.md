# G03 Meeting Note AI Log Backend

상태: Ready
목표: 기존 Meeting Note AI/STT draft API에 provider log와 safe failure 구현

## 1. 목적

`POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`가 사용자에게는 저장 가능한 초안만 반환하고, 운영에는 redacted provider call log를 남기게 한다.

## 2. 선행 조건

- G02 완료

## 3. 포함 범위

- `POST /api/meeting-notes/ai-draft` provider call log
- `POST /api/meeting-notes/stt-draft` STT provider call log
- `POST /api/meeting-notes/stt-draft` transcript 기반 AI draft provider call log
- provider success/failure/latency/token/cost 저장
- safe failure response
- provider raw/prompt/transcript/text redaction
- unit/application/provider/repository test

## 4. 제외 범위

- 신규 next action/follow-up draft API
- transcript DB 저장
- 회의록 자동 저장
- Admin 조회 API
- cleanup job

## 5. Backend 작업

1. MeetingNote module에서 provider call log 저장 port 또는 service 배치를 결정한다.
2. 기존 `AiProviderCallLog` 저장 패턴을 재사용한다.
3. text AI draft 호출에 `MEETING_NOTE_TEXT_DRAFT` operation을 기록한다.
4. STT 호출에 `MEETING_NOTE_STT_TRANSCRIPTION` operation을 기록한다.
5. STT 후 AI draft 호출에 `MEETING_NOTE_STT_DRAFT` operation을 기록한다.
6. 성공 시 latency/token/cost/requestId를 가능한 범위에서 저장한다.
7. 실패 시 `safeErrorCode`, `safeErrorMessage`, `retryable`을 저장한다.
8. 사용자 오류 메시지를 안전한 한국어 문구로 보정한다.
9. provider raw response, prompt, 원문 text, transcript 전문이 저장되지 않도록 test를 추가한다.

## 6. Safe Error 기준

사용자 노출 메시지 후보:

```text
AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.
```

Provider unavailable:

```text
AI 기능 설정을 확인하고 있어요. 지금은 직접 작성으로 이어갈 수 있어요.
```

FE가 retry 버튼을 판단할 수 있도록 `retryable` 또는 기존 `ApiClientError.raw`에서 읽을 수 있는 동등 정보를 제공한다.

## 7. Logging 금지

- 회의 원문 text 전문
- STT transcript 전문
- prompt 전문
- provider raw request/response
- API key, quota detail
- 담당자 이메일/전화번호 전문

## 8. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- meeting-note
pnpm run build
```

선택 검증:

```powershell
rg "rawText|transcript|prompt|safeError|AiProviderCallLog" BE/src/modules/meeting-note BE/src/modules/sales-report
```

## 9. 완료 기준

- API response가 `COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`와 일치한다.
- AI/STT provider 성공 log가 저장된다.
- AI/STT provider 실패 log가 저장된다.
- safe failure UX에 필요한 정보가 응답된다.
- redaction test가 있다.
- 코드 작업 시 한글 주석이 추가됐다.
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G03 항목이 갱신됐다.
