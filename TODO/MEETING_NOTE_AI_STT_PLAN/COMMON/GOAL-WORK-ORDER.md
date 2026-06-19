# Meeting Note AI/STT Goal Work Order

## 1. 목표 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
|---:|---|---|---|---|
| 1 | `G01-BE-MEETING-NOTE-AI-STT-DRAFT` | Backend | completed | 기존 수동 회의록 생성 API 구현 |
| 2 | `G02-FE-MEETING-NOTE-AI-STT-DRAFT` | Frontend | completed | G01 Backend API 사용 가능 |

## 2. G01-BE-MEETING-NOTE-AI-STT-DRAFT

목적:

- AI/STT 초안 생성 API 2개를 추가한다.
- AI 초안 provider와 STT provider를 application port 뒤에 둔다.
- 최종 저장 API가 AI/STT sourceType을 저장할 수 있게 한다.

완료 조건:

- `POST /api/meeting-notes/ai-draft`가 구현된다.
- `POST /api/meeting-notes/stt-draft`가 구현된다.
- `MeetingNoteAiDraftProvider`와 `MeetingNoteSttProvider`가 분리된다.
- 기본 AI adapter는 OpenAI Responses API를 사용한다.
- 기본 STT adapter는 OpenAI audio transcriptions API를 사용한다.
- 초안 생성 API는 DB에 transcript/provider raw response를 저장하지 않는다.
- Backend typecheck, lint, test, build가 통과한다.

## 3. G02-FE-MEETING-NOTE-AI-STT-DRAFT

목적:

- 회의록 생성 모달에서 AI 텍스트 초안 생성 흐름을 연결한다.
- 음성 업로드 또는 녹음 후 STT+AI 초안 생성 흐름을 연결한다.
- 초안 결과를 자동 저장하지 않고 사용자가 수정 가능한 form field에 채운다.

완료 조건:

- 회사, 담당자, 제품, 딜, 회의 일시 선택값이 AI/STT 요청에 포함된다.
- 필수 선택값이 없으면 AI/STT 요청을 보내지 않는다.
- 텍스트 AI 초안 요청이 `POST /api/meeting-notes/ai-draft`를 호출한다.
- STT+AI 초안 요청이 `POST /api/meeting-notes/stt-draft`를 multipart로 호출한다.
- `transcript`는 검토용으로만 표시하고 최종 저장 payload에는 포함하지 않는다.
- 최종 저장 payload는 기존 `POST /api/meeting-notes` 계약을 따른다.

## 4. 현재 상태

Backend goal과 Frontend goal은 completed다. 저장 후 딜 활동기록 자동 생성 API 계약은 별도 후속 범위다.
