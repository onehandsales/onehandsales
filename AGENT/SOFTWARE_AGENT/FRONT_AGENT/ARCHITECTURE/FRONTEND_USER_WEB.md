# Frontend User Web

User Web은 로그인 이후 `/app` foundation 화면과 계정/도움말 모달을 제공한다.

후속 CRM Core 화면은 고정형 Contact/Product/Deal 화면 복구가 아니라 Kit 선택, Workspace home, Record list/detail/create 흐름으로 설계한다.

## Route 범위

- `/app`
- `/app/more`

Redirect-only:

- `/app/contacts/*` -> `/app`
- `/app/products/*` -> `/app`
- `/app/deals/*` -> `/app`
- `/app/export` -> `/app`

No active route:

- 고정형 고객사 관리 route

Future CRM Core route 후보는 `CRM_CORE_FRONTEND.md`에서 draft로 관리한다.

## Feature 경계

- API client와 query key는 feature 내부에 둔다.
- list/detail mutation 이후 관련 query를 invalidate한다.
- 공통 UI는 `components`와 `components/ui`에서만 공유한다.
- 고정형 고객사 feature와 검색 feature는 현재 활성 범위가 아니다.
- 후속 CRM Core feature는 API 계약과 UXUI flow가 확정된 뒤 추가한다.

## E2E 기준

- 로그인 후 `/app` 진입
- `/app/more`와 계정 모달
- 오류 신고와 지원 문의
- 공개 문의
- 모바일 주요 화면 smoke

후속 CRM Core가 붙으면 Kit 선택, Workspace home, 첫 Record 생성, Record 목록/상세 smoke를 별도 추가한다.
