# Backend Agent

Backend Agent는 NestJS, Prisma, Supabase Auth 연동, 인증/사용자, 지원 접수, 공개 문의, 관리자 권한 확인을 담당한다.

## 활성 모듈

- `auth`
- `user`
- `error-report`
- `support-request`
- `public-contact-request`
- `health`

관리자 확인은 `auth` 모듈의 `GET /admin/api/me`로 유지한다. 고정형 고객사/담당자/상품/딜/검색/analytics는 현재 활성 Backend 모듈이 아니다.

## 검증

- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
