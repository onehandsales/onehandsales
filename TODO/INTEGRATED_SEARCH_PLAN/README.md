# Integrated Search Plan

## 1. 목적

이 계획은 User Web 상단 통합검색에서 회사, 담당자, 제품, 딜, 일정, 회의록을 한 번에 찾고, 선택한 결과의 상세 화면으로 이동할 수 있게 하기 위한 실행 문서다.

현재 범위는 Backend 통합 검색 API를 먼저 구현하는 것이다. Frontend 코드는 이번 goal에서 수정하지 않는다.

## 2. 배경

기존 도메인별 목록 API는 각 화면 안에서만 검색한다. 사용자는 회사명, 담당자명, 딜명, 일정 제목, 회의록 연결 정보를 기억하고 있을 때 화면을 이동하지 않고 바로 찾고 싶다.

통합검색은 새 데이터를 만들지 않는 조회 기능이다. 다만 여러 도메인을 한 번에 읽기 때문에 User API ownership, 응답 필드 최소화, 민감정보 로그 금지 기준을 명확히 둔다.

## 3. 포함 범위

- `GET /api/search` User API 추가
- 검색 대상: `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`, `SCHEDULE`, `MEETING_NOTE`
- 결과 응답: `title`, `subtitle`, `targetId`, `targetPath`
- `q`, `types`, `limit` query validation
- 현재 사용자 `userId` ownership 필터
- Backend Clean Architecture 계층 분리
- TODO 공통 API 계약, BE/FE 작업 문서 작성

## 4. 제외 범위

- Frontend 코드 수정
- 전용 `/search` 페이지
- Admin 통합검색 API
- full-text index 또는 별도 search engine 도입
- 검색 결과 하이라이트
- 최근 검색어, 인기 검색어, 검색 로그 DB 저장
- 권한을 넘어서는 cross-user 검색

## 5. 문서 지도

- 사용자 흐름: `COMMON/USER-FLOW.md`
- goal 순서: `COMMON/GOAL-WORK-ORDER.md`
- API 계약: `COMMON/API-SPEC/SEARCH_API.md`
- Backend goal 상세: `COMMON/GOAL-SPECS/G01-BE-INTEGRATED-SEARCH.md`
- Frontend goal 상세: `COMMON/GOAL-SPECS/G02-FE-INTEGRATED-SEARCH.md`
- Backend 실행 문서: `BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- Frontend 실행 문서: `FE-TODO/G02-FE-INTEGRATED-SEARCH.goal.md`

## 6. `/goal` 실행 기준

1. `COMMON/GOAL-WORK-ORDER.md`를 먼저 읽는다.
2. 현재 goal의 `COMMON/GOAL-SPECS/*.md`를 읽는다.
3. API가 포함된 goal은 `COMMON/API-SPEC/SEARCH_API.md`를 먼저 확인한다.
4. Backend 작업은 `BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`만 구현한다.
5. Frontend 작업은 이번 commit에서 구현하지 않는다.

## 7. 완료 기준

- `TODO/INTEGRATED_SEARCH_PLAN` 아래에 `COMMON`, `BE-TODO`, `FE-TODO` 구조가 있다.
- `GET /api/search`가 Backend에 구현된다.
- Backend typecheck와 관련 테스트가 통과한다.
- Frontend 파일은 수정하지 않는다.
- 관련 변경만 git commit에 포함한다.

## 8. 현재 구현 상태

- `G01-BE-INTEGRATED-SEARCH`: 완료
- `G02-FE-INTEGRATED-SEARCH`: pending

## 9. 관련 문서

- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
