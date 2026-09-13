# User Web Architecture

User Web은 React Router, TanStack Query, i18n, Playwright/Vitest 기반으로 구성한다. 로그인 이후 `/app` 영역은 현재 빈 홈, `/app/more`, 계정 설정, 도움말/문의 흐름을 제공한다.

## 활성 Route

- `/app`
- `/app/more`

Redirect-only:

- `/app/contacts/*` -> `/app`
- `/app/products/*` -> `/app`
- `/app/deals/*` -> `/app`
- `/app/export` -> `/app`
- legacy top-level `/contacts/*`, `/products/*`, `/deals/*` -> `/app`
- legacy top-level `/more` -> `/app/more`

## Feature 구조

- `auth`: token exchange, session refresh, logout
- `app-i18n`: app locale, timezone, country/currency formatting
- `error-report`: authenticated error report intake
- `support-request`: authenticated support request intake
- `public-contact-request`: unauthenticated public contact request intake
- `public-site`: locale public pages
- `schedule`, `meeting-note`: placeholder folders only, no active route/API

## API 원칙

- Backend ownership 검증을 전제로 access token을 `Authorization: Bearer`로 보낸다.
- `401`은 세션 복구 또는 로그인 이동으로 처리한다.

고정형 `company`/`search` feature는 OneHand CRM 방향 전환에 맞춰 제거했다. 다음 CRM 화면은 Workspace/Kit/Object/Attribute/Relationship/Record/List/View 구조가 확정된 뒤 새 feature로 추가한다.
