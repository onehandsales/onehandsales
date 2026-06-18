# /goal G02-FE-INTEGRATED-SEARCH

## 1. Goal

User Web 통합검색 UI를 Backend `GET /api/search` 계약과 최종 연결한다.

## 2. 먼저 읽을 문서

- `TODO/INTEGRATED_SEARCH_PLAN/README.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/USER-FLOW.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/GOAL-SPECS/G02-FE-INTEGRATED-SEARCH.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 작업 체크리스트

- [x] `features/search` API client가 `SearchAllResponse` 계약과 맞는지 확인한다.
- [x] `/schedules/:scheduleId` route를 추가한다.
- [x] 일정 상세 화면이 `GET /api/schedules/{scheduleId}`를 사용한다.
- [x] User Web typecheck를 통과한다.
- [ ] 상단 검색 UI가 실제 Backend `GET /api/search`를 호출하는지 end-to-end로 검수한다.
- [ ] 검색 결과 label과 group 표시가 Backend 응답 계약과 정확히 맞는지 검수한다.
- [ ] 결과 선택 시 모든 `targetPath`가 정상 상세 화면으로 이동하는지 검수한다.
- [ ] loading, empty, error 상태가 실제 UI에서 깨지지 않는지 검수한다.
- [ ] User Web build와 필요한 smoke/e2e 검증을 다시 통과시킨다.

## 4. Acceptance Criteria

- 두 글자 이상 입력 시 통합검색 API가 호출된다.
- loading, empty, error 상태가 표시된다.
- 회사/담당자/제품/딜/회의록 결과는 기존 상세 화면으로 이동한다.
- 일정 결과는 신규 일정 상세 화면으로 이동한다.

## 5. 이번 작업 상태

in_progress
