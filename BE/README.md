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
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run start:dev
```

로컬 URL: `http://localhost:3000`

헬스 체크: `GET /api/health`

## 정본 규칙

- `../AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
