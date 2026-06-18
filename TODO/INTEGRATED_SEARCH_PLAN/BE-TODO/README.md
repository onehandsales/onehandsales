# BE-TODO

## 1. 목적

통합검색 Backend 구현 작업을 관리한다.

## 2. 작업 문서

- `DB-SCHEMA.md`
- `G01-BE-INTEGRATED-SEARCH.goal.md`

## 3. 구현 원칙

- `src/modules/search` 아래에 `domain`, `application`, `infrastructure`, `presentation` 계층을 둔다.
- Controller는 application service만 호출한다.
- Prisma 접근은 infrastructure repository에만 둔다.
- 모든 조회는 현재 사용자 `userId`로 필터링한다.
- 검색어 원문은 로그에 남기지 않는다.

## 4. 관련 문서

- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
