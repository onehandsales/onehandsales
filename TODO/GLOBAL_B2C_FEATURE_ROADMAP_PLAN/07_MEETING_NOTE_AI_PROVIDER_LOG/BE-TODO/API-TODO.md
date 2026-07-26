# Backend API TODO

상태: Completed
확정일: 2026-07-26
완료일: 2026-07-26

## 1. 목적

이 문서는 07 Backend/API 작업 범위를 구현 가능한 단위로 정리한다.

Backend 구현은 반드시 `AGENT/SOFTWARE_AGENT` 기준을 따른다. 특히 API 계약, transaction, observability, 한글 주석 규칙을 지킨다.

## 2. API 작업

| Method | Path | 상태 | 목적 |
|---|---|---|---|
| `POST` | `/api/meeting-notes/ai-draft` | 구현 완료 | 텍스트 AI 초안 provider call log와 safe failure 계약을 추가했다. |
| `POST` | `/api/meeting-notes/stt-draft` | 구현 완료 | STT provider call log와 transcript 기반 AI draft provider call log를 추가했다. |
| `POST` | `/api/meeting-notes/:meetingNoteId/next-actions/draft` | 구현 완료 | 저장된 회의록 기반 next action 후보를 생성한다. |
| `POST` | `/api/meeting-notes/:meetingNoteId/follow-up-draft` | 구현 완료 | 저장된 회의록 기반 follow-up 초안을 생성한다. |

상세 계약은 아래 문서를 따른다.

- `COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`
- `COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`

## 3. Backend 구현 항목

- `AiProviderOperation`에 MeetingNote operation을 추가한다.
- `AiProviderCallLog`에 MeetingNote target 연결을 위한 optional target 필드를 추가한다.
- MeetingNote AI/STT provider port에 provider/model metadata 반환 계약을 추가한다.
- MeetingNote AI draft application service에서 provider 호출 전후로 provider call log를 남긴다.
- STT draft는 STT 호출과 transcript 기반 AI draft 호출을 각각 별도 provider call log로 기록한다.
- next action draft provider port와 application service를 추가한다.
- follow-up draft provider port와 application service를 추가한다.
- 새 API controller method에는 `// API : ...` 한글 주석을 추가한다.
- 새 class/interface/function에는 `// 역할 : ...`, `// 기능 : ...` 한글 주석을 추가한다.

## 4. Error/Redaction 기준

사용자 응답에는 아래만 허용한다.

- safe error code
- safe user message
- retryable 여부

저장/응답/log 금지:

- 회의록 원문 전체
- transcript 원문
- 음성 파일
- prompt 원문
- provider raw response
- API key
- quota detail
- contact email/phone 원문

## 5. Transaction 기준

- AI provider 호출 자체는 DB transaction 안에서 실행하지 않는다.
- provider call log `PENDING` 생성과 성공/실패 갱신은 짧은 DB write로 처리한다.
- next action 후보 생성 API는 후보만 반환하므로 업무 데이터 mutation transaction이 없다.
- 사용자가 후보를 저장할 때는 기존 딜 다음 행동 생성 API의 transaction 기준을 따른다.
- follow-up 초안 생성 API는 초안을 DB에 저장하지 않으므로 업무 데이터 mutation transaction이 없다.

## 6. 금지

- API 계약 없이 controller/service/repository를 구현하지 않는다.
- User API와 Admin API를 같은 endpoint의 role 분기로 합치지 않는다.
- transcript/provider raw detail을 일반 사용자 response에 추가하지 않는다.
- follow-up 초안을 자동 발송하지 않는다.
- AI 후보를 사용자 확인 없이 딜/일정/회의록에 저장하지 않는다.
- 공유/운영성 DB에 무단 migrate/seed를 실행하지 않는다.

## 7. G06 검증 결과

- `cd BE && pnpm run prisma:validate` 통과
- `cd BE && pnpm run typecheck` 통과
- `cd BE && pnpm run lint` 통과
- `cd BE && pnpm run test -- meeting-note` 통과
- `cd BE && pnpm run test -- deal` 통과
- `cd BE && pnpm run build` 통과

비고:

- meeting-note Jest 실행에서 worker teardown warning이 표시됐지만 test suite/test 실패는 없었다.
