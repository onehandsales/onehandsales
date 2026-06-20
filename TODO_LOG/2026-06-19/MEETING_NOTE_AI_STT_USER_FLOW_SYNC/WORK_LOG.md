# MeetingNote AI/STT User Flow Sync

## 작업 일시

- 2026-06-19 KST

## 목적

회의록 작성 UX를 `AI 회의록 생성` 중심이 아니라 `직접 작성/저장 + 선택적 AI/STT 정리` 중심으로 문서화한다.

## 반영 내용

- 회의록 작성 화면의 기본 흐름을 직접 작성 후 저장으로 확정했다.
- 텍스트 AI는 `AI로 정리`, 음성 STT+AI는 `음성으로 작성` 보조 액션으로 정리했다.
- AI/STT draft API는 field 초안만 반환하고 자동 저장하지 않는 계약을 유지했다.
- 직접 저장은 `sourceType: MANUAL`, 텍스트 AI 저장은 `TEXT_AI`, STT+AI 저장은 `STT_AI`를 사용하도록 문서화했다.
- 저장 후 `영업 딜과 연동`은 회의록 상세의 별도 액션으로 분리했다.
- 딜 활동기록 자동 생성 API 계약은 AI/STT draft API 범위 밖의 후속 확정 항목으로 표시했다.

## 변경 문서

- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/USER-FLOW.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/GOAL-SPECS/G02-FE-MEETING-NOTE-AI-STT-DRAFT.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/FE-TODO/G02-FE-MEETING-NOTE-AI-STT-DRAFT.goal.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/README.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/SERVICE_OVERVIEW.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `UX Design/FE_DOMAIN_COMPLETION_STATUS.md`
- `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
- `UX Design/PEN_UI_02_BACKEND_IMPACT.md`
- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`
- `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`

## 남은 이슈

- User Web MeetingNote AI/STT draft UI 연결
- User Web `CreateMeetingNoteInput`의 `sourceType?: "MANUAL"` 타입 확장
- 저장 후 딜 활동기록 자동 생성 API 계약 확정
