# FE-TODO

## 1. 목적

통합검색 Frontend 연결 작업 이력을 보관한다.

## 2. 작업 문서

- `G02-FE-INTEGRATED-SEARCH.goal.md`

## 3. 완료 기준

- User Web은 `/api/search`만 호출한다.
- 결과 선택은 Backend가 내려준 `targetPath`를 사용한다.
- 일정 검색 결과를 위해 `/schedules/:scheduleId` route와 일정 상세 화면을 제공한다.
- User Web typecheck/build를 통과한다.

## 4. 관련 문서

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
