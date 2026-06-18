# /goal G02-FE-MEETING-NOTE-AI-STT-DRAFT

## 1. Goal

회의록 생성 모달에서 AI/STT 초안 생성 Backend API를 연결한다.

## 2. 먼저 읽을 문서

- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/USER-FLOW.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/GOAL-SPECS/G02-FE-MEETING-NOTE-AI-STT-DRAFT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 작업 체크리스트

- [ ] 회의록 생성 모달에서 회사, 담당자, 제품, 딜, 회의 일시 선택 상태를 AI/STT 요청과 연결한다.
- [ ] 텍스트 원문 입력 영역과 AI 초안 생성 버튼을 추가한다.
- [ ] `POST /api/meeting-notes/ai-draft` API client/hook을 추가한다.
- [ ] 음성 업로드 또는 녹음 UI를 추가한다.
- [ ] `POST /api/meeting-notes/stt-draft` multipart API client/hook을 추가한다.
- [ ] `transcript` 확인 UI를 추가한다.
- [ ] `details`, `nextPlan`, `requiredAction` form field에 초안을 반영한다.
- [ ] AI/STT 결과를 자동 저장하지 않는다.
- [ ] 최종 저장 시 기존 `POST /api/meeting-notes`를 호출한다.
- [ ] loading, error, retry 상태를 표시한다.

## 4. Acceptance Criteria

- 필수 선택값이 없으면 AI/STT 생성 요청을 보내지 않는다.
- AI/STT 결과는 자동 저장하지 않고 사용자가 수정 가능한 form field에 채운다.
- STT transcript는 영구 저장이 아니라 검토용으로 표시한다.
- provider 실패 후 입력한 선택값과 원문이 사라지지 않는다.
- User Web typecheck/build가 통과한다.

## 5. 이번 작업 상태

pending
