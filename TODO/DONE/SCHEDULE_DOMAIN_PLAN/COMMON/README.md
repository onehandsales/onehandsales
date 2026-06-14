# Schedule Plan Common

## 1. 목적

이 폴더는 Backend와 Frontend가 함께 보는 일정 도메인 공통 계약을 둔다.

## 2. 문서

- `USER-FLOW.md`: 일정 사용자 흐름과 화면 흐름
- `GOAL-WORK-ORDER.md`: `/goal` 실행 순서
- `PLANNING-REVIEW.md`: 구현 전 계획 검토 결과
- `API-SPEC/SCHEDULE_API.md`: Schedule User API 계약
- `GOAL-SPECS/G01-BE-SCHEDULE-DOMAIN.md`: Backend goal 상세
- `GOAL-SPECS/G02-FE-SCHEDULE-PAGES.md`: Frontend goal 상세

## 3. 공통 결정

- 일정과 딜은 N:N 관계다.
- `Schedule` row에는 `dealId`를 두지 않는다.
- 연결은 `ScheduleDeal`이 담당한다.
- 일정 화면 전용 딜 옵션 API는 `GET /api/schedules/deal-options`다.
- 일정 도메인에서 사용하는 API는 `schedules` 도메인 내부 경로에 둔다.
- User Web 일정 화면은 딜 목록 화면용 API를 재사용하지 않는다.
- 일정 삭제는 soft delete가 아니라 실제 row 삭제다.
