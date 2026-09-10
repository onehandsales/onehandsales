# Frontend User Web

User Web은 로그인 이후 `/app` 핵심 CRM 화면과 계정/도움말 모달을 제공한다.

## Route 범위

- `/app`
- `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId`
- `/app/contacts`, `/app/contacts/new`, `/app/contacts/new/full`, `/app/contacts/:contactId`
- `/app/products`, `/app/products/new`, `/app/products/new/full`, `/app/products/:productId`
- `/app/deals`, `/app/deals/new`, `/app/deals/new/full`, `/app/deals/:dealId`
- `/app/trash`
- `/app/more`

## Feature 경계

- API client와 query key는 feature 내부에 둔다.
- list/detail mutation 이후 관련 query를 invalidate한다.
- 공통 UI는 `components`와 `components/ui`에서만 공유한다.
- 도메인별 생성/수정 form은 `/new`와 `/new/full` 양쪽 UX를 고려한다.

## E2E 기준

- 로그인 후 `/app` 진입
- 회사/담당자/제품/딜 핵심 flow
- 검색, 휴지통, export smoke
- 모바일 주요 화면 smoke
