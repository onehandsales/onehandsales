# Frontend User Web Convention

## Feature Naming

도메인 feature 폴더는 단수형을 사용한다. 현재 활성 feature는 `auth`, `app-i18n`, `error-report`, `support-request`, `public-contact-request`, `public-site`다.

후속 CRM Core feature 후보는 `kit`, `workspace`, `crm-object`, `record`, `record-relationship`이다. 실제 생성은 API 계약과 UXUI flow 확정 이후 진행한다.

## API State

- TanStack Query key는 feature 단위 factory로 관리한다.
- mutation 성공 후 list/detail key를 명시적으로 invalidate한다.
- access token은 API client에서 일관되게 주입한다.

## Time Display

- Backend가 내려주는 `createdAt`, `updatedAt`, `deletedAt` 같은 instant는 UTC ISO string으로 본다. 현재 `deletedAt`은 User 계정 상태 필드에만 남는다.
- 화면에는 UTC string을 그대로 출력하지 않고 사용자 표시 기준으로 변환한다.

## Route

- 로그인 이후 업무 route는 `/app` 아래에 둔다.
- 현재 활성 route는 `/app`과 `/app/more`다.
- `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 현재 `/app`으로 redirect한다.
- 고정형 고객사 관리 route는 현재 활성 route가 아니다.
- 계정 설정은 보호 route 위 query modal로 제공한다.
- 후속 CRM Core route는 고정형 `/app/contacts`, `/app/products`, `/app/deals` 복구가 아니라 Kit/Workspace/Record 구조로 설계한다.
