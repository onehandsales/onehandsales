# FE-TODO

## 1. 목적

통합검색 Frontend 연결 작업을 관리한다.

## 2. 작업 문서

- `G02-FE-INTEGRATED-SEARCH.goal.md`

## 3. 완료 기준

- User Web은 `/api/search`만 호출한다.
- 결과 선택은 Backend가 내려준 `targetPath`를 사용한다.
- 일정 검색 결과를 위해 `/schedules/:scheduleId` route와 일정 상세 화면을 제공한다.
- User Web typecheck/build를 통과한다.
- 도메인별 결과 선택 이동과 loading/empty/error 상태를 실제 UI에서 검수한다.

현재 상태:

- `/schedules/:scheduleId` route와 일정 상세 화면은 추가되어 있다.
- 상단/모바일 GlobalSearch는 `GET /api/search`에 연결되어 있고 결과 선택 시 `targetPath`로 이동한다.
- loading, empty, error 상태 처리가 구현되어 있다.
- User Web typecheck, lint, build 검증을 통과했다.

## 4. 관련 문서

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
