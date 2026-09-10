# Backend Architecture

## 활성 도메인

- Auth/User
- Company
- Contact
- Product
- Deal
- Search
- Trash
- Product Analytics
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
- Company/Contact/Product/Deal API는 current user ownership을 필수로 검증한다.
- Search는 Company, Contact, Product, Deal만 대상으로 한다.
- Trash는 활성 soft delete 대상만 집계한다.
- Product Analytics는 이벤트 수집 실패가 사용자 핵심 업무를 막지 않게 처리한다.

## DB 정책

- 업무 row는 `userId`를 갖는다.
- 삭제 가능한 row는 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 갖는다.
- 연결 table은 복합 unique/index로 중복 연결을 방지한다.
- schema 변경은 새 migration으로 추가한다.

## 검증 정책

- Prisma validate/generate
- typecheck/lint
- unit/integration test
- build
