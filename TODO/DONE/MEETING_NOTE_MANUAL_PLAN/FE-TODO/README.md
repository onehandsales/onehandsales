# Meeting Note FE TODO

## 1. 목적

User Web MeetingNote 화면 구현과 API 연동 작업 문서를 둔다.

## 2. 실행 문서

- `G02-FE-MEETING-NOTE-PAGES.goal.md`

## 3. 구현 기준

- API 계약은 `../COMMON/API-SPEC/MEETING_NOTE_API.md`를 따른다.
- 사용자 흐름은 `../COMMON/USER-FLOW.md`를 따른다.
- 기존 `features/meeting-note`와 `/meeting-notes*` route를 새 N:N 계약으로 교체한다.
- AI/STT UI는 이번 goal에서 제거하거나 비활성 상태로 명확히 분리한다.
