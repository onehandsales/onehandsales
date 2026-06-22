# Meeting Note AI/STT Plan

## 1. 목적

회의록 작성 화면에서 사용자가 AI 없이 직접 저장할 수 있는 흐름을 유지하고, 필요할 때만 AI/STT가 `details`, `nextPlan`, `requiredAction` 초안을 생성하도록 Backend와 Frontend 작업을 분리한다.

## 2. 핵심 결정

- 사용자가 직접 선택해야 하는 값: 회사, 담당자, 제품, 딜, 회의 일시
- 직접 작성 저장은 기본 흐름이며 `sourceType: MANUAL`로 기존 `POST /api/meeting-notes`를 호출한다.
- AI가 생성해도 되는 값: 회의 내용, 다음 계획, 필요 행동
- AI 초안 생성은 OpenAI를 사용하되 `MeetingNoteAiDraftProvider` port 뒤에 둔다.
- STT는 변경 가능성이 있으므로 `MeetingNoteSttProvider` port로 AI draft provider와 분리한다.
- 현재 STT 기본 구현은 OpenAI `audio/transcriptions` adapter다.
- 추후 Google/NAVER/AWS STT로 바꿀 때는 STT adapter만 추가/교체한다.
- 초안 생성 API는 DB에 저장하지 않는다.
- transcript, provider raw response, provider 호출 이력 테이블은 이번 범위에서 만들지 않는다.
- 최종 저장은 기존 `POST /api/meeting-notes`를 사용한다.
- 최종 저장의 `sourceType`은 `MANUAL`, `TEXT_AI`, `STT_AI`를 허용하되 `rawText`는 저장하지 않는다.
- 저장 후 딜 연동은 별도 액션이며, `POST /api/meeting-notes/:meetingNoteId/deals`가 `MeetingNoteDeal` 추가와 `DealFollowingActionLog` 생성을 처리한다.

## 3. 포함 범위

- `POST /api/meeting-notes/ai-draft`
- `POST /api/meeting-notes/stt-draft`
- `POST /api/meeting-notes/:meetingNoteId/deals`
- `MeetingNoteAiDraftProvider` port와 OpenAI AI draft adapter
- `MeetingNoteSttProvider` port와 OpenAI STT adapter
- provider 설정 env 추가
- Backend service/controller 테스트
- Frontend User Web draft UI 연결
- Frontend User Web 회의록 상세 딜 연동 UI 연결

## 4. 제외 범위

- Google/NAVER/AWS STT adapter 구현
- AI/STT 로그 DB 테이블
- transcript 영구 저장
- provider별 비용 추적
- 회의록 자동 저장
- AI가 회사, 담당자, 제품, 딜, 회의 일시를 추론하거나 선택하는 기능

## 5. 문서 지도

- 사용자 흐름: `COMMON/USER-FLOW.md`
- goal 순서: `COMMON/GOAL-WORK-ORDER.md`
- API 계약: `COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- Backend goal: `BE-TODO/G01-BE-MEETING-NOTE-AI-STT-DRAFT.goal.md`
- Frontend goal: `FE-TODO/G02-FE-MEETING-NOTE-AI-STT-DRAFT.goal.md`

## 6. 현재 구현 상태

- `G01-BE-MEETING-NOTE-AI-STT-DRAFT`: completed
- `G02-FE-MEETING-NOTE-AI-STT-DRAFT`: completed
