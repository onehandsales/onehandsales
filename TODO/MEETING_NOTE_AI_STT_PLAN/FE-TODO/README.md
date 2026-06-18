# FE-TODO

## 1. 목적

회의록 생성 모달에서 AI/STT 초안 생성 Backend API를 연결하는 Frontend 작업을 관리한다.

## 2. 작업 문서

- `G02-FE-MEETING-NOTE-AI-STT-DRAFT.goal.md`

## 3. 현재 상태

이번 Backend 작업에서는 Frontend 코드를 수정하지 않는다.

Frontend는 다음을 구현해야 한다.

- 회사, 담당자, 제품, 딜, 회의 일시 선택값을 AI/STT 요청에 연결
- 텍스트 기반 AI 초안 생성 UI
- 음성 업로드 또는 녹음 기반 STT+AI 초안 생성 UI
- `transcript` 검토 UI
- 초안 결과를 form field에 채우고 사용자가 수정 후 저장하는 UX

## 4. 관련 문서

- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
