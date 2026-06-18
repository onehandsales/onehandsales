# /goal G01-BE-INTEGRATED-SEARCH

## 1. Goal

Backend 통합검색 API `GET /api/search`를 구현한다.

## 2. 먼저 읽을 문서

- `TODO/INTEGRATED_SEARCH_PLAN/README.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/GOAL-SPECS/G01-BE-INTEGRATED-SEARCH.md`
- `TODO/INTEGRATED_SEARCH_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

## 3. 작업 체크리스트

- [x] `SearchTargetType`과 repository port를 정의한다.
- [x] `SearchApplicationService`에서 query 정규화와 type validation을 구현한다.
- [x] `SearchController`와 query DTO를 구현한다.
- [x] `PrismaSearchRepository`에서 6개 도메인 검색 query를 구현한다.
- [x] `SearchModule`을 만들고 `AppModule`에 등록한다.
- [x] service/controller 테스트를 추가한다.
- [x] Backend typecheck, lint, test를 통과한다.

## 4. API 완료 목록

- [x] `GET /api/search`

## 5. Acceptance Criteria

- 인증 없이는 401을 반환한다.
- `q` 두 글자 미만이면 빈 결과를 반환한다.
- `types`가 없으면 6개 도메인을 기본 순서로 검색한다.
- `types`가 있으면 지정된 도메인만 검색한다.
- invalid type은 400을 반환한다.
- 도메인별 결과 개수는 `limit` 이하이다.
- 모든 DB query는 `userId` ownership 필터를 포함한다.
- 응답은 `groups[].items[].targetPath`를 포함한다.
- 검색어 원문은 log context에 남기지 않는다.

## 6. 완료 기록

- 상태: completed
- 구현 API: `GET /api/search`
- 구현 위치: `BE/src/modules/search`
- 검증: Backend `typecheck`, `lint`, `test`, `build` 통과
- 남은 작업: `G02-FE-INTEGRATED-SEARCH`에서 Frontend 최종 연결/검수
