# User Web Architecture

User Web은 React Router, TanStack Query, i18n, Playwright/Vitest 기반으로 구성한다. 로그인 이후 `/app` 영역은 핵심 CRM 데이터 관리와 계정 모달에 집중한다.

## 활성 Route

- `/app`
- `/app/companies`, `/app/companies/new`, `/app/companies/new/full`, `/app/companies/:companyId`
- `/app/more`

Redirect-only:

- `/app/contacts/*` -> `/app`
- `/app/products/*` -> `/app`
- `/app/deals/*` -> `/app`
- `/app/export` -> `/app`

## Feature 구조

- `auth`: token exchange, session refresh, logout
- `app-i18n`: app locale, timezone, country/currency formatting
- `company`: list/detail/create/edit/export
- `search`: company search modal and result navigation
- `error-report`: authenticated error report intake
- `support-request`: authenticated support request intake
- `public-contact-request`: unauthenticated public contact request intake
- `public-site`: locale public pages
- `schedule`, `meeting-note`: placeholder folders only, no active route/API

## API 원칙

- Backend ownership 검증을 전제로 access token을 `Authorization: Bearer`로 보낸다.
- `401`은 세션 복구 또는 로그인 이동으로 처리한다.
- list 화면은 query key에 검색어, 필터, 정렬, 페이지를 포함한다.
- mutation 이후에는 해당 detail/list query를 명시적으로 invalidate한다.
