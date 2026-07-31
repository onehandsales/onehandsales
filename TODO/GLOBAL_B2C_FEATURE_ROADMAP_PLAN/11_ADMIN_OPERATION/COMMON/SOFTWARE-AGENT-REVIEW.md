# Software Agent Review

상태: Confirmed

## 1. Backend 확인

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

확인할 것:

- Admin API는 `/admin/api/*`다.
- AuthGuard + AdminGuard를 적용한다.
- sensitive raw access는 별도 API다.
- audit log transaction boundary가 있다.
- provider raw/prompt/token/quota detail을 select하지 않는다.
- 신규 코드 주석은 `// 역할 :`, `// API :`, `// 기능 :` 규칙을 따른다.

## 2. Frontend 확인

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

확인할 것:

- Admin Web은 `FE/admin-web/src/lib/admin-api-client.ts`만 사용한다.
- Query Key는 `['admin', ...]`로 시작한다.
- User Web feature/client import가 없다.
- table/filter/detail panel 중심이다.
- 민감 원문 조회 reason modal이 있다.

## 3. DB 확인

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA`

확인할 것:

- 기존 migration을 수정하지 않는다.
- 신규 Prisma model/field/enum/index에 한글 주석이 있다.
- migration SQL COMMENT가 있다.
- 공유/운영 DB에 무단 migrate/seed를 실행하지 않는다.
- audit log와 sensitive access log에 원문 민감값이 없다.
