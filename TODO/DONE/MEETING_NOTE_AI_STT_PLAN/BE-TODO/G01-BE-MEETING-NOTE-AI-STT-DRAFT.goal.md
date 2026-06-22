# /goal G01-BE-MEETING-NOTE-AI-STT-DRAFT

## 1. Goal

회의록 AI/STT 초안 생성 Backend API를 구현한다.

## 2. 먼저 읽을 문서

- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/README.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`

## 3. 작업 체크리스트

- [x] `POST /api/meeting-notes/ai-draft` controller/DTO 추가
- [x] `POST /api/meeting-notes/stt-draft` multipart controller/DTO 추가
- [x] `MeetingNoteAiDraftProvider` port 추가
- [x] `MeetingNoteSttProvider` port 추가
- [x] OpenAI AI draft adapter 구현
- [x] OpenAI STT adapter 구현
- [x] `MeetingNoteAiDraftApplicationService`에서 STT -> AI draft 조합 구현
- [x] 최종 저장 API에서 `TEXT_AI`, `STT_AI` sourceType 허용
- [x] `.env.example` provider 설정 추가
- [x] application/controller 테스트 추가

## 4. API 완료 목록

- [x] `POST /api/meeting-notes/ai-draft`
- [x] `POST /api/meeting-notes/stt-draft`

## 5. Acceptance Criteria

- 사용자가 선택한 회사/담당자/제품/딜 ID를 현재 사용자 소유 데이터로 검증한다.
- AI는 `details`, `nextPlan`, `requiredAction`만 생성한다.
- STT는 transcript만 생성하고, AI draft provider가 transcript 기반 초안을 생성한다.
- AI draft provider와 STT provider는 별도 port/interface로 분리되어 있다.
- 초안 생성 API는 DB에 저장하지 않는다.
- provider env가 없으면 503을 반환한다.
- provider 실패는 502를 반환한다.
- provider 실패 로그에는 회의 본문, transcript, 음성 내용을 포함하지 않는다.

## 6. 완료 기록

- 상태: completed
- 구현 위치:
  - `BE/src/modules/meeting-note/application/ports/meeting-note-ai-draft.provider.ts`
  - `BE/src/modules/meeting-note/application/ports/meeting-note-stt.provider.ts`
  - `BE/src/modules/meeting-note/infrastructure/providers/openai-meeting-note-ai-draft.provider.ts`
  - `BE/src/modules/meeting-note/infrastructure/providers/openai-meeting-note-stt.provider.ts`
- 남은 작업: `G02-FE-MEETING-NOTE-AI-STT-DRAFT`에서 Frontend 연결
