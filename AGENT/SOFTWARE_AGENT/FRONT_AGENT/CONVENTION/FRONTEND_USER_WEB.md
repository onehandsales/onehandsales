# Frontend User Web Convention

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

## Feature Naming

도메인 feature 폴더는 단수형을 사용한다. 현재 활성 feature에는 `auth`, `app-i18n`, `workspace`, `crm-object`, `crm-list`, `crm-view`, `sidebar-order`, `view-favorite`, 지원·공개 사이트 기능이 있다.

Bonsai 전환 feature는 CRM_CORE_FRONTEND와 원본 화면을 기준으로 정한다. mock 프로토타입은 가능하며 실제 연동 전 API·권한·데이터 계약을 확정한다.

## API State

- TanStack Query key는 feature 단위 factory로 관리한다.
- mutation 성공 후 list/detail key를 명시적으로 invalidate한다.
- access token은 API client에서 일관되게 주입한다.

## Time Display

- Backend가 내려주는 `createdAt`, `updatedAt`, `deletedAt` 같은 instant는 UTC ISO string으로 본다. 실제 필드·타입은 schema를 확인한다.
- 화면에는 UTC string을 그대로 출력하지 않고 사용자 표시 기준으로 변환한다.

## Route

- 로그인 이후 업무 route는 `/app` 아래에 둔다.
- 현재 route는 `/app`, `/app/more`, Workspace 홈과 Object/List/View ID 경로다. 실제 router와 IMPLEMENTATION_STATUS를 따른다.
- `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 현재 `/app`으로 redirect한다.
- 고정형 고객사 관리 route는 현재 활성 route가 아니다.
- 계정 설정은 보호 route 위 query modal로 제공한다.
- 목표 route는 Bonsai의 고객·거래·문서·프로젝트·청구·고객 포털 흐름을 확인한 후 정한다.
