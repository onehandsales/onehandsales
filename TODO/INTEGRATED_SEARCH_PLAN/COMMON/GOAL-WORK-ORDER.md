# Integrated Search Goal Work Order

## 1. 목표 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
|---:|---|---|---|---|
| 1 | `G01-BE-INTEGRATED-SEARCH` | Backend | completed | 기존 Company, Contact, Product, Deal, Schedule, MeetingNote API/DB 구현 |
| 2 | `G02-FE-INTEGRATED-SEARCH` | Frontend | pending | `G01-BE-INTEGRATED-SEARCH` 완료 |

## 2. G01-BE-INTEGRATED-SEARCH

목적:

- `GET /api/search`를 구현한다.
- 프론트가 도메인별 검색 결과와 상세 이동 경로를 받을 수 있게 한다.

읽을 문서:

- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/GOAL-SPECS/G01-BE-INTEGRATED-SEARCH.md`
- `TODO/INTEGRATED_SEARCH_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`

완료 조건:

- `BE/src/modules/search`가 네 계층 구조로 추가된다.
- `AppModule`에 `SearchModule`이 등록된다.
- 모든 검색 query는 `userId` ownership 필터를 가진다.
- API 응답이 `SearchAllResponse` 계약과 일치한다.
- Backend typecheck와 검색 관련 테스트가 통과한다.

## 3. G02-FE-INTEGRATED-SEARCH

목적:

- 기존 User Web search feature를 실제 Backend API와 최종 연결 상태로 정리한다.
- 일정 검색 결과 이동을 위해 `/schedules/:scheduleId` 상세 route를 추가한다.

읽을 문서:

- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/USER-FLOW.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/GOAL-SPECS/G02-FE-INTEGRATED-SEARCH.md`
- `TODO/INTEGRATED_SEARCH_PLAN/FE-TODO/G02-FE-INTEGRATED-SEARCH.goal.md`

완료 조건:

- 검색 입력은 `q` 두 글자 이상에서만 API를 호출한다.
- 결과 선택 시 `targetPath`로 이동한다.
- 일정 단건 상세 화면이 존재한다.
- User Web typecheck/build가 통과한다.

## 4. 이번 작업 제한

이번 작업은 `G01-BE-INTEGRATED-SEARCH`만 수행했다. Frontend 파일은 수정하지 않았다.
