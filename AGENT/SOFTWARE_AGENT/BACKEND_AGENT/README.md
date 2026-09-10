# Backend Agent

Backend Agent는 NestJS, Prisma, Supabase Auth 연동, 회사 중심 API, 검색, 지원 접수, 관리자 권한 확인을 담당한다.

## 활성 모듈

- `auth`
- `user`
- `company`
- `search`
- `error-report`
- `support-request`
- `public-contact-request`
- `health`

관리자 확인은 `auth` 모듈의 `GET /admin/api/me`로 유지한다. `contact`, `product`, `deal`, `analytics`는 현재 활성 Backend 모듈이 아니다.

## 검증

- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
