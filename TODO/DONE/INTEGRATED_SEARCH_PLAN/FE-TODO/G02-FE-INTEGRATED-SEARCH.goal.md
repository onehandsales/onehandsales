# /goal G02-FE-INTEGRATED-SEARCH

## 1. Goal

User Web 통합검색 UI를 Backend `GET /api/search` 계약과 최종 연결한다.

## 2. 먼저 읽을 문서

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/README.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/GOAL-SPECS/G02-FE-INTEGRATED-SEARCH.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 작업 체크리스트

- [x] `features/search` API client가 `SearchAllResponse` 계약과 맞는지 확인한다.
- [x] 검색 결과 label을 User Web 검색 UI에 표시한다.
- [x] 결과 선택 시 `targetPath`로 이동한다.
- [x] `/schedules/:scheduleId` route를 추가한다.
- [x] 일정 상세 화면이 `GET /api/schedules/{scheduleId}`를 사용한다.
- [x] User Web typecheck를 통과한다.

## 4. Acceptance Criteria

- 두 글자 이상 입력 시 통합검색 API가 호출된다.
- loading, empty, error 상태가 표시된다.
- 회사/담당자/제품/딜/회의록 결과는 기존 상세 화면으로 이동한다.
- 일정 결과는 신규 일정 상세 화면으로 이동한다.

## 5. 이번 작업 상태

completed
