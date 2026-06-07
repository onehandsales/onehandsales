# Sales B2C Monorepo

이 저장소 루트는 `한손에 영업 / onehand.sales`의 모노레포 루트다.

루트는 package manager workspace를 사용하지 않는다. Frontend와 Backend 앱은 의도적으로 독립되어 있고, 각 앱이 자기 의존성을 직접 가진다.

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

이 저장소는 루트 package workspace를 쓰지 않는다. 각 앱에서 따로 설치하고 실행한다.

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

### 2. User Web

```bash
cd FE/user-web
cp .env.example .env
pnpm install
pnpm run dev
```

User Web URL: `http://localhost:5173`

MVP starter의 local login은 memory 기반 mock login이다. `/login`에서 `계속`을 누르면 보호 라우트로 진입한다. 실제 Supabase provider login은 후속 실 Provider smoke에서 검증한다.

### 3. Admin Web

```bash
cd FE/admin-web
cp .env.example .env
pnpm install
pnpm run dev
```

Admin Web URL: `http://localhost:5174`

MVP starter의 local login은 memory 기반 mock login이다. `/login`에서 `관리자로 계속`은 Admin 콘솔 진입, `일반 사용자로 계속`은 non-admin 접근 차단 확인에 사용한다.

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

기본 local smoke는 OpenAI, OCR, Google Calendar, SMTP, Web Push, Supabase Auth/Storage를 실제 호출하지 않는다. 실제 provider 검증이 필요할 때는 `BE/.env`에 provider credential을 채우고 provider별 smoke를 별도 수동/CI job으로 실행한다.

주요 env:

- Supabase Auth/Storage: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`
- OpenAI/OCR/AI mapping: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_MODEL_BUSINESS_CARD_OCR`, `OPENAI_MODEL_IMPORT_MAPPING`
- Google Calendar: `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI`
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- Browser push: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Encryption/session: `ENCRYPTION_MASTER_KEY`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`

## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 패키지나 의존성을 공유하지 않는다.
- `FE/user-web`과 `FE/admin-web`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `/admin/api/*`를 제공하는 단일 NestJS 서버다.
- 모바일 앱은 아직 만들지 않는다. 웹 MVP 이후 모바일 개발 시 추가한다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `archive`는 참고용이며 `AGENT`를 override하지 않는다.
