# /goal G02-FE-MEETING-NOTE-AI-STT-DRAFT

## 1. Goal

회의록 작성 화면에서 기존 직접 저장 흐름을 유지하면서 AI/STT 초안 생성 Backend API를 보조 액션으로 연결한다.

## 2. 먼저 읽을 문서

- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/GOAL-SPECS/G02-FE-MEETING-NOTE-AI-STT-DRAFT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 작업 체크리스트

- [x] 회의록 생성 모달에서 회사, 담당자, 제품, 딜, 회의 일시 선택 상태를 AI/STT 요청과 연결한다.
- [x] AI/STT 없이 `details`, `nextPlan`, `requiredAction`을 직접 입력하고 `sourceType: MANUAL`로 저장하는 기존 흐름을 유지한다.
- [x] 텍스트 원문 입력 영역과 AI 초안 생성 버튼을 추가한다.
- [x] `POST /api/meeting-notes/ai-draft` API client/hook을 추가한다.
- [x] 음성 업로드 또는 녹음 UI를 추가한다.
- [x] `POST /api/meeting-notes/stt-draft` multipart API client/hook을 추가한다.
- [x] `transcript` 확인 UI를 추가한다.
- [x] `details`, `nextPlan`, `requiredAction` form field에 초안을 반영한다.
- [x] AI/STT 결과를 자동 저장하지 않는다.
- [x] 최종 저장 시 기존 `POST /api/meeting-notes`를 호출하고, 작성 경로에 따라 `MANUAL`, `TEXT_AI`, `STT_AI` sourceType을 전달한다.
- [x] 현재 User Web `CreateMeetingNoteInput`의 `sourceType?: "MANUAL"` 타입과 form 변환 로직을 AI/STT 저장까지 허용하도록 확장한다.
- [x] 저장 후 `영업 딜과 연동`은 회의록 상세의 별도 액션으로 분리한다.
- [x] loading, error, retry 상태를 표시한다.

## 4. Acceptance Criteria

- 필수 선택값이 없으면 AI/STT 생성 요청을 보내지 않는다.
- 사용자는 AI/STT를 사용하지 않고 직접 작성한 회의록을 바로 저장할 수 있다.
- 직접 작성 저장은 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`를 호출하지 않는다.
- AI/STT 결과는 자동 저장하지 않고 사용자가 수정 가능한 form field에 채운다.
- STT transcript는 영구 저장이 아니라 검토용으로 표시한다.
- AI/STT draft 결과 저장 시 기존 `POST /api/meeting-notes` request에 `TEXT_AI` 또는 `STT_AI` sourceType이 전달된다.
- provider 실패 후 입력한 선택값과 원문이 사라지지 않는다.
- User Web typecheck/build가 통과한다.

## 5. 이번 작업 상태

completed

검증:

- `pnpm --dir FE/user-web typecheck`
- `pnpm --dir FE/user-web exec eslint src/features/meeting-note/types/meeting-note.ts src/features/meeting-note/api/meeting-note-api.ts src/features/meeting-note/hooks/use-meeting-note-mutations.ts src/features/meeting-note/schemas/meeting-note-schema.ts src/features/meeting-note/components/meeting-note-create-dialog.tsx src/features/meeting-note/index.ts`
- `pnpm --dir FE/user-web build`
- `git diff --check`
