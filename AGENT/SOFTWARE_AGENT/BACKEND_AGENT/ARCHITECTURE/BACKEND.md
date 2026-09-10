# Backend Architecture

## 활성 도메인

- Auth/User
- Company
- Search
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
- Company API는 current user ownership을 필수로 검증한다.
- Search는 현재 Company만 대상으로 한다.
- Company 삭제 API와 Trash API는 현재 제공하지 않는다.

## DB 정책

- 업무 row는 `userId`를 갖는다.
- 현재 Company row에는 soft delete/trash 컬럼을 두지 않는다.
- schema 변경은 새 migration으로 추가한다.

## 검증 정책

- Prisma validate/generate
- typecheck/lint
- unit/integration test
- build
