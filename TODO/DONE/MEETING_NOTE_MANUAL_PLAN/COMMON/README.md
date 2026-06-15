# Meeting Note Common

## 1. 목적

이 폴더는 MeetingNote 1차 구현에서 Frontend와 Backend가 함께 따라야 하는 공통 계약을 둔다.

공통 계약은 `meetingNote.md`를 기반으로 하되, 이번 `/goal` 실행 범위에 맞게 수동 회의록 CRUD와 N:N 연결만 확정한다.

## 2. 우선순위

충돌이 있으면 아래 순서로 판단한다.

1. `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
2. `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/DB-SCHEMA.md`
3. `meetingNote.md`
4. `AGENT` 정본 문서
5. `UX Design` 문서
6. `TODO/DONE/MVP-STARTER_PLAN`의 오래된 MeetingNote 계약

`UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`의 `generate`, `restore`, 단일 `dealId`, `stageText` 계약은 이번 구현 기준이 아니다.

## 3. 공통 결정

- User API만 구현한다.
- Admin API는 구현하지 않는다.
- 삭제/복구 API는 구현하지 않는다.
- AI Text/STT API는 구현하지 않는다.
- `sourceType`은 현재 `MANUAL`만 생성한다.
- request `timeZone`은 받지 않는다.
- Backend는 `currentUser.timeZone`을 사용한다.
- 회사와 담당자는 필수 연결이다.
- 제품과 딜은 선택 연결이다.
- 목록/상세 응답은 N:N 연결 배열 또는 summary 객체를 항상 포함한다.

## 4. 문서

- 사용자 흐름: `USER-FLOW.md`
- 작업 순서: `GOAL-WORK-ORDER.md`
- 계획 검토: `PLANNING-REVIEW.md`
- API 계약: `API-SPEC/MEETING_NOTE_API.md`
- Goal 상세: `GOAL-SPECS/*`
