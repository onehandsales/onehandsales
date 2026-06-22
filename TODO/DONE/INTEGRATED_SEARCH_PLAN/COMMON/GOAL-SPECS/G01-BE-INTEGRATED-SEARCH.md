# G01-BE-INTEGRATED-SEARCH 상세 명세

## 1. 목적

Backend에 `GET /api/search`를 추가해 User Web이 현재 사용자의 소유 데이터를 한 번에 검색할 수 있게 한다.

## 2. 포함 범위

- `search` Backend module 추가
- application port와 service 추가
- Prisma repository 추가
- HTTP controller와 query DTO 추가
- AppModule 등록
- service/controller 테스트 추가

## 3. 제외 범위

- FE 코드 수정
- Admin API
- DB migration
- 별도 search index
- 외부 Provider 호출

## 4. API 연결

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`

## 5. DB 연결

- `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`와 각 relation snapshot/lookup table을 읽는다.
- 모든 query는 `userId` 조건을 포함한다.
- 새 table과 migration은 만들지 않는다.

## 6. 완료 기준

- `GET /api/search`가 인증된 사용자에게 200 응답을 반환한다.
- 두 글자 미만 검색어는 빈 결과를 반환한다.
- invalid `types`는 400 domain validation error를 반환한다.
- 도메인별 결과는 `limit` 이하로 반환한다.
- Backend typecheck, lint, test, build가 통과한다.
- 검색 service/controller 테스트가 통과한다.

## 7. 구현 결과

- 상태: completed
- 구현 모듈: `BE/src/modules/search`
- 검증: `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd test`, `pnpm.cmd run build`

## 8. 관련 문서

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
