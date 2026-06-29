# FE

Frontend 앱은 제품 사용 면에 따라 분리한다.

## 앱

- `user-web`: 사용자가 직접 쓰는 Web MVP
- `admin-web`: 운영자를 위한 Admin Web 앱

각 앱은 자기 package dependency를 가진다. monorepo root에는 공유 frontend package를 두지 않는다.

## 로컬 실행

각 앱은 별도 터미널에서 실행한다.

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다. 각 앱은 `.nvmrc`와 `engines` 기준을 Node 24로 맞춘다.

User Web 실행:

```bash
cd FE/user-web
cp .env.example .env
pnpm install
pnpm run dev
```

Admin Web 실행:

```bash
cd FE/admin-web
cp .env.example .env
pnpm install
pnpm run dev
```

로컬 포트:

- User Web: `http://localhost:5173`
- Admin Web: `http://localhost:5174`

두 frontend 앱은 Vercel에서 별도 프로젝트로 배포한다.

## 검증

User Web:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Admin Web:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Playwright smoke E2E는 Backend와 외부 Provider를 route mock으로 대체한다.

- User Web E2E: login, company, contact, product, deal, schedule, meeting note core flow
- Admin Web E2E: admin login, non-admin block, `/admin/api/me` 보호 라우트 smoke

E2E 전용 Vite port:

- User Web: `http://127.0.0.1:5175`
- Admin Web: `http://127.0.0.1:5176`

## Auth 상태

User Web은 Supabase OAuth provider login, `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다. 개발 편의를 위해 mock login 경로도 유지한다.

Admin Web은 현재 local mock admin/user token으로 `/admin/api/me` 보호 라우트를 검증한다.

App access token은 storage에 저장하지 않고 memory 중심으로 둔다. 실제 provider credential 검증은 별도 smoke에서 다룬다.

## 현재 구현 상태

User Web:

- 실제 API 연동 완료: Auth/User, Home, Company, Contact, Product, Deal, Schedule, MeetingNote 수동 CRUD, MeetingNote AI/STT draft, MeetingNote deal link, Search, Trash, Company/Contact/Product/Deal 도메인별 xlsx export.
- Backend 구현 전까지 숨기는 기능: BusinessCard OCR, 범용 Import job, `/api/exports` 기반 범용 Export route/API, Notification.
- 현재 Export 정본 흐름은 각 도메인 목록의 엑셀 다운로드다. `FE/user-web/src/features/import-export`의 범용 Export 화면은 현재 Backend 방향이 아니므로 route에서 숨긴다.

Admin Web:

- 실제 Backend 연동 완료: `/admin/api/me`.
- Backend 미구현/후속 경계: admin pages, dashboard, users, companies, contacts, products, deals, audit logs, sensitive raw access.

## 정본 규칙

User Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Admin Web 정본:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`

공통 주석/로깅:

- `../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
