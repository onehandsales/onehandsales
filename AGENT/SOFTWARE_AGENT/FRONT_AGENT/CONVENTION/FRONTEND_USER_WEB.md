# Frontend User Web Convention

## Feature Naming

도메인 feature 폴더는 단수형을 사용한다. 현재 활성 도메인 예시는 `company`다. `contact`, `product`, `deal`은 현재 비활성이다.

## API State

- TanStack Query key는 feature 단위 factory로 관리한다.
- mutation 성공 후 list/detail key를 명시적으로 invalidate한다.
- access token은 API client에서 일관되게 주입한다.

## Time Display

- Backend가 내려주는 `createdAt`, `updatedAt`, `deletedAt` 같은 instant는 UTC ISO string으로 본다. 현재 `deletedAt`은 User 계정 상태 필드에만 남는다.
- 화면에는 UTC string을 그대로 출력하지 않고 사용자 표시 기준으로 변환한다.

## Route

- 로그인 이후 업무 route는 `/app` 아래에 둔다.
- 회사 생성은 `/app/companies/new`와 `/app/companies/new/full`을 함께 관리한다.
- `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 현재 `/app`으로 redirect한다.
- 계정 설정은 보호 route 위 query modal로 제공한다.
