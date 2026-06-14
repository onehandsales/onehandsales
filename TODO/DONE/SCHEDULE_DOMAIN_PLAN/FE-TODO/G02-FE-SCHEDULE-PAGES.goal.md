# /goal G02-FE-SCHEDULE-PAGES

## 1. Goal

User Web 일정 월간/주간 화면을 Backend Schedule API 계약에 맞게 구현한다.

## 2. 선행 조건

- `G01-BE-SCHEDULE-DOMAIN`이 완료되어 있다.
- local Backend에서 `/api/schedules/deal-options`, `/api/schedules`, `/api/schedules/:scheduleId`를 포함한 Schedule API 계약을 기준으로 연동한다.

## 3. 먼저 읽을 문서

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/README.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/GOAL-SPECS/G02-FE-SCHEDULE-PAGES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

## 4. 작업 체크리스트

- [x] 기존 schedule feature에서 stale API field 사용 위치를 찾는다.
- [x] 새 Schedule DTO type을 정의한다.
- [x] Schedule API client 함수를 작성한다.
- [x] TanStack Query key와 hook을 작성한다.
- [x] 월간 일정 목록을 API와 연결한다.
- [x] 주간 일정 목록을 API와 연결한다.
- [x] 일정 상세 조회를 연결한다.
- [x] 일정 생성 form을 구현한다.
- [x] 일정 수정 form을 구현한다.
- [x] 일정 삭제 액션과 확인 UI를 구현한다.
- [x] 딜 옵션 선택을 `GET /api/schedules/deal-options`와 연결한다.
- [x] 연결 딜 중복 선택을 UI에서 차단한다.
- [x] 생성/수정/삭제 후 관련 query를 invalidate한다.
- [x] loading/empty/error/pending 상태를 정리한다.
- [x] desktop/mobile 레이아웃을 확인한다.
- [x] typecheck/lint/build를 실행한다.

## 5. Acceptance Criteria

- `/schedules` 진입 시 월간 일정이 조회된다.
- `/schedules/week` 진입 시 주간 일정이 조회된다.
- 조회 query는 `view`, `baseDate`, `timeZone`을 API 계약에 맞게 보낸다.
- 생성/수정 body는 `scheduleTitle`, `startAt`, `endAt`, `timeZone`, `location`, `memo`, `dealIds`를 계약에 맞게 보낸다.
- `dealIds`는 중복 없이 전송된다.
- 수정 시 `dealIds`가 없는 경우와 빈 배열인 경우를 구분한다.
- 삭제 성공은 `204 No Content`로 처리한다.
- 삭제 후 일정 목록과 상세 query가 갱신된다.
- Backend UTC ISO string은 화면 timezone으로 변환해 표시한다.

## 6. 완료 기록

완료 기록: `TODO_LOG/2026-06-14/G02_FE_SCHEDULE_PAGES/WORK_LOG.md`

- 수정한 주요 파일
- 연결한 API 목록
- 실행한 검증 명령과 결과
- 남은 이슈 또는 후속 작업
