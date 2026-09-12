# Frontend User Web

User Web은 로그인 이후 `/app` foundation 화면과 계정/도움말 모달을 제공한다.

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

## Feature 경계

- API client와 query key는 feature 내부에 둔다.
- list/detail mutation 이후 관련 query를 invalidate한다.
- 공통 UI는 `components`와 `components/ui`에서만 공유한다.
- 고정형 고객사 feature와 검색 feature는 현재 활성 범위가 아니다.

## E2E 기준

- 로그인 후 `/app` 진입
- `/app/more`와 계정 모달
- 오류 신고와 지원 문의
- 공개 문의
- 모바일 주요 화면 smoke
