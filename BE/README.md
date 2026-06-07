# BE

백엔드 앱이다.

## 기술 스택

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

## API 분리 기준

- 사용자 API: `/api/*`
- Admin API: `/admin/api/*`

Admin API는 반드시 Admin guard로 보호한다.

## 로컬 실행

백엔드는 별도 터미널에서 실행한다.

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
pnpm install
cp .env.example .env
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

로컬 URL: `http://localhost:3000`

헬스 체크: `GET /api/health`

## DB

Docker Compose는 PostgreSQL 17을 `localhost:5432`에 띄우고, init SQL로 `sales_b2c_test`도 만든다.

주요 명령:

```bash
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run db:dev:down
```

CI/배포처럼 이미 migration 파일을 적용해야 하는 환경에서는 `pnpm run prisma:migrate:deploy`를 사용한다.

현재 seed는 system `DealActivityType` 기본값을 만든다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

## 외부 Provider

기본 Backend 테스트는 외부 Provider를 실제 호출하지 않는다. 실제 OpenAI/OCR, Google Calendar, SMTP, Web Push, Supabase Auth/Storage smoke를 하려면 `.env`에 credential을 채운 뒤 별도 provider smoke로 확인한다.

주요 env는 `.env.example`에 있다. local에서 최소 서버만 띄울 때도 `DATABASE_URL`, `DIRECT_URL`, `TEST_DATABASE_URL`, token secret, encryption key 값은 실제 안전한 값으로 채우는 것을 권장한다.

## 정본 규칙

- `../AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
