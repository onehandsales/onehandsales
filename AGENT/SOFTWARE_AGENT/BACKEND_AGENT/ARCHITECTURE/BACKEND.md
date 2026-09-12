# Backend Architecture

## 활성 도메인

- Auth/User
- Error Report
- Support Request
- Public Contact Request
- Health
- Admin authority check

## 계층 구조

- `domain`: repository port, domain type, domain error
- `application`: use case service, transaction boundary
- `infrastructure`: Prisma repository, external adapter
- `presentation`: controller, DTO, guard/filter

## API 정책

- `GET /api/me`는 현재 로그인 사용자를 반환한다.
- `GET /admin/api/me`는 관리자 권한 확인만 수행한다.
- 인증이 필요한 사용자 API는 current user ownership을 필수로 검증한다.
- 공개 문의 API는 비로그인 접수 API로 유지한다.
- 고정형 고객사 관리 API와 검색 API는 현재 제공하지 않는다.

## DB 정책

- 인증이 필요한 접수 row는 `userId`를 갖는다.
- 공개 문의 row는 User FK 없이 독립 원장으로 저장한다.
- schema 변경은 새 migration으로 추가한다.

## 검증 정책

- Prisma validate/generate
- typecheck/lint
- unit/integration test
- build
