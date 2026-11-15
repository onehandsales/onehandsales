# User Web Architecture

User Web은 React Router, TanStack Query, i18n, Playwright/Vitest 기반으로 구성한다. 로그인 이후에는 Workspace/Object/List/View 화면, `/app/more`, 계정 설정과 도움말/문의 흐름을 제공한다.

## 활성 Route

- `/app` → 기본 Workspace로 이동
- `/app/workspaces/:workspaceId` → Workspace 홈
- `/app/workspaces/:workspaceId/objects/:objectDefinitionId`
- `/app/workspaces/:workspaceId/lists/:listDefinitionId`
- `/app/workspaces/:workspaceId/view-definitions/:viewDefinitionId`
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
- `workspace`: Workspace 진입·탐색
- `crm-object`: Object·Attribute·Record 생성/조회/편집
- `crm-list`: List 생성·조회
- `crm-view`: 공통 헤더·TABLE/KANBAN/LIST·설정 미리보기/저장
- `sidebar-order`, `view-favorite`: 순서·즐겨찾기
- `error-report`: authenticated error report intake
- `support-request`: authenticated support request intake
- `public-contact-request`: unauthenticated public contact request intake
- `public-site`: locale public pages
- `schedule`, `meeting-note`, `trash`: placeholder folders only, no active route/API

## API 원칙

- Backend ownership 검증을 전제로 access token을 `Authorization: Bearer`로 보낸다.
- `401`은 세션 복구 또는 로그인 이동으로 처리한다.

고정형 `company`/`search` feature는 OneHand CRM 방향 전환에 맞춰 제거했다. 현재 코어와 folk 목표를 구분한다. [전환 설계](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md)를 따른다.
