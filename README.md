# Sales B2C Monorepo

이 저장소는 `한손에 영업 / onehand.sales`의 모노레포 루트다.

루트에는 package manager workspace를 두지 않는다. Frontend와 Backend는 각각 독립적으로 설치, 실행, 검증한다.

## Structure

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
FE/
  user-web/
  admin-web/
BE/
archive/
```

## Quick Start

전제 조건:

- Node.js 24 LTS
- pnpm 8.x
- Docker Desktop 또는 호환 Docker runtime

### 1. Backend

```bash
cd BE
cp .env.example .env
pnpm install
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

Backend URL: `http://localhost:3000`

Health check:

```bash
curl http://localhost:3000/api/health
```

현재 Backend는 Auth/User, Company, Contact, Product, Deal, Schedule, MeetingNote, Search, Trash 모듈을 구현한다. Company/Contact/Product/Deal은 각 도메인별 xlsx export API를 제공한다. Admin API는 현재 `GET /admin/api/me`만 구현되어 있으며 관리자 페이지와 운영 조회 API는 후속 단계에서 만든다.

### 2. User Web

```bash
cd FE/user-web
cp .env.example .env
pnpm install
pnpm run dev
```

User Web URL: `http://localhost:5173`

User Web은 Supabase OAuth callback과 Backend token exchange를 사용한다. 개발 편의를 위한 mock login 경로도 남아 있으며, app access token은 storage가 아니라 memory 중심으로 다룬다.

### 3. Admin Web

```bash
cd FE/admin-web
cp .env.example .env
pnpm install
pnpm run dev
```

Admin Web URL: `http://localhost:5174`

Admin Web은 현재 local mock admin/user token으로 `/admin/api/me` 보호 라우트를 검증한다. 대시보드, 사용자/도메인 목록, 감사 로그 화면은 관리자 페이지와 Backend Admin query API를 후속 구현하기 전까지 mock/placeholder 경계를 명확히 둔다.

## Verification

각 앱은 독립적으로 검증한다.

Backend:

```bash
cd BE
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

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

Playwright smoke E2E는 기본적으로 Backend와 외부 Provider를 route mock으로 대체한다. User Web E2E는 5175, Admin Web E2E는 5176 포트의 Vite dev server를 테스트용으로 사용한다.

## External Providers

기본 local smoke와 unit test는 OpenAI, OCR, Google Calendar, SMTP, Web Push, Supabase Auth/Storage를 실제 호출하지 않는다. 실제 provider 검증이 필요할 때는 각 앱의 `.env`를 채우고 별도 smoke로 확인한다.

주요 env:

- Supabase Auth/Storage: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`
- OpenAI/OCR/AI mapping: `OPENAI_API_KEY`, `OPENAI_MEETING_NOTE_DRAFT_MODEL`, `OPENAI_MEETING_NOTE_STT_MODEL`, `OPENAI_MODEL_BUSINESS_CARD_OCR`, `OPENAI_MODEL_IMPORT_MAPPING`
- Google Calendar: `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI`
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- Browser push: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Encryption/session: `ENCRYPTION_MASTER_KEY`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`

MeetingNote AI 초안 생성과 STT는 Backend에서 별도 provider port로 분리되어 있다. AI 초안 생성은 OpenAI를 기본으로 사용하고, STT는 현재 OpenAI adapter를 쓰되 provider 교체 시 STT adapter만 바꾸는 구조다.

## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 package dependency를 공유하지 않는다.
- `FE/user-web`과 `FE/admin-web`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `/admin/api/*`를 제공하는 단일 NestJS 서버다.
- 모바일 앱은 아직 만들지 않는다. MVP 이후 모바일 개발 때 추가한다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `archive`는 참고용이며 `AGENT`를 override하지 않는다.


실제로 동작하는지 테스트
